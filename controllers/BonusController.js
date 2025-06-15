import Bonus from '../models/Bonus.js';

class BonusController {
    /**
     * Obtener todos los tipos de bonificaciones
     */
    async getAllBonuses(req, res) {
        try {
            const { category } = req.query;
            const where = {};

            if (category) where.category = category;

            const bonuses = await Bonus.findAll({
                where,
                order: [['id', 'ASC']]
            });

            return res.json(bonuses);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo bonificaciones',
                error: error.message
            });
        }
    }

    /**
     * Obtener una bonificación por ID
     */
    async getBonusById(req, res) {
        try {
            const bonus = await Bonus.findByPk(req.params.id);

            if (!bonus) {
                return res.status(404).json({ message: 'Bonificación no encontrada' });
            }

            return res.json(bonus);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo bonificación',
                error: error.message
            });
        }
    }

    /**
     * Obtener bonificaciones por categoría
     */
    async getBonusesByCategory(req, res) {
        try {
            const { category } = req.params;

            const bonuses = await Bonus.findAll({
                where: { category },
                order: [['id', 'ASC']]
            });

            return res.json(bonuses);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo bonificaciones por categoría',
                error: error.message
            });
        }
    }
}

export default new BonusController();