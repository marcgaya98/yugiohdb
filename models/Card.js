import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Card = sequelize.define('Card', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    password: {
        type: DataTypes.STRING,
        comment: 'Password de la carta (8 dígitos)',
        validate: {
            is: /^[0-9]{8}$/, // Validación para asegurar que sea un password de 8 dígitos
        }
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
        { fields: ['name'], type: 'FULLTEXT' }, // Optimizado para búsqueda por texto
        { fields: ['cardType'] },
        { fields: ['archetype'] },
        { fields: ['password'] }, // Para consultas por password
        { fields: ['rarity'] },   // Para filtros por rareza
        { fields: ['frame'] },    // Para filtros por tipo de marco
        { fields: ['cardType', 'frame', 'archetype'] } // Índice compuesto para filtros comunes
    ]
});

export default Card;