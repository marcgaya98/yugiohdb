// Script para probar búsquedas semánticas rápidas con los embeddings existentes
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import sequelize from '../config/database.js';

async function testSemanticSearchQuick() {
    console.log('🧪 Probando búsqueda semántica con embeddings existentes...\n');

    try {
        // Verificar estadísticas actuales
        const stats = await ClipEmbeddingService.getEmbeddingStats();
        console.log(`📊 Cartas con CLIP embedding: ${stats.cardsWithClipEmbedding}`);

        if (stats.cardsWithClipEmbedding === 0) {
            console.log('❌ No hay embeddings CLIP disponibles para probar.');
            return;
        }

        // Probar búsquedas semánticas
        console.log('\n🔍 Probando búsquedas semánticas...\n');

        const testQueries = [
            'dragón azul',
            'guerrero con armadura',
            'magia oscura',
            'espada brillante',
            'criatura voladora',
            'robot de metal',
            'planta',
            'demonio'
        ];

        for (const query of testQueries) {
            console.log(`🔎 Buscando: "${query}"`);

            try {
                const results = await ClipEmbeddingService.searchByVisualDescription(query, 3);

                if (results.length > 0) {
                    console.log(`✅ Encontradas ${results.length} cartas:`);
                    results.forEach((result, i) => {
                        console.log(`   ${i + 1}. ${result.name} (${Math.round(result.similarity * 100)}% similitud)`);
                    });
                } else {
                    console.log('   ❌ No se encontraron resultados');
                }
            } catch (error) {
                console.error(`   ❌ Error en búsqueda: ${error.message}`);
            }

            console.log(''); // Línea en blanco
        }

    } catch (error) {
        console.error('❌ Error en prueba:', error);
    } finally {
        await sequelize.close();
        console.log('🏁 Prueba completada');
    }
}

// Ejecutar la prueba
testSemanticSearchQuick().catch(console.error);
