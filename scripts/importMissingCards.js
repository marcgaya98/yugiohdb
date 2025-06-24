// Script para importar las cartas faltantes en los mazos desde cards_not_found_in_decks.json
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';

// Configuración de rutas para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constantes
const MISSING_CARDS_FILE = path.join(__dirname, '..', 'cards_not_found_in_decks.json');

// Función para normalizar nombres de cartas
const normalizeCardName = (name) => {
    // Eliminar cualquier marcado especial como (D) que a veces aparece en los nombres
    return name.replace(/\s*\([A-Za-z]\)\s*$/, '').trim();
};

// Función para obtener carta de la API YGOPRODeck
async function fetchCardFromAPI(cardName) {
    try {
        const normalizedName = normalizeCardName(cardName);
        const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(normalizedName)}&misc=yes`;
        console.log(`[API] Buscando carta: "${normalizedName}"`);

        const response = await fetch(url);
        if (!response.ok) {
            console.log(`[ERROR] API respondió con error: ${response.status} - ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            console.log(`[WARN] No se encontró "${normalizedName}" en la API.`);
            return null;
        }

        // Tomar la primera carta que coincida (suponemos que es la más relevante)
        return data.data[0];
    } catch (error) {
        console.error(`[ERROR] Error al buscar "${cardName}" en la API:`, error.message);
        return null;
    }
}

// Función para crear una carta en la base de datos
async function createCardInDB(apiCard, originalName) {
    try {
        // Generar un código único (similar a konami_id pero para cartas manuales)
        const uniqueCode = `MANUAL-${Math.floor(Math.random() * 1000000)}`;

        // Determinar el tipo de carta
        const cardType = apiCard.type.includes('Monster')
            ? 'Monster'
            : apiCard.type.includes('Spell')
                ? 'Spell'
                : 'Trap';

        // Determinar el marco
        let frame = 'normal';
        if (apiCard.type.includes('Fusion')) frame = 'fusion';
        else if (apiCard.type.includes('Ritual')) frame = 'ritual';
        else if (apiCard.type.includes('Effect')) frame = 'effect';
        else if (cardType === 'Spell') frame = 'spell';
        else if (cardType === 'Trap') frame = 'trap';

        // Crear la carta base
        const newCard = await Card.create({
            name: apiCard.name,
            code: uniqueCode,
            description: apiCard.desc,
            image_url: apiCard.card_images?.[0]?.image_url || 'https://uploads.yugioh.com/card_images/back_high.jpg',
            rarity: 'common', // Por defecto
            limit: 3,
            frame: frame,
            archetype: apiCard.archetype || null,
            cardType: cardType,
            alter_name: originalName !== apiCard.name ? originalName : null
        });

        // Crear registros específicos según el tipo
        if (cardType === 'Monster') {
            await MonsterCard.create({
                cardId: newCard.id,
                attribute: apiCard.attribute,
                effectTrait: apiCard.type.includes('Effect'),
                summonMechanic: frame === 'ritual' ? 'ritual' : frame === 'fusion' ? 'fusion' : null,
                ability: null, // Esto requeriría más procesamiento para determinar correctamente
                type: apiCard.race,
                level: apiCard.level,
                attack: typeof apiCard.atk === 'number' ? apiCard.atk : null,
                defense: typeof apiCard.def === 'number' ? apiCard.def : null,
            });
        } else if (cardType === 'Spell') {
            await SpellCard.create({
                cardId: newCard.id,
                type: apiCard.race,
            });
        } else if (cardType === 'Trap') {
            await TrapCard.create({
                cardId: newCard.id,
                type: apiCard.race,
            });
        }

        console.log(`[SUCCESS] Carta creada en la base de datos: ${newCard.name} (${uniqueCode})`);
        return newCard;
    } catch (error) {
        console.error(`[ERROR] Error al crear carta en la base de datos:`, error);
        return null;
    }
}

