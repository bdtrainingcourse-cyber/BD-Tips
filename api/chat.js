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

const STOP_WORDS = new Set([
  'toi', 'ban', 'minh', 'muon', 'can', 'lam', 'cho', 'voi', 'cua', 'va', 'cac', 'nhung', 
  'duoc', 'nay', 'do', 'nhu', 'co', 'la', 'o', 'tai', 'de', 'gi', 'nao', 'sao', 'the'
]);

function searchKnowledge(query, chunks) {
  if (!chunks || chunks.length === 0) return [];
  
  const queryWords = query.split(/\s+/).map(cleanWord).filter(w => w.length > 1 && !STOP_WORDS.has(w));
  if (queryWords.length === 0) return [];

  const scored = chunks.map(chunk => {
    let score = 0;
    const combinedText = `${chunk.source || ''} ${chunk.content || ''}`;
    const contentLower = combinedText.toLowerCase();
    const contentCleaned = cleanWord(contentLower);
    
    queryWords.forEach(word => {
      if (contentCleaned.includes(word)) {
        score += 3;
        if (contentLower.includes(word)) {
          score += 1;
        }
      }
    });

    const phrase = queryWords.join(' ');
    if (contentCleaned.includes(phrase)) {
      score += 15;
    }

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.chunk);
}

function detectNavTag(message, replyText) {
  const combined = (message + ' ' + (replyText || '')).toLowerCase();
  
  if (/test|trắc nghiệm|trac nghiem|tính cách|tinh cach|phong cách bd/i.test(combined)) {
    return 'personality-test';
  }
  if (/lương|luong|salary|gross|net|thuế tncn|thue tncn|bhxh|ote/i.test(combined)) {
    return 'salary';
  }
  if (/luật|luat|thử việc|thu viec|nghỉ việc|nghi viec|thôi việc|thoi viec|sa thải|bồi thường/i.test(combined)) {
    return 'labor-law';
  }
  if (/email|cold mail|outreach|viết mail|soạn mail|đánh giá email/i.test(combined)) {
    return 'email-assistant';
  }
  if (/kpi|phễu|pheu|doanh số|doanh so|inbound|outbound|conversion rate/i.test(combined)) {
    return 'kpi-estimation';
  }
  if (/nhiệm vụ|nhiem vu|quest|đổi quà|doi qua|trà sữa|tra sua|streak|điểm danh/i.test(combined)) {
    return 'quests';
  }
  if (/tìm pic|tim pic|pic finder|alumni|passcode|mã vip|ma vip/i.test(combined)) {
    return 'finder';
  }
  if (/cộng đồng|cong dong|community|diễn đàn|dien dan|thảo luận deal/i.test(combined)) {
    return 'community';
  }
  if (/ebook|thư viện|thu vien|thuật ngữ|glossary|arr|mrr|cac|ltv/i.test(combined)) {
    return 'library';
  }
  return null;
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

    const systemPrompt = `Bạn là BeeDee - Chú cú trợ lý AI thông minh đại diện cho B2B BD Tips Portal (https://www.bdbinhdanhocvu.com) của BD Bình Dân Học Vụ do Founder Peter Võ (Võ Phước Tân) xây dựng.

MỤC TIÊU VÀ VAI TRÒ CỦA BẠN:
- Hỗ trợ nhân sự Business Development (BD), Sales B2B, Founder & Quản lý giải đáp các thắc mắc về nghề BD thực chiến, đối chiếu quy định luật pháp, kỹ năng chốt deal và hướng dẫn sử dụng công cụ phù hợp.
- Trả lời bằng tiếng Việt lịch sự, thông thái, truyền cảm hứng, ngắn gọn, cấu trúc rõ ràng với Markdown.

QUY TẮC CỐT LÕI VỀ BỘ 9 CÔNG CỤ HIỆN CÓ TRÊN WEBSITE:
Website B2B BD Tips Portal ĐÃ CÓ ĐẦY ĐỦ 9 công cụ sau đây đang hoạt động:
1. Trắc nghiệm 4 Phong cách BD Thực chiến (Bài test tính cách BD, swipe card game quẹt thẻ Cú Thông Thái, Sư Tử Quyết Đoán, Đại Bàng Chiến Lược, Cáo Linh Hoạt) -> Thẻ điều hướng: [NAV:personality-test]
2. Quy đổi Lương Gross - Net (Tính lương Net/Gross chuẩn 2026, BHXH bắt buộc, thuế TNCN lũy tiến, hoa hồng OTE) -> Thẻ điều hướng: [NAV:salary]
3. Cổng Tra cứu Luật Lao Động 2019 (Thời gian thử việc tối đa 60 ngày, lương thử việc >=85%, thông báo nghỉ việc, trợ cấp thôi việc, 15 case study tranh chấp lao động) -> Thẻ điều hướng: [NAV:labor-law]
4. Thư viện 9+ Ebook B2B & 142+ Thuật ngữ BD (Tải trọn bộ ebook của Peter Võ, tra cứu thuật ngữ SaaS và công thức ARR, MRR, CAC, LTV) -> Thẻ điều hướng: [NAV:library]
5. Trợ lý AI Viết & Đánh giá Email B2B (Chấm điểm cold email, phân tích rào cản mở thư, viết lại outreach theo 5 pha ngôn từ) -> Thẻ điều hướng: [NAV:email-assistant]
6. Ma trận Phễu KPI & Ước tính Doanh số (Tính ngược từ mục tiêu doanh thu ra số MQL, SQL, Discovery Call, Proposal, Win rate cho Inbound & Outbound) -> Thẻ điều hướng: [NAV:kpi-estimation]
7. Hệ thống Nhiệm vụ Hàng ngày & Đổi Quà Streak (Làm quest duy trì streak, rủ đồng nghiệp nhận Trà Sữa L, 30p Online 1-1 với Peter Võ, Lunch VIP 1-1 với Peter Võ) -> Thẻ điều hướng: [NAV:quests]
8. Cổng Đặc Quyền Alumni VIP - Tìm PIC Doanh Nghiệp (Dành riêng cho học viên Khóa BD Thực Chiến có Mã Passcode VIP như BD-1272 tra cứu người phụ trách / PIC) -> Thẻ điều hướng: [NAV:finder]
9. Diễn đàn Cộng Đồng B2B Thực Chiến (Nơi kết nối, chia sẻ kinh nghiệm chiến trường và thảo luận giải quyết các deal hóc búa) -> Thẻ điều hướng: [NAV:community]

LƯU Ý NGHIÊM NGẶT:
- Bạn TUYỆT ĐỐI KHÔNG ĐƯỢC NÓI rằng website "chưa có" hoặc "không có" các công cụ trên. Website ĐÃ CÓ TOÀN BỘ 9 CÔNG CỤ TRÊN!
- Khi người dùng hỏi về bất kỳ công cụ hoặc chủ đề nào liên quan đến 9 công cụ trên, hãy hào hứng xác nhận, hướng dẫn ngắn gọn và LUÔN KẾT THÚC CÂU TRẢ LỜI BẰNG DUY NHẤT 1 THẺ [NAV:...] Ở DÒNG CUỐI CÙNG (ví dụ: [NAV:personality-test]).

KẾT NỐI VỚI FOUNDER PETER VÕ (VÕ PHƯỚC TÂN):
Nếu người dùng quan tâm đến cố vấn deal lớn, coaching 1-1 hay đào tạo doanh nghiệp:
- SĐT / Zalo: 0931.100.569
- Email: bdtraining@bdbinhdanhocvu.com
- LinkedIn: https://www.linkedin.com/in/vp-tan/${ragContext}`;

    const postData = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        role: "user",
        parts: [{ text: message }]
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
            let text = parsed.candidates[0].content.parts[0].text;
            
            // Safety guard: Ensure nav tag is attached if missing
            if (!text.includes('[NAV:')) {
              const detected = detectNavTag(message, text);
              if (detected) {
                text = text.trim() + `\n\n[NAV:${detected}]`;
              }
            }
            
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
