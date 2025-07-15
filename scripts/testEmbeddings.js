import CardEmbeddingService from '../services/CardEmbeddingService.js';
import Card from '../models/Card.js';
import sequelize from '../config/database.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

async function testEmbeddingGeneration() {
    console.log('🧪 Prueba de generación de embeddings...');

    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a BD establecida');

        // Inicializar el servicio
        await CardEmbeddingService.initialize();
        console.log('✅ Servicio inicializado');

        // Obtener las primeras 5 cartas que no tengan embedding
        const cardsWithoutEmbedding = await Card.findAll({
            where: {
                visual_embedding: null
            },
            limit: 5
        });

        console.log(`📋 Encontradas ${cardsWithoutEmbedding.length} cartas sin embedding`);

        for (const card of cardsWithoutEmbedding) {
            const normalizedPassword = normalizePasswordForUrl(card.password);
            const imagePath = `public/images/cards/cropped/${normalizedPassword}.jpg`;
            console.log(`🖼️ Procesando carta ${card.name} (${card.password} -> ${normalizedPassword})`);

            try {
                const embedding = await CardEmbeddingService.processImage(imagePath);
                if (embedding) {
                    await card.update({
                        visual_embedding: JSON.stringify(embedding)
                    });
                    console.log(`✅ Embedding generado para ${card.name}`);
                } else {
                    console.log(`❌ No se pudo generar embedding para ${card.name}`);
                }
            } catch (err) {
                console.error(`❌ Error procesando ${card.name}:`, err.message);
            }
        }

        console.log('🎉 Prueba completada');

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    } finally {
        await sequelize.close();
    }
}

testEmbeddingGeneration();
