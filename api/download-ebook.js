const https = require('https');
const { readUsers, writeUsers } = require('./_db-helper');

const ACTIVE_LEADS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzhevaZUCV0ITOxOeeFTx4lFG4jqknpCFV1EJ4l_L75-zkgmmY0eJlKc68jEgk_mVU/exec';
const B2B_SECRET_KEY = process.env.B2B_SECRET_KEY || '2108330119Snail!!';

function httpPost(url, data) {
  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify(data);
      const urlObj = new URL(url);
      const req = https.request({
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, (redirRes) => {
            let body = '';
            redirRes.on('data', c => body += c);
            redirRes.on('end', () => resolve({ ok: redirRes.statusCode === 200, status: redirRes.statusCode, text: () => Promise.resolve(body) }));
          }).on('error', () => resolve({ ok: false, status: 500, text: () => Promise.resolve('') }));
          return;
        }
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve({ ok: res.statusCode === 200, status: res.statusCode, text: () => Promise.resolve(body) }));
      });
      req.on('error', (err) => resolve({ ok: false, status: 500, text: () => Promise.resolve(err.message) }));
      req.setTimeout(6000, () => {
        req.destroy();
        resolve({ ok: false, status: 504, text: () => Promise.resolve('Timeout') });
      });
      req.write(payload);
      req.end();
    } catch (e) {
      resolve({ ok: false, status: 500, text: () => Promise.resolve(e.message) });
    }
  });
}

module.exports = async (req, res) => {
  const query = req.query || {};
  const email = (query.email || '').toLowerCase().trim();
  const file = query.file || query.fileUrl || 'ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf';
  const title = query.title || query.ebookTitle || 'Cẩm nang B2B BD';
  const utmCampaign = query.utm_campaign || 'ebook_download';
  const utmContent = query.utm_content || title;
  const timestamp = new Date().toISOString();

  if (email && email.includes('@')) {
    try {
      const users = readUsers();
      let matchedUser = Object.values(users).find(u => u.email && u.email.toLowerCase().trim() === email);
      if (matchedUser) {
        matchedUser.verified = true;
        matchedUser.points = (matchedUser.points || 25) + 15;
        matchedUser.lastActive = timestamp;
      } else {
        const uid = 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        users[uid] = {
          id: uid,
          email: email,
          name: query.name || 'Chiến binh B2B',
          points: 40,
          verified: true,
          lastActive: timestamp
        };
      }
      writeUsers(users);
    } catch (dbErr) {
      console.warn('[LOCAL_DB_WARN]', dbErr.message);
    }

    try {
      await httpPost(ACTIVE_LEADS_WEBHOOK, {
        action: 'verifyUser',
        email: email,
        tool: 'email-verification',
        points: 15,
        date: timestamp,
        secretKey: B2B_SECRET_KEY
      });
    } catch (sheetErr) {
      console.error('[SHEETS_VERIFY_ERROR]', sheetErr.message);
    }

    try {
      await httpPost(ACTIVE_LEADS_WEBHOOK, {
        action: 'logLead',
        email: email,
        tool: 'ebook-download',
        ebookTitle: title,
        actionDetail: 'Tải Ebook từ Email',
        additionalInfo: 'File: ' + file + ' | Campaign: ' + utmCampaign + ' | Content: ' + utmContent,
        device: 'Email-CTA',
        date: timestamp,
        secretKey: B2B_SECRET_KEY
      });
    } catch (logErr) {
      console.warn('[SHEETS_LOG_WARN]', logErr.message);
    }
  }

  const cleanPath = file.replace(/^[/\\]+/, '');
  const targetPdfUrl = 'https://www.bdbinhdanhocvu.com/' + encodeURI(cleanPath);

  res.writeHead(302, {
    'Location': targetPdfUrl,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end();
};
