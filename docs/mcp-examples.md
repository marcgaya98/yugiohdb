# Ejemplos Didácticos de MCP - Proyecto Yu-Gi-Oh

## 🎯 Casos de Uso Prácticos con MCP

### 1. **Filesystem MCP - Procesamiento de Datos**

#### Ejemplo 1: Analizar archivos JSON de errores
```javascript
// Caso real: Tienes cards_import_errors.json con errores de importación
// Con Filesystem MCP puedes:

// 1. Leer y analizar errores automáticamente
const errors = await readFile('cards_import_errors.json');
const errorStats = analyzeErrors(errors);

// 2. Crear reporte automático
await writeFile('error_report.md', generateReport(errorStats));

// 3. Limpiar datos automáticamente
const cleanedData = filterValidCards(rawData);
await writeFile('cards_cleaned.json', cleanedData);
```

#### Ejemplo 2: Procesar múltiples archivos de sandwich ratings
```javascript
// Tienes: sandwich_ratings_Jaden_Yuki.json, sandwich_ratings_Alexis_Rhodes.json, etc.
// Con Filesystem MCP:

const characters = ['Jaden_Yuki', 'Alexis_Rhodes', 'Chazz_Princeton'];
for (const char of characters) {
    const ratings = await readFile(`sandbox_ratings_${char}.json`);
    const processed = processRatings(ratings);
    await importToDatabase(char, processed);
}
```

### 2. **Database MCP - Consultas Avanzadas**

#### Ejemplo 3: Análisis de datos de cartas
```sql
-- Encontrar cartas más populares en mazos
SELECT c.name, COUNT(dc.cardId) as deck_count 
FROM cards c 
JOIN deck_cards dc ON c.id = dc.cardId 
GROUP BY c.id 
ORDER BY deck_count DESC 
LIMIT 10;

-- Cartas que solo aparecen en un mazo (cartas raras)
SELECT c.name, ch.name as character_name
FROM cards c 
JOIN deck_cards dc ON c.id = dc.cardId
JOIN decks d ON dc.deckId = d.id
JOIN characters ch ON d.characterId = ch.id
WHERE c.id IN (
    SELECT cardId FROM deck_cards GROUP BY cardId HAVING COUNT(*) = 1
);
```

#### Ejemplo 4: Verificar integridad de datos
```sql
-- Encontrar cartas sin método de obtención
SELECT c.name 
FROM cards c 
LEFT JOIN card_obtentions co ON c.id = co.cardId 
WHERE co.cardId IS NULL;

-- Verificar personajes sin mazos
SELECT ch.name 
FROM characters ch 
LEFT JOIN decks d ON ch.id = d.characterId 
WHERE d.id IS NULL;
```

### 3. **Puppeteer MCP - Scraping Mejorado**

#### Ejemplo 5: Automatizar scraping con manejo de errores
```javascript
// Mejorar tu scrapePacks.js existente
const scrapePage = async (url) => {
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Esperar elemento específico
        await page.waitForSelector('.card-list');
        
        // Extraer datos con mejor precisión
        const cards = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.card-item')).map(card => ({
                name: card.querySelector('.card-name')?.textContent?.trim(),
                rarity: card.querySelector('.rarity')?.textContent?.trim(),
                // ...más campos
            }));
        });
        
        return cards;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return [];
    } finally {
        await page.close();
    }
};
```

#### Ejemplo 6: Scraping de sandwich ratings automático
```javascript
// Automatizar tu scrapeSandwich.js para todos los personajes
const characters = await getCharactersFromDB();

for (const character of characters) {
    const url = `https://yugioh.fandom.com/wiki/${character.name}`;
    const ratings = await scrapeSandwichRatings(url);
    
    // Guardar automáticamente en formato correcto
    await saveFile(`sandwich_ratings_${character.name}.json`, ratings);
    
    // Importar directamente a BD
    await importSandwichRatings(character.id, ratings);
}
```

### 4. **Git MCP - Control de Versiones Automático**

#### Ejemplo 7: Commits automáticos después de imports
```javascript
// Después de ejecutar tus scripts de import
await gitAdd(['cards_import_errors.json', 'all_decks_transformed.json']);
await gitCommit(`Import update: ${new Date().toISOString()}`);

// Crear branch para experimentos
await gitCreateBranch('experiment-new-scraper');
await gitCheckout('experiment-new-scraper');
```

### 5. **Fetch MCP - APIs Externas**

#### Ejemplo 8: Validar cartas con APIs externas
```javascript
// Verificar cartas contra YGOPRODeck API
const cardName = "Blue-Eyes White Dragon";
const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${cardName}`);
const apiData = await response.json();

// Comparar con tus datos locales
const localCard = await Card.findOne({ where: { name: cardName } });
const differences = compareCardData(localCard, apiData.data[0]);
```

## 🔄 **Flujos de Trabajo Completos**

### Flujo 1: Import Completo de Nuevos Datos
```bash
# 1. Scraping con Puppeteer MCP
scrape_new_packs() → save to JSON

# 2. Procesar con Filesystem MCP  
process_json_files() → clean and validate

# 3. Import a BD con Database MCP
execute_sql() → INSERT new records

# 4. Verificar con Database MCP
execute_sql() → SELECT para validar

# 5. Commit con Git MCP
git_add() → git_commit() → git_push()
```

### Flujo 2: Debugging de Errores
```bash
# 1. Analizar logs con Everything MCP
search_in_files("error") → find error patterns

# 2. Consultar BD con Database MCP
execute_sql() → check data integrity  

# 3. Corregir archivos con Filesystem MCP
read_file() → modify → write_file()

# 4. Re-ejecutar imports
run_script() → verify results
```

## 🎮 **Casos Específicos del Proyecto Yu-Gi-Oh**

### Caso A: Sincronizar cartas faltantes
```javascript
// 1. Leer cards_not_found.json
const missingCards = await readFile('cards_not_found.json');

// 2. Buscar en APIs externas
for (const cardName of missingCards) {
    const apiData = await fetchCardData(cardName);
    if (apiData) {
        await saveCardToDB(apiData);
    }
}

// 3. Actualizar archivo de faltantes
const stillMissing = await verifyMissingCards();
await writeFile('cards_not_found.json', stillMissing);
```

### Caso B: Validar mazos completos
```sql
-- Encontrar mazos incompletos
SELECT d.name, d.id, COUNT(dc.cardId) as card_count
FROM decks d 
LEFT JOIN deck_cards dc ON d.id = dc.deckId 
GROUP BY d.id 
HAVING card_count < 40;  -- Yu-Gi-Oh mazos mínimo 40 cartas
```

### Caso C: Generar reportes automáticos
```javascript
// Crear reporte semanal automático
const stats = {
    totalCards: await countCards(),
    totalDecks: await countDecks(), 
    missingCards: await countMissingCards(),
    lastImport: await getLastImportDate()
};

const report = generateMarkdownReport(stats);
await writeFile(`reports/weekly_${Date.now()}.md`, report);
```

Estos ejemplos son todos casos reales que podrías usar en tu proyecto. ¿Te gustaría que profundice en alguno específico o prefieres que pase a explicar la configuración?
