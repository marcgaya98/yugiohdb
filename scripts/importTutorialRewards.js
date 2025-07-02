import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import CardTutorialObtention from '../models/CardTutorialObtention.js';

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Importa las recompensas de tutoriales desde un archivo JSON a la base de datos
 */
async function importTutorialRewards() {
    try {
        console.log('Iniciando importación de recompensas de tutoriales...');

        // Autenticación con la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Sincronizar el modelo con la base de datos
        await CardTutorialObtention.sync({ force: true });
        console.log('Modelo CardTutorialObtention sincronizado con la base de datos.');

        // Cargar datos del JSON
        const jsonPath = resolve(__dirname, 'data/tutorial_rewards.json');
        const tutorialData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log('Datos de tutoriales cargados correctamente.');

        // Estadísticas
        const stats = {
            processed: 0,
            success: 0,
            failed: 0,
            cardsNotFound: []
        };

        // Procesar cada día y sus cartas
        for (const [day, cards] of Object.entries(tutorialData)) {
            console.log(`\nProcesando recompensas del día: ${day}`);

            for (const cardData of cards) {
                stats.processed++;

                // Buscar la carta por su ID
                const card = await Card.findOne({
                    where: { code: String(cardData.id) }
                });

                if (!card) {
                    console.log(`Carta no encontrada: ${cardData.name} (ID: ${cardData.id})`);
                    stats.cardsNotFound.push({ id: cardData.id, name: cardData.name });
                    stats.failed++;
                    continue;
                }

                try {
                    // Crear registro en CardTutorialObtention
                    await CardTutorialObtention.create({
                        cardId: card.id,
                        day: day
                    });

                    stats.success++;
                    console.log(`Añadida carta "${cardData.name}" (ID: ${card.id}) para el día ${day}`);
                } catch (error) {
                    console.error(`Error al crear registro para carta ${cardData.name}:`, error.message);
                    stats.failed++;
                }
            }
        }

        // Imprimir resumen
        console.log('\n¡Importación completada!');
        console.log(`Total de cartas procesadas: ${stats.processed}`);
        console.log(`Importaciones exitosas: ${stats.success}`);
        console.log(`Importaciones fallidas: ${stats.failed}`);

        if (stats.cardsNotFound.length > 0) {
            console.log('\nCartas no encontradas en la base de datos:');
            stats.cardsNotFound.forEach(card => console.log(`- ${card.name} (ID: ${card.id})`));
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
importTutorialRewards();
