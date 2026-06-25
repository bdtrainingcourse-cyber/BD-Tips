const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function test() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const query = 'site:linkedin.com/in/ "VNG" ("Sales manager") "Vietnam"';
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const pageResults = await page.evaluate(() => {
        const items = document.querySelectorAll('.result');
        const data = [];
        items.forEach(el => {
            const titleEl = el.querySelector('.result__title a.result__url');
            const snippetEl = el.querySelector('.result__snippet');
            if (titleEl) {
                data.push({
                    title: titleEl.innerText,
                    url: titleEl.href,
                    snippet: snippetEl ? snippetEl.innerText : ''
                });
            }
        });
        return data;
    });

    console.log(`HTML length: ${(await page.content()).length}`);
    await page.screenshot({ path: 'test_ddg.png' });
    console.log(`Found ${pageResults.length} results.`);
    console.log(pageResults);
    await browser.close();
}

test();
