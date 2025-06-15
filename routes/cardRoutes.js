import { Router } from 'express';
import CardController from '../controllers/CardController.js';
import { validateIdParam, validatePaginationParams } from '../middleware/validateParams.js';


const router = Router();

// Rutas para cartas
router.get('/', validatePaginationParams, CardController.getAllCards);
router.get('/:id', validateIdParam, CardController.getCardById);

export default router;
