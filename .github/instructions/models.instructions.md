---
applyTo: "**/models/*.js"
---
# Instrucciones para modelos Sequelize

- Todos los modelos deben extender Model de Sequelize
- Definir siempre primaryKey y tableName
- Incluir comentarios para cada campo con el tipo y propósito
- Usar DataTypes específicos (no STRING genérico)
- No definir asociaciones en el modelo, sino en associations.js
- Exportar el modelo como default
- Seguir el patrón:
  ```js
  class NombreModelo extends Model {}
  
  NombreModelo.init({
    // campos
  }, {
    sequelize,
    modelName: 'nombre_modelo',
    tableName: 'nombre_tabla',
    timestamps: false,
    indexes: [
      // índices si son necesarios
    ]
  });
  
  export default NombreModelo;
  ```