// Script para probar el sistema de búsqueda semántica con vectores de características
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import sequelize from '../config/database.js';

async function testVectorSemanticSearch() {
    console.log('🧪 Probando búsqueda semántica con vectores de características...\n');

    try {
        // Verificar estado de embeddings
        const stats = await ClipEmbeddingService.getEmbeddingStats();
        console.log('📊 Estado actual:');
        console.log(`Cartas con embeddings: ${stats.cardsWithClipEmbedding}`);
        console.log(`Porcentaje completado: ${stats.completionPercentage}%\n`);

        if (stats.cardsWithClipEmbedding === 0) {
            console.log('⚠️ No hay embeddings disponibles. Ejecuta primero el script de generación.');
            return;
        }

        // Lista de búsquedas de prueba
        const searchQueries = [
            "purple fusion swirl",
            "two monsters merging in vortex",
            "magical energy combining creatures",
            "spell card fusion light",
            "vibrant green and purple fusion",
            "glowing vortex merging figures",
            "ethereal fusion spiral",
            "monster fusion glowing aura",
            "intertwined energy beams fusion",
            "twisting fusion portal",
        ];

        // Probar cada búsqueda
        for (const query of searchQueries) {
            console.log(`\n🔍 Probando búsqueda: "${query}"`);
            console.log('─'.repeat(50));

            try {
                const results = await ClipEmbeddingService.searchByVisualDescription(query, 5);

                if (results.length > 0) {
                    console.log(`✅ Encontradas ${results.length} cartas:`);
                    results.forEach((result, i) => {
                        console.log(`${i + 1}. ${result.name} (${Math.round(result.similarity * 100)}% similitud)`);
                    });
                } else {
                    console.log('❌ No se encontraron resultados');
                }
            } catch (error) {
                console.error(`❌ Error en búsqueda "${query}":`, error.message);
            }

            // Pausa entre búsquedas
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n🎉 Pruebas completadas');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testVectorSemanticSearch();
}

export default testVectorSemanticSearch;
