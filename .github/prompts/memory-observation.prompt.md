---
mode: 'agent'
tools: ['add_observations', 'create_entities', 'create_relations']
description: 'Añade información contextual al grafo de conocimiento'
---
Crea una nueva entidad llamada `${input:entityName}` y añade las siguientes observaciones:

${input:observations}

Relaciona esta entidad con `${input:relatedEntity}` si corresponde.
