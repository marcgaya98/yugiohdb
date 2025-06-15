import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GenreCategory = sequelize.define('GenreCategory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: 'genre_categories',
    timestamps: false,
});

export default GenreCategory;