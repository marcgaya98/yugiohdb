import { Op } from 'sequelize';
import CardObtention from '../models/CardObtention.js';
import Card from '../models/Card.js';

class ObtentionController {
    /**
     * Obtiene todas las formas de obtención agrupadas por método
     */
    async getAllObtentionMethods(req, res) {
        try {
            const methods = await CardObtention.findAll({
                attributes: [
                    'method',
                    [sequelize.fn('COUNT', sequelize.col('method')), 'count']
                ],
                group: ['method'],
                order: [['method', 'ASC']]
            });

            res.json(methods);
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo métodos de obtención',
                error: error.message
            });
        }
    }

    /**
     * Obtiene cartas por método de obtención
     */
    async getCardsByMethod(req, res) {
        try {
            const { method } = req.params;
            const { sourceId } = req.query;

            const where = { method };

            if (sourceId) {
                where.sourceId = sourceId;
            }

            const obtentions = await CardObtention.findAll({
                where,
                include: [{ model: Card, as: 'card' }],
                order: [[Card, 'name', 'ASC']]
            });

            // Transformar respuesta para que sea más legible
            const cards = obtentions.map(o => ({
                ...o.card.toJSON(),
                obtention: {
                    sourceId: o.sourceId,
                    sourceName: o.sourceName,
                    details: o.details
                }
            }));

            res.json(cards);
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas por método',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las formas de conseguir una carta específica
     */
    async getObtentionMethodsForCard(req, res) {
        try {
            const { cardId } = req.params;

            // Verificar que la carta existe
            const card = await Card.findByPk(cardId);
            if (!card) {
                return res.status(404).json({ message: 'Carta no encontrada' });
            }

            const obtentions = await CardObtention.findAll({
                where: { cardId },
                order: [['method', 'ASC']]
            });

            // Agrupar por método para facilitar uso en frontend
            const methodsGrouped = {};

            obtentions.forEach(obtention => {
                const method = obtention.method;

                if (!methodsGrouped[method]) {
                    methodsGrouped[method] = [];
                }

                methodsGrouped[method].push({
                    sourceId: obtention.sourceId,
                    sourceName: obtention.sourceName,
                    details: obtention.details
                });
            });

            res.json({
                card: {
                    id: card.id,
                    name: card.name,
                },
                obtentionMethods: methodsGrouped
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo métodos de obtención para la carta',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las cartas exclusivas de un método
     * (cartas que SOLO se pueden conseguir por ese método)
     */
    async getExclusiveCards(req, res) {
        try {
            const { method } = req.params;

            // Validar método
            const validMethods = ['pack', 'victory', 'converter', 'download', 'bonus', 'hidden', 'tutorial', 'initial'];
            if (!validMethods.includes(method)) {
                return res.status(400).json({ message: 'Método no válido' });
            }

            // Subconsulta: IDs de cartas con otros métodos
            const cardsWithOtherMethods = await CardObtention.findAll({
                attributes: ['cardId'],
                where: { method: { [Op.ne]: method } },
                group: ['cardId']
            });

            const exclusionIds = cardsWithOtherMethods.map(c => c.cardId);

            // Consulta principal: cartas que solo tienen el método especificado
            const exclusiveCards = await CardObtention.findAll({
                where: {
                    method,
                    cardId: { [Op.notIn]: exclusionIds }
                },
                include: [{ model: Card, as: 'card' }],
                order: [[Card, 'name', 'ASC']]
            });

            const cards = exclusiveCards.map(o => ({
                ...o.card.toJSON(),
                obtention: {
                    sourceId: o.sourceId,
                    sourceName: o.sourceName,
                    details: o.details
                }
            }));

            res.json({
                method,
                exclusiveCount: cards.length,
                cards
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas exclusivas',
                error: error.message
            });
        }
    }
}

export default new ObtentionController();