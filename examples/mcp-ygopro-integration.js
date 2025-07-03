#!/usr/bin/env node

// Ejemplo práctico usando MCP + YGOPRODeckService
// Este script valida cartas de tu BD contra la API de YGOPRODeck

import YGOPRODeckService from '../services/YGOPRODeckService.js';

/**
 * Ejemplo 1: Validar cartas Blue-Eyes en la BD contra API externa
 */
async function validateBlueEyesCards() {
    console.log('🔍 VALIDANDO CARTAS BLUE-EYES...\n');

    try {
        // Simular consulta a BD (normalmente usarías bb7_execute_sql en MCP)
        const localCards = [
            { name: "Blue-Eyes White Dragon", password: "89631139" },
            { name: "Blue-Eyes Toon Dragon", password: "53183600" },
            { name: "Blue-Eyes Ultimate Dragon", password: "23995346" }
        ];

        for (const card of localCards) {
            console.log(`📋 Validando: ${card.name} (${card.password})`);

            try {
                // Usar YGOPRODeckService para obtener datos de la API
                const apiData = await YGOPRODeckService.getCardByPassword(card.password);

                if (apiData && apiData.data && apiData.data.length > 0) {
                    const apiCard = apiData.data[0];

                    console.log(`   ✅ Encontrada en API: ${apiCard.name}`);
                    console.log(`   📊 ATK: ${apiCard.atk} | DEF: ${apiCard.def} | Level: ${apiCard.level}`);

                    // Verificar coincidencia de nombres
                    if (card.name === apiCard.name) {
                        console.log(`   ✅ Nombres coinciden`);
                    } else {
                        console.log(`   ⚠️  Diferencia en nombres: "${card.name}" vs "${apiCard.name}"`);
                    }
                } else {
                    console.log(`   ❌ No encontrada en API`);
                }

            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }

            console.log(''); // Línea en blanco
        }

    } catch (error) {
        console.error('Error en validación:', error);
    }
}

/**
 * Ejemplo 2: Buscar cartas Toon usando la API
 */
async function findToonCards() {
    console.log('🎪 BUSCANDO CARTAS TOON...\n');

    try {
        const toonCards = await YGOPRODeckService.findToonMonsters();

        console.log(`📊 Total cartas Toon encontradas: ${toonCards.data?.length || 0}`);

        if (toonCards.data && toonCards.data.length > 0) {
            console.log('\n🎭 Primeras 5 cartas Toon:');
            toonCards.data.slice(0, 5).forEach((card, index) => {
                console.log(`   ${index + 1}. ${card.name} (${card.id})`);
                console.log(`      ATK: ${card.atk} | DEF: ${card.def} | Level: ${card.level}`);
            });
        }

    } catch (error) {
        console.error('Error buscando cartas Toon:', error);
    }
}

/**
 * Ejemplo 3: Obtener información de una carta específica y sus URLs de imágenes
 */
async function getCardDetails(cardName) {
    console.log(`🔍 OBTENIENDO DETALLES DE: ${cardName}\n`);

    try {
        const cardData = await YGOPRODeckService.getCardInfo({ name: cardName });

        if (cardData && cardData.data && cardData.data.length > 0) {
            const card = cardData.data[0];

            console.log(`📋 Nombre: ${card.name}`);
            console.log(`🆔 ID: ${card.id}`);
            console.log(`📝 Descripción: ${card.desc}`);
            console.log(`⭐ Tipo: ${card.type}`);

            if (card.atk !== undefined) {
                console.log(`⚔️  ATK: ${card.atk} | 🛡️ DEF: ${card.def} | ⭐ Level: ${card.level}`);
            }

            console.log(`🎨 Arquetipo: ${card.archetype || 'N/A'}`);
            console.log(`🔗 URL YGOPRODeck: ${card.ygoprodeck_url}`);

            // Obtener URLs de imágenes
            const imageUrls = YGOPRODeckService.constructor.getCardImageUrls(card.id);
            console.log(`\n🖼️  URLs de imágenes:`);
            console.log(`   Normal: ${imageUrls.image_url}`);
            console.log(`   Pequeña: ${imageUrls.image_url_small}`);
            console.log(`   Recortada: ${imageUrls.image_url_cropped}`);

        } else {
            console.log('❌ Carta no encontrada');
        }

    } catch (error) {
        console.error('Error obteniendo detalles:', error);
    }
}

/**
 * Función principal
 */
async function main() {
    console.log('🎯 EJEMPLOS MCP + YGOPRODeckService');
    console.log('=====================================\n');

    // Ejemplo 1: Validar cartas Blue-Eyes
    await validateBlueEyesCards();

    console.log('\n' + '='.repeat(50) + '\n');

    // Ejemplo 2: Buscar cartas Toon
    await findToonCards();

    console.log('\n' + '='.repeat(50) + '\n');

    // Ejemplo 3: Detalles de una carta específica
    await getCardDetails('Dark Magician');

    console.log('\n✅ Ejemplos completados!');
    console.log('\n💡 Estos ejemplos muestran cómo combinar:');
    console.log('   - MCP Database (bb7_execute_sql) para datos locales');
    console.log('   - MCP Fetch (bb7_fetch) para APIs externas');
    console.log('   - YGOPRODeckService para lógica de negocio');
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { validateBlueEyesCards, findToonCards, getCardDetails };
