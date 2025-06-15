import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';

class CardObtention extends Model { }

CardObtention.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Card, key: 'id' },
        comment: 'ID de la carta que se puede obtener'
    },
    method: {
        type: DataTypes.ENUM(
            'pack',         // Sobres de la tienda
            'victory',      // Victoria contra personajes
            'converter',    // Conversor de cartas
            'download',     // Cartas descargables
            'bonus',        // Bonus (Sacred Beasts, Connectivity)
            'hidden',       // Cartas escondidas (Plain Sandwich)
            'tutorial',     // Recompensas de tutoriales
            'initial'       // Mazo inicial
        ),
        allowNull: false,
        comment: 'Método por el cual se obtiene la carta'
    },
    sourceId: {
        type: DataTypes.STRING,
        comment: 'ID de la fuente (pack, personaje, converter)'
    },
    sourceName: {
        type: DataTypes.STRING,
        comment: 'Nombre de la fuente'
    },
    details: {
        type: DataTypes.JSON,
        comment: 'Información adicional del método de obtención'
        /* 
          Estructura recomendada según método:
          
          - pack: { 
              cost: 100, 
              unlock_condition: "Available from the start",
              part: 1,
              day: "Monday" (opcional)
            }
            
          - victory: {
              quantity: 1,
              trust_required: true|false
            }
            
          - converter: {
              cards_required: 1
            }
            
          - bonus: {
              type: "Game Completion"|"Connectivity"
            }
        */
    }
}, {
    sequelize,
    modelName: 'card_obtention',
    timestamps: false,
    indexes: [
        { fields: ['cardId'] },
        { fields: ['method'] },
        { fields: ['sourceId'] }
    ]
});

export default CardObtention;