import { Router } from 'express';
const router = Router();
import { getAllCards } from '../controllers/cardController.js';

router.get('/', getAllCards);

export default router;
