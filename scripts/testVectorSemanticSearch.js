// Script para probar búsquedas semánticas con vectores reales
import ClipEmbeddingService from '../services/ClipEmbeddingService.js';
import Card from '../models/Card.js';
import { Op } from 'sequelize';

async function testVectorSemanticSearch() {
    console.log('🧪 Probando búsquedas semánticas con vectores reales...\n');

    try {
        // Verificar que tenemos embeddings vectoriales
        const cardsWithEmbeddings = await Card.count({
            where: { clip_embedding: { [Op.not]: null } }
        });

        console.log(`📊 Cartas con embeddings: ${cardsWithEmbeddings}`);

        if (cardsWithEmbeddings === 0) {
            console.log('⚠️ No hay embeddings disponibles. Ejecuta primero la regeneración.');
            return;
        }

        // Verificar formato de un embedding de muestra
        const sampleCard = await Card.findOne({
            where: { clip_embedding: { [Op.not]: null } },
            attributes: ['name', 'clip_embedding']
        });

        if (sampleCard) {
            console.log(`📝 Muestra - ${sampleCard.name}:`);
            console.log(`   Tipo: ${typeof sampleCard.clip_embedding}`);
            console.log(`   Es array: ${Array.isArray(sampleCard.clip_embedding)}`);
            if (Array.isArray(sampleCard.clip_embedding)) {
                console.log(`   Dimensión: ${sampleCard.clip_embedding.length}`);
            }
        }

        // Pruebas de búsqueda semántica
        const searchQueries = [
            "dragón azul",
            "guerrero con armadura",
            "magia oscura",
            "criatura voladora",
            "robot de metal"
        ];

        for (const query of searchQueries) {
            console.log(`\n🔍 Buscando: "${query}"`);

            try {
                const results = await ClipEmbeddingService.searchByVisualDescription(query, 5);

                if (results.length > 0) {
                    console.log(`✅ Encontrados ${results.length} resultados:`);
                    results.forEach((result, i) => {
                        console.log(`   ${i + 1}. ${result.name} (${(result.similarity * 100).toFixed(1)}%)`);
                    });
                } else {
                    console.log('❌ No se encontraron resultados');
                }
            } catch (error) {
                console.error(`❌ Error en búsqueda "${query}":`, error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error en pruebas:', error);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
    testVectorSemanticSearch()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

export default testVectorSemanticSearch;
