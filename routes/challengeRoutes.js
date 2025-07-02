import { Router } from 'express';
import ChallengeController from '../controllers/ChallengeController.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

router.get('/', ChallengeController.getAllChallenges);
router.get('/category/:category', ChallengeController.getChallengesByCategory);
router.get('/:id', validateIdParam, ChallengeController.getChallengeById);

export default router;