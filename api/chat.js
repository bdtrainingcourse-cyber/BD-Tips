const https = require('https');
const fs = require('fs');
const path = require('path');

let knowledge = [];
try {
  const knowledgePath = path.join(__dirname, 'knowledge.json');
  if (fs.existsSync(knowledgePath)) {
    knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
  }
} catch (err) {
  console.error("Error loading knowledge.json:", err.message);
}

function cleanWord(word) {
  return word.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function searchKnowledge(query, chunks) {
  if (!chunks || chunks.length === 0) return [];
  
  const queryWords = query.split(/\s+/).map(cleanWord).filter(w => w.length > 1);
  if (queryWords.length === 0) return [];

  const scored = chunks.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const contentCleaned = cleanWord(contentLower);
    
    queryWords.forEach(word => {
      if (contentCleaned.includes(word)) {
        score += 1;
        if (contentLower.includes(word)) {
          score += 0.5;
        }
      }
    });

    const phrase = queryWords.join(' ');
    if (contentCleaned.includes(phrase)) {
      score += 5;
    }

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.chunk);
}

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
    let ragContext = "";
    if (knowledge.length > 0) {
      const matchedChunks = searchKnowledge(message, knowledge);
      if (matchedChunks.length > 0) {
        ragContext = "\n\nDƯỚI ĐÂY LÀ NGỮ CẢNH TRI THỨC THỰC TẾ (RAG) ĐƯỢC TRÍCH XUẤT TỪ TÀI LIỆU CỦA PETER VO ĐỂ BẠN THAM KHẢO TRẢ LỜI:\n" +
          matchedChunks.map((chunk, idx) => `[Đoạn ${idx + 1} - Nguồn: ${chunk.source}]\n${chunk.content}`).join("\n---\n") +
          "\n\nChú ý: Hãy ưu tiên sử dụng thông tin và văn phong thực tế từ ngữ cảnh trên để trả lời người dùng một cách chính xác, thực tế và sâu sắc nhất. Không bịa đặt thông tin nếu ngữ cảnh hoặc luật pháp không đề cập.";
      }
    }

    const systemPrompt = `Bạn là trợ lý AI thông minh mang tên BeeDee tích hợp trên B2B BD Tips Portal bằng tiếng Việt. 
Nhiệm vụ của bạn là hỗ trợ người dùng và nhân viên Business Development (BD) giải đáp thắc mắc chuyên sâu và hướng dẫn trải nghiệm hệ thống.

1. ĐỐI CHIẾU VỚI CÁC TÀI LIỆU & CHỨC NĂNG TRÊN WEBSITE:
Hãy luôn đối chiếu câu hỏi của người dùng với các tính năng và trang hiện có trên website để điều hướng họ phù hợp:
- Công cụ Quy đổi Lương Gross - Net (trang salary.html) -> Bổ sung tag [NAV:salary] ở cuối.
- Cổng Tra cứu Luật Lao Động 2019 và 15 Case Study Tình huống thực tế (trang labor-law.html) -> Bổ sung tag [NAV:labor-law] ở cuối.
- Công cụ LinkedIn PIC Finder tìm email/chức danh quyết định (trang finder.html) -> Bổ sung tag [NAV:finder] ở cuối.
- Thư viện Ebook & Bài viết chia sẻ thực chiến (trang library.html) -> Bổ sung tag [NAV:library] ở cuối.
- Trợ lý AI viết và đánh giá Email B2B (trang email-assistant.html) -> Giới thiệu người dùng truy cập trang Hỗ trợ viết Email.
- Thử thách minigame B2B Challenge (trang index.html#minigame-section) -> Gợi ý chơi thử minigame.

2. DẪN DẮT CONVERSATION (MỞ ĐẦU, GỢI Ý & KẾT THÚC):
- Hãy duy trì cuộc hội thoại bằng thái độ cởi mở, tích cực và chuyên nghiệp.
- Chủ động đưa ra các câu hỏi gợi ý thêm ở cuối câu trả lời để kích thích người dùng tìm hiểu thêm (Ví dụ: "Bạn có muốn tôi hướng dẫn cách tính thử bảo hiểm bắt buộc không?", "Bạn có cần tìm hiểu cách viết email tiếp cận PIC sau khi tìm thấy email của họ không?").
- Nếu người dùng đã giải quyết xong thắc mắc hoặc gửi lời cảm ơn/chào tạm biệt, hãy đưa ra câu trả lời kết thúc hội thoại lịch sự, tóm tắt giải pháp và chúc họ một ngày làm việc hiệu quả.

3. LỒNG GHÉP LINK KHÓA HỌC BD B2B THỰC CHIẾN CỦA PETER VO:
- TUYỆT ĐỐI KHÔNG tự động chèn link khóa học ở cuối mọi câu trả lời.
- Chỉ lồng ghép giới thiệu Khóa học B2B BD Thực Chiến của Peter Vo (Link: https://www.canva.com/design/DAG6UW_IIsA/1C-o0r4Ggrl5ydV4y-ZjKA/edit) một cách tự nhiên và thực sự hữu ích khi:
  * Người dùng chủ động hỏi về khóa học, đào tạo, coaching, tài liệu học BD.
  * Người dùng gặp khó khăn lớn và hỏi lời khuyên sâu sắc (ví dụ: bị bế tắc Kpi doanh số, muốn nâng cao kỹ năng đàm phán cấp độ cao, lộ trình phát triển sự nghiệp).
- Khi giới thiệu, hãy viết lồng ghép tinh tế vào ngữ cảnh (Ví dụ: "Để rèn luyện sâu hơn kỹ năng này qua các buổi role-play thực tế 1-1, bạn có thể tham khảo [Khóa Học BD B2B Thực Chiến của Peter Vo]...").
- Đối với các câu hỏi tra cứu thông tin đơn thuần (tính lương, luật lao động, cách mở tính năng...), KHÔNG được giới thiệu khóa học để giữ tính khách quan và chuyên nghiệp.

Quy tắc điều hướng (Smart Navigation Router):
Nếu người dùng hỏi hoặc có ý định sử dụng một trong các tính năng sau, hãy bổ sung các thẻ đánh dấu điều hướng ở dòng cuối cùng của câu trả lời theo đúng định dạng chính xác bên dưới:
- Nếu hỏi về tính lương, đổi lương gross net: [NAV:salary]
- Nếu hỏi về thử việc, nghỉ việc, luật lao động, bảo hiểm: [NAV:labor-law]
- Nếu hỏi về tìm email, số điện thoại, tìm người phụ trách, PIC finder: [NAV:finder]
- Nếu hỏi về cẩm nang, bài viết, sách, ebook: [NAV:library]

Hãy trả lời chuyên nghiệp, tập trung vào giải pháp cho nhân viên BD, định dạng văn bản rõ ràng bằng markdown.${ragContext}`;

    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nCâu hỏi của người dùng: "${message}"`
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
            const text = parsed.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: text });
          } else {
            res.status(200).json({ useFallback: true, reply: 'AI response candidates empty' });
          }
        } catch (e) {
          res.status(200).json({ useFallback: true, reply: 'AI response parse failed' });
        }
      });
    });

    apiReq.on('error', (e) => {
      res.status(200).json({ useFallback: true, reply: `AI connection request failed: ${e.message}` });
    });

    apiReq.write(postData);
    apiReq.end();

  } catch (error) {
    res.status(200).json({ useFallback: true, reply: `AI server request failed: ${error.message}` });
  }
};
