'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('card', 'visual_embedding', {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Vector de embedding visual para búsqueda por similitud (JSON array)'
    });
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('card', 'visual_embedding');
}
