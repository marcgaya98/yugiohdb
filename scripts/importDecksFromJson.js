// Script para importar decks y cartas desde all_decks_transformed.json a la base de datos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import Deck from '../models/Deck.js';
import DeckCard from '../models/DeckCard.js';
import Character from '../models/Character.js';
import '../models/associations.js';

// Configuración de rutas para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constantes
const ALL_DECKS_FILE = path.join(__dirname, '..', 'all_decks_transformed.json');
const NOT_FOUND_CARDS_FILE = path.join(__dirname, '..', 'cards_not_found_in_decks.json');

// Función principal
async function importDecks() {
    try {
        console.log('Importando decks desde JSON...');

        // Sincronizar los modelos necesarios antes de importar
        console.log('Sincronizando modelos de base de datos...');
        // Sincronizar modelos con sus relaciones
        await sequelize.sync({ alter: true }); // Esto sincroniza todos los modelos respetando sus relaciones
        console.log('Modelos sincronizados correctamente.');

        // Leer el archivo JSON
        const decksData = JSON.parse(fs.readFileSync(ALL_DECKS_FILE, 'utf8'));

        // Objeto para almacenar cartas no encontradas
        const notFoundCards = {};

        // Contar estadísticas
        let charactersProcessed = 0;
        let charactersWithDecks = 0;
        let decksCreated = 0;
        let cardsAdded = 0;
        let cardsNotFound = 0;

        // Para cada personaje en el JSON
        for (const characterData of decksData) {
            // Verificar que sea un objeto válido con nombre
            if (!characterData || !characterData.name) {
                continue;
            }

            charactersProcessed++;

            // Buscar el personaje en la base de datos
            const character = await Character.findOne({ where: { name: characterData.name } });

            if (!character) {
                console.log(`¡Personaje no encontrado: ${characterData.name}!`);
                continue;
            }

            // Verificar si el personaje tiene decks
            if (!characterData.decks || !Array.isArray(characterData.decks) || characterData.decks.length === 0) {
                console.log(`El personaje ${characterData.name} no tiene decks definidos.`);
                continue;
            }

            charactersWithDecks++;
            console.log(`\nProcesando decks de ${characterData.name} (ID: ${character.id})...`);

            // Para cada deck del personaje
            for (const deckData of characterData.decks) {
                // Verificar que el deck tenga nombre y cartas
                if (!deckData.name || !deckData.cards) {
                    continue;
                }

                const deckLevel = deckData.level || 1; // Nivel por defecto: 1

                // Crear el deck en la base de datos
                const deck = await Deck.create({
                    name: deckData.name,
                    level: deckLevel,
                    characterId: character.id,
                    extraDeck: false // Por defecto, no es un extra deck
                });

                decksCreated++;
                console.log(`\nCreando deck: ${deckData.name} (ID: ${deck.id}, Nivel: ${deckLevel})`);

                // Registrar cartas no encontradas para este deck
                if (!notFoundCards[characterData.name]) {
                    notFoundCards[characterData.name] = {};
                }
                if (!notFoundCards[characterData.name][deckData.name]) {
                    notFoundCards[characterData.name][deckData.name] = [];
                }

                // Para cada sección de cartas (Monster Cards, Spell Cards, etc.)
                for (const [section, cards] of Object.entries(deckData.cards)) {
                    let deckSection = '';

                    // Mapear la sección a uno de los valores permitidos: 'main', 'fusion', 'extra'
                    if (section === 'Fusion Monsters') {
                        deckSection = 'fusion';
                    } else if (section === 'Synchro Monsters' || section === 'Xyz Monsters' || section === 'Link Monsters') {
                        deckSection = 'extra';
                    } else {
                        deckSection = 'main';
                    }

                    // Para cada carta en la sección
                    for (const cardData of cards) {
                        try {
                            // Buscar la carta por nombre
                            let card = await Card.findOne({
                                where: { name: cardData.name }
                            });

                            // Si no se encuentra, buscar por nombre alternativo
                            if (!card) {
                                card = await Card.findOne({
                                    where: { alter_name: cardData.name }
                                });
                            }

                            // Si la carta se encontró, agregarla al deck
                            if (card) {
                                await DeckCard.create({
                                    deckId: deck.id,
                                    cardId: card.id,
                                    section: deckSection,
                                    count: cardData.quantity || 1
                                });

                                cardsAdded++;
                                console.log(`Carta añadida: ${cardData.name} (${cardData.quantity || 1}x) - Sección: ${deckSection}`);
                            } else {
                                // Registrar la carta como no encontrada
                                notFoundCards[characterData.name][deckData.name].push({
                                    cardName: cardData.name,
                                    quantity: cardData.quantity,
                                    section: section
                                });

                                cardsNotFound++;
                                console.log(`⚠️ Carta no encontrada: ${cardData.name} (${cardData.quantity || 1}x) - Sección: ${section}`);
                            }
                        } catch (error) {
                            console.error(`Error procesando la carta ${cardData.name}:`, error);
                        }
                    }
                }
            }
        }

        // Guardar estadísticas
        console.log('\n=== ESTADÍSTICAS DE IMPORTACIÓN ===');
        console.log(`Personajes procesados: ${charactersProcessed}`);
        console.log(`Personajes con decks: ${charactersWithDecks}`);
        console.log(`Decks creados: ${decksCreated}`);
        console.log(`Cartas añadidas: ${cardsAdded}`);
        console.log(`Cartas no encontradas: ${cardsNotFound}`);

        // Guardar las cartas no encontradas en un archivo JSON
        fs.writeFileSync(
            NOT_FOUND_CARDS_FILE,
            JSON.stringify(notFoundCards, null, 2),
            'utf8'
        );

        console.log(`\nCartas no encontradas guardadas en: ${NOT_FOUND_CARDS_FILE}`);
        console.log('\nImportación de decks completada.');

    } catch (error) {
        console.error('Error durante la importación de decks:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
    }
}

// Ejecutar la función principal
importDecks().catch(err => {
    console.error('Error fatal durante la importación:', err);
    process.exit(1);
});
