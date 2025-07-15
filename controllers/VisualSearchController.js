import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';
import VisualSearchService from '../services/VisualSearchService.js';
import CardEmbeddingService from '../services/CardEmbeddingService.js';

// Configurar multer para subida de imágenes
const upload = multer({
    dest: 'uploads/temp/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no soportado'));
        }
        cb(null, true);
    }
});

class VisualSearchController {
    // Middleware para manejar subida de imágenes
    uploadMiddleware() {
        return upload.single('image');
    }

    // Buscar cartas similares a una carta específica
    async findSimilarCards(req, res) {
        try {
            const { cardId } = req.params;
            const { limit = 12 } = req.query;

            if (!cardId) {
                return res.status(400).json({
                    error: 'Se requiere ID de carta para búsqueda visual'
                });
            }

            // Obtener resultados de similitud
            const similarityResults = await VisualSearchService.findSimilarCards(
                cardId,
                parseInt(limit)
            );

            // Obtener detalles completos de las cartas
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const similarCards = await VisualSearchService.getSimilarCardsWithDetails(
                similarityResults,
                baseUrl
            );

            res.json({
                referenceCardId: cardId,
                resultsCount: similarCards.length,
                results: similarCards
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error en búsqueda visual',
                message: error.message
            });
        }
    }

    // Buscar por imagen subida
    async searchByUploadedImage(req, res) {
        try {
            // Archivo subido por multer
            if (!req.file) {
                return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
            }

            const { limit = 12 } = req.query;
            const tempImagePath = req.file.path;

            // Buscar cartas similares a la imagen subida
            const similarityResults = await VisualSearchService.findSimilarCardsByUploadedImage(
                tempImagePath,
                parseInt(limit)
            );

            // Obtener detalles completos
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const similarCards = await VisualSearchService.getSimilarCardsWithDetails(
                similarityResults,
                baseUrl
            );

            // Limpiar archivo temporal
            await fs.remove(tempImagePath);

            res.json({
                resultsCount: similarCards.length,
                results: similarCards
            });
        } catch (error) {
            // Limpiar archivo en caso de error
            if (req.file?.path) {
                await fs.remove(req.file.path).catch(() => { });
            }

            res.status(500).json({
                error: 'Error en búsqueda por imagen',
                message: error.message
            });
        }
    }

    // Buscar cartas similares por estilo visual (por ejemplo Ghost Rare)
    async searchByVisualStyle(req, res) {
        try {
            const { style, limit = 20 } = req.query;

            if (!style) {
                return res.status(400).json({
                    error: 'Se requiere un estilo visual para la búsqueda'
                });
            }

            // Mapeo de estilos a cartas representativas
            const styleExamples = {
                'ghost-rare': ['82044280', '23995346'], // IDs de cartas Ghost Rare
                'dark-magician': ['46986414', '38033121'], // Variantes de Dark Magician
                'blue-dragon': ['89631139', '38517737'] // Blue-Eyes y similares
            };

            const exampleIds = styleExamples[style.toLowerCase()] || [];

            if (exampleIds.length === 0) {
                return res.status(400).json({
                    error: 'Estilo visual no reconocido'
                });
            }

            // Obtener promedio de embeddings de los ejemplos
            const embeddings = [];
            for (const id of exampleIds) {
                const embedding = await CardEmbeddingService.getEmbedding(id);
                if (embedding) embeddings.push(embedding);
            }

            if (embeddings.length === 0) {
                return res.status(400).json({
                    error: 'No se encontraron embeddings para el estilo especificado'
                });
            }

            // Calcular embedding promedio
            const avgEmbedding = [];
            const dimension = embeddings[0].length;

            for (let i = 0; i < dimension; i++) {
                let sum = 0;
                for (const emb of embeddings) {
                    sum += emb[i];
                }
                avgEmbedding.push(sum / embeddings.length);
            }

            // Buscar similares al promedio
            const similarityResults = await VisualSearchService.findSimilarCardsByEmbedding(
                avgEmbedding,
                parseInt(limit),
                exampleIds
            );

            // Obtener detalles
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const similarCards = await VisualSearchService.getSimilarCardsWithDetails(
                similarityResults,
                baseUrl
            );

            res.json({
                style,
                exampleCards: exampleIds,
                resultsCount: similarCards.length,
                results: similarCards
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error en búsqueda por estilo visual',
                message: error.message
            });
        }
    }

    // Buscar cartas por texto y agrupar por similitud visual
    async searchByTextAndVisualSimilarity(req, res) {
        try {
            const { query, limit = 20 } = req.query;

            if (!query || query.trim().length === 0) {
                return res.status(400).json({
                    error: 'Se requiere un término de búsqueda'
                });
            }

            // Buscar cartas que coincidan con el texto y agrupar por similitud visual
            const similarityResults = await VisualSearchService.searchByTextAndVisualSimilarity(
                query.trim(),
                parseInt(limit)
            );

            if (similarityResults.length === 0) {
                return res.json({
                    query: query.trim(),
                    resultsCount: 0,
                    results: [],
                    message: 'No se encontraron cartas que coincidan con el término de búsqueda'
                });
            }

            // Obtener detalles completos
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const similarCards = await VisualSearchService.getSimilarCardsWithDetails(
                similarityResults,
                baseUrl
            );

            res.json({
                query: query.trim(),
                resultsCount: similarCards.length,
                results: similarCards,
                message: `Encontradas ${similarCards.length} cartas visualmente similares para "${query}"`
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error en búsqueda por texto y similitud visual',
                message: error.message
            });
        }
    }
}

export default new VisualSearchController();