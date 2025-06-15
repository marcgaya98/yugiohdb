import Genre from '../models/Genre.js';

const genres = [
    // Destruction
    { name: 'Remove card from play', category: 'Destruction' },
    { name: 'Destroy Spell/Trap', category: 'Destruction' },
    { name: 'Destroy monster', category: 'Destruction' },
    { name: 'Deck destruction', category: 'Destruction' },
    { name: 'Hand destruction', category: 'Destruction' },

    // Monster categories
    { name: 'LV Monsters', category: 'Monster categories' },
    { name: 'Toon', category: 'Monster categories' },
    { name: 'Spirit', category: 'Monster categories' },
    { name: 'Union', category: 'Monster categories' },
    { name: 'Fusion Material', category: 'Monster categories' },
    { name: 'Token', category: 'Monster categories' },
    { name: 'Flip Effect', category: 'Monster categories' },

    // Disruption
    { name: 'Change card position', category: 'Disruption' },
    { name: 'Get control', category: 'Disruption' },
    { name: 'Cancel out Effect', category: 'Disruption' },

    // Support
    { name: 'Attribute', category: 'Support' },
    { name: 'Type', category: 'Support' },

    // Hand
    { name: 'Return card', category: 'Hand' },
    { name: 'Increase draw', category: 'Hand' },
    { name: 'Search Deck', category: 'Hand' },
    { name: 'Recover cards from Graveyard', category: 'Hand' },

    // Battle
    { name: 'Increase ATK/DEF', category: 'Battle' },
    { name: 'Decrease ATK/DEF', category: 'Battle' },
    { name: 'Pierce', category: 'Battle' },
    { name: 'Cannot be destroyed', category: 'Battle' },
    { name: 'Restrict Attack', category: 'Battle' },
    { name: 'Direct Attack', category: 'Battle' },
    { name: 'Multiple Attack', category: 'Battle' },

    // Life Points
    { name: 'Reduce Life Points', category: 'Life Points' },
    { name: 'Recover Life Points', category: 'Life Points' },

    // Items
    { name: 'Spell Counter', category: 'Items' },
    { name: 'Gamble', category: 'Items' },

    // Summoning
    { name: 'Special Summon', category: 'Summoning' },
    { name: 'Cannot perform Normal Summon', category: 'Summoning' },

    // Misc
    { name: 'Game Original', category: 'Misc' },
    { name: 'Card with a different artwork', category: 'Misc' }
];

async function createGenres() {
    for (const genre of genres) {
        await Genre.findOrCreate({ where: genre });
    }
    console.log('Géneros creados correctamente');
    process.exit(0);
}

createGenres();