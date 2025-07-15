// Script para generar embeddings CLIP para todas las cartas
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import sequelize from '../config/database.js';

async function generateClipEmbeddings() {
    console.log('🚀 Iniciando generación de embeddings CLIP...\n');

    try {
        // Verificar estado actual
        const initialStats = await ClipEmbeddingService.getEmbeddingStats();
        console.log('📊 Estado inicial:');
        console.log(`Total de cartas: ${initialStats.totalCards}`);
        console.log(`Cartas con password: ${initialStats.cardsWithPassword}`);
        console.log(`Cartas con CLIP embedding: ${initialStats.cardsWithClipEmbedding}`);
        console.log(`Porcentaje completado: ${initialStats.completionPercentage}%\n`);

        if (initialStats.cardsWithClipEmbedding >= initialStats.cardsWithPassword) {
            console.log('✅ Todos los embeddings CLIP ya están generados');
            return;
        }

        // Estimar tiempo
        const remaining = initialStats.cardsWithPassword - initialStats.cardsWithClipEmbedding;
        const estimatedMinutes = Math.ceil(remaining / 10); // Asumiendo 10 cartas por minuto
        console.log(`⏱️  Tiempo estimado: ${estimatedMinutes} minutos para ${remaining} cartas restantes\n`);

        // Confirmar si queremos continuar
        console.log('🔄 Iniciando proceso de generación...');

        // Generar embeddings
        const result = await ClipEmbeddingService.generateAllImageEmbeddings(10);

        // Mostrar resultados finales
        console.log('\n🎉 Proceso completado:');
        console.log(`✅ Embeddings generados exitosamente: ${result.processed}`);
        console.log(`❌ Errores: ${result.errors}`);
        console.log(`📊 Total procesado: ${result.total}`);

        // Verificar estado final
        const finalStats = await ClipEmbeddingService.getEmbeddingStats();
        console.log('\n📊 Estado final:');
        console.log(`Cartas con CLIP embedding: ${finalStats.cardsWithClipEmbedding}`);
        console.log(`Porcentaje completado: ${finalStats.completionPercentage}%`);

        if (finalStats.completionPercentage === 100) {
            console.log('\n🎊 ¡Sistema de búsqueda semántica completamente listo!');
            console.log('Ya puedes usar búsquedas como:');
            console.log('• "vestido rojo"');
            console.log('• "dragón volando"');
            console.log('• "playa tropical"');
            console.log('• "guerrero con armadura"');
        }

    } catch (error) {
        console.error('❌ Error en generación de embeddings:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar generación
generateClipEmbeddings();
