// Serverless function to save user lead email to Google Sheets webhook and handle sync actions
const https = require('https');
const dns = require('dns').promises;
const { readUsers, writeUsers } = require('./_db-helper');

const disposableDomains = [
  'yopmail.com', 'mailinator.com', 'tempmail.com', '10minutemail.com', 
  'guerrillamail.com', 'dispostable.com', 'getairmail.com', 'sharklasers.com', 
  'temp-mail.org', 'fakeinbox.com', 'throwawaymail.com', 'maildrop.cc', 
  'mailnesia.com', 'mailcatch.com', 'yopmail.fr', 'yopmail.net', 
  'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 
  'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 
  'monemail.fr.nf', 'monmail.fr.nf', 'tempmail.net', 'tempmail.live',
  'generator.email', 'discard.email', 'tuta.io', 'tutamail.com'
];

const TYPO_MAP = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gamel.com': 'gmail.com',
  'gml.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahu.com': 'yahoo.com',
  'hotamil.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloock.com': 'outlook.com',
  'iclod.com': 'icloud.com'
};

async function validateEmail(email) {
  if (!email || !email.includes('@')) {
    return { valid: false, error: 'Email không hợp lệ!' };
  }
  
  const cleanEmail = email.toLowerCase().trim();
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Email không hợp lệ!' };
  }
  
  const domain = parts[1];
  
  // 1. Typo suggestion
  if (TYPO_MAP[domain]) {
    return { 
      valid: false, 
      error: `Hình như bạn gõ nhầm email? Có phải ý bạn là: ${parts[0]}@${TYPO_MAP[domain]}?` 
    };
  }
  
  // 2. Disposable check
  if (disposableDomains.includes(domain)) {
    return { 
      valid: false, 
      error: 'Vui lòng sử dụng email cá nhân hoặc công việc thật (tránh dùng email rác/tạm thời như yopmail, mailinator...) để Cú BeeDee gửi nhắc nhở nhé!' 
    };
  }
  
  // 3. MX Record check for non-common domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'zoho.com', 'protonmail.com', 'mail.com'];
  if (!commonDomains.includes(domain)) {
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return { 
          valid: false, 
          error: 'Tên miền email này không tồn tại hoặc không thể nhận thư. Vui lòng nhập email thật!' 
        };
      }
    } catch (e) {
      return { 
        valid: false, 
        error: 'Tên miền email này không tồn tại hoặc không thể nhận thư. Vui lòng nhập email thật!' 
      };
    }
  }
  
  return { valid: true };
}

