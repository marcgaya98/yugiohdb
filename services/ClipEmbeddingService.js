// Servicio de embeddings multimodales con CLIP para búsqueda semántica visual
import { pipeline } from '@xenova/transformers';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import Card from '../models/Card.js';
import { normalizePasswordForUrl } from '../utils/passwordUtils.js';
import { Op } from 'sequelize';

class ClipEmbeddingService {
    constructor() {
        this.clipModel = null;
        this.textModel = null;
        this.initialized = false;
        this.modelName = 'Xenova/clip-vit-base-patch32';
    }

    async initialize() {
        if (this.initialized) return;

        console.log('🔄 Inicializando CLIP para búsqueda semántica visual...');

        try {
            // Para @xenova/transformers, CLIP funciona mejor con zero-shot-image-classification
            // que maneja automáticamente el preprocesamiento de imágenes
            console.log('🤖 Cargando modelo CLIP...');
            this.clipModel = await pipeline('zero-shot-image-classification', this.modelName, {
                quantized: false,
                device: 'cpu'
            });

            // Para texto, usamos el mismo modelo pero con prompts específicos
            this.textModel = this.clipModel;

            this.initialized = true;
            console.log('✅ CLIP inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando CLIP:', error);
            throw error;
        }
    }

    // Generar embedding de texto usando CLIP
    async generateTextEmbedding(text) {
        if (!this.initialized) await this.initialize();

        try {
            console.log(`📝 Procesando texto para búsqueda: "${text}"`);
            // Para texto, simplemente guardamos el texto normalizado
            // La comparación se hará directamente con zero-shot classification
            return text.toLowerCase().trim();
        } catch (error) {
            console.error('❌ Error procesando texto:', error);
            return null;
        }
    }

    // Generar embedding de imagen usando CLIP
    async generateImageEmbedding(imagePath) {
        if (!this.initialized) await this.initialize();

        try {
            // Verificar que la imagen existe
            if (!(await fs.pathExists(imagePath))) {
                throw new Error(`Imagen no encontrada: ${imagePath}`);
            }

            console.log(`🖼️ Procesando imagen: ${path.basename(imagePath)}`);

            // Visual concept list DEFINITIVA para arte de cartas Yu-Gi-Oh! hasta GX (solo imagen, sin frame ni stats)
            const visualConcepts = [
                // Atributos visuales (por elementos predominantes en el arte)
                "light element", "dark element", "water element", "fire element", "earth element", "wind element",

                // Tipos de criaturas (visualmente identificables)
                "dragon", "warrior", "spellcaster", "fiend", "zombie", "machine", "aqua", "beast",
                "winged creature", "plant", "insect", "rock creature", "dinosaur", "fairy", "serpent",

                // Características visuales específicas
                "humanoid", "mechanical", "demonic", "angelic", "undead", "robotic", "bestial", "reptilian",

                // Arquetipos visualmente identificables hasta GX
                "Dark Magician", "Blue-Eyes", "Red-Eyes", "Toon", "Elemental HERO", "Destiny HERO",
                "Cyber", "Ancient Gear", "Crystal Beast", "Ojama", "Neos", "Vehicroid", "Amazoness",

                // Estilos artísticos
                "anime style", "cartoon style", "realistic", "dark artwork", "bright artwork", "ethereal",
                "technological", "mystical", "chibi style", "detailed", "minimalist", "abstract",

                // Elementos visuales
                "fire visual", "water visual", "lightning", "ice", "stone", "crystal", "metal parts",
                "cloth", "armor", "robe", "magic aura", "energy effect", "explosion", "darkness",

                // Escenarios/fondos
                "battlefield", "castle", "temple", "space", "forest", "city", "ruins", "cave",
                "underwater", "sky", "volcanic", "desert", "graveyard", "laboratory", "void",

                // Acción representada
                "attacking", "defending", "casting spell", "flying", "running", "standing pose",
                "summoning", "transforming", "dual wielding", "riding mount", "charging energy",

                // Equipamiento visible
                "sword", "staff", "shield", "armor", "helmet", "robe", "wings", "claws", "fangs",
                "horns", "tentacles", "gun", "cannon", "bow", "multiple heads", "crown", "jewel",

                // Efectos visuales
                "glowing", "shining", "flaming", "shadowy", "sparkling", "smoky", "flowing",
                "crystalline", "ghostly", "spectral", "electrified", "corrupted", "holy",

                // Composición visual
                "close-up", "full body", "dynamic pose", "symmetrical", "asymmetrical",
                "face visible", "face obscured", "multiple creatures", "alone", "group shot",

                // Colores dominantes
                "red dominant", "blue dominant", "green dominant", "black dominant", "white dominant",
                "purple dominant", "gold dominant", "silver dominant", "orange dominant", "multicolored",

                // Era/época visual
                "ancient", "medieval", "futuristic", "steampunk", "cyberpunk", "egyptian", "asian",
                "western", "primitive", "high-tech",

                // Temas GX específicos
                "Neo-Spacian", "Duel Academy", "Sacred Beast", "Cyber Art", "Hero Theme", "Spirit Key",

                // Emociones/carácter
                "intimidating", "heroic", "friendly", "mysterious", "chaotic", "noble", "cute",
                "fierce", "serene", "menacing", "playful", "stoic", "wise", "childish"
            ];

            // Generar scores para cada concepto usando zero-shot classification
            const conceptScores = [];

            for (const concept of visualConcepts) {
                try {
                    const result = await this.clipModel(imagePath, [concept, "other"]);
                    const score = result.find(r => r.label === concept)?.score || 0;
                    conceptScores.push(score);
                } catch (error) {
                    // Si falla un concepto, usar 0
                    conceptScores.push(0);
                }
            }

            console.log(`✅ Vector de características generado (dimensión: ${conceptScores.length})`);
            return conceptScores;
        } catch (error) {
            console.error(`❌ Error procesando imagen ${imagePath}:`, error);
            return null;
        }
    }

