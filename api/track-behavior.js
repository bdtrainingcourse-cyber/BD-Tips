const https = require('https');
const { readLogs, writeLogs, readUsers, writeUsers } = require('./_db-helper');

// B2B BD TIPS PORTAL - BEHAVIOR TRACKER API - FORCE DEPLOY 1787759700
// Modern HTTP POST helper using native fetch with 15s timeout
async function httpPost(url, body) {
  if (url.includes('script.google.com')) {
    const secKey = process.env.B2B_SECRET_KEY || '2108330119Snail!!';
    if (typeof body === 'object' && body !== null) {
      body.secretKey = secKey;
    } else if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        parsed.secretKey = secKey;
        body = JSON.stringify(parsed);
      } catch (e) {}
    }
  }

  const postData = typeof body === 'string' ? body : JSON.stringify(body);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: postData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      status: 500,
      text: () => Promise.resolve(err.message),
      json: () => Promise.resolve({ error: err.message })
    };
  }
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

  const { email, action, category, detail, userId: clientUserId, name: clientName } = req.body;
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

  let webhookText = '';
  let syncError = '';
  // Forward to Google Sheets Webhook (awaited to prevent Vercel context freeze)
  const ACTIVE_LEADS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbxoedzECs5aC0eopiaQiFVqOSrLdwL-P17OBd_Vj3TDmMJ8-Q2H_MD-9dMOx0Jllpxf/exec';
  const webhookUrl = ACTIVE_LEADS_WEBHOOK;
  if (webhookUrl) {
    try {
      const payload = {
        userId: matchedUser ? matchedUser.id : (clientUserId || ''),
        name: matchedUser ? (matchedUser.name || 'Khách') : (clientName || 'Khách'),
        email: cleanEmail,
        tool: action,
        detail: detail || '',
        isGuest,
        device: deviceType,
        date: timestamp
      };
      
      const sheetRes = await httpPost(webhookUrl, payload);
      webhookText = await sheetRes.text();
      console.log(`[BEHAVIOR_SYNC] Success. Webhook response: ${webhookText}`);
    } catch (err) {
      syncError = err.message;
      console.warn(`[BEHAVIOR_SYNC_WARN] Failed to forward behavior: ${err.message}`);
    }
  }

  return res.status(200).json({ 
    success: !syncError, 
    webhookResponse: webhookText, 
    error: syncError 
  });
};
