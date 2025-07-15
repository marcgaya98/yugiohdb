/**
 * Script para migrar las URLs de imágenes de cartas de externas a locales
 * Actualiza los campos image_url en la base de datos para usar rutas locales
 */
import Card from '../models/Card.js';
import sequelize from '../config/database.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';

class ImageUrlMigration {
    constructor() {
        this.updatedCount = 0;
        this.skippedCount = 0;
        this.errorCount = 0;
    }

    /**
     * Migrar URLs de imágenes a rutas locales
     */
    async migrateImageUrls() {
        const startTime = Date.now();

        console.log('🔄 Iniciando migración de URLs de imágenes...');
        console.log('='.repeat(60));

        try {
            // Obtener todas las cartas con password
            const cards = await Card.findAll({
                attributes: ['id', 'name', 'password', 'image_url'],
                where: {
                    password: {
                        [Card.sequelize.Sequelize.Op.not]: null
                    }
                }
            });

            console.log(`📚 Encontradas ${cards.length} cartas con password`);

            if (cards.length === 0) {
                console.log('❌ No hay cartas para migrar');
                return;
            }

            // Procesar cartas en lotes para mejor rendimiento
            const batchSize = 100;
            for (let i = 0; i < cards.length; i += batchSize) {
                const batch = cards.slice(i, i + batchSize);
                await this.processBatch(batch, i, cards.length);
            }

            // Estadísticas finales
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            console.log('\n' + '='.repeat(60));
            console.log('📊 RESUMEN DE MIGRACIÓN:');
            console.log(`   ⏱️  Tiempo total: ${duration} segundos`);
            console.log(`   ✅ Cartas actualizadas: ${this.updatedCount}`);
            console.log(`   ⏭️  Cartas omitidas: ${this.skippedCount}`);
            console.log(`   ❌ Errores: ${this.errorCount}`);

            if (this.errorCount === 0) {
                console.log('\n🎉 ¡Migración completada exitosamente!');
            } else {
                console.log('\n⚠️  Migración completada con algunos errores.');
            }

        } catch (error) {
            console.error('\n💥 Error fatal durante la migración:', error.message);
            throw error;
        }
    }

    /**
     * Procesar un lote de cartas
     */
    async processBatch(batch, startIndex, total) {
        const batchNumber = Math.floor(startIndex / 100) + 1;
        const totalBatches = Math.ceil(total / 100);

        console.log(`\n📦 Procesando lote ${batchNumber}/${totalBatches} (cartas ${startIndex + 1}-${Math.min(startIndex + batch.length, total)})`);

        const transaction = await sequelize.transaction();

        try {
            for (const card of batch) {
                await this.migrateCardImageUrl(card, transaction);
            }

            await transaction.commit();

            const progress = ((startIndex + batch.length) / total * 100).toFixed(1);
            console.log(`   📊 Progreso: ${progress}% | Actualizadas: ${this.updatedCount} | Omitidas: ${this.skippedCount}`);

        } catch (error) {
            await transaction.rollback();
            console.error(`   ❌ Error en lote ${batchNumber}:`, error.message);
            this.errorCount += batch.length;
        }
    }

    /**
     * Migrar URL de imagen de una carta específica
     */
    async migrateCardImageUrl(card, transaction) {
        try {
            const password = card.password;

            // Verificar si ya tiene URL local
            if (card.image_url && card.image_url.includes('/images/cards/')) {
                console.log(`   ⏭️  ${card.name} - Ya tiene URL local`);
                this.skippedCount++;
                return;
            }

            // Generar nueva URL local usando password normalizado
            const normalizedPassword = normalizePasswordForUrl(password);
            const newImageUrl = `/images/cards/normal/${normalizedPassword}.jpg`;

            // Actualizar en la base de datos
            await card.update({
                image_url: newImageUrl
            }, { transaction });

            console.log(`   ✅ ${card.name} - URL actualizada`);
            this.updatedCount++;

        } catch (error) {
            console.error(`   ❌ Error migrando ${card.name}:`, error.message);
            this.errorCount++;
        }
    }

