import { launch } from 'puppeteer';
import { writeFile, readFile, access } from 'fs/promises';
import { constants as fsConstants } from 'fs';

async function scrapeAllDuelists() {
    // Carga la info de los duelistas
    const duelistsData = JSON.parse(await readFile('./scripts/data/duelist.json', 'utf-8'));
    // Aplana los duelistas por tier
    const duelists = Object.entries(duelistsData).flatMap(([tier, arr]) =>
        arr.map(d => ({ ...d, tier }))
    );

    // Intenta cargar progreso previo
    let results = [];
    try {
        await access('all_decks.json', fsConstants.F_OK);
        results = JSON.parse(await readFile('all_decks.json', 'utf-8'));
    } catch {
        results = [];
    }

    // Para evitar repetir personajes ya scrapeados
    const doneNames = new Set(results.map(r => r.name));

    for (const duelist of duelists) {
        // Si ya está scrapeado, lo salta
        if (doneNames.has(duelist.name)) {
            console.log(`Ya scrapeado: ${duelist.name}`);
            continue;
        }

        console.log(`Scrapeando: ${duelist.name}`);
        const browser = await launch({ headless: true });
        const page = await browser.newPage();
        try {
            await page.goto(duelist.url, { waitUntil: 'networkidle2' });

            const data = await page.evaluate(() => {
                const name = document.querySelector('h1')?.textContent?.trim() || null;
                const image = document.querySelector('.infobox img')?.src || null;
                const decks = [];

                // Encuentra el h2 con id="Decks"
                const decksH2 = Array.from(document.querySelectorAll('h2'))
                    .find(h2 => h2.querySelector('#Decks'));
                if (!decksH2) return { name, image, decks: null };

                // Busca el primer h3 hermano después del h2 (Tag Force 1)
                let el = decksH2.nextElementSibling;
                while (el && el.tagName !== 'H3') {
                    el = el.nextElementSibling;
                }
                const tagForceH3 = el;
                if (!tagForceH3) return { name, image, decks: null };

                // Recorre los siguientes hermanos hasta el siguiente h3 o h2
                el = tagForceH3.nextElementSibling;
                while (el && !(el.tagName === 'H3' || el.tagName === 'H2')) {
                    if (el.classList && el.classList.contains('decklist')) {
                        const deck = {};
                        const header = el.querySelector('.decklist-header');
                        if (header) deck.name = header.textContent.trim();
                        const subtitle = el.querySelector('.decklist-subtitle');
                        if (subtitle) deck.subtitle = subtitle.textContent.trim();

                        deck.cards = {};
                        el.querySelectorAll('.decklist-column').forEach(col => {
                            const b = col.querySelector('b');
                            if (b) {
                                const type = b.textContent.replace(':', '').trim();
                                const ul = col.querySelector('ul');
                                if (ul) {
                                    deck.cards[type] = Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim());
                                }
                            }
                        });

                        el.querySelectorAll('.decklist-group-heading').forEach(group => {
                            const groupName = group.textContent.replace(':', '').trim();
                            const ul = group.parentElement.querySelector('ul');
                            if (ul) {
                                deck.cards[groupName] = Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim());
                            }
                        });

                        decks.push(deck);
                    }
                    el = el.nextElementSibling;
                }

                return { name, image, decks: decks.length ? decks : null };
            });

            results.push({
                name: data.name,
                image: data.image,
                tier: duelist.tier,
                decks: data.decks || []
            });

            // Guarda el progreso después de cada personaje
            await writeFile('all_decks.json', JSON.stringify(results, null, 2), 'utf-8');
            console.log(`Guardado progreso de ${duelist.name}`);
        } catch (err) {
            console.error(`Error con ${duelist.name}:`, err);
            results.push({
                name: duelist.name,
                image: null,
                tier: duelist.tier,
                decks: []
            });
            await writeFile('all_decks.json', JSON.stringify(results, null, 2), 'utf-8');
        }
        await browser.close();
    }

    console.log('Scrapeo terminado. Guardado en all_decks.json');
}

scrapeAllDuelists();