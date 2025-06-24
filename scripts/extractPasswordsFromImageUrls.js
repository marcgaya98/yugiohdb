import Card from '../models/Card.js';
import { Sequelize } from 'sequelize';

/**
 * Script para extraer passwords de las cartas directamente de los image_urls
 * sin necesidad de llamar a la API
 */
async function extractPasswordsFromImageUrls() {
    try {
        console.log('Iniciando extracción de passwords desde URLs de imágenes...');

        // 1. Obtener todas las cartas que tienen image_url pero no password
        const cards = await Card.findAll({
            where: {
                image_url: { [Sequelize.Op.not]: null },
                password: null
            }
        });

        console.log(`Se encontraron ${cards.length} cartas para actualizar.`);
        let totalUpdated = 0;
        let totalFailed = 0;

        // 2. Extraer el password de cada URL de imagen
        for (const card of cards) {
            try {
                // Extraer el password usando una expresión regular
                // La URL tiene formato: https://images.ygoprodeck.com/images/cards/88820235.jpg
                const urlMatch = card.image_url.match(/\/cards\/(\d+)\./);

                if (urlMatch && urlMatch[1]) {
                    // Asegurarse que el password tenga 8 dígitos (añadir ceros a la izquierda si es necesario)
                    let password = urlMatch[1];

                    // Ajustar el password para que siempre tenga 8 dígitos
                    password = password.padStart(8, '0');

                    console.log(`Carta: ${card.name}, Password original: ${urlMatch[1]}, Password ajustado: ${password}`);

                    // Actualizar la carta con el password extraído
                    await Card.update(
                        { password },
                        { where: { id: card.id } }
                    );

                    console.log(`✅ Actualizado ${card.name} con password: ${password} (extraído de URL)`);
                    totalUpdated++;
                } else {
                    console.warn(`⚠️ No se pudo extraer password de la URL: ${card.image_url}`);
                    totalFailed++;
                }
            } catch (error) {
                console.error(`Error procesando carta ${card.name}:`, error);
                console.error(`Detalles del error:`, error.errors ? error.errors.map(e => e.message).join(', ') : error.message);
                totalFailed++;
            }
        }

        console.log('\n=============================================');
        console.log(`Proceso de extracción completado.`);
        console.log(`Total de cartas actualizadas: ${totalUpdated}`);
        console.log(`Total de cartas fallidas: ${totalFailed}`);
        console.log('=============================================');

    } catch (error) {
        console.error('Error en el proceso de extracción:', error);
    }
}

// Ejecutar la función principal
extractPasswordsFromImageUrls();