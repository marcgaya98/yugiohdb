import Card from './Card.js';
import MonsterCard from './MonsterCard.js';
import SpellCard from './SpellCard.js';
import TrapCard from './TrapCard.js';
import Genre from './Genre.js';
import CardGenre from './CardGenre.js';
import Deck from './Deck.js';
import DeckCard from './DeckCard.js';
import GenreCategory from './GenreCategory.js';
import CardObtention from './CardObtention.js';
import Character from './Character.js';
import CharacterSandwichRating from './CharacterSandwichRating.js';

Card.hasOne(MonsterCard, { foreignKey: 'cardId', as: 'monsterData' });
Card.hasOne(SpellCard, { foreignKey: 'cardId', as: 'spellData' });
Card.hasOne(TrapCard, { foreignKey: 'cardId', as: 'trapData' });

MonsterCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
SpellCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
TrapCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

Genre.belongsTo(GenreCategory, { foreignKey: 'categoryId', as: 'category' });
GenreCategory.hasMany(Genre, { foreignKey: 'categoryId', as: 'genres' });

Card.belongsToMany(Genre, { through: CardGenre, as: 'genres', foreignKey: 'cardId' });
Genre.belongsToMany(Card, { through: CardGenre, as: 'cards', foreignKey: 'genreId' });

Card.hasMany(CardObtention, { foreignKey: 'cardId' });
CardObtention.belongsTo(Card, { foreignKey: 'cardId' });

Deck.belongsToMany(Card, { through: DeckCard, foreignKey: 'deckId' });
Card.belongsToMany(Deck, { through: DeckCard, foreignKey: 'cardId' });

Character.hasMany(CharacterSandwichRating, { foreignKey: 'characterId', as: 'sandwichRatings' });
CharacterSandwichRating.belongsTo(Character, { foreignKey: 'characterId', as: 'character' });

Character.hasMany(Deck, { foreignKey: 'characterId', as: 'decks' });
Deck.belongsTo(Character, { foreignKey: 'characterId', as: 'owner' });
