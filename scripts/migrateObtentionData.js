import sequelize from '../config/database.js';
import CardObtention from '../models/CardObtention.js';
import CardPackObtention from '../models/CardPackObtention.js';
import CardConverterObtention from '../models/CardConverterObtention.js';
import CardCharacterObtention from '../models/CardCharacterObtention.js';
import CardTutorialObtention from '../models/CardTutorialObtention.js';
import CardInitialDeck from '../models/CardInitialDeck.js';

/**
 * Script para migrar datos desde el modelo genérico CardObtention
 * a los modelos específicos de obtención
 */
async function migrateObtentionData() {
    try {
        console.log('Iniciando migración de datos de obtención...');

        // Autenticación con la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // 1. Migración de datos de packs
        console.log('\n--- Migrando datos de packs ---');
        const packObtentions = await CardObtention.findAll({
            where: { method: 'pack' }
        });

        console.log(`Encontradas ${packObtentions.length} entradas de packs para migrar.`);

        for (const packObtention of packObtentions) {
            try {
                await CardPackObtention.findOrCreate({
                    where: {
                        cardId: packObtention.cardId,
                        packId: packObtention.sourceId
                    },
                    defaults: {
                        cardId: packObtention.cardId,
                        packId: packObtention.sourceId
                    }
                });
            } catch (error) {
                console.error(`Error al migrar pack para carta ${packObtention.cardId}:`, error.message);
            }
        }
        console.log('Migración de packs completada.');

        // 2. Migración de datos de convertidor
        console.log('\n--- Migrando datos de convertidor ---');
        const converterObtentions = await CardObtention.findAll({
            where: { method: 'converter' }
        });

        console.log(`Encontradas ${converterObtentions.length} entradas de convertidor para migrar.`);

        for (const converterObtention of converterObtentions) {
            try {
                // Extraer número de cartas requeridas de los detalles
                // Formato esperado: "Requiere X carta(s)"
                const cardsRequiredMatch = converterObtention.details?.match(/Requiere (\d+) carta/);
                const cardsRequired = cardsRequiredMatch ? parseInt(cardsRequiredMatch[1]) : 1;

                await CardConverterObtention.findOrCreate({
                    where: {
                        cardId: converterObtention.cardId
                    },
                    defaults: {
                        cardId: converterObtention.cardId,
                        cardsRequired: cardsRequired
                    }
                });
            } catch (error) {
                console.error(`Error al migrar convertidor para carta ${converterObtention.cardId}:`, error.message);
            }
        }
        console.log('Migración de convertidor completada.');

        // 3. Migración de datos de personajes
        console.log('\n--- Migrando datos de personajes ---');
        const characterObtentions = await CardObtention.findAll({
            where: { method: 'victory' }
        });

        console.log(`Encontradas ${characterObtentions.length} entradas de personajes para migrar.`);

        for (const characterObtention of characterObtentions) {
            try {
                // Extraer nivel de confianza y cantidad de los detalles
                // Formato esperado: "Trust Level X. Cantidad: Y"
                const trustLevelMatch = characterObtention.details?.match(/Trust Level (\d+)/i);
                const quantityMatch = characterObtention.details?.match(/Cantidad: (\d+)/i);

                const requiredTrust = trustLevelMatch ? parseInt(trustLevelMatch[1]) : 1;
                const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

                await CardCharacterObtention.findOrCreate({
                    where: {
                        cardId: characterObtention.cardId,
                        characterId: characterObtention.sourceId
                    },
                    defaults: {
                        cardId: characterObtention.cardId,
                        characterId: characterObtention.sourceId,
                        requiredTrust: requiredTrust,
                        quantity: quantity
                    }
                });
            } catch (error) {
                console.error(`Error al migrar personaje para carta ${characterObtention.cardId}:`, error.message);
            }
        }
        console.log('Migración de personajes completada.');

        // 4. Migración de datos de tutoriales
        console.log('\n--- Migrando datos de tutoriales ---');
        const tutorialObtentions = await CardObtention.findAll({
            where: { method: 'tutorial' }
        });

        console.log(`Encontradas ${tutorialObtentions.length} entradas de tutoriales para migrar.`);

        for (const tutorialObtention of tutorialObtentions) {
            try {
                // Extraer día del tutorial de los detalles o del nombre de la fuente
                // Formato esperado en detalles: "Día X del tutorial"
                // Formato esperado en sourceName: "Tutorial - Día X"
                let day = 1;

                const dayDetailsMatch = tutorialObtention.details?.match(/Día (\d+)/i);
                const dayNameMatch = tutorialObtention.sourceName?.match(/Día (\d+)/i);

                if (dayDetailsMatch) {
                    day = parseInt(dayDetailsMatch[1]);
                } else if (dayNameMatch) {
                    day = parseInt(dayNameMatch[1]);
                }

                await CardTutorialObtention.findOrCreate({
                    where: {
                        cardId: tutorialObtention.cardId,
                        day: day
                    },
                    defaults: {
                        cardId: tutorialObtention.cardId,
                        day: day
                    }
                });
            } catch (error) {
                console.error(`Error al migrar tutorial para carta ${tutorialObtention.cardId}:`, error.message);
            }
        }
        console.log('Migración de tutoriales completada.');

        // 5. Migración de datos de mazo inicial
        console.log('\n--- Migrando datos de mazo inicial ---');
        const initialDeckObtentions = await CardObtention.findAll({
            where: { method: 'initial' }
        });

        console.log(`Encontradas ${initialDeckObtentions.length} entradas de mazo inicial para migrar.`);

        for (const initialDeckObtention of initialDeckObtentions) {
            try {
                // Extraer cantidad del mazo inicial de los detalles
                // Formato esperado: "Cantidad en mazo inicial: X"
                const quantityMatch = initialDeckObtention.details?.match(/Cantidad.*?: (\d+)/i);
                const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

                await CardInitialDeck.findOrCreate({
                    where: {
                        cardId: initialDeckObtention.cardId
                    },
                    defaults: {
                        cardId: initialDeckObtention.cardId,
                        quantity: quantity
                    }
                });
            } catch (error) {
                console.error(`Error al migrar mazo inicial para carta ${initialDeckObtention.cardId}:`, error.message);
            }
        }
        console.log('Migración de mazo inicial completada.');

        console.log('\n¡Migración de datos completada con éxito!');
        console.log('IMPORTANTE: Los datos no se eliminan del modelo CardObtention original.');
        console.log('            Puede eliminarlos manualmente después si lo desea.');
    } catch (error) {
        console.error('Ocurrió un error durante la migración de datos:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función
migrateObtentionData();
