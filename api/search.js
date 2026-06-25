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

function isCurrentEmployee(headline, companyName) {
  if (!headline) return true;
  
  const cleanHeadline = headline.toLowerCase();
  const cleanCompany = companyName.toLowerCase();
  
  // Suffix words commonly found in B2B company names that are not part of the core brand name
  const stopWords = new Set([
    'software', 'group', 'co', 'ltd', 'inc', 'corp', 'corporation', 
    'vietnam', 'apac', 'global', 'solutions', 'technologies', 
    'technology', 'services', 'viet nam', 'official'
  ]);
  
  // Extract key brand words
  const companyWords = cleanCompany.split(/[\s,./\\]+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 1 && !stopWords.has(w));
    
  if (companyWords.length === 0) {
    companyWords.push(cleanCompany.replace(/[^a-z0-9]/g, ''));
  }

  // Check if headline mentions any core company brand words
  const mentionsCompany = companyWords.some(w => cleanHeadline.includes(w));
  if (mentionsCompany) {
    return true; // The company name is mentioned, highly likely current employee
  }

  // Look for indicators of employment at other organizations (e.g., "@ Company", "at Company")
  const otherCompanyPattern = /\b(at|@|for|in|of)\s+([a-z0-9\s]+)/i;
  const match = cleanHeadline.match(otherCompanyPattern);
  if (match) {
    const genericWords = new Set([
      'home', 'vietnam', 'viet nam', 'singapore', 'sales', 'marketing', 
      'growth', 'business', 'development', 'b2b', 'apac', 'global', 
      'hanoi', 'saigon', 'work'
    ]);
    const wordsAfter = match[2].split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length > 0);
    
    if (wordsAfter.length > 0 && !genericWords.has(wordsAfter[0])) {
      return false; // Mentions another company but does not mention the target company. Filter out!
    }
  }

  // Look for indicators of self-employment or consulting where the target company is not mentioned
  const selfEmployedPattern = /\b(founder|co-founder|ceo|owner|creator|proprietor|freelancer|coach|consultant)\b/i;
  if (selfEmployedPattern.test(cleanHeadline)) {
    return false; // Independent / works elsewhere. Filter out!
  }

  return true;
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
                let linkEl = $(el).find('.compTitle a');
                if (linkEl.length === 0) {
                    linkEl = $(el).find('h3 a'); // fallback to old structure
                }
                if (linkEl.length === 0) {
                    linkEl = $(el).find('a:has(h3)'); // fallback
                }
                
                const rawUrl = linkEl.attr('href');
                let title = '';
                if (linkEl.find('h3').length > 0) {
                    title = linkEl.find('h3').text().trim();
                } else {
                    title = linkEl.text().trim();
                }
                
                const snippet = $(el).find('.compText').text().trim();
                
                const decodedUrl = decodeYahooUrl(rawUrl);
                if (decodedUrl.includes('linkedin.com/in/')) {
                    // Filter: Ensure the LinkedIn profile title/headline mentions the target company name
                    const companyFirstWord = company.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                    const pageTitleLower = title.toLowerCase().replace(/[^a-z0-9]/g, '');
                    
                    if (!pageTitleLower.includes(companyFirstWord)) {
                        return; // Skip this profile, not a real employee of the target company
                    }

                    const parsed = parseLinkedInTitle(title, company);
                    if (!isCurrentEmployee(parsed.title, company)) {
                        return; // Skip this profile, not currently employed at target company
                    }

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
        let friendlyMsg = `Failed to search via Apollo and Yahoo scraper fallback failed. Apollo error: ${triggerErrorMsg}. Scraper error: ${fallbackErr.message}`;
        if (fallbackErr.message.includes('999') || fallbackErr.message.includes('403') || fallbackErr.message.includes('status') || fallbackErr.message.includes('Status')) {
            friendlyMsg = "Yahoo Search blocked the Vercel serverless function IP address (Error 999/403). To use the free Public Scraper, please run the website locally on your computer via 'node server.js' and open http://localhost:3000/finder.html, or provide a valid Apollo.io API Key for Vercel deployment.";
        }
        res.status(500).json({ error: friendlyMsg });
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
                  const headline = person.headline || person.title || '';
                  if (!isCurrentEmployee(headline, company)) {
                      return; // Skip this profile, not currently employed at target company
                  }
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
