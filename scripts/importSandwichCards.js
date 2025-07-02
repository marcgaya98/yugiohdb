import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import CardSandwichObtention from '../models/CardSandwichObtention.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Importador de cartas obtenidas con Plain Sandwich
 * Si el jugador recibe un Plain Sandwich en la tienda, recibe una carta oculta
 */
async function importSandwichCards() {
    try {
        console.log('Iniciando importación de cartas de Plain Sandwich...');

        // Autenticación con la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Crear la tabla si no existe
        await CardSandwichObtention.sync({ force: false });
        console.log('Tabla card_sandwich_obtention sincronizada.');

        // Leer el archivo JSON
        const filePath = path.join(__dirname, '..', 'data', 'sandwichCards.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sandwichCards = JSON.parse(fileContent);

        console.log(`Se encontraron ${sandwichCards.length} cartas de sandwich para importar.`);

        // Procesar cada carta
        let imported = 0;
        let errors = 0;

        for (const sandwichCard of sandwichCards) {
            try {
                // Primero buscamos por ID
                let card = await Card.findOne({
                    where: { id: sandwichCard.id }
                });

                // Si no encontramos por ID, buscamos por nombre
                if (!card) {
                    card = await Card.findOne({
                        where: { name: sandwichCard.name }
                    });
                }

                // Si aún no encontramos, buscamos por nombre alternativo
                if (!card) {
                    card = await Card.findOne({
                        where: { alter_name: sandwichCard.name }
                    });
                }

                // Si encontramos la carta, creamos o actualizamos su obtención
                if (card) {
                    const [sandwichObtention, created] = await CardSandwichObtention.findOrCreate({
                        where: { cardId: card.id },
                        defaults: {
                            cardId: card.id,
                            rarity: sandwichCard.rarity || 'Common'
                        }
                    });

                    // Si ya existía, actualizamos sus datos
                    if (!created) {
                        await sandwichObtention.update({
                            rarity: sandwichCard.rarity || 'Common'
                        });
                    }

                    console.log(`Carta "${card.name}" (ID: ${card.id}) ${created ? 'importada' : 'actualizada'} correctamente.`);
                    imported++;
                } else {
                    console.error(`No se encontró la carta con ID ${sandwichCard.id} o nombre "${sandwichCard.name}".`);
                    errors++;
                }
            } catch (error) {
                console.error(`Error al importar la carta ${sandwichCard.name || sandwichCard.id}:`, error.message);
                errors++;
            }
        }

        console.log('\n--- Resumen de importación ---');
        console.log(`Total de cartas procesadas: ${sandwichCards.length}`);
        console.log(`Cartas importadas/actualizadas: ${imported}`);
        console.log(`Errores: ${errors}`);

        console.log('\n¡Importación completada!');
    } catch (error) {
        console.error('Ocurrió un error durante la importación:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función
importSandwichCards();
