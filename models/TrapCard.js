import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TrapCard = sequelize.define('TrapCard', {
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
        type: DataTypes.ENUM('Normal', 'Continuous', 'Counter'),
        allowNull: false,
    }
}, {
    tableName: 'trap_card',
    timestamps: false,
});

export default TrapCard;