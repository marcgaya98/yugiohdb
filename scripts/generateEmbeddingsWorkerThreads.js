// Script para generar embeddings usando Worker Threads para máximo rendimiento
import { Worker } from 'worker_threads';
import Card from '../models/Card.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import path from 'path';

class ConcurrentEmbeddingGenerator {
    constructor(maxWorkers = 3, batchSize = 10) {
        this.maxWorkers = maxWorkers;
        this.batchSize = batchSize;
        this.activeWorkers = 0;
        this.processedCount = 0;
        this.errorCount = 0;
        this.workerPath = path.join(process.cwd(), 'workers', 'clipEmbeddingWorker.js');
    }

    async generateAllEmbeddings() {
        console.log('🚀 Iniciando generación de embeddings con Worker Threads...\n');

        try {
            // Obtener cartas pendientes
            const cardsWithoutEmbedding = await Card.findAll({
                where: {
                    [Op.and]: [
                        { clip_embedding: null },
                        { password: { [Op.not]: null } }
                    ]
                },
                attributes: ['id', 'password', 'name'],
                order: [['id', 'ASC']]
            });

            if (cardsWithoutEmbedding.length === 0) {
                console.log('✅ No hay cartas pendientes por procesar');
                return;
            }

            console.log(`📊 Configuración:`);
            console.log(`Cartas a procesar: ${cardsWithoutEmbedding.length}`);
            console.log(`Workers máximos: ${this.maxWorkers}`);
            console.log(`Tamaño de lote por worker: ${this.batchSize}`);
            console.log(`Throughput estimado: ${this.maxWorkers * this.batchSize} cartas por ciclo\n`);

            // Dividir en lotes
            const batches = [];
            for (let i = 0; i < cardsWithoutEmbedding.length; i += this.batchSize) {
                batches.push(cardsWithoutEmbedding.slice(i, i + this.batchSize));
            }

            console.log(`📦 ${batches.length} lotes creados\n`);

            const startTime = Date.now();

            // Procesar lotes con workers concurrentes
            await this.processBatchesConcurrently(batches);

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            const cardsPerSecond = this.processedCount / duration;

            console.log('\n🎯 Resultados finales:');
            console.log(`✅ Procesadas exitosamente: ${this.processedCount}`);
            console.log(`❌ Errores: ${this.errorCount}`);
            console.log(`⏱️ Tiempo total: ${Math.round(duration)} segundos`);
            console.log(`🚀 Velocidad: ${cardsPerSecond.toFixed(2)} cartas/segundo`);

        } catch (error) {
            console.error('❌ Error en el proceso:', error);
        }
    }

    async processBatchesConcurrently(batches) {
        return new Promise((resolve, reject) => {
            let completedBatches = 0;
            let currentBatchIndex = 0;

            const processNextBatch = () => {
                if (currentBatchIndex >= batches.length) {
                    if (this.activeWorkers === 0) {
                        resolve();
                    }
                    return;
                }

                const batch = batches[currentBatchIndex++];
                this.activeWorkers++;

                console.log(`🔄 Procesando lote ${currentBatchIndex}/${batches.length} (${this.activeWorkers} workers activos)`);

                const worker = new Worker(this.workerPath, {
                    workerData: { cards: batch }
                });

                worker.on('message', async (message) => {
                    if (message.type === 'results') {
                        await this.handleWorkerResults(message.results);

                        completedBatches++;
                        this.activeWorkers--;

                        console.log(`✅ Lote ${completedBatches}/${batches.length} completado`);
                        console.log(`📈 Progreso: ${Math.round((completedBatches / batches.length) * 100)}%`);

                        worker.terminate();
                        processNextBatch();
                    } else if (message.type === 'error') {
                        console.error('❌ Error en worker:', message.error);
                        this.activeWorkers--;
                        worker.terminate();
                        processNextBatch();
                    }
                });

                worker.on('error', (error) => {
                    console.error('❌ Worker error:', error);
                    this.activeWorkers--;
                    processNextBatch();
                });

                worker.on('exit', (code) => {
                    if (code !== 0) {
                        console.error(`❌ Worker salió con código ${code}`);
                    }
                });
            };

            // Iniciar workers hasta el máximo permitido
            for (let i = 0; i < Math.min(this.maxWorkers, batches.length); i++) {
                processNextBatch();
            }
        });
    }

    async handleWorkerResults(results) {
        for (const result of results) {
            if (result.success) {
                try {
                    // Guardar embedding en la base de datos
                    await Card.update(
                        { clip_embedding: result.embedding },
                        { where: { id: result.cardId } }
                    );

                    this.processedCount++;
                    console.log(`✅ ${result.name}`);
                } catch (error) {
                    console.error(`❌ Error guardando ${result.name}:`, error.message);
                    this.errorCount++;
                }
            } else {
                console.error(`❌ ${result.name}: ${result.error}`);
                this.errorCount++;
            }
        }
    }
}

async function runConcurrentEmbeddingGeneration() {
    const maxWorkers = process.env.MAX_WORKERS ? parseInt(process.env.MAX_WORKERS) : 3;
    const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : 8;

    const generator = new ConcurrentEmbeddingGenerator(maxWorkers, batchSize);

    try {
        await generator.generateAllEmbeddings();
    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        await sequelize.close();
        console.log('\n👋 Proceso finalizado');
    }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runConcurrentEmbeddingGeneration();
}

export default runConcurrentEmbeddingGeneration;
