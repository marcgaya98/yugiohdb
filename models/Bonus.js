import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Bonus extends Model { }

Bonus.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false, // IDs fijos según documentación
        comment: 'ID numérico correspondiente a la documentación'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del tipo de bonus'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del bonus'
    },
    dpValue: {
        type: DataTypes.STRING, // String porque algunos tienen fórmulas dinámicas
        allowNull: true,
        comment: 'Valor en DP o fórmula para calcularlo'
    },
    category: {
        type: DataTypes.ENUM('victory', 'gameplay', 'special_summon', 'special_card', 'other'),
        allowNull: false,
        comment: 'Categoría para agrupar bonuses'
    },
    conditions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Condiciones para obtener el bonus'
    }
}, {
    sequelize,
    modelName: 'bonus',
    tableName: 'bonuses',
    timestamps: false
});

export default Bonus;