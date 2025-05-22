import { Router } from 'express';
const router = Router();
import { getAllPacks, getPackById, createPack, updatePack, deletePack } from '../controllers/packController.js';

router.get('/', getAllPacks);
router.get('/:id', getPackById);
router.post('/', createPack);
router.put('/:id', updatePack);
router.delete('/:id', deletePack);

export default router;