import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Deck from './Deck.js';
import Card from './Card.js';

const DeckCard = sequelize.define('DeckCard', {
    deckId: {
        type: DataTypes.INTEGER,
        references: { model: Deck, key: 'id' },
        allowNull: false,
    },
    cardId: {
        type: DataTypes.INTEGER,
        references: { model: Card, key: 'id' },
        allowNull: false,
    },
    section: { // 'main', 'fusion', 'extra'
        type: DataTypes.ENUM('main', 'fusion', 'extra'),
        allowNull: false,
    },
    count: { // Número de copias de la carta en ese deck
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    }
}, {
    tableName: 'deck_card',
    timestamps: false,
});

export default DeckCard;