import { Router } from 'express';
import cardRoutes from './cardRoutes.js';
import packRoutes from './packRoutes.js';
import characterRoutes from './characterRoutes.js';
import deckRoutes from './deckRoutes.js';
import obtentionRoutes from './obtentionRoutes.js';
import iconRoutes from './iconRoutes.js';
import ygoprodeckRoutes from './ygoprodeckRoutes.js';
import gameStatsRoutes from './gameStatsRoutes.js';

const router = Router();

// Registra todas las rutas
router.use('/card', cardRoutes);
router.use('/pack', packRoutes);
router.use('/character', characterRoutes);
router.use('/deck', deckRoutes);
router.use('/obtention', obtentionRoutes);
router.use('/game-stats', gameStatsRoutes); // Rutas unificadas de bonus, challenges y high scores
router.use('/icon', iconRoutes);
router.use('/ygoprodeck', ygoprodeckRoutes);

export default router;