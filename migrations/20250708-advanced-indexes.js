// migration: 20250708-advanced-indexes.js
'use strict';

/**
 * Añade índices avanzados para optimizar búsquedas y filtrados en las tablas card, monster_card, spell_card y trap_card.
 * Uso de funciones auxiliares para mantener el código limpio y aplicar principios SOLID.
 */

/**
 * Añade un índice de forma segura, mostrando advertencia si ya existe.
 * @param {object} queryInterface - Interfaz de migración Sequelize
 * @param {string} table - Nombre de la tabla
 * @param {Array<string>} fields - Campos del índice
 */
async function safeAddIndex(queryInterface, table, fields) {
    try {
        await queryInterface.addIndex(table, fields);
    } catch (e) {
        console.warn(`No se pudo crear el índice ${JSON.stringify(fields)} en ${table}: ${e.message}`);
    }
}

export async function up(queryInterface, Sequelize) {
    // CARD
    const cardIndexes = [
        ['archetype'],
        ['rarity'],
        ['frame'],
        ['cardType'],
        ['limit'],
        ['password'],
        ['cardType', 'frame', 'archetype'],
        ['cardType', 'rarity', 'frame'],
        ['cardType', 'limit'],
        ['archetype', 'rarity']
    ];
    for (const idx of cardIndexes) {
        await safeAddIndex(queryInterface, 'card', idx);
    }
    // MONSTER_CARD
    const monsterCardIndexes = [
        ['attribute'],
        ['type'],
        ['level'],
        ['attack'],
        ['defense'],
        ['summonMechanic'],
        ['effectTrait'],
        ['ability'],
        ['level', 'attribute', 'type'],
        ['attack', 'defense'],
        ['type', 'attribute'],
        ['level', 'attack', 'defense']
    ];
    for (const idx of monsterCardIndexes) {
        await safeAddIndex(queryInterface, 'monster_card', idx);
    }
    // SPELL_CARD
    await safeAddIndex(queryInterface, 'spell_card', ['type']);
    // TRAP_CARD
    await safeAddIndex(queryInterface, 'trap_card', ['type']);
}
export async function down(queryInterface, Sequelize) {
    // CARD
    const cardIndexes = [
        ['archetype'],
        ['rarity'],
        ['frame'],
        ['cardType'],
        ['limit'],
        ['password'],
        ['cardType', 'frame', 'archetype'],
        ['cardType', 'rarity', 'frame'],
        ['cardType', 'limit'],
        ['archetype', 'rarity']
    ];
    for (const idx of cardIndexes) {
        try {
            await queryInterface.removeIndex('card', idx);
        } catch (e) {
            console.warn(`No se pudo eliminar el índice ${JSON.stringify(idx)} en card: ${e.message}`);
        }
    }
    // MONSTER_CARD
    const monsterCardIndexes = [
        ['attribute'],
        ['type'],
        ['level'],
        ['attack'],
        ['defense'],
        ['summonMechanic'],
        ['effectTrait'],
        ['ability'],
        ['level', 'attribute', 'type'],
        ['attack', 'defense'],
        ['type', 'attribute'],
        ['level', 'attack', 'defense']
    ];
    for (const idx of monsterCardIndexes) {
        try {
            await queryInterface.removeIndex('monster_card', idx);
        } catch (e) {
            console.warn(`No se pudo eliminar el índice ${JSON.stringify(idx)} en monster_card: ${e.message}`);
        }
    }
    // SPELL_CARD
    try {
        await queryInterface.removeIndex('spell_card', ['type']);
    } catch (e) {
        console.warn('No se pudo eliminar el índice [type] en spell_card:', e.message);
    }
    // TRAP_CARD
    try {
        await queryInterface.removeIndex('trap_card', ['type']);
    } catch (e) {
        console.warn('No se pudo eliminar el índice [type] en trap_card:', e.message);
    }
}
