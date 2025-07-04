import { Op } from 'sequelize';
import Card from '../models/Card.js';
import Genre from '../models/Genre.js';
// import GenreCategory from '../models/GenreCategory.js'; // No existe
// import CardObtention from '../models/CardObtention.js'; // No existe
import MonsterCard from '../models/MonsterCard.js';
import SpellCard from '../models/SpellCard.js';
import TrapCard from '../models/TrapCard.js';

class CardController {
  /**
   * Get all cards with optional filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllCards(req, res) {
    try {
      const filters = this.buildCardFilters(req.query);
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const cards = await Card.findAllWithImages({
        where: filters,
        include: this.getCardIncludes(),
        order: [['name', 'ASC']],
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      }, baseUrl);

      return res.json(cards);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching cards', error: error.message });
    }
  }

  /**
   * Get card by ID with all related information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCardById(req, res) {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const card = await Card.findOneWithImages({
        where: { id: req.params.id },
        include: this.getCardIncludes(true)
      }, baseUrl);

      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      return res.json(card);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching card', error: error.message });
    }
  }

  /**
   * Helper method to build filter conditions based on query params
   * @param {Object} query - Request query parameters
   * @returns {Object} Sequelize where conditions
   */
  buildCardFilters(query) {
    const filters = {};

    if (query.name) {
      filters.name = { [Op.like]: `%${query.name}%` };
    }

    if (query.type) {
      filters.card_type = query.type;
    }

    if (query.archetype) {
      filters.archetype = { [Op.like]: `%${query.archetype}%` };
    }

    // Add more filters as needed

    return filters;
  }

  /**
   * Helper method to define standard includes for card queries
   * @param {boolean} detailed - Whether to include all details
   * @returns {Array} Array of include objects for Sequelize
   */
  getCardIncludes(detailed = false) {
    const includes = [
      {
        model: Genre,
        as: 'genres'
        // include: {
        //   model: GenreCategory, // No existe
        //   as: 'category'
        // }
      }
    ];

    // Only include type-specific data if detailed view
    if (detailed) {
      includes.push(
        { model: MonsterCard, as: 'monsterData' },
        { model: SpellCard, as: 'spellData' },
        { model: TrapCard, as: 'trapData' }
        // { model: CardObtention, as: 'CardObtentions' } // No existe
      );
    }

    return includes;
  }
}

export default new CardController();