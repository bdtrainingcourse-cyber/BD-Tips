const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function test() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const query = 'site:linkedin.com/in/ "VNG" ("Sales manager") "Vietnam"';
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const pageResults = await page.evaluate(() => {
        const items = document.querySelectorAll('li.b_algo');
        const data = [];
        items.forEach(el => {
            const titleEl = el.querySelector('h2');
            const linkEl = el.querySelector('a');
            if (titleEl && linkEl) {
                data.push({
                    title: titleEl.innerText,
                    url: linkEl.href
                });
            }
        });
        return data;
    });

    console.log(`Title: ${await page.title()}`);
    console.log(`Text: ${await page.evaluate(() => document.body.innerText.substring(0, 500))}`);
    console.log(`Bing HTML length: ${(await page.content()).length}`);
    console.log(`Found ${pageResults.length} results.`);
    console.log(pageResults);
    await browser.close();
}

test();
