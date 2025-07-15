/**
 * Migración para crear la tabla fusion_material que relaciona cartas de fusión con sus materiales.
 */

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('fusion_material', {
        fusionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'card', key: 'id' },
            primaryKey: true,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'ID de la carta de fusión'
        },
        materialId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'card', key: 'id' },
            primaryKey: true,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'ID de la carta material'
        }
    });
    await queryInterface.addIndex('fusion_material', ['fusionId']);
    await queryInterface.addIndex('fusion_material', ['materialId']);
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fusion_material');
}
