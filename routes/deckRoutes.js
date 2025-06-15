import { Router } from 'express';
import DeckController from '../controllers/DeckController.js';

const router = Router();

// Rutas para mazos
router.get('/', DeckController.getAllDecks);
router.get('/:id', DeckController.getDeckById);
router.get('/:id/cards', DeckController.getDeckCards);

export default router;