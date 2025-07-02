// Script para importar las cartas Sacred Beasts del game_completion_bonus.json a CardObtention
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import CardObtention from '../models/CardObtention.js';

// Configuración de rutas para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constantes
const BONUS_CARDS_FILE = path.join(__dirname, 'data', 'game_completion_bonus.json');

// Función principal
async function importGameCompletionBonus() {
    try {
        console.log('Iniciando importación de cartas Sacred Beasts como bonificación de completion...');

        // Sincronizar modelos con la base de datos
        await sequelize.sync({ alter: true });

        // Leer el archivo JSON con las cartas Sacred Beasts
        const bonusCards = JSON.parse(fs.readFileSync(BONUS_CARDS_FILE, 'utf8'));

        console.log(`Se encontraron ${bonusCards.length} cartas Sacred Beasts para importar.`);

        // Estadísticas
        let cardsFound = 0;
        let cardsNotFound = 0;
        let obtentionsCreated = 0;
        let obtentionsExisted = 0;
        const notFoundCards = [];

        // Procesar cada carta
        for (const bonusCard of bonusCards) {
            console.log(`\nProcesando carta: ${bonusCard.name}`);

            // Buscar la carta en la base de datos por nombre
            const card = await Card.findOne({
                where: { name: bonusCard.name }
            });

            if (!card) {
                console.log(`⚠️ Carta no encontrada en la base de datos: ${bonusCard.name}`);
                cardsNotFound++;
                notFoundCards.push(bonusCard.name);
                continue;
            }

            cardsFound++;
            console.log(`✅ Carta encontrada: ${card.name} (ID: ${card.id})`);

            // Verificar si la carta ya tiene una obtención de tipo bonus
            const existingObtention = await CardObtention.findOne({
                where: {
                    cardId: card.id,
                    method: 'bonus'
                }
            });

            if (existingObtention) {
                console.log(`ℹ️ La carta ya tiene una obtención de tipo bonus registrada.`);
                obtentionsExisted++;
                continue;
            }

            // Crear una nueva entrada en CardObtention
            await CardObtention.create({
                cardId: card.id,
                method: 'bonus',
                sourceId: 'game_completion',
                sourceName: 'Game Completion Reward',
                details: {
                    type: 'Game Completion',
                    description: 'Sacred Beast obtenido como recompensa por completar el juego'
                }
            });

            obtentionsCreated++;
            console.log(`✅ Obtención creada para ${card.name}`);
        }

        // Mostrar estadísticas finales
        console.log('\n===== RESUMEN DE IMPORTACIÓN =====');
        console.log(`Total de cartas procesadas: ${bonusCards.length}`);
        console.log(`Cartas encontradas: ${cardsFound}`);
        console.log(`Cartas no encontradas: ${cardsNotFound}`);
        console.log(`Obtenciones ya existentes: ${obtentionsExisted}`);
        console.log(`Obtenciones creadas: ${obtentionsCreated}`);

        if (notFoundCards.length > 0) {
            console.log('\nCartas no encontradas:');
            notFoundCards.forEach(name => console.log(`- ${name}`));
            
            // Guardar en archivo las cartas no encontradas
            fs.writeFileSync(
                path.join(__dirname, 'data', 'game_completion_bonus_not_found.json'),
                JSON.stringify(notFoundCards, null, 2),
                'utf8'
            );
        }

        console.log('\nProceso de importación completado.');

    } catch (error) {
        console.error('Error durante la importación:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
    }
}

// Ejecutar la función principal
importGameCompletionBonus().catch(err => {
    console.error('Error fatal durante la importación:', err);
    process.exit(1);
});
