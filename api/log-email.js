// Serverless function to save user lead email to Google Sheets webhook and handle sync actions
const https = require('https');
const dns = require('dns').promises;
const crypto = require('crypto');
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
  const { action, email, tool, name, phone, company, experience, ebookTitle, downloadLink, points, userId, password } = params;
  
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
  
  // Find local user by userId or email
  let localUser = null;
  let matchedUserId = null;
  
  if (userId && users[userId]) {
    matchedUserId = userId;
    localUser = users[userId];
  } else {
    // Search by email mapping
    const match = Object.entries(users).find(([uid, u]) => u.email && u.email.toLowerCase().trim() === cleanEmail);
    if (match) {
      matchedUserId = match[0];
      localUser = match[1];
    }
  }

  // Ensure localUser has an id property for backward compatibility with old cache data
  if (localUser) {
    if (!localUser.id) {
      localUser.id = (matchedUserId && matchedUserId.startsWith('UID_'))
        ? matchedUserId 
        : 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    // If the cache was keyed by email, migrate the key to the new UID format
    if (matchedUserId && !matchedUserId.startsWith('UID_')) {
      users[localUser.id] = localUser;
      delete users[matchedUserId];
      matchedUserId = localUser.id;
    }
    writeUsers(users);
  }

  // If user profile is missing from Vercel's ephemeral memory, rehydrate it from Google Sheets
  const webhookUrl = tool === 'course-registration' 
    ? process.env.GOOGLE_SHEET_COURSE_WEBHOOK 
    : process.env.GOOGLE_SHEET_LEADS_WEBHOOK;

  if (!localUser && webhookUrl && action !== 'verifyUser') {
    try {
      const response = await httpPost(webhookUrl, { action: 'checkEmail', email: cleanEmail, userId: userId });
      const resText = await response.text();
      const result = JSON.parse(resText);
      if (result.exists && result.user) {
        const uid = result.user.id || 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        users[uid] = {
          id: uid,
          email: cleanEmail,
          name: result.user.name || name || 'Học viên',
          points: result.user.points !== undefined ? result.user.points : 25,
          verified: !!result.user.verified,
          password: result.user.passwordHash || '',
          lastIp: clientIp,
          lastActive: timestamp
        };
        writeUsers(users);
        matchedUserId = uid;
        localUser = users[uid];
      }
    } catch (e) {
      console.warn('[SHEETS_REHYDRATE_WARN] Failed to rehydrate user from sheets:', e.message);
    }
  }

  // Guard against duplicate registrations or leads from verified users
  const isVerified = localUser && localUser.verified;
  if (isVerified && (action === 'syncUser' || !action)) {
    return res.status(400).json({
      error: 'Email này đã được đăng ký và xác thực. Vui lòng sử dụng tính năng Đăng Nhập ở góc phải Menu bar để đồng bộ tài khoản!'
    });
  }

  if (action === 'verifyUser') {
    if (localUser) {
      if (!localUser.verified) {
        localUser.verified = true;
        localUser.points = (localUser.points || 0) + 15;
      }
      localUser.lastActive = timestamp;
      localUser.lastIp = clientIp;
      writeUsers(users);
    } else {
      const uid = 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      users[uid] = {
        id: uid,
        email: cleanEmail,
        name: name || 'Học viên',
        points: 40, // 25 register + 15 verify
        verified: true,
        password: password ? crypto.createHash('sha256').update(password).digest('hex') : '',
        lastIp: clientIp,
        lastActive: timestamp
      };
      writeUsers(users);
      matchedUserId = uid;
      localUser = users[uid];
    }

    // Forward verification to Google Sheets webhook
    if (webhookUrl) {
      try {
        await httpPost(webhookUrl, {
          userId: localUser.id,
          name: localUser.name || 'Học viên',
          email: cleanEmail,
          tool: 'email-verification',
          points: localUser.points,
          date: timestamp,
          password: localUser.password || ''
        });
      } catch (err) {
        console.error(`[SHEETS_SYNC_ERROR] Verify user forward failed:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      userId: localUser.id,
      points: localUser.points
    });
  } else if (action === 'syncUser') {
    const uid = matchedUserId || 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    users[uid] = {
      id: uid,
      email: cleanEmail,
      name: name || (localUser ? localUser.name : 'Học viên'),
      points: points !== undefined ? points : (localUser ? localUser.points : 25),
      verified: localUser ? localUser.verified : false,
      password: password ? crypto.createHash('sha256').update(password).digest('hex') : (localUser && localUser.password ? localUser.password : ''),
      lastIp: clientIp,
      lastActive: timestamp
    };
    writeUsers(users);
    matchedUserId = uid;
    localUser = users[uid];
  } else if (action === 'updatePoints') {
    if (localUser) {
      localUser.points = points;
      localUser.lastActive = timestamp;
      localUser.lastIp = clientIp;
      writeUsers(users);
    }
  } else if (action === 'checkEmail') {
    if (localUser) {
      const hasPassword = !!localUser.password;
      
      // If a password is submitted, verify it
      if (password) {
        const submittedHash = crypto.createHash('sha256').update(password).digest('hex');
        if (!hasPassword) {
          // Legacy user setting password on first login
          localUser.password = submittedHash;
          localUser.lastIp = clientIp;
          localUser.lastActive = timestamp;
          writeUsers(users);
          
          if (webhookUrl) {
            try {
              await httpPost(webhookUrl, { 
                action: 'syncUser', 
                email: cleanEmail, 
                userId: localUser.id, 
                password: localUser.password,
                name: localUser.name,
                points: localUser.points
              });
            } catch (err) {
              console.warn('[SHEETS_SYNC_WARN] Failed to sync new password to sheets:', err.message);
            }
          }
        } else {
          // Verify existing password
          if (localUser.password !== submittedHash) {
            return res.status(401).json({ success: false, error: 'Mật khẩu không chính xác! Vui lòng thử lại.' });
          }
        }
      } else {
        // Silent page load verify request
        // If a password exists in database but they haven't submitted one, we don't return success: false
        // because it's just checking email existence/verification status. The client-side handles sessions.
      }

      localUser.lastIp = clientIp;
      localUser.lastActive = timestamp;
      writeUsers(users);
      return res.status(200).json({
        success: true,
        exists: true,
        legacyUser: !hasPassword,
        user: {
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          points: localUser.points,
          avatar: localUser.avatar || '',
          verified: !!localUser.verified
        }
      });
    }
    return res.status(200).json({ success: true, exists: false });
  } else {
    // General lead tracking (ebook downloads, minigame registrations, etc.)
    if (!localUser) {
      const uid = 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      users[uid] = {
        id: uid,
        email: cleanEmail,
        name: name || 'Học viên',
        points: points !== undefined ? points : 25,
        password: password ? crypto.createHash('sha256').update(password).digest('hex') : '',
        lastIp: clientIp,
        lastActive: timestamp
      };
      writeUsers(users);
      matchedUserId = uid;
      localUser = users[uid];
    } else {
      if (name && name !== 'Học viên') localUser.name = name;
      if (points !== undefined) localUser.points = points;
      if (password) localUser.password = crypto.createHash('sha256').update(password).digest('hex');
      localUser.lastIp = clientIp;
      localUser.lastActive = timestamp;
      writeUsers(users);
    }
  }

  console.log(`[USER_LEAD] UserID: ${localUser.id}, Email: ${email}, Name: ${name || 'N/A'}, Action: ${action || 'log'}, Tool: ${tool}, Date: ${timestamp}`);

  if (!webhookUrl) {
    console.warn(`[SHEETS_SYNC_WARN] Webhook URL not set.`);
    return res.status(200).json({ 
      success: true, 
      userId: localUser.id,
      warning: 'Webhook URL not configured, but local save completed.' 
    });
  }

  try {
    // Forward to Google Sheets Webhook
    let payload = {};
    if (action === 'syncUser') {
      payload = {
        userId: localUser.id,
        name: name || localUser.name,
        email,
        tool: 'daily-reminder',
        points: points !== undefined ? points : 25,
        date: timestamp,
        password: localUser.password || ''
      };
    } else if (action === 'updatePoints') {
      payload = { action, email, userId: localUser.id, points };
    } else {
      // Normal logging flow
      const isCourseReg = tool === 'course-registration';
      payload = isCourseReg
        ? { name, email, phone, company, date: timestamp, tool, userId: localUser.id, password: localUser.password || '' }
        : { 
            userId: localUser.id,
            name: name || 'Học viên', 
            email, 
            tool, 
            experience: experience || '', 
            ebookTitle: ebookTitle || '', 
            downloadLink: downloadLink || '', 
            points: points !== undefined ? points : 25,
            date: timestamp,
            password: localUser.password || ''
          };
    }

    const response = await httpPost(webhookUrl, payload);
    const resText = await response.text();
    console.log(`[SHEETS_SYNC] Success. Webhook response: ${resText}`);

    if (action === 'syncUser') {
      try {
        const result = JSON.parse(resText);
        if (result.exists && result.user && localUser) {
          result.user.points = localUser.points;
          result.user.avatar = localUser.avatar || '';
        }
        return res.status(200).json(result);
      } catch (jsonErr) {
        if (resText.includes("SUCCESS")) {
          return res.status(200).json({ success: true, exists: false, userId: localUser.id });
        }
        return res.status(200).json({ success: true, rawResponse: resText, userId: localUser.id });
      }
    }

    return res.status(200).json({ success: true, sheetResponse: resText, userId: localUser.id });
  } catch (err) {
    console.error(`[SHEETS_SYNC_ERROR] Failed to send to Google Sheets Webhook:`, err);
    return res.status(200).json({ success: true, exists: false, userId: localUser.id });
  }
};
