const https = require('https');
const fs = require('fs');
const path = require('path');

const FALLBACK_EBOOKS = [
  {
    id: "ebook-tro-cap-that-nghiep",
    title: "Quy Trình Hưởng Trợ Cấp Thất Nghiệp (TCTN)",
    description: "Cẩm nang hướng dẫn chi tiết từng bước thủ tục, điều kiện hưởng, hồ sơ pháp lý và mốc thời gian nhận trợ cấp thất nghiệp chuẩn xác theo luật lao động.",
    coverImage: "ebook-covers/cover-tro-cap-that-nghiep.png"
  },
  {
    id: "ebook-mindset-bd",
    title: "Tư Duy BD \"Thép\" & Tâm Lý Học B2B Mindset",
    description: "Giải mã tâm lý khách hàng B2B, vượt qua rào cản từ chối giá và xây dựng tư duy chốt deal bền vững cho nhân sự BD.",
    coverImage: "ebook-covers/cover-mindset-bd.png"
  },
  {
    id: "ebook-linkedin-2026",
    title: "Chiến Lược Social Selling & LinkedIn BD 2026",
    description: "Bí quyết xây dựng thương hiệu cá nhân trên LinkedIn, định vị Person-in-Charge (PIC) và tiếp cận quyết định viên không qua môi giới.",
    coverImage: "ebook-covers/cover-linkedin-2026.png"
  },
  {
    id: "ebook-9-principles",
    title: "9 Nguyên Tắc Thực Chiến B2B BD",
    description: "Cẩm nang 9 nguyên tắc cốt lõi giúp Business Developer xây dựng uy thế, định vị bản thân và chốt các hợp đồng doanh nghiệp giá trị cao.",
    coverImage: "ebook-covers/cover-9-principles.png"
  },
  {
    id: "ebook-b2b-language",
    title: "Bộ Cẩm Nang Ngôn Từ B2B BD (5 Pha Chuyển Mình)",
    description: "Phương pháp loại bỏ 5 cụm từ 'cấm kỵ' trong bán hàng B2B, nâng cấp ngôn từ thể hiện uy thế và năng lực giải quyết vấn đề.",
    coverImage: "ebook-covers/cover-b2b-language.png"
  },
  {
    id: "ebook-hubspot-guideline",
    title: "Cẩm Nang Thực Chiến HubSpot CRM Cho B2B BD",
    description: "Hướng dẫn làm chủ công cụ HubSpot CRM, quản lý quy trình deal, thiết lập pipeline và tự động hóa chăm sóc khách hàng doanh nghiệp.",
    coverImage: "ebook-covers/cover-hubspot-guideline.png"
  },
  {
    id: "ebook-kpi-funnel",
    title: "Ma Trận Phễu KPI & Quy Đổi Doanh Thu B2B",
    description: "Bảng tính & cẩm nang thiết lập phễu ngược Inbound & Outbound, quy đổi chính xác tỷ lệ CR và khối lượng công việc cần thiết cho BD.",
    coverImage: "ebook-covers/cover-kpi-funnel.png"
  },
  {
    id: "ebook-fake-lead",
    title: "Cẩm Nang Nhận Diện & Loại Bỏ Fake Lead B2B",
    description: "Bộ tiêu chí lọc và xác thực thông tin khách hàng doanh nghiệp, tránh lãng phí thời gian vào các dự án không có ngân sách thực.",
    coverImage: "ebook-covers/cover-fake-lead.png"
  },
  {
    id: "ebook-scale-up",
    title: "Ebook Scale Up Yourself - Bứt Phá Năng Lực BD B2B",
    description: "Lộ trình nâng cấp năng lực toàn diện cho BD từ Junior đến Senior và Head of BD.",
    coverImage: "ebook-covers/cover-scale-up.png"
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- 1. Ebook Dynamic OpenGraph Share Handler ---
  const ebookId = req.query.id || req.query.ebook;
  if (ebookId) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.bdbinhdanhocvu.com';
    const baseUrl = `${protocol}://${host}`;

    let ebooks = FALLBACK_EBOOKS;
    try {
      const p = path.join(__dirname, '..', 'library_data.json');
      if (fs.existsSync(p)) {
        const d = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (d.ebooks && d.ebooks.length > 0) ebooks = d.ebooks;
      }
    } catch(e) {}

    const ebook = ebooks.find(e => e.id === ebookId || e.id === `ebook-${ebookId}`);
    if (!ebook) {
      res.setHeader('Location', '/library');
      return res.status(302).end();
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
    const directUrl = `${baseUrl}/library?ebook=${encodeURIComponent(ebook.id)}`;
    const sharePageUrl = `${baseUrl}/api/sync-newsletter?id=${encodeURIComponent(ebook.id)}`;

    let imageUrl = `${baseUrl}/b2b_bd_partnership.png`;
    if (ebook.coverImage) {
      imageUrl = ebook.coverImage.startsWith('http') ? ebook.coverImage : `${baseUrl}/${ebook.coverImage.replace(/^\/+/, '')}`;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">

  <!-- Open Graph / Facebook / LinkedIn -->
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

    return res.status(200).end(html);
  }

  // --- 2. Regular LinkedIn Newsletter Sync ---
  res.setHeader('Content-Type', 'application/json');
  const newsletterUrl = 'https://www.linkedin.com/newsletters/bd-b2b-b%C3%ACnh-d%C3%A2n-h%E1%BB%8Dc-v%E1%BB%A5-7254739965526360064/';

  try {
    const html = await new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
        }
      };
      https.get(newsletterUrl, options, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => resolve(data));
      }).on('error', err => reject(err));
    });

    const articles = [];
    const pulseRegex = /<a[^>]+href="(https:\/\/[^"]*linkedin\.com\/pulse\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = pulseRegex.exec(html)) !== null) {
      const url = match[1];
      const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();

      if (rawTitle && !rawTitle.includes('Report this article') && !rawTitle.includes('Like') && !articles.some(a => a.linkedinUrl === url)) {
        articles.push({
          id: 'linkedin-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          title: rawTitle,
          description: `Bài viết mới nhất chia sẻ thực chiến từ Newsletter BD B2B Bình Dân Học Vụ bởi Peter Vo trên LinkedIn.`,
          category: 'BD Article',
          date: new Date().toISOString().split('T')[0],
          author: 'Peter Vo (Tân Võ Phước)',
          linkedinUrl: url,
          content: `### ${rawTitle}\n\nĐọc bài viết phân tích chi tiết trực tiếp trên LinkedIn Newsletter.`
        });
      }
    }

    res.status(200).json({
      success: true,
      totalFetched: articles.length,
      articles: articles
    });
  } catch (error) {
    console.error('Error fetching LinkedIn newsletter:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