// Función para manejar cartas que no se encuentran en la API
async function handleCardNotFoundInAPI(cardName) {
    console.log(`[MANUAL] Creando entrada manual para: "${cardName}"`);

    // Determinar si es monstruo, hechizo o trampa basándose en el nombre o comportamiento común
    let cardType = 'Spell'; // Default to spell as most missing cards are spells

    // Crear la carta base con información mínima
    try {
        const uniqueCode = `MANUAL-${Math.floor(Math.random() * 1000000)}`;
        const manualCard = await Card.create({
            name: cardName,
            code: uniqueCode,
            description: `Carta manual creada para "${cardName}". Esta carta no se encontró en la API y se creó automáticamente.`,
            image_url: 'https://uploads.yugioh.com/card_images/back_high.jpg', // Imagen genérica del dorso
            rarity: 'common',
            limit: 3,
            frame: cardType === 'Monster' ? 'normal' : cardType.toLowerCase(),
            archetype: null,
            cardType: cardType,
            alter_name: null
        });

        // Crear el registro específico según el tipo
        if (cardType === 'Monster') {
            await MonsterCard.create({
                cardId: manualCard.id,
                attribute: 'LIGHT', // Default
                effectTrait: false,
                summonMechanic: null,
                ability: null,
                type: 'Warrior', // Default
                level: 4, // Default
                attack: 1000, // Default
                defense: 1000, // Default
            });
        } else if (cardType === 'Spell') {
            await SpellCard.create({
                cardId: manualCard.id,
                type: 'Normal',
            });
        } else if (cardType === 'Trap') {
            await TrapCard.create({
                cardId: manualCard.id,
                type: 'Normal',
            });
        }

        console.log(`[SUCCESS] Carta manual creada: ${manualCard.name} (${uniqueCode})`);
        return manualCard;
    } catch (error) {
        console.error(`[ERROR] Error al crear carta manual:`, error);
        return null;
    }
}

// Función principal
async function importMissingCards() {
    try {
        console.log('Iniciando importación de cartas faltantes...');

        // Sincronizar modelos
        await sequelize.sync({ alter: true });

        // Leer el archivo de cartas faltantes
        const missingCardsData = JSON.parse(fs.readFileSync(MISSING_CARDS_FILE, 'utf8'));

        // Extraer todos los nombres de cartas únicos
        const uniqueCardNames = new Set();
        Object.keys(missingCardsData).forEach(character => {
            Object.keys(missingCardsData[character]).forEach(deck => {
                missingCardsData[character][deck].forEach(card => {
                    if (card && card.cardName) {
                        uniqueCardNames.add(card.cardName);
                    }
                });
            });
        });

        console.log(`Se encontraron ${uniqueCardNames.size} cartas únicas para importar.`);

        // Estadísticas
        let importedFromAPI = 0;
        let createdManually = 0;
        let failed = 0;

        // Procesar cada carta única
        for (const cardName of uniqueCardNames) {
            // Verificar si ya existe en la base de datos (por nombre o nombre alternativo)
            const existingCard = await Card.findOne({
                where: { name: cardName }
            }) || await Card.findOne({
                where: { alter_name: cardName }
            });

            if (existingCard) {
                console.log(`[SKIP] Carta ya existe en la base de datos: ${existingCard.name}`);
                continue;
            }

            // Intentar obtener de la API
            const apiCard = await fetchCardFromAPI(cardName);

            if (apiCard) {
                // Crear la carta usando datos de la API
                const card = await createCardInDB(apiCard, cardName);
                if (card) importedFromAPI++;
                else failed++;
            } else {
                // Crear manualmente si no se encuentra en la API
                const card = await handleCardNotFoundInAPI(cardName);
                if (card) createdManually++;
                else failed++;
            }

            // Pequeña pausa para evitar sobrecargar la API
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Resumen final
        console.log('\n===== RESUMEN DE IMPORTACIÓN =====');
        console.log(`Total de cartas únicas procesadas: ${uniqueCardNames.size}`);
        console.log(`Importadas desde API: ${importedFromAPI}`);
        console.log(`Creadas manualmente: ${createdManually}`);
        console.log(`Fallidas: ${failed}`);
        console.log('=================================\n');

        console.log('Proceso de importación de cartas faltantes completado.');
    } catch (error) {
        console.error('Error en el proceso de importación:', error);
    }
}

// Ejecutar la función principal
importMissingCards();
