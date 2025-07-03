import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Character from './Character.js';

const CharacterSandwichRating = sequelize.define('CharacterSandwichRating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    characterId: {
        type: DataTypes.INTEGER,
        references: { model: Character, key: 'id' },
        allowNull: false,
    },
    sandwich: {
        type: DataTypes.STRING(64),
        allowNull: true
    },
    rating: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'character_sandwich_rating',
    timestamps: false,
    indexes: [
        {
            unique: true,
            name: 'unique_default_response',
            fields: ['characterId', 'rating', 'sandwich']
        }
    ]
});

export default CharacterSandwichRating;