---
mode: 'edit'
description: 'Crea un nuevo modelo Sequelize para una entidad'
---
Crea un modelo Sequelize para la entidad ${input:entityName} con los siguientes atributos:
${input:attributes}

Requisitos:
* Sintaxis ES Modules (import/export)
* Nombre del modelo en PascalCase
* Propiedades en camelCase
* Comentarios JSDoc
* Definición de asociaciones en [associations.js](../../models/associations.js)
* Validaciones e índices apropiados

Referencia: Modelos en [models/](../../models/)