// Native HTTPS POST helper with 3s timeout
function httpPost(url, body) {
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
      
      const req = https.request(options, (postRes) => {
        let data = '';
        postRes.on('data', (chunk) => data += chunk);
        postRes.on('end', () => {
          resolve({
            ok: postRes.statusCode >= 200 && postRes.statusCode < 300,
            status: postRes.statusCode,
            text: () => Promise.resolve(data),
            json: () => {
              try {
                return Promise.resolve(JSON.parse(data));
              } catch (e) {
                return Promise.reject(e);
              }
            }
          });
        });
      });
      
      req.setTimeout(3000, () => {
        req.destroy();
        resolve({
          ok: false,
          status: 408,
          text: () => Promise.resolve('Timeout'),
          json: () => Promise.resolve({})
        });
      });

      req.on('error', (err) => {
        resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve(err.message),
          json: () => Promise.resolve({})
        });
      });

      req.write(postData);
      req.end();
    } catch (e) {
      resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(e.message),
        json: () => Promise.resolve({})
      });
    }
  });
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const params = req.method === 'GET' ? req.query : req.body;
  const { action, email, tool, name, phone, company, experience, ebookTitle, downloadLink, points } = params;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email không hợp lệ!' });
  }

  // Verify email authenticity & block spammers
  const validation = await validateEmail(email);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const timestamp = new Date().toISOString();
  const cleanEmail = email.toLowerCase().trim();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  // --- Simulated Database Persistence Logic ---
  const users = readUsers();
  
  // Track/update user profile locally for any incoming lead or sync request
  if (action === 'verifyUser') {
    if (users[cleanEmail]) {
      if (!users[cleanEmail].verified) {
        users[cleanEmail].verified = true;
        users[cleanEmail].points = (users[cleanEmail].points || 0) + 15;
      }
      users[cleanEmail].lastActive = timestamp;
      users[cleanEmail].lastIp = clientIp;
      writeUsers(users);
    } else {
      users[cleanEmail] = {
        email: cleanEmail,
        name: name || 'Học viên',
        points: 40, // 25 register + 15 verify
        verified: true,
        lastIp: clientIp,
        lastActive: timestamp
      };
      writeUsers(users);
    }

    // Forward verification to Google Sheets webhook
    const webhookUrl = process.env.GOOGLE_SHEET_LEADS_WEBHOOK;
    if (webhookUrl) {
      try {
        await httpPost(webhookUrl, {
          name: users[cleanEmail].name || 'Học viên',
          email: cleanEmail,
          tool: 'email-verification',
          points: users[cleanEmail].points,
          date: timestamp
        });
      } catch (err) {
        console.error(`[SHEETS_SYNC_ERROR] Verify user forward failed:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      points: users[cleanEmail].points
    });
  } else if (action === 'syncUser') {
    users[cleanEmail] = {
      email: cleanEmail,
      name: name || (users[cleanEmail] ? users[cleanEmail].name : 'Học viên'),
      points: points !== undefined ? points : (users[cleanEmail] ? users[cleanEmail].points : 25),
      lastIp: clientIp,
      lastActive: timestamp
    };
    writeUsers(users);
  } else if (action === 'updatePoints') {
    if (users[cleanEmail]) {
      users[cleanEmail].points = points;
      users[cleanEmail].lastActive = timestamp;
      users[cleanEmail].lastIp = clientIp;
      writeUsers(users);
    }
  } else if (action === 'checkEmail') {
    // If the user exists in our local simulated database, return it immediately to avoid sheets delay/failures!
    if (users[cleanEmail]) {
      users[cleanEmail].lastIp = clientIp;
      users[cleanEmail].lastActive = timestamp;
      writeUsers(users);
      return res.status(200).json({
        success: true,
        exists: true,
        user: {
          email: users[cleanEmail].email,
          name: users[cleanEmail].name,
          points: users[cleanEmail].points,
          avatar: users[cleanEmail].avatar || ''
        }
      });
    }
    return res.status(200).json({ success: true, exists: false });
  } else {
    // General lead tracking (ebook downloads, minigame registrations, etc.)
    if (!users[cleanEmail]) {
      users[cleanEmail] = {
        email: cleanEmail,
        name: name || 'Học viên',
        points: points !== undefined ? points : 25,
        lastIp: clientIp,
        lastActive: timestamp
      };
    } else {
      if (name && name !== 'Học viên') users[cleanEmail].name = name;
      if (points !== undefined) users[cleanEmail].points = points;
      users[cleanEmail].lastIp = clientIp;
      users[cleanEmail].lastActive = timestamp;
    }
    writeUsers(users);
  }

  const webhookUrl = tool === 'course-registration' 
    ? process.env.GOOGLE_SHEET_COURSE_WEBHOOK 
    : process.env.GOOGLE_SHEET_LEADS_WEBHOOK;

  console.log(`[USER_LEAD] Email: ${email}, Name: ${name || 'N/A'}, Action: ${action || 'log'}, Tool: ${tool}, Date: ${timestamp}`);

  if (!webhookUrl) {
    console.warn(`[SHEETS_SYNC_WARN] Webhook URL not set.`);
    // If checkEmail is requested and didn't find local user, return false
    if (action === 'checkEmail') {
      return res.status(200).json({ success: true, exists: false });
    }
    return res.status(200).json({ 
      success: true, 
      warning: 'Webhook URL not configured, but local save completed.' 
    });
  }

  try {
    // Forward to Google Sheets Webhook
    let payload = {};
    if (action === 'syncUser') {
      payload = {
        name: name || (users[cleanEmail] ? users[cleanEmail].name : 'Học viên'),
        email,
        tool: 'daily-reminder',
        points: points !== undefined ? points : 25,
        date: timestamp
      };
    } else if (action === 'updatePoints') {
      payload = { action, email, points };
    } else {
      // Normal logging flow
      const isCourseReg = tool === 'course-registration';
      payload = isCourseReg
        ? { name, email, phone, company, date: timestamp, tool }
        : { 
            name: name || 'Học viên', 
            email, 
            tool, 
            experience: experience || '', 
            ebookTitle: ebookTitle || '', 
            downloadLink: downloadLink || '', 
            points: points !== undefined ? points : 25,
            date: timestamp 
          };
    }

    const response = await httpPost(webhookUrl, payload);
    
    // Parse Google Sheets webhook response
    const resText = await response.text();
    console.log(`[SHEETS_SYNC] Success. Webhook response: ${resText}`);

    // If it's checkEmail/syncUser, parse the returned JSON to return to the client
    if (action === 'checkEmail' || action === 'syncUser') {
      try {
        const result = JSON.parse(resText);
        // Enrich sheets result with local data if available
        if (result.exists && result.user && users[cleanEmail]) {
          result.user.points = users[cleanEmail].points;
          result.user.avatar = users[cleanEmail].avatar || '';
        }
        return res.status(200).json(result);
      } catch (jsonErr) {
        // Fallback if Apps Script returned text
        if (resText.includes("SUCCESS")) {
          return res.status(200).json({ success: true, exists: false });
        }
        return res.status(200).json({ success: true, rawResponse: resText });
      }
    }

    return res.status(200).json({ success: true, sheetResponse: resText });
  } catch (err) {
    console.error(`[SHEETS_SYNC_ERROR] Failed to send to Google Sheets Webhook:`, err);
    // Fallback response for local work
    if (action === 'checkEmail') {
      return res.status(200).json({ success: true, exists: false });
    }
    return res.status(500).json({ error: 'Failed to communicate with Google Sheets', details: err.message });
  }
};