    // Generar embeddings CLIP para todas las cartas con procesamiento concurrente
    async generateAllImageEmbeddings(batchSize = 10, maxConcurrency = 3) {
        if (!this.initialized) await this.initialize();

        console.log('🔄 Generando embeddings CLIP para todas las cartas...');

        // Obtener cartas sin embedding CLIP que tengan password
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

        console.log(`🖼️ Procesando ${cardsWithoutEmbedding.length} cartas en lotes de ${batchSize} con concurrencia máxima de ${maxConcurrency}...`);

        let processed = 0;
        let errors = 0;

        // Procesar en lotes para evitar sobrecarga de memoria
        for (let i = 0; i < cardsWithoutEmbedding.length; i += batchSize) {
            const batch = cardsWithoutEmbedding.slice(i, i + batchSize);

            console.log(`\n📦 Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(cardsWithoutEmbedding.length / batchSize)}`);

            // Procesar el lote con concurrencia limitada
            const batchResults = await this.processBatchConcurrent(batch, maxConcurrency);

            processed += batchResults.processed;
            errors += batchResults.errors;

            console.log(`📊 Lote completado: ${batchResults.processed} exitosos, ${batchResults.errors} errores`);
            console.log(`📈 Progreso total: ${processed}/${cardsWithoutEmbedding.length} (${Math.round((processed / cardsWithoutEmbedding.length) * 100)}%)`);

            // Pausa breve entre lotes para evitar sobrecarga del modelo
            if (i + batchSize < cardsWithoutEmbedding.length) {
                console.log('⏳ Pausa breve entre lotes...');
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        console.log(`\n🎉 Proceso completado:`);
        console.log(`✅ Exitosos: ${processed}`);
        console.log(`❌ Errores: ${errors}`);
        console.log(`📊 Total procesado: ${processed + errors}/${cardsWithoutEmbedding.length}`);

        return { processed, errors, total: cardsWithoutEmbedding.length };
    }

    // Procesar un lote de cartas de forma concurrente
    async processBatchConcurrent(batch, maxConcurrency) {
        const results = { processed: 0, errors: 0 };

        // Función para procesar una carta individual
        const processCard = async (card) => {
            try {
                const normalizedPassword = normalizePasswordForUrl(card.password);
                const imagePath = path.join(process.cwd(), 'public/images/cards/cropped', `${normalizedPassword}.jpg`);

                // Generar embedding
                const embedding = await this.generateImageEmbedding(imagePath);

                if (embedding) {
                    // Guardar en la base de datos
                    await card.update({
                        clip_embedding: embedding
                    });

                    results.processed++;
                    console.log(`✅ ${card.name}`);
                    return { success: true, card: card.name };
                } else {
                    results.errors++;
                    console.error(`❌ No se pudo generar embedding para ${card.name}`);
                    return { success: false, card: card.name, error: 'No embedding generated' };
                }

            } catch (error) {
                results.errors++;
                console.error(`❌ Error procesando ${card.name}:`, error.message);
                return { success: false, card: card.name, error: error.message };
            }
        };

        // Procesar con concurrencia limitada usando Promise.allSettled
        const chunks = [];
        for (let i = 0; i < batch.length; i += maxConcurrency) {
            chunks.push(batch.slice(i, i + maxConcurrency));
        }

        for (const chunk of chunks) {
            const promises = chunk.map(card => processCard(card));
            await Promise.allSettled(promises);

            // Pequeña pausa entre chunks para no sobrecargar el modelo
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    // Calcular similitud coseno entre embeddings
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Buscar cartas por descripción visual en texto natural
    async searchByVisualDescription(description, limit = 20) {
        if (!this.initialized) await this.initialize();

        console.log(`🔍 Buscando cartas con descripción visual: "${description}"`);

        // Generar embedding del texto de búsqueda
        const textEmbedding = await this.generateTextEmbedding(description);
        if (!textEmbedding) {
            console.error('❌ No se pudo generar embedding del texto de búsqueda');
            return [];
        }

        // Obtener todas las cartas con embeddings CLIP
        const cardsWithEmbeddings = await Card.findAll({
            where: {
                clip_embedding: { [Op.not]: null }
            },
            attributes: ['id', 'name', 'password', 'clip_embedding', 'cardType', 'archetype']
        });

        if (cardsWithEmbeddings.length === 0) {
            console.warn('⚠️ No hay cartas con embeddings CLIP. Ejecuta primero la generación de embeddings.');
            return [];
        }

        console.log(`📋 Comparando con ${cardsWithEmbeddings.length} cartas...`);

        // Calcular similitudes
        const similarities = [];
        let processed = 0;

        for (const card of cardsWithEmbeddings) {
            try {
                const cardEmbedding = card.clip_embedding;
                let similarity = 0;

                // Detectar el formato del embedding
                if (Array.isArray(cardEmbedding)) {
                    // Formato array directo - usar como vector de características
                    similarity = this.calculateFeatureSimilarity(textEmbedding, cardEmbedding);
                } else {
                    // Parsear si es string JSON
                    const embeddingStr = typeof cardEmbedding === 'string' ? cardEmbedding : JSON.stringify(cardEmbedding);

                    if (embeddingStr.startsWith('[') && embeddingStr.endsWith(']')) {
                        // Formato array JSON
                        const parsedEmbedding = JSON.parse(embeddingStr);
                        similarity = this.calculateFeatureSimilarity(textEmbedding, parsedEmbedding);
                    } else {
                        // Formato objeto legacy - skip
                        continue;
                    }
                }

                similarities.push({
                    cardId: card.id.toString(),
                    similarity,
                    name: card.name,
                    password: card.password,
                    cardType: card.cardType,
                    archetype: card.archetype
                });

                processed++;
                if (processed % 100 === 0) {
                    console.log(`📊 Procesadas ${processed}/${cardsWithEmbeddings.length} cartas...`);
                }

            } catch (error) {
                console.warn(`⚠️ Error processing card ${card.id}:`, error.message);
            }
        }

        // Ordenar por similitud (mayor a menor)
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Devolver los top resultados
        const topResults = similarities.slice(0, limit);

        console.log(`🎯 Top 5 resultados para "${description}":`);
        topResults.slice(0, 5).forEach((result, i) => {
            console.log(`${i + 1}. ${result.name} (${Math.round(result.similarity * 100)}% similitud)`);
        });

        return topResults;
    }

    // Calcular similitud basada en características usando el texto de búsqueda
    calculateFeatureSimilarity(searchText, imageFeatures) {
        try {
            // Verificar que imageFeatures sea un array válido
            if (!Array.isArray(imageFeatures) || imageFeatures.length === 0) {
                console.warn('⚠️ imageFeatures no es un array válido:', imageFeatures);
                return 0;
            }

            // Lista de conceptos visuales (misma que en generateImageEmbedding)
            const visualConcepts = [
                // Atributos visuales (por elementos predominantes en el arte)
                "light element", "dark element", "water element", "fire element", "earth element", "wind element",

                // Tipos de criaturas (visualmente identificables)
                "dragon", "warrior", "spellcaster", "fiend", "zombie", "machine", "aqua", "beast",
                "winged creature", "plant", "insect", "rock creature", "dinosaur", "fairy", "serpent",

                // Características visuales específicas
                "humanoid", "mechanical", "demonic", "angelic", "undead", "robotic", "bestial", "reptilian",

                // Arquetipos visualmente identificables hasta GX
                "Dark Magician", "Blue-Eyes", "Red-Eyes", "Toon", "Elemental HERO", "Destiny HERO",
                "Cyber", "Ancient Gear", "Crystal Beast", "Ojama", "Neos", "Vehicroid", "Amazoness",

                // Estilos artísticos
                "anime style", "cartoon style", "realistic", "dark artwork", "bright artwork", "ethereal",
                "technological", "mystical", "chibi style", "detailed", "minimalist", "abstract",

                // Elementos visuales
                "fire visual", "water visual", "lightning", "ice", "stone", "crystal", "metal parts",
                "cloth", "armor", "robe", "magic aura", "energy effect", "explosion", "darkness",

                // Escenarios/fondos
                "battlefield", "castle", "temple", "space", "forest", "city", "ruins", "cave",
                "underwater", "sky", "volcanic", "desert", "graveyard", "laboratory", "void",

                // Acción representada
                "attacking", "defending", "casting spell", "flying", "running", "standing pose",
                "summoning", "transforming", "dual wielding", "riding mount", "charging energy",

                // Equipamiento visible
                "sword", "staff", "shield", "armor", "helmet", "robe", "wings", "claws", "fangs",
                "horns", "tentacles", "gun", "cannon", "bow", "multiple heads", "crown", "jewel",

                // Efectos visuales
                "glowing", "shining", "flaming", "shadowy", "sparkling", "smoky", "flowing",
                "crystalline", "ghostly", "spectral", "electrified", "corrupted", "holy",

                // Composición visual
                "close-up", "full body", "dynamic pose", "symmetrical", "asymmetrical",
                "face visible", "face obscured", "multiple creatures", "alone", "group shot",

                // Colores dominantes
                "red dominant", "blue dominant", "green dominant", "black dominant", "white dominant",
                "purple dominant", "gold dominant", "silver dominant", "orange dominant", "multicolored",

                // Era/época visual
                "ancient", "medieval", "futuristic", "steampunk", "cyberpunk", "egyptian", "asian",
                "western", "primitive", "high-tech",

                // Temas GX específicos
                "Neo-Spacian", "Duel Academy", "Sacred Beast", "Cyber Art", "Hero Theme", "Spirit Key",

                // Emociones/carácter
                "intimidating", "heroic", "friendly", "mysterious", "chaotic", "noble", "cute",
                "fierce", "serene", "menacing", "playful", "stoic", "wise", "childish"
            ];

            // Verificar que tenemos la misma cantidad de conceptos
            if (imageFeatures.length !== visualConcepts.length) {
                console.warn(`⚠️ Dimensión mismatch: imagen=${imageFeatures.length}, conceptos=${visualConcepts.length}`);
                return 0;
            }

            // Mapeo de español a inglés para términos clave
            const translationMap = {
                'guerrero': 'warrior',
                'dragon': 'dragon',
                'dragón': 'dragon',
                'espada': 'sword',
                'armadura': 'armor',
                'fuego': 'fire',
                'rojo': 'red',
                'monstruo': 'monster',
                'mecánico': 'mechanical',
                'cañones': 'cannon',
                'hada': 'fairy',
                'alas': 'wings',
                'brillante': 'bright',
                'brillantes': 'bright',
                'criatura': 'creature',
                'egipcia': 'egyptian',
                'egipcio': 'egyptian',
                'antigua': 'ancient',
                'antiguo': 'ancient',
                'héroe': 'hero',
                'capa': 'cape',
                'acuático': 'aquatic',
                'submarino': 'underwater',
                'azul': 'blue',
                'negro': 'black',
                'blanco': 'white',
                'verde': 'green',
                'amarillo': 'yellow',
                'púrpura': 'purple',
                'dorado': 'gold',
                'plateado': 'silver',
                'agua': 'water',
                'tierra': 'earth',
                'viento': 'wind',
                'oscuro': 'dark',
                'luz': 'light',
                'máquina': 'machine',
                'bestia': 'beast',
                'demonio': 'fiend',
                'zombie': 'zombie',
                'planta': 'plant',
                'insecto': 'insect',
                'dinosaurio': 'dinosaur',
                'con': 'with'
            };

            // Traducir el texto de búsqueda
            let translatedText = searchText.toLowerCase();
            for (const [spanish, english] of Object.entries(translationMap)) {
                translatedText = translatedText.replace(new RegExp(spanish, 'g'), english);
            }

            // Generar scores más sofisticados para el texto de búsqueda
            const textScores = [];
            for (const concept of visualConcepts) {
                let score = 0;
                const conceptLower = concept.toLowerCase();

                // Matching exacto (peso alto)
                if (translatedText.includes(conceptLower)) {
                    score = 1.0;
                }
                // Matching de palabras individuales (peso medio)
                else {
                    const conceptWords = conceptLower.split(' ');
                    const searchWords = translatedText.split(' ');
                    let wordMatches = 0;

                    for (const conceptWord of conceptWords) {
                        if (searchWords.some(searchWord =>
                            searchWord.includes(conceptWord) || conceptWord.includes(searchWord)
                        )) {
                            wordMatches++;
                        }
                    }

                    if (wordMatches > 0) {
                        score = (wordMatches / conceptWords.length) * 0.7; // Peso reducido para matches parciales
                    }
                }

                textScores.push(score);
            }

            // Usar producto punto en lugar de similitud coseno para mejores scores
            let dotProduct = 0;
            for (let i = 0; i < textScores.length; i++) {
                dotProduct += textScores[i] * imageFeatures[i];
            }

            // Normalizar por el número de conceptos activos en la búsqueda
            const activeConceptsInSearch = textScores.filter(score => score > 0).length;
            const normalizedScore = activeConceptsInSearch > 0 ? dotProduct / activeConceptsInSearch : 0;

            // Verificar que el resultado sea válido
            if (isNaN(normalizedScore)) {
                console.warn('⚠️ Similitud es NaN, devolviendo 0');
                return 0;
            }

            return Math.min(normalizedScore, 1.0); // Cap a 1.0
        } catch (error) {
            console.warn('⚠️ Error calculating feature similarity:', error);
            return 0;
        }
    }

    // Obtener estadísticas de embeddings CLIP
    async getEmbeddingStats() {
        const totalCards = await Card.count();
        const cardsWithPassword = await Card.count({
            where: { password: { [Op.not]: null } }
        });
        const cardsWithClipEmbedding = await Card.count({
            where: { clip_embedding: { [Op.not]: null } }
        });

        return {
            totalCards,
            cardsWithPassword,
            cardsWithClipEmbedding,
            completionPercentage: Math.round((cardsWithClipEmbedding / cardsWithPassword) * 100)
        };
    }
}

export default new ClipEmbeddingService();
