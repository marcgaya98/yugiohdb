import Pack from '../models/Pack.js';
import Card from '../models/Card.js';
import CardPackObtention from '../models/CardPackObtention.js';

class PackController {
  /**
   * Get all packs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllPacks(req, res) {
    try {
      const packs = await Pack.findAll({
        order: [['name', 'ASC']]
      });

      return res.json(packs);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching packs', error: error.message });
    }
  }

  /**
   * Get pack by ID with details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPackById(req, res) {
    try {
      const pack = await Pack.findByPk(req.params.id);

      if (!pack) {
        return res.status(404).json({ message: 'Pack not found' });
      }

      return res.json(pack);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching pack', error: error.message });
    }
  }

  /**
   * Get all cards in a specific pack
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPackCards(req, res) {
    try {
      const packId = req.params.id;

      // Find pack to verify it exists
      const pack = await Pack.findByPk(packId);
      if (!pack) {
        return res.status(404).json({ message: 'Pack not found' });
      }

      // Find cards in this pack through CardPackObtention
      const cards = await Card.findAll({
        include: {
          model: CardPackObtention,
          where: {
            packId: packId
          },
          required: true
        },
        order: [['name', 'ASC']]
      });

      return res.json(cards);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching pack cards', error: error.message });
    }
  }
}

export default new PackController();