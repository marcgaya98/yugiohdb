import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import Card from '../models/Card.js';
import { Op } from 'sequelize';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

class CardEmbeddingService {
    constructor() {
        this.model = null;
        this.embeddingsDB = {};
        this.embeddingsPath = path.join(process.cwd(), 'data/embeddings.json');
    }

    async initialize() {
        console.log('🔄 Inicializando servicio de embeddings...');

        // Crear directorio si no existe
        await fs.ensureDir(path.dirname(this.embeddingsPath));

        // Intentar cargar embeddings existentes
        if (await fs.pathExists(this.embeddingsPath)) {
            console.log('📂 Cargando embeddings existentes...');
            this.embeddingsDB = await fs.readJSON(this.embeddingsPath);
            console.log(`✅ ${Object.keys(this.embeddingsDB).length} embeddings cargados`);
        }

        // Cargar modelo MobileNet (más ligero que VGG16)
        console.log('🧠 Cargando modelo de red neuronal...');
        this.model = await tf.loadGraphModel(
            'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/feature_vector/2/default/1',
            { fromTFHub: true }
        );
        console.log('✅ Modelo cargado correctamente');

        return this;
    }

    // Procesar imagen para generar embedding
    async processImage(imagePath) {
        try {
            // Leer y redimensionar imagen a 224x224 (esperado por MobileNet)
            const image = await sharp(imagePath)
                .resize(224, 224, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                .toBuffer();

            // Convertir a tensor y normalizar
            const tensor = tf.node.decodeImage(image, 3);
            const normalized = tensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
            const batched = normalized.expandDims(0);

            // Generar embedding
            const embedding = this.model.predict(batched);
            const vector = Array.from(embedding.dataSync());

            // Liberar memoria
            tf.dispose([tensor, normalized, batched, embedding]);

            return vector;
        } catch (error) {
            console.error(`Error procesando imagen ${imagePath}:`, error);
            return null;
        }
    }

    // Generar embeddings para todas las cartas (proceso intensivo)
    async generateAllEmbeddings() {
        if (!this.model) await this.initialize();
        console.log('🔄 Generando embeddings para todas las cartas...');

        // Obtener todas las cartas sin embedding desde la base de datos
        const cardsWithoutEmbedding = await Card.findAll({
            where: {
                visual_embedding: null
            },
            attributes: ['id', 'password', 'name']
        });

        console.log(`🖼️ Procesando ${cardsWithoutEmbedding.length} cartas...`);

        let processed = 0;
        for (const card of cardsWithoutEmbedding) {
            try {
                const normalizedPassword = normalizePasswordForUrl(card.password);
                const imagePath = path.join(process.cwd(), 'public/images/cards/cropped', `${normalizedPassword}.jpg`);

                // Verificar si la imagen existe
                if (await fs.pathExists(imagePath)) {
                    const embedding = await this.processImage(imagePath);
                    if (embedding) {
                        // Guardar el embedding en la carta como JSON string
                        await card.update({
                            visual_embedding: JSON.stringify(embedding)
                        });
                        processed++;
                        console.log(`✅ ${processed} - Embedding generado para ${card.name} (${card.password})`);
                    } else {
                        console.log(`❌ No se pudo generar embedding para ${card.name} (${card.password})`);
                    }
                } else {
                    console.log(`⚠️ Imagen no encontrada para ${card.name} (${normalizedPassword}.jpg)`);
                }
            } catch (err) {
                console.error(`❌ Error procesando ${card.name}:`, err.message);
            }

            // Mostrar progreso cada 50 cartas
            if (processed % 50 === 0 && processed > 0) {
                console.log(`📊 Progreso: ${processed}/${cardsWithoutEmbedding.length}`);
            }
        }

        console.log(`✅ Embeddings generados: ${processed} cartas`);
    }

    // Obtener embedding para una carta específica
    async getEmbedding(cardId) {
        try {
            const card = await Card.findOne({
                where: { password: cardId },
                attributes: ['visual_embedding']
            });

            if (card && card.visual_embedding) {
                return JSON.parse(card.visual_embedding);
            }

            return null;
        } catch (error) {
            console.error(`Error obteniendo embedding para carta ${cardId}:`, error);
            return null;
        }
    }

    // Procesar imagen subida por usuario
    async processUploadedImage(imagePath) {
        if (!this.model) await this.initialize();
        return this.processImage(imagePath);
    }

    // Encontrar cartas similares por embedding
    async findSimilarCardsByEmbedding(embedding, limit = 12, excludeIds = []) {
        // Obtener cartas con embeddings
        const cardsWithEmbeddings = await Card.findAll({
            where: {
                visual_embedding: { [Op.not]: null }
            },
            attributes: ['id', 'name', 'visual_embedding']
        });

        const similarities = [];

        for (const card of cardsWithEmbeddings) {
            if (excludeIds.includes(card.id.toString())) continue;

            try {
                const cardEmbedding = JSON.parse(card.visual_embedding);
                const similarity = this.cosineSimilarity(
                    embedding,
                    cardEmbedding
                );

                similarities.push({
                    cardId: card.id.toString(),
                    similarity
                });
            } catch (error) {
                console.error(`Error parsing embedding for card ${card.id}:`, error);
            }
        }

        // Ordenar por similitud
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Devolver top K
        return similarities.slice(0, limit);
    }

    // Calcular similitud coseno entre dos vectores
    cosineSimilarity(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Los vectores deben tener la misma dimensión');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export default new CardEmbeddingService();