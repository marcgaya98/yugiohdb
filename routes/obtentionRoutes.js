import { Router } from 'express';
import ObtentionController from '../controllers/ObtentionController.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

// Rutas para métodos de obtención (compatibilidad legacy)
router.get('/methods', ObtentionController.getAllObtentionMethods);
router.get('/methods/:method', ObtentionController.getCardsByMethod);
router.get('/methods/:method/exclusive', ObtentionController.getExclusiveCards);
router.get('/cards/:cardId', validateIdParam, ObtentionController.getObtentionMethodsForCard);

// Nuevas rutas para métodos específicos de obtención
router.get('/packs', ObtentionController.getPackCards);
router.get('/packs/:packId', validateIdParam, ObtentionController.getPackCards);
router.get('/converter', ObtentionController.getConverterCards);
router.get('/characters', ObtentionController.getCharacterCards);
router.get('/characters/:characterId', validateIdParam, ObtentionController.getCharacterCards);
router.get('/tutorials', ObtentionController.getTutorialCards);
router.get('/tutorials/:day', ObtentionController.getTutorialCards);
router.get('/initial-deck', ObtentionController.getInitialDeckCards);
router.get('/sandwich', ObtentionController.getSandwichCards);
router.get('/cards/:cardId/all', validateIdParam, ObtentionController.getCardAllObtentionMethods);

export default router;