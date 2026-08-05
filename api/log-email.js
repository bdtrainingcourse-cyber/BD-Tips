// Serverless function to save user lead email to Google Sheets webhook and handle sync actions
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, tool, name, phone, company, experience, ebookTitle, downloadLink, points } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Prevent spam emails
  if (isSpamEmail(email)) {
    return res.status(400).json({ error: 'We do not accept disposable or spam emails. Please provide a valid email.' });
  }

  const timestamp = new Date().toISOString();
  const webhookUrl = tool === 'course-registration' 
    ? process.env.GOOGLE_SHEET_COURSE_WEBHOOK 
    : process.env.GOOGLE_SHEET_LEADS_WEBHOOK;

  console.log(`[USER_LEAD] Email: ${email}, Name: ${name || 'N/A'}, Action: ${action || 'log'}, Tool: ${tool}, Date: ${timestamp}`);

  if (!webhookUrl) {
    console.warn(`[SHEETS_SYNC_WARN] Webhook URL not set.`);
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
    return res.status(500).json({ error: 'Failed to communicate with Google Sheets', details: err.message });
  }
};
