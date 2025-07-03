import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';

const cardsJsonPath = path.resolve('./scripts/data/cards.json');
const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf-8'));
const importedPath = path.resolve('./scripts/data/cards_imported.json');
let importedKonamiIds = [];
if (fs.existsSync(importedPath)) {
    importedKonamiIds = JSON.parse(fs.readFileSync(importedPath, 'utf-8'));
    console.log(`[INFO] Cargados ${importedKonamiIds.length} konami_id ya importados.`);
}

async function importCardsByKonamiId() {

    const errores = [];
    const notFoundKonamiIds = [];
    const cardsToFetch = [];
    const localCardsByKonamiId = {};

    // 1. Prepara el mapeo por konami_id (ajusta si tu cards.json tiene otro campo)
    for (const card of cardsData) {
        const konamiId = String(card.Code || card.konami_id || card.code); // Ajusta según tu JSON real
        if (!konamiId) continue;
        localCardsByKonamiId[konamiId] = card;
    }
    console.log(`[INFO] Total cartas a revisar: ${Object.keys(localCardsByKonamiId).length}`);

    // 2. Busca en la base de datos por code (konami_id)
    for (const konamiId of Object.keys(localCardsByKonamiId)) {
        if (importedKonamiIds.includes(konamiId)) {
            console.log(`[SKIP] Carta ya importada anteriormente: konami_id ${konamiId}`);
            continue; // Ya procesado
        }
        const localCard = localCardsByKonamiId[konamiId];
        if (!localCard || !localCard.name) {
            console.log(`[ERROR] localCard o localCard.name es undefined para konami_id ${konamiId}`);
            continue;
        }
        const dbCard = await Card.findOne({ where: { code: konamiId } });

        if (dbCard) {
            if (dbCard.name !== localCard.name) {
                dbCard.alter_name = localCard.name;
                await dbCard.save();
                console.log(`[UPDATE] alter_name actualizado para ${dbCard.name} (konami_id: ${konamiId})`);
            } else {
                console.log(`[FOUND] Carta ya existe en la base de datos: ${dbCard.name} (konami_id: ${konamiId})`);
            }
            importedKonamiIds.push(konamiId); // Marca como procesado
            continue; // No hace falta llamar a la API
        } else {
            cardsToFetch.push(konamiId);
            console.log(`[QUEUE] Carta añadida a la cola de importación: ${localCard.name} (konami_id: ${konamiId})`);
        }
    }

    // 3. Llama a la API solo para los que no existen
    const batchSize = 20;
    for (let i = 0; i < cardsToFetch.length; i += batchSize) {
        const batch = cardsToFetch.slice(i, i + batchSize);
        const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?konami_id=${batch.join(',')}&misc=yes`;
        console.log(`[API] Llamando a la API para konami_id(s): ${batch.join(', ')}`);
        try {
            const res = await fetch(url);
            const apiData = await res.json();
            if (!apiData.data) {
                notFoundKonamiIds.push(...batch);
                console.log(`[WARN] No se encontraron datos en la API para: ${batch.join(', ')}`);
                continue;
            }
            for (const konamiId of batch) {
                const localCard = localCardsByKonamiId[konamiId];
                if (!localCard) {
                    console.log(`[ERROR] No se encontró localCard para konami_id ${konamiId}`);
                    notFoundKonamiIds.push(konamiId);
                    continue;
                }

                const card = apiData.data.find(c => {
                    const misc = Array.isArray(c.misc_info) ? c.misc_info[0] : {};
                    console.log('Procesando carta:', c);
                    console.log('Nombre:', c.name);
                    return (misc.konami_id && String(misc.konami_id) === konamiId)
                        || (c.name && localCard.name && c.name.toLowerCase() === localCard.name.toLowerCase());
                });

                if (!card) {
                    notFoundKonamiIds.push(konamiId);
                    console.log(`[ERROR] No se encontró la carta en la respuesta de la API: konami_id ${konamiId}`);
                    continue;
                }

                let alterName = null;
                if (localCard && localCard.name && card.name !== localCard.name) {
                    alterName = localCard.name;
                    console.log(`[INFO] Nombre diferente detectado. API: "${card.name}", Local: "${localCard.name}"`);
                }

                await Card.create({
                    name: card.name,
                    code: konamiId, // SIEMPRE tu konami_id local
                    description: card.desc,
                    image_url: card.card_images?.[0]?.image_url || null,
                    rarity: card.rarity || 'common',
                    limit: 3,
                    frame: card.frameType || null,
                    archetype: card.archetype || null,
                    cardType: card.type.includes('Monster')
                        ? 'Monster'
                        : card.type.includes('Spell')
                            ? 'Spell'
                            : 'Trap',
                    alter_name: alterName
                }).then(async (dbCard) => {
                    const misc = Array.isArray(card.misc_info) ? card.misc_info[0] : {};
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
                        console.log(`[OK] MonsterCard importada: ${card.name} (konami_id: ${konamiId})`);
                    } else if (dbCard.cardType === 'Spell') {
                        await SpellCard.create({
                            cardId: dbCard.id,
                            type: card.race,
                        });
                        console.log(`[OK] SpellCard importada: ${card.name} (konami_id: ${konamiId})`);
                    } else if (dbCard.cardType === 'Trap') {
                        await TrapCard.create({
                            cardId: dbCard.id,
                            type: card.race,
                        });
                        console.log(`[OK] TrapCard importada: ${card.name} (konami_id: ${konamiId})`);
                    }
                });
                importedKonamiIds.push(konamiId); // Marca como procesado tras importar
                fs.writeFileSync(importedPath, JSON.stringify(importedKonamiIds, null, 2));
            }
        } catch (err) {
            errores.push({ batch, error: err.message });
            console.log(`[ERROR] Fallo en el batch: ${batch.join(', ')}. Motivo: ${err.message}`);
        }
        // Espera para evitar rate limit
        await new Promise(res => setTimeout(res, 200));
    }

    // 4. Guarda errores y no encontrados
    if (errores.length > 0) {
        fs.writeFileSync('cards_import_errors.json', JSON.stringify(errores, null, 2));
        console.log(`[WARN] Errores guardados en cards_import_errors.json`);
    }
    if (notFoundKonamiIds.length > 0) {
        fs.writeFileSync('cards_not_found.json', JSON.stringify(notFoundKonamiIds, null, 2));
        console.log(`[WARN] Cartas no encontradas guardadas en cards_not_found.json`);
    }
    // Al final del script, guarda el progreso
    fs.writeFileSync(importedPath, JSON.stringify(importedKonamiIds, null, 2));
    console.log('[DONE] Importación finalizada');
}

importCardsByKonamiId();