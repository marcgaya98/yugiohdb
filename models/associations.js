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
import Character from './Character.js';
import CharacterSandwichRating from './CharacterSandwichRating.js';
import CardTutorialObtention from './CardTutorialObtention.js';
import CardInitialDeck from './CardInitialDeck.js';
import CardPackObtention from './CardPackObtention.js';
import CardConverterObtention from './CardConverterObtention.js';
import CardCharacterObtention from './CardCharacterObtention.js';
import CardSandwichObtention from './CardSandwichObtention.js';
import Pack from './Pack.js';
import FusionMaterial from './FusionMaterial.js';
import RitualMonsterSpell from './RitualMonsterSpell.js';

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

/**
 * Asociaciones para CardTutorialObtention
 * Relaciona cartas con los días de tutoriales en que se obtienen
 */
Card.hasMany(CardTutorialObtention, {
    foreignKey: 'cardId',
    as: 'tutorialObtentions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CardTutorialObtention.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones para CardInitialDeck
 * Relaciona cartas con el mazo inicial del jugador
 */
Card.hasOne(CardInitialDeck, {
    foreignKey: 'cardId',
    as: 'initialDeck',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CardInitialDeck.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones para CardSandwichObtention
 * Relaciona cartas con las que se obtienen mediante Plain Sandwich
 */
Card.hasOne(CardSandwichObtention, {
    foreignKey: 'cardId',
    as: 'sandwichObtention',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CardSandwichObtention.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones para CardPackObtention
 * Relaciona cartas con los packs donde se pueden obtener
 */
Card.belongsToMany(Pack, {
    through: CardPackObtention,
    foreignKey: 'cardId',
    otherKey: 'packId',
    as: 'packs'
});
Pack.belongsToMany(Card, {
    through: CardPackObtention,
    foreignKey: 'packId',
    otherKey: 'cardId',
    as: 'cards'
});

CardPackObtention.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CardPackObtention.belongsTo(Pack, {
    foreignKey: 'packId',
    as: 'pack',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones para CardConverterObtention
 * Relaciona cartas con el sistema de convertidor
 */
Card.hasOne(CardConverterObtention, {
    foreignKey: 'cardId',
    as: 'converterObtention',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CardConverterObtention.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones para CardCharacterObtention
 * Relaciona cartas con los personajes que las otorgan
 */
Card.belongsToMany(Character, {
    through: CardCharacterObtention,
    foreignKey: 'cardId',
    otherKey: 'characterId',
    as: 'characterObtentions'
});
Character.belongsToMany(Card, {
    through: CardCharacterObtention,
    foreignKey: 'characterId',
    otherKey: 'cardId',
    as: 'rewardCards'
});

CardCharacterObtention.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CardCharacterObtention.belongsTo(Character, {
    foreignKey: 'characterId',
    as: 'character',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones para FusionMaterial
 * Relaciona cartas de fusión con sus materiales
 */
Card.hasMany(FusionMaterial, {
    foreignKey: 'fusionId',
    as: 'fusionMaterials',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Card.hasMany(FusionMaterial, {
    foreignKey: 'materialId',
    as: 'asMaterialIn',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
FusionMaterial.belongsTo(Card, {
    foreignKey: 'fusionId',
    as: 'fusion',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
FusionMaterial.belongsTo(Card, {
    foreignKey: 'materialId',
    as: 'material',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * Asociaciones para RitualMonsterSpell
 * Relaciona monstruos rituales con hechizos rituales
 */
Card.hasMany(RitualMonsterSpell, {
    foreignKey: 'ritualMonsterId',
    as: 'ritualSpells'
});
Card.hasMany(RitualMonsterSpell, {
    foreignKey: 'ritualSpellId',
    as: 'ritualMonsters'
});
RitualMonsterSpell.belongsTo(Card, {
    foreignKey: 'ritualMonsterId',
    as: 'monster'
});
RitualMonsterSpell.belongsTo(Card, {
    foreignKey: 'ritualSpellId',
    as: 'spell'
});
