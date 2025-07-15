import Card from '../models/Card.js';
import CardArtwork from '../models/CardArtwork.js';
import fs from 'fs';

/**
 * Script para actualizar CardArtwork con el segundo arte alternativo de cartas que tienen exactamente 2 artes.
 * El campo imageUrl se actualizará con la ruta local del segundo arte.
 */
async function main() {
    const data = JSON.parse(fs.readFileSync('data/alternative_artworks.json', 'utf8'));
    let count = 0;
    for (const [cardName, images] of Object.entries(data)) {
        if (images.length === 2) {
            const second = images[1];
            const card = await Card.findOne({ where: { name: cardName } });
            if (!card) {
                console.warn(`[WARN] No se encontró la carta: ${cardName}`);
                continue;
            }
            const updated = await CardArtwork.update(
                { imageUrl: `/images/cards/normal/${second.normalized_password}.jpg` },
                { where: { cardId: card.id } }
            );
            if (updated[0] > 0) {
                console.log(`[OK] Actualizado artwork alternativo para: ${cardName}`);
                count++;
            } else {
                console.warn(`[WARN] No se actualizó CardArtwork para: ${cardName}`);
            }
        }
    }
    console.log(`Actualizados ${count} artworks alternativos con el segundo arte.`);
}

main();