    /**
     * Revertir migración (volver a URLs externas)
     */
    async revertMigration() {
        console.log('🔄 Revirtiendo migración de URLs de imágenes...');
        console.log('='.repeat(60));

        try {
            const cards = await Card.findAll({
                attributes: ['id', 'name', 'password', 'image_url'],
                where: {
                    password: {
                        [Card.sequelize.Sequelize.Op.not]: null
                    },
                    image_url: {
                        [Card.sequelize.Sequelize.Op.like]: '/images/cards/%'
                    }
                }
            });

            console.log(`📚 Encontradas ${cards.length} cartas con URLs locales`);

            if (cards.length === 0) {
                console.log('❌ No hay cartas para revertir');
                return;
            }

            for (const card of cards) {
                try {
                    const externalUrl = `https://images.ygoprodeck.com/images/cards/${card.password}.jpg`;

                    await card.update({
                        image_url: externalUrl
                    });

                    console.log(`   ✅ ${card.name} - URL revertida`);
                    this.updatedCount++;

                } catch (error) {
                    console.error(`   ❌ Error revirtiendo ${card.name}:`, error.message);
                    this.errorCount++;
                }
            }

            console.log(`\n🎉 Reversión completada. ${this.updatedCount} cartas revertidas.`);

        } catch (error) {
            console.error('\n💥 Error durante la reversión:', error.message);
            throw error;
        }
    }

    /**
     * Verificar estado de la migración
     */
    async checkMigrationStatus() {
        console.log('🔍 Verificando estado de migración de imágenes...');
        console.log('='.repeat(60));

        try {
            const totalCards = await Card.count({
                where: {
                    password: {
                        [Card.sequelize.Sequelize.Op.not]: null
                    }
                }
            });

            const localUrls = await Card.count({
                where: {
                    password: {
                        [Card.sequelize.Sequelize.Op.not]: null
                    },
                    image_url: {
                        [Card.sequelize.Sequelize.Op.like]: '/images/cards/%'
                    }
                }
            });

            const externalUrls = await Card.count({
                where: {
                    password: {
                        [Card.sequelize.Sequelize.Op.not]: null
                    },
                    image_url: {
                        [Card.sequelize.Sequelize.Op.like]: 'https://images.ygoprodeck.com/%'
                    }
                }
            });

            const otherUrls = totalCards - localUrls - externalUrls;

            console.log('📊 ESTADO ACTUAL:');
            console.log(`   📁 Total de cartas con password: ${totalCards}`);
            console.log(`   🏠 URLs locales (/images/cards/): ${localUrls} (${(localUrls / totalCards * 100).toFixed(1)}%)`);
            console.log(`   🌐 URLs externas (ygoprodeck): ${externalUrls} (${(externalUrls / totalCards * 100).toFixed(1)}%)`);
            console.log(`   ❓ Otras URLs: ${otherUrls} (${(otherUrls / totalCards * 100).toFixed(1)}%)`);

            if (localUrls === totalCards) {
                console.log('\n✅ Migración completada - Todas las cartas usan URLs locales');
            } else if (externalUrls === totalCards) {
                console.log('\n🌐 No migrado - Todas las cartas usan URLs externas');
            } else {
                console.log('\n⚠️  Migración parcial - Mezcla de URLs locales y externas');
            }

        } catch (error) {
            console.error('💥 Error verificando estado:', error.message);
        }
    }
}

// Funciones para usar desde línea de comandos
async function runMigration() {
    const migration = new ImageUrlMigration();
    try {
        await migration.migrateImageUrls();
    } catch (error) {
        console.error('Error en migración:', error);
        process.exit(1);
    }
}

async function revertMigration() {
    const migration = new ImageUrlMigration();
    try {
        await migration.revertMigration();
    } catch (error) {
        console.error('Error en reversión:', error);
        process.exit(1);
    }
}

async function checkStatus() {
    const migration = new ImageUrlMigration();
    try {
        await migration.checkMigrationStatus();
    } catch (error) {
        console.error('Error verificando estado:', error);
        process.exit(1);
    }
}

// Ejecutar según argumento de línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];

    switch (command) {
        case 'migrate':
            runMigration();
            break;
        case 'revert':
            revertMigration();
            break;
        case 'status':
        case 'check':
            checkStatus();
            break;
        default:
            console.log('Uso: node migrateImageUrls.js [migrate|revert|status]');
            console.log('  migrate - Migrar URLs a locales');
            console.log('  revert  - Revertir a URLs externas');
            console.log('  status  - Verificar estado actual');
            process.exit(1);
    }
}

export default ImageUrlMigration;
