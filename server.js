const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const net = require('net');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

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
        // Handle redirect
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

// Helper to sleep/delay execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  
  // Remove trailing " | LinkedIn" or similar, and trailing ellipses
  let cleanTitle = title.replace(/\s*[|•-]\s*LinkedIn\s*$/gi, '').replace(/\.\.\.\s*$/g, '').trim();
  
  // Split by hyphens or vertical bars
  const parts = cleanTitle.split(/\s*[-|•]\s*/);
  
  let name = 'Unknown';
  let role = 'Unknown';
  
  if (parts.length >= 2) {
    name = parts[0].trim();
    role = parts[1].trim();
  } else {
    // Fallback splitting
    const atParts = cleanTitle.split(/\s+at\s+/i);
    if (atParts.length >= 2) {
      name = atParts[0].trim();
      role = atParts[1].trim();
    } else {
      name = cleanTitle;
    }
  }

  // Clean company name from job titles dynamically (e.g. "Sales Director at Stripe" -> "Sales Director")
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

// Verify email address via DNS/SMTP connection
async function verifyEmailSMTP(email) {
  const domain = email.split('@')[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { status: 'Undeliverable', reason: 'No MX records found for domain' };
    }
    
    // Sort by priority (lowest number is highest priority)
    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;
    
    return new Promise((resolve) => {
      const socket = net.createConnection(25, mxHost);
      socket.setTimeout(3000); // 3-second timeout
      let step = 0;
      let resolved = false;

      const finish = (status, reason) => {
        if (!resolved) {
          resolved = true;
          socket.write('QUIT\r\n');
          socket.end();
          resolve({ status, reason });
        }
      };

      socket.on('data', (data) => {
        const response = data.toString();
        if (resolved) return;

        if (response.includes('421') || response.includes('450') || response.includes('451')) {
          finish('Uncertain', `Rate limit / Temporary reject: ${response.trim()}`);
          return;
        }

        if (step === 0 && response.startsWith('220')) {
          socket.write(`HELO mail.google.com\r\n`);
          step++;
        } else if (step === 1 && response.startsWith('250')) {
          socket.write(`MAIL FROM:<test-lead-finder@gmail.com>\r\n`);
          step++;
        } else if (step === 2 && response.startsWith('250')) {
          socket.write(`RCPT TO:<${email}>\r\n`);
          step++;
        } else if (step === 3) {
          if (response.startsWith('250')) {
            finish('Deliverable', 'Mailbox verified successfully');
          } else if (response.startsWith('550') || response.startsWith('553') || response.startsWith('554') || response.startsWith('501')) {
            finish('Undeliverable', `Mailbox does not exist: ${response.trim()}`);
          } else {
            finish('Uncertain', `Server response: ${response.trim()}`);
          }
        }
      });

      socket.on('error', (err) => {
        finish('SMTP Check Blocked', `Connection error: ${err.message}. Usually caused by ISPs blocking port 25 outbound.`);
      });

      socket.on('timeout', () => {
        socket.destroy();
        finish('SMTP Timeout', 'Mail server timed out connection on port 25.');
      });
    });
  } catch (error) {
    return { status: 'Undeliverable', reason: `DNS resolve error: ${error.message}` };
  }
}

// Generate common business email formats
function generateEmailCandidates(name, domain) {
  if (!name || !domain) return [];
  
  // Clean name: remove special chars, convert to lowercase, normalize whitespace
  const cleanName = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
    
  const parts = cleanName.split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return [];
  
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, parts.length - 1).join('');
  
  const candidates = new Set();
  
  // Format 1: first.last@domain (e.g. john.doe@stripe.com)
  candidates.add(`${first}.${last}@${domain}`);
  
  // Format 2: firstinitiallast@domain (e.g. jdoe@stripe.com)
  candidates.add(`${first.charAt(0)}${last}@${domain}`);
  
  // Format 3: first@domain (e.g. john@stripe.com)
  candidates.add(`${first}@${domain}`);
  
  // Format 4: firstlast@domain (e.g. johndoe@stripe.com)
  candidates.add(`${first}${last}@${domain}`);
  
  // Format 5: first.middle.last@domain
  if (middle) {
    candidates.add(`${first}.${parts.slice(1).join('.')}@${domain}`);
  }
  
  // Format 6: last.first@domain (e.g. doe.john@stripe.com)
  candidates.add(`${last}.${first}@${domain}`);
  
  // Format 7: firstinitial.last@domain (e.g. j.doe@stripe.com)
  candidates.add(`${first.charAt(0)}.${last}@${domain}`);

  // Format 8: first_last@domain (e.g. john_doe@stripe.com)
  candidates.add(`${first}_${last}@${domain}`);

  return Array.from(candidates);
}

// AI extraction using Gemini API
async function extractContactInfoGemini(snippets, name, company, apiKey) {
  try {
    const prompt = `You are an expert B2B lead enrichment AI. Extract the professional email address and phone number for the target contact from the web search snippets provided below.

Target Contact Name: ${name}
Target Company: ${company}

Search Snippets:
${snippets.join('\n\n')}

Analyze the snippets carefully. Look for:
1. Direct mentions of emails (e.g., mailto, name@company.com, name.last@company.com)
2. Direct mentions of phone numbers or mobile numbers (e.g., +849xxx, 090xxx, +1-xxx).
3. If no email is explicitly stated, look for clues or guess the company's email format.

Respond ONLY with a valid JSON object matching the following structure. Do not wrap in markdown blocks, just return raw JSON text:
{
  "email": "extracted_email_here_or_null",
  "phone": "extracted_phone_here_or_null",
  "confidence": "high" | "medium" | "low",
  "reason": "Explanation of how contact info was found or guessed"
}`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`Gemini API returned status ${res.statusCode}: ${responseData}`));
              return;
            }
            const parsed = JSON.parse(responseData);
            const textContent = parsed.candidates[0].content.parts[0].text;
            const extracted = JSON.parse(textContent.trim());
            resolve(extracted);
          } catch (e) {
            reject(new Error(`Failed to parse Gemini response: ${e.message}. Raw: ${responseData}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(JSON.stringify(requestBody));
      req.end();
    });
  } catch (err) {
    console.error('Gemini API Error:', err);
    return null;
  }
}

// Regex extract emails
function extractEmails(text) {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/gi;
  return text.match(emailRegex) || [];
}

// Regex extract phone numbers
function extractPhones(text) {
  if (!text) return [];
  const phoneRegex = /(?:\+?(\d{1,3}))?[-.\s]?(0\d{1,2}|\d{2,3})[-.\s]?(\d{3,4})[-.\s]?(\d{3,4})/g;
  const matches = [];
  let match;
  while ((match = phoneRegex.exec(text)) !== null) {
    const rawNumber = match[0].trim();
    const digitsOnly = rawNumber.replace(/[^\d+]/g, '');
    if (digitsOnly.replace('+', '').length >= 9 && digitsOnly.replace('+', '').length <= 14) {
      matches.push(rawNumber);
    }
  }
  return [...new Set(matches)];
}

// API Routes

// 1. Status Check
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', service: 'B2B PIC Finder API' });
});

// 2. Search LinkedIn Profiles (uses Yahoo Search as primary scraper)
const searchHandler = require('./api/search');
app.post('/api/search', searchHandler);

// 3. Enrich Contact details (uses Yahoo Search as primary scraper)
const enrichHandler = require('./api/enrich');
app.post('/api/enrich', enrichHandler);

// Start express server
const serverInstance = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 B2B PIC Search & Finder Server is running!`);
  console.log(`🔗 Access locally at: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

module.exports = serverInstance;
