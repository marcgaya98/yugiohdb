import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Card = sequelize.define('Card', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: false },
    password: {
        type: DataTypes.STRING,
        comment: 'Password de la carta (8 dígitos)'
    },
    rarity: {
        type: DataTypes.ENUM('ultra', 'super', 'rare', 'common'),
        allowNull: false,
    },
    limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 3
        }
    },
    frame: {
        type: DataTypes.ENUM('normal', 'effect', 'fusion', 'ritual', 'spell', 'trap', 'token'),
        allowNull: false,
    },
    archetype: { type: DataTypes.STRING },
    cardType: {
        type: DataTypes.ENUM('Monster', 'Spell', 'Trap'),
        allowNull: false
    },
    alter_name: { type: DataTypes.STRING }
}, {
    tableName: 'card',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['code'] },
        { fields: ['name'] },
        { fields: ['cardType'] },
        { fields: ['archetype'] },
        { fields: ['password'] } // Añadir índice para consultas por password
    ]
});

export default Card;