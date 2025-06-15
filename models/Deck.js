import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Deck = sequelize.define('Deck', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    level: { type: DataTypes.INTEGER, allowNull: false },
    characterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: { model: 'characters', key: 'id' } // opcional, si deseas integridad referencial
    },
    extraDeck: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'deck',
    timestamps: false,
});

export default Deck;