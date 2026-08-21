const https = require('https');
const { readLogs, writeLogs, readUsers, writeUsers } = require('./_db-helper');

// Native HTTPS POST helper with redirect-following
function httpPost(url, body, maxRedirects = 5) {
  if (url.includes('script.google.com') && process.env.B2B_SECRET_KEY) {
    if (typeof body === 'object' && body !== null) {
      body.secretKey = process.env.B2B_SECRET_KEY;
    } else if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        parsed.secretKey = process.env.B2B_SECRET_KEY;
        body = JSON.stringify(parsed);
      } catch (e) {}
    }
  }

  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const postData = typeof body === 'string' ? body : JSON.stringify(body);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
          if (maxRedirects <= 0) {
            resolve({ ok: false, status: 500, text: () => Promise.resolve('Too many redirects') });
            return;
          }
          httpGet(res.headers.location, maxRedirects - 1).then(resolve);
          return;
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(data)
          });
        });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ ok: false, status: 408, text: () => Promise.resolve('Timeout') });
      });

      req.on('error', (err) => {
        resolve({ ok: false, status: 500, text: () => Promise.resolve(err.message) });
      });

      req.write(postData);
      req.end();
    } catch (e) {
      resolve({ ok: false, status: 500, text: () => Promise.resolve(e.message) });
    }
  });
}

function httpGet(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET'
      };
      
      const req = https.request(options, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
          if (maxRedirects <= 0) {
            resolve({ ok: false, status: 500, text: () => Promise.resolve('Too many redirects') });
            return;
          }
          httpGet(res.headers.location, maxRedirects - 1).then(resolve);
          return;
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(data)
          });
        });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ ok: false, status: 408, text: () => Promise.resolve('Timeout') });
      });

      req.on('error', (err) => {
        resolve({ ok: false, status: 500, text: () => Promise.resolve(err.message) });
      });

      req.end();
    } catch (e) {
      resolve({ ok: false, status: 500, text: () => Promise.resolve(e.message) });
    }
  });
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, action, category, detail } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const logs = readLogs();
  const timestamp = new Date().toISOString();
  const cleanEmail = email.toLowerCase().trim();
  const isGuest = cleanEmail === 'guest@petervo.vn' || cleanEmail.startsWith('guest@');
  const ua = req.headers['user-agent'] || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  logs.push({
    email: cleanEmail,
    action,
    category,
    detail,
    device: deviceType,
    timestamp
  });
  
  writeLogs(logs);

  // Update last active IP for the user if profile exists
  const users = readUsers();
  const matchedUser = Object.values(users).find(u => u.email && u.email.toLowerCase().trim() === cleanEmail);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  
  if (matchedUser) {
    matchedUser.lastIp = clientIp;
    matchedUser.lastActive = timestamp;
    writeUsers(users);
  }

  // Forward to Google Sheets Webhook (awaited to prevent Vercel context freeze)
  const webhookUrl = process.env.GOOGLE_SHEET_LEADS_WEBHOOK;
  if (webhookUrl) {
    try {
      const payload = {
        userId: matchedUser ? matchedUser.id : '',
        name: matchedUser ? matchedUser.name : 'Khách',
        email: cleanEmail,
        tool: action,
        detail: detail || '',
        isGuest,
        device: deviceType,
        date: timestamp
      };
      
      const sheetRes = await httpPost(webhookUrl, payload);
      const txt = await sheetRes.text();
      console.log(`[BEHAVIOR_SYNC] Success. Webhook response: ${txt}`);
    } catch (err) {
      console.warn(`[BEHAVIOR_SYNC_WARN] Failed to forward behavior: ${err.message}`);
    }
  }

  return res.status(200).json({ success: true });
};
