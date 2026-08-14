const { readUsers } = require('./_db-helper');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1') {
    // For local development testing, we can optionally mock detection by pairing with the most recently logged in user
    const users = readUsers();
    const emails = Object.keys(users);
    if (emails.length > 0) {
      // Find the most recently active user
      let latestUser = null;
      let latestTime = 0;
      for (const email of emails) {
        const time = new Date(users[email].lastActive || 0).getTime();
        if (time > latestTime) {
          latestTime = time;
          latestUser = users[email];
        }
      }
      if (latestUser && latestUser.verified && (Date.now() - latestTime < 10 * 60 * 1000)) { // 10 minutes limit for local mockup testing
        return res.status(200).json({ found: true, user: {
          email: latestUser.email,
          name: latestUser.name,
          points: latestUser.points,
          avatar: latestUser.avatar
        }});
      }
    }
    return res.status(200).json({ found: false });
  }

  const users = readUsers();
  const now = Date.now();
  let matchedUser = null;

  for (const email of Object.keys(users)) {
    const user = users[email];
    if (user.lastIp === clientIp && user.verified) {
      const activeTime = new Date(user.lastActive || 0).getTime();
      if (now - activeTime < 24 * 60 * 60 * 1000) { // 24h window
        matchedUser = {
          email: user.email,
          name: user.name,
          points: user.points,
          avatar: user.avatar
        };
        break;
      }
    }
  }

  if (matchedUser) {
    return res.status(200).json({ found: true, user: matchedUser });
  }

  return res.status(200).json({ found: false });
};
