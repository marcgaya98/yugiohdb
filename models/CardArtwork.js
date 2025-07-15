import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo para representar una carta con arte alternativo.
 * Cada registro representa una variante de arte para una carta base.
 */

class CardArtwork extends Model { }

CardArtwork.init({
    cardId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        comment: 'ID de la carta base (card.id)'
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'URL de la imagen del arte alternativo'
    },
    group: {
        type: DataTypes.ENUM('A', 'B', 'C', 'D'),
        allowNull: true,
        comment: 'Grupo de lotería Tag Force (A, B, C, D) si aplica'
    }
}, {
    sequelize,
    modelName: 'card_artwork',
    tableName: 'card_artwork',
    timestamps: false,
    indexes: [
        { fields: ['cardId'] },
        { fields: ['group'] }
    ]
});

export default CardArtwork;
