import { readFileSync, writeFileSync } from 'fs';

// Leer archivos
const cards = JSON.parse(readFileSync('cards.json', 'utf8'));
const cardsNotFound = JSON.parse(readFileSync('cards_not_found.json', 'utf8'));

// Convertir los codes a número por seguridad (si están como strings)
const codesToFind = cardsNotFound.map(Number);

// Filtrar las cartas cuyos codes están en la lista
const filteredCards = cards.filter(card => codesToFind.includes(card.Code));

// Guardar el resultado en un nuevo archivo
writeFileSync('filtered_cards.json', JSON.stringify(filteredCards, null, 2), 'utf8');

console.log(`Se guardaron ${filteredCards.length} cartas en filtered_cards.json`);
