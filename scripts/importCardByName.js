import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';


const filePath = path.resolve('./scripts/data/filtered_cards.json');
const importedPath = path.resolve('./scripts/data/cards_imported_by_name.json');

const cards = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
let importedNames = [];

if (fs.existsSync(importedPath)) {
    importedNames = JSON.parse(fs.readFileSync(importedPath, 'utf-8'));
    console.log(`[INFO] Cartas ya importadas: ${importedNames.length}`);
}

async function importCardByName() {
    await sequelize.sync();
    for (const card of cards) {
        const name = card.name.trim();

        if (importedNames.includes(name)) {
            console.log(`[SKIP] Ya importada: ${name}`);
            continue;
        }

        const dbCard = await Card.findOne({ where: { name } });
        if (dbCard) {
            console.log(`[FOUND] Ya existe en la base de datos: ${name}`);
            importedNames.push(name);
            fs.writeFileSync(importedPath, JSON.stringify(importedNames, null, 2));
            continue;
        }

        console.log(`[API] Buscando: ${name}`);
        try {
            const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}&misc=yes`;
            const res = await fetch(url);
            const apiData = await res.json();
            const cardData = apiData.data?.[0];

            if (!cardData) {
                console.log(`[WARN] No encontrado: ${name}`);
                continue;
            }

            await Card.create({
                name: cardData.name,
                code: card.Code || null,
                description: cardData.desc,
                image_url: cardData.card_images?.[0]?.image_url || null,
                rarity: cardData.rarity || 'common',
                limit: 3,
                frame: cardData.frameType || null,
                archetype: cardData.archetype || null,
                cardType: cardData.type.includes('Monster') || cardData.type.includes('Token') ? 'Monster' : cardData.type.includes('Spell') ? 'Spell' : 'Trap'
            }).then(async (dbCard) => {
                if (dbCard.cardType === 'Monster' || dbCard.cardType === 'Token') {
                    await MonsterCard.create({
                        cardId: dbCard.id,
                        attribute: cardData.attribute || card.Attribute,
                        effectTrait: Array.isArray(cardData.misc_info) && cardData.misc_info[0]?.has_effect || false,
                        summonMechanic: dbCard.frame === 'ritual' ? 'ritual' : dbCard.frame === 'fusion' ? 'fusion' : null,
                        ability: dbCard.cardType === 'Token' ? null :
                            Array.isArray(card.typeline)
                                ? card.typeline.find(type =>
                                    ['Flip', 'Toon', 'Spirit', 'Union'].includes(type)
                                ) || null
                                : null,
                        type: cardData.race,
                        level: cardData.level || card.Level,
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
            });

            importedNames.push(name);
            fs.writeFileSync(importedPath, JSON.stringify(importedNames, null, 2));
        } catch (error) {
            console.log(`[ERROR] Fallo al importar ${name}: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
    }

    console.log('[DONE] Todas las cartas procesadas.');
}

importCardByName();
