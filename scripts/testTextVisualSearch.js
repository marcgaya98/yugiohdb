// Script para probar la búsqueda por texto con similitud visual
import VisualSearchService from '../services/VisualSearchService.js';
import sequelize from '../config/database.js';

async function testTextVisualSearch() {
    try {
        console.log('🧪 Iniciando prueba de búsqueda por texto con similitud visual...\n');

        // Probar diferentes términos de búsqueda
        const searchTerms = [
            'dragon',
            'magician',
            'warrior',
            'spell',
            'dark'
        ];

        for (const term of searchTerms) {
            console.log(`📝 Buscando cartas con término: "${term}"`);

            try {
                const results = await VisualSearchService.searchByTextAndVisualSimilarity(
                    term,
                    10 // Limitar a 10 resultados
                );

                console.log(`   📊 Encontradas ${results.length} cartas`);

                if (results.length > 0) {
                    console.log('   🎯 Top 5 resultados por similitud visual:');

                    const topResults = results.slice(0, 5);
                    for (let i = 0; i < topResults.length; i++) {
                        const result = topResults[i];
                        const similarity = Math.round(result.similarity * 100);
                        console.log(`      ${i + 1}. ID: ${result.cardId}, Similitud: ${similarity}%`);
                    }
                }

                console.log(''); // Línea en blanco

            } catch (error) {
                console.error(`   ❌ Error buscando "${term}":`, error.message);
            }
        }

        console.log('✅ Prueba de búsqueda por texto completada');

    } catch (error) {
        console.error('❌ Error en prueba:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar prueba
testTextVisualSearch();
