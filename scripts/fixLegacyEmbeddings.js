// Script para corregir embeddings CLIP legacy en formato vectorial
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import Card from '../models/Card.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';
import { Op } from 'sequelize';
import path from 'path';

async function fixLegacyEmbeddings() {
    console.log('🔧 Corrigiendo embeddings CLIP legacy...\n');

    try {
        // Encontrar cartas con embeddings en formato array (legacy)
        const legacyCards = await Card.findAll({
            where: {
                [Op.and]: [
                    { clip_embedding: { [Op.not]: null } },
                    { clip_embedding: { [Op.like]: '[%' } }
                ]
            },
            attributes: ['id', 'password', 'name', 'clip_embedding']
        });

        console.log(`📊 Encontradas ${legacyCards.length} cartas con embeddings legacy`);

        if (legacyCards.length === 0) {
            console.log('✅ No hay embeddings legacy que corregir');
            return;
        }

        // Confirmar antes de proceder
        console.log('🔄 Regenerando embeddings legacy al nuevo formato...');

        let processed = 0;
        let errors = 0;

        for (const card of legacyCards) {
            try {
                console.log(`🔄 Procesando ${card.name}...`);

                // Regenerar embedding usando el servicio actual
                const normalizedPassword = normalizePasswordForUrl(card.password);
                const imagePath = path.join(process.cwd(), 'public/images/cards/cropped', `${normalizedPassword}.jpg`);

                const newEmbedding = await ClipEmbeddingService.generateImageEmbedding(imagePath);

                if (newEmbedding) {
                    // Actualizar en la base de datos
                    await card.update({
                        clip_embedding: newEmbedding
                    });

                    processed++;
                    console.log(`✅ [${processed}/${legacyCards.length}] ${card.name} - Actualizado`);
                } else {
                    errors++;
                    console.log(`❌ [${processed + errors}/${legacyCards.length}] ${card.name} - Error`);
                }

            } catch (error) {
                errors++;
                console.error(`❌ Error procesando ${card.name}:`, error.message);
            }
        }

        console.log(`\n🎉 Corrección completada:`);
        console.log(`✅ Exitosos: ${processed}`);
        console.log(`❌ Errores: ${errors}`);
        console.log(`📊 Total procesado: ${processed + errors}/${legacyCards.length}`);

        // Verificar estado final
        const remainingLegacy = await Card.count({
            where: {
                [Op.and]: [
                    { clip_embedding: { [Op.not]: null } },
                    { clip_embedding: { [Op.like]: '[%' } }
                ]
            }
        });

        if (remainingLegacy === 0) {
            console.log('\n🎊 ¡Todos los embeddings ahora están en formato consistente!');
        } else {
            console.log(`\n⚠️ Quedan ${remainingLegacy} embeddings legacy sin procesar`);
        }

    } catch (error) {
        console.error('❌ Error en la corrección de embeddings legacy:', error);
        throw error;
    }
}

// Ejecutar el script
fixLegacyEmbeddings()
    .then(() => {
        console.log('\n✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script falló:', error);
        process.exit(1);
    });
