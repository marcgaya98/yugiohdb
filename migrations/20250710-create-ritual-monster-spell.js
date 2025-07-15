/**
 * Migración para crear la tabla ritual_monster_spell que relaciona monstruos de ritual con sus cartas de Ritual Spell.
 * Sin timestamps, clave primaria compuesta.
 */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('ritual_monster_spell', {
        ritualMonsterId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'card', key: 'id' },
            primaryKey: true,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'ID del monstruo de ritual'
        },
        ritualSpellId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'card', key: 'id' },
            primaryKey: true,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'ID de la carta Ritual Spell'
        }
    });
    await queryInterface.addIndex('ritual_monster_spell', ['ritualMonsterId']);
    await queryInterface.addIndex('ritual_monster_spell', ['ritualSpellId']);
    await queryInterface.addConstraint('ritual_monster_spell', {
        fields: ['ritualMonsterId', 'ritualSpellId'],
        type: 'unique',
        name: 'unique_ritual_monster_spell_pair'
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ritual_monster_spell');
}