import CardEmbeddingService from './CardEmbeddingService.js';
import Card from '../models/Card.js';
import { Op } from 'sequelize';

class VisualSearchService {
    constructor() {
        this.embeddingsLoaded = false;
        this.cardIds = [];
    }

    // Calcular similitud coseno entre dos vectores
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Encontrar cartas similares por ID
    async findSimilarCards(cardId, limit = 12) {
        const referenceEmbedding = await CardEmbeddingService.getEmbedding(cardId);
        if (!referenceEmbedding) {
            throw new Error(`No se encontró embedding para carta con ID ${cardId}`);
        }

        return this.findSimilarCardsByEmbedding(referenceEmbedding, limit, [cardId]);
    }

    // Encontrar cartas similares por vector de embedding
    async findSimilarCardsByEmbedding(embedding, limit = 12, excludeIds = []) {
        // Usar el servicio de embeddings que ya maneja la BD
        return await CardEmbeddingService.findSimilarCardsByEmbedding(
            embedding,
            limit,
            excludeIds
        );
    }

    // Encontrar cartas similares por imagen subida
    async findSimilarCardsByUploadedImage(tempImagePath, limit = 12) {
        const embedding = await CardEmbeddingService.processUploadedImage(tempImagePath);
        if (!embedding) {
            throw new Error('No se pudo procesar la imagen subida');
        }

        return this.findSimilarCardsByEmbedding(embedding, limit);
    }

    // Buscar cartas por texto y agrupar por similitud visual
    async searchByTextAndVisualSimilarity(query, limit = 20) {
        try {        // Buscar cartas que coincidan con el texto
            const matchingCards = await Card.findAll({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { name: { [Op.like]: `%${query}%` } },
                                { description: { [Op.like]: `%${query}%` } },
                                { archetype: { [Op.like]: `%${query}%` } },
                                { cardType: { [Op.like]: `%${query}%` } },
                                { frame: { [Op.like]: `%${query}%` } }
                            ]
                        },
                        { visual_embedding: { [Op.ne]: null } }
                    ]
                },
                limit: 50 // Buscar más cartas para poder encontrar similitudes
            });

            if (matchingCards.length === 0) {
                return [];
            }

            // Si hay pocas cartas, devolverlas directamente
            if (matchingCards.length <= limit) {
                return matchingCards.map(card => ({
                    cardId: card.id.toString(),
                    similarity: 1.0 // Coincidencia perfecta por texto
                }));
            }

            // Calcular embedding promedio de las cartas encontradas
            const embeddings = [];
            const cardMap = new Map();

            for (const card of matchingCards) {
                try {
                    const embedding = JSON.parse(card.visual_embedding);
                    if (embedding && Array.isArray(embedding)) {
                        embeddings.push(embedding);
                        cardMap.set(embeddings.length - 1, card);
                    }
                } catch (error) {
                    console.warn(`Error parsing embedding for card ${card.id}:`, error.message);
                }
            }

            if (embeddings.length === 0) {
                return [];
            }

            // Calcular embedding promedio
            const avgEmbedding = this.calculateAverageEmbedding(embeddings);

            // Calcular similitudes de todas las cartas respecto al promedio
            const similarities = [];
            for (let i = 0; i < embeddings.length; i++) {
                const similarity = this.cosineSimilarity(avgEmbedding, embeddings[i]);
                const card = cardMap.get(i);
                similarities.push({
                    cardId: card.id.toString(),
                    similarity,
                    card
                });
            }

            // Ordenar por similitud y tomar los top
            similarities.sort((a, b) => b.similarity - a.similarity);

            return similarities.slice(0, limit);

        } catch (error) {
            console.error('Error in searchByTextAndVisualSimilarity:', error);
            throw error;
        }
    }

    // Calcular embedding promedio
    calculateAverageEmbedding(embeddings) {
        if (embeddings.length === 0) return null;

        const dimension = embeddings[0].length;
        const avgEmbedding = new Array(dimension).fill(0);

        for (const embedding of embeddings) {
            for (let i = 0; i < dimension; i++) {
                avgEmbedding[i] += embedding[i];
            }
        }

        // Promediar
        for (let i = 0; i < dimension; i++) {
            avgEmbedding[i] /= embeddings.length;
        }

        return avgEmbedding;
    }

    // Obtener detalles completos de cartas similares
    async getSimilarCardsWithDetails(similarityResults, baseUrl) {
        const cardIds = similarityResults.map(item => item.cardId);

        // Obtener detalles de la base de datos
        const cards = await Card.findAll({
            where: { id: cardIds }
        });

        // Reordenar según similitud y añadir score
        return similarityResults.map(item => {
            const card = cards.find(c => c.id.toString() === item.cardId);
            if (!card) return null;

            // Añadir score de similitud al resultado
            return {
                ...card.toJSON(),
                similarityScore: Math.round(item.similarity * 100),
                imageUrl: `${baseUrl}/images/cards/normal/${card.password}.jpg`,
                smallImageUrl: `${baseUrl}/images/cards/small/${card.password}.jpg`,
                croppedImageUrl: `${baseUrl}/images/cards/cropped/${card.password}.jpg`
            };
        }).filter(Boolean);
    }
}

export default new VisualSearchService();