import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';
import Genre from './Genre.js';

const CardGenre = sequelize.define('CardGenre', {
    cardId: {
        type: DataTypes.INTEGER,
        references: {
            model: Card,
            key: 'id'
        },
        primaryKey: true
    },
    genreId: {
        type: DataTypes.INTEGER,
        references: {
            model: Genre,
            key: 'id'
        },
        primaryKey: true
    }
}, {
    tableName: 'card_genres',
    timestamps: false,
    indexes: [
        { fields: ['cardId'] },
        { fields: ['genreId'] }
    ]
});

export default CardGenre;