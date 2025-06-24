/**
 * Este archivo centraliza todas las asociaciones entre los modelos de la base de datos.
 * Es importante mantener las asociaciones en un solo lugar para evitar circularidad
 * y mantener una estructura clara de las relaciones entre entidades.
 */
import Card from './Card.js';
import MonsterCard from './MonsterCard.js';
import SpellCard from './SpellCard.js';
import TrapCard from './TrapCard.js';
import Genre from './Genre.js';
import CardGenre from './CardGenre.js';
import Deck from './Deck.js';
import GenreCategory from './GenreCategory.js';
import CardObtention from './CardObtention.js';
import Character from './Character.js';
import CharacterSandwichRating from './CharacterSandwichRating.js';

/**
 * Asociaciones Card con las cartas especializadas (MonsterCard, SpellCard, TrapCard)
 * Tipo de relación: One-to-One con eliminación en cascada
 */
Card.hasOne(MonsterCard, {
    foreignKey: 'cardId',
    as: 'monsterData',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Card.hasOne(SpellCard, {
    foreignKey: 'cardId',
    as: 'spellData',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Card.hasOne(TrapCard, {
    foreignKey: 'cardId',
    as: 'trapData',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

MonsterCard.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card'
});
SpellCard.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card'
});
TrapCard.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card'
});

/**
 * Asociaciones de Géneros y Categorías
 * Tipo de relación: One-to-Many
 */
Genre.belongsTo(GenreCategory, {
    foreignKey: 'categoryId',
    as: 'genreCategory',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

GenreCategory.hasMany(Genre, {
    foreignKey: 'categoryId',
    as: 'genreItems',  // Cambiado de 'genres' para evitar duplicidad de alias
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones Cartas-Géneros
 * Tipo de relación: Many-to-Many
 */
Card.belongsToMany(Genre, {
    through: CardGenre,
    as: 'genres',
    foreignKey: 'cardId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Genre.belongsToMany(Card, {
    through: CardGenre,
    as: 'cards',
    foreignKey: 'genreId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones Card-CardObtention
 * Tipo de relación: One-to-Many
 */
Card.hasMany(CardObtention, {
    foreignKey: 'cardId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CardObtention.belongsTo(Card, {
    foreignKey: 'cardId'
});

/**
 * Asociaciones Character-CharacterSandwichRating
 * Tipo de relación: One-to-Many
 */
Character.hasMany(CharacterSandwichRating, {
    foreignKey: 'characterId',
    as: 'sandwichRatings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CharacterSandwichRating.belongsTo(Character, {
    foreignKey: 'characterId',
    as: 'character'
});

/**
 * Asociaciones Character-Deck
 * Tipo de relación: One-to-Many
 */
Character.hasMany(Deck, {
    foreignKey: 'characterId',
    as: 'decks',
    onDelete: 'SET NULL',  // No eliminar mazos si se elimina el personaje
    onUpdate: 'CASCADE'
});
Deck.belongsTo(Character, {
    foreignKey: 'characterId',
    as: 'owner',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
