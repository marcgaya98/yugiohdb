/**
 * Script de prueba específico para Gaia The Fierce Knight
 */
import ImageDownloader from './downloadCardImages.js';
import Card from '../models/Card.js';

async function testGaiaDownload() {
    console.log('🧪 Probando descarga específica de Gaia The Fierce Knight...');

    try {
        // Buscar específicamente a Gaia
        const gaia = await Card.findOne({
            where: {
                name: 'Gaia The Fierce Knight'
            }
        });

        if (!gaia) {
            console.log('❌ No se encontró Gaia The Fierce Knight');
            return;
        }

        console.log(`📚 Carta encontrada: ${gaia.name}`);
        console.log(`🔢 Password original: ${gaia.password}`);

        // Importar utilidades
        const { normalizePasswordForUrl } = await import('../utils/passwordUtils.js');
        const normalizedPassword = normalizePasswordForUrl(gaia.password);
        console.log(`🔢 Password normalizado: ${normalizedPassword}`);

        // Generar URLs que se usarán
        console.log('\n🌐 URLs que se intentarán descargar:');
        console.log(`   Normal: https://images.ygoprodeck.com/images/cards/${normalizedPassword}.jpg`);
        console.log(`   Small: https://images.ygoprodeck.com/images/cards_small/${normalizedPassword}.jpg`);
        console.log(`   Cropped: https://images.ygoprodeck.com/images/cards_cropped/${normalizedPassword}.jpg`);

        const downloader = new ImageDownloader();

        // Crear directorios
        downloader.createDirectories();

        // Descargar imágenes de Gaia
        console.log(`\n🎴 Procesando carta: ${gaia.name}`);
        const hasNewDownloads = await downloader.downloadCardImages(gaia);

        if (hasNewDownloads) {
            console.log(`   ✅ Imágenes descargadas para ${gaia.name}`);
        } else {
            console.log(`   ⏭️  Imágenes ya existían para ${gaia.name}`);
        }

        // Verificar si las imágenes se descargaron
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const imageDir = path.join(__dirname, '../public/images/cards');

        console.log('\n📁 Verificando archivos descargados:');
        ['normal', 'small', 'cropped'].forEach(type => {
            const imagePath = path.join(imageDir, type, `${normalizedPassword}.jpg`);
            const exists = fs.existsSync(imagePath);
            console.log(`   ${type}: ${exists ? '✅' : '❌'} ${imagePath}`);

            if (exists) {
                const stats = fs.statSync(imagePath);
                console.log(`      Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
            }
        });

        console.log('\n🎉 Prueba de Gaia completada!');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        console.error(error.stack);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testGaiaDownload().catch(console.error);
}
