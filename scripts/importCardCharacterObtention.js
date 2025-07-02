import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import Character from '../models/Character.js';
import CardCharacterObtention from '../models/CardCharacterObtention.js';

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para extraer cantidad de una cadena como "Dizzy Tiger x3"
function extractQuantity(cardName) {
    const match = cardName.match(/x(\d+)$/);
    if (match) {
        return {
            name: cardName.replace(/\s*x\d+$/, '').trim(),
            quantity: parseInt(match[1])
        };
    }
    return { name: cardName, quantity: 1 };
}

// Lista de personajes que requieren máxima confianza (tier 1)
// Estos personajes darán cartas solo cuando se alcance el nivel máximo de confianza
const tier1Characters = [
    'Jaden Yuki', 'Syrus Truesdale', 'Alexis Rhodes', 'Chazz Princeton',
    'Bastion Misawa', 'Zane Truesdale', 'Atticus Rhodes'
    // Añade más personajes tier 1 según corresponda
];

// Función principal para importar datos
async function importVictoryRewards() {
    try {
        console.log('Iniciando importación de recompensas por victoria...');

        // Autenticación con la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Sincronizar específicamente el modelo CardCharacterObtention con la base de datos
        // Usamos {force: true} para asegurarnos de que la tabla se crea (solo en desarrollo)
        await CardCharacterObtention.sync({ force: true });
        console.log('Modelo CardCharacterObtention sincronizado con la base de datos.');

        // Cargar datos del JSON
        const jsonPath = resolve(__dirname, 'data/victory.json');
        const victoryData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Se cargaron datos para ${victoryData.length} personajes.`);

        // Estadísticas
        const stats = {
            processed: 0,
            success: 0,
            failed: 0,
            cardsNotFound: [],
            charactersNotFound: []
        };

        // Procesar cada personaje y sus cartas
        for (const characterData of victoryData) {
            if (!characterData.character || !characterData.card_rewards || !Array.isArray(characterData.card_rewards)) {
                console.log('Datos de personaje incompletos, omitiendo...');
                continue;
            }

            const characterName = characterData.character;

            // Buscar el personaje en la base de datos
            const character = await Character.findOne({
                where: { name: characterName }
            });

            if (!character) {
                console.log(`Personaje no encontrado: ${characterName}`);
                stats.charactersNotFound.push(characterName);
                continue;
            }

            // Procesar cada carta de recompensa
            for (const cardRewardName of characterData.card_rewards) {
                stats.processed++;

                // Extraer nombre y cantidad
                const { name: cleanCardName, quantity } = extractQuantity(cardRewardName);

                // Buscar la carta en la base de datos por name o alter_name
                const card = await Card.findOne({
                    where: sequelize.literal(`(name = '${cleanCardName.replace(/'/g, "\\'")}' OR alter_name = '${cleanCardName.replace(/'/g, "\\'")}')`)
                });

                if (!card) {
                    console.log(`Carta no encontrada: ${cleanCardName}`);
                    stats.cardsNotFound.push(cleanCardName);
                    stats.failed++;
                    continue;
                }

                // Crear o actualizar el registro en CardCharacterObtention
                try {
                    // Determinar si el personaje es tier 1 (requiere máxima confianza)
                    const isTier1 = tier1Characters.includes(characterName);

                    // Crear nuevo registro
                    await CardCharacterObtention.create({
                        cardId: card.id,
                        characterId: character.id,
                        requiredTrust: isTier1, // true para tier 1, false para los demás
                        quantity: quantity
                    });

                    stats.success++;
                    console.log(`Añadida carta "${cleanCardName}" (ID: ${card.id}) para personaje ${characterName} (ID: ${character.id}), cantidad: ${quantity}, requiredTrust: ${isTier1}`);
                } catch (error) {
                    console.error(`Error al crear registro para carta ${cleanCardName} (ID: ${card.id}):`, error.message);
                    stats.failed++;
                }
            }
        }

        // Imprimir resumen
        console.log('\n¡Importación completada!');
        console.log(`Total de cartas procesadas: ${stats.processed}`);
        console.log(`Importaciones exitosas: ${stats.success}`);
        console.log(`Importaciones fallidas: ${stats.failed}`);

        if (stats.cardsNotFound.length > 0) {
            console.log('\nCartas no encontradas en la base de datos:');
            stats.cardsNotFound.forEach(cardName => console.log(`- ${cardName}`));
        }

        if (stats.charactersNotFound.length > 0) {
            console.log('\nPersonajes no encontrados en la base de datos:');
            stats.charactersNotFound.forEach(charName => console.log(`- ${charName}`));
        }

        console.log('\n¡Todo listo!');
    } catch (error) {
        console.error('Ocurrió un error durante la importación:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función de importación
importVictoryRewards();