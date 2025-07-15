// Script para verificar la estructura de la tabla Card
import Card from '../models/Card.js';
import sequelize from '../config/database.js';

async function checkTableStructure() {
    try {
        console.log('🔍 Verificando estructura de la tabla Card...\n');

        // Obtener información de la tabla
        const [results] = await sequelize.query("DESCRIBE card");

        console.log('📋 Columnas actuales en la tabla Card:');
        console.table(results);

        // Verificar si ya existe clip_embedding
        const hasClipEmbedding = results.find(col => col.Field === 'clip_embedding');

        if (hasClipEmbedding) {
            console.log('✅ La columna clip_embedding ya existe');
            console.log('Tipo:', hasClipEmbedding.Type);
            console.log('Permite NULL:', hasClipEmbedding.Null);
        } else {
            console.log('❌ La columna clip_embedding NO existe');
        }

        // Contar cartas con embeddings
        const totalCards = await Card.count();
        const cardsWithVisualEmbedding = await Card.count({
            where: { visual_embedding: { [Card.sequelize.Sequelize.Op.not]: null } }
        });

        let cardsWithClipEmbedding = 0;
        if (hasClipEmbedding) {
            cardsWithClipEmbedding = await Card.count({
                where: { clip_embedding: { [Card.sequelize.Sequelize.Op.not]: null } }
            });
        }

        console.log('\n📊 Estadísticas de embeddings:');
        console.log(`Total de cartas: ${totalCards}`);
        console.log(`Con visual_embedding: ${cardsWithVisualEmbedding}`);
        console.log(`Con clip_embedding: ${cardsWithClipEmbedding}`);

    } catch (error) {
        console.error('❌ Error verificando estructura:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkTableStructure();
