// Script para verificar específicamente Polymerization y cartas de fusión
import Card from '../models/Card.js';
import sequelize from '../config/database.js';

async function checkPolymerizationStatus() {
    console.log('🔍 Verificando estado de Polymerization y cartas de fusión...\n');

    try {
        // Buscar Polymerization específicamente
        const polymerization = await Card.findOne({
            where: {
                name: 'Polymerization'
            }
        });

        console.log('📋 Estado de Polymerization:');
        if (polymerization) {
            console.log(`✅ Encontrada: ID ${polymerization.id}, Nombre: ${polymerization.name}`);
            console.log(`🧬 Tiene embedding: ${polymerization.clip_embedding ? 'SÍ' : 'NO'}`);
            if (polymerization.clip_embedding) {
                try {
                    const embedding = JSON.parse(polymerization.clip_embedding);
                    console.log(`📊 Dimensiones del embedding: ${embedding.length}`);
                    console.log(`🔢 Primeros 5 valores: [${embedding.slice(0, 5).join(', ')}]`);
                } catch (jsonError) {
                    console.log(`❌ Error parseando JSON del embedding: ${jsonError.message}`);
                    console.log(`🔍 Contenido del embedding (primeros 100 chars): ${polymerization.clip_embedding.substring(0, 100)}`);
                }
            }
        } else {
            console.log('❌ Polymerization NO encontrada en la base de datos');
        }

        console.log('\n───────────────────────────────────────\n');

        // Buscar otras cartas relacionadas con fusión
        const fusionCards = await Card.findAll({
            where: {
                [sequelize.Sequelize.Op.or]: [
                    { name: { [sequelize.Sequelize.Op.like]: '%Fusion%' } },
                    { name: { [sequelize.Sequelize.Op.like]: '%Polymerization%' } },
                    { name: { [sequelize.Sequelize.Op.like]: '%Poly%' } }
                ]
            },
            limit: 10
        });

        console.log('🔗 Cartas relacionadas con fusión encontradas:');
        if (fusionCards.length > 0) {
            fusionCards.forEach((card, i) => {
                const hasEmbedding = card.clip_embedding ? '✅' : '❌';
                console.log(`${i + 1}. ${card.name} ${hasEmbedding}`);
            });
        } else {
            console.log('❌ No se encontraron cartas relacionadas con fusión');
        }

        console.log('\n───────────────────────────────────────\n');

        // Verificar estadísticas generales
        const totalCards = await Card.count();
        const cardsWithEmbedding = await Card.count({
            where: {
                clip_embedding: {
                    [sequelize.Sequelize.Op.ne]: null
                }
            }
        });

        console.log('📊 Estadísticas generales:');
        console.log(`Total de cartas: ${totalCards}`);
        console.log(`Cartas con embedding: ${cardsWithEmbedding}`);
        console.log(`Progreso: ${((cardsWithEmbedding / totalCards) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('❌ Error verificando Polymerization:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    checkPolymerizationStatus();
}

export default checkPolymerizationStatus;
