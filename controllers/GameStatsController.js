import Bonus from '../models/Bonus.js';
import Challenge from '../models/Challenge.js';
import HighScore from '../models/HighScore.js';

/**
 * Controlador unificado para estadísticas del juego
 * Incluye Bonus, Challenges y High Scores
 */
class GameStatsController {
    // ==================== BONUS ====================

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

    // ==================== CHALLENGES ====================

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

    // ==================== HIGH SCORES ====================

    /**
     * Obtener todos los tipos de high scores
     */
    async getAllHighScores(req, res) {
        try {
            const { category } = req.query;
            const where = {};

            if (category) where.category = category;

            const highScores = await HighScore.findAll({
                where,
                order: [['id', 'ASC']]
            });

            return res.json(highScores);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo high scores',
                error: error.message
            });
        }
    }

    /**
     * Obtener un high score por ID
     */
    async getHighScoreById(req, res) {
        try {
            const highScore = await HighScore.findByPk(req.params.id);

            if (!highScore) {
                return res.status(404).json({ message: 'High score no encontrado' });
            }

            return res.json(highScore);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo high score',
                error: error.message
            });
        }
    }

    /**
     * Obtener high scores por categoría
     */
    async getHighScoresByCategory(req, res) {
        try {
            const { category } = req.params;

            const highScores = await HighScore.findAll({
                where: { category },
                order: [['id', 'ASC']]
            });

            return res.json(highScores);
        } catch (error) {
            return res.status(500).json({
                message: 'Error obteniendo high scores por categoría',
                error: error.message
            });
        }
    }
}

export default new GameStatsController();
