// scripts/compressJpegWithSharp.js
// Comprime todos los .jpg en normal, small y cropped usando sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const variants = [
    'public/images/cards/normal',
    'public/images/cards/small',
    'public/images/cards/cropped',
];

variants.forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.jpg')) {
            const filePath = path.join(dir, file);
            // Lee, comprime y sobreescribe
            sharp(filePath)
                .jpeg({ quality: 85 })
                .toBuffer()
                .then(data => {
                    fs.writeFileSync(filePath, data);
                    console.log(`JPEG comprimido: ${filePath}`);
                })
                .catch(err => console.error(`Error con ${filePath}:`, err));
        }
    });
});

console.log('Compresión JPEG lanzada para normal, small y cropped.');
