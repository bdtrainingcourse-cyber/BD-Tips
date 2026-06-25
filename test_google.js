const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function test() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const query = 'site:linkedin.com/in/ "VNG" ("Sales manager") "Vietnam"';
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const pageResults = await page.evaluate(() => {
        const items = document.querySelectorAll('div.g');
        const data = [];
        items.forEach(el => {
            const titleEl = el.querySelector('h3');
            if (titleEl) {
                data.push({
                    title: titleEl.innerText
                });
            }
        });
        return data;
    });

    console.log(`Title: ${await page.title()}`);
    console.log(`Text: ${await page.evaluate(() => document.body.innerText.substring(0, 500))}`);
    console.log(`Google HTML length: ${(await page.content()).length}`);
    console.log(pageResults);
    await browser.close();
}

test();
