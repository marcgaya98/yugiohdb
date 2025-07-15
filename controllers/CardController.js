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
   * Obtener todas las cartas con filtrado, ordenación y paginación avanzados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getAllCards(req, res) {
    try {
      // Destructuring de parámetros de consulta
      const {
        name,
        code,
        rarity,
        limit: limitParam,
        offset: offsetParam,
        page,
        frame,
        archetype,
        cardType,
        alterName,
        password,
        attribute,
        effectTrait,
        summonMechanic,
        ability,
        type,
        level,
        levelMin,
        levelMax,
        attack,
        attackMin,
        attackMax,
        defense,
        defenseMin,
        defenseMax,
        spellType,
        trapType,
        genres,
        genreCategory,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Validación básica de paginación
      let limit = limitParam ? parseInt(limitParam) : 24;
      if (limit > 100) limit = 100;
      let offset = offsetParam ? parseInt(offsetParam) : (page ? (parseInt(page) - 1) * limit : 0);

      // Filtros principales (case-insensitive)
      const filters = {};
      if (name) filters.name = { [Op.iLike]: `%${name}%` };
      if (code) filters.code = { [Op.iLike]: `%${code}%` };
      if (rarity) filters.rarity = rarity;
      if (frame) filters.frame = frame;
      if (archetype) filters.archetype = { [Op.iLike]: `%${archetype}%` };
      if (cardType) filters.cardType = cardType;
      if (alterName) filters.alter_name = { [Op.iLike]: `%${alterName}%` };
      if (password) filters.password = { [Op.iLike]: `%${password}%` };
      if (limitParam) filters.limit = parseInt(limitParam);

      // Includes dinámicos para joins
      const includes = [
        {
          model: Genre,
          as: 'genres',
          where: genres
            ? {
              id: {
                [Op.in]: genres.split(',').map((g) => parseInt(g))
              }
            }
            : undefined,
          required: !!genres
        }
      ];

      // MonsterCard join y filtros
      if (
        attribute || effectTrait || summonMechanic || ability || type || level || levelMin || levelMax || attack || attackMin || attackMax || defense || defenseMin || defenseMax
      ) {
        includes.push({
          model: MonsterCard,
          as: 'monsterData',
          where: {
            ...(attribute && { attribute }),
            ...(effectTrait !== undefined && { effectTrait }),
            ...(summonMechanic && { summonMechanic }),
            ...(ability && { ability }),
            ...(type && { type }),
            ...(level && { level: parseInt(level) }),
            ...(levelMin && { level: { [Op.gte]: parseInt(levelMin) } }),
            ...(levelMax && { level: { ...(includes.find(i => i.as === 'monsterData')?.where?.level || {}), [Op.lte]: parseInt(levelMax) } }),
            ...(attack && { attack: parseInt(attack) }),
            ...(attackMin && { attack: { [Op.gte]: parseInt(attackMin) } }),
            ...(attackMax && { attack: { ...(includes.find(i => i.as === 'monsterData')?.where?.attack || {}), [Op.lte]: parseInt(attackMax) } }),
            ...(defense && { defense: parseInt(defense) }),
            ...(defenseMin && { defense: { [Op.gte]: parseInt(defenseMin) } }),
            ...(defenseMax && { defense: { ...(includes.find(i => i.as === 'monsterData')?.where?.defense || {}), [Op.lte]: parseInt(defenseMax) } })
          },
          required: true
        });
      }

      // SpellCard join y filtros
      if (spellType) {
        includes.push({
          model: SpellCard,
          as: 'spellData',
          where: { type: spellType },
          required: true
        });
      }

      // TrapCard join y filtros
      if (trapType) {
        includes.push({
          model: TrapCard,
          as: 'trapData',
          where: { type: trapType },
          required: true
        });
      }

      // Ordenación dinámica (case-insensitive para texto)
      let order = [];
      if (sortBy) {
        if ([
          'name', 'archetype', 'code', 'alter_name', 'password'
        ].includes(sortBy)) {
          order.push([sortBy, sortOrder.toUpperCase()]);
        } else if ([
          'attack', 'defense', 'level'
        ].includes(sortBy)) {
          order.push([{ model: MonsterCard, as: 'monsterData' }, sortBy, sortOrder.toUpperCase()]);
        } else if (sortBy === 'rarity') {
          order.push(['rarity', sortOrder.toUpperCase()]);
        }
      } else {
        order.push(['name', 'ASC']);
      }

      // Consulta principal con Sequelize
      const { rows, count } = await Card.findAndCountAll({
        where: filters,
        include: includes,
        order,
        limit,
        offset,
        distinct: true
      });

      return res.status(200).json({
        status: 'success',
        message: 'Cartas obtenidas correctamente',
        data: rows,
        total: count,
        offset,
        limit
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener cartas',
        error: error.message
      });
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