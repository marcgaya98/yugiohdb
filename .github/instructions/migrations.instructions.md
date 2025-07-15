---
applyTo: "migrations/*.js"
---
# Instrucciones para migraciones Sequelize

- Cada migración debe tener un propósito claro y estar bien documentada en el encabezado.
- Usar funciones auxiliares para operaciones repetitivas (por ejemplo, safeAddIndex, safeRemoveIndex).
- Manejar errores con try/catch y mostrar advertencias claras si una operación no se puede realizar (índice ya existe/no existe).
- Nombrar explícitamente los índices cuando sea relevante para evitar ambigüedades entre entornos.
- El método `up` debe ser idempotente y seguro para ejecutar varias veces.
- El método `down` debe revertir exactamente los cambios hechos en `up`.
- Mantener el código limpio y legible, siguiendo principios de Clean Code y SOLID.
- Incluir comentarios explicativos para cada bloque relevante.
- No realizar cambios destructivos sin validación previa.
- Usar arrays y bucles para operaciones sobre múltiples índices o columnas.
- Exportar el módulo correctamente.

## Ejemplo de estructura profesional:
```js
/**
 * Añade/elimina índices avanzados para optimizar búsquedas.
 * Ejecutar con: npx sequelize-cli db:migrate
 */

/**
 * Añade un índice de forma segura.
 */
async function safeAddIndex(queryInterface, table, fields, options = {}) {
  try {
    await queryInterface.addIndex(table, fields, options);
  } catch (e) {
    console.warn(`No se pudo crear el índice ${JSON.stringify(fields)} en ${table}: ${e.message}`);
  }
}

/**
 * Elimina un índice de forma segura.
 */
async function safeRemoveIndex(queryInterface, table, fields) {
  try {
    await queryInterface.removeIndex(table, fields);
  } catch (e) {
    console.warn(`No se pudo eliminar el índice ${JSON.stringify(fields)} en ${table}: ${e.message}`);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // ...
  },
  async down(queryInterface, Sequelize) {
    // ...
  }
};
```
