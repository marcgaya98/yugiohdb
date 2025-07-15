import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo MentionedCard
 * Relaciona una carta con otra carta mencionada en su descripción.
 */
class MentionedCard extends Model { }

MentionedCard.init({
    /**
     * ID de la carta que menciona (card.id)
     * @type {number}
     */
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'card', key: 'id' },
        comment: 'ID de la carta que menciona a otra'
    },
    /**
     * ID de la carta mencionada (card.id)
     * @type {number}
     */
    mentionedCardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'card', key: 'id' },
        comment: 'ID de la carta mencionada'
    }
}, {
    sequelize,
    modelName: 'MentionedCard',
    tableName: 'mentioned_card',
    timestamps: false,
    indexes: [
        { fields: ['cardId'] },
        { fields: ['mentionedCardId'] },
        { unique: true, fields: ['cardId', 'mentionedCardId'] }
    ]
});

export default MentionedCard;
