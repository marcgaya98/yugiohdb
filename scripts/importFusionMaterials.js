/**
 * Script para importar y relacionar cartas de fusión con sus materiales en la tabla fusion_material.
 * - Lee el archivo data/fusions_materials.json
 * - Busca los IDs de las cartas de fusión y materiales (ignorando materiales genéricos)
 * - Inserta las relaciones en la tabla fusion_material
 * - Soporta dry-run y rollback
 *
 * Uso:
 *   node scripts/importFusionMaterials.js [--dry-run]
 */
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import Card from '../models/Card.js';
import FusionMaterial from '../models/FusionMaterial.js';
import sequelize from '../config/database.js';
import '../models/associations.js';

// Lista de materiales genéricos a ignorar
const GENERIC_MATERIALS = [
    /\d+\+? [A-Za-z\- ]+ monsters?/i,
    /\d+ [A-Za-z\- ]+ monsters?/i,
    /Warrior-Type monster/i,
    /Dragon monsters?/i,
    /Machine monsters?/i
];

function isGenericMaterial(material) {
    return GENERIC_MATERIALS.some(rgx => rgx.test(material));
}

async function importFusionMaterials({ dryRun = false } = {}) {
    const fusionsPath = path.resolve('data/fusions_materials.json');
    const fusions = JSON.parse(fs.readFileSync(fusionsPath, 'utf8'));
    const notFound = [];
    let created = 0;

    const transaction = await sequelize.transaction();
    try {
        for (const fusion of fusions) {
            const fusionCard = await Card.findOne({ where: { name: fusion.name } });
            if (!fusionCard) {
                notFound.push({ fusion: fusion.name, reason: 'Fusion card not found' });
                continue;
            }
            for (const material of fusion.materials) {
                if (isGenericMaterial(material)) continue;
                const materialCard = await Card.findOne({
                    where: {
                        [Op.or]: [
                            { name: { [Op.like]: material } },
                            { alter_name: { [Op.like]: material } }
                        ]
                    }
                });
                if (!materialCard) {
                    notFound.push({ fusion: fusion.name, material });
                    continue;
                }
                if (!dryRun) {
                    await FusionMaterial.findOrCreate({
                        where: { fusionId: fusionCard.id, materialId: materialCard.id },
                        transaction
                    });
                }
                created++;
            }
        }
        if (dryRun) {
            await transaction.rollback();
            console.log('Dry-run: no se realizaron cambios en la base de datos.');
        } else {
            await transaction.commit();
            console.log('Relaciones fusion-material importadas correctamente.');
        }
        if (notFound.length) {
            fs.writeFileSync('data/fusion_materials_import_not_found.json', JSON.stringify(notFound, null, 2));
            console.log('Algunos materiales o fusiones no se encontraron. Ver data/fusion_materials_import_not_found.json');
        }
        console.log(`Total de relaciones creadas: ${created}`);
    } catch (err) {
        await transaction.rollback();
        console.error('Error durante la importación:', err);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

const dryRun = process.argv.includes('--dry-run');
importFusionMaterials({ dryRun });
