// migration: 20250708-create-test-uuid.js
'use strict';

/**
 * Crea la tabla test_uuid con id UUID como primaryKey
 */

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_uuid', {
        id: {
            type: Sequelize.DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.literal('(UUID())'),
            comment: 'ID único (UUID v4)'
        },
        name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            comment: 'Nombre de prueba'
        }
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('test_uuid');
}
