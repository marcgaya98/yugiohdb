import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Card from './Card.js';

/**
 * Modelo intermedio para relacionar cartas de fusión con sus materiales.
 * Cada registro representa un material necesario para una carta de fusión.
 *
 * - fusionId: ID de la carta de fusión (Card.id)
 * - materialId: ID de la carta material (Card.id)
 */
class FusionMaterial extends Model { }

FusionMaterial.init({
    fusionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Card, key: 'id' },
        primaryKey: true,
        comment: 'ID de la carta de fusión'
    },
    materialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Card, key: 'id' },
        primaryKey: true,
        comment: 'ID de la carta material'
    }
}, {
    sequelize,
    modelName: 'fusion_material',
    tableName: 'fusion_material',
    timestamps: false,
    indexes: [
        { fields: ['fusionId'] },
        { fields: ['materialId'] }
    ]
});

export default FusionMaterial;
