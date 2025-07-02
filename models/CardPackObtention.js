import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';
import Pack from './Pack.js';

/**
 * Modelo para la relación muchos a muchos entre cartas y packs
 * Estructura minimalista que solo almacena la relación, sin atributos adicionales
 * 
 * Este modelo reemplaza el uso de CardObtention para cartas obtenidas en packs,
 * siguiendo un diseño más normalizado y eficiente.
 */
class CardPackObtention extends Model { }

CardPackObtention.init({
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Card, key: 'id' },
        primaryKey: true,
        comment: 'ID de la carta que se puede obtener'
    },
    packId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Pack, key: 'id' },
        primaryKey: true,
        comment: 'ID del pack donde se encuentra la carta'
    }
}, {
    sequelize,
    modelName: 'card_pack_obtention',
    tableName: 'card_pack_obtention',
    timestamps: false,
    indexes: [
        { fields: ['cardId'] },
        { fields: ['packId'] }
    ]
});

// Las asociaciones se definen centralmente en associations.js
export default CardPackObtention;
