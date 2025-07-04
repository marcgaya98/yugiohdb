/**
 * Rutas para gestión de imágenes de cartas
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ImageDownloader from '../scripts/downloadCardImages.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/images/stats
 * Obtener estadísticas de imágenes almacenadas (JPG y WebP)
 */
router.get('/stats', (req, res) => {
    try {
        const baseImageDir = path.join(__dirname, '../public/images/cards');
        const imageTypes = ['normal', 'small', 'cropped'];
        const webpTypes = imageTypes.map(type => `${type}_webp`);

        const stats = {
            baseDirectory: baseImageDir,
            imageTypes,
            webpTypes,
            totalImages: 0,
            totalWebp: 0,
            timestamp: new Date().toISOString()
        };

        // Contar archivos JPG en cada directorio
        imageTypes.forEach(type => {
            const typeDir = path.join(baseImageDir, type);
            if (fs.existsSync(typeDir)) {
                const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.jpg'));
                stats[`${type}Count`] = files.length;
                stats.totalImages += files.length;
                let totalSize = 0;
                files.forEach(file => {
                    const filePath = path.join(typeDir, file);
                    const fileStat = fs.statSync(filePath);
                    totalSize += fileStat.size;
                });
                stats[`${type}Size`] = totalSize;
                stats[`${type}SizeFormatted`] = formatBytes(totalSize);
            } else {
                stats[`${type}Count`] = 0;
                stats[`${type}Size`] = 0;
                stats[`${type}SizeFormatted`] = '0 B';
            }
        });

        // Contar archivos WebP en cada directorio
        webpTypes.forEach(type => {
            const typeDir = path.join(baseImageDir, type);
            if (fs.existsSync(typeDir)) {
                const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.webp'));
                stats[`${type}Count`] = files.length;
                stats.totalWebp += files.length;
                let totalSize = 0;
                files.forEach(file => {
                    const filePath = path.join(typeDir, file);
                    const fileStat = fs.statSync(filePath);
                    totalSize += fileStat.size;
                });
                stats[`${type}Size`] = totalSize;
                stats[`${type}SizeFormatted`] = formatBytes(totalSize);
            } else {
                stats[`${type}Count`] = 0;
                stats[`${type}Size`] = 0;
                stats[`${type}SizeFormatted`] = '0 B';
            }
        });

        // Calcular tamaño total
        const totalSize = imageTypes.reduce((sum, type) => sum + (stats[`${type}Size`] || 0), 0) +
            webpTypes.reduce((sum, type) => sum + (stats[`${type}Size`] || 0), 0);
        stats.totalSize = totalSize;
        stats.totalSizeFormatted = formatBytes(totalSize);

        res.json(stats);
    } catch (error) {
        res.status(500).json({
            error: 'Error obteniendo estadísticas de imágenes',
            message: error.message
        });
    }
});

/**
 * POST /api/images/download
 * Iniciar descarga masiva de imágenes
 */
router.post('/download', async (req, res) => {
    try {
        // Responder inmediatamente y ejecutar descarga en background
        res.json({
            message: 'Descarga de imágenes iniciada en segundo plano',
            timestamp: new Date().toISOString(),
            note: 'Consulta los logs del servidor para ver el progreso'
        });

        // Ejecutar descarga en background
        const downloader = new ImageDownloader();
        downloader.run().catch(error => {
            console.error('Error en descarga masiva de imágenes:', error);
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error iniciando descarga de imágenes',
            message: error.message
        });
    }
});

/**
 * DELETE /api/images/:type/:password
 * Eliminar imagen específica (JPG y WebP)
 */
router.delete('/:type/:password', (req, res) => {
    try {
        const { type, password } = req.params;
        const validTypes = ['normal', 'small', 'cropped'];

        // Validaciones
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Tipo de imagen inválido',
                validTypes
            });
        }

        if (!/^[0-9]+$/.test(password)) {
            return res.status(400).json({
                error: 'Password de carta inválido'
            });
        }

        const normalizedPassword = normalizePasswordForUrl(password);
        const imagePath = path.join(__dirname, '../public/images/cards', type, `${normalizedPassword}.jpg`);
        const webpPath = path.join(__dirname, '../public/images/cards', `${type}_webp`, `${normalizedPassword}.webp`);
        let deleted = [];
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            deleted.push(imagePath);
        }
        if (fs.existsSync(webpPath)) {
            fs.unlinkSync(webpPath);
            deleted.push(webpPath);
        }
        if (deleted.length === 0) {
            return res.status(404).json({
                error: 'Imagen no encontrada',
                paths: [imagePath, webpPath]
            });
        }

        res.json({
            message: 'Imagen(es) eliminada(s) correctamente',
            type,
            password,
            deleted,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error eliminando imagen',
            message: error.message
        });
    }
});

