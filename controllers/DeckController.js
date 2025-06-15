import { Op } from 'sequelize';
import Deck from '../models/Deck.js';
import Card from '../models/Card.js';
import Character from '../models/Character.js';
import DeckCard from '../models/DeckCard.js';

class DeckController {
  /**
   * Get all decks with optional filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllDecks(req, res) {
    try {
      const filters = {};

      if (req.query.name) {
        filters.name = { [Op.like]: `%${req.query.name}%` };
      }

      if (req.query.level) {
        filters.level = req.query.level;
      }

      if (req.query.characterId) {
        filters.characterId = req.query.characterId;
      }

      const decks = await Deck.findAll({
        where: filters,
        include: {
          model: Character,
          as: 'owner',
          attributes: ['id', 'name']
        },
        order: [['name', 'ASC']]
      });

      return res.json(decks);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching decks', error: error.message });
    }
  }

  /**
   * Get deck by ID with detailed information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDeckById(req, res) {
    try {
      const deck = await Deck.findByPk(req.params.id, {
        include: [
          {
            model: Card,
            as: 'cards',
            through: { attributes: ['quantity'] }
          },
          {
            model: Character,
            as: 'owner',
            attributes: ['id', 'name', 'tier']
          }
        ]
      });

      if (!deck) {
        return res.status(404).json({ message: 'Deck not found' });
      }

      return res.json(deck);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching deck', error: error.message });
    }
  }

  /**
   * Get all cards in a specific deck
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDeckCards(req, res) {
    try {
      const deck = await Deck.findByPk(req.params.id);

      if (!deck) {
        return res.status(404).json({ message: 'Deck not found' });
      }

      const deckCards = await DeckCard.findAll({
        where: { deckId: req.params.id },
        include: [
          {
            model: Card,
            as: 'card'
          }
        ],
        order: [[Card, 'name', 'ASC']]
      });

      // Transform to a more useful format
      const cards = deckCards.map(dc => ({
        ...dc.card.toJSON(),
        quantity: dc.quantity
      }));

      return res.json(cards);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching deck cards', error: error.message });
    }
  }
}

export default new DeckController();