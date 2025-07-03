import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Genre = sequelize.define('Genre', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    category: {
        type: DataTypes.ENUM(
            'Destruction',
            'Monster categories',
            'Disruption',
            'Support',
            'Hand',
            'Battle',
            'Life Points',
            'Items',
            'Summoning',
            'Misc'
        ),
        allowNull: false
    }
}, {
    tableName: 'genres',
    timestamps: false,
});

// Las asociaciones se definen en el archivo associations.js

export default Genre;