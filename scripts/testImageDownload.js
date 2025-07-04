/**
 * Script de prueba para descargar algunas imágenes de muestra
 */
import ImageDownloader from './downloadCardImages.js';
import Card from '../models/Card.js';

async function testImageDownload() {
  console.log('🧪 Iniciando prueba de descarga de imágenes...');

  try {
    // Obtener las primeras 5 cartas con password para prueba
    const testCards = await Card.findAll({
      attributes: ['id', 'password', 'name'],
      where: {
        password: {
          [Card.sequelize.Sequelize.Op.not]: null
        }
      },
      limit: 5
    });

    console.log(`📚 Cartas de prueba encontradas: ${testCards.length}`);

    if (testCards.length === 0) {
      console.log('❌ No hay cartas con password para probar');
      return;
    }

    const downloader = new ImageDownloader();

    // Crear directorios
    downloader.createDirectories();

    // Descargar imágenes de prueba
    for (const card of testCards) {
      console.log(`\n🎴 Procesando carta: ${card.name} (${card.password})`);
      const hasNewDownloads = await downloader.downloadCardImages(card);

      if (hasNewDownloads) {
        console.log(`   ✅ Imágenes descargadas para ${card.name}`);
      } else {
        console.log(`   ⏭️  Imágenes ya existían para ${card.name}`);
      }
    }

    console.log('\n🎉 Prueba de descarga completada!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testImageDownload().catch(console.error);
}
