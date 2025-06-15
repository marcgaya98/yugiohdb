import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Character from './Character.js';

const CharacterSandwichRating = sequelize.define('CharacterSandwichRating', {
    characterId: {
        type: DataTypes.INTEGER,
        references: { model: Character, key: 'id' },
        allowNull: false,
    },
    sandwich: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false }, // 1-10, ? para random
}, {
    tableName: 'character_sandwich_rating',
    timestamps: false,
});

export default CharacterSandwichRating;