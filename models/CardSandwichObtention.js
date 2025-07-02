import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';

/**
 * Modelo que representa la obtención de cartas a través de sándwiches
 * Si el jugador recibe un Plain Sandwich en la tienda, recibe una carta oculta
 */
const CardSandwichObtention = sequelize.define('card_sandwich_obtention', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'card',
            key: 'id'
        }
    }
}, {
    tableName: 'card_sandwich_obtention',
    timestamps: true,
    underscored: true
});

// Las asociaciones se definen centralmente en associations.js
export default CardSandwichObtention;
