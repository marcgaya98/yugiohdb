import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Icon extends Model { }

Icon.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.ENUM(
            'attribute',           // DARK, LIGHT, etc.
            'type',                // Dragon, Spellcaster, etc.
            'frame',               // Normal, Effect, Ritual, etc.
            'property',            // Field, Equip, Continuous, etc.
            'mechanic',            // Flip, Toon, Spirit, etc.
            'gameplay'             // Destruction, Support, Direct Attack, etc.
        ),
        allowNull: false,
        comment: 'Categoría principal del icono'
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Identificador único dentro de su categoría (ej: "DARK", "Dragon")'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre para mostrar'
    },
    icon_path: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Ruta al archivo del icono'
    },
    color_hex: {
        type: DataTypes.STRING(7),
        allowNull: true,
        comment: 'Código de color hexadecimal'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción opcional'
    }
}, {
    sequelize,
    modelName: 'icon',
    tableName: 'icons',
    timestamps: false,
    indexes: [
        { fields: ['category', 'key'], unique: true },
        { fields: ['category'] }
    ]
});

export default Icon;