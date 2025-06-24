// Script to download card images from YGOPRODeck and upload to AWS S3
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import AWS from 'aws-sdk';
import YGOPRODeckService from '../services/YGOPRODeckService.js';
import Card from '../models/Card.js';

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'yugioh-assets';

/**
 * Download and upload card images
 */
async function downloadAndUploadCardImages() {
    try {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Get all cards from database
        const cards = await Card.findAll();
        console.log(`Processing ${cards.length} cards...`);

        let successCount = 0;
        let errorCount = 0;

        for (const card of cards) {
            try {
                console.log(`Processing card: ${card.name} (${card.code})`);

                // Process each image type
                const imageTypes = ['full', 'small', 'cropped'];
                const s3Urls = {};

                for (const type of imageTypes) {
                    try {
                        // Get card image from YGOPRODeck
                        const imageBuffer = await YGOPRODeckService.getCardImage(card.code, type);

                        // Upload to S3
                        const s3Key = `cards/${card.code}/${type}.webp`;
                        const params = {
                            Bucket: BUCKET_NAME,
                            Key: s3Key,
                            Body: imageBuffer,
                            ContentType: 'image/webp'
                        };

                        await s3.upload(params).promise();

                        // Store S3 URL
                        s3Urls[`image_url${type === 'full' ? '' : '_' + type}`] = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
                    } catch (imageError) {
                        console.error(`Error processing ${type} image for card ${card.code}:`, imageError.message);
                    }
                }

                // Update card in database with new S3 URLs
                if (Object.keys(s3Urls).length > 0) {
                    await card.update(s3Urls);
                    successCount++;
                }
            } catch (cardError) {
                console.error(`Error processing card ${card.code}:`, cardError.message);
                errorCount++;
            }
        }

        console.log(`Processing complete. Success: ${successCount}, Errors: ${errorCount}`);
    } catch (error) {
        console.error('Error in batch processing:', error);
    }
}

// Run the script
downloadAndUploadCardImages().then(() => {
    console.log('Script completed');
}).catch(err => {
    console.error('Script failed:', err);
});
