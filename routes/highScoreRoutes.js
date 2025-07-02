import { Router } from 'express';
import HighScoreController from '../controllers/HighScoreController.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

router.get('/', HighScoreController.getAllHighScores);
router.get('/category/:category', HighScoreController.getHighScoresByCategory);
router.get('/:id', validateIdParam, HighScoreController.getHighScoreById);

export default router;