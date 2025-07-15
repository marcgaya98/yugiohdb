import VisualSearchService from '../services/VisualSearchService.js';
import sequelize from '../config/database.js';

async function testVisualSearch() {
    console.log('🔍 Prueba de búsqueda visual...');

    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a BD establecida');

        // Buscar cartas similares a Blue-Eyes White Dragon
        const blueEyesPassword = '89631139';
        console.log(`🐉 Buscando cartas similares a Blue-Eyes White Dragon (${blueEyesPassword})`);

        const similarCards = await VisualSearchService.findSimilarCards(blueEyesPassword, 3);

        console.log(`📊 Encontradas ${similarCards.length} cartas similares:`);
        similarCards.forEach((result, index) => {
            console.log(`${index + 1}. Carta ID: ${result.cardId}, Similitud: ${result.similarity.toFixed(4)}`);
        });

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    } finally {
        await sequelize.close();
    }
}

testVisualSearch();
