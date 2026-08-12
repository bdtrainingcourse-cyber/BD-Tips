// Serverless function to save user lead email to Google Sheets webhook and handle sync actions
const { readUsers, writeUsers } = require('./db-helper');

const disposableDomains = [
  'yopmail.com', 'mailinator.com', 'tempmail.com', '10minutemail.com', 
  'guerrillamail.com', 'dispostable.com', 'getairmail.com', 'sharklasers.com', 
  'temp-mail.org', 'fakeinbox.com', 'throwawaymail.com', 'maildrop.cc', 
  'mailnesia.com', 'mailcatch.com', 'yopmail.fr', 'yopmail.net', 
  'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 
  'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 
  'monemail.fr.nf', 'monmail.fr.nf'
];

function isSpamEmail(email) {
  if (!email || !email.includes('@')) return true;
  const domain = email.split('@')[1].toLowerCase().trim();
  return disposableDomains.includes(domain);
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
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Prevent spam emails
  if (isSpamEmail(email)) {
    return res.status(400).json({ error: 'We do not accept disposable or spam emails. Please provide a valid email.' });
  }

  const timestamp = new Date().toISOString();
  const cleanEmail = email.toLowerCase().trim();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  // --- Simulated Database Persistence Logic ---
  const users = readUsers();
  
  // Track/update user profile locally for any incoming lead or sync request
  if (action === 'syncUser') {
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
    if (action === 'checkEmail' || action === 'syncUser') {
      payload = { action, email };
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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
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
