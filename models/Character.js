import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Modelo principal de personaje
const Character = sequelize.define('Character', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    tier: {
        type: DataTypes.ENUM('Tier 1', 'Tier 2', 'Tier 3', 'Non Duelist'),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('Teachers', 'Slifer Red', 'Ra Yellow', 'Obelisk Blue boys', 'Obelisk Blue girls', 'Charisma', null),
        allowNull: true // Permite null para Tier 1, 2 y Non Duelist que no tienen categoría
    },
    image: { type: DataTypes.STRING, allowNull: true },
}, {
    tableName: 'character',
    timestamps: false,
});

export default Character;