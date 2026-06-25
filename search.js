const https = require('https');
const http = require('http');
const cheerio = require('cheerio');

// Helper function to perform HTTP/HTTPS GET request and return raw HTML
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://search.yahoo.com/'
    };

    protocol.get(url, { headers }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const origin = new URL(url).origin;
          redirectUrl = origin + redirectUrl;
        }
        fetchHtml(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}. Status code: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Decode Yahoo redirect link
function decodeYahooUrl(href) {
  if (!href) return '';
  try {
    const match = href.match(/\/RU=([^/]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return href;
  } catch (e) {
    return href;
  }
}

// Parse search result title for LinkedIn profile details
function parseLinkedInTitle(title, companyName) {
  if (!title) return { name: 'Unknown', title: 'Unknown' };
  
  let cleanTitle = title.replace(/\s*[|•-]\s*LinkedIn\s*$/gi, '').replace(/\.\.\.\s*$/g, '').trim();
  const parts = cleanTitle.split(/\s*[-|•]\s*/);
  
  let name = 'Unknown';
  let role = 'Unknown';
  
  if (parts.length >= 2) {
    name = parts[0].trim();
    role = parts[1].trim();
  } else {
    const atParts = cleanTitle.split(/\s+at\s+/i);
    if (atParts.length >= 2) {
      name = atParts[0].trim();
      role = atParts[1].trim();
    } else {
      name = cleanTitle;
    }
  }

  if (companyName) {
    const escapedCompany = companyName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const firstWord = escapedCompany.split('\\s+')[0];
    const companyRegex = new RegExp(`\\s+(at|@|for|in|of)\\s+(${escapedCompany}|${firstWord}).*`, 'i');
    role = role.replace(companyRegex, '').trim();
  }

  if (name.includes('...')) {
    name = name.replace('...', '').trim();
  }

  return { name, title: role };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, domain, titles, location, pages = 1, apolloApiKey, searchMethod = 'apollo', seniority, department, geographic } = req.body;

  if (!company) {
    return res.status(400).json({ error: 'Company name is required.' });
  }

  const jobTitles = Array.isArray(titles) ? titles : (titles ? titles.split(',').map(t => t.trim()) : []);
  if (jobTitles.length === 0) {
      jobTitles.push("Business Development", "Sales", "B2B", "Partnerships");
  }

  const results = [];

  // Define the Yahoo Scraper fallback function
  const runYahooFallback = async (triggerErrorMsg = "") => {
    console.log(`[Search Fallback] Running Yahoo search engine scraper for ${company}...`);
    try {
        const queryTitles = jobTitles.map(t => `"${t}"`).join(' OR ');
        const searchQuery = `site:linkedin.com/in/ "${company}" (${queryTitles}) ${location ? `"${location}"` : ''}`;
        
        for (let pageNum = 0; pageNum < pages; pageNum++) {
            const startOffset = pageNum * 10;
            const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(searchQuery)}&b=${startOffset + 1}`;
            
            const html = await fetchHtml(searchUrl);
            const $ = cheerio.load(html);
            
            $('.algo-sr').each((i, el) => {
                const linkEl = $(el).find('h3 a');
                const rawUrl = linkEl.attr('href');
                const title = linkEl.text().trim();
                const snippet = $(el).find('.compText').text().trim();
                
                const decodedUrl = decodeYahooUrl(rawUrl);
                if (decodedUrl.includes('linkedin.com/in/')) {
                    const parsed = parseLinkedInTitle(title, company);
                    results.push({
                        name: parsed.name,
                        title: parsed.title,
                        company: company,
                        linkedin: decodedUrl,
                        snippet: snippet,
                        email: null,
                        phone: null
                    });
                }
            });
        }
        
        // Deduplicate profiles by name or linkedin
        const uniqueResults = [];
        const seen = new Set();
        for (const r of results) {
            const id = r.linkedin || r.name;
            if (!seen.has(id)) {
                seen.add(id);
                uniqueResults.push(r);
            }
        }

        let querySourceMsg = "Yahoo Search Fallback Scraper";
        if (triggerErrorMsg) {
          querySourceMsg += ` (Apollo error: ${triggerErrorMsg})`;
        }

        res.json({ results: uniqueResults, query: querySourceMsg });
    } catch (fallbackErr) {
        res.status(500).json({ error: `Failed to search via Apollo and Yahoo scraper fallback failed. Apollo error: ${triggerErrorMsg}. Scraper error: ${fallbackErr.message}` });
    }
  };

  // If user explicitly selected the scraper provider, run fallback directly
  if (searchMethod === 'scraper') {
    return await runYahooFallback("Chose Scraper Provider");
  }

  // Otherwise, we are in Apollo mode:
  if (!apolloApiKey) {
    return res.status(400).json({ error: 'Apollo API Key is required. Please add it to your settings.' });
  }

  console.log(`[Search API] Querying Apollo for ${company}...`);

  try {
      for (let page = 0; page < pages; page++) {
          const apolloBody = {
              q_organization_name: company,
              person_titles: jobTitles,
              page: page + 1
          };
          if (domain) apolloBody.q_organization_domains = domain;
          if (location) apolloBody.person_locations = [location];

          const response = await new Promise((resolve, reject) => {
              const options = {
                  hostname: 'api.apollo.io',
                  path: '/v1/mixed_people/search',
                  method: 'POST',
                  headers: { 
                      'Content-Type': 'application/json',
                      'Cache-Control': 'no-cache',
                      'X-Api-Key': apolloApiKey
                  }
              };
              const reqStream = https.request(options, (resStream) => {
                  let data = '';
                  resStream.on('data', chunk => data += chunk);
                  resStream.on('end', () => {
                      try {
                          resolve({ status: resStream.statusCode, data: JSON.parse(data) });
                      } catch (e) {
                          resolve({ status: resStream.statusCode, data: { error: data } });
                      }
                  });
              });
              reqStream.on('error', reject);
              reqStream.write(JSON.stringify(apolloBody));
              reqStream.end();
          });

          if (response.status !== 200) {
              let errorMsg = "Unknown Apollo Error";
              if (response.data.error) {
                  errorMsg = typeof response.data.error === 'string' ? response.data.error : JSON.stringify(response.data.error);
              } else if (response.data.message) {
                  errorMsg = response.data.message;
              } else {
                  errorMsg = JSON.stringify(response.data);
              }
              throw new Error(errorMsg);
          }

          if (response.data.people && response.data.people.length > 0) {
              response.data.people.forEach(person => {
                  results.push({
                      name: `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown',
                      title: person.title || 'Key Person',
                      company: person.organization ? person.organization.name : company,
                      linkedin: person.linkedin_url || '',
                      snippet: person.headline || '',
                      email: person.email || null,
                      phone: person.phone_number || null
                  });
              });
          } else {
              break; // No more results
          }
      }

      // Deduplicate profiles by name or linkedin
      const uniqueResults = [];
      const seen = new Set();
      for (const r of results) {
          const id = r.linkedin || r.name;
          if (!seen.has(id)) {
              seen.add(id);
              uniqueResults.push(r);
          }
      }

      res.json({ results: uniqueResults, query: `Apollo Search: ${company}` });
  } catch (error) {
      res.status(500).json({ error: 'Failed to search via Apollo.io. ' + error.message });
  }
};
