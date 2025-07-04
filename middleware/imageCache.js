/**
 * Middleware para servir imágenes de cartas con caché inteligente
 * Descarga automáticamente imágenes si no existen localmente
 */
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageCacheMiddleware {
    constructor() {
        this.baseImageDir = path.join(__dirname, '../public/images/cards');
        this.validTypes = ['normal', 'small', 'cropped'];
        this.downloadQueue = new Map(); // Para evitar descargas duplicadas
    }

    /**
     * Generar URL de YGOPRODeck según el tipo de imagen
     */
    generateExternalUrl(password, type) {
        const suffixes = {
            normal: '',
            small: '_small',
            cropped: '_cropped'
        };

        const normalizedPassword = normalizePasswordForUrl(password);
        return `https://images.ygoprodeck.com/images/cards${suffixes[type]}/${normalizedPassword}.jpg`;
    }

    /**
     * Descargar imagen desde la fuente externa
     */
    async downloadImage(password, type) {
        const cacheKey = `${password}-${type}`;

        // Si ya está en proceso de descarga, esperar
        if (this.downloadQueue.has(cacheKey)) {
            return this.downloadQueue.get(cacheKey);
        }

        const downloadPromise = this._performDownload(password, type);
        this.downloadQueue.set(cacheKey, downloadPromise);

        try {
            const result = await downloadPromise;
            this.downloadQueue.delete(cacheKey);
            return result;
        } catch (error) {
            this.downloadQueue.delete(cacheKey);
            throw error;
        }
    }

    /**
     * Realizar la descarga efectiva
     */
    async _performDownload(password, type) {
        const url = this.generateExternalUrl(password, type);
        const normalizedPassword = normalizePasswordForUrl(password);
        const imagePath = path.join(this.baseImageDir, type, `${normalizedPassword}.jpg`);

        try {
            console.log(`📥 Descargando imagen: ${password} -> ${normalizedPassword} (${type})`);

            const response = await fetch(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'YuGiOhDB/1.0 (Image Cache System)',
                    'Accept': 'image/jpeg,image/*,*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Verificar tipo de contenido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`Tipo de contenido inválido: ${contentType}`);
            }

            // Crear directorio si no existe
            const dir = path.dirname(imagePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Escribir archivo
            const fileStream = fs.createWriteStream(imagePath);

            await new Promise((resolve, reject) => {
                response.body.pipe(fileStream);
                response.body.on('error', reject);
                fileStream.on('finish', () => {
                    // Verificar que el archivo se escribió correctamente
                    const stats = fs.statSync(imagePath);
                    if (stats.size === 0) {
                        fs.unlinkSync(imagePath); // Eliminar archivo vacío
                        reject(new Error('Archivo descargado está vacío'));
                    } else {
                        console.log(`✅ Imagen descargada: ${password} -> ${normalizedPassword} (${type}) - ${stats.size} bytes`);
                        resolve();
                    }
                });
                fileStream.on('error', reject);
            });

            return imagePath;

        } catch (error) {
            console.error(`❌ Error descargando imagen ${password} (${type}): ${error.message}`);
            throw error;
        }
    }

    /**
     * Middleware principal
     */
    middleware() {
        return async (req, res, next) => {
            // Solo procesar rutas de imágenes de cartas
            const imageMatch = req.path.match(/^\/images\/cards\/([^\/]+)\/(\d+)\.jpg$/);

            if (!imageMatch) {
                return next();
            }

            const [, type, password] = imageMatch;

            // Validar tipo de imagen
            if (!this.validTypes.includes(type)) {
                return res.status(400).json({
                    error: 'Tipo de imagen inválido',
                    validTypes: this.validTypes
                });
            }

            // Validar password (solo números)
            if (!/^\d+$/.test(password)) {
                return res.status(400).json({
                    error: 'Password de carta inválido'
                });
            }

            const normalizedPassword = normalizePasswordForUrl(password);
            const localPath = path.join(this.baseImageDir, type, `${normalizedPassword}.jpg`);

            try {
                // Si la imagen existe localmente, servirla con caché
                if (fs.existsSync(localPath)) {
                    const stats = fs.statSync(localPath);

                    // Configurar cabeceras de caché agresivo (1 año)
                    res.set({
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
                        'Last-Modified': stats.mtime.toUTCString(),
                        'Content-Type': 'image/jpeg',
                        'Content-Length': stats.size
                    });

                    // Verificar ETag para 304 Not Modified
                    const clientETag = req.get('If-None-Match');
                    const serverETag = `"${stats.mtime.getTime()}-${stats.size}"`;

                    if (clientETag === serverETag) {
                        return res.status(304).end();
                    }

                    return res.sendFile(localPath);
                }

                // Si no existe, intentar descargarla
                await this.downloadImage(password, type);

                // Verificar que se descargó correctamente
                if (fs.existsSync(localPath)) {
                    const stats = fs.statSync(localPath);

                    res.set({
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'Content-Type': 'image/jpeg',
                        'Content-Length': stats.size
                    });

                    return res.sendFile(localPath);
                } else {
                    throw new Error('Error en la descarga');
                }

            } catch (error) {
                console.error(`Error sirviendo imagen ${password} (${type}):`, error.message);

                // Responder con imagen de placeholder o error 404
                return res.status(404).json({
                    error: 'Imagen no disponible',
                    password,
                    type,
                    message: error.message
                });
            }
        };
    }

    /**
     * Middleware para limpiar caché (opcional)
     */
    cleanupMiddleware() {
        return (req, res, next) => {
            if (req.path === '/api/images/cleanup' && req.method === 'POST') {
                try {
                    this.downloadQueue.clear();
                    res.json({
                        message: 'Caché de descargas limpiado',
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    res.status(500).json({
                        error: 'Error limpiando caché',
                        message: error.message
                    });
                }
            } else {
                next();
            }
        };
    }

    /**
     * Middleware para estadísticas de imágenes
     */
    statsMiddleware() {
        return (req, res, next) => {
            if (req.path === '/api/images/stats' && req.method === 'GET') {
                try {
                    const stats = {
                        downloadQueue: this.downloadQueue.size,
                        imageTypes: this.validTypes,
                        basePath: this.baseImageDir,
                        timestamp: new Date().toISOString()
                    };

                    // Contar archivos en cada directorio
                    this.validTypes.forEach(type => {
                        const typeDir = path.join(this.baseImageDir, type);
                        if (fs.existsSync(typeDir)) {
                            const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.jpg'));
                            stats[`${type}Count`] = files.length;
                        } else {
                            stats[`${type}Count`] = 0;
                        }
                    });

                    res.json(stats);
                } catch (error) {
                    res.status(500).json({
                        error: 'Error obteniendo estadísticas',
                        message: error.message
                    });
                }
            } else {
                next();
            }
        };
    }
}

export default ImageCacheMiddleware;
