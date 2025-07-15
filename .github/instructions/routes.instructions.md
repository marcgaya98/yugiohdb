---
applyTo: "**/routes/*.js"
---
# Instrucciones para rutas

- Importar Router desde express
- Agrupar rutas por recurso y funcionalidad
- Usar middleware de validación cuando sea necesario
- Mantener rutas RESTful:
  - GET para obtener recursos
  - POST para crear recursos
  - PUT para actualizar recursos completos
  - PATCH para actualizaciones parciales
  - DELETE para eliminar recursos
- Utilizar nombres claros y descriptivos para los endpoints
- Documentar rutas con comentarios

## Ejemplo de estructura:
```js
import { Router } from 'express';
import Controller from '../controllers/Controller.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

// Rutas básicas
router.get('/', Controller.getAll);
router.get('/:id', validateIdParam, Controller.getById);
router.post('/', Controller.create);
router.put('/:id', validateIdParam, Controller.update);
router.delete('/:id', validateIdParam, Controller.delete);

// Rutas adicionales específicas
router.get('/:id/related', validateIdParam, Controller.getRelated);

export default router;
```