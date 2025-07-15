import Card from '../models/Card.js';
import CardArtwork from '../models/CardArtwork.js';
import fetch from 'node-fetch';
import fs from 'fs';


import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

/**
 * Descarga los artes de una carta desde la API, con reintentos.
 */
const BATCH_SIZE = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function fetchArtworksForCard(name) {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (!json.data || !json.data[0] || !json.data[0].card_images) return [];
            return json.data[0].card_images.map(img => ({
                id: img.id,
                image_url: img.image_url,
                image_url_small: img.image_url_small,
                image_url_cropped: img.image_url_cropped,
                normalized_password: normalizePasswordForUrl(img.id.toString())
            }));
        } catch (e) {
            attempt++;
            if (attempt < MAX_RETRIES) {
                console.warn(`[WARN] Reintentando (${attempt}/${MAX_RETRIES}) para ${name}: ${e.message}`);
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
            } else {
                console.warn(`[WARN] No se pudo obtener imágenes para ${name}: ${e.message}`);
                return [];
            }
        }
    }
}

async function processBatch(cards, artworks, start, end) {
    for (let i = start; i < end; i++) {
        const art = cards[i];
        let card = await Card.findByPk(art.cardId);
        if (!card) {
            console.warn(`[WARN] No se encontró la carta base para artwork cardId=${art.cardId}`);
            continue;
        }
        let images = await fetchArtworksForCard(card.name);
        if ((!images || images.length === 0) && card.alter_name) {
            images = await fetchArtworksForCard(card.alter_name);
        }
        artworks[card.name] = images;
        console.log(`[OK] ${card.name}: ${images.length} artes encontrados`);
    }
}


/**
 * Script principal: procesa todas las cartas con artwork alternativo en lotes, maneja errores y muestra progreso.
 */
async function main() {
    try {
        const artworks = {};
        const all = await CardArtwork.findAll();
        for (let i = 0; i < all.length; i += BATCH_SIZE) {
            const end = Math.min(i + BATCH_SIZE, all.length);
            console.log(`Procesando cartas ${i + 1}-${end} de ${all.length}...`);
            await processBatch(all, artworks, i, end);
        }
        fs.writeFileSync('data/alternative_artworks.json', JSON.stringify(artworks, null, 2));
        console.log('Archivo data/alternative_artworks.json generado.');
    } catch (err) {
        console.error('Error general en el script:', err);
        process.exit(1);
    }
}

main();
