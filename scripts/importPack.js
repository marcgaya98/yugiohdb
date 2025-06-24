import fetch from 'node-fetch';
import fs from 'fs';
import packsCards from '../packsCards.json' assert { type: 'json' };
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';
import Pack from '../models/Pack.js';
import '../models/associations.js';

async function importAllPacks() {
    await CardPack.destroy({ where: {} });
    await MonsterCard.destroy({ where: {} });
    await SpellCard.destroy({ where: {} });
    await TrapCard.destroy({ where: {} });
    await Card.destroy({ where: {} });

    const errores = [];

    for (const pack of packsCards) {
        const packName = pack.packName;
        const cards = pack.cards;
        if (!cards || cards.length === 0) {
            console.warn(`Pack "${packName}" no tiene cartas, saltando...`);
            continue;
        }

        const dbPack = await Pack.findOne({ where: { name: packName } });
        if (!dbPack) {
            console.error(`Pack "${packName}" no encontrado en la base de datos.`);
            continue;
        }
        const packId = dbPack.id;

        // 1. Lanzar todas las peticiones en paralelo (pero con control de velocidad)
        const fetches = [];
        for (const localCard of cards) {
            const name = localCard.name;
            const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}&misc=yes`;
            // Espera entre llamadas para no superar el rate limit
            await new Promise(res => setTimeout(res, 60));
            fetches.push(fetch(url).then(res => res.json()).then(apiData => ({ apiData, localCard, name })));
        }

        // 2. Esperar a que todas terminen
        const results = await Promise.all(fetches);

        // 3. Procesar y guardar
        for (const { apiData, localCard, name } of results) {
            try {
                if (!apiData.data || !apiData.data.length) {
                    errores.push({ pack: packName, cartas: [name] });
                    continue;
                }
                const card = apiData.data[0];
                const misc = Array.isArray(card.misc_info) ? card.misc_info[0] : {};
                const code = misc.konami_id ? String(misc.konami_id) : String(card.id);
                const rarity = localCard.rarity ? localCard.rarity.toLowerCase() : 'common';

                let limit = 3;
                if (card.banlist_info && typeof card.banlist_info.ban_tcg === 'string') {
                    switch (card.banlist_info.ban_tcg) {
                        case 'Forbidden': limit = 0; break;
                        case 'Limited': limit = 1; break;
                        case 'Semi-Limited': limit = 2; break;
                        default: limit = 3;
                    }
                }

                const dbCard = await Card.create({
                    name: card.name,
                    code: code,
                    description: card.desc,
                    image_url: card.card_images?.[0]?.image_url || null,
                    rarity,
                    limit,
                    frame: card.frameType || null,
                    genre_id: null,
                    archetype: card.archetype || null,
                    cardType: card.type.includes('Monster')
                        ? 'Monster'
                        : card.type.includes('Spell')
                            ? 'Spell'
                            : 'Trap'
                });

                await CardPack.create({ cardId: dbCard.id, packId: dbPack.id });

                if (dbCard.cardType === 'Monster') {
                    let effectTrait = misc.has_effect !== undefined ? !!misc.has_effect : false;
                    await MonsterCard.create({
                        cardId: dbCard.id,
                        attribute: card.attribute,
                        effectTrait: effectTrait,
                        summonMechanic: dbCard.frame === 'ritual' ? 'ritual' : dbCard.frame === 'fusion' ? 'fusion' : null,
                        ability: Array.isArray(card.typeline)
                            ? card.typeline.find(type =>
                                ['Flip', 'Toon', 'Spirit', 'Union'].includes(type)
                            ) || null
                            : null,
                        type: card.race,
                        level: card.level,
                        attack: typeof card.atk === 'number' ? card.atk : null,
                        defense: typeof card.def === 'number' ? card.def : null,
                    });
                } else if (dbCard.cardType === 'Spell') {
                    await SpellCard.create({
                        cardId: dbCard.id,
                        type: card.race,
                    });
                } else if (dbCard.cardType === 'Trap') {
                    await TrapCard.create({
                        cardId: dbCard.id,
                        type: card.race,
                    });
                }

            } catch (err) {
                errores.push({ pack: packName, cartas: [name], error: err.message });
            }
        }

        console.log(`Importación completada para el pack "${packName}"`);
    }

    // Guardar errores en un archivo
    if (errores.length > 0) {
        fs.writeFileSync('cartas_no_encontradas.json', JSON.stringify(errores, null, 2));
        console.log('Cartas no encontradas guardadas en cartas_no_encontradas.json');
    }

}

importAllPacks();