// Serverless function to save user lead email to Google Sheets webhook and handle sync actions
const https = require('https');
const dns = require('dns').promises;
const crypto = require('crypto');
const { readUsers, writeUsers } = require('./_db-helper');
const {
  sendEbookEmail,
  sendVerificationReminderEmail,
  sendWelcomeRegistrationEmail,
  sendResetPasswordEmail,
  sendVipLaunchingResendEmail
} = require('./_email-helper');

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

async function httpGet(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const params = req.method === 'GET' ? req.query : req.body;
  const { action, email, tool, name, phone, company, experience, ebookTitle, fileUrl, downloadLink, points, userId, password, field, value, industry, skill } = params;
  
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
  const clientIp = req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '';

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
  const ACTIVE_LEADS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzhevaZUCV0ITOxOeeFTx4lFG4jqknpCFV1EJ4l_L75-zkgmmY0eJlKc68jEgk_mVU/exec';
  const webhookUrl = tool === 'course-registration' 
    ? (process.env.GOOGLE_SHEET_COURSE_WEBHOOK || ACTIVE_LEADS_WEBHOOK) 
    : ACTIVE_LEADS_WEBHOOK;

  let sheetsResponseText = "";
  let debugError = "";

  // Always consult Google Sheets as the Single Source of Truth when checking email existence or if local profile is missing
  if (webhookUrl && (action === 'checkEmail' || !localUser) && action !== 'verifyUser') {
    try {
      const response = await httpPost(webhookUrl, { action: 'checkEmail', email: cleanEmail, userId: userId, name: name });
      const resText = await response.text();
      sheetsResponseText = resText;
      const result = JSON.parse(resText);
      if (result.exists && result.user) {
        const uid = result.user.id || (localUser ? localUser.id : 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase());
        const resolvedName = (result.user.name && result.user.name !== 'Khách' && result.user.name !== 'Học viên') 
          ? result.user.name 
          : (name || (localUser ? localUser.name : 'Học viên'));
        users[uid] = {
          id: uid,
          email: cleanEmail,
          name: resolvedName,
          points: (result.user.points !== null && result.user.points !== undefined) ? Number(result.user.points) : 25,
          verified: !!result.user.verified,
          password: result.user.password || result.user.passwordHash || (localUser ? localUser.password : ''),
          experience: result.user.experience || (localUser ? localUser.experience : ''),
          industry: result.user.industry || (localUser ? localUser.industry : ''),
          skill: result.user.skill || (localUser ? localUser.skill : ''),
          unsubscribed: (result.user.unsubscribed !== undefined) ? !!result.user.unsubscribed : (localUser ? !!localUser.unsubscribed : false),
          lastIp: clientIp,
          lastActive: timestamp
        };
        writeUsers(users);
        matchedUserId = uid;
        localUser = users[uid];
      } else if (result.exists === false) {
        // User was deleted from Google Sheets! Purge from local memory/file immediately
        if (matchedUserId && users[matchedUserId]) {
          delete users[matchedUserId];
          writeUsers(users);
        }
        localUser = null;
        matchedUserId = null;
      }
    } catch (e) {
      debugError = e.message;
      console.warn('[SHEETS_REHYDRATE_WARN] Failed to rehydrate user from sheets:', e.message);
    }
  }

  // Guard against duplicate registrations for already registered verified users EXCEPT for ebook-download / tool leads
  const isVerified = localUser && localUser.verified;
  if (isVerified && (action === 'syncUser' || !action) && tool !== 'ebook-download' && tool !== 'exit-intent-ebook' && tool !== 'daily-points' && tool !== 'daily-reminder') {
    return res.status(400).json({
      error: 'Email này đã được đăng ký và xác thực. Vui lòng sử dụng tính năng Đăng Nhập ở góc phải Menu bar để đồng bộ tài khoản!'
    });
  }

  const isPrefetch = req.headers['purpose'] === 'prefetch' || 
                     req.headers['sec-purpose'] === 'prefetch' || 
                     req.headers['x-purpose'] === 'preview' || 
                     req.headers['x-moz'] === 'prefetch';
  const uaHeader = (req.headers['user-agent'] || '').toLowerCase();
  const isBotCrawler = /bot|crawler|spider|google-safety|googleimageproxy|facebookexternalhit|slackbot|safelinks|virustotal|barracuda|proofpoint/i.test(uaHeader);

  if (action === 'downloadEbook') {
    const targetFile = fileUrl || downloadLink || 'ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf';
    const cleanTarget = targetFile.replace(/^\/+/, '');
    const directPdfUrl = 'https://www.bdbinhdanhocvu.com/' + encodeURI(cleanTarget);
    const filename = cleanTarget.split('/').pop() || 'ebook.pdf';
    const safeFilename = filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
    const encodedFilename = encodeURIComponent(filename);

    // If it's a link pre-fetcher or automated security scanner, redirect to PDF without verification
    if (isPrefetch || isBotCrawler) {
      console.log(`[BOT_PREFETCH_DETECTED] Ignoring prefetch for downloadEbook: ${cleanEmail}`);
      res.writeHead(302, { 
        'Location': directPdfUrl,
        'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`
      });
      return res.end();
    }

    // REAL HUMAN USER CLICK:
    // 1. Mark local user verified & award 15 points
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
        points: 40,
        verified: true,
        lastIp: clientIp,
        lastActive: timestamp
      };
      writeUsers(users);
      matchedUserId = uid;
      localUser = users[uid];
    }

    // 2. Dispatch background updates to Google Sheets (non-blocking)
    if (webhookUrl) {
      httpPost(webhookUrl, {
        action: 'verifyUser',
        userId: localUser.id,
        name: localUser.name || 'Học viên',
        email: cleanEmail,
        tool: 'email-verification',
        points: 15,
        date: timestamp,
        password: localUser.password || '',
        secretKey: process.env.B2B_SECRET_KEY || '2108330119Snail!!'
      }).catch(e => console.warn('[ASYNC_VERIFY_SHEETS_WARN]', e.message));

      httpPost(webhookUrl, {
        action: 'logLead',
        email: cleanEmail,
        tool: 'ebook-download',
        ebookTitle: ebookTitle || 'Cẩm nang B2B BD',
        actionDetail: 'Tải trực tiếp Ebook từ Email',
        additionalInfo: 'File: ' + targetFile,
        device: 'Email-CTA',
        date: timestamp,
        secretKey: process.env.B2B_SECRET_KEY || '2108330119Snail!!'
      }).catch(e => console.warn('[ASYNC_LOG_SHEETS_WARN]', e.message));
    }

    // 3. Immediately redirect to direct PDF file URL with Content-Disposition attachment!
    // No website navigation, file downloads directly to user's device!
    res.writeHead(302, {
      'Location': directPdfUrl,
      'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return res.end();
  }

  if (action === 'verifyUser') {
    // Protect verifyUser against automated bot/pre-fetch engines
    if (isPrefetch || isBotCrawler) {
      console.log(`[BOT_PREFETCH_DETECTED] Rejecting verifyUser for ${cleanEmail} from crawler: ${uaHeader}`);
      return res.status(200).json({ success: false, message: 'Bot/Prefetch request ignored' });
    }

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
          action: 'verifyUser',
          userId: localUser.id,
          name: localUser.name || 'Học viên',
          email: cleanEmail,
          tool: 'email-verification',
          points: 15,
          date: timestamp,
          password: localUser.password || '',
          secretKey: process.env.B2B_SECRET_KEY || '2108330119Snail!!'
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
      experience: experience || (localUser ? localUser.experience : ''),
      industry: industry || (localUser ? localUser.industry : ''),
      skill: skill || (localUser ? localUser.skill : ''),
      unsubscribed: localUser ? !!localUser.unsubscribed : false,
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
  } else if (action === 'awardBounty') {
    const cleanWinnerEmail = email.toLowerCase().trim();
    const match = Object.entries(users).find(([uid, u]) => u.email && u.email.toLowerCase().trim() === cleanWinnerEmail);
    if (match) {
        const winnerUser = match[1];
        winnerUser.points = (winnerUser.points || 0) + Number(points);
        winnerUser.lastActive = timestamp;
        winnerUser.lastIp = clientIp;
        writeUsers(users);
        
        if (webhookUrl) {
            try {
                await httpPost(webhookUrl, {
                    action: 'updatePoints',
                    email: cleanWinnerEmail,
                    points: winnerUser.points
                });
            } catch(e){}
        }
        return res.status(200).json({ success: true, points: winnerUser.points });
    }
    return res.status(404).json({ error: 'Winner email not found' });
  } else if (action === 'checkEmail') {
    if (localUser) {
      if ((localUser.name === 'Khách' || localUser.name === 'Học viên' || !localUser.name) && name && name !== 'Khách' && name !== 'Học viên') {
        localUser.name = name;
        localUser.lastActive = timestamp;
        localUser.lastIp = clientIp;
        writeUsers(users);
        if (webhookUrl) {
          try {
            await httpPost(webhookUrl, { action: 'updateName', email: cleanEmail, userId: localUser.id, name: name });
          } catch (err) {
            console.warn('[SHEETS_SYNC_WARN] Failed to sync new name to sheets:', err.message);
          }
        }
      }
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
    return res.status(200).json({ success: true, exists: false, debugWebhookUrl: webhookUrl || "NOT_SET", debugSheetsResponse: sheetsResponseText, debugError: debugError });
  } else if (action === 'sendVipLaunchingEmail') {
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Email không hợp lệ.' });
    }
    const ALLOWED_TEST_EMAILS = [
      'vptanaia@gmail.com',
      'bdtrainingcourse@gmail.com',
      'bdmastery.ai@petervo.vn',
      'ocsen.fashion@gmail.com'
    ];
    if (req.query.test === 'true' && !ALLOWED_TEST_EMAILS.includes(cleanEmail)) {
      return res.status(403).json({ success: false, error: 'Chỉ được phép gửi thử tới các email admin đã được whitelist.' });
    }
    const reqBody = (req.body && typeof req.body === 'object') ? req.body : {};
    const vipRes = await sendVipLaunchingResendEmail({
      email: cleanEmail,
      name: name || (localUser ? localUser.name : '') || req.query.name || reqBody.name || 'Chiến Binh BD',
      nickname: req.query.nickname || reqBody.nickname || 'Chiến Thần BD',
      vipCode: req.query.vipCode || reqBody.vipCode || 'BDTHUCCHIEN'
    });
    return res.status(200).json({
      success: !!(vipRes && vipRes.ok),
      resendId: vipRes && vipRes.data ? vipRes.data.id : null,
      message: `Đã gửi email VIP Launching thành công tới ${cleanEmail} qua Resend!`,
      error: vipRes && vipRes.error ? vipRes.error : null
    });
  } else if (action === 'scheduleBulkAlumniLaunching') {
    const ALLOWED_TEST_EMAILS = [
      'vptanaia@gmail.com',
      'bdtrainingcourse@gmail.com',
      'bdmastery.ai@petervo.vn',
      'ocsen.fashion@gmail.com'
    ];
    const isTestMode = req.query.test === 'true';
    const isDryRun = req.query.dryRun === 'true';
    const isForce = req.query.force === 'true';
    const reqBody = (req.body && typeof req.body === 'object') ? req.body : {};
    
    // 1. Load candidate alumni list: from payload or from Google Sheets
    let candidateList = [];
    if (Array.isArray(reqBody.alumniList) && reqBody.alumniList.length > 0) {
      candidateList = reqBody.alumniList;
    } else if (webhookUrl) {
      try {
        const getUrl = `${webhookUrl}?action=getAlumniList&secretKey=${encodeURIComponent(process.env.B2B_SECRET_KEY || '2108330119Snail!!')}`;
        const sheetRes = await httpGet(getUrl);
        if (sheetRes.ok) {
          const sData = await sheetRes.json();
          if (sData && sData.success && Array.isArray(sData.alumni)) {
            candidateList = sData.alumni;
          }
        }
      } catch (err) {
        console.warn('[ALUMNI_BULK_FETCH_ERR]', err.message);
      }
    }

    if (!candidateList || candidateList.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Không tìm thấy học viên VIP nào cần gửi.',
        totalCandidates: 0,
        scheduledCount: 0
      });
    }

    // 2. Filter & Safety guard
    if (isTestMode) {
      candidateList = candidateList.filter(u => ALLOWED_TEST_EMAILS.includes((u.email || '').toLowerCase().trim()));
    }

    const eligibleList = [];
    const skippedList = [];
    const seenEmails = new Set();

    for (const item of candidateList) {
      const e = (item.email || '').toLowerCase().trim();
      if (!e || !e.includes('@') || seenEmails.has(e)) continue;
      seenEmails.add(e);

      const status = (item.emailStatus || item.status || '').toString();
      if (!isForce && (status.includes('Đã gửi') || status.includes('Đã lên lịch'))) {
        skippedList.push({ email: e, reason: 'Already scheduled/sent: ' + status });
        continue;
      }

      eligibleList.push({
        email: e,
        name: item.name || 'Chiến Binh BD',
        nickname: item.nickname || 'Chiến Thần BD',
        vipCode: item.vipCode || item.vipPass || 'BDTHUCCHIEN',
        magicLink: item.magicLink || ''
      });
    }

    // 3. Dry-Run simulation & Pacing timeline calculation (120s interval + jitter)
    const nowMs = Date.now();
    const intervalMs = 120 * 1000;
    const previewSchedule = eligibleList.map((u, i) => {
      const jitterMs = Math.floor((Math.random() - 0.5) * 30 * 1000);
      const userScheduledMs = nowMs + 60 * 1000 + (i * intervalMs) + jitterMs;
      const vnTime = new Date(userScheduledMs + 7 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
      return {
        email: u.email,
        name: u.name,
        scheduledAt: new Date(userScheduledMs).toISOString(),
        scheduledAtVN: vnTime
      };
    });

    if (isDryRun) {
      return res.status(200).json({
        success: true,
        dryRun: true,
        message: `[DRY RUN] Mô phỏng giãn cách 2 phút/thư thành công cho ${eligibleList.length} học viên VIP.`,
        eligibleCount: eligibleList.length,
        skippedCount: skippedList.length,
        intervalMinutes: 2,
        estimatedDurationMinutes: Math.round((eligibleList.length * 2)),
        previewSchedule: previewSchedule.slice(0, 5)
      });
    }

    if (eligibleList.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Tất cả học viên VIP đều đã được gửi hoặc lên lịch trước đó. Sử dụng ?force=true nếu muốn ép gửi lại.',
        skippedCount: skippedList.length,
        eligibleCount: 0
      });
    }

    // 4. Dispatch scheduled items via Resend
    const dispatchResults = [];
    for (let i = 0; i < eligibleList.length; i++) {
      const u = eligibleList[i];
      const sched = previewSchedule[i];
      try {
        const resendRes = await sendVipLaunchingResendEmail({
          email: u.email,
          name: u.name,
          nickname: u.nickname,
          vipCode: u.vipCode,
          scheduledAt: sched.scheduledAt
        });

        dispatchResults.push({
          email: u.email,
          ok: !!(resendRes && resendRes.ok),
          id: resendRes && resendRes.data ? resendRes.data.id : null,
          scheduledAt: sched.scheduledAt,
          scheduledAtVN: sched.scheduledAtVN,
          error: resendRes && resendRes.error ? resendRes.error : null
        });

        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (err) {
        console.error(`[ALUMNI_RESEND_ERR] Failed for ${u.email}:`, err.message);
        dispatchResults.push({ email: u.email, ok: false, error: err.message });
      }
    }

    // 5. Update status back to Google Sheets ("Học Viên Đã Học")
    if (webhookUrl) {
      try {
        const updatePayload = dispatchResults
          .filter(r => r.ok)
          .map(r => ({
            email: r.email,
            status: `🕒 Đã lên lịch [${r.scheduledAtVN}]`
          }));

        if (updatePayload.length > 0) {
          await httpPost(webhookUrl, {
            action: 'updateAlumniEmailStatus',
            updates: updatePayload,
            secretKey: process.env.B2B_SECRET_KEY || '2108330119Snail!!'
          });
        }
      } catch (err) {
        console.warn('[ALUMNI_SHEET_UPDATE_ERR]', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Đã lên lịch thành công cho ${dispatchResults.filter(r => r.ok).length}/${eligibleList.length} học viên VIP. Giãn cách an toàn 2 phút/thư.`,
      scheduledCount: dispatchResults.filter(r => r.ok).length,
      skippedCount: skippedList.length,
      firstScheduledAtVN: previewSchedule[0] ? previewSchedule[0].scheduledAtVN : null,
      lastScheduledAtVN: previewSchedule[previewSchedule.length - 1] ? previewSchedule[previewSchedule.length - 1].scheduledAtVN : null,
      details: dispatchResults
    });
  } else if (action === 'unsubscribe') {
    if (localUser) {
      localUser.unsubscribed = true;
      localUser.lastActive = timestamp;
      writeUsers(users);
    }
    if (webhookUrl) {
      try {
        await httpPost(webhookUrl, {
          action: 'unsubscribe',
          email: cleanEmail,
          date: timestamp,
          secretKey: process.env.B2B_SECRET_KEY || '2108330119Snail!!'
        });
      } catch (err) {
        console.warn('[UNSUBSCRIBE_SHEETS_WARN]', err.message);
      }
    }

    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hủy Nhận Email - BD Bình Dân Học Vụ</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f6f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: white; border-radius: 24px; padding: 40px 32px; max-width: 440px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    h2 { color: #1e293b; margin: 16px 0 10px 0; font-size: 22px; font-weight: 800; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; }
    .btn { display: inline-block; padding: 12px 28px; background: #dc2626; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 52px; margin-bottom: 8px;">🦉</div>
    <h2>Đã Hủy Nhận Email Nhắc Nhở</h2>
    <p>Địa chỉ <strong>${cleanEmail}</strong> sẽ không còn nhận email nhắc nhở mỗi sáng từ Cú BeeDee nữa.</p>
    <p style="font-size: 13px; color: #94a3b8;">Bạn vẫn có thể tiếp tục sử dụng tất cả công cụ và tài liệu thực chiến trên website bình thường bất cứ lúc nào!</p>
    <a href="https://www.bdbinhdanhocvu.com" class="btn">Về Trang Chủ BD Bình Dân Học Vụ</a>
  </div>
</body>
</html>
      `.trim());
    }

    return res.status(200).json({ success: true, message: 'Unsubscribed successfully', email: cleanEmail });
  } else if (action === 'forgotPassword') {
    if (localUser) {
      const resetToken = Math.random().toString(36).substr(2, 9).toUpperCase();
      const resetExpires = Date.now() + 3600000;
      
      localUser.resetToken = resetToken;
      localUser.resetExpires = resetExpires;
      localUser.lastActive = timestamp;
      localUser.lastIp = clientIp;
      writeUsers(users);
      
      if (webhookUrl) {
        try {
          await httpPost(webhookUrl, {
            action: 'sendForgotPasswordEmail',
            email: cleanEmail,
            name: localUser.name || 'Học viên',
            resetToken: resetToken
          });
        } catch (err) {
          console.error('[FORGOT_PASSWORD_ERROR] Failed to send reset email:', err.message);
        }
      }

      try {
        await sendResetPasswordEmail({
          email: cleanEmail,
          name: localUser.name || 'Học viên',
          resetToken: resetToken
        });
      } catch (resendErr) {
        console.error('[FORGOT_PASSWORD_RESEND_ERROR]', resendErr.message);
      }
      
      return res.status(200).json({ success: true, message: 'Reset token generated and email sent.' });
    }
    return res.status(400).json({ error: 'Email này chưa được đăng ký trên hệ thống!' });
  } else if (action === 'resetPassword') {
    if (localUser) {
      const { reset_token } = params;
      if (!localUser.resetToken || localUser.resetToken !== reset_token || Date.now() > localUser.resetExpires) {
        return res.status(400).json({ error: 'Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn!' });
      }
      
      localUser.password = crypto.createHash('sha256').update(password).digest('hex');
      localUser.resetToken = null;
      localUser.resetExpires = null;
      localUser.lastActive = timestamp;
      localUser.lastIp = clientIp;
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
          console.warn('[SHEETS_SYNC_WARN] Failed to sync reset password to sheets:', err.message);
        }
      }
      
      return res.status(200).json({ success: true, message: 'Password reset successfully!' });
    }
    return res.status(400).json({ error: 'Người dùng không tồn tại!' });
  } else if (action === 'updateProfile') {
    if (localUser) {
      if (field === 'experience') localUser.experience = value;
      else if (field === 'industry') localUser.industry = value;
      else if (field === 'skill') localUser.skill = value;
      
      localUser.points = (localUser.points || 0) + 10;
      localUser.lastActive = timestamp;
      localUser.lastIp = clientIp;
      writeUsers(users);
      
      if (webhookUrl) {
        try {
          await httpPost(webhookUrl, {
            action: 'updateProfile',
            email: cleanEmail,
            field: field,
            value: value,
            points: localUser.points
          });
        } catch (err) {
          console.warn('[SHEETS_SYNC_WARN] Failed to sync profile update to sheets:', err.message);
        }
      }
      return res.status(200).json({ success: true, points: localUser.points });
    }
    return res.status(400).json({ error: 'Người dùng không tồn tại!' });
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
        experience: experience || '',
        industry: industry || '',
        skill: skill || '',
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
      if (experience) localUser.experience = experience;
      if (industry) localUser.industry = industry;
      if (skill) localUser.skill = skill;
      localUser.lastIp = clientIp;
      localUser.lastActive = timestamp;
      writeUsers(users);
    }
  }

  console.log(`[USER_LEAD] UserID: ${localUser.id}, Email: ${email}, Name: ${name || 'N/A'}, Action: ${action || 'log'}, Tool: ${tool}, Date: ${timestamp}`);

  if (!webhookUrl) {
    console.warn(`[SHEETS_SYNC_WARN] Webhook URL not set.`);
    const shouldRequireVerify = (action === 'sendEbookVerificationEmail');
    return res.status(200).json({ 
      success: true, 
      userId: localUser.id,
      verified: shouldRequireVerify ? false : !!isVerified,
      allowDirectDownload: shouldRequireVerify ? false : !!isVerified,
      points: localUser.points,
      user: {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        points: localUser.points,
        avatar: localUser.avatar || '',
        verified: shouldRequireVerify ? false : !!localUser.verified
      },
      warning: 'Webhook URL not configured, but local save completed.' 
    });
  }

  const ua = req.headers['user-agent'] || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  try {
    // Forward to Google Sheets Webhook
    let payload = {};
    if (action === 'sendEbookVerificationEmail' || tool === 'ebook-download') {
      payload = {
        action: 'syncUser',
        userId: localUser.id,
        name: name || localUser.name,
        email,
        tool: 'ebook-download',
        points: points !== undefined ? points : (localUser ? localUser.points : 25),
        device: deviceType,
        date: timestamp,
        password: localUser.password || '',
        experience: localUser.experience || '',
        industry: localUser.industry || '',
        skill: localUser.skill || '',
        ebookTitle: ebookTitle || '',
        fileUrl: fileUrl || downloadLink || '',
        downloadLink: downloadLink || '',
        skipEmail: true
      };
    } else if (action === 'syncUser' || tool === 'daily-points' || tool === 'exit-intent-ebook') {
      payload = {
        action: 'syncUser',
        userId: localUser.id,
        name: name || localUser.name,
        email,
        tool: tool || 'daily-reminder',
        points: points !== undefined ? points : 25,
        device: deviceType,
        date: timestamp,
        password: localUser.password || '',
        experience: localUser.experience || '',
        industry: localUser.industry || '',
        skill: localUser.skill || '',
        ebookTitle: ebookTitle || '',
        downloadLink: downloadLink || ''
      };
    } else if (action === 'updatePoints') {
      payload = { action, email, userId: localUser.id, points, device: deviceType };
    } else {
      // Normal logging flow
      const isCourseReg = tool === 'course-registration';
      payload = isCourseReg
        ? { name, email, phone, company, date: timestamp, tool, userId: localUser.id, device: deviceType, password: localUser.password || '' }
        : { 
            userId: localUser.id,
            name: name || 'Học viên', 
            email, 
            tool, 
            experience: experience || '', 
            ebookTitle: ebookTitle || '', 
            downloadLink: downloadLink || '', 
            points: points !== undefined ? points : 25,
            device: deviceType,
            date: timestamp,
            password: localUser.password || ''
          };
    }

    const response = await httpPost(webhookUrl, payload);
    const resText = await response.text();
    console.log(`[SHEETS_SYNC] Success. Webhook response: ${resText}`);

    // 1. Ebook Download Verification Email
    if (action === 'sendEbookVerificationEmail' || tool === 'ebook-download') {
      try {
        await sendEbookEmail({
          email: cleanEmail,
          name: name || (localUser ? localUser.name : 'Chiến binh B2B'),
          ebookTitle: ebookTitle,
          fileUrl: fileUrl || downloadLink
        });
      } catch (emailErr) {
        console.error('[RESEND_EBOOK_ERROR]', emailErr.message);
      }

      return res.status(200).json({
        success: true,
        verified: false,
        allowDirectDownload: false,
        emailSent: true,
        userId: localUser.id,
        points: localUser.points,
        sheetsResponse: resText,
        user: {
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          points: localUser.points,
          avatar: localUser.avatar || '',
          verified: false
        }
      });
    }

    // 2. Funny Reminder Owl Trigger
    if (tool === 'daily-reminder') {
      try {
        await sendVerificationReminderEmail({
          email: cleanEmail,
          name: name || (localUser ? localUser.name : 'Học viên')
        });
      } catch (remErr) {
        console.error('[RESEND_REMINDER_ERROR]', remErr.message);
      }
    }

    // 3. New User Registration & Sync
    if (action === 'syncUser') {
      if (!isVerified) {
        try {
          await sendWelcomeRegistrationEmail({
            email: cleanEmail,
            name: name || (localUser ? localUser.name : 'Học viên')
          });
        } catch (regErr) {
          console.error('[RESEND_WELCOME_ERROR]', regErr.message);
        }
      }
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
