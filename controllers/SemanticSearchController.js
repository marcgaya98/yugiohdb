// Controlador para búsqueda semántica visual con CLIP
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import Card from '../models/Card.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

class SemanticSearchController {
    // Buscar cartas por descripción visual (ej: "vestido rojo", "playa tropical")
    async searchByVisualDescription(req, res) {
        try {
            const { query, limit = 20 } = req.query;

            if (!query || query.trim().length === 0) {
                return res.status(400).json({
                    error: 'Se requiere parámetro "query" con la descripción visual',
                    examples: [
                        'vestido rojo',
                        'dragón azul',
                        'playa tropical',
                        'guerrero con armadura',
                        'magia oscura',
                        'espada brillante'
                    ]
                });
            }

            const description = query.trim();
            console.log(`🔍 API: Búsqueda semántica para: "${description}"`);

            // Verificar que hay embeddings disponibles
            const stats = await ClipEmbeddingService.getEmbeddingStats();
            if (stats.cardsWithClipEmbedding === 0) {
                return res.status(503).json({
                    error: 'Sistema de búsqueda semántica no disponible',
                    message: 'No hay embeddings CLIP generados. Contacta al administrador.',
                    stats
                });
            }

            // Buscar cartas similares
            const similarities = await ClipEmbeddingService.searchByVisualDescription(
                description,
                parseInt(limit)
            );

            if (similarities.length === 0) {
                return res.json({
                    query: description,
                    resultsCount: 0,
                    results: [],
                    message: `No se encontraron cartas visualmente similares a "${description}"`,
                    stats
                });
            }

            // Obtener detalles completos de las cartas
            const cardIds = similarities.map(item => item.cardId);
            const cards = await Card.findAll({
                where: { id: cardIds }
            });

            // Combinar resultados con detalles y URLs de imágenes
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const results = similarities.map(item => {
                const card = cards.find(c => c.id.toString() === item.cardId);
                if (!card) return null;

                const normalizedPassword = normalizePasswordForUrl(card.password);

                return {
                    ...card.toJSON(),
                    similarityScore: Math.round(item.similarity * 100),
                    searchQuery: description,
                    images: {
                        normal: `${baseUrl}/images/cards/normal/${normalizedPassword}.jpg`,
                        small: `${baseUrl}/images/cards/small/${normalizedPassword}.jpg`,
                        cropped: `${baseUrl}/images/cards/cropped/${normalizedPassword}.jpg`,
                        normal_webp: `${baseUrl}/images/cards/normal_webp/${normalizedPassword}.webp`,
                        small_webp: `${baseUrl}/images/cards/small_webp/${normalizedPassword}.webp`,
                        cropped_webp: `${baseUrl}/images/cards/cropped_webp/${normalizedPassword}.webp`
                    }
                };
            }).filter(Boolean);

            res.json({
                query: description,
                resultsCount: results.length,
                results,
                stats: {
                    searchTime: new Date().toISOString(),
                    totalEmbeddings: stats.cardsWithClipEmbedding,
                    completionPercentage: stats.completionPercentage
                }
            });

        } catch (error) {
            console.error('❌ Error in semantic visual search:', error);
            res.status(500).json({
                error: 'Error en búsqueda semántica visual',
                message: error.message
            });
        }
    }

    // Generar embeddings CLIP para todas las cartas (proceso en background)
    async generateClipEmbeddings(req, res) {
        try {
            const { batchSize = 10 } = req.query;

            // Verificar estado actual
            const stats = await ClipEmbeddingService.getEmbeddingStats();

            if (stats.cardsWithClipEmbedding >= stats.cardsWithPassword) {
                return res.json({
                    message: 'Todos los embeddings CLIP ya están generados',
                    stats
                });
            }

            // Responder inmediatamente
            res.json({
                message: 'Generación de embeddings CLIP iniciada en segundo plano',
                note: 'Este proceso puede tardar varios minutos. Consulta los logs del servidor.',
                currentStats: stats,
                estimatedTime: `${Math.ceil((stats.cardsWithPassword - stats.cardsWithClipEmbedding) / parseInt(batchSize))} minutos aprox.`
            });

            // Ejecutar en background
            console.log('🚀 Iniciando generación de embeddings CLIP en background...');
            ClipEmbeddingService.generateAllImageEmbeddings(parseInt(batchSize))
                .then(result => {
                    console.log(`🎉 Embeddings CLIP completados: ${result.processed} generados, ${result.errors} errores`);
                })
                .catch(error => {
                    console.error('❌ Error generando embeddings CLIP:', error);
                });

        } catch (error) {
            console.error('❌ Error initiating CLIP embeddings generation:', error);
            res.status(500).json({
                error: 'Error iniciando generación de embeddings',
                message: error.message
            });
        }
    }

    // Obtener estadísticas del sistema de búsqueda semántica
    async getSemanticSearchStats(req, res) {
        try {
            const stats = await ClipEmbeddingService.getEmbeddingStats();

            res.json({
                system: 'Búsqueda Semántica Visual con CLIP',
                model: 'Xenova/clip-vit-base-patch32',
                ...stats,
                status: stats.cardsWithClipEmbedding > 0 ? 'available' : 'not_ready',
                capabilities: [
                    'Búsqueda por descripción visual en texto natural',
                    'Encuentra cartas por contenido visual independiente del nombre',
                    'Ejemplos: "vestido rojo", "dragón volando", "playa tropical"'
                ]
            });
        } catch (error) {
            console.error('❌ Error getting semantic search stats:', error);
            res.status(500).json({
                error: 'Error obteniendo estadísticas',
                message: error.message
            });
        }
    }

    // Probar el sistema con consultas de ejemplo
    async testSemanticSearch(req, res) {
        try {
            const testQueries = [
                'vestido rojo',
                'dragón azul',
                'guerrero con armadura',
                'magia oscura'
            ];

            console.log('🧪 Ejecutando pruebas de búsqueda semántica...');

            const results = [];
            for (const query of testQueries) {
                try {
                    const similarities = await ClipEmbeddingService.searchByVisualDescription(query, 3);
                    results.push({
                        query,
                        resultsCount: similarities.length,
                        topResults: similarities.slice(0, 3).map(item => ({
                            name: item.name,
                            similarity: Math.round(item.similarity * 100)
                        }))
                    });
                } catch (error) {
                    results.push({
                        query,
                        error: error.message
                    });
                }
            }

            res.json({
                message: 'Pruebas de búsqueda semántica completadas',
                testResults: results,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Error in semantic search test:', error);
            res.status(500).json({
                error: 'Error en pruebas de búsqueda semántica',
                message: error.message
            });
        }
    }
}

export default new SemanticSearchController();
