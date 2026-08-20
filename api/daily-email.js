const https = require('https');
const { readUsers } = require('./_db-helper');

// Native HTTPS GET helper that mimics fetch response structure with 3s timeout
function httpGet(url) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, (getRes) => {
        let data = '';
        getRes.on('data', (chunk) => data += chunk);
        getRes.on('end', () => {
          resolve({
            ok: getRes.statusCode >= 200 && getRes.statusCode < 300,
            status: getRes.statusCode,
            text: () => Promise.resolve(data),
            json: () => {
              try {
                return Promise.resolve(JSON.parse(data));
              } catch (e) {
                return Promise.reject(e);
              }
            }
          });
        });
      });
      
      req.setTimeout(3000, () => {
        req.destroy();
        resolve({
          ok: false,
          status: 408,
          text: () => Promise.resolve('Timeout'),
          json: () => Promise.resolve({})
        });
      });

      req.on('error', (err) => {
        resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve(err.message),
          json: () => Promise.resolve({})
        });
      });
    } catch (e) {
      resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(e.message),
        json: () => Promise.resolve({})
      });
    }
  });
}

// Native HTTPS POST helper that mimics fetch response structure with 3s timeout
function httpPost(url, body, maxRedirects = 5) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const postData = typeof body === 'string' ? body : JSON.stringify(body);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
          if (maxRedirects <= 0) {
            resolve({
              ok: false,
              status: 500,
              text: () => Promise.resolve('Too many redirects'),
              json: () => Promise.resolve({})
            });
            return;
          }
          httpGet(res.headers.location, maxRedirects - 1).then(resolve);
          return;
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(data),
            json: () => {
              try {
                return Promise.resolve(JSON.parse(data));
              } catch (e) {
                return Promise.reject(e);
              }
            }
          });
        });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          ok: false,
          status: 408,
          text: () => Promise.resolve('Timeout'),
          json: () => Promise.resolve({})
        });
      });

      req.on('error', (err) => {
        resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve(err.message),
          json: () => Promise.resolve({})
        });
      });

      req.write(postData);
      req.end();
    } catch (e) {
      resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(e.message),
        json: () => Promise.resolve({})
      });
    }
  });
}

function httpGet(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET'
      };
      
      const req = https.request(options, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
          if (maxRedirects <= 0) {
            resolve({
              ok: false,
              status: 500,
              text: () => Promise.resolve('Too many redirects'),
              json: () => Promise.resolve({})
            });
            return;
          }
          httpGet(res.headers.location, maxRedirects - 1).then(resolve);
          return;
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(data),
            json: () => {
              try {
                return Promise.resolve(JSON.parse(data));
              } catch (e) {
                return Promise.reject(e);
              }
            }
          });
        });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          ok: false,
          status: 408,
          text: () => Promise.resolve('Timeout'),
          json: () => Promise.resolve({})
        });
      });

      req.on('error', (err) => {
        resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve(err.message),
          json: () => Promise.resolve({})
        });
      });

      req.end();
    } catch (e) {
      resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(e.message),
        json: () => Promise.resolve({})
      });
    }
  });
}

