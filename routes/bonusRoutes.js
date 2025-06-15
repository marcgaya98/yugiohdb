import { Router } from 'express';
import BonusController from '../controllers/BonusController.js';
import { validateIdParam } from '../middleware/validateParams.js';

const router = Router();

router.get('/', BonusController.getAllBonuses);
router.get('/:id', validateIdParam, BonusController.getBonusById);
router.get('/category/:category', BonusController.getBonusesByCategory);

export default router;