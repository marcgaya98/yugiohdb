import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';
import Character from './Character.js';

/**
 * Modelo para la obtención de cartas mediante victorias contra personajes
 * Estructura minimalista que solo almacena la relación esencial
 */
class CardCharacterObtention extends Model { }

CardCharacterObtention.init({
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
    characterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Character,
            key: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        primaryKey: true,
        comment: 'ID del personaje que otorga la carta'
    },
    requiredTrust: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si true, requiere máxima confianza. Si false, requiere 10 victorias.'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Cantidad de copias de la carta que se obtienen'
    }
}, {
    sequelize,
    modelName: 'card_character_obtention',
    tableName: 'card_character_obtention',
    timestamps: false,
    indexes: [
        {
            fields: ['cardId', 'characterId'],
            unique: true,
            name: 'idx_card_character_obtention_unique'
        },
        {
            fields: ['cardId'],
            name: 'idx_card_character_obtention_card'
        },
        {
            fields: ['characterId'],
            name: 'idx_card_character_obtention_character'
        },
        {
            fields: ['requiredTrust'],
            name: 'idx_card_character_obtention_trust'
        }
    ]
});

// Las asociaciones se definen centralmente en associations.js
export default CardCharacterObtention;