import { Router } from 'express';
import CardController from '../controllers/CardController.js';
import { validateIdParam, validatePaginationParams } from '../middleware/validateParams.js';


const router = Router();

// Rutas para cartas
router.get('/', validatePaginationParams, (req, res) => CardController.getAllCards(req, res));
router.get('/:id', validateIdParam, (req, res) => CardController.getCardById(req, res));

export default router;
