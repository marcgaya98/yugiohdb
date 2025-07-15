/**
 * Script para importar relaciones mentioned_card extrayendo menciones de descripciones.
 * - Busca menciones entre comillas dobles en description
 * - Valida existencia por name y, si falla, por alter_name
 * - Soporta dry-run (--dry-run)
 * - Guarda menciones no encontradas en data/mentioned_not_found.json
 * - Manejo de errores robusto y reporte de progreso
 */

import fs from 'fs';
import path from 'path';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import Card from '../models/Card.js';
import MentionedCard from '../models/MentionedCard.js';

const NOT_FOUND_PATH = path.resolve('data/mentioned_not_found.json');

/**
 * Importa relaciones mentioned_card extrayendo menciones de descripciones.
 * @param {Object} options
 * @param {boolean} options.dryRun - Si true, no inserta en BD.
 */
export async function importMentionedCards({ dryRun = false } = {}) {
    const notFound = [];
    let created = 0, duplicated = 0, huérfanas = 0, ambiguas = 0;
    // Obtener todas las cartas relevantes
    const cards = await Card.findAll({ where: { frame: { [Op.ne]: 'normal' } } });
    // Mapa de nombres y alter_names a id para búsqueda rápida
    const allCards = await Card.findAll({ attributes: ['id', 'name', 'alter_name'] });
    const nameMap = new Map();
    const alterNameMap = new Map();
    for (const c of allCards) {
        if (c.name) nameMap.set(c.name, c.id);
        if (c.alter_name) alterNameMap.set(c.alter_name, c.id);
    }
    for (const card of cards) {
        const { id: cardId, description } = card;
        if (!description) continue;
        const matches = [...description.matchAll(/"([^"]+)"/g)];
        const found = new Set();
        for (const m of matches) {
            const mentionedName = m[1];
            if (mentionedName === card.name) continue; // Ignorar auto-mención
            let mentionedCardId = nameMap.get(mentionedName);
            let by = 'name';
            if (!mentionedCardId) {
                mentionedCardId = alterNameMap.get(mentionedName);
                by = mentionedCardId ? 'alter_name' : null;
            }
            // Si no se encuentra, probar singular para tokens ("Kuriboh Tokens" -> "Kuriboh Token")
            if (!mentionedCardId && mentionedName.includes('Token') && mentionedName.endsWith('s')) {
                const singular = mentionedName.replace(/s$/, '');
                mentionedCardId = nameMap.get(singular) || alterNameMap.get(singular);
                by = mentionedCardId ? 'singular_token' : null;
            }
            if (!mentionedCardId) {
                notFound.push({ cardId, cardName: card.name, mentioned: mentionedName });
                huérfanas++;
                continue;
            }
            if (mentionedCardId === cardId) continue; // Ignorar auto-mención
            const key = `${cardId}-${mentionedCardId}`;
            if (found.has(key)) continue; // Evitar duplicados en la misma carta
            found.add(key);
            // Comprobar si ya existe en BD
            const exists = await MentionedCard.findOne({ where: { cardId, mentionedCardId } });
            if (exists) {
                duplicated++;
                continue;
            }
            if (!dryRun) {
                await MentionedCard.create({ cardId, mentionedCardId });
            }
            created++;
            console.log(`✔ ${card.name} (${cardId}) menciona a ${mentionedName} [${by}] (${mentionedCardId})`);
        }
    }
    if (notFound.length) {
        fs.writeFileSync(NOT_FOUND_PATH, JSON.stringify(notFound, null, 2));
        console.warn(`⚠ Menciones no encontradas guardadas en ${NOT_FOUND_PATH}`);
    }
    console.log(`\n✅ Relaciones insertadas: ${created}`);
    console.log(`Duplicadas: ${duplicated}`);
    console.log(`No encontradas: ${huérfanas}`);
}

if (process.argv.includes('--dry-run')) {
    importMentionedCards({ dryRun: true }).then(() => sequelize.close());
} else {
    importMentionedCards().then(() => sequelize.close());
}
