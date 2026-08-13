const { readLogs, writeLogs, readUsers, writeUsers } = require('./_db-helper');

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
  
  logs.push({
    email: cleanEmail,
    action,
    category,
    detail,
    timestamp
  });
  
  writeLogs(logs);

  // Update last active IP for the user if profile exists
  const users = readUsers();
  if (users[cleanEmail]) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    users[cleanEmail].lastIp = clientIp;
    users[cleanEmail].lastActive = timestamp;
    writeUsers(users);
  }

  return res.status(200).json({ success: true });
};
