import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo Deck: representa un mazo de cartas asociado a un personaje.
 * Usa UUID como primaryKey y mapea camelCase a snake_case en la base de datos.
 */
class Deck extends Model { }

Deck.init({
    /** Identificador único del deck (UUID v4) */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'ID único del deck (UUID v4)'
    },
    /** Nombre del deck */
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del deck'
    },
    /** Nivel del deck */
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Nivel del deck'
    },
    /** ID del personaje propietario (clave foránea) */
    characterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'character_id',
        comment: 'ID del personaje propietario'
    },
    /** Indica si es un Extra Deck */
    extraDeck: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'extra_deck',
        comment: 'Indica si es un Extra Deck'
    }
}, {
    sequelize,
    modelName: 'Deck',
    tableName: 'deck',
    timestamps: false,
    indexes: [
        { fields: ['character_id'] }
    ]
});

export default Deck;