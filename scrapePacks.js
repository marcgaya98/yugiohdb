import { launch } from 'puppeteer';

async function scrapeJadenDecks() {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://yugipedia.com/wiki/Jaden_Yuki_(Tag_Force)', { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const name = document.querySelector('h1')?.textContent?.trim() || null;
        const image = document.querySelector('.infobox img')?.src || null;
        const decks = [];

        // Busca todos los h3 que tengan decks después
        document.querySelectorAll('h3 .mw-headline').forEach(h3 => {
            let el = h3.parentElement.nextElementSibling;
            while (el && el.classList && el.classList.contains('decklist')) {
                const deck = {};
                // Nombre del deck
                const header = el.querySelector('.decklist-header');
                if (header) deck.name = header.textContent.trim();
                // Subtítulo (opcional)
                const subtitle = el.querySelector('.decklist-subtitle');
                if (subtitle) deck.subtitle = subtitle.textContent.trim();

                // Cartas por tipo
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

                // Fusion/Extra/Side Deck
                el.querySelectorAll('.decklist-group-heading').forEach(group => {
                    const groupName = group.textContent.replace(':', '').trim();
                    const ul = group.parentElement.querySelector('ul');
                    if (ul) {
                        deck.cards[groupName] = Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim());
                    }
                });

                decks.push(deck);
                el = el.nextElementSibling;
            }
        });

        return { name, image, decks: decks.length ? decks : null };
    });

    await browser.close();
    console.log(JSON.stringify(data, null, 2));
}

scrapeJadenDecks();