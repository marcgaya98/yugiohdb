'use strict';

/**
 * Migración segura: convierte la primary key y foreign key de ejemplo de INTEGER a UUID.
 * - Crea nuevas columnas UUID.
 * - Copia los datos existentes.
 * - Actualiza claves foráneas.
 * - Elimina columnas antiguas.
 * - Renombra las columnas nuevas.
 * 
 * NOTA: Adaptar nombres de tabla y columnas según el caso real.
 */

export async function up(queryInterface, Sequelize) {
    // 1. Añadir columnas UUID nuevas
    await queryInterface.addColumn('ejemplo', 'id_uuid', {
        type: Sequelize.UUID,
        allowNull: true
    });
    await queryInterface.addColumn('ejemplo', 'character_id_uuid', {
        type: Sequelize.UUID,
        allowNull: true
    });

    // 2. Crear tabla temporal para mapear ids antiguos a nuevos UUID
    await queryInterface.sequelize.query(`
    CREATE TEMPORARY TABLE ejemplo_id_map (
      old_id INT,
      new_id CHAR(36)
    );
  `);

    // 3. Asignar UUIDs y guardar el mapeo
    await queryInterface.sequelize.query(`
    UPDATE ejemplo SET id_uuid = (SELECT UUID());
  `);
    await queryInterface.sequelize.query(`
    INSERT INTO ejemplo_id_map (old_id, new_id)
    SELECT id, id_uuid FROM ejemplo;
  `);

    // 4. Actualizar claves foráneas en esta tabla y en tablas relacionadas
    // (Ejemplo solo para character_id, repite para otras tablas relacionadas)
    await queryInterface.sequelize.query(`
    UPDATE ejemplo e
    JOIN ejemplo_id_map m ON e.character_id = m.old_id
    SET e.character_id_uuid = m.new_id;
  `);

    // Si hay otras tablas con FK a ejemplo.id, actualízalas aquí usando el mapeo

    // 5. Eliminar constraints antiguos
    await queryInterface.removeConstraint('ejemplo', 'PRIMARY');
    // ...elimina otras foreign keys si es necesario...

    // 6. Eliminar columnas antiguas y renombrar las nuevas
    await queryInterface.removeColumn('ejemplo', 'id');
    await queryInterface.renameColumn('ejemplo', 'id_uuid', 'id');
    await queryInterface.removeColumn('ejemplo', 'character_id');
    await queryInterface.renameColumn('ejemplo', 'character_id_uuid', 'character_id');

    // 7. Volver a crear constraints
    await queryInterface.changeColumn('ejemplo', 'id', {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    });
    // ...recrear foreign keys aquí...

    // 8. Eliminar tabla temporal
    await queryInterface.sequelize.query(`DROP TEMPORARY TABLE ejemplo_id_map;`);
}

export async function down(queryInterface, Sequelize) {
    // El down sería el proceso inverso, pero revertir de UUID a INTEGER puede causar pérdida de datos.
    // Se recomienda solo para entornos de desarrollo.
    // ...implementación opcional...
}
