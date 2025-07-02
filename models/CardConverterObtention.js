import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';

/**
 * Modelo específico para la obtención de cartas mediante el convertidor
 * Esto permite una estructura más detallada y específica para este método de obtención
 */
class CardConverterObtention extends Model { }

CardConverterObtention.init({
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Card, key: 'id' },
        primaryKey: true,
        comment: 'ID de la carta que se puede obtener'
    },
    cardsRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        comment: 'Número de cartas que hay que insertar para conseguir esta carta'
    }
}, {
    sequelize,
    modelName: 'card_converter_obtention',
    tableName: 'card_converter_obtention',
    timestamps: false,
    indexes: [
        { fields: ['cardId'] },
        { fields: ['cardsRequired'] }
    ]
});

// Las asociaciones se definen centralmente en associations.js
export default CardConverterObtention;
