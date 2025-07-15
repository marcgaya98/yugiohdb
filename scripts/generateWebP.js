// scripts/generateWebP.js
// Genera variantes WebP para normal, small y cropped usando sharp

import sharp from 'sharp';
import { mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const variants = [
    { src: 'public/images/cards/normal', out: 'public/images/cards/normal_webp' },
    { src: 'public/images/cards/small', out: 'public/images/cards/small_webp' },
    { src: 'public/images/cards/cropped', out: 'public/images/cards/cropped_webp' },
];

variants.forEach(({ src, out }) => {
    mkdirSync(out, { recursive: true });
    readdirSync(src).forEach(file => {
        if (file.endsWith('.jpg')) {
            const srcPath = join(src, file);
            const outPath = join(out, file.replace('.jpg', '.webp'));
            // Solo genera si no existe
            if (!existsSync(outPath)) {
                sharp(srcPath)
                    .webp({ quality: 80 })
                    .toFile(outPath)
                    .then(() => console.log(`WebP generado: ${outPath}`))
                    .catch(err => console.error(`Error con ${srcPath}:`, err));
            }
        }
    });
});

console.log('Generación de WebP lanzada para normal, small y cropped.');
