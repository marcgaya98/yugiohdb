// YGOPRODeck controller for your API
import YGOPRODeckService from '../services/YGOPRODeckService.js';

class YGOPRODeckController {
    /**
     * Search cards by name or other parameters
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async searchCards(req, res) {
        try {
            const result = await YGOPRODeckService.getCardInfo(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get a card by ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getCardById(req, res) {
        try {
            const { id } = req.params;
            const result = await YGOPRODeckService.getCardInfo({ id });

            if (!result.data || result.data.length === 0) {
                return res.status(404).json({ error: 'Card not found' });
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get a card by Konami ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getCardByKonamiId(req, res) {
        try {
            const { konamiId } = req.params;
            const result = await YGOPRODeckService.getCardInfo({ konami_id: konamiId });

            if (!result.data || result.data.length === 0) {
                return res.status(404).json({ error: 'Card not found with that Konami ID' });
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get a card by password (the id field in the API response)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getCardByPassword(req, res) {
        try {
            const { password } = req.params;
            const result = await YGOPRODeckService.getCardByPassword(password);

            if (!result.data || result.data.length === 0) {
                return res.status(404).json({ error: 'Card not found with that password' });
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get card sets
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getCardSets(req, res) {
        try {
            const result = await YGOPRODeckService.getCardSets();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get card archetypes
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getCardArchetypes(req, res) {
        try {
            const result = await YGOPRODeckService.getCardArchetypes();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get a random card
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getRandomCard(req, res) {
        try {
            const result = await YGOPRODeckService.getRandomCard();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Find Toon monster cards
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getToonMonsters(req, res) {
        try {
            const result = await YGOPRODeckService.findToonMonsters();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new YGOPRODeckController();
