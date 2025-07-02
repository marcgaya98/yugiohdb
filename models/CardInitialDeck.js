import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';

/**
 * Modelo para las cartas que forman parte del mazo inicial del jugador
 * 
 * Este modelo representa las cartas con las que el jugador comienza el juego,
 * formando un mazo WATER de 42 cartas idéntico al utilizado por Gillian.
 */
class CardInitialDeck extends Model { }

CardInitialDeck.init({
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Card,
            key: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        primaryKey: true,
        comment: 'ID de la carta que forma parte del mazo inicial'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 3 // Límite máximo de copias por carta en Yu-Gi-Oh!
        },
        comment: 'Cantidad de copias de esta carta en el mazo inicial'
    }
}, {
    sequelize,
    modelName: 'card_initial_deck',
    tableName: 'card_initial_deck',
    timestamps: false,
    indexes: [
        {
            fields: ['cardId'],
            name: 'idx_card_initial_deck_card'
        }
    ]
});

export default CardInitialDeck;
