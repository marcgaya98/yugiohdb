import { Op } from 'sequelize';
import Character from '../models/Character.js';
import Deck from '../models/Deck.js';
import CharacterSandwichRating from '../models/CharacterSandwichRating.js';
import Card from '../models/Card.js';
import CardObtention from '../models/CardObtention.js';

class CharacterController {
  /**
   * Get all characters with optional filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllCharacters(req, res) {
    try {
      const filters = {};

      if (req.query.name) {
        filters.name = { [Op.like]: `%${req.query.name}%` };
      }

      if (req.query.tier) {
        filters.tier = req.query.tier;
      }

      // Nuevo filtro por categoría
      if (req.query.category) {
        filters.category = req.query.category;
      }

      const characters = await Character.findAll({
        where: filters,
        order: [
          ['tier', 'ASC'],
          ['category', 'ASC'],
          ['name', 'ASC']
        ]
      });

      return res.json(characters);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching characters', error: error.message });
    }
  }

  /**
   * Get character by ID with all related information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCharacterById(req, res) {
    try {
      const character = await Character.findByPk(req.params.id, {
        include: [
          {
            model: Deck,
            as: 'decks',
            include: {
              model: Card,
              as: 'cards'
            }
          },
          {
            model: CharacterSandwichRating,
            as: 'sandwichRatings'
          }
        ]
      });

      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }

      // Also fetch cards that can be obtained by defeating this character
      const victoryCards = await Card.findAll({
        include: {
          model: CardObtention,
          where: {
            method: 'victory',
            sourceId: req.params.id
          },
          required: true
        }
      });

      // Add victory cards to the response
      const response = character.toJSON();
      response.victoryCards = victoryCards;

      return res.json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching character', error: error.message });
    }
  }

  /**
   * Get all decks for a specific character
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCharacterDecks(req, res) {
    try {
      const character = await Character.findByPk(req.params.id);

      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }

      // Extraer y procesar parámetros de paginación
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;

      const decks = await Deck.findAll({
        where: { characterId: req.params.id },
        include: {
          model: Card,
          as: 'cards'
        },
        limit,      // Aplica el límite si existe
        offset,     // Aplica el desplazamiento
        order: [['name', 'ASC']] // Orden consistente
      });

      // Opcionalmente incluir metadatos de paginación
      const total = await Deck.count({ where: { characterId: req.params.id } });

      return res.json({
        decks,
        pagination: {
          total,
          limit,
          offset,
          hasMore: limit ? offset + limit < total : false
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching character decks', error: error.message });
    }
  }
}

export default new CharacterController();