/**
 * DELETE /api/images/cleanup
 * Limpiar imágenes huérfanas (sin carta correspondiente) para JPG y WebP
 */
router.delete('/cleanup', async (req, res) => {
    try {
        const { default: Card } = await import('../models/Card.js');
        const baseImageDir = path.join(__dirname, '../public/images/cards');
        const imageTypes = ['normal', 'small', 'cropped'];
        const webpTypes = imageTypes.map(type => `${type}_webp`);

        // Obtener todos los passwords válidos de la base de datos
        const validCards = await Card.findAll({
            attributes: ['password'],
            where: { password: { [Card.sequelize.Sequelize.Op.not]: null } }
        });

        const validPasswords = new Set(validCards.map(card => card.password));

        let deletedCount = 0;
        let deletedSize = 0;
        const deletedFiles = [];

        // Limpiar JPG
        for (const type of imageTypes) {
            const typeDir = path.join(baseImageDir, type);
            if (!fs.existsSync(typeDir)) continue;

            const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.jpg'));

            for (const file of files) {
                const password = file.replace('.jpg', '');

                // Si el password no existe en la DB, eliminar imagen
                if (!validPasswords.has(password)) {
                    const filePath = path.join(typeDir, file);
                    const fileStat = fs.statSync(filePath);

                    fs.unlinkSync(filePath);
                    deletedCount++;
                    deletedSize += fileStat.size;
                    deletedFiles.push({ type, password, size: fileStat.size, ext: 'jpg' });
                }
            }
        }

        // Limpiar WebP
        for (const type of webpTypes) {
            const typeDir = path.join(baseImageDir, type);
            if (!fs.existsSync(typeDir)) continue;

            const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.webp'));

            for (const file of files) {
                const password = file.replace('.webp', '');

                // Si el password no existe en la DB, eliminar imagen
                if (!validPasswords.has(password)) {
                    const filePath = path.join(typeDir, file);
                    const fileStat = fs.statSync(filePath);

                    fs.unlinkSync(filePath);
                    deletedCount++;
                    deletedSize += fileStat.size;
                    deletedFiles.push({ type, password, size: fileStat.size, ext: 'webp' });
                }
            }
        }

        res.json({
            message: 'Limpieza de imágenes completada',
            deletedCount,
            deletedSize,
            deletedSizeFormatted: formatBytes(deletedSize),
            deletedFiles: deletedFiles.length > 10 ?
                deletedFiles.slice(0, 10).concat([{ note: `... y ${deletedFiles.length - 10} más` }]) :
                deletedFiles,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error durante la limpieza',
            message: error.message
        });
    }
});

/**
 * GET /api/images/missing
 * Obtener lista de cartas que no tienen imágenes descargadas (JPG y WebP)
 */
router.get('/missing', async (req, res) => {
    try {
        const { default: Card } = await import('../models/Card.js');
        const baseImageDir = path.join(__dirname, '../public/images/cards');
        const { limit = 50, offset = 0, type = 'normal', format = 'jpg' } = req.query;

        const validTypes = ['normal', 'small', 'cropped'];
        const validFormats = ['jpg', 'webp'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Tipo de imagen inválido',
                validTypes
            });
        }
        if (!validFormats.includes(format)) {
            return res.status(400).json({
                error: 'Formato inválido',
                validFormats
            });
        }

        // Obtener cartas con password
        const cards = await Card.findAll({
            attributes: ['id', 'name', 'password'],
            where: { password: { [Card.sequelize.Sequelize.Op.not]: null } },
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Filtrar cartas sin imagen
        const missingImages = cards.filter(card => {
            const normalizedPassword = normalizePasswordForUrl(card.password);
            let imagePath;
            if (format === 'jpg') {
                imagePath = path.join(baseImageDir, type, `${normalizedPassword}.jpg`);
            } else {
                imagePath = path.join(baseImageDir, `${type}_webp`, `${normalizedPassword}.webp`);
            }
            return !fs.existsSync(imagePath);
        });

        res.json({
            total: missingImages.length,
            type,
            format,
            cards: missingImages.map(card => ({
                id: card.id,
                name: card.name,
                password: card.password,
                normalizedPassword: normalizePasswordForUrl(card.password),
                expectedPath: format === 'jpg'
                    ? `/images/cards/${type}/${normalizePasswordForUrl(card.password)}.jpg`
                    : `/images/cards/${type}_webp/${normalizePasswordForUrl(card.password)}.webp`
            })),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error obteniendo imágenes faltantes',
            message: error.message
        });
    }
});

/**
 * Función auxiliar para formatear bytes
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default router;
