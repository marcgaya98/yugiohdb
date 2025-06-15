import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SpellCard = sequelize.define('SpellCard', {
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'card',
            key: 'id',
        },
        unique: true,
    },
    type: {
        type: DataTypes.ENUM('Normal', 'Continuous', 'Equip', 'Field', 'Quick-Play', 'Ritual'),
        allowNull: false,
    }
}, {
    tableName: 'spell_card',
    timestamps: false,
});

export default SpellCard;