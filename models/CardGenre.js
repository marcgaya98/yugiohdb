import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';
import Genre from './Genre.js';

const CardGenre = sequelize.define('CardGenre', {}, { tableName: 'card_genres', timestamps: false });

export default CardGenre;