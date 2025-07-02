import fs from 'fs';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import '../models/associations.js';
import Card from '../models/Card.js';
import Pack from '../models/Pack.js';
import CardPackObtention from '../models/CardPackObtention.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mapeado de nombres de cartas problemáticas
const CARD_NAME_MAPPING = {
    // Cartas con números
    "Mystical Sheep 1": "Mystical Sheep #1",
    "Mystical Sheep 2": "Mystical Sheep #2",
    "Winged Dragon, Guardian of the Fortress 1": "Winged Dragon, Guardian of the Fortress #1",
    "Winged Dragon, Guardian of the Fortress 2": "Winged Dragon, Guardian of the Fortress #2",
    "Twin Long Rods 1": "Twin Long Rods #1",
    "Twin Long Rods 2": "Twin Long Rods #2",
    "Rock Ogre Grotto 1": "Rock Ogre Grotto #1",
    "Rock Ogre Grotto 2": "Rock Ogre Grotto #2",
    "Steel Ogre Grotto 1": "Steel Ogre Grotto #1",
    "Steel Ogre Grotto 2": "Steel Ogre Grotto #2",
    "Fiend Reflection 1": "Fiend Reflection #1",
    "Fiend Reflection 2": "Fiend Reflection #2",
    "Flying Kamakiri 2": "Flying Kamakiri #2",
    "Tyhone 2": "Tyhone #2",
    "Darkfire Soldier 1": "Darkfire Soldier #1",
    "Jinzo 7": "Jinzo #7",
    "Nekogal 1": "Nekogal #1",
    "Key Mace 2": "Key Mace #2",
    "Oscillo Hero 2": "Oscillo Hero #2",
    "Luster Dragon 2": "Luster Dragon #2",
    "Mushroom Man 2": "Mushroom Man #2",
    "Sasuke Samurai 4": "Sasuke Samurai #4",

    // Casos especiales
    "Red-Eyes B. Chick": "Black Dragon's Chick",
    "B. Skull Dragon": "Black Skull Dragon",
    "Red-Moon Baby": "Vampire Baby",
    "Pigeonholing Books of Spell": "Spellbook Organization",
    "Vampire Orchis": "Vampiric Orchis",
    "Kuwagata Alpha": "Kuwagata α",
    "Necrolancer the Timelord": "Necrolancer the Time-lord",
    "Big Core": "B.E.S. Big Core",
    "Kinetic Soldier": "Cipher Soldier",
    "Oscillo Hero 2": "Wattkid"
};

async function fixCardPackImport() {
    try {
        console.log('Iniciando corrección de importación de cartas de packs...');

        // Leer el archivo de cartas no encontradas
        const notFoundCardsPath = resolve(__dirname, '../data/pack_cards_not_found.json');
        const notFoundCards = JSON.parse(fs.readFileSync(notFoundCardsPath, 'utf8'));

        console.log(`Procesando ${notFoundCards.length} cartas no encontradas...`);

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');

        let found = 0;
        let stillNotFound = 0;

        for (const item of notFoundCards) {
            const packName = item.packName;
            const originalCardName = item.cardName;

            // Buscar el pack
            const pack = await Pack.findOne({
                where: { name: packName }
            });

            if (!pack) {
                console.log(`Pack no encontrado: ${packName}`);
                continue;
            }

            // Corregir el nombre de la carta usando el mapeo o la regla general
            let correctedName = CARD_NAME_MAPPING[originalCardName];

            if (!correctedName) {
                // Si no está en el mapeo, intentar aplicar la regla general para cartas con números
                const numberMatch = originalCardName.match(/(\s)(\d+)$/);
                if (numberMatch) {
                    correctedName = originalCardName.replace(/(\s)(\d+)$/, ` #$2`);
                } else {
                    correctedName = originalCardName;
                }
            }

            console.log(`Buscando carta: "${originalCardName}" como "${correctedName}"`);

            // Buscar la carta con el nombre corregido
            const card = await Card.findOne({
                where: {
                    [Op.or]: [
                        { name: correctedName },
                        { alter_name: correctedName }
                    ]
                }
            });

            if (card) {
                found++;
                console.log(`¡Carta encontrada! ID: ${card.id}, Nombre: ${card.name}`);

                // Crear la relación entre la carta y el pack
                try {
                    const [packObtention, created] = await CardPackObtention.findOrCreate({
                        where: {
                            cardId: card.id,
                            packId: pack.id
                        },
                        defaults: {
                            cardId: card.id,
                            packId: pack.id
                        }
                    });

                    if (created) {
                        console.log(`Relación creada: Carta "${card.name}" → Pack "${pack.name}"`);
                    } else {
                        console.log(`La relación ya existía entre "${card.name}" y "${pack.name}"`);
                    }
                } catch (error) {
                    console.error(`Error al crear la relación: ${error.message}`);
                }
            } else {
                stillNotFound++;
                console.log(`No se encontró la carta: "${correctedName}"`);
            }
        }

        console.log('\n--- Resumen ---');
        console.log(`Total de cartas procesadas: ${notFoundCards.length}`);
        console.log(`Cartas encontradas y corregidas: ${found}`);
        console.log(`Cartas que siguen sin encontrarse: ${stillNotFound}`);

        if (stillNotFound > 0) {
            console.log('\nLas siguientes cartas aún necesitan revisión manual:');
            for (const item of notFoundCards) {
                const correctedName = CARD_NAME_MAPPING[item.cardName] || item.cardName.replace(/(\s)(\d+)$/, ` #$2`);
                const card = await Card.findOne({
                    where: {
                        [Op.or]: [
                            { name: correctedName },
                            { alter_name: correctedName }
                        ]
                    }
                });

                if (!card) {
                    console.log(`- "${item.cardName}" en el pack "${item.packName}"`);
                }
            }
        }

        console.log('\nProceso completado.');

    } catch (error) {
        console.error('Error durante la corrección:', error);
    } finally {
        // Cerrar conexión
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función
fixCardPackImport();
