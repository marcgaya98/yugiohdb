// Script para regenerar todos los embeddings con vectores reales
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import Card from '../models/Card.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs-extra';

async function regenerateVectorEmbeddings() {
    console.log('🔄 Regenerando embeddings con vectores reales...\n');

    try {
        // Verificar estado actual
        const totalCards = await Card.count({
            where: { password: { [Op.not]: null } }
        });

        console.log(`📊 Total de cartas con password: ${totalCards}`);

        // Resetear todos los embeddings para regenerar
        console.log('🗑️ Limpiando embeddings existentes...');
        await Card.update(
            { clip_embedding: null },
            {
                where: {
                    password: { [Op.not]: null },
                    clip_embedding: { [Op.not]: null }
                }
            }
        );

        // Procesar en lotes pequeños
        const batchSize = 5; // Reducido para mejor estabilidad
        const cardsToProcess = await Card.findAll({
            where: {
                [Op.and]: [
                    { clip_embedding: null },
                    { password: { [Op.not]: null } }
                ]
            },
            attributes: ['id', 'password', 'name'],
            order: [['id', 'ASC']]
        });

        console.log(`🖼️ Procesando ${cardsToProcess.length} cartas en lotes de ${batchSize}...\n`);

        let processed = 0;
        let errors = 0;

        for (let i = 0; i < cardsToProcess.length; i += batchSize) {
            const batch = cardsToProcess.slice(i, i + batchSize);

            console.log(`📦 Lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(cardsToProcess.length / batchSize)}`);

            for (const card of batch) {
                try {
                    const normalizedPassword = normalizePasswordForUrl(card.password);
                    const imagePath = path.join(process.cwd(), 'public/images/cards/cropped', `${normalizedPassword}.jpg`);

                    // Verificar que la imagen existe
                    if (!(await fs.pathExists(imagePath))) {
                        console.warn(`⚠️ Imagen no encontrada: ${normalizedPassword}.jpg`);
                        errors++;
                        continue;
                    }

                    // Generar embedding vectorial
                    const embedding = await ClipEmbeddingService.generateImageEmbedding(imagePath);

                    if (embedding && Array.isArray(embedding)) {
                        // Guardar el vector en la base de datos
                        await card.update({
                            clip_embedding: embedding
                        });

                        processed++;
                        console.log(`✅ [${processed}/${cardsToProcess.length}] ${card.name} (${embedding.length}D)`);
                    } else {
                        errors++;
                        console.error(`❌ No se pudo generar embedding para ${card.name}`);
                    }

                } catch (error) {
                    errors++;
                    console.error(`❌ Error procesando ${card.name}: ${error.message}`);
                }
            }

            // Pausa entre lotes
            if (i + batchSize < cardsToProcess.length) {
                console.log('⏳ Pausa breve...\n');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log('\n🎉 Regeneración completada:');
        console.log(`✅ Exitosos: ${processed}`);
        console.log(`❌ Errores: ${errors}`);
        console.log(`📊 Total procesado: ${processed + errors}/${cardsToProcess.length}`);

        // Verificar formato final
        console.log('\n🔍 Verificando formato de embeddings...');
        const sampleCard = await Card.findOne({
            where: { clip_embedding: { [Op.not]: null } },
            attributes: ['name', 'clip_embedding']
        });

        if (sampleCard) {
            const embedding = sampleCard.clip_embedding;
            console.log(`📝 Ejemplo - ${sampleCard.name}:`);
            console.log(`   Tipo: ${typeof embedding}`);
            console.log(`   Es array: ${Array.isArray(embedding)}`);
            if (Array.isArray(embedding)) {
                console.log(`   Dimensión: ${embedding.length}`);
                console.log(`   Primeros valores: [${embedding.slice(0, 3).join(', ')}...]`);
            }
        }

        console.log('\n🎊 ¡Sistema listo para búsquedas semánticas con vectores reales!');

    } catch (error) {
        console.error('❌ Error en regeneración:', error);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
    regenerateVectorEmbeddings()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

export default regenerateVectorEmbeddings;
