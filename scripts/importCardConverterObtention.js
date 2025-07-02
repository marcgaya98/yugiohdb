import fs from 'fs';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import CardConverterObtention from '../models/CardConverterObtention.js';
import '../models/associations.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function importCardConverterData() {
    try {
        console.log('Starting card converter data import...');

        // Authenticate with the database
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync models with the database
        await sequelize.sync();
        console.log('Models synchronized with database.');

        // Clear existing converter data
        await CardConverterObtention.destroy({ where: {} });
        console.log('Existing card converter data cleared.');

        // Load the JSON data
        const jsonPath = resolve(__dirname, 'data/card_converter.json');
        console.log(`Loading card converter data from ${jsonPath}...`);
        const cardConverterData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Card converter data loaded. Found ${cardConverterData.length} card groups.`);

        // Process card groups
        const stats = {
            processed: 0,
            success: 0,
            failed: 0,
            cardsNotFound: []
        };

        for (const group of cardConverterData) {
            const cardsRequired = parseInt(group.id, 10);

            if (isNaN(cardsRequired)) {
                console.warn(`Invalid cardsRequired value: ${group.id}, skipping...`);
                continue;
            }

            console.log(`Processing group with ${cardsRequired} cards required...`);

            for (const cardName of group.cards) {
                stats.processed++;

                // Try to find the card by name or alter_name
                const card = await Card.findOne({
                    where: {
                        [Op.or]: [
                            { name: cardName },
                            { alter_name: cardName }
                        ]
                    }
                });

                if (!card) {
                    console.warn(`Card not found: ${cardName}`);
                    stats.failed++;
                    stats.cardsNotFound.push(cardName);
                    continue;
                }

                // Create the card converter obtention record
                try {
                    await CardConverterObtention.create({
                        cardId: card.id,
                        cardsRequired: cardsRequired
                    });
                    stats.success++;
                    console.log(`Added card "${cardName}" (ID: ${card.id}) with cardsRequired: ${cardsRequired}`);
                } catch (error) {
                    console.error(`Error creating converter record for card ${cardName} (ID: ${card.id}):`, error.message);
                    stats.failed++;
                }
            }
        }

        // Print summary
        console.log('\nImport completed!');
        console.log(`Total cards processed: ${stats.processed}`);
        console.log(`Successful imports: ${stats.success}`);
        console.log(`Failed imports: ${stats.failed}`);

        if (stats.cardsNotFound.length > 0) {
            console.log('\nCards not found in database:');
            stats.cardsNotFound.forEach(cardName => console.log(`- ${cardName}`));
        }

        console.log('\nAll done!');
    } catch (error) {
        console.error('An error occurred during import:', error);
    } finally {
        // Close the database connection
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

// Run the import function
importCardConverterData();
