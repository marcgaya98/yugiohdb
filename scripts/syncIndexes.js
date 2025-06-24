/**
 * Script para verificar y aplicar todos los índices definidos en los modelos
 * Este script es útil para asegurar que todos los índices estén creados correctamente
 * y para verificar posibles problemas de rendimiento.
 */

import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';
import Genre from '../models/Genre.js';
import CardGenre from '../models/CardGenre.js';
import Deck from '../models/Deck.js';
import DeckCard from '../models/DeckCard.js';
import GenreCategory from '../models/GenreCategory.js';
import CardObtention from '../models/CardObtention.js';
import Character from '../models/Character.js';
import '../models/associations.js';

/**
 * Verifica y aplica todos los índices definidos en los modelos
 */
async function syncIndexes() {
    try {
        console.log('Iniciando sincronización de índices...');

        // Sincronizar los índices de cada modelo
        console.log('Sincronizando índices para Card...');
        await Card.sync({ alter: true, force: false });

        console.log('Sincronizando índices para MonsterCard...');
        await MonsterCard.sync({ alter: true, force: false });

        console.log('Sincronizando índices para SpellCard...');
        await SpellCard.sync({ alter: true, force: false });

        console.log('Sincronizando índices para TrapCard...');
        await TrapCard.sync({ alter: true, force: false });

        console.log('Sincronizando índices para CardGenre...');
        await CardGenre.sync({ alter: true, force: false });

        console.log('Sincronizando índices para DeckCard...');
        await DeckCard.sync({ alter: true, force: false });

        console.log('Sincronizando índices para CardObtention...');
        await CardObtention.sync({ alter: true, force: false });

        console.log('Sincronización de índices completada con éxito.');

        // Lista los índices existentes para verificación
        await listIndexes();
    } catch (error) {
        console.error('Error en la sincronización de índices:', error);
    } finally {
        await sequelize.close();
    }
}

/**
 * Lista todos los índices existentes en la base de datos
 * para verificación manual
 */
async function listIndexes() {
    try {
        console.log('\nListando índices existentes...');

        const [indexes] = await sequelize.query(`
            SELECT 
                TABLE_NAME,
                INDEX_NAME,
                GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS
            FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            GROUP BY TABLE_NAME, INDEX_NAME
            ORDER BY TABLE_NAME, INDEX_NAME
        `);

        console.table(indexes);
    } catch (error) {
        console.error('Error al listar los índices:', error);
    }
}

// Ejecutar la función principal
syncIndexes();
