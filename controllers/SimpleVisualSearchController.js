// Controlador simplificado para búsqueda visual usando ClipEmbeddingService
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';

class SimpleVisualSearchController {
    // Búsqueda por texto con similitud visual
    async searchByText(req, res) {
        try {
            const { query, limit = 20 } = req.query;

            if (!query || query.trim().length === 0) {
                return res.status(400).json({
                    error: 'Se requiere una consulta de búsqueda'
                });
            }

            console.log(`🔍 Búsqueda visual por texto: "${query}"`);

            // Usar ClipEmbeddingService que ya sabemos que funciona
            const results = await ClipEmbeddingService.searchByVisualDescription(
                query.trim(),
                parseInt(limit)
            );

            console.log(`✅ Encontrados ${results.length} resultados`);

            // Formatear resultados para el frontend
            const formattedResults = results.map(result => ({
                id: result.cardId,
                cardId: result.cardId,
                name: result.name,
                password: result.password,
                cardType: result.cardType,
                archetype: result.archetype,
                similarity: result.similarity,
                similarityScore: Math.round(result.similarity * 100),
                imageUrl: `/images/cards/cropped/${result.password}.jpg`,
                smallImageUrl: `/images/cards/small/${result.password}.jpg`
            }));

            return res.json({
                query: query.trim(),
                resultsCount: formattedResults.length,
                results: formattedResults,
                message: `Encontradas ${formattedResults.length} cartas para "${query}"`
            });

        } catch (error) {
            console.error('❌ Error en búsqueda visual por texto:', error);
            return res.status(500).json({
                error: 'Error en búsqueda visual',
                message: error.message
            });
        }
    }

    // Buscar cartas similares a una carta específica (implementación simple)
    async findSimilarCards(req, res) {
        try {
            const { cardId } = req.params;
            const { limit = 12 } = req.query;

            if (!cardId) {
                return res.status(400).json({
                    error: 'Se requiere ID de carta'
                });
            }

            console.log(`🔍 Buscando similares a carta ID: ${cardId}`);

            // Por ahora, devolver mensaje de que está en desarrollo
            return res.json({
                referenceCardId: cardId,
                resultsCount: 0,
                results: [],
                message: 'Función de similitud por ID en desarrollo. Usa la búsqueda por texto.'
            });

        } catch (error) {
            console.error('❌ Error buscando cartas similares:', error);
            return res.status(500).json({
                error: 'Error buscando cartas similares',
                message: error.message
            });
        }
    }

    // Búsqueda por estilo (implementación simple)
    async searchByStyle(req, res) {
        try {
            const { style, limit = 20 } = req.query;

            if (!style) {
                return res.status(400).json({
                    error: 'Se requiere un estilo'
                });
            }

            console.log(`🎨 Búsqueda por estilo: ${style}`);

            // Mapear estilos a consultas de búsqueda
            const styleQueries = {
                'ghost-rare': 'ethereal ghostly transparent',
                'dark-magician': 'dark magician spellcaster purple robe',
                'blue-dragon': 'blue dragon white powerful'
            };

            const query = styleQueries[style.toLowerCase()] || style;

            // Usar la búsqueda por texto
            const results = await ClipEmbeddingService.searchByVisualDescription(
                query,
                parseInt(limit)
            );

            const formattedResults = results.map(result => ({
                id: result.cardId,
                cardId: result.cardId,
                name: result.name,
                password: result.password,
                cardType: result.cardType,
                archetype: result.archetype,
                similarity: result.similarity,
                similarityScore: Math.round(result.similarity * 100),
                imageUrl: `/images/cards/cropped/${result.password}.jpg`,
                smallImageUrl: `/images/cards/small/${result.password}.jpg`
            }));

            return res.json({
                style,
                query,
                resultsCount: formattedResults.length,
                results: formattedResults
            });

        } catch (error) {
            console.error('❌ Error en búsqueda por estilo:', error);
            return res.status(500).json({
                error: 'Error en búsqueda por estilo',
                message: error.message
            });
        }
    }

    // Búsqueda por imagen subida (placeholder)
    async searchByUploadedImage(req, res) {
        try {
            return res.json({
                resultsCount: 0,
                results: [],
                message: 'Función de búsqueda por imagen en desarrollo'
            });
        } catch (error) {
            console.error('❌ Error en búsqueda por imagen:', error);
            return res.status(500).json({
                error: 'Error en búsqueda por imagen',
                message: error.message
            });
        }
    }

    // Middleware placeholder para subida de imágenes
    uploadMiddleware() {
        return (req, res, next) => next();
    }
}

export default new SimpleVisualSearchController();
