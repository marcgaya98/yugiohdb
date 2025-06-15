import Challenge from '../models/Challenge.js';

class ChallengeController {
    /**
     * Obtener todos los desafíos
     */
    async getAllChallenges(req, res) {
        try {
            const { category, difficulty } = req.query;
            const where = {};

            if (category) where.category = category;
            if (difficulty) where.difficulty = parseInt(difficulty);

            const challenges = await Challenge.findAll({
                where,
                order: [['id', 'ASC']]
            });

            return res.json(challenges);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo desafíos',
                error: error.message
            });
        }
    }

    /**
     * Obtener un desafío por ID
     */
    async getChallengeById(req, res) {
        try {
            const challenge = await Challenge.findByPk(req.params.id);

            if (!challenge) {
                return res.status(404).json({ message: 'Desafío no encontrado' });
            }

            return res.json(challenge);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo desafío',
                error: error.message
            });
        }
    }

    /**
     * Obtener desafíos por categoría
     */
    async getChallengesByCategory(req, res) {
        try {
            const { category } = req.params;

            const challenges = await Challenge.findAll({
                where: { category },
                order: [['id', 'ASC']]
            });

            return res.json(challenges);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo desafíos por categoría',
                error: error.message
            });
        }
    }
}

export default new ChallengeController();