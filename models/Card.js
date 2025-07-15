import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

const Card = sequelize.define('Card', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    password: {
        type: DataTypes.STRING,
        comment: 'Password de la carta (8 dígitos)',
        validate: {
            is: /^[0-9]{8}$/, // Validación para asegurar que sea un password de 8 dígitos
        }
    },
    rarity: {
        type: DataTypes.ENUM('ultra', 'super', 'rare', 'common'),
        allowNull: false,
    },
    limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 3
        }
    },
    frame: {
        type: DataTypes.ENUM('normal', 'effect', 'fusion', 'ritual', 'spell', 'trap', 'token'),
        allowNull: false,
    },
    archetype: { type: DataTypes.STRING },
    cardType: {
        type: DataTypes.ENUM('Monster', 'Spell', 'Trap'),
        allowNull: false
    },
    alter_name: { type: DataTypes.STRING },
    visual_embedding: {
        type: DataTypes.TEXT('long'), // Puede almacenar JSON largo
        allowNull: true,
        get() {
            const raw = this.getDataValue('visual_embedding');
            return raw ? JSON.parse(raw) : null;
        },
        set(val) {
            this.setDataValue('visual_embedding', val ? JSON.stringify(val) : null);
        },
        comment: 'Vector de embedding visual para búsqueda por similitud (JSON array)'
    },
    clip_embedding: {
        type: DataTypes.TEXT('long'), // Para embeddings CLIP (texto + imagen)
        allowNull: true,
        get() {
            const raw = this.getDataValue('clip_embedding');
            try {
                return raw ? JSON.parse(raw) : null;
            } catch (error) {
                console.warn(`Error parsing CLIP embedding for card ${this.id}:`, error.message);
                return null;
            }
        },
        set(val) {
            this.setDataValue('clip_embedding', val ? JSON.stringify(val) : null);
        },
        comment: 'CLIP embedding for visual-semantic search (allows text-to-image matching)'
    }
}, {
    tableName: 'card',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['code'] },
        { fields: ['name'], type: 'FULLTEXT' }, // Optimizado para búsqueda por texto
        { fields: ['archetype'] },
        { fields: ['rarity'] },
        { fields: ['frame'] },
        { fields: ['cardType'] },
        { fields: ['limit'] },
        { fields: ['password'] },
        { fields: ['cardType', 'frame', 'archetype'] },
        { fields: ['cardType', 'rarity', 'frame'] },
        { fields: ['cardType', 'limit'] },
        { fields: ['archetype', 'rarity'] }
    ]
});

/**
 * Métodos de instancia para gestión de imágenes
 */

/**
 * Obtener URLs de todas las variantes de imagen de la carta
 * @param {string} baseUrl - URL base del servidor (ej: 'http://localhost:3000')
 * @returns {Object|null} Objeto con URLs de imágenes o null si no hay password
 */
Card.prototype.getImageUrls = function (baseUrl = '') {
    if (!this.password) return null;

    const normalizedPassword = normalizePasswordForUrl(this.password);
    return {
        normal: `${baseUrl}/images/cards/normal/${normalizedPassword}.jpg`,
        small: `${baseUrl}/images/cards/small/${normalizedPassword}.jpg`,
        cropped: `${baseUrl}/images/cards/cropped/${normalizedPassword}.jpg`
    };
};

/**
 * Obtener URL de imagen específica
 * @param {string} type - Tipo de imagen: 'normal', 'small', 'cropped'
 * @param {string} baseUrl - URL base del servidor
 * @returns {string|null} URL de la imagen o null si no hay password
 */
Card.prototype.getImageUrl = function (type = 'normal', baseUrl = '') {
    if (!this.password) return null;

    const validTypes = ['normal', 'small', 'cropped'];
    if (!validTypes.includes(type)) {
        throw new Error(`Tipo de imagen inválido. Tipos válidos: ${validTypes.join(', ')}`);
    }

    const normalizedPassword = normalizePasswordForUrl(this.password);
    return `${baseUrl}/images/cards/${type}/${normalizedPassword}.jpg`;
};

/**
 * Verificar si la carta tiene imágenes disponibles
 * @returns {boolean} true si tiene password (puede tener imágenes)
 */
Card.prototype.hasImages = function () {
    return !!this.password;
};

/**
 * Obtener información completa de la carta incluyendo URLs de imágenes
 * @param {string} baseUrl - URL base del servidor
 * @returns {Object} Objeto con datos de la carta e imágenes
 */
Card.prototype.toJSONWithImages = function (baseUrl = '') {
    const cardData = this.toJSON();

    // Añadir URLs de imágenes si están disponibles
    if (this.hasImages()) {
        cardData.images = this.getImageUrls(baseUrl);
    } else {
        cardData.images = null;
    }

    return cardData;
};

/**
 * Método estático para obtener cartas con información de imágenes
 * @param {Object} options - Opciones de consulta Sequelize
 * @param {string} baseUrl - URL base del servidor
 * @returns {Promise<Array>} Array de cartas con URLs de imágenes
 */
Card.findAllWithImages = async function (options = {}, baseUrl = '') {
    const cards = await this.findAll(options);
    return cards.map(card => card.toJSONWithImages(baseUrl));
};

/**
 * Método estático para obtener una carta con información de imágenes
 * @param {Object} options - Opciones de consulta Sequelize
 * @param {string} baseUrl - URL base del servidor
 * @returns {Promise<Object|null>} Carta con URLs de imágenes o null
 */
Card.findOneWithImages = async function (options = {}, baseUrl = '') {
    const card = await this.findOne(options);
    return card ? card.toJSONWithImages(baseUrl) : null;
};

export default Card;