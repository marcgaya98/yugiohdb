// Routes for YGOPRODeck API
import express from 'express';
import YGOPRODeckController from '../controllers/YGOPRODeckController.js';

const router = express.Router();

// Card search routes
router.get('/cards/search', YGOPRODeckController.searchCards);
router.get('/cards/random', YGOPRODeckController.getRandomCard);
router.get('/cards/konami/:konamiId', YGOPRODeckController.getCardByKonamiId);
router.get('/cards/password/:password', YGOPRODeckController.getCardByPassword);
router.get('/cards/:id', YGOPRODeckController.getCardById);
router.get('/toon-monsters', YGOPRODeckController.getToonMonsters);

// Metadata routes
router.get('/sets', YGOPRODeckController.getCardSets);
router.get('/archetypes', YGOPRODeckController.getCardArchetypes);

export default router;
