// Rutas para búsqueda semántica visual con CLIP
import { Router } from 'express';
import SemanticSearchController from '../controllers/SemanticSearchController.js';

const router = Router();

// Buscar cartas por descripción visual
// Ejemplo: GET /api/semantic-search?query=vestido rojo&limit=10
router.get('/', SemanticSearchController.searchByVisualDescription);

// Obtener estadísticas del sistema
router.get('/stats', SemanticSearchController.getSemanticSearchStats);

// Generar embeddings CLIP (proceso en background)
router.post('/generate-embeddings', SemanticSearchController.generateClipEmbeddings);

// Probar el sistema con consultas de ejemplo
router.get('/test', SemanticSearchController.testSemanticSearch);

export default router;
