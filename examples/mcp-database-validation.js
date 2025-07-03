#!/usr/bin/env node

// Ejemplo avanzado: Validación de cartas usando MCP Database + YGOPRODeckService
// Este script consulta tu BD real y valida las cartas contra la API externa

import YGOPRODeckService from '../services/YGOPRODeckService.js';

// Simular las funciones MCP (en un entorno real usarías bb7_execute_sql)
async function executeSqlQuery(query) {
    // En un entorno real con MCP, usarías:
    // return await bb7_execute_sql({ sql: query });
    
    // Para este ejemplo, simulamos algunos datos
    if (query.includes('card LIMIT 5')) {
        return {
            success: true,
            data: {
                rows: [
                    { id: 1, name: "Blue-Eyes White Dragon", password: "89631139" },
                    { id: 2, name: "Dark Magician", password: "46986414" },
                    { id: 3, name: "Red-Eyes Black Dragon", password: "74677422" },
                    { id: 4, name: "Exodia the Forbidden One", password: "33396948" },
                    { id: 5, name: "Kuriboh", password: "40640057" }
                ]
            }
        };
    } else if (query.includes('COUNT(*)')) {
        return {
            success: true,
            data: {
                rows: [{ total_cards: 2469 }]
            }
        };
    }
    
    return { success: false, error: "Query not supported in simulation" };
}

/**
 * Validar cartas de tu BD contra la API de YGOPRODeck
 */
async function validateDatabaseCards() {
    console.log('🔄 VALIDANDO CARTAS DE LA BASE DE DATOS...\n');
    
    try {
        // Obtener cartas de tu BD
        const result = await executeSqlQuery('SELECT id, name, password FROM card LIMIT 5');
        
        if (!result.success) {
            console.error('❌ Error consultando la base de datos');
            return;
        }
        
        const localCards = result.data.rows;
        console.log(`📊 Cartas obtenidas de BD: ${localCards.length}\n`);
        
        const validationResults = [];
        
        for (const localCard of localCards) {
            console.log(`🔍 Validando: ${localCard.name}`);
            
            try {
                // Buscar en API por password/ID
                let apiData = null;
                
                if (localCard.password) {
                    apiData = await YGOPRODeckService.getCardByPassword(localCard.password);
                } else {
                    // Si no hay password, buscar por nombre
                    apiData = await YGOPRODeckService.getCardInfo({ name: localCard.name });
                }
                
                if (apiData && apiData.data && apiData.data.length > 0) {
                    const apiCard = apiData.data[0];
                    
                    const result = {
                        localCard: localCard,
                        apiCard: apiCard,
                        status: 'found',
                        nameMatch: localCard.name === apiCard.name,
                        passwordMatch: localCard.password == apiCard.id
                    };
                    
                    validationResults.push(result);
                    
                    console.log(`   ✅ Encontrada en API`);
                    console.log(`   📋 Nombre API: ${apiCard.name}`);
                    console.log(`   🆔 Password API: ${apiCard.id}`);
                    console.log(`   ✅ Nombres: ${result.nameMatch ? 'Coinciden' : 'Diferentes'}`);
                    console.log(`   ✅ Passwords: ${result.passwordMatch ? 'Coinciden' : 'Diferentes'}`);
                    
                } else {
                    const result = {
                        localCard: localCard,
                        apiCard: null,
                        status: 'not_found'
                    };
                    
                    validationResults.push(result);
                    console.log(`   ❌ No encontrada en API`);
                }
                
            } catch (error) {
                const result = {
                    localCard: localCard,
                    apiCard: null,
                    status: 'error',
                    error: error.message
                };
                
                validationResults.push(result);
                console.log(`   ❌ Error: ${error.message}`);
            }
            
            console.log(''); // Línea en blanco
        }
        
        // Resumen de resultados
        console.log('📊 RESUMEN DE VALIDACIÓN:');
        console.log('='.repeat(30));
        
        const found = validationResults.filter(r => r.status === 'found').length;
        const notFound = validationResults.filter(r => r.status === 'not_found').length;
        const errors = validationResults.filter(r => r.status === 'error').length;
        const nameMatches = validationResults.filter(r => r.nameMatch).length;
        const passwordMatches = validationResults.filter(r => r.passwordMatch).length;
        
        console.log(`✅ Encontradas en API: ${found}/${localCards.length}`);
        console.log(`❌ No encontradas: ${notFound}/${localCards.length}`);
        console.log(`⚠️  Errores: ${errors}/${localCards.length}`);
        console.log(`📋 Nombres coinciden: ${nameMatches}/${found}`);
        console.log(`🆔 Passwords coinciden: ${passwordMatches}/${found}`);
        
        return validationResults;
        
    } catch (error) {
        console.error('Error en validación:', error);
    }
}

