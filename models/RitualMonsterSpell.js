import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo RitualMonsterSpell
 * Relaciona monstruos de ritual con sus cartas Ritual Spell.
 */
class RitualMonsterSpell extends Model { }

RitualMonsterSpell.init({
    /**
     * ID del monstruo de ritual (card.id)
     * @type {number}
     */
    ritualMonsterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'card', key: 'id' },
        comment: 'ID del monstruo de ritual'
    },
    /**
     * ID de la carta Ritual Spell (card.id)
     * @type {number}
     */
    ritualSpellId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'card', key: 'id' },
        comment: 'ID de la carta Ritual Spell'
    }
}, {
    sequelize,
    modelName: 'RitualMonsterSpell',
    tableName: 'ritual_monster_spell',
    timestamps: false,
    indexes: [
        { fields: ['ritualMonsterId'] },
        { fields: ['ritualSpellId'] }
    ]
});

export default RitualMonsterSpell;