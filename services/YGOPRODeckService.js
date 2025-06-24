import fetch from 'node-fetch';

// YGOPRODeck API Service
// This service provides an interface to interact with the YGOPRODeck API

/**
 * YGOPRODeckService - A service to interact with the YGOPRODeck API
 * Documentation: https://db.ygoprodeck.com/api-guide/
 */
class YGOPRODeckService {
    constructor() {
        this.baseUrl = 'https://db.ygoprodeck.com/api/v7';
        this.imageBaseUrl = 'https://images.ygoprodeck.com/images/cards';
    }

    /**
     * Get card information by name, ID, or other parameters
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Card data
     */
    async getCardInfo(params = {}) {
        const url = new URL(`${this.baseUrl}/cardinfo.php`);

        // Add misc=yes by default to get additional card information including konami_id
        const updatedParams = { ...params, misc: 'yes' };

        Object.keys(updatedParams).forEach(key => {
            if (updatedParams[key] !== undefined && updatedParams[key] !== null) {
                url.searchParams.append(key, updatedParams[key]);
            }
        });

        try {
            const response = await fetch(url.toString());
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YGOPRODeck API Error: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching card info:', error);
            throw error;
        }
    }

    /**
     * Get all card sets
     * @returns {Promise<Object>} Card sets data
     */
    async getCardSets() {
        try {
            const response = await fetch(`${this.baseUrl}/cardsets.php`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YGOPRODeck API Error: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching card sets:', error);
            throw error;
        }
    }

    /**
     * Get card set information by set code
     * @param {string} setCode - The card set code
     * @returns {Promise<Object>} Card set information
     */
    async getCardSetInfo(setCode) {
        try {
            const response = await fetch(`${this.baseUrl}/cardsetsinfo.php?setcode=${setCode}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YGOPRODeck API Error: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching card set info:', error);
            throw error;
        }
    }

    /**
     * Get all card archetypes
     * @returns {Promise<Object>} Card archetypes data
     */
    async getCardArchetypes() {
        try {
            const response = await fetch(`${this.baseUrl}/archetypes.php`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YGOPRODeck API Error: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching card archetypes:', error);
            throw error;
        }
    }

    /**
     * Get a random card
     * @returns {Promise<Object>} Random card data
     */
    async getRandomCard() {
        try {
            const response = await fetch(`${this.baseUrl}/randomcard.php`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YGOPRODeck API Error: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching random card:', error);
            throw error;
        }
    }

    /**
     * Download card image and upload to your own storage
     * @param {string} cardId - The card ID/passcode
     * @param {string} size - Image size: 'full', 'small', or 'cropped'
     * @returns {Promise<ArrayBuffer>} Image data
     */
    async getCardImage(cardId, size = 'full') {
        let imageUrl;
        switch (size) {
            case 'small':
                imageUrl = `${this.imageBaseUrl}_small/${cardId}.jpg`;
                break;
            case 'cropped':
                imageUrl = `${this.imageBaseUrl}_cropped/${cardId}.jpg`;
                break;
            case 'full':
            default:
                imageUrl = `${this.imageBaseUrl}/${cardId}.jpg`;
        }

        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
            }
            return await response.arrayBuffer();
        } catch (error) {
            console.error('Error downloading card image:', error);
            throw error;
        }
    }

    /**
     * Check database version
     * @returns {Promise<Object>} Database version data
     */
    async checkDatabaseVersion() {
        try {
            const response = await fetch(`${this.baseUrl}/checkDBVer.php`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YGOPRODeck API Error: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error checking database version:', error);
            throw error;
        }
    }

    /**
     * Get card by Konami ID
     * @param {string|number} konamiId - Konami ID of the card
     * @returns {Promise<Object>} Card data
     */
    async getCardByKonamiId(konamiId) {
        try {
            // Simply use the konami_id parameter directly in the API call
            return await this.getCardInfo({
                konami_id: konamiId
            });
        } catch (error) {
            console.error('Error fetching card by Konami ID:', error);
            throw error;
        }
    }

    /**
     * Get card by password (the id field in the API response)
     * @param {string|number} password - Card password/id
     * @returns {Promise<Object>} Card data
     */
    async getCardByPassword(password) {
        try {
            const result = await this.getCardInfo({
                id: password
            });
            return result;
        } catch (error) {
            console.error('Error fetching card by password:', error);
            throw error;
        }
    }

    /**
     * Find Toon monsters
     * @returns {Promise<Object>} Toon monster cards
     */
    async findToonMonsters() {
        try {
            return await this.getCardInfo({
                ability: 'Toon'
            });
        } catch (error) {
            console.error('Error fetching Toon monsters:', error);
            throw error;
        }
    }

    /**
     * Search for cards by name
     * @param {string} name - Card name to search for
     * @returns {Promise<Array>} - Array of card data
     */
    static async searchCardsByName(name) {
        const url = `${this.baseUrl}/cardinfo.php?fname=${encodeURIComponent(name)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data || [];
    }

    /**
     * Get card by exact name
     * @param {string} name - Exact card name
     * @returns {Promise<Object>} - Card data
     */
    static async getCardByName(name) {
        const url = `${this.baseUrl}/cardinfo.php?name=${encodeURIComponent(name)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data?.[0] || null;
    }

    /**
     * Get all Toon monsters
     * @returns {Promise<Array>} - Array of Toon monster cards
     */
    static async findToonMonsters() {
        const url = `${this.baseUrl}/cardinfo.php?archetype=Toon`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data || [];
    }

    /**
     * Get card image URLs
     * @param {string} cardId - Card ID
     * @returns {Promise<Object>} - Object with image URLs
     */
    static getCardImageUrls(cardId) {
        return {
            image_url: `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`,
            image_url_small: `https://images.ygoprodeck.com/images/cards_small/${cardId}.jpg`,
            image_url_cropped: `https://images.ygoprodeck.com/images/cards_cropped/${cardId}.jpg`
        };
    }
}

export default new YGOPRODeckService();
