import fs from 'fs';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Card from '../models/Card.js';
import CardSandwichObtention from '../models/CardSandwichObtention.js';
import '../models/associations.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function importCardSandwichData() {
    try {
        console.log('Starting card sandwich data import...');

        // Authenticate with the database
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync models with the database
        await sequelize.sync();
        console.log('Models synchronized with database.');

        // Clear existing sandwich data
        await CardSandwichObtention.destroy({ where: {} });
        console.log('Existing card sandwich data cleared.');

        // Load the JSON data
        const jsonPath = resolve(__dirname, '../data/sandwichCards.json');
        console.log(`Loading sandwich cards data from ${jsonPath}...`);
        const sandwichCardsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Sandwich cards data loaded. Found ${sandwichCardsData.length} cards.`);

        // Process cards
        const stats = {
            processed: 0,
            success: 0,
            failed: 0,
            cardsNotFound: []
        };

        for (const sandwichCard of sandwichCardsData) {
            stats.processed++;
            console.log(`Processing card: ${sandwichCard.name} (ID: ${sandwichCard.id})`);

            // Try to find the card by multiple criteria
            let card = null;

            // 1. Try by ID
            if (sandwichCard.id) {
                card = await Card.findByPk(sandwichCard.id);
            }

            // 2. If not found, try by name
            if (!card && sandwichCard.name) {
                card = await Card.findOne({
                    where: { name: sandwichCard.name }
                });
            }

            // 3. If still not found, try by alter_name
            if (!card && sandwichCard.name) {
                card = await Card.findOne({
                    where: { alter_name: sandwichCard.name }
                });
            }

            if (!card) {
                console.warn(`Card not found: ${sandwichCard.name || sandwichCard.id}`);
                stats.failed++;
                stats.cardsNotFound.push(sandwichCard.name || `ID: ${sandwichCard.id}`);
                continue;
            }

            // Create the card sandwich obtention record
            try {
                await CardSandwichObtention.create({
                    cardId: card.id
                });
                stats.success++;
                console.log(`Added card "${card.name}" (ID: ${card.id}) to sandwich obtention`);
            } catch (error) {
                console.error(`Error creating sandwich record for card ${card.name} (ID: ${card.id}):`, error.message);
                stats.failed++;
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
importCardSandwichData();
