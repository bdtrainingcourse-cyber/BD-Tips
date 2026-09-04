const fs = require('fs');
const path = require('path');

function getLibraryData() {
  const possiblePaths = [
    path.join(__dirname, '..', 'library_data.json'),
    path.join(process.cwd(), 'library_data.json'),
    path.join(process.cwd(), 'Skill', 'library_data.json'),
    path.join(process.cwd(), 'b2b-website', 'library_data.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {
        console.error('Error parsing library_data.json from', p, e);
      }
    }
  }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.bdbinhdanhocvu.com';
  const baseUrl = `${protocol}://${host}`;

  const data = getLibraryData();
  const ebooks = data && data.ebooks ? data.ebooks : [];
  const ebook = id ? ebooks.find(e => e.id === id) : null;

  if (!ebook) {
    res.setHeader('Location', '/library.html');
    return res.status(302).send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/library.html"><script>window.location.replace('/library.html');</script></head><body>Redirecting to library...</body></html>`);
  }

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const title = `Tải Cẩm Nang: ${ebook.title} | BD Bình Dân Học Vụ`;
  const desc = ebook.description || 'Cẩm nang thực chiến độc quyền từ Peter Võ trên B2B BD Tips Portal.';
  const directUrl = `${baseUrl}/library.html?ebook=${encodeURIComponent(ebook.id)}`;
  const sharePageUrl = `${baseUrl}/share/ebook/${encodeURIComponent(ebook.id)}`;
  
  let imageUrl = `${baseUrl}/b2b_bd_partnership.png`;
  if (ebook.coverImage) {
    imageUrl = ebook.coverImage.startsWith('http') ? ebook.coverImage : `${baseUrl}/${ebook.coverImage.replace(/^\/+/, '')}`;
  }

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(sharePageUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:alt" content="${escapeHtml(ebook.title)}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(sharePageUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

  <!-- Immediate Redirect for Human Visitors -->
  <meta http-equiv="refresh" content="0; url=${escapeHtml(directUrl)}">
  <script>
    window.location.replace(${JSON.stringify(directUrl)});
  </script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0c0707;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(22, 14, 14, 0.95);
      border: 1px solid rgba(243, 168, 59, 0.3);
      padding: 30px;
      border-radius: 16px;
      max-width: 480px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    h2 { font-size: 1.25rem; color: #f3a83b; margin-bottom: 12px; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px; }
    a {
      display: inline-block;
      background: linear-gradient(135deg, #a20a0a 0%, #f3a83b 100%);
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      padding: 10px 24px;
      border-radius: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>📖 Đang mở cẩm nang B2B BD...</h2>
    <p>Hệ thống đang chuyển hướng bạn tới: <strong>${escapeHtml(ebook.title)}</strong>.</p>
    <a href="${escapeHtml(directUrl)}">Bấm vào đây nếu không tự chuyển hướng</a>
  </div>
</body>
</html>`;

  return res.status(200).send(html);
};
