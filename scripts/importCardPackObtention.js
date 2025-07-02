import fs from 'fs';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
// Importar primero las asociaciones para asegurar que se cargan correctamente
import '../models/associations.js';
import Card from '../models/Card.js';
import Pack from '../models/Pack.js';
import CardPackObtention from '../models/CardPackObtention.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function importCardPackData() {
    try {
        console.log('Starting card pack data import...');

        // Authenticate with the database
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync only the CardPackObtention model with the database
        await CardPackObtention.sync({ force: false });
        console.log('CardPackObtention model synchronized with database.');

        // Clear existing pack obtention data if needed
        // await CardPackObtention.destroy({ where: {} });
        // console.log('Existing card pack data cleared.');

        // Load the JSON data
        const jsonPath = resolve(__dirname, '../data/packsCards.json');
        console.log(`Loading pack cards data from ${jsonPath}...`);
        const packData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Pack data loaded. Found ${packData.length} packs.`);

        // Process each pack
        const stats = {
            packsProcessed: 0,
            packsFound: 0,
            packsNotFound: [],
            cardsProcessed: 0,
            cardsFound: 0,
            cardsNotFound: [],
            relationshipsCreated: 0
        };

        for (const packEntry of packData) {
            stats.packsProcessed++;
            const packName = packEntry.packName;

            if (!packName) {
                console.warn(`Pack without name found, skipping...`);
                continue;
            }

            console.log(`\nProcessing pack: "${packName}"`);

            // Find the pack in the database
            const pack = await Pack.findOne({
                where: {
                    name: packName
                }
            });

            if (!pack) {
                console.warn(`Pack not found: ${packName}`);
                stats.packsNotFound.push(packName);
                continue;
            }

            stats.packsFound++;
            console.log(`Found pack: ${packName} (ID: ${pack.id})`);

            // Check if the pack has cards
            if (!packEntry.cards || !Array.isArray(packEntry.cards)) {
                console.warn(`No cards array found for pack: ${packName}`);
                continue;
            }

            console.log(`Processing ${packEntry.cards.length} cards for pack: ${packName}`);

            // Process each card in the pack
            for (const cardEntry of packEntry.cards) {
                stats.cardsProcessed++;

                // Skip entries without a name
                if (!cardEntry.name) {
                    continue;
                }

                // Try to find the card by name or alter_name
                const card = await Card.findOne({
                    where: {
                        [Op.or]: [
                            { name: cardEntry.name },
                            { alter_name: cardEntry.name }
                        ]
                    }
                });

                if (!card) {
                    console.warn(`Card not found: ${cardEntry.name}`);
                    stats.cardsNotFound.push({
                        packName: packName,
                        cardName: cardEntry.name
                    });
                    continue;
                }

                stats.cardsFound++;

                // Create the relationship between card and pack
                try {
                    console.log(`Attempting to create relationship: Card "${card.name}" (ID: ${card.id}) → Pack "${pack.name}" (ID: ${pack.id})`);

                    const [packObtention, created] = await CardPackObtention.findOrCreate({
                        where: {
                            cardId: card.id,
                            packId: pack.id
                        },
                        defaults: {
                            cardId: card.id,
                            packId: pack.id
                        }
                    });

                    if (created) {
                        stats.relationshipsCreated++;
                        console.log(`SUCCESS: Added card "${card.name}" (ID: ${card.id}) to pack "${pack.name}" (ID: ${pack.id})`);
                    } else {
                        console.log(`INFO: Card "${card.name}" already exists in pack "${pack.name}"`);
                    }
                } catch (error) {
                    console.error(`ERROR creating pack obtention record for card ${cardEntry.name} (ID: ${card.id}) and pack ${packName} (ID: ${pack.id}):`);
                    console.error(`  Details: ${error.message}`);
                    if (error.parent) {
                        console.error(`  SQL Error: ${error.parent.sqlMessage}`);
                    }
                }
            }
        }

        // Print summary
        console.log('\nImport completed!');
        console.log(`Total packs processed: ${stats.packsProcessed}`);
        console.log(`Packs found in database: ${stats.packsFound}`);
        console.log(`Packs not found: ${stats.packsNotFound.length}`);

        console.log(`\nTotal cards processed: ${stats.cardsProcessed}`);
        console.log(`Cards found in database: ${stats.cardsFound}`);
        console.log(`Cards not found: ${stats.cardsNotFound.length}`);
        console.log(`Card-Pack relationships created: ${stats.relationshipsCreated}`);

        if (stats.packsNotFound.length > 0) {
            console.log('\nPacks not found in database:');
            stats.packsNotFound.forEach(packName => console.log(`- ${packName}`));
        }

        if (stats.cardsNotFound.length > 0) {
            console.log('\nSome cards were not found in database.');
            console.log(`Writing ${stats.cardsNotFound.length} not found cards to file...`);

            // Save not found cards to a file for further inspection
            fs.writeFileSync(
                resolve(__dirname, '../data/pack_cards_not_found.json'),
                JSON.stringify(stats.cardsNotFound, null, 2),
                'utf8'
            );

            console.log('Not found cards written to data/pack_cards_not_found.json');
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
importCardPackData();
