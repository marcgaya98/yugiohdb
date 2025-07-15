// Script para limpiar embeddings en formato objeto y regenerar como vectores
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import { Op } from 'sequelize';

async function clearObjectEmbeddings() {
    console.log('🧹 Limpiando embeddings en formato objeto...');

    try {
        // Encontrar cartas con embeddings en formato objeto
        const cardsWithObjectEmbeddings = await Card.findAll({
            where: {
                [Op.and]: [
                    { clip_embedding: { [Op.not]: null } },
                    sequelize.where(
                        sequelize.cast(sequelize.col('clip_embedding'), 'TEXT'),
                        { [Op.like]: '{%}' }
                    )
                ]
            },
            attributes: ['id', 'name', 'clip_embedding']
        });

        console.log(`📊 Encontradas ${cardsWithObjectEmbeddings.length} cartas con embeddings en formato objeto`);

        if (cardsWithObjectEmbeddings.length === 0) {
            console.log('✅ No hay embeddings en formato objeto para limpiar');
            return;
        }

        // Limpiar embeddings objeto
        let cleared = 0;
        for (const card of cardsWithObjectEmbeddings) {
            try {
                await card.update({
                    clip_embedding: null
                });
                cleared++;

                if (cleared % 100 === 0) {
                    console.log(`🧹 Limpiadas ${cleared}/${cardsWithObjectEmbeddings.length} cartas...`);
                }
            } catch (error) {
                console.error(`❌ Error limpiando carta ${card.name}:`, error.message);
            }
        }

        console.log(`✅ Limpiadas ${cleared} cartas con embeddings en formato objeto`);
        console.log('📋 Ahora puedes ejecutar el script de regeneración de embeddings vectoriales');

    } catch (error) {
        console.error('❌ Error en el proceso de limpieza:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    clearObjectEmbeddings();
}

export default clearObjectEmbeddings;
