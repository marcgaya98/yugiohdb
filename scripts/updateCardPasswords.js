import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import Card from '../models/Card.js';
import sequelize from '../config/database.js';

async function updateCardPasswords() {
    console.log('[START] Actualizando passwords de cartas existentes');

    try {
        // 1. Obtener todas las cartas sin password o con password null
        const cards = await Card.findAll({
            where: sequelize.or(
                { password: null },
                { password: '' }
            ),
            attributes: ['id', 'name', 'code']
        });

        console.log(`[INFO] Total de cartas a actualizar: ${cards.length}`);

        // 2. Procesarlas en lotes de 20
        const batchSize = 20;
        const errores = [];
        const updatedCards = [];
        const notFoundCards = [];

        for (let i = 0; i < cards.length; i += batchSize) {
            const batch = cards.slice(i, i + batchSize);
            const konamiIds = batch.map(card => card.code);

            console.log(`[BATCH] Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(cards.length / batchSize)}, IDs: ${konamiIds.join(',')}`);

            try {
                // 3. Consultar la API con los konami_ids (codes)
                const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?konami_id=${konamiIds.join(',')}&misc=yes`;
                const res = await fetch(url);

                if (!res.ok) {
                    throw new Error(`API respondió con estado ${res.status}: ${await res.text()}`);
                }

                const apiData = await res.json();

                if (!apiData.data || !Array.isArray(apiData.data)) {
                    throw new Error('Formato de respuesta de API inválido');
                }

                // 4. Procesar cada carta del lote
                for (const dbCard of batch) {
                    // Buscar la carta en la respuesta de la API usando el code (konami_id)
                    const apiCard = apiData.data.find(c => {
                        // Aseguramos que misc_info existe y es un array
                        const misc = Array.isArray(c.misc_info) ? c.misc_info[0] : {};
                        // Comparamos konami_id con nuestro code
                        return misc.konami_id && String(misc.konami_id) === dbCard.code;
                    });

                    if (!apiCard) {
                        console.log(`[NOT FOUND] No se encontró información para la carta: ${dbCard.name} (code: ${dbCard.code})`);
                        notFoundCards.push({ id: dbCard.id, name: dbCard.name, code: dbCard.code });
                        continue;
                    }

                    // El password es el ID principal de la carta en la API
                    const password = apiCard.id ? String(apiCard.id) : null;

                    if (!password) {
                        console.log(`[NO ID] La carta ${dbCard.name} no tiene ID en la API`);
                        continue;
                    }

                    // Actualizar la carta en la base de datos
                    await Card.update(
                        { password: password },
                        { where: { konami_id: dbCard.code } }
                    );

                    console.log(`[UPDATED] Password actualizado para ${dbCard.name}: ${password}`);
                    updatedCards.push({ id: dbCard.id, name: dbCard.name, code: dbCard.code, password });
                }
            } catch (error) {
                console.error(`[ERROR] Error procesando lote: ${error.message}`);
                errores.push({
                    lote: i / batchSize + 1,
                    konamiIds,
                    error: error.message
                });
            }

            // Espera para evitar rate limit
            console.log('[WAIT] Esperando 200ms antes del siguiente lote...');
            await new Promise(res => setTimeout(res, 200));
        }

        // 5. Guardar logs de resultados
        fs.writeFileSync(
            path.resolve('./logs/password_update_results.json'),
            JSON.stringify({
                updated: updatedCards,
                notFound: notFoundCards,
                errors: errores
            }, null, 2)
        );

        console.log(`[DONE] Actualización de passwords finalizada.`);
        console.log(`- Cartas actualizadas: ${updatedCards.length}`);
        console.log(`- Cartas no encontradas: ${notFoundCards.length}`);
        console.log(`- Errores: ${errores.length}`);

    } catch (error) {
        console.error(`[FATAL ERROR] ${error.message}`);
        process.exit(1);
    }
}

// Aseguramos que la carpeta de logs exista
if (!fs.existsSync(path.resolve('./logs'))) {
    fs.mkdirSync(path.resolve('./logs'));
}

// Ejecutar la función
updateCardPasswords();