const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
