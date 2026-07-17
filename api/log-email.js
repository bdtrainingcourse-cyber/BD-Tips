// Serverless function to save user lead email to Google Sheets webhook
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

  const { email, tool, name, phone, company } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const timestamp = new Date().toISOString();
  
  // Choose correct Google Sheets Webhook based on tool/source
  const isCourseReg = tool === 'course-registration';
  const webhookUrl = isCourseReg 
    ? process.env.GOOGLE_SHEET_COURSE_WEBHOOK 
    : process.env.GOOGLE_SHEET_LEADS_WEBHOOK;

  console.log(`[USER_LEAD] Email: ${email}, Tool: ${tool}, Date: ${timestamp}`);

  if (webhookUrl) {
    try {
      const payload = isCourseReg
        ? { name, email, phone, company, date: timestamp, tool }
        : { email, tool, date: timestamp };

      // Send to Google Apps Script Web App Webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resText = await response.text();
      console.log(`[SHEETS_SYNC] Success. Webhook response: ${resText}`);
    } catch (err) {
      console.error(`[SHEETS_SYNC_ERROR] Failed to send to Google Sheets Webhook:`, err);
    }
  } else {
    console.warn(`[SHEETS_SYNC_WARN] Webhook URL not set. Please set GOOGLE_SHEET_COURSE_WEBHOOK and GOOGLE_SHEET_LEADS_WEBHOOK env variables.`);
  }

  return res.status(200).json({ success: true });
};
