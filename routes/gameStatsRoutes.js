import { Router } from 'express';
import GameStatsController from '../controllers/GameStatsController.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

// Rutas para Bonus
router.get('/bonus', GameStatsController.getAllBonuses);
router.get('/bonus/category/:category', GameStatsController.getBonusesByCategory);
router.get('/bonus/:id', validateIdParam, GameStatsController.getBonusById);

// Rutas para Challenges
router.get('/challenge', GameStatsController.getAllChallenges);
router.get('/challenge/category/:category', GameStatsController.getChallengesByCategory);
router.get('/challenge/:id', validateIdParam, GameStatsController.getChallengeById);

// Rutas para High Scores
router.get('/high-score', GameStatsController.getAllHighScores);
router.get('/high-score/category/:category', GameStatsController.getHighScoresByCategory);
router.get('/high-score/:id', validateIdParam, GameStatsController.getHighScoreById);

export default router;
