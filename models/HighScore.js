import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class HighScore extends Model { }

HighScore.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false, // Usamos IDs fijos según documentación
        comment: 'ID numérico correspondiente a la documentación'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del tipo de high score'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del high score'
    },
    category: {
        type: DataTypes.ENUM('damage', 'summon', 'spell_trap', 'other'),
        allowNull: false,
        comment: 'Categoría para agrupar high scores'
    }
}, {
    sequelize,
    modelName: 'high_score',
    tableName: 'high_scores',
    timestamps: false
});

export default HighScore;