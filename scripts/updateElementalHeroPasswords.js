import fetch from 'node-fetch';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import '../models/associations.js'; // Importar las asociaciones

/**
 * Script para actualizar los passwords de las cartas Elemental HERO
 * usando la API de YGOPRODeck
 */
async function updateElementalHeroPasswords() {
    try {
        console.log('Iniciando actualización de passwords para cartas Elemental HERO...');

        // 1. Obtener todas las cartas Elemental HERO de la base de datos
        const elementalHeroCards = await Card.findAll({
            where: {
                archetype: 'Elemental HERO',
                cardType: 'Monster',
            },
            include: [{
                model: MonsterCard,
                as: 'monsterData',
                where: {
                    summonMechanic: 'Fusion',
                    effectTrait: true,
                },
                required: true,
            }]
        });

        console.log(`Se encontraron ${elementalHeroCards.length} cartas Elemental HERO para actualizar.`);

        // 2. Iterar sobre cada carta y buscar su password (id) en la API
        for (const card of elementalHeroCards) {
            try {
                console.log(`Procesando: ${card.name}`);

                // Consultar la API para obtener los detalles de la carta
                const encodedName = encodeURIComponent(card.name);
                const apiUrl = `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodedName}&misc=yes`;

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    console.error(`Error al consultar API para ${card.name}: ${response.statusText}`);
                    continue;
                }

                const data = await response.json();

                // Verificar si la API devolvió resultados
                if (data.data && data.data.length > 0) {
                    const apiCard = data.data[0];
                    const password = apiCard.id.toString();

                    // Actualizar el password en la base de datos
                    await Card.update(
                        { password },
                        { where: { id: card.id } }
                    );

                    console.log(`✅ Actualizado ${card.name} con password: ${password}`);
                } else {
                    console.warn(`⚠️ No se encontró información API para: ${card.name}`);
                }

                // Pequeña pausa para no sobrecargar la API
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (cardError) {
                console.error(`Error procesando carta ${card.name}:`, cardError);
            }
        }

        console.log('Proceso de actualización completado.');
    } catch (error) {
        console.error('Error en el proceso de actualización:', error);
    }
}

// Ejecutar la función principal
updateElementalHeroPasswords();
