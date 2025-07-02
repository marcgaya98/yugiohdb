import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';

/**
 * Modelo para la obtención de cartas mediante tutoriales
 * 
 * Este modelo representa las cartas que se obtienen como recompensa por asistir
 * a los tutoriales del juego en los diferentes días de la semana.
 */
class CardTutorialObtention extends Model { }

CardTutorialObtention.init({
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Card,
            key: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        primaryKey: true,
        comment: 'ID de la carta que se puede obtener'
    },
    day: {
        type: DataTypes.ENUM('tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
        allowNull: false,
        primaryKey: true,
        comment: 'Día de la semana en que se obtiene la carta por el tutorial'
    }
}, {
    sequelize,
    modelName: 'card_tutorial_obtention',
    tableName: 'card_tutorial_obtention',
    timestamps: false,
    indexes: [
        {
            fields: ['cardId'],
            name: 'idx_card_tutorial_obtention_card'
        },
        {
            fields: ['day'],
            name: 'idx_card_tutorial_obtention_day'
        }
    ]
});

// Las asociaciones se definen centralmente en associations.js
export default CardTutorialObtention;
