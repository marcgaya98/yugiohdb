import { Router } from 'express';
import PackController from '../controllers/PackController.js';

const router = Router();

// Rutas para packs
router.get('/', PackController.getAllPacks);
router.get('/:id', PackController.getPackById);
router.get('/:id/cards', PackController.getPackCards);

export default router;