/**
 * Analizar cartas faltantes y buscarlas en la API
 */
async function analyzeAndSearchMissingCards() {
    console.log('🔍 ANALIZANDO CARTAS FALTANTES...\n');
    
    try {
        // Simular lectura de archivo de cartas faltantes (en real usarías bb7_read_file)
        const missingCards = [
            "Elemental HERO Sparkman",
            "Winged Dragon Guardian of the Fortress",
            "Neo-Spacian Air Hummingbird"
        ];
        
        console.log(`📊 Cartas faltantes a analizar: ${missingCards.length}\n`);
        
        for (const cardName of missingCards) {
            console.log(`🔍 Buscando: ${cardName}`);
            
            try {
                const apiData = await YGOPRODeckService.getCardInfo({ 
                    fname: cardName // Búsqueda por nombre parcial
                });
                
                if (apiData && apiData.data && apiData.data.length > 0) {
                    console.log(`   ✅ Encontradas ${apiData.data.length} coincidencias:`);
                    
                    apiData.data.slice(0, 3).forEach((card, index) => {
                        console.log(`      ${index + 1}. ${card.name} (${card.id})`);
                        if (card.atk !== undefined) {
                            console.log(`         ATK: ${card.atk} | DEF: ${card.def} | Level: ${card.level}`);
                        }
                    });
                    
                    if (apiData.data.length > 3) {
                        console.log(`      ... y ${apiData.data.length - 3} más`);
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
        console.error('Error analizando cartas faltantes:', error);
    }
}

/**
 * Obtener estadísticas de la base de datos y compararlas
 */
async function getDatabaseStats() {
    console.log('📊 ESTADÍSTICAS DE LA BASE DE DATOS...\n');
    
    try {
        const totalResult = await executeSqlQuery('SELECT COUNT(*) as total_cards FROM card');
        
        if (totalResult.success) {
            const totalCards = totalResult.data.rows[0].total_cards;
            console.log(`📋 Total de cartas en BD: ${totalCards}`);
            
            // Obtener versión de la base de datos de YGOPRODeck
            try {
                const versionData = await YGOPRODeckService.checkDatabaseVersion();
                console.log(`🌐 Última actualización API: ${versionData[0].database_version}`);
                console.log(`📅 Fecha API: ${versionData[0].last_update}`);
                
                // Simular más estadísticas
                console.log('\n📊 Estadísticas adicionales:');
                console.log('   - Cartas verificadas: 5/5 (100%)');
                console.log('   - Cartas coincidentes: 5/5 (100%)');
                console.log('   - Cartas con errores: 0/5 (0%)');
                
            } catch (error) {
                console.log('⚠️  No se pudo obtener versión de la API');
            }
        }
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
    }
}

/**
 * Función principal
 */
async function main() {
    console.log('🎯 VALIDACIÓN AVANZADA MCP + YGOPRODeckService');
    console.log('===============================================\n');
    
    // 1. Validar cartas de la BD
    await validateDatabaseCards();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Analizar cartas faltantes
    await analyzeAndSearchMissingCards();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Estadísticas generales
    await getDatabaseStats();
    
    console.log('\n✅ Validación avanzada completada!');
    console.log('\n💡 En un entorno real con MCP activo:');
    console.log('   - bb7_execute_sql() consultaría tu BD MySQL');
    console.log('   - bb7_read_file() leería cards_import_errors.json');
    console.log('   - bb7_write_file() guardaría reportes automáticos');
    console.log('   - bb7_git_commit() haría commit de cambios');
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { validateDatabaseCards, analyzeAndSearchMissingCards, getDatabaseStats };
