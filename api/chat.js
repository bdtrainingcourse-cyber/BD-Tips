const https = require('https');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ 
      useFallback: true,
      reply: 'Không tìm thấy API Key cấu hình cho AI. Hệ thống tự động chuyển sang chế độ Trợ lý Tìm kiếm nhanh ngoại tuyến.' 
    });
  }

  try {
    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: `Bạn là trợ lý AI thông minh tích hợp trên B2B BD Tips Portal bằng tiếng Việt. 
Nhiệm vụ của bạn là hỗ trợ nhân viên Business Development (BD) trả lời câu hỏi về:
1. Kỹ năng Sales, ngôn từ đàm phán B2B.
2. Quy định Luật Lao động Việt Nam (Thử việc tối đa 60 ngày, lương tối thiểu 85%, báo trước nghỉ việc 30/45 ngày, tỷ lệ đóng BHXH 8%, BHYT 1.5%, BHTN 1%, giảm trừ gia cảnh bản thân 11M, người phụ thuộc 4.4M).
3. Hướng dẫn sử dụng các công cụ trên trang web này (PIC Finder để tìm email liên hệ, Quy đổi lương Gross-Net, Thư viện sách/bài viết).

Quy tắc điều hướng (Smart Navigation Router):
Nếu người dùng hỏi hoặc có ý định sử dụng một trong các tính năng sau, hãy bổ sung các thẻ đánh dấu điều hướng ở dòng cuối cùng của câu trả lời theo đúng định dạng chính xác bên dưới:
- Nếu hỏi về tính lương, đổi lương gross net: [NAV:salary]
- Nếu hỏi về thử việc, nghỉ việc, luật lao động, bảo hiểm: [NAV:labor-law]
- Nếu hỏi về tìm email, số điện thoại, tìm người phụ trách, PIC finder: [NAV:finder]
- Nếu hỏi về cẩm nang, bài viết, sách, ebook, LinkedIn posts: [NAV:library]

Hãy trả lời ngắn gọn, chuyên nghiệp, tập trung vào giải pháp cho nhân viên BD.

Câu hỏi của người dùng: "${message}"`
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let responseBody = '';
      apiRes.on('data', (chunk) => {
        responseBody += chunk;
      });
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          let text = '';
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
            text = parsed.candidates[0].content.parts[0].text;
          } else {
            text = 'Xin lỗi, tôi gặp sự cố khi kết nối tới AI. Hãy thử lại.';
          }
          res.status(200).json({ reply: text });
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse AI response', details: responseBody });
        }
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: 'API Request failed', details: e.message });
    });

    apiReq.write(postData);
    apiReq.end();

  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
