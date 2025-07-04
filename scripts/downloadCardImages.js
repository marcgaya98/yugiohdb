/**
 * Script para descargar todas las imágenes de cartas desde YGOPRODeck
 * y almacenarlas localmente en tres formatos: normal, small, cropped
 */
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import Card from '../models/Card.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageDownloader {
    constructor() {
        this.imageTypes = [
            { name: 'normal', urlSuffix: '', folder: 'normal' },
            { name: 'small', urlSuffix: '_small', folder: 'small' },
            { name: 'cropped', urlSuffix: '_cropped', folder: 'cropped' }
        ];

        this.baseImageDir = path.join(__dirname, '../public/images/cards');
        this.maxConcurrent = 10; // Límite de descargas simultáneas
        this.retryAttempts = 3;
        this.downloadedCount = 0;
        this.failedCount = 0;
        this.skippedCount = 0;
    }

    /**
     * Crear directorios necesarios para las imágenes
     */
    createDirectories() {
        console.log('📁 Creando estructura de directorios...');

        this.imageTypes.forEach(type => {
            const dir = path.join(this.baseImageDir, type.folder);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`   ✅ Creado: ${dir}`);
            } else {
                console.log(`   ⏭️  Ya existe: ${dir}`);
            }
        });
    }

    /**
     * Verificar si una imagen ya existe localmente
     */
    imageExists(password, type) {
        const normalizedPassword = normalizePasswordForUrl(password);
        const imagePath = path.join(this.baseImageDir, type.folder, `${normalizedPassword}.jpg`);
        return fs.existsSync(imagePath);
    }

    /**
     * Descargar una imagen específica
     */
    async downloadImage(url, filePath, attempts = 0) {
        try {
            const response = await fetch(url, {
                timeout: 30000, // 30 segundos de timeout
                headers: {
                    'User-Agent': 'YuGiOhDB/1.0 (Image Cache System)'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Verificar que es una imagen válida
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`Tipo de contenido inválido: ${contentType}`);
            }

            // Crear directorio si no existe
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Escribir archivo
            const fileStream = fs.createWriteStream(filePath);

            return new Promise((resolve, reject) => {
                response.body.pipe(fileStream);
                response.body.on('error', reject);
                fileStream.on('finish', () => {
                    // Verificar que el archivo se escribió correctamente
                    const stats = fs.statSync(filePath);
                    if (stats.size === 0) {
                        fs.unlinkSync(filePath); // Eliminar archivo vacío
                        reject(new Error('Archivo descargado está vacío'));
                    } else {
                        resolve();
                    }
                });
                fileStream.on('error', reject);
            });

        } catch (error) {
            if (attempts < this.retryAttempts) {
                console.log(`   ⚠️  Reintentando descarga (${attempts + 1}/${this.retryAttempts}): ${url}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1))); // Delay progresivo
                return this.downloadImage(url, filePath, attempts + 1);
            }
            throw error;
        }
    }

    /**
     * Descargar todas las imágenes de una carta
     */
    async downloadCardImages(card) {
        const password = card.password;
        if (!password) {
            console.log(`   ⚠️  Carta sin password: ${card.name}`);
            return false;
        }

        let hasNewDownloads = false;
        const downloads = [];
        const normalizedPassword = normalizePasswordForUrl(password);

        // Verificar qué imágenes necesitan descargarse
        for (const imageType of this.imageTypes) {
            if (!this.imageExists(password, imageType)) {
                const url = `https://images.ygoprodeck.com/images/cards${imageType.urlSuffix}/${normalizedPassword}.jpg`;
                const filePath = path.join(this.baseImageDir, imageType.folder, `${normalizedPassword}.jpg`);

                downloads.push({
                    type: imageType.name,
                    url,
                    filePath
                });
            }
        }

        if (downloads.length === 0) {
            this.skippedCount++;
            return false; // Ya todas existen
        }

        try {
            // Descargar todas las variantes de la carta en paralelo
            await Promise.all(downloads.map(async (download) => {
                await this.downloadImage(download.url, download.filePath);
                console.log(`   ✅ ${download.type}: ${normalizedPassword}`);
            }));

            this.downloadedCount += downloads.length;
            hasNewDownloads = true;

        } catch (error) {
            console.error(`   ❌ Error descargando ${card.name} (${password}): ${error.message}`);
            this.failedCount++;
        }

        return hasNewDownloads;
    }

    /**
     * Procesar cartas en lotes para evitar sobrecarga
     */
    async processCardsInBatches(cards, batchSize = 10) {
        console.log(`🚀 Procesando ${cards.length} cartas en lotes de ${batchSize}...`);

        for (let i = 0; i < cards.length; i += batchSize) {
            const batch = cards.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(cards.length / batchSize);

            console.log(`\n📦 Lote ${batchNumber}/${totalBatches} (cartas ${i + 1}-${Math.min(i + batchSize, cards.length)})`);

            // Procesar lote en paralelo
            await Promise.all(batch.map(card => this.downloadCardImages(card)));

            // Mostrar progreso
            const progress = ((i + batchSize) / cards.length * 100).toFixed(1);
            console.log(`   📊 Progreso: ${progress}% | Descargadas: ${this.downloadedCount} | Omitidas: ${this.skippedCount} | Fallos: ${this.failedCount}`);

            // Pequeña pausa entre lotes para ser respetuoso con el servidor
            if (i + batchSize < cards.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    /**
     * Ejecutar descarga completa
     */
    async run() {
        const startTime = Date.now();

        console.log('🎴 Iniciando descarga masiva de imágenes de cartas Yu-Gi-Oh!');
        console.log('='.repeat(60));

        try {
            // Crear directorios
            this.createDirectories();

            // Obtener todas las cartas de la base de datos
            console.log('\n📚 Obteniendo cartas de la base de datos...');
            const cards = await Card.findAll({
                attributes: ['id', 'password', 'name'],
                where: {
                    password: {
                        [Card.sequelize.Sequelize.Op.not]: null
                    }
                }
            });

            console.log(`   ✅ Encontradas ${cards.length} cartas con password`);

            if (cards.length === 0) {
                console.log('❌ No hay cartas para procesar');
                return;
            }

            // Procesar cartas
            await this.processCardsInBatches(cards, this.maxConcurrent);

            // Estadísticas finales
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

            console.log('\n' + '='.repeat(60));
            console.log('📊 RESUMEN FINAL:');
            console.log(`   ⏱️  Tiempo total: ${duration} minutos`);
            console.log(`   ✅ Imágenes descargadas: ${this.downloadedCount}`);
            console.log(`   ⏭️  Cartas omitidas (ya existían): ${this.skippedCount}`);
            console.log(`   ❌ Fallos: ${this.failedCount}`);
            console.log(`   📁 Ubicación: ${this.baseImageDir}`);

            if (this.failedCount > 0) {
                console.log('\n⚠️  Algunas descargas fallaron. Puedes ejecutar el script nuevamente para reintentar.');
            } else {
                console.log('\n🎉 ¡Descarga completada exitosamente!');
            }

        } catch (error) {
            console.error('\n💥 Error fatal durante la descarga:', error.message);
            process.exit(1);
        }
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const downloader = new ImageDownloader();
    downloader.run().catch(console.error);
}

export default ImageDownloader;