function getHtmlTemplate(message, buttonText, buttonUrl, mascotUrl) {
  const finalMascotUrl = mascotUrl || 'https://bd-tips.vercel.app/mascot_mascot.jpg';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BD Bình Dân Học Vụ - Lời khuyên hàng ngày</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
    
    /* Force font family matching on all elements to prevent Vietnamese accent rendering issues */
    body, table, td, div, p, a, span {
      font-family: 'Plus Jakarta Sans', 'Lexend', Arial, Helvetica, sans-serif !important;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #fcf9f4;
      color: #334155;
    }
    .email-container {
      max-width: 500px;
      margin: 30px auto;
      background-color: #ffffff;
      border: 1.5px solid #f3a83b;
      border-radius: 24px;
      padding: 35px 28px;
      text-align: center;
      box-shadow: 0 10px 25px rgba(243, 168, 59, 0.08);
    }
    .mascot-container {
      margin-bottom: 20px;
      display: inline-block;
      padding: 10px;
      background: rgba(243, 168, 59, 0.08);
      border-radius: 50%;
    }
    .mascot-img {
      width: 90px;
      height: 90px;
      object-fit: contain;
      display: block;
      border-radius: 50%;
    }
    .headline {
      font-size: 1.35rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 18px 0;
      line-height: 1.3;
    }
    .content-text {
      font-size: 0.95rem;
      line-height: 1.65;
      color: #475569;
      margin: 0 0 25px 0;
      text-align: left;
    }
    .cta-container {
      margin: 25px 0;
    }
    .cta-btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #f3a83b 0%, #f59e0b 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 800;
      font-size: 0.88rem;
      border-radius: 12px;
      box-shadow: 0 5px 18px rgba(243, 168, 59, 0.35);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .footer-text {
      font-size: 0.76rem;
      color: #94a3b8;
      border-top: 1px solid rgba(243, 168, 59, 0.15);
      padding-top: 22px;
      margin-top: 22px;
      line-height: 1.45;
      text-align: center;
    }
    .accent-link {
      color: #d97706;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="mascot-container">
      <img src="${finalMascotUrl}" class="mascot-img" alt="Cú BeeDee">
    </div>
    <div class="headline">Chào ngày mới cùng Cú BeeDee! 🦉☀️</div>
    <div class="content-text">
      ${message}
    </div>
    <div class="cta-container">
      <a href="${buttonUrl}" target="_blank" class="cta-btn">${buttonText}</a>
    </div>
    <div class="footer-text">
      Bạn nhận được email này vì đã kích hoạt chế độ tự động nhắc nhở rèn luyện hàng ngày tại <a href="https://bd-tips.vercel.app" class="accent-link">BD Bình Dân Học Vụ</a>.<br>
      © 2026 BD Bình Dân Học Vụ. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Calculate date fields in Vietnam timezone (UTC+7)
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();
  
  // Allow overriding day of week for manual testing
  let dayOfWeek = now.getUTCDay(); // 0: Sunday, 1: Monday, ..., 5: Friday, 6: Saturday
  if (req.query.day) {
    dayOfWeek = parseInt(req.query.day, 10);
  }

  const start = new Date(Date.UTC(year, 0, 0));
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  if (isWeekend && !req.query.force) {
    return res.status(200).json({
      success: true,
      message: "No emails scheduled on weekends (Saturday and Sunday)."
    });
  }

  const hour = now.getUTCHours();    // 0 to 23
  const isFriday = (dayOfWeek === 5);
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayName = days[dayOfWeek];

  // 1. Fetch weather in Vietnam (default HCMC) using local httpGet helper
  let temp = 28;
  let weatherDesc = "Trời dịu mát";
  let weatherCode = 0;
  try {
    const weatherRes = await httpGet("https://api.open-meteo.com/v1/forecast?latitude=10.823&longitude=106.63&current_weather=true");
    if (weatherRes.ok) {
      const data = await weatherRes.json();
      if (data.current_weather) {
        temp = Math.round(data.current_weather.temperature);
        weatherCode = data.current_weather.weathercode;
        if (weatherCode === 0) weatherDesc = "Trời quang nắng ráo";
        else if ([1, 2, 3].includes(weatherCode)) weatherDesc = "Trời dịu mát nhiều mây";
        else if ([45, 48].includes(weatherCode)) weatherDesc = "Có sương mù";
        else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) weatherDesc = "Trời mưa ẩm ướt";
        else if ([95, 96, 99].includes(weatherCode)) weatherDesc = "Có giông bão sấm sét";
      }
    }
  } catch (e) {
    console.error("Failed to fetch weather:", e.message);
  }

  // 2. Fetch latest economic news from VnExpress Business RSS Feed
  let newsTitle = "Thị trường kinh doanh sôi động";
  try {
    const rssRes = await httpGet("https://vnexpress.net/rss/kinh-doanh.rss");
    if (rssRes.ok) {
      const xml = await rssRes.text();
      const titleMatch = xml.match(/<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
      if (titleMatch && titleMatch[1]) {
        newsTitle = titleMatch[1].trim();
      }
    }
  } catch (e) {
    console.error("Failed to fetch news RSS:", e.message);
  }

  // 3. Match Mascot based on context
  let selectedMascot = "https://bd-tips.vercel.app/mascot_mascot.jpg";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    selectedMascot = "https://bd-tips.vercel.app/mascot_rain.jpg";
  } else if ([95, 96, 99].includes(weatherCode)) {
    selectedMascot = "https://bd-tips.vercel.app/mascot_storm.jpg";
  } else if (temp >= 33) {
    selectedMascot = "https://bd-tips.vercel.app/mascot_hot.jpg";
  } else if (isFriday) {
    selectedMascot = "https://bd-tips.vercel.app/mascot_relax.jpg";
  } else if (dayOfWeek === 1) {
    selectedMascot = "https://bd-tips.vercel.app/mascot_challenge.jpg";
  }

  // 4. Fallback Static Ultra-Short Templates
  const fallbackTemplates = [
    {
      subject: `Pipeline của bạn có lạnh như thời tiết ${temp}°C? ❄️`,
      message: `Chào Chiến thần B2B!<br><br>Hôm nay ${dayName} thời tiết khá dịu mát (${temp}°C), thích hợp để ngồi sưởi ấm pipeline bằng vài deal mới. Tin tức hôm nay: "${newsTitle}". Hãy dùng trợ lý <b>Cold Email AI</b> để bứt phá tỉ lệ mở thư nhé!`,
      buttonText: "✍️ Soạn Cold Email Ngay",
      buttonUrl: "https://bd-tips.vercel.app/email-assistant.html",
      mascot: "https://bd-tips.vercel.app/mascot_ghost.jpg"
    },
    {
      subject: `Nắng nóng ${temp}°C làm deal bốc hơi? ☀️`,
      message: `Chào Chiến thần B2B!<br><br>Trời hôm nay đang nắng nóng gay gắt (${temp}°C) dễ làm tụt năng lượng. Tin nóng: "${newsTitle}". Đừng để deal bị bốc hơi, hãy cày ngay kịch bản pitching thuyết phục cùng <b>Pitching AI</b>!`,
      buttonText: "🎤 Pitching AI Ngay",
      buttonUrl: "https://bd-tips.vercel.app/pitching.html",
      mascot: "https://bd-tips.vercel.app/mascot_hot.jpg"
    },
    {
      subject: `Trời mưa rả rích, làm sao để lead không ghost? 🌧️`,
      message: `Chào Chiến thần B2B!<br><br>Thời tiết mưa ẩm dễ làm tinh thần đi xuống. Đọc ngay tin tiêu điểm: "${newsTitle}" và vào <b>Thư viện BD</b> xem mẹo rã đông lead từ anh Peter Vo!`,
      buttonText: "📚 Đọc Case-Study Ngay",
      buttonUrl: "https://bd-tips.vercel.app/library.html",
      mascot: "https://bd-tips.vercel.app/mascot_rain.jpg"
    },
    {
      subject: `Luyện phản xạ thực chiến ngày ${dayName}! 🦉`,
      message: `Chào Chiến thần B2B!<br><br>Bản tin kinh tế: "${newsTitle}". Hãy dành 2 phút giải trí và rèn luyện phản xạ xử lý từ chối cùng <b>Minigame B2B Challenge</b> để tích lũy điểm đổi quà nhé!`,
      buttonText: "🎮 Chơi Game Thực Chiến",
      buttonUrl: "https://bd-tips.vercel.app/#minigame-section",
      mascot: "https://bd-tips.vercel.app/mascot_challenge.jpg"
    }
  ];

  // Dynamic indexing based on dayOfWeek to ensure diversity even if Gemini API is rate-limited
  const templateIndex = (dayOfYear + dayOfWeek) % fallbackTemplates.length;
  let template = fallbackTemplates[templateIndex];

  // 5. Try generating personalized context email using Gemini 2.5 Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const systemPrompt = `Bạn là trợ lý Cú BeeDee của cổng thông tin học tập "BD Bình Dân Học Vụ" (https://bd-tips.vercel.app).
Nhiệm vụ của bạn là viết một email ngắn gọn, thông minh gửi học viên BD vào đầu giờ sáng.

BỐI CẢNH THỰC TẾ TRONG NGÀY:
- Ngày trong tuần: ${dayName}
- Tình hình thời tiết Việt Nam: ${weatherDesc} (${temp}°C)
- Tin tức kinh tế tiêu điểm: "${newsTitle}"

DANH SÁCH TÍNH NĂNG/CÔNG CỤ CỦA WEBSITE ĐỂ ĐIỀU HƯỚNG:
1. Cộng Đồng B2B (https://bd-tips.vercel.app/community.html) -> Nơi chia sẻ bài viết, kết nối chiến thần B2B và thảo luận sôi nổi.
2. Challenge Game (https://bd-tips.vercel.app/#minigame-section) -> Chơi game xử lý từ chối B2B thực chiến để tích lũy BD-Points đổi quà.
3. Pitching AI (https://bd-tips.vercel.app/pitching.html) -> Luyện tập phản xạ thuyết trình và pitching B2B với AI.
4. AI Email Assistant (https://bd-tips.vercel.app/email-assistant.html) -> Viết Cold Email B2B bứt phá tỷ lệ chuyển đổi.
5. Lương Gross-Net (https://bd-tips.vercel.app/salary.html) -> Công cụ tính lương Gross/Net chi tiết.
6. Luật Lao Động (https://bd-tips.vercel.app/salary.html#law-section) -> Tra cứu nhanh luật lao động mới nhất.
7. KPI & Phễu (https://bd-tips.vercel.app/kpi.html) -> Lập kế hoạch B2B và tính toán tỷ lệ chuyển đổi phễu.
8. Sự Kiện B2B (https://bd-tips.vercel.app/events.html) -> Lịch sự kiện giao lưu thực chiến.
9. Thư Viện BD (https://bd-tips.vercel.app/library.html) -> Các case study và bài viết chiều sâu từ anh Peter Vo.

YÊU CẦU NỘI DUNG:
1. Độ dài: Cực kỳ NGẮN GỌN (tối đa 2 đến 3 câu ngắn), phong cách vui vẻ, tích cực, thực chiến và hóm hỉnh của dân Sales/BD (ví dụ: cày KPI, chốt deal, pipeline, PIC, lead...).
2. Nội dung đa dạng: Không lặp đi lặp lại. Phải lồng ghép khéo léo tin tức kinh tế nóng trong ngày hoặc tình hình thời tiết vào câu chuyện B2B (ví dụ: Tin tức kinh tế "${newsTitle}" có tác động gì đến doanh nghiệp hay deal của bạn không? Hoặc thời tiết hôm nay gợi ý cho bạn cách tiếp cận khách hàng thế nào?).
3. Tập trung quảng bá: Hãy luân phiên giới thiệu các công cụ khác nhau. Đặc biệt khuyến khích và kêu gọi học viên vào "Cộng Đồng B2B" chia sẻ bài viết hoặc chơi "Challenge Game" để rèn luyện phản xạ và tích điểm (BD-Points) đổi quà trà sữa...
4. Chọn Mascot thích hợp: Chọn 1 sắc thái mascot phản ánh đúng tâm trạng hoặc nội dung của email đó.

ĐỊNH DẠNG ĐẦU RA: Trả về duy nhất một chuỗi JSON hợp lệ (không bọc trong tag code markdown) có cấu trúc như sau:
{
  "subject": "Tiêu đề email ngắn gọn, thu hút, đánh trúng tâm lý dân sales/BD kèm emoji",
  "message": "Nội dung email viết bằng HTML ngắn gọn (2-3 câu, dùng <br> để xuống dòng, không dùng ký tự markdown như ** hay #)",
  "buttonText": "Tên nút kêu gọi hành động (CTA) thật cuốn hút và tích cực",
  "buttonUrl": "Đường dẫn tuyệt đối tương ứng với công cụ được chọn giới thiệu",
  "mascotType": "chọn 1 trong các chuỗi sau: challenge (khi khuyên học/chơi game), correct (mẹo chuẩn), wrong (khi nói về thất bại/từ chối), ghost (khi nói về email/khách hàng ghost), law (khi nói về lương/luật), milktea (khi nói về đổi quà/điểm thưởng), relax (thư giãn/cuối tuần), hot (nắng nóng/áp lực KPI), rain (mưa lạnh/lead nguội), storm (bão/khủng hoảng), default (tiêu chuẩn)"
}`;

      const geminiRes = await httpPost(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        contents: [{ parts: [{ text: systemPrompt }] }]
      });

      if (geminiRes.ok) {
        const json = await geminiRes.json();
        if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts[0]) {
          const rawText = json.candidates[0].content.parts[0].text.trim();
          const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleanedJson);
          if (parsed.subject && parsed.message && parsed.buttonText && parsed.buttonUrl) {
            const mascotMap = {
              challenge: "https://bd-tips.vercel.app/mascot_challenge.jpg",
              correct: "https://bd-tips.vercel.app/mascot_correct.jpg",
              wrong: "https://bd-tips.vercel.app/mascot_wrong.jpg",
              ghost: "https://bd-tips.vercel.app/mascot_ghost.jpg",
              law: "https://bd-tips.vercel.app/mascot_law.jpg",
              milktea: "https://bd-tips.vercel.app/mascot_milktea.jpg",
              relax: "https://bd-tips.vercel.app/mascot_relax.jpg",
              hot: "https://bd-tips.vercel.app/mascot_hot.jpg",
              rain: "https://bd-tips.vercel.app/mascot_rain.jpg",
              storm: "https://bd-tips.vercel.app/mascot_storm.jpg",
              default: "https://bd-tips.vercel.app/mascot_mascot.jpg"
            };
            const finalMascot = mascotMap[parsed.mascotType] || mascotMap.default;
            template = {
              subject: parsed.subject,
              message: parsed.message,
              buttonText: parsed.buttonText,
              buttonUrl: parsed.buttonUrl,
              mascot: finalMascot
            };
          }
        }
      }
    } catch (err) {
      console.error("Gemini generation failed for daily email, using fallback:", err.message);
    }
  }

  // Override specific templates for Friday evening/morning fallback if not AI generated
  if (!apiKey && isFriday) {
    const isEvening = req.query.time ? (req.query.time === 'evening') : (hour >= 12);
    if (isEvening) {
      template = {
        subject: "Cuối tuần rồi! Xả stress cực mạnh thôi! 🦉🎉",
        message: "Chào Chiến thần B2B!<br><br>6h00 chiều thứ Sáu đã điểm! Hãy gấp laptop lại, xả stress cực mạnh bằng câu chuyện cười BD giòn giã tại <b>Thư viện BD</b> và tận hưởng kỳ nghỉ cuối tuần trọn vẹn nhé!",
        buttonText: "🤪 Đọc Truyện Cười BD",
        buttonUrl: "https://bd-tips.vercel.app/library.html",
        mascot: "https://bd-tips.vercel.app/mascot_relax.jpg"
      };
    } else {
      template = {
        subject: "Thứ 6 rồi! Cùng share chuyện vui lên cộng đồng nào! 🧋✨",
        message: "Chào Chiến thần B2B!<br><br>Cuối cùng thì ngày thứ 6 mong đợi cũng đã tới! Hãy ghé ngay <b>Diễn đàn Cộng đồng</b> chia sẻ những câu chuyện vui hoặc kỷ niệm đi làm đáng nhớ trong tuần qua nhé!",
        buttonText: "💬 Chia Sẻ Chuyện Vui Ngay",
        buttonUrl: "https://bd-tips.vercel.app/community.html",
        mascot: "https://bd-tips.vercel.app/mascot_milktea.jpg"
      };
    }
  }

  const subject = template.subject;
  const webhookUrl = process.env.GOOGLE_SHEET_LEADS_WEBHOOK;

  // If overriding for testing via ?email=...
  if (req.query.email) {
    console.log(`[DAILY_EMAIL_CRON] Test mode. Sending single email to ${req.query.email}...`);
    if (webhookUrl) {
      try {
        const emailRes = await httpPost(webhookUrl, {
          action: 'sendSingleEmail',
          to: req.query.email,
          name: req.query.name || 'Chiến thần B2B',
          subject: subject,
          message: template.message,
          buttonText: template.buttonText,
          buttonUrl: template.buttonUrl,
          mascot: template.mascot
        });
        const resText = await emailRes.text();
        return res.status(200).json({
          success: true,
          message: `Test email sent to ${req.query.email}`,
          sheetResponse: resText,
          context: { temp, weatherDesc, newsTitle, mascot: template.mascot }
        });
      } catch (err) {
        console.error(`[DAILY_EMAIL_CRON_ERROR] Test email failed:`, err);
        return res.status(500).json({ error: err.message });
      }
    } else {
      const bodyText = getHtmlTemplate(template.message, template.buttonText, template.buttonUrl, template.mascot);
      return res.status(200).json({
        success: true,
        message: 'Mock send successful (Dev mode - no webhook URL)',
        bodyHtml: bodyText,
        context: { temp, weatherDesc, newsTitle, mascot: template.mascot }
      });
    }
  }

  // Otherwise, it's the automated daily cron run! Trigger Sheet to email all registered users!
  console.log(`[DAILY_EMAIL_CRON] Cron mode. Triggering sheet daily dispatch...`);
  if (webhookUrl) {
    try {
      const response = await httpPost(webhookUrl, {
        action: 'sendDailyEmails',
        subject: subject,
        message: template.message,
        buttonText: template.buttonText,
        buttonUrl: template.buttonUrl,
        mascot: template.mascot
      });
      const resText = await response.text();
      return res.status(200).json({
        success: true,
        message: 'Daily cron dispatch sent to Google Sheets Webhook',
        sheetResponse: resText,
        context: { temp, weatherDesc, newsTitle, mascot: template.mascot }
      });
    } catch (err) {
      console.error(`[DAILY_EMAIL_CRON_ERROR] Cron dispatch failed:`, err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Mock cron run completed (Dev mode - no webhook URL)',
    context: { temp, weatherDesc, newsTitle, mascot: template.mascot }
  });
};
