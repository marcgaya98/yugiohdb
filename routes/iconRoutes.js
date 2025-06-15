import { Router } from 'express';
import IconController from '../controllers/IconController.js';

const router = Router();

router.get('/', IconController.getAllIcons);
router.get('/category/:category', IconController.getIconsByCategory);
router.get('/specific/:category/:key', IconController.getIconByKey);

export default router;