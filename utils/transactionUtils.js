/**
 * Utilidades para manejar transacciones y operaciones de base de datos
 * que requieren integridad referencial entre múltiples tablas.
 */
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';

/**
 * Ejecuta una función dentro de una transacción, con manejo automático
 * de commit y rollback en caso de éxito o fallo.
 * 
 * @param {Function} callback - Función a ejecutar dentro de la transacción
 * @param {Object} options - Opciones adicionales para la transacción
 * @returns {Promise<*>} Resultado de la función callback
 * @throws {Error} Si hay un error en la transacción
 */
export const withTransaction = async (callback, options = {}) => {
    const transaction = await sequelize.transaction(options);

    try {
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Funciones de utilidad para operaciones comunes en la base de datos
 * que requieren transacciones y mantienen la integridad referencial
 */

/**
 * Crear una carta completa (Card + tipo específico) en una transacción
 * 
 * @param {Object} cardData - Datos de la carta base
 * @param {Object} specificData - Datos específicos del tipo de carta
 * @returns {Promise<Object>} Carta creada con datos completos
 */
export const createFullCard = async (cardData, specificData) => {
    return withTransaction(async (t) => {
        // 1. Crear la carta base
        const card = await Card.create(cardData, { transaction: t });

        // 2. Crear el registro específico según tipo
        if (cardData.cardType === 'Monster') {
            await MonsterCard.create({
                ...specificData,
                cardId: card.id
            }, { transaction: t });
        } else if (cardData.cardType === 'Spell') {
            await SpellCard.create({
                ...specificData,
                cardId: card.id
            }, { transaction: t });
        } else if (cardData.cardType === 'Trap') {
            await TrapCard.create({
                ...specificData,
                cardId: card.id
            }, { transaction: t });
        }

        // 3. Devolver la carta completa
        return Card.findByPk(card.id, {
            include: [
                { model: MonsterCard, as: 'monsterData', required: false },
                { model: SpellCard, as: 'spellData', required: false },
                { model: TrapCard, as: 'trapData', required: false }
            ],
            transaction: t
        });
    });
};
