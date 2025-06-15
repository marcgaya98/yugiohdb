import HighScore from '../models/HighScore.js';

class HighScoreController {
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

export default new HighScoreController();