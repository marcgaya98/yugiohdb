import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MonsterCard = sequelize.define('MonsterCard', {
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'card',
            key: 'id',
        },
        unique: true,
    },
    attribute: {
        type: DataTypes.ENUM('DARK', 'DIVINE', 'EARTH', 'FIRE', 'LIGHT', 'WATER', 'WIND'),
        allowNull: false,
    },
    effectTrait: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    summonMechanic: {
        type: DataTypes.ENUM('Ritual', 'Fusion'),
        allowNull: true,
    },
    ability: {
        type: DataTypes.ENUM('Flip', 'Toon', 'Spirit', 'Union'),
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM(
            'Aqua', 'Beast', 'Beast-Warrior', 'Dinosaur', 'Divine-Beast',
            'Dragon', 'Fairy', 'Fiend', 'Fish', 'Illusion', 'Insect',
            'Machine', 'Plant', 'Pyro', 'Reptile', 'Rock', 'Sea Serpent',
            'Spellcaster', 'Thunder', 'Warrior', 'Winged Beast', 'Zombie'
        ),
        allowNull: false,
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 12
        }
    },
    attack: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    defense: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'monster_card',
    timestamps: false,
    indexes: [
        { fields: ['attribute'] },
        { fields: ['type'] },
        { fields: ['level'] },
        { fields: ['attack'] },
        { fields: ['defense'] },
        { fields: ['summonMechanic'] },
        { fields: ['effectTrait'] },
        { fields: ['ability'] },
        { fields: ['level', 'attribute', 'type'] },
        { fields: ['attack', 'defense'] },
        { fields: ['type', 'attribute'] },
        { fields: ['level', 'attack', 'defense'] }
    ]
});

export default MonsterCard;