// Serverless function to save user lead email
module.exports = (req, res) => {
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

  const { email, tool } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Log in Vercel dashboard console logs
  console.log(`[USER_LEAD_EMAIL] Email: ${email}, Tool: ${tool}, Date: ${new Date().toISOString()}`);

  return res.status(200).json({ success: true });
};
