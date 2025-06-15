import Icon from '../models/Icon.js';
import sequelize from '../config/database.js';

// Iconos de atributos
const attributeIcons = [
    { key: 'DARK', name: 'DARK', icon_path: '/images/attributes/dark.png', color_hex: '#7030A0' },
    { key: 'DIVINE', name: 'DIVINE', icon_path: '/images/attributes/divine.png', color_hex: '#FFCC00' },
    { key: 'EARTH', name: 'EARTH', icon_path: '/images/attributes/earth.png', color_hex: '#996633' },
    { key: 'FIRE', name: 'FIRE', icon_path: '/images/attributes/fire.png', color_hex: '#FF0000' },
    { key: 'LIGHT', name: 'LIGHT', icon_path: '/images/attributes/light.png', color_hex: '#FFFF00' },
    { key: 'WATER', name: 'WATER', icon_path: '/images/attributes/water.png', color_hex: '#0070C0' },
    { key: 'WIND', name: 'WIND', icon_path: '/images/attributes/wind.png', color_hex: '#00B050' },
];

// Iconos de tipos
const typeIcons = [
    { key: 'Aqua', name: 'Aqua', icon_path: '/images/types/aqua.png' },
    { key: 'Beast', name: 'Beast', icon_path: '/images/types/beast.png' },
    // ... todos los tipos ...
];

// Iconos de marcos de carta
const frameIcons = [
    { key: 'Normal', name: 'Normal Monster', icon_path: '/images/frames/normal.png', color_hex: '#FFC972' },
    { key: 'Effect', name: 'Effect Monster', icon_path: '/images/frames/effect.png', color_hex: '#FF8B53' },
    { key: 'Fusion', name: 'Fusion Monster', icon_path: '/images/frames/fusion.png', color_hex: '#FF6F61' },
    { key: 'Ritual', name: 'Ritual Monster', icon_path: '/images/frames/ritual.png', color_hex: '#8A2BE2' },
    { key: 'Token', name: 'Token', icon_path: '/images/frames/token.png', color_hex: '#32CD32' },
    { key: 'Trap', name: 'Trap Card', icon_path: '/images/frames/trap.png', color_hex: '#FF69B4' },
    { key: 'Spell', name: 'Spell Card', icon_path: '/images/frames/spell.png', color_hex: '#1E90FF' }
];

// Propiedades de hechizos y trampas
const propertyIcons = [
    { key: 'Field', name: 'Field Spell', icon_path: '/images/properties/field.png', color_hex: '#00B0F0' },
    { key: 'Equip', name: 'Equip Spell', icon_path: '/images/properties/equip.png', color_hex: '#92D050' },
    // ... etc ... spell y trap separados

];

// Otros tipos de iconos para mecánicas
const mechanicIcons = [
    { key: 'LV', name: 'LV Monsters', icon_path: '/images/mechanics/lv.png' },
    { key: 'Toon', name: 'Toon', icon_path: '/images/mechanics/toon.png' },
    // ... etc ...
];

// Iconos de gameplay
const gameplayIcons = [
    { key: 'DirectAttack', name: 'Direct Attack', icon_path: '/images/gameplay/direct_attack.png' },
    { key: 'IncreaseATK', name: 'Increase ATK', icon_path: '/images/gameplay/increase_atk.png' },
    // ... etc ...
];

async function loadIcons() {
    try {
        await sequelize.sync();

        // Cargar iconos de atributos
        for (const icon of attributeIcons) {
            await Icon.findOrCreate({
                where: { category: 'attribute', key: icon.key },
                defaults: {
                    ...icon,
                    category: 'attribute'
                }
            });
        }

        // Cargar iconos de tipos
        for (const icon of typeIcons) {
            await Icon.findOrCreate({
                where: { category: 'type', key: icon.key },
                defaults: {
                    ...icon,
                    category: 'type'
                }
            });
        }

        // Cargar el resto de iconos...
        // ... frameIcons, propertyIcons, etc.

        console.log('✅ Iconos cargados exitosamente');
    } catch (error) {
        console.error('❌ Error cargando iconos:', error);
    } finally {
        await sequelize.close();
    }
}

loadIcons();