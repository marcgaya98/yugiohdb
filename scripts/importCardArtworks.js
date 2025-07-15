import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import CardArtwork from '../models/CardArtwork.js';

// Mapeo de cartas por grupo de lotería
const lotteryGroups = {
    A: [
        'Celtic Guardian',
        'Elemental Hero Avian',
        'Elemental Hero Burstinatrix',
        'Elemental Hero Sparkman',
        'Gilford the Lightning',
        'Kunai with Chain',
        'Kuriboh',
        'Thousand Dragon',
        'XYZ-Dragon Cannon'
    ],
    B: [
        'Crush Card Virus',
        'Dark Paladin',
        'Gemini Elf',
        'Launcher Spider',
        'Millennium Shield',
        'Panther Warrior',
        'Summoned Skull',
        'Tiger Axe',
        'Toon World'
    ],
    C: [
        'Big Shield Gardna',
        'Blue-Eyes Ultimate Dragon',
        'Dark Magician',
        'Dark Magician Girl',

        "Harpie's Feather Duster",
        'Pendulum Machine',
        'Vorse Raider',
        'Widespread Ruin',
        'Winged Kuriboh'
    ],
    D: [
        'Acid Trap Hole',
        'Blue-Eyes White Dragon',
        'Flame Swordsman',
        'La Jinn the Mystical Genie of the Lamp',
        'Metalmorph',
        'Polymerization',
        'Red-Eyes B. Dragon',
        'Red Eyes Black Metal Dragon',
        'Viser Des'
    ]
};

const freeArtwork = {
    name: 'Gaia The Fierce Knight',
    imageUrl: null, // Puedes completar la URL si la tienes
};

async function run() {
    await sequelize.sync();
    // Insertar el artwork gratuito
    const gaia = await Card.findOne({ where: { name: freeArtwork.name } });
    if (gaia) {
        await CardArtwork.upsert({
            cardId: gaia.id,
            imageUrl: freeArtwork.imageUrl || gaia.image_url,
            group: null
        });
        console.log(`[OK] Artwork alternativo insertado para: ${freeArtwork.name}`);
    } else {
        console.warn(`[WARN] No se encontró la carta: ${freeArtwork.name}`);
    }

    // Insertar los grupos de lotería
    for (const [group, names] of Object.entries(lotteryGroups)) {
        for (const name of names) {
            let card = await Card.findOne({ where: { name } });
            if (!card) {
                card = await Card.findOne({ where: { alter_name: name } });
            }
            if (card) {
                await CardArtwork.upsert({
                    cardId: card.id,
                    imageUrl: card.image_url,
                    group
                });
                console.log(`[OK] Artwork alternativo insertado para: ${name} (Grupo ${group})`);
            } else {
                console.warn(`[WARN] No se encontró la carta ni por name ni por alter_name: ${name}`);
            }
        }
    }
    await sequelize.close();
}

run();
