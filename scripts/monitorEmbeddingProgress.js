// Script para monitorear el progreso de generación de embeddings en tiempo real
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import sequelize from '../config/database.js';

async function monitorProgress() {
    console.log('📊 Monitor de progreso de embeddings CLIP\n');
    console.log('⌚ Actualizando cada 30 segundos...\n');

    let previousCount = 0;
    let startTime = Date.now();
    let lastCheckTime = startTime;

    const checkProgress = async () => {
        try {
            const stats = await ClipEmbeddingService.getEmbeddingStats();
            const currentTime = Date.now();
            const totalElapsed = (currentTime - startTime) / 1000; // segundos
            const intervalElapsed = (currentTime - lastCheckTime) / 1000; // segundos

            const newCards = stats.cardsWithClipEmbedding - previousCount;
            const currentRate = intervalElapsed > 0 ? newCards / intervalElapsed : 0;
            const averageRate = totalElapsed > 0 ? stats.cardsWithClipEmbedding / totalElapsed : 0;

            console.log(`🕐 ${new Date().toLocaleTimeString()}`);
            console.log(`📈 Progreso: ${stats.cardsWithClipEmbedding}/${stats.cardsWithPassword} (${stats.completionPercentage}%)`);
            console.log(`🆕 Nuevas en este intervalo: ${newCards}`);
            console.log(`⚡ Velocidad actual: ${currentRate.toFixed(2)} cartas/seg`);
            console.log(`📊 Velocidad promedio: ${averageRate.toFixed(2)} cartas/seg`);

            const remaining = stats.cardsWithPassword - stats.cardsWithClipEmbedding;
            if (remaining > 0 && averageRate > 0) {
                const eta = remaining / averageRate;
                const etaMinutes = Math.round(eta / 60);
                const etaHours = Math.round(etaMinutes / 60);

                if (etaHours > 0) {
                    console.log(`⏳ ETA: ~${etaHours}h ${etaMinutes % 60}min (${remaining} cartas restantes)`);
                } else {
                    console.log(`⏳ ETA: ~${etaMinutes} minutos (${remaining} cartas restantes)`);
                }
            }

            console.log('─'.repeat(60));

            previousCount = stats.cardsWithClipEmbedding;
            lastCheckTime = currentTime;

            if (stats.completionPercentage === 100) {
                console.log('🎉 ¡Generación de embeddings completada!');
                clearInterval(interval);
                await sequelize.close();
                process.exit(0);
            }

        } catch (error) {
            console.error('❌ Error monitoreando progreso:', error.message);
        }
    };

    // Verificación inicial
    await checkProgress();

    // Configurar monitoreo cada 30 segundos
    const interval = setInterval(checkProgress, 30000);

    // Capturar Ctrl+C para cerrar limpiamente
    process.on('SIGINT', async () => {
        console.log('\n👋 Deteniendo monitor...');
        clearInterval(interval);
        await sequelize.close();
        process.exit(0);
    });
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    monitorProgress();
}

export default monitorProgress;
