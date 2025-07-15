// Worker thread para generar embeddings CLIP en paralelo
import { parentPort, workerData } from 'worker_threads';
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import Card from '../models/Card.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';
import path from 'path';

// Función para procesar un lote de cartas
async function processCardBatch(cards) {
    const results = [];

    try {
        // Inicializar CLIP en este worker
        await ClipEmbeddingService.initialize();

        for (const cardData of cards) {
            try {
                const normalizedPassword = normalizePasswordForUrl(cardData.password);
                const imagePath = path.join(process.cwd(), 'public/images/cards/cropped', `${normalizedPassword}.jpg`);

                // Generar embedding
                const embedding = await ClipEmbeddingService.generateImageEmbedding(imagePath);

                if (embedding) {
                    results.push({
                        success: true,
                        cardId: cardData.id,
                        name: cardData.name,
                        embedding: embedding
                    });
                } else {
                    results.push({
                        success: false,
                        cardId: cardData.id,
                        name: cardData.name,
                        error: 'No embedding generated'
                    });
                }

            } catch (error) {
                results.push({
                    success: false,
                    cardId: cardData.id,
                    name: cardData.name,
                    error: error.message
                });
            }
        }

    } catch (error) {
        // Error inicializando CLIP
        parentPort.postMessage({
            type: 'error',
            error: `Error inicializando CLIP en worker: ${error.message}`
        });
        return;
    }

    // Enviar resultados de vuelta al hilo principal
    parentPort.postMessage({
        type: 'results',
        results: results
    });
}

// Procesar el lote asignado a este worker
if (workerData && workerData.cards) {
    processCardBatch(workerData.cards);
}
