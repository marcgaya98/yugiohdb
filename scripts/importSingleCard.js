import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';

// Obtener el nombre de la carta de los argumentos
const cardName = process.argv[2];

if (!cardName) {
    console.error('[ERROR] Debes proporcionar el nombre de una carta como parámetro.');
    console.error('Uso: node scripts/importSingleCard.js "Nombre de la Carta"');
    process.exit(1);
}

async function importSingleCard(name) {
    console.log(`[START] Importando carta: "${name}"`);

    try {
        await sequelize.sync();

        // Verificar si la carta ya existe
        const existingCard = await Card.findOne({ where: { name: name } });

        if (existingCard) {
            console.log(`[FOUND] La carta "${name}" ya existe en la base de datos (ID: ${existingCard.id}).`);
            process.exit(0);
        }

        // Buscar en la API
        console.log(`[API] Buscando: ${name}`);
        const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}&misc=yes`;
        const res = await fetch(url);

        if (!res.ok) {
            console.error(`[ERROR] Error en la API: ${res.status} ${res.statusText}`);
            process.exit(1);
        }

        const apiData = await res.json();
        const cardData = apiData.data?.[0];

        if (!cardData) {
            console.error(`[ERROR] No se encontró la carta "${name}" en la API.`);
            process.exit(1);
        }

        // Crear la carta con el mapeo correcto
        console.log(`[DB] Creando carta en la base de datos...`);
        const dbCard = await Card.create({
            name: cardData.name,
            // El código Konami (konami_id) es el "code" en nuestro modelo
            code: cardData.misc_info?.[0]?.konami_id?.toString() || null,
            description: cardData.desc,
            image_url: cardData.card_images?.[0]?.image_url || null,
            // El ID principal (id) es el "password" en nuestro modelo
            password: cardData.id?.toString() || null,
            rarity: cardData.rarity || 'common',
            limit: cardData.banlist_info?.ban_tcg || 3,
            frame: cardData.frameType || null,
            archetype: cardData.archetype || null,
            cardType: cardData.type.includes('Monster') || cardData.type.includes('Token') ? 'Monster' :
                cardData.type.includes('Spell') ? 'Spell' : 'Trap',
            alter_name: cardData.misc_info?.[0]?.beta_name || null
        });

        // Crear el registro específico según el tipo
        if (dbCard.cardType === 'Monster') {
            await MonsterCard.create({
                cardId: dbCard.id,
                attribute: cardData.attribute || null,
                effectTrait: Array.isArray(cardData.misc_info) && cardData.misc_info[0]?.has_effect || false,
                summonMechanic: cardData.frameType === 'ritual' ? 'ritual' :
                    cardData.frameType === 'fusion' ? 'fusion' : null,
                ability: cardData.race === 'Flip' ? 'Flip' :
                    cardData.race === 'Toon' ? 'Toon' :
                        cardData.race === 'Spirit' ? 'Spirit' :
                            cardData.race === 'Union' ? 'Union' : null,
                type: cardData.race,
                level: cardData.level || cardData.linkval || null,
                attack: typeof cardData.atk === 'number' ? cardData.atk : null,
                defense: typeof cardData.def === 'number' ? cardData.def : null
            });
            console.log(`[OK] Monster importada: ${name}`);
        } else if (dbCard.cardType === 'Spell') {
            await SpellCard.create({
                cardId: dbCard.id,
                type: cardData.race
            });
            console.log(`[OK] Spell importada: ${name}`);
        } else if (dbCard.cardType === 'Trap') {
            await TrapCard.create({
                cardId: dbCard.id,
                type: cardData.race
            });
            console.log(`[OK] Trap importada: ${name}`);
        }

        console.log(`[SUCCESS] Carta "${name}" importada correctamente (ID: ${dbCard.id}).`);

    } catch (error) {
        console.error(`[ERROR] Fallo al importar "${name}":`, error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

importSingleCard(cardName);