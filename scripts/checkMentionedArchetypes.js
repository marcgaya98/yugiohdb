import fs from 'fs';
import path from 'path';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import Card from '../models/Card.js';

const INPUT_PATH = path.resolve('data/mentioned_not_found.json');
const OUTPUT_STATUS_PATH = path.resolve('data/mentioned_archetype_status.json');
const OUTPUT_NOT_FOUND_PATH = path.resolve('data/mentioned_archetype_not_found.json');

async function main() {
    const mentioned = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
    const archetypes = new Set(
        (await Card.findAll({
            attributes: ['archetype'],
            where: { archetype: { [Op.ne]: null } },
            group: ['archetype']
        })).map(c => c.archetype)
    );

    const status = [];
    const notFound = [];

    for (const entry of mentioned) {
        const { cardId, cardName, mentioned: mention } = entry;
        if (!mention) continue;
        const archetypeExists = archetypes.has(mention);
        let belongsToArchetype = null;
        if (archetypeExists) {
            const card = await Card.findByPk(cardId);
            belongsToArchetype = card && card.archetype === mention;
            status.push({ cardId, cardName, mentioned: mention, archetypeExists, belongsToArchetype });
        } else {
            notFound.push({ cardId, cardName, mentioned: mention });
        }
    }

    fs.writeFileSync(OUTPUT_STATUS_PATH, JSON.stringify(status, null, 2));
    fs.writeFileSync(OUTPUT_NOT_FOUND_PATH, JSON.stringify(notFound, null, 2));
    console.log('Archivos generados:', OUTPUT_STATUS_PATH, OUTPUT_NOT_FOUND_PATH);
    await sequelize.close();
}

main();
