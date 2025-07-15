
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import '../models/associations.js';

/**
 * Script para insertar tokens Slime Token y Double Dude Token en la base de datos.
 * - code: 9999
 * - rarity: 'common'
 * - password: id del JSON
 * - attribute: 'DIVINE'
 * - type: del campo race
 * - level: 0
 * - atk/def: null
 */
async function run() {
    const tokens = [
        // Poisonous Snake Token
        {
            name: 'Poisonous Snake Token',
            password: '86801872',
            description: 'Special Summoned with the effect of "Cobra Jar". When this Token is destroyed as a result of battle, inflict 500 points of damage to your opponent\'s Life Points.',
            image_url: 'https://images.ygoprodeck.com/images/cards/86801872.jpg',
            frame: 'token',
            archetype: null,
            cardType: 'Monster',
            alter_name: null,
            code: '86801872',
            rarity: 'common',
            limit: 3,
            race: 'Reptile',
            effectTrait: true
        },
        // Synthetic Seraphim Token
        {
            name: 'Synthetic Seraphim Token',
            password: '16946850',
            description: 'This card can be used as a "Synthetic Seraphim Token".\n\n\n*If used for another Token, apply that Token\'s Type/Attribute/Level/ATK/DEF.',
            image_url: 'https://images.ygoprodeck.com/images/cards/16946850.jpg',
            frame: 'token',
            archetype: 'Counter Fairy',
            cardType: 'Monster',
            alter_name: null,
            code: '16946850',
            rarity: 'common',
            limit: 3,
            race: 'Fairy',
            effectTrait: true
        }
    ];

    const t = await sequelize.transaction();
    try {
        for (const token of tokens) {
            // Eliminar la card existente con el mismo code (si existe)
            await Card.destroy({ where: { code: token.code }, transaction: t });

            await Card.create({
                name: token.name,
                code: token.code,
                description: token.description,
                image_url: token.image_url,
                password: token.password,
                rarity: token.rarity,
                limit: token.limit,
                frame: token.frame,
                archetype: token.archetype,
                cardType: token.cardType,
                alter_name: token.alter_name
            }, { transaction: t })
                .then(async (dbCard) => {
                    if (dbCard.cardType === 'Monster' || dbCard.frame === 'token') {
                        await MonsterCard.create({
                            cardId: dbCard.id,
                            attribute: 'DIVINE',
                            type: token.race,
                            effectTrait: token.effectTrait,
                            summonMechanic: null,
                            ability: null,
                            level: 0,
                            attack: null,
                            defense: null
                        }, { transaction: t });
                        console.log(`[OK] Token importado: ${dbCard.name}`);
                    }
                });
        }
        await t.commit();
        console.log('Tokens insertados correctamente.');
    } catch (err) {
        await t.rollback();
        console.error('Error al insertar tokens:', err);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
