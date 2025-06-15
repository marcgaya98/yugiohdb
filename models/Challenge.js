import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Challenge extends Model { }

Challenge.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false, // IDs fijos según documentación
        comment: 'ID numérico correspondiente a la documentación'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del desafío'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Descripción detallada del desafío'
    },
    category: {
        type: DataTypes.ENUM(
            'victory', 'damage', 'monster_related', 'summoning',
            'spell_trap', 'deck_building', 'special_condition'
        ),
        allowNull: false,
        comment: 'Categoría para agrupar desafíos'
    },
    difficulty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Nivel de dificultad estimado (1-5)'
    },
    dpReward: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Puntos DP de recompensa si aplica'
    }
}, {
    sequelize,
    modelName: 'challenge',
    tableName: 'challenges',
    timestamps: false,
    indexes: [
        { fields: ['category'] },
        { fields: ['difficulty'] }
    ]
});

export default Challenge;