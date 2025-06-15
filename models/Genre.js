import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import GenreCategory from './GenreCategory.js';

const Genre = sequelize.define('Genre', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: 'genres',
    timestamps: false,
});

Genre.belongsTo(GenreCategory, { foreignKey: 'categoryId', as: 'category' });
GenreCategory.hasMany(Genre, { foreignKey: 'categoryId', as: 'genres' });

export default Genre;