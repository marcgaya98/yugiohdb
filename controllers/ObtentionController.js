import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import CardPackObtention from '../models/CardPackObtention.js';
import CardConverterObtention from '../models/CardConverterObtention.js';
import CardCharacterObtention from '../models/CardCharacterObtention.js';
import CardTutorialObtention from '../models/CardTutorialObtention.js';
import CardInitialDeck from '../models/CardInitialDeck.js';
import CardSandwichObtention from '../models/CardSandwichObtention.js';
import Card from '../models/Card.js';
import Character from '../models/Character.js';
import Pack from '../models/Pack.js';

class ObtentionController {
    /**
     * Obtiene todas las formas de obtención agrupadas por método
     */
    async getAllObtentionMethods(req, res) {
        try {
            // Aggregate from all specific obtention models
            const [
                packCount,
                characterCount,
                converterCount,
                tutorialCount,
                sandwichCount,
                initialDeckCount
            ] = await Promise.all([
                CardPackObtention.count(),
                CardCharacterObtention.count(),
                CardConverterObtention.count(),
                CardTutorialObtention.count(),
                CardSandwichObtention.count(),
                CardInitialDeck.count()
            ]);

            const methods = [
                { method: 'pack', count: packCount },
                { method: 'character', count: characterCount },
                { method: 'converter', count: converterCount },
                { method: 'tutorial', count: tutorialCount },
                { method: 'sandwich', count: sandwichCount },
                { method: 'initial_deck', count: initialDeckCount }
            ].filter(method => method.count > 0);

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

    /**
     * Obtiene todas las cartas que pueden conseguirse en packs específicos
     */
    async getPackCards(req, res) {
        try {
            const { packId } = req.params;

            const where = {};
            if (packId) {
                where.packId = packId;
            }

            const packCards = await CardPackObtention.findAll({
                where,
                include: [
                    { model: Card, as: 'card' },
                    { model: Pack, as: 'pack' }
                ],
                order: [[{ model: Card, as: 'card' }, 'name', 'ASC']]
            });

            const cards = packCards.map(pc => ({
                ...pc.card.toJSON(),
                obtention: {
                    packId: pc.packId,
                    packName: pc.pack?.name || 'Pack desconocido'
                }
            }));

            res.json({
                count: cards.length,
                cards
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas de packs',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las cartas que pueden conseguirse mediante el convertidor
     */
    async getConverterCards(req, res) {
        try {
            const converterCards = await CardConverterObtention.findAll({
                include: [{ model: Card, as: 'card' }],
                order: [[{ model: Card, as: 'card' }, 'name', 'ASC']]
            });

            const cards = converterCards.map(cc => ({
                ...cc.card.toJSON(),
                obtention: {
                    cardsRequired: cc.cardsRequired
                }
            }));

            res.json({
                count: cards.length,
                cards
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas del convertidor',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las cartas que pueden conseguirse de personajes
     */
    async getCharacterCards(req, res) {
        try {
            const { characterId } = req.params;

            const where = {};
            if (characterId) {
                where.characterId = characterId;
            }

            const characterCards = await CardCharacterObtention.findAll({
                where,
                include: [
                    { model: Card, as: 'card' },
                    { model: Character, as: 'character' }
                ],
                order: [[{ model: Card, as: 'card' }, 'name', 'ASC']]
            });

            const cards = characterCards.map(cc => ({
                ...cc.card.toJSON(),
                obtention: {
                    characterId: cc.characterId,
                    characterName: cc.character?.name || 'Personaje desconocido',
                    requiredTrust: cc.requiredTrust,
                    quantity: cc.quantity
                }
            }));

            res.json({
                count: cards.length,
                cards
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas de personajes',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las cartas que pueden conseguirse en tutoriales
     */
    async getTutorialCards(req, res) {
        try {
            const { day } = req.params;

            const where = {};
            if (day) {
                where.day = day;
            }

            const tutorialCards = await CardTutorialObtention.findAll({
                where,
                include: [{ model: Card, as: 'card' }],
                order: [[{ model: Card, as: 'card' }, 'name', 'ASC']]
            });

            const cards = tutorialCards.map(tc => ({
                ...tc.card.toJSON(),
                obtention: {
                    day: tc.day
                }
            }));

            res.json({
                count: cards.length,
                cards
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas de tutoriales',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las cartas del mazo inicial
     */
    async getInitialDeckCards(req, res) {
        try {
            const initialDeckCards = await CardInitialDeck.findAll({
                include: [{
                    model: Card,
                    as: 'card'
                }],
                order: [[{ model: Card, as: 'card' }, 'name', 'ASC']]
            });

            const cards = initialDeckCards.map(idc => ({
                ...idc.card.toJSON(),
                obtention: {
                    quantity: idc.quantity
                }
            }));

            res.json({
                count: cards.length,
                totalCards: initialDeckCards.reduce((total, card) => total + card.quantity, 0),
                cards
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas del mazo inicial',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las cartas que se consiguen con Plain Sandwich
     */
    async getSandwichCards(req, res) {
        try {
            const sandwichCards = await CardSandwichObtention.findAll({
                include: [{ model: Card, as: 'card' }],
                order: [[{ model: Card, as: 'card' }, 'name', 'ASC']]
            });

            const cards = sandwichCards.map(sc => ({
                ...sc.card.toJSON(),
                obtention: {
                    method: 'sandwich'
                }
            }));

            res.json({
                count: cards.length,
                cards
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo cartas de Plain Sandwich',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todos los métodos de obtención para una carta específica
     * (versión actualizada que usa los nuevos modelos específicos)
     */
    async getCardAllObtentionMethods(req, res) {
        try {
            const { cardId } = req.params;

            // Verificar que la carta existe
            const card = await Card.findByPk(cardId);
            if (!card) {
                return res.status(404).json({ message: 'Carta no encontrada' });
            }

            // Obtener formas de obtención de packs
            const packObtentions = await CardPackObtention.findAll({
                where: { cardId },
                include: [{ model: Pack, as: 'pack' }]
            });

            // Obtener formas de obtención de convertidor
            const converterObtentions = await CardConverterObtention.findAll({
                where: { cardId }
            });

            // Obtener formas de obtención de personajes
            const characterObtentions = await CardCharacterObtention.findAll({
                where: { cardId },
                include: [{ model: Character, as: 'character' }]
            });

            // Obtener formas de obtención de tutoriales
            const tutorialObtentions = await CardTutorialObtention.findAll({
                where: { cardId }
            });

            // Verificar si está en el mazo inicial
            const initialDeckObtention = await CardInitialDeck.findOne({
                where: { cardId }
            });

            // Verificar si se obtiene con sandwich
            const sandwichObtention = await CardSandwichObtention.findOne({
                where: { cardId }
            });

            // Mantener compatibilidad con CardObtention para métodos no migrados
            const legacyObtentions = await CardObtention.findAll({
                where: { cardId }
            });

            const obtentionMethods = {};

            // Procesar obtenciones de packs
            if (packObtentions.length > 0) {
                obtentionMethods.pack = packObtentions.map(po => ({
                    sourceId: po.packId,
                    sourceName: po.pack?.name || 'Pack desconocido'
                }));
            }

            // Procesar obtenciones de convertidor
            if (converterObtentions.length > 0) {
                obtentionMethods.converter = converterObtentions.map(co => ({
                    details: `Requiere ${co.cardsRequired} carta(s)`
                }));
            }

            // Procesar obtenciones de personajes
            if (characterObtentions.length > 0) {
                obtentionMethods.victory = characterObtentions.map(co => ({
                    sourceId: co.characterId,
                    sourceName: co.character?.name || 'Personaje desconocido',
                    details: `Requiere nivel de confianza ${co.requiredTrust}. Cantidad: ${co.quantity}`
                }));
            }

            // Procesar obtenciones de tutoriales
            if (tutorialObtentions.length > 0) {
                obtentionMethods.tutorial = tutorialObtentions.map(to => ({
                    details: `Día ${to.day} del tutorial`
                }));
            }

            // Procesar obtención de mazo inicial
            if (initialDeckObtention) {
                obtentionMethods.initial = [{
                    details: `Cantidad en mazo inicial: ${initialDeckObtention.quantity}`
                }];
            }

            // Procesar obtención de sandwich
            if (sandwichObtention) {
                obtentionMethods.sandwich = [{
                    details: `Se obtiene con Plain Sandwich en la tienda.`
                }];
            }

            // Procesar obtenciones legacy
            legacyObtentions.forEach(lo => {
                if (!obtentionMethods[lo.method]) {
                    obtentionMethods[lo.method] = [];
                }

                obtentionMethods[lo.method].push({
                    sourceId: lo.sourceId,
                    sourceName: lo.sourceName,
                    details: lo.details
                });
            });

            res.json({
                card: {
                    id: card.id,
                    name: card.name,
                },
                obtentionMethods
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error obteniendo todos los métodos de obtención para la carta',
                error: error.message
            });
        }
    }
}

export default new ObtentionController();