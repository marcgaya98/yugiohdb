import { fileURLToPath } from 'url';
import CardEmbeddingService from '../services/CardEmbeddingService.js';

async function generateEmbeddings() {
    console.log('🚀 Iniciando generación de embeddings para cartas Yu-Gi-Oh...');

    try {
        await CardEmbeddingService.initialize();
        await CardEmbeddingService.generateAllEmbeddings();
        console.log('✅ Proceso completado con éxito');
    } catch (error) {
        console.error('❌ Error generando embeddings:', error);
    }
}

// Auto-ejecutar si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateEmbeddings();
}

export default generateEmbeddings;