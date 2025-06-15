import fs from 'fs/promises';
import path from 'path';

async function transformDecks() {
    try {
        // Leer el archivo JSON
        const filePath = path.join(process.cwd(), 'all_decks.json');
        const data = await fs.readFile(filePath, 'utf8');
        const characters = JSON.parse(data);

        // Procesar cada personaje
        for (const character of characters) {
            if (character.decks) {
                // Procesar cada deck del personaje
                for (const deck of character.decks) {
                    // 1. Extraer el nivel del nombre
                    const levelMatch = deck.name?.match(/★(\d+)/);
                    if (levelMatch) {
                        deck.level = parseInt(levelMatch[1], 10); // Convertir a número
                        deck.name = deck.name.replace(/★\d+/, '').trim(); // Eliminar ★N del nombre
                    }

                    // 2. Transformar el formato de las cartas
                    if (deck.cards) {
                        // Eliminar los campos Main Deck y Fusion Deck si existen
                        if ('Main Deck' in deck.cards) {
                            delete deck.cards['Main Deck'];
                        }
                        if ('Fusion Deck' in deck.cards) {
                            delete deck.cards['Fusion Deck'];
                        }
                        // Procesar cada categoría de cartas
                        for (const category in deck.cards) {
                            if (Array.isArray(deck.cards[category])) {
                                // Transformar strings a objetos {name, quantity}
                                deck.cards[category] = deck.cards[category].map(cardString => {
                                    const match = cardString.match(/^(.*?)(?:\s+x(\d+))?$/);

                                    if (match) {
                                        const cardName = match[1].trim();
                                        const quantity = match[2] ? parseInt(match[2], 10) : 1;

                                        return {
                                            name: cardName,
                                            quantity: quantity
                                        };
                                    }

                                    // Si no hay match, mantener el string original (no debería ocurrir)
                                    return { name: cardString, quantity: 1 };
                                });
                            }
                        }
                    }
                }
            }
        }

        // Guardar el JSON modificado
        await fs.writeFile(
            path.join(process.cwd(), 'all_decks_transformed.json'),
            JSON.stringify(characters, null, 2),
            'utf8'
        );

        console.log('✅ Transformación completada con éxito');
    } catch (error) {
        console.error('❌ Error durante la transformación:', error);
    }
}

transformDecks();