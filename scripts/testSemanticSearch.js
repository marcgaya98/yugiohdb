// Script para probar la búsqueda semántica visual con CLIP
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import sequelize from '../config/database.js';

async function testSemanticSearch() {
    console.log('🧪 Iniciando pruebas de búsqueda semántica visual...\n');

    try {
        // Verificar estadísticas actuales
        console.log('📊 Verificando estado del sistema...');
        const stats = await ClipEmbeddingService.getEmbeddingStats();
        console.log(`Total de cartas: ${stats.totalCards}`);
        console.log(`Cartas con password: ${stats.cardsWithPassword}`);
        console.log(`Cartas con CLIP embedding: ${stats.cardsWithClipEmbedding}`);
        console.log(`Porcentaje completado: ${stats.completionPercentage}%\n`);

        // Si no hay embeddings, generar algunos para prueba
        if (stats.cardsWithClipEmbedding === 0) {
            console.log('🔄 No hay embeddings CLIP. Generando algunos para prueba...');
            console.log('⚠️  Esto puede tardar varios minutos...\n');

            // Generar embeddings para las primeras 5 cartas como prueba
            await ClipEmbeddingService.generateAllImageEmbeddings(5);

            // Verificar de nuevo
            const newStats = await ClipEmbeddingService.getEmbeddingStats();
            console.log(`\n✅ Embeddings generados: ${newStats.cardsWithClipEmbedding}`);
        }

        // Probar búsquedas semánticas
        console.log('\n🔍 Probando búsquedas semánticas...\n');

        const testQueries = [
            'vestido rojo',
            'dragón azul',
            'guerrero con armadura',
            'playa tropical',
            'magia oscura',
            'espada brillante',
            'criatura voladora',
            'robot de metal'
        ];

        for (const query of testQueries) {
            console.log(`🔎 Buscando: "${query}"`);

            try {
                const results = await ClipEmbeddingService.searchByVisualDescription(query, 3);

                if (results.length > 0) {
                    console.log(`✅ Encontradas ${results.length} cartas:`);
                    results.forEach((result, i) => {
                        const similarity = Math.round(result.similarity * 100);
                        console.log(`   ${i + 1}. ${result.name} (${similarity}% similitud)`);
                    });
                } else {
                    console.log('❌ No se encontraron resultados');
                }

            } catch (error) {
                console.error(`❌ Error buscando "${query}":`, error.message);
            }

            console.log(''); // Línea en blanco
        }

        console.log('🎉 Pruebas de búsqueda semántica completadas');

    } catch (error) {
        console.error('❌ Error en pruebas:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar pruebas
testSemanticSearch();
