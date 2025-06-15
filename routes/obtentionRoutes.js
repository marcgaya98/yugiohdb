import { Router } from 'express';
import ObtentionController from '../controllers/ObtentionController.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

// Rutas para métodos de obtención
router.get('/methods', ObtentionController.getAllObtentionMethods);
router.get('/methods/:method', ObtentionController.getCardsByMethod);
router.get('/methods/:method/exclusive', ObtentionController.getExclusiveCards);
router.get('/cards/:cardId', validateIdParam, ObtentionController.getObtentionMethodsForCard);

export default router;