// tests/e2e.test.js
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

describe('B2B LinkedIn PIC Finder E2E Test Suite', () => {
  let serverInstance;
  let browser;

  before(async () => {
    // Start the Express server
    serverInstance = require('../server.js');
    // Wait a brief moment to ensure server has bound to the port
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Launch headless Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  after(async () => {
    if (browser) {
      await browser.close();
    }
    if (serverInstance) {
      await new Promise(resolve => serverInstance.close(resolve));
    }
  });

  async function getFreshPage() {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('requestfailed', request => {
      console.log('PAGE REQUEST FAILED:', request.url(), request.failure()?.errorText || '');
    });
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log('PAGE RESPONSE ERROR:', response.status(), response.url());
      }
    });
    await page.evaluateOnNewDocument(() => {
      window.alert = () => {};
      window.confirm = () => true;
      window.prompt = () => '';
    });
    return page;
  }

  // Helper to wait until a pipeline enrichment process completes
  async function waitForPipelineComplete(page) {
    await page.waitForFunction(() => {
      const logs = document.getElementById('console-logs').textContent;
      return logs.includes('completed successfully') || logs.includes('Pipeline aborted') || logs.includes('failed');
    }, { timeout: 10000 });
  }

  // ==========================================
  // TIER 1: FEATURE COVERAGE (25 test cases)
  // ==========================================
  describe('Tier 1: Feature Coverage', () => {

    // Feature 1: UI Navigation & Layout
    it('T1-F1-01: Nav link redirection from index to finder', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/index.html`);
      await page.click('nav.nav-links a[href="finder.html"]');
      const url = page.url();
      assert.match(url, /finder\.html/);
      await page.close();
    });

    it('T1-F1-02: Hero CTA button navigation', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/index.html`);
      await page.click('a.btn-primary[href="finder.html"]');
      const url = page.url();
      assert.match(url, /finder\.html/);
      await page.close();
    });

    it('T1-F1-03: Logo navigation back to homepage', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.click('a.nav-logo');
      const url = page.url();
      assert.match(url, /index\.html/);
      await page.close();
    });

    it('T1-F1-04: Theme stylesheets verification', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      const hasDarkTheme = await page.evaluate(() => document.body.classList.contains('dark-theme'));
      assert.strictEqual(hasDarkTheme, true);
      await page.close();
    });

    it('T1-F1-05: Essential UI panels visibility', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      const panels = await page.evaluate(() => {
        const form = document.getElementById('search-form');
        const logs = document.getElementById('console-logs');
        const results = document.getElementById('results-panel');
        const modal = document.getElementById('detail-modal');
        return {
          formVisible: form && form.offsetWidth > 0,
          logsVisible: logs && logs.offsetWidth > 0,
          resultsHidden: results.classList.contains('hidden'),
          modalHidden: modal.classList.contains('hidden')
        };
      });
      assert.strictEqual(panels.formVisible, true);
      assert.strictEqual(panels.logsVisible, true);
      assert.strictEqual(panels.resultsHidden, true);
      assert.strictEqual(panels.modalHidden, true);
      await page.close();
    });

    // Feature 2: B2B Search Filter Configuration UI
    it('T1-F2-01: Form submission missing company name', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = '';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      const resultsHidden = await page.evaluate(() => document.getElementById('results-panel').classList.contains('hidden'));
      assert.strictEqual(resultsHidden, true);
      await page.close();
    });

    it('T1-F2-02: Form submission missing API Key', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = '';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        const text = document.getElementById('console-logs').textContent;
        return text.includes('API Key is required') || text.includes('aborted');
      }, { timeout: 3000 });
      const logs = await page.evaluate(() => document.getElementById('console-logs').textContent);
      assert.ok(logs.includes('API Key is required') || logs.includes('aborted'));
      await page.close();
    });

    it('T1-F2-03: Custom tag addition', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.focus('#tag-input');
      await page.keyboard.type('B2B Sales');
      await page.keyboard.press('Enter');
      const tags = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#tags-wrapper .tag')).map(t => t.getAttribute('data-val'));
      });
      assert.ok(tags.includes('B2B Sales'));
      await page.close();
    });

    it('T1-F2-04: Tag removal via close button', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        const salesTag = Array.from(document.querySelectorAll('#tags-wrapper .tag')).find(t => t.textContent.includes('Sales'));
        if (salesTag) {
          salesTag.querySelector('.tag-close').click();
        }
      });
      const tags = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#tags-wrapper .tag')).map(t => t.getAttribute('data-val'));
      });
      assert.strictEqual(tags.includes('Sales'), false);
      await page.close();
    });

    it('T1-F2-05: Setting parameters persistence', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'persist_test_key';
      });
      await page.click('#search-btn');
      await page.reload();
      const cachedKey = await page.evaluate(() => document.getElementById('apollo-api-key').value);
      assert.strictEqual(cachedKey, 'persist_test_key');
      await page.close();
    });

    // Feature 3: Profile Search Engine
    it('T1-F3-01: API search payload structure', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        return !document.getElementById('results-panel').classList.contains('hidden');
      });
      const logs = await page.evaluate(() => document.getElementById('console-logs').textContent);
      assert.ok(logs.includes('Initializing Search'));
      await page.close();
    });

    it('T1-F3-02: B2B Filter API mapping in backend & Serverless migration', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      
      // Select seniority level
      await page.click('input[name="seniority"][value="C-Level"]');
      // Select department
      await page.click('input[name="department"][value="Partnerships"]');
      
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });

      let requestPayload = null;
      await page.setRequestInterception(true);
      page.on('request', req => {
        if (req.url().endsWith('/api/search')) {
          try {
            requestPayload = JSON.parse(req.postData());
          } catch (e) {}
        }
        req.continue();
      });

      await page.click('#search-btn');
      await page.waitForFunction(() => {
        return !document.getElementById('results-panel').classList.contains('hidden');
      });

      assert.ok(requestPayload, 'API request payload was not captured');
      assert.deepStrictEqual(requestPayload.seniority, ['C-Level']);
      assert.deepStrictEqual(requestPayload.department, ['Partnerships']);
      assert.strictEqual(requestPayload.geographic, 'Global');
      
      await page.close();
    });

    it('T1-F3-03: Reveal results panel on success', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        return !document.getElementById('results-panel').classList.contains('hidden');
      });
      const isHidden = await page.evaluate(() => document.getElementById('results-panel').classList.contains('hidden'));
      assert.strictEqual(isHidden, false);
      await page.close();
    });

    it('T1-F3-04: Populate table with profiles', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        return document.querySelectorAll('#results-tbody tr').length >= 2;
      });
      const names = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#results-tbody tr')).map(tr => tr.querySelector('td:first-child').textContent);
      });
      assert.ok(names.some(n => n.includes('John Doe')));
      assert.ok(names.some(n => n.includes('Jane Smith')));
      await page.close();
    });

    it('T1-F3-05: Handle Apollo API error gracefully', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'invalid_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        const text = document.getElementById('console-logs').textContent;
        return text.includes('Pipeline aborted') || text.includes('Failed to search');
      });
      const logs = await page.evaluate(() => document.getElementById('console-logs').textContent);
      assert.ok(logs.includes('Pipeline aborted') || logs.includes('Failed to search') || logs.includes('Unauthorized Key'));
      await page.close();
    });

    // Feature 4: Lead Enrichment Engine
    it('T1-F4-01: Real-time sequential enrichment queue', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        const text = document.getElementById('console-logs').textContent;
        return text.includes('Enrich 1/') && text.includes('Enrich 2/');
      }, { timeout: 6000 });
      const logs = await page.evaluate(() => document.getElementById('console-logs').textContent);
      assert.ok(logs.includes('Enrich 1/'));
      assert.ok(logs.includes('Enrich 2/'));
      await page.close();
    });

    it('T1-F4-02: B2B email candidates generator', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const emailsText = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#results-tbody tr'));
        const johnRow = rows.find(r => r.textContent.includes('John Doe'));
        return johnRow ? johnRow.querySelector('td:nth-child(4)').textContent : '';
      });
      assert.ok(emailsText.includes('john.doe@stripe.com'));
      await page.close();
    });

    it('T1-F4-03: Regex email parser', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'FPT';
        document.getElementById('company-domain').value = 'fpt.com';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const emailsText = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#results-tbody tr'));
        const binhRow = rows.find(r => r.textContent.includes('Binh Truong Gia'));
        return binhRow ? binhRow.querySelector('td:nth-child(4)').textContent : '';
      });
      assert.ok(emailsText.includes('tgbinh@fpt.com'));
      await page.close();
    });

    it('T1-F4-04: Regex phone parser', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'FPT';
        document.getElementById('company-domain').value = 'fpt.com';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const phonesText = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#results-tbody tr'));
        const binhRow = rows.find(r => r.textContent.includes('Binh Truong Gia'));
        return binhRow ? binhRow.querySelector('td:nth-child(5)').textContent : '';
      });
      assert.ok(phonesText.includes('84903123456'));
      await page.close();
    });

    it('T1-F4-05: Bypass enrichment for existing emails', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const statusText = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#results-tbody tr'));
        const janeRow = rows.find(r => r.textContent.includes('Jane Smith'));
        return janeRow ? janeRow.querySelector('td:nth-child(6)').textContent : '';
      });
      assert.ok(statusText.includes('Deliverable'));
      await page.close();
    });

    // Feature 5: SMTP & MX Verification Engine
    it('T1-F5-01: DNS MX lookup resolve', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Jane Smith', company: 'Stripe', domain: 'stripe.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.domain, 'stripe.com');
      await page.close();
    });

    it('T1-F5-02: SMTP Deliverable verification', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const statusText = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#results-tbody tr'));
        const johnRow = rows.find(r => r.textContent.includes('John Doe'));
        return johnRow ? johnRow.querySelector('td:nth-child(6)').textContent : '';
      });
      assert.ok(statusText.includes('Deliverable'));
      await page.close();
    });

    it('T1-F5-03: SMTP Undeliverable verification', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'undeliverable Person', company: 'Stripe', domain: 'stripe.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.verification.status, 'Undeliverable');
      await page.close();
    });

    it('T1-F5-04: SMTP ISP Blocked handling', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Blocked Person', company: 'Blocked', domain: 'blocked.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.verification.status, 'SMTP Check Blocked');
      await page.close();
    });

    it('T1-F5-05: SMTP socket timeout handling', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Timeout Person', company: 'Timeout', domain: 'timeout.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.verification.status, 'SMTP Timeout');
      await page.close();
    });

  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (25 test cases)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {

    // Feature 1: UI Navigation & Layout
    it('T2-F1-01: Mobile viewport responsiveness', async () => {
      const page = await getFreshPage();
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/finder.html`);
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      assert.ok(bodyWidth <= 375);
      await page.close();
    });

    it('T2-F1-02: Terminal output overflow scroll', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        const consoleLogs = document.getElementById('console-logs');
        for (let i = 0; i < 150; i++) {
          const line = document.createElement('div');
          line.className = 'log-line system';
          line.textContent = `[Line ${i}] Scroll test log entry`;
          consoleLogs.appendChild(line);
        }
      });
      const overflow = await page.evaluate(() => {
        const el = document.getElementById('console-logs');
        return el.scrollHeight > el.clientHeight;
      });
      assert.strictEqual(overflow, true);
      await page.close();
    });

    it('T2-F1-03: URL hash fragment navigation', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/index.html#minigame-section`);
      await new Promise(resolve => setTimeout(resolve, 500));
      const inViewport = await page.evaluate(() => {
        const el = document.getElementById('minigame-section');
        const rect = el.getBoundingClientRect();
        return rect.top >= -50 && rect.top <= window.innerHeight; // Allow negative top up to -50px for header offset
      });
      assert.ok(inViewport);
      await page.close();
    });

    it('T2-F1-04: History back/forward navigation', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/index.html`);
      await page.click('nav.nav-links a[href="finder.html"]');
      await page.goBack();
      assert.match(page.url(), /index\.html/);
      await page.goForward();
      assert.match(page.url(), /finder\.html/);
      await page.close();
    });

    it('T2-F1-05: Modal closing mechanisms', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('results-panel').classList.remove('hidden');
        searchResults = [{
          name: 'Test Contact',
          title: 'Developer',
          company: 'Stripe',
          linkedin: 'https://linkedin.com',
          emails: ['test@stripe.com'],
          phones: [],
          verification: { status: 'Deliverable', reason: 'Ok' },
          enriched: true
        }];
        renderResultsTable(searchResults);
      });
      await page.click('.btn-view-detail');
      let modalHidden = await page.evaluate(() => document.getElementById('detail-modal').classList.contains('hidden'));
      assert.strictEqual(modalHidden, false);
      
      // Close by clicking backdrop (use offset to hit backdrop and avoid center modal-card)
      await page.click('#detail-modal', { offset: { x: 5, y: 5 } });
      modalHidden = await page.evaluate(() => document.getElementById('detail-modal').classList.contains('hidden'));
      assert.strictEqual(modalHidden, true);
      await page.close();
    });

    // Feature 2: B2B Search Filter Configuration UI
    it('T2-F2-01: Duplicate and blank tags prevention', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.focus('#tag-input');
      await page.keyboard.type('Sales'); // Preloaded
      await page.keyboard.press('Enter');
      await page.focus('#tag-input');
      await page.keyboard.type('   '); // Blank
      await page.keyboard.press('Enter');
      
      const tags = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#tags-wrapper .tag')).map(t => t.getAttribute('data-val'));
      });
      const salesTags = tags.filter(t => t === 'Sales');
      const blankTags = tags.filter(t => t.trim() === '');
      
      assert.strictEqual(salesTags.length, 1);
      assert.strictEqual(blankTags.length, 0);
      await page.close();
    });

    it('T2-F2-02: Tag XSS/Sanitization check', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.focus('#tag-input');
      await page.keyboard.type('<img src=x onerror="window.XSS_TEST=true">');
      await page.keyboard.press('Enter');
      
      const triggerState = await page.evaluate(() => window.XSS_TEST);
      assert.strictEqual(triggerState, undefined);
      
      const tagText = await page.evaluate(() => {
        const list = document.querySelectorAll('#tags-wrapper .tag');
        return list[list.length - 1].textContent;
      });
      assert.ok(tagText.includes('<img src=x'));
      await page.close();
    });

    it('T2-F2-03: Empty B2B dropdown filters fallback & Serverless Routing', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      
      const unchecked = await page.evaluate(() => {
        const sens = Array.from(document.querySelectorAll('input[name="seniority"]')).some(cb => cb.checked);
        const depts = Array.from(document.querySelectorAll('input[name="department"]')).some(cb => cb.checked);
        return !sens && !depts;
      });
      assert.strictEqual(unchecked, true);

      const tags = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#tags-wrapper .tag')).map(t => t.getAttribute('data-val'));
      });
      assert.deepStrictEqual(tags, ['Business Development', 'B2B', 'Sales', 'Partnerships']);

      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });

      let requestPayload = null;
      await page.setRequestInterception(true);
      page.on('request', req => {
        if (req.url().endsWith('/api/search')) {
          try {
            requestPayload = JSON.parse(req.postData());
          } catch (e) {}
        }
        req.continue();
      });

      await page.click('#search-btn');
      await page.waitForFunction(() => {
        return !document.getElementById('results-panel').classList.contains('hidden');
      });

      assert.ok(requestPayload, 'API request payload was not captured');
      assert.deepStrictEqual(requestPayload.seniority, []);
      assert.deepStrictEqual(requestPayload.department, []);
      assert.deepStrictEqual(requestPayload.titles, ['Business Development', 'B2B', 'Sales', 'Partnerships']);
      
      await page.close();
    });

    it('T2-F2-04: Search depth select boundaries', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      const options = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#search-pages option')).map(o => o.value);
      });
      assert.deepStrictEqual(options, ['1', '2', '3']);
      await page.close();
    });

    it('T2-F2-05: API key space trim and masking', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = '   valid_key   ';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        return !document.getElementById('results-panel').classList.contains('hidden');
      });
      const keyVal = await page.evaluate(() => localStorage.getItem('apollo_api_key'));
      assert.strictEqual(keyVal, 'valid_key');
      await page.close();
    });

    // Feature 3: Profile Search Engine
    it('T2-F3-01: Empty Apollo API results display', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'empty_company';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        return document.getElementById('console-logs').textContent.includes('No profiles matched');
      });
      const logs = await page.evaluate(() => document.getElementById('console-logs').textContent);
      assert.ok(logs.includes('No profiles matched'));
      await page.close();
    });

    it('T2-F3-02: Client-side table search filter', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('results-panel').classList.remove('hidden');
        searchResults = [
          { name: 'John Doe', title: 'Sales', company: 'Stripe', linkedin: 'https://linkedin.com', emails: [], phones: [], enriched: true },
          { name: 'Nam Nguyen', title: 'BD', company: 'FPT', linkedin: 'https://linkedin.com', emails: [], phones: [], enriched: true }
        ];
        renderResultsTable(searchResults);
      });
      await page.focus('#table-search');
      await page.keyboard.type('Nam');
      const count = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#results-tbody tr')).filter(tr => tr.style.display !== 'none').length;
      });
      assert.strictEqual(count, 1);
      await page.close();
    });

    it('T2-F3-03: Table search returns zero hits', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('results-panel').classList.remove('hidden');
        searchResults = [
          { name: 'John Doe', title: 'Sales', company: 'Stripe', linkedin: 'https://linkedin.com', emails: [], phones: [], enriched: true }
        ];
        renderResultsTable(searchResults);
      });
      await page.focus('#table-search');
      await page.keyboard.type('NonexistentPerson');
      const count = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#results-tbody tr')).filter(tr => tr.style.display !== 'none' && !tr.querySelector('td.text-center')).length;
      });
      assert.strictEqual(count, 0);
      await page.close();
    });

    it('T2-F3-04: Search results deduplication', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'duplicate_company';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const count = await page.evaluate(() => document.querySelectorAll('#results-tbody tr').length);
      assert.strictEqual(count, 1);
      await page.close();
    });

    it('T2-F3-05: Missing fields in search response', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'missing_fields_company';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const rowText = await page.evaluate(() => document.querySelector('#results-tbody tr').textContent);
      assert.ok(rowText.includes('Key Person'));
      await page.close();
    });

    // Feature 4: Lead Enrichment Engine
    it('T2-F4-01: Scraper block/Zero snippets fallback', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'zerosnippetscompany';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const count = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.status-badge')).filter(b => b.textContent.includes('zerosnippetscompany.com')).length;
      });
      assert.ok(count > 0);
      await page.close();
    });

    it('T2-F4-02: Vietnamese accent normalization', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Nguyễn Văn Nam', company: 'FPT', domain: 'fpt.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.ok(response.emails.includes('nguyen.nam@fpt.com') || response.emails.includes('nnam@fpt.com'));
      await page.close();
    });

    it('T2-F4-03: Long and complex names', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Jean-Luc Picard', company: 'Starfleet', domain: 'starfleet.org' })
        });
        return res.json();
      }, BASE_URL);
      assert.ok(response.emails.includes('jeanluc.picard@starfleet.org') || response.emails.includes('jpicard@starfleet.org'));
      await page.close();
    });

    it('T2-F4-04: Gemini API returns malformed response', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'malformed_gemini', company: 'Stripe', domain: 'stripe.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.ok(response.emails.length > 0);
      await page.close();
    });

    it('T2-F4-05: Duplicate emails in Yahoo snippets', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'duplicate_emails_company';
        document.getElementById('company-domain').value = 'fpt.com';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      await page.click('.btn-view-detail');
      const count = await page.evaluate(() => {
        return document.querySelectorAll('#modal-email-list .contact-item').length;
      });
      assert.strictEqual(count, 1);
      await page.close();
    });

    // Feature 5: SMTP & MX Verification Engine
    it('T2-F5-01: Domain MX lookup failure ENOTFOUND', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Fake Person', company: 'Fake', domain: 'fake.zzz' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.verification.status, 'Undeliverable');
      await page.close();
    });

    it('T2-F5-02: Multi-MX priority fallback', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'John Doe', company: 'Stripe', domain: 'stripe.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.verification.status, 'Deliverable');
      await page.close();
    });

    it('T2-F5-03: SMTP transient error codes handling', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'uncertain Person', company: 'Stripe', domain: 'stripe.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.verification.status, 'Uncertain');
      await page.close();
    });

    it('T2-F5-04: SMTP unexpected greeting codes', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Unexpected Person', company: 'Unexpected Greeting', domain: 'unexpected_greeting.com' })
        });
        return res.json();
      }, BASE_URL);
      assert.strictEqual(response.verification.status, 'Uncertain');
      await page.close();
    });

    it('T2-F5-05: Skip check for malformed email string', async () => {
      const page = await getFreshPage();
      const response = await page.evaluate(async (url) => {
        const res = await fetch(`${url}/api/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '', company: 'Stripe', domain: 'stripe.com' })
        });
        return { status: res.status, body: await res.json() };
      }, BASE_URL);
      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
      await page.close();
    });

  });

  // ==========================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (5 test cases)
  // ==========================================
  describe('Tier 3: Cross-Feature Combinations', () => {

    it('T3-CF-01: Custom tag search and filtering', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.focus('#tag-input');
      await page.keyboard.type('Sales Director');
      await page.keyboard.press('Enter');
      
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      
      await page.focus('#table-search');
      await page.keyboard.type('Sales Director');
      const count = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#results-tbody tr')).filter(tr => tr.style.display !== 'none').length;
      });
      assert.strictEqual(count, 1);
      await page.close();
    });

    it('T3-CF-02: Unlocked vs Locked email processing', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const info = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#results-tbody tr'));
        const john = rows.find(r => r.textContent.includes('John Doe')).querySelector('td:nth-child(6)').textContent;
        const jane = rows.find(r => r.textContent.includes('Jane Smith')).querySelector('td:nth-child(6)').textContent;
        return { john, jane };
      });
      assert.ok(info.john.includes('Deliverable'));
      assert.ok(info.jane.includes('Deliverable'));
      await page.close();
    });

    it('T3-CF-03: LocalStorage persist and form submit', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        localStorage.setItem('apollo_api_key', 'cached_api_key');
      });
      await page.reload();
      const val = await page.evaluate(() => document.getElementById('apollo-api-key').value);
      assert.strictEqual(val, 'cached_api_key');
      await page.close();
    });

    it('T3-CF-04: Depth select + Loop + Terminal logs', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('search-pages').value = '2';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const logs = await page.evaluate(() => document.getElementById('console-logs').textContent);
      assert.ok(logs.includes('Search Depth: 2 pages'));
      await page.close();
    });

    it('T3-CF-05: Results view details and copy info', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('results-panel').classList.remove('hidden');
        searchResults = [{
          name: 'Jane Smith',
          title: 'B2B Lead',
          company: 'Stripe',
          linkedin: 'https://linkedin.com',
          emails: ['janesmith@stripe.com'],
          phones: ['+1-555-0199'],
          verification: { status: 'Deliverable', reason: 'Ok' },
          enriched: true
        }];
        renderResultsTable(searchResults);
      });
      await page.click('.btn-view-detail');
      await page.evaluate(() => {
        window.copiedText = '';
        navigator.clipboard.writeText = async (t) => { window.copiedText = t; };
      });
      await page.click('#btn-modal-copy-all');
      const text = await page.evaluate(() => window.copiedText);
      assert.ok(text.includes('Jane Smith'));
      assert.ok(text.includes('janesmith@stripe.com'));
      await page.close();
    });

  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 test cases)
  // ==========================================
  describe('Tier 4: Real-World Application Scenarios', () => {

    it('T4-RW-01: End-to-end lookup: FPT Software', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'FPT Software';
        document.getElementById('company-domain').value = 'fpt.com';
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const countText = await page.evaluate(() => document.getElementById('results-count').textContent);
      assert.ok(countText.includes('Enriched 2 profiles'));
      await page.close();
    });

    it('T4-RW-02: Invalid API Key with recovery', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'invalid_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        const text = document.getElementById('console-logs').textContent;
        return text.includes('Pipeline aborted') || text.includes('Failed to search');
      });
      
      await page.evaluate(() => {
        document.getElementById('apollo-api-key').value = 'valid_key';
      });
      await page.click('#search-btn');
      await waitForPipelineComplete(page);
      const isHidden = await page.evaluate(() => document.getElementById('results-panel').classList.contains('hidden'));
      assert.strictEqual(isHidden, false);
      await page.close();
    });

    it('T4-RW-03: Exporter utilities check', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('results-panel').classList.remove('hidden');
        searchResults = [{
          name: 'Jane Smith',
          title: 'B2B Lead',
          company: 'Stripe',
          linkedin: 'https://linkedin.com',
          emails: ['janesmith@stripe.com'],
          phones: ['+1-555-0199'],
          verification: { status: 'Deliverable', reason: 'Ok' },
          enriched: true
        }];
        renderResultsTable(searchResults);
      });
      await page.click('#btn-copy-emails');
      await page.click('#btn-export-csv');
      await page.click('#btn-export-json');
      const count = await page.evaluate(() => document.querySelectorAll('#results-tbody tr').length);
      assert.strictEqual(count, 1);
      await page.close();
    });

    it('T4-RW-04: Play B2B Challenge minigame', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/index.html`);
      await page.click('[data-game-index="0"]');
      await page.click('#start-btn');
      
      const correctAnswers = [
        "Bên em có mức giá tối ưu / phù hợp nhất.",
        "Em sẽ tìm kiếm phương án tốt nhất cho anh/chị.",
        "Dựa trên dữ liệu và case study triển khai...",
        "Hiện tại bên em đang TẬP TRUNG mạnh vào...",
        "Bước tiếp theo chúng ta sẽ tiến hành..."
      ];
      
      for (let i = 0; i < 5; i++) {
        await page.waitForSelector('.btn-option');
        await page.evaluate((targetText) => {
          const btns = Array.from(document.querySelectorAll('.btn-option'));
          const targetBtn = btns.find(b => b.textContent.trim() === targetText);
          if (targetBtn) targetBtn.click();
        }, correctAnswers[i]);
        
        await page.waitForSelector('#next-btn:not(.hidden)');
        await page.click('#next-btn');
      }
      
      await page.waitForSelector('#game-result:not(.hidden)');
      const resultTitle = await page.evaluate(() => document.getElementById('result-title').textContent);
      assert.ok(resultTitle.includes('Xuất Sắc') || resultTitle.includes('Peter Lo'));
      await page.close();
    });

    it('T4-RW-05: Adversarial offline third-party failures', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/finder.html`);
      await page.evaluate(() => {
        document.getElementById('company-name').value = 'Stripe';
        document.getElementById('apollo-api-key').value = 'rate_limit_key';
      });
      await page.click('#search-btn');
      await page.waitForFunction(() => {
        const text = document.getElementById('console-logs').textContent;
        return text.includes('Pipeline aborted') || text.includes('Failed to search');
      });
      const logs = await page.evaluate(() => document.getElementById('console-logs').textContent);
      assert.ok(logs.includes('Rate limit exceeded') || logs.includes('Pipeline aborted'));
      await page.close();
    });

  });

  describe('Tier 5: New Vietnamese B2B Features', () => {
    it('T5-F1: Vietnamese Library Ebook verification', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/library.html`);
      await page.waitForSelector('.article-card');
      const cardCount = await page.evaluate(() => document.querySelectorAll('.article-card').length);
      assert.ok(cardCount >= 3);
      await page.close();
    });

    it('T5-F1-EbookFlow: Ebook download registration modal and flow verification', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/library.html`);
      
      // Click on the Ebooks category tab
      await page.waitForSelector('.tab-btn[data-category="Ebooks"]');
      await page.click('.tab-btn[data-category="Ebooks"]');
      
      // Wait for ebook cards to render
      await page.waitForSelector('.ebook-card');
      
      // Clear localStorage just in case to make sure form opens
      await page.evaluate(() => localStorage.removeItem('b2b_user_registration'));
      
      // Click "Tải Ebook" button
      await page.click('.ebook-card .download-trigger-btn');
      
      // Check if registration modal is visible
      await page.waitForSelector('#download-modal:not(.hidden)');
      const isModalVisible = await page.evaluate(() => {
        const modal = document.getElementById('download-modal');
        return !modal.classList.contains('hidden');
      });
      assert.strictEqual(isModalVisible, true);
      
      // Fill form with valid data
      await page.evaluate(() => {
        document.getElementById('reg-first-name').value = 'John';
        document.getElementById('reg-email').value = 'john.doe@gmail.com';
        document.getElementById('reg-experience').value = '5';
      });

      // Submit form
      await page.click('#download-form button[type="submit"]');
      
      // Wait for modal to hide
      await page.waitForFunction(() => {
        const modal = document.getElementById('download-modal');
        return modal.classList.contains('hidden');
      });
      
      // Verify profile is saved in LocalStorage
      const savedProfile = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('b2b_user_registration'));
      });
      
      assert.strictEqual(savedProfile.firstName, 'John');
      assert.strictEqual(savedProfile.email, 'john.doe@gmail.com');
      assert.strictEqual(savedProfile.experience, 5);
      
      await page.close();
    });

    it('T5-F2: Vietnamese Labor Law search and modal verification', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/labor-law.html`);
      await page.evaluate(() => {
        const input = document.getElementById('labor-search');
        input.value = '85%';
        input.dispatchEvent(new Event('input'));
      });
      const matchedRuleCount = await page.evaluate(() => document.querySelectorAll('.law-card').length);
      assert.ok(matchedRuleCount > 0);
      
      await page.click('.case-card');
      const isModalVisible = await page.evaluate(() => {
        const modal = document.getElementById('case-modal');
        return !modal.classList.contains('hidden');
      });
      assert.strictEqual(isModalVisible, true);
      await page.close();
    });

    it('T5-F3: Gross-Net Salary Calculator verification', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/salary.html`);
      await page.type('#salary-amount', '15000000');
      await page.click('button[type="submit"]');
      
      const isResultsVisible = await page.evaluate(() => {
        const results = document.getElementById('results-panel');
        return !results.classList.contains('hidden');
      });
      assert.strictEqual(isResultsVisible, true);
      
      const netSalary = await page.evaluate(() => {
        return document.getElementById('nl-net').textContent;
      });
      assert.ok(netSalary !== '0');
      await page.close();
    });

    it('T5-F4: AI Chat Widget interaction and smart navigation router', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/index.html`);
      
      const hasLauncher = await page.evaluate(() => !!document.getElementById('ai-chat-launcher'));
      assert.strictEqual(hasLauncher, true);
      
      await page.click('#ai-chat-launcher');
      const isOpen = await page.evaluate(() => {
        return document.getElementById('ai-chat-widget').classList.contains('open');
      });
      assert.strictEqual(isOpen, true);
      
      await page.type('#chat-input', 'tính lương net');
      await page.click('#chat-send-btn');
      
      // Wait for assistant reply and nav button to render
      await page.waitForSelector('.chat-router-btn');
      const navBtnText = await page.evaluate(() => document.querySelector('.chat-router-btn').textContent);
      assert.ok(navBtnText.includes('Quy Đổi Lương') || navBtnText.includes('Tính Lương'));
      
      await page.close();
    });

    it('T5-F5: AI Email Assistant verification', async () => {
      const page = await getFreshPage();
      await page.goto(`${BASE_URL}/email-assistant.html`);
      
      // 1. Verify page renders and tabs are present
      const titleText = await page.evaluate(() => document.querySelector('.assistant-header h1').textContent);
      assert.strictEqual(titleText, 'B2B Email Assistant');

      // 2. Verify settings modal can save a key
      await page.click('#open-settings-btn');
      await page.evaluate(() => {
        document.getElementById('gemini-key-input').value = 'mock_key_value';
      });
      // Mock window.alert to prevent Puppeteer hanging
      await page.evaluate(() => {
        window.alert = () => {};
      });
      await page.click('#save-key-btn');
      const savedKey = await page.evaluate(() => localStorage.getItem('gemini_api_key'));
      assert.strictEqual(savedKey, 'mock_key_value');

      // 3. Submit evaluate form
      await page.evaluate(() => {
        document.getElementById('eval-content').value = 'Kính gửi sếp, em muốn giới thiệu dịch vụ rẻ nhất thị trường.';
      });
      await page.click('#eval-submit-btn');

      // Wait for output results to show
      await page.waitForFunction(() => !document.getElementById('output-result').classList.contains('hidden'));
      const isResultVisible = true;

      // Verify evaluation score (Gemini mock returns 95)
      const score = await page.evaluate(() => document.getElementById('score-value').textContent);
      assert.strictEqual(score, '95');

      // Verify polished draft contains the text
      const polishedDraft = await page.evaluate(() => document.getElementById('draft-content').textContent);
      assert.ok(polishedDraft.includes('kính gửi') || polishedDraft.includes('Kính gửi'));

      // 4. Test tabs switching to Generate
      await page.click('.tab-btn[data-tab="tab-generate"]');
      const isGenerateTabActive = await page.evaluate(() => {
        return document.getElementById('tab-generate').classList.contains('active');
      });
      assert.strictEqual(isGenerateTabActive, true);

      // Submit generate form
      await page.evaluate(() => {
        document.getElementById('gen-prompt').value = 'Tối ưu chi phí vận hành';
      });
      await page.click('#gen-submit-btn');
      
      // Wait for subject lines options to show
      await page.waitForSelector('.subject-option-card');
      const subjectLinesCount = await page.evaluate(() => document.querySelectorAll('.subject-option-card').length);
      assert.strictEqual(subjectLinesCount, 3);

      await page.close();
    });
  });

});
