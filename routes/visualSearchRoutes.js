import { Router } from 'express';
import SimpleVisualSearchController from '../controllers/SimpleVisualSearchController.js';

const router = Router();

// Búsqueda por ID de carta (similar a...)
router.get('/similar/:cardId', SimpleVisualSearchController.findSimilarCards);

// Búsqueda por imagen subida
router.post(
    '/upload',
    SimpleVisualSearchController.uploadMiddleware(),
    SimpleVisualSearchController.searchByUploadedImage
);

// Búsqueda por estilo visual
router.get('/style', SimpleVisualSearchController.searchByStyle);

// Búsqueda por texto con similitud visual
router.get('/text', SimpleVisualSearchController.searchByText);

export default router;