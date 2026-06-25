const cheerio = require('cheerio');
const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const net = require('net');

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

async function verifyEmailSMTP(email) {
  const domain = email.split('@')[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { status: 'Undeliverable', reason: 'No MX records found for domain' };
    }
    
    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;
    
    return new Promise((resolve) => {
      const socket = net.createConnection(25, mxHost);
      socket.setTimeout(3000);
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

function generateEmailCandidates(name, domain) {
  if (!name || !domain) return [];
  
  const cleanName = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
    
  const parts = cleanName.split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return [];
  
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, parts.length - 1).join('');
  
  const candidates = new Set();
  
  candidates.add(`${first}.${last}@${domain}`);
  candidates.add(`${first.charAt(0)}${last}@${domain}`);
  candidates.add(`${first}@${domain}`);
  candidates.add(`${first}${last}@${domain}`);
  if (middle) {
    candidates.add(`${first}.${parts.slice(1).join('.')}@${domain}`);
  }
  candidates.add(`${last}.${first}@${domain}`);
  candidates.add(`${first.charAt(0)}.${last}@${domain}`);
  candidates.add(`${first}_${last}@${domain}`);

  return Array.from(candidates);
}

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

function extractEmails(text) {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/gi;
  return text.match(emailRegex) || [];
}

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

  const { name, company, domain, email, phone } = req.body;

  if (!name || !company) {
    return res.status(400).json({ error: 'Name and Company are required.' });
  }

  let targetDomain = domain;
  if (!targetDomain) {
    targetDomain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  }

  const result = {
    name,
    company,
    domain: targetDomain,
    emails: email ? [email] : [],
    phones: phone ? [phone] : [],
    verification: { status: 'Not Verified', reason: 'No emails found' }
  };

  if (email) {
    result.verification = { status: 'Deliverable', reason: 'Verified via Apollo.io' };
    result.enrichReason = 'Directly provided by Apollo.';
    return res.json(result);
  }

  try {
    const enrichQuery = `"${name}" "${company}" (email OR phone OR contact OR "@${targetDomain}" OR "sđt" OR "mobile")`;
    const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(enrichQuery)}`;
    
    const html = await fetchHtml(searchUrl);
    const $ = cheerio.load(html);
    
    const snippets = [];
    $('.compText').each((i, el) => {
      snippets.push($(el).text().trim());
    });

    let aiExtracted = null;
    const geminiApiKey = process.env.GEMINI_API_KEY || req.body.geminiApiKey;
    if (geminiApiKey && snippets.length > 0) {
      aiExtracted = await extractContactInfoGemini(snippets, name, company, geminiApiKey);
    }

    const emailCandidates = new Set();
    const personalDomains = new Set([
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 
      'icloud.com', 'mail.com', 'aol.com', 'msn.com', 'zoho.com', 
      'protonmail.com', 'proton.me', 'yandex.com', 'mail.ru', 'qq.com', '163.com'
    ]);

    if (aiExtracted && aiExtracted.email) {
      const lowerAiEmail = aiExtracted.email.trim().toLowerCase();
      const emailParts = lowerAiEmail.split('@');
      if (emailParts.length === 2) {
        const emailDomain = emailParts[1];
        if (emailDomain === targetDomain || personalDomains.has(emailDomain)) {
          emailCandidates.add(lowerAiEmail);
        }
      }
    }

    snippets.forEach(snippet => {
      const foundEmails = extractEmails(snippet);
      foundEmails.forEach(e => {
        const lowerEmail = e.toLowerCase();
        const emailParts = lowerEmail.split('@');
        if (emailParts.length === 2) {
          const emailDomain = emailParts[1];
          const isTargetDomain = emailDomain === targetDomain;
          const isPersonal = personalDomains.has(emailDomain);
          
          if (isTargetDomain || (isPersonal && lowerEmail.includes(name.split(' ')[0].toLowerCase()))) {
            emailCandidates.add(lowerEmail);
          }
        }
      });
    });

    const guessedEmails = generateEmailCandidates(name, targetDomain);

    let finalEmails = Array.from(emailCandidates);
    let verifyCandidate = null;

    if (finalEmails.length > 0) {
      verifyCandidate = finalEmails[0];
    } else if (guessedEmails.length > 0) {
      verifyCandidate = guessedEmails[0];
      finalEmails.push(verifyCandidate);
      result.isGuessed = true;
    }

    result.emails = finalEmails;

    const phoneCandidates = new Set();
    if (aiExtracted && aiExtracted.phone) {
      phoneCandidates.add(aiExtracted.phone.trim());
    }

    snippets.forEach(snippet => {
      const foundPhones = extractPhones(snippet);
      foundPhones.forEach(p => phoneCandidates.add(p));
    });

    result.phones = Array.from(phoneCandidates);

    if (verifyCandidate) {
      const verificationResult = await verifyEmailSMTP(verifyCandidate);
      result.verification = verificationResult;
    }

    if (aiExtracted && aiExtracted.reason) {
      result.enrichReason = aiExtracted.reason;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: `Failed to enrich contact info: ${error.message}` });
  }
};
