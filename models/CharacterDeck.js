import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Character from './Character.js';
import Deck from './Deck.js';

const CharacterDeck = sequelize.define('CharacterDeck', {
    characterId: {
        type: DataTypes.INTEGER,
        references: { model: Character, key: 'id' },
        allowNull: false,
    },
    deckId: {
        type: DataTypes.INTEGER,
        references: { model: Deck, key: 'id' },
        allowNull: false,
    }
}, {
    tableName: 'character_deck',
    timestamps: false,
});

export default CharacterDeck;