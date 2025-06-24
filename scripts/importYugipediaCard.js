import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';

async function fetchCardFromYugipedia(cardName) {
    try {
        // 1. Obtener el HTML procesado de la página
        const parseUrl = `https://yugipedia.com/api.php?action=parse&page=${encodeURIComponent(cardName)}&format=json&origin=*`;
        const parseRes = await fetch(parseUrl);
        const parseData = await parseRes.json();

        if (!parseData.parse) {
            throw new Error(`Carta "${cardName}" no encontrada en Yugipedia`);
        }

        // 2. Parsear el HTML con JSDOM
        const html = parseData.parse.text['*'];
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // 3. Extraer información de la tabla de la carta
        const cardTable = document.querySelector('.card-table');
        if (!cardTable) {
            throw new Error(`Formato de página inesperado para "${cardName}"`);
        }

        // Obtener tipo de carta (Monster, Spell, Trap)
        let cardType = '';
        // Añadido effect-card a las clases reconocidas como monstruos
        if (cardTable.classList.contains('monster-card') ||
            cardTable.classList.contains('ritual-card') ||
            cardTable.classList.contains('fusion-card') ||
            cardTable.classList.contains('synchro-card') ||
            cardTable.classList.contains('xyz-card') ||
            cardTable.classList.contains('link-card') ||
            cardTable.classList.contains('effect-card')) {
            cardType = 'Monster';
        } else if (cardTable.classList.contains('spell-card')) {
            cardType = 'Spell';
        } else if (cardTable.classList.contains('trap-card')) {
            cardType = 'Trap';
        }

        // Extraer datos comunes
        const name = document.querySelector('.heading div')?.textContent.trim() || '';
        const loreElement = document.querySelector('.lore, .main_lore');
        const lore = loreElement ? loreElement.textContent.trim() : '';

        // Extraer imagen
        const imgElement = document.querySelector('.imagecolumn img');
        const imageUrl = imgElement ? imgElement.src : null;

        // Crear objeto base con información común
        const cardData = {
            name,
            cardType,
            description: lore,
            image_url: imageUrl,
            rarity: 'common',
            limit: 3,
            frame: null,
            archetype: null,
            code: null,
            password: null,
            isEffect: false  // Indicador para monstruos de efecto
        };

        // Extraer datos específicos según tipo de carta
        const rows = document.querySelectorAll('.innertable tr');
        rows.forEach(row => {
            const header = row.querySelector('th')?.textContent.trim();
            const value = row.querySelector('td')?.textContent.trim();

            if (!header || !value) return;

            // Capturar Internal number como code
            if (header.includes('Internal number')) {
                cardData.code = value;
            }
            else if (header.includes('Attribute')) {
                cardData.attribute = value.split(' ')[0];
            }
            // Verificar tanto "Type" como "Types" - ¡importante!
            else if (header.includes('Type')) {
                // Manejar tanto singular "Type" como plural "Types"
                const typeValue = value.toLowerCase();
                cardData.types = value.split(' / ');

                // Determinar si es un monstruo de efecto
                if (typeValue.includes('effect')) {
                    cardData.isEffect = true;
                }

                // Obtener tipo primario de monstruo (antes de " / ")
                cardData.monsterType = value.split(' / ')[0];

                // Inferir el frame
                if (typeValue.includes('ritual')) {
                    cardData.frame = 'ritual';
                } else if (typeValue.includes('fusion')) {
                    cardData.frame = 'fusion';
                } else if (typeValue.includes('effect')) {
                    cardData.frame = 'effect';
                } else if (cardData.cardType === 'Monster') {
                    cardData.frame = 'normal';
                }
            }
            else if (header.includes('Level')) {
                cardData.level = parseInt(value.match(/\d+/)?.[0] || '0');
            }
            else if (header.includes('ATK')) {
                const [atk, def] = value.split(' / ');
                cardData.atk = parseInt(atk.match(/\d+/)?.[0] || '0');
                cardData.def = parseInt(def.match(/\d+/)?.[0] || '0');
            }
            else if (header.includes('Property')) {
                cardData.property = value.split(' ')[0];
                // Establecer frame para Spell/Trap
                if (cardData.cardType === 'Spell') {
                    cardData.frame = 'spell';
                } else if (cardData.cardType === 'Trap') {
                    cardData.frame = 'trap';
                }
            }
        });

        return cardData;
    } catch (error) {
        console.error(`Error obteniendo datos de "${cardName}":`, error);
        return null;
    }
}

async function importCardToDatabase(cardData) {
    try {
        if (!cardData) {
            throw new Error('No hay datos de carta para importar');
        }

        console.log(`[DB] Creando carta en base de datos: ${cardData.name}`);

        // Verificar si la carta ya existe
        const existingCard = await Card.findOne({ where: { name: cardData.name } });

        if (existingCard) {
            console.log(`[FOUND] La carta "${cardData.name}" ya existe (ID: ${existingCard.id}).`);
            return existingCard;
        }

        // Crear la carta principal
        const dbCard = await Card.create({
            name: cardData.name,
            code: cardData.code,
            description: cardData.description,
            image_url: cardData.image_url,
            password: cardData.password,
            rarity: cardData.rarity,
            limit: cardData.limit,
            frame: cardData.frame,
            archetype: cardData.archetype,
            cardType: cardData.cardType
        });

        console.log(`[CREATED] Carta base creada con ID: ${dbCard.id}`);

        // Crear el registro específico según el tipo
        if (cardData.cardType === 'Monster') {
            await MonsterCard.create({
                cardId: dbCard.id,
                attribute: cardData.attribute || null,
                effectTrait: cardData.isEffect, // Usar isEffect que hemos detectado
                summonMechanic: cardData.frame === 'ritual' ? 'ritual' :
                    cardData.frame === 'fusion' ? 'fusion' :
                        cardData.frame === 'synchro' ? 'synchro' :
                            cardData.frame === 'xyz' ? 'xyz' :
                                cardData.frame === 'link' ? 'link' : null,
                ability: null,
                type: cardData.monsterType || null,
                level: cardData.level || null,
                attack: cardData.atk || null,
                defense: cardData.def || null
            });
            console.log(`[OK] Monster importada: ${cardData.name}`);
        } else if (cardData.cardType === 'Spell') {
            await SpellCard.create({
                cardId: dbCard.id,
                type: cardData.property?.toLowerCase() || 'normal'
            });
            console.log(`[OK] Spell importada: ${cardData.name}`);
        } else if (cardData.cardType === 'Trap') {
            await TrapCard.create({
                cardId: dbCard.id,
                type: cardData.property?.toLowerCase() || 'normal'
            });
            console.log(`[OK] Trap importada: ${cardData.name}`);
        }

        console.log(`[SUCCESS] Carta "${cardData.name}" importada correctamente`);
        return dbCard;

    } catch (error) {
        console.error(`[ERROR] Error importando carta a la base de datos:`, error);
        throw error;
    }
}

async function importYugipediaCard(cardName) {
    try {
        console.log(`[START] Importando carta desde Yugipedia: "${cardName}"`);

        // 1. Sincronizar modelos con la base de datos
        await sequelize.sync();

        // 2. Obtener datos de Yugipedia
        const cardData = await fetchCardFromYugipedia(cardName);
        if (!cardData) {
            throw new Error(`No se pudo obtener información de "${cardName}" desde Yugipedia`);
        }

        // 3. Mostrar datos obtenidos
        console.log(`[INFO] Datos obtenidos de Yugipedia:`, JSON.stringify(cardData, null, 2));

        // 4. Importar a la base de datos
        const result = await importCardToDatabase(cardData);

        console.log(`[COMPLETE] Proceso finalizado para "${cardName}"`);
        return result;

    } catch (error) {
        console.error(`[FATAL] Error en el proceso de importación:`, error);
    } finally {
        // Cerrar conexión
        await sequelize.close();
    }
}

// Punto de entrada principal
const cardName = process.argv[2];
if (!cardName) {
    console.error('Uso: node importYugipediaCard.js "Nombre de Carta"');
    process.exit(1);
}

importYugipediaCard(cardName)
    .then(() => {
        console.log('Proceso completado.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error final:', err);
        process.exit(1);
    });