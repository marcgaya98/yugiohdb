/**
 * Script para importar relaciones ritual_monster_spell desde data/rituals.json.
 * - Valida integridad de datos y existencia de IDs
 * - Soporta dry-run (--dry-run)
 * - Manejo de errores robusto y reporte de progreso
 */

import fs from 'fs';
import path from 'path';
import sequelize from '../config/database.js';
import RitualMonsterSpell from '../models/RitualMonsterSpell.js';
import Card from '../models/Card.js';

/**
 * Importa relaciones ritual_monster_spell desde un JSON.
 * @param {Object} options
 * @param {boolean} options.dryRun - Si true, no inserta en BD.
 */
export async function importRitualMonsterSpells({ dryRun = false } = {}) {
    const filePath = path.resolve('data/rituals.json');
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(`❌ Error leyendo/parsing ${filePath}:`, err.message);
        process.exit(1);
    }

    let created = 0;
    const errors = [];

    for (const entry of data) {
        const { ritualMonsterId, ritualSpellId, ritualMonster, ritualSpell } = entry;
        if (!ritualMonsterId || !ritualSpellId) {
            errors.push({ entry, reason: 'Faltan IDs' });
            continue;
        }
        // Validar existencia de ambos IDs en la tabla card
        const [monsterCard, spellCard] = await Promise.all([
            Card.findByPk(ritualMonsterId),
            Card.findByPk(ritualSpellId)
        ]);
        if (!monsterCard || !spellCard) {
            errors.push({ entry, reason: `No existe card: ${!monsterCard ? 'ritualMonsterId' : ''}${!monsterCard && !spellCard ? ' y ' : ''}${!spellCard ? 'ritualSpellId' : ''}` });
            continue;
        }
        try {
            if (!dryRun) {
                await RitualMonsterSpell.create({
                    ritualMonsterId,
                    ritualSpellId
                });
            }
            created++;
            console.log(`✔ Relación: ${ritualMonster} (${ritualMonsterId}) ⇨ ${ritualSpell} (${ritualSpellId})`);
        } catch (err) {
            errors.push({ entry, reason: err.message });
        }
    }

    console.log(`\n✅ Relaciones procesadas: ${created}`);
    if (errors.length) {
        console.warn('⚠ Errores encontrados:');
        errors.forEach(e => console.warn(e));
    }
}

if (process.argv.includes('--dry-run')) {
    importRitualMonsterSpells({ dryRun: true }).then(() => sequelize.close());
} else {
    importRitualMonsterSpells().then(() => sequelize.close());
}