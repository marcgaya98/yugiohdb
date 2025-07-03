#!/usr/bin/env node

// Ejemplo REAL usando MCP Database + YGOPRODeckService
// Este script usa los MCP reales para consultar tu BD MySQL

import YGOPRODeckService from '../services/YGOPRODeckService.js';

/**
 * NOTA: Este script está diseñado para ejecutarse desde el chat de GitHub Copilot
 * donde los MCP están activos. Las funciones bb7_* no están disponibles en Node.js directo.
 * 
 * Para usar este script:
 * 1. Abre VS Code con el proyecto
 * 2. En el chat de Copilot, di: "Ejecuta el script mcp-real-integration.js"
 * 3. O copia las funciones individuales al chat
 */

/**
 * Ejemplo de consulta real a la BD usando MCP
 */
function generateDatabaseQueries() {
    return {
        // Consulta 1: Cartas más populares en mazos
        popularCards: `
            SELECT c.name, c.password, COUNT(dc.cardId) as deck_count 
            FROM card c 
            JOIN deck_card dc ON c.id = dc.cardId 
            GROUP BY c.id 
            ORDER BY deck_count DESC 
            LIMIT 10;
        `,
        
        // Consulta 2: Cartas sin password
        cardsWithoutPassword: `
            SELECT id, name 
            FROM card 
            WHERE password IS NULL OR password = '' 
            LIMIT 10;
        `,
        
        // Consulta 3: Cartas de un tipo específico
        monsterCards: `
            SELECT c.name, c.password, mc.atk, mc.def, mc.level
            FROM card c
            JOIN monster_card mc ON c.id = mc.cardId
            ORDER BY mc.atk DESC
            LIMIT 10;
        `,
        
        // Consulta 4: Personajes con más mazos
        charactersWithMostDecks: `
            SELECT ch.name, COUNT(d.id) as deck_count
            FROM character ch
            JOIN deck d ON ch.id = d.characterId
            GROUP BY ch.id
            ORDER BY deck_count DESC
            LIMIT 5;
        `,
        
        // Consulta 5: Cartas por arquetipo Blue-Eyes
        blueEyesCards: `
            SELECT name, password 
            FROM card 
            WHERE name LIKE '%Blue-Eyes%' 
            ORDER BY name;
        `
    };
}

/**
 * Instrucciones para validar cartas usando MCP
 */
function generateMCPInstructions() {
    const queries = generateDatabaseQueries();
    
    console.log('🎯 INSTRUCCIONES PARA USAR MCP REAL');
    console.log('=====================================\n');
    
    console.log('📋 Para ejecutar estas consultas en el chat de Copilot:\n');
    
    Object.entries(queries).forEach(([name, query], index) => {
        console.log(`${index + 1}. **${name}**:`);
        console.log('   Consulta SQL:');
        console.log(`   \`\`\`sql`);
        console.log(`   ${query.trim()}`);
        console.log('   ```\n');
    });
    
    console.log('🔧 COMANDOS MCP PARA EL CHAT:\n');
    
    console.log('1. **Consultar cartas populares:**');
    console.log('   "Ejecuta esta consulta SQL para mostrar las 10 cartas más usadas en mazos"');
    console.log('   Luego pega la consulta popularCards\n');
    
    console.log('2. **Validar carta específica:**');
    console.log('   "Busca información de Blue-Eyes White Dragon en la API de YGOPRODeck"');
    console.log('   Compara con datos de tu BD\n');
    
    console.log('3. **Leer archivo de errores:**');
    console.log('   "Lee el archivo cards_import_errors.json y analiza los tipos de errores"\n');
    
    console.log('4. **Buscar cartas faltantes:**');
    console.log('   "Lee el archivo cards_not_found.json y busca las primeras 5 cartas en la API de YGOPRODeck"\n');
    
    console.log('5. **Hacer commit de cambios:**');
    console.log('   "Haz commit de los archivos de ejemplos MCP creados"\n');
}

/**
 * Generar ejemplos de funciones para usar en el chat
 */
function generateChatExamples() {
    console.log('💬 EJEMPLOS PARA EL CHAT DE COPILOT:\n');
    
    const examples = [
        {
            title: "Validar cartas Blue-Eyes",
            command: `
// 1. Consultar BD
bb7_execute_sql({ sql: "SELECT name, password FROM card WHERE name LIKE '%Blue-Eyes%'" });

// 2. Para cada carta, validar con API
// Usar bb7_fetch con URL: https://db.ygoprodeck.com/api/v7/cardinfo.php?id=CARD_PASSWORD

// 3. Comparar resultados
            `.trim()
        },
        {
            title: "Analizar errores de import",
            command: `
// 1. Leer archivo de errores
bb7_read_file({ path: "/home/marc/Projects/yugioh/cards_import_errors.json" });

// 2. Contar errores por tipo
// 3. Crear reporte de errores
bb7_write_file({ 
    path: "/home/marc/Projects/yugioh/reports/error-analysis.md", 
    content: "# Análisis de Errores\\n..." 
});
            `.trim()
        },
        {
            title: "Buscar cartas faltantes en API",
            command: `
// 1. Leer cartas faltantes
bb7_read_file({ path: "/home/marc/Projects/yugioh/cards_not_found.json" });

// 2. Para cada carta, buscar en API
bb7_fetch({ url: "https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=CARD_NAME" });

// 3. Generar lista de cartas encontradas
            `.trim()
        },
        {
            title: "Control de versiones automático",
            command: `
// 1. Ver estado del repo
bb7_git_status({ repo_path: "/home/marc/Projects/yugioh" });

// 2. Agregar archivos
bb7_git_add({ 
    repo_path: "/home/marc/Projects/yugioh", 
    files: ["examples/", "docs/", "reports/"] 
});

// 3. Hacer commit
bb7_git_commit({ 
    repo_path: "/home/marc/Projects/yugioh", 
    message: "Add MCP integration examples and documentation" 
});
            `.trim()
        }
    ];
    
    examples.forEach((example, index) => {
        console.log(`**${index + 1}. ${example.title}:**`);
        console.log('```javascript');
        console.log(example.command);
        console.log('```\n');
    });
}

/**
 * Función principal
 */
function main() {
    console.log('🎯 INTEGRACIÓN REAL MCP + YGOPRODeckService');
    console.log('============================================\n');
    
    console.log('⚠️  IMPORTANTE: Este script genera instrucciones para usar');
    console.log('   los MCP reales desde el chat de GitHub Copilot.\n');
    
    // Generar consultas SQL
    generateDatabaseQueries();
    
    // Generar instrucciones MCP
    generateMCPInstructions();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Generar ejemplos para el chat
    generateChatExamples();
    
    console.log('✅ Instrucciones generadas!');
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('   1. Abre VS Code con este proyecto');
    console.log('   2. Abre el chat de GitHub Copilot');
    console.log('   3. Copia y pega los comandos de arriba');
    console.log('   4. Los MCP ejecutarán las operaciones reales\n');
    
    console.log('📚 ARCHIVOS CREADOS:');
    console.log('   - examples/mcp-ygopro-integration.js (ejemplos básicos)');
    console.log('   - examples/mcp-database-validation.js (validación simulada)');
    console.log('   - examples/mcp-real-integration.js (este archivo)');
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

// Exportar para uso en otros contextos
export { generateDatabaseQueries, generateMCPInstructions, generateChatExamples };
