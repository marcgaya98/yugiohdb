// migration: 20250708-deck-uuid.js
'use strict';

/**
 * Cambia la columna id de la tabla deck de INT autoincrement a UUID v4.
 * NOTA: Esta migración es destructiva si existen datos previos. Haz backup antes de ejecutar en producción.
 */

export async function up(queryInterface, Sequelize) {
    // 1. Renombrar la columna actual para preservar datos (opcional, si quieres migrar datos manualmente)
    // await queryInterface.renameColumn('deck', 'id', 'id_old');

    // 2. Eliminar la clave primaria y la columna id actual
    await queryInterface.removeConstraint('deck', 'PRIMARY');
    await queryInterface.removeColumn('deck', 'id');

    // 3. Crear la nueva columna id como UUID v4
    await queryInterface.addColumn('deck', 'id', {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        comment: 'ID único del deck (UUID v4)'
    });

    // 4. Volver a crear la clave primaria
    await queryInterface.addConstraint('deck', {
        fields: ['id'],
        type: 'primary key',
        name: 'PRIMARY'
    });
}

export async function down(queryInterface, Sequelize) {
    // Revertir a INT autoincrement (destructivo)
    await queryInterface.removeConstraint('deck', 'PRIMARY');
    await queryInterface.removeColumn('deck', 'id');
    await queryInterface.addColumn('deck', 'id', {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único del deck (int autoincrement)'
    });
    await queryInterface.addConstraint('deck', {
        fields: ['id'],
        type: 'primary key',
        name: 'PRIMARY'
    });
}
