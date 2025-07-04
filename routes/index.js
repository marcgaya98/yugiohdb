import { Router } from 'express';
import cardRoutes from './cardRoutes.js';
import packRoutes from './packRoutes.js';
import characterRoutes from './characterRoutes.js';
import deckRoutes from './deckRoutes.js';
import obtentionRoutes from './obtentionRoutes.js';
import iconRoutes from './iconRoutes.js';
// import ygoprodeckRoutes from './ygoprodeckRoutes.js'; // Comentado temporalmente - archivo no existe
import gameStatsRoutes from './gameStatsRoutes.js';
import imageRoutes from './imageRoutes.js';

const router = Router();

// Registra todas las rutas
router.use('/cards', cardRoutes);
router.use('/packs', packRoutes);
router.use('/characters', characterRoutes);
router.use('/decks', deckRoutes);
router.use('/obtentions', obtentionRoutes);
router.use('/game-stats', gameStatsRoutes);
router.use('/icons', iconRoutes);
// router.use('/ygoprodeck', ygoprodeckRoutes); // Comentado temporalmente
router.use('/images', imageRoutes);

export default router;