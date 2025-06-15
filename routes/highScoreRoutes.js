import { Router } from 'express';
import HighScoreController from '../controllers/HighScoreController.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

router.get('/', HighScoreController.getAllHighScores);
router.get('/:id', validateIdParam, HighScoreController.getHighScoreById);
router.get('/category/:category', HighScoreController.getHighScoresByCategory);

export default router;