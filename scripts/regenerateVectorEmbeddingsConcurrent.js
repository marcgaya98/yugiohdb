// Script para regenerar embeddings CLIP con procesamiento concurrente optimizado
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import sequelize from '../config/database.js';

async function regenerateEmbeddingsConcurrent() {
    console.log('🚀 Generando embeddings CLIP con procesamiento concurrente...\n');

    try {
        // Verificar estado inicial
        const initialStats = await ClipEmbeddingService.getEmbeddingStats();
        console.log('📊 Estado inicial:');
        console.log(`Total de cartas: ${initialStats.totalCards}`);
        console.log(`Cartas con password: ${initialStats.cardsWithPassword}`);
        console.log(`Cartas con embedding: ${initialStats.cardsWithClipEmbedding}`);
        console.log(`Progreso actual: ${initialStats.completionPercentage}%\n`);

        if (initialStats.completionPercentage === 100) {
            console.log('✅ Todos los embeddings ya están generados!');
            return;
        }

        const pendingCards = initialStats.cardsWithPassword - initialStats.cardsWithClipEmbedding;
        console.log(`⏳ Cartas pendientes por procesar: ${pendingCards}\n`);

        // Configuración optimizada
        const batchSize = 20; // Lotes más grandes
        const maxConcurrency = 4; // Más concurrencia (ajusta según tu CPU)

        console.log('⚙️ Configuración del procesamiento:');
        console.log(`🔢 Tamaño de lote: ${batchSize} cartas`);
        console.log(`🔀 Concurrencia máxima: ${maxConcurrency} hilos`);
        console.log(`⚡ Velocidad estimada: ${batchSize * maxConcurrency} cartas por ciclo\n`);

        // Iniciar el procesamiento
        const startTime = Date.now();
        console.log(`🕐 Iniciando procesamiento a las ${new Date().toLocaleTimeString()}\n`);

        const results = await ClipEmbeddingService.generateAllImageEmbeddings(batchSize, maxConcurrency);

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // segundos
        const cardsPerSecond = results.processed / duration;

        console.log('\n🎯 Resultados finales:');
        console.log(`✅ Cartas procesadas exitosamente: ${results.processed}`);
        console.log(`❌ Errores: ${results.errors}`);
        console.log(`📊 Total: ${results.total}`);
        console.log(`⏱️ Tiempo transcurrido: ${Math.round(duration)} segundos`);
        console.log(`🚀 Velocidad promedio: ${cardsPerSecond.toFixed(2)} cartas/segundo`);

        // Verificar estado final
        const finalStats = await ClipEmbeddingService.getEmbeddingStats();
        console.log('\n📈 Estado final:');
        console.log(`Progreso: ${finalStats.completionPercentage}% (${finalStats.cardsWithClipEmbedding}/${finalStats.cardsWithPassword})`);

        if (finalStats.completionPercentage === 100) {
            console.log('🎉 ¡Todos los embeddings generados exitosamente!');
        } else {
            const remaining = finalStats.cardsWithPassword - finalStats.cardsWithClipEmbedding;
            const estimatedTimeRemaining = remaining / cardsPerSecond / 60; // minutos
            console.log(`⏳ Cartas restantes: ${remaining}`);
            console.log(`🕐 Tiempo estimado restante: ${Math.round(estimatedTimeRemaining)} minutos`);
        }

    } catch (error) {
        console.error('❌ Error en el proceso de generación:', error);
    } finally {
        await sequelize.close();
        console.log('\n👋 Conexión a base de datos cerrada.');
    }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    regenerateEmbeddingsConcurrent();
}

export default regenerateEmbeddingsConcurrent;
