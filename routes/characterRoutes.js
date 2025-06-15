import { Router } from 'express';
import CharacterController from '../controllers/CharacterController.js';
import { validateIdParam, validatePaginationParams } from '../middleware/validateParams.js';

const router = Router();

// Rutas para personajes
router.get('/', validatePaginationParams, CharacterController.getAllCharacters);
router.get('/:id', validateIdParam, CharacterController.getCharacterById);
router.get('/:id/decks', CharacterController.getCharacterDecks);

export default router;