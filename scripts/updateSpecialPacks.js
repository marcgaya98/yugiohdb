import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import '../models/associations.js';
import Card from '../models/Card.js';
import Pack from '../models/Pack.js';
import CardPackObtention from '../models/CardPackObtention.js';

/**
 * Script para actualizar los packs especiales con sus relaciones correctas
 * 
 * - Lucky Economy Pack: contiene todas las cartas de Visitor from the Dark, Emergent Fire, Water of Life, 
 *   Gift of Wind, Platinum Light y Earth Dwellers.
 * 
 * - Symbol 50: contiene todas las cartas de los packs que se desbloquean al alcanzar un nivel de duelo mínimo: 
 *   Endless Thoughts, Flip the Picture, Equip Me, More Eternal Memories, Speed King, Spice of Duel, 
 *   Fairy's Sky, Dragon Drive y Fiend Night.
 * 
 * - Bit Players: contiene todas las cartas raras normales de todos los otros packs.
 * 
 * - Checkered Flag: contiene todas las cartas de todos los demás packs del juego.
 */
async function updateSpecialPacks() {
    try {
        console.log('Iniciando actualización de packs especiales...');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');

        // 1. Lucky Economy Pack
        const luckyEconomyPack = await Pack.findOne({ where: { name: 'Lucky Economy Pack' } });
        console.log(`Actualizando ${luckyEconomyPack.name} (ID: ${luckyEconomyPack.id})...`);

        const luckyPackSources = await Pack.findAll({
            where: {
                name: {
                    [Op.in]: ['Visitor from the Dark', 'Emergent Fire', 'Water of Life', 
                             'Gift of Wind', 'Platinum Light', 'Earth Dwellers']
                }
            }
        });

        const luckyPackSourceIds = luckyPackSources.map(pack => pack.id);
        
        // Obtener todas las cartas de los packs originales
        const luckyPackCards = await CardPackObtention.findAll({
            where: {
                packId: {
                    [Op.in]: luckyPackSourceIds
                }
            },
            attributes: ['cardId']
        });

        const luckyPackCardIds = [...new Set(luckyPackCards.map(relation => relation.cardId))];
        
        // Crear relaciones para Lucky Economy Pack
        let luckyPackCreated = 0;
        for (const cardId of luckyPackCardIds) {
            const [relation, created] = await CardPackObtention.findOrCreate({
                where: {
                    cardId,
                    packId: luckyEconomyPack.id
                },
                defaults: {
                    cardId,
                    packId: luckyEconomyPack.id
                }
            });
            
            if (created) luckyPackCreated++;
        }
        
        console.log(`${luckyPackCreated} relaciones creadas para ${luckyEconomyPack.name}`);

        // 2. Symbol 50
        const symbol50Pack = await Pack.findOne({ where: { name: 'Symbol 50' } });
        console.log(`Actualizando ${symbol50Pack.name} (ID: ${symbol50Pack.id})...`);

        const symbol50Sources = await Pack.findAll({
            where: {
                name: {
                    [Op.in]: ['Endless Thoughts', 'Flip the Picture', 'Equip Me', 'More Eternal Memories', 
                             'Speed King', 'Spice of Duel', 'Fairy\'s Sky', 'Dragon Drive', 'Fiend Night']
                }
            }
        });

        const symbol50SourceIds = symbol50Sources.map(pack => pack.id);
        
        // Obtener todas las cartas de los packs originales
        const symbol50Cards = await CardPackObtention.findAll({
            where: {
                packId: {
                    [Op.in]: symbol50SourceIds
                }
            },
            attributes: ['cardId']
        });

        const symbol50CardIds = [...new Set(symbol50Cards.map(relation => relation.cardId))];
        
        // Crear relaciones para Symbol 50
        let symbol50Created = 0;
        for (const cardId of symbol50CardIds) {
            const [relation, created] = await CardPackObtention.findOrCreate({
                where: {
                    cardId,
                    packId: symbol50Pack.id
                },
                defaults: {
                    cardId,
                    packId: symbol50Pack.id
                }
            });
            
            if (created) symbol50Created++;
        }
        
        console.log(`${symbol50Created} relaciones creadas para ${symbol50Pack.name}`);

        // 3. Bit Players (todas las cartas raras)
        const bitPlayerspack = await Pack.findOne({ where: { name: 'Bit Players' } });
        console.log(`Actualizando ${bitPlayerspack.name} (ID: ${bitPlayerspack.id})...`);

        // Obtener todas las cartas raras
        const rareCards = await Card.findAll({
            where: {
                rarity: 'Rare'
            },
            attributes: ['id']
        });

        const rareCardIds = rareCards.map(card => card.id);
        
        // Crear relaciones para Bit Players
        let bitPlayersCreated = 0;
        for (const cardId of rareCardIds) {
            const [relation, created] = await CardPackObtention.findOrCreate({
                where: {
                    cardId,
                    packId: bitPlayerspack.id
                },
                defaults: {
                    cardId,
                    packId: bitPlayerspack.id
                }
            });
            
            if (created) bitPlayersCreated++;
        }
        
        console.log(`${bitPlayersCreated} relaciones creadas para ${bitPlayerspack.name}`);

        // 4. Checkered Flag (todas las cartas de todos los packs)
        const checkeredFlagPack = await Pack.findOne({ where: { name: 'Checkered Flag' } });
        console.log(`Actualizando ${checkeredFlagPack.name} (ID: ${checkeredFlagPack.id})...`);

        // Obtener todas las cartas que están en algún pack
        const allPackCards = await CardPackObtention.findAll({
            attributes: ['cardId']
        });

        const allPackCardIds = [...new Set(allPackCards.map(relation => relation.cardId))];
        
        // Crear relaciones para Checkered Flag
        let checkeredFlagCreated = 0;
        for (const cardId of allPackCardIds) {
            const [relation, created] = await CardPackObtention.findOrCreate({
                where: {
                    cardId,
                    packId: checkeredFlagPack.id
                },
                defaults: {
                    cardId,
                    packId: checkeredFlagPack.id
                }
            });
            
            if (created) checkeredFlagCreated++;
        }
        
        console.log(`${checkeredFlagCreated} relaciones creadas para ${checkeredFlagPack.name}`);

        console.log('\n--- Resumen ---');
        console.log(`Lucky Economy Pack: ${luckyPackCreated} cartas agregadas`);
        console.log(`Symbol 50: ${symbol50Created} cartas agregadas`);
        console.log(`Bit Players: ${bitPlayersCreated} cartas raras agregadas`);
        console.log(`Checkered Flag: ${checkeredFlagCreated} cartas agregadas`);

        console.log('\nProceso completado.');

    } catch (error) {
        console.error('Error durante la actualización:', error);
    } finally {
        // Cerrar conexión
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función
updateSpecialPacks();
