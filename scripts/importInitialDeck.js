import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import CardInitialDeck from '../models/CardInitialDeck.js';

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Importa las cartas del mazo inicial del jugador desde un archivo JSON a la base de datos
 */
async function importInitialDeck() {
    try {
        console.log('Iniciando importación del mazo inicial...');

        // Autenticación con la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Sincronizar el modelo con la base de datos
        await CardInitialDeck.sync({ force: true });
        console.log('Modelo CardInitialDeck sincronizado con la base de datos.');

        // Cargar datos del JSON
        const jsonPath = resolve(__dirname, 'data/initial_deck.json');
        const deckData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Datos del mazo inicial cargados: ${deckData.length} cartas.`);

        // Estadísticas
        const stats = {
            processed: 0,
            success: 0,
            failed: 0,
            cardsNotFound: [],
            totalCards: 0 // Para contar el total de cartas (contando copias)
        };

        // Procesar cada carta del mazo inicial
        for (const cardData of deckData) {
            stats.processed++;

            // Buscar la carta por su ID
            const card = await Card.findOne({
                where: { code: String(cardData.id) }
            });

            if (!card) {
                console.log(`Carta no encontrada: ${cardData.name} (ID: ${cardData.id})`);
                stats.cardsNotFound.push({ id: cardData.id, name: cardData.name, quantity: cardData.quantity });
                stats.failed++;
                continue;
            }

            try {
                // Crear registro en CardInitialDeck
                await CardInitialDeck.create({
                    cardId: card.id,
                    quantity: cardData.quantity
                });

                stats.success++;
                stats.totalCards += cardData.quantity;
                console.log(`Añadida carta "${cardData.name}" (ID: ${card.id}) al mazo inicial, cantidad: ${cardData.quantity}`);
            } catch (error) {
                console.error(`Error al crear registro para carta ${cardData.name}:`, error.message);
                stats.failed++;
            }
        }

        // Imprimir resumen
        console.log('\n¡Importación completada!');
        console.log(`Total de cartas únicas procesadas: ${stats.processed}`);
        console.log(`Total de cartas contando copias: ${stats.totalCards}`);
        console.log(`Importaciones exitosas: ${stats.success}`);
        console.log(`Importaciones fallidas: ${stats.failed}`);

        if (stats.cardsNotFound.length > 0) {
            console.log('\nCartas no encontradas en la base de datos:');
            stats.cardsNotFound.forEach(card => console.log(`- ${card.name} (ID: ${card.id}) x${card.quantity}`));
        }

        console.log('\n¡Todo listo!');
    } catch (error) {
        console.error('Ocurrió un error durante la importación:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función de importación
importInitialDeck();
