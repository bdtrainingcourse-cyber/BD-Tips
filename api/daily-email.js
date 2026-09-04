// Trigger rebuild for B2B_SECRET_KEY env variable injection
const https = require('https');
const { readUsers } = require('./_db-helper');
const {
  sendResendEmail,
  sendVerificationReminderEmail,
  renderHtmlEmailTemplate,
  stripHtml
} = require('./_email-helper');

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

const B2B_SECRET_KEY = process.env.B2B_SECRET_KEY || "2108330119Snail!!";

// Native fetch POST helper with automatic secretKey injection
async function httpPost(url, body) {
  let postBody = body;
  if (typeof postBody === 'object' && postBody !== null) {
    if (B2B_SECRET_KEY) postBody.secretKey = B2B_SECRET_KEY;
  } else if (typeof postBody === 'string') {
    try {
      const parsed = JSON.parse(postBody);
      if (B2B_SECRET_KEY) parsed.secretKey = B2B_SECRET_KEY;
      postBody = parsed;
    } catch (e) {}
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postBody)
  });

  return response;
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
      
      req.setTimeout(1500, () => {
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
  const finalMascotUrl = mascotUrl || 'https://bdbinhdanhocvu.com/mascot_mascot.jpg';
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
      Bạn nhận được email này vì đã kích hoạt chế độ tự động nhắc nhở rèn luyện hàng ngày tại <a href="https://bdbinhdanhocvu.com" class="accent-link">BD Bình Dân Học Vụ</a>.<br>
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

  // 1 & 2. Fetch weather and news in parallel with strict timeout to prevent Vercel execution limits
  let temp = 28;
  let weatherDesc = "Trời dịu mát";
  let weatherCode = 0;
  let newsTitle = "Thị trường kinh doanh sôi động";

  const weatherPromise = (async () => {
    try {
      const weatherRes = await httpGet("https://api3.vnexpress.net/api/crawler?type=get_data&key=weather_dot_com&province=79&app_id=d9b81e");
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        if (data && data.error === 0 && data.data && data.data.value) {
          const parsedValue = JSON.parse(data.data.value);
          const hcmWeather = parsedValue["TP HCM"];
          if (hcmWeather) {
            temp = parseInt(hcmWeather.temperature, 10) || 28;
            weatherDesc = hcmWeather.phrase || hcmWeather.cloud_status || "Trời dịu mát";
            
            const phraseLower = weatherDesc.toLowerCase();
            if (phraseLower.includes("giông") || phraseLower.includes("bão") || phraseLower.includes("storm") || phraseLower.includes("thunder")) {
              weatherCode = 95;
            } else if (phraseLower.includes("mưa") || phraseLower.includes("drizzle") || phraseLower.includes("shower") || phraseLower.includes("rain")) {
              weatherCode = 61;
            } else if (phraseLower.includes("sương")) {
              weatherCode = 45;
            }
            return; // Success!
          }
        }
      }
      
      // Open-Meteo fallback
      const fallbackRes = await httpGet("https://api.open-meteo.com/v1/forecast?latitude=10.823&longitude=106.63&current_weather=true");
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        if (data.current_weather) {
          temp = Math.round(data.current_weather.temperature);
          const weatherCodeRaw = data.current_weather.weathercode;
          if (weatherCodeRaw === 0) weatherDesc = "Trời quang nắng ráo";
          else if ([1, 2, 3].includes(weatherCodeRaw)) weatherDesc = "Trời dịu mát nhiều mây";
          else if ([45, 48].includes(weatherCodeRaw)) weatherDesc = "Có sương mù";
          else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCodeRaw)) weatherDesc = "Trời mưa ẩm ướt";
          else if ([95, 96, 99].includes(weatherCodeRaw)) weatherDesc = "Có giông bão sấm sét";

          if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCodeRaw)) {
            weatherCode = 61;
          } else if ([95, 96, 99].includes(weatherCodeRaw)) {
            weatherCode = 95;
          } else if ([45, 48].includes(weatherCodeRaw)) {
            weatherCode = 45;
          }
        }
      }
    } catch (err) {
      console.warn("Weather fetch error, using defaults:", err.message);
    }
  })();

  const newsPromise = (async () => {
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
      console.warn("News RSS fetch error, using defaults:", e.message);
    }
  })();

  // Guarantee that parallel requests do not block the function for more than 2.2 seconds
  await Promise.all([
    Promise.race([weatherPromise, new Promise(resolve => setTimeout(resolve, 2200))]),
    Promise.race([newsPromise, new Promise(resolve => setTimeout(resolve, 2200))])
  ]);

  // 3. Match Mascot based on context
  let selectedMascot = "https://bdbinhdanhocvu.com/mascot_mascot.jpg";
  if (weatherCode === 61) {
    selectedMascot = "https://bdbinhdanhocvu.com/mascot_rain.jpg";
  } else if (weatherCode === 95) {
    selectedMascot = "https://bdbinhdanhocvu.com/mascot_storm.jpg";
  } else if (temp >= 33) {
    selectedMascot = "https://bdbinhdanhocvu.com/mascot_hot.jpg";
  } else if (isFriday) {
    selectedMascot = "https://bdbinhdanhocvu.com/mascot_relax.jpg";
  } else if (dayOfWeek === 1) {
    selectedMascot = "https://bdbinhdanhocvu.com/mascot_challenge.jpg";
  }

  // 4. Fallback Static Ultra-Short Templates
  const fallbackTemplates = [
    {
      subject: `Pipeline của bạn có lạnh như thời tiết ${temp}°C? ❄️`,
      message: `Hôm nay ${dayName} thời tiết khá dịu mát (${temp}°C), thích hợp để ngồi sưởi ấm pipeline bằng vài deal mới. Tin tức hôm nay: "${newsTitle}". Hãy dùng trợ lý <b>Cold Email AI</b> để bứt phá tỉ lệ mở thư nhé!`,
      buttonText: "✍️ Soạn Cold Email Ngay",
      buttonUrl: "https://www.bdbinhdanhocvu.com/email-assistant.html",
      mascot: "https://www.bdbinhdanhocvu.com/mascot_ghost.jpg"
    },
    {
      subject: `Nắng nóng ${temp}°C làm bạn quá tải? ☀️`,
      message: `Trời hôm nay đang nắng nóng gay gắt (${temp}°C) dễ làm tụt năng lượng. Tin nóng: "${newsTitle}". Hãy tạm nghỉ tay, thư giãn và khám phá phong cách sales của mình với trắc nghiệm <b>Test Tính Cách BD</b> nhé!`,
      buttonText: "📊 Test Tính Cách Ngay",
      buttonUrl: "https://www.bdbinhdanhocvu.com/personality-test.html",
      mascot: "https://www.bdbinhdanhocvu.com/mascot_architect.jpg"
    },
    {
      subject: `Trời mưa rả rích, làm sao để lead không ghost? 🌧️`,
      message: `Thời tiết mưa ẩm dễ làm tinh thần đi xuống. Đọc ngay tin tiêu điểm: "${newsTitle}" và vào <b>Thư viện BD</b> xem mẹo rã đông lead từ anh Peter Vo!`,
      buttonText: "📚 Đọc Case-Study Ngay",
      buttonUrl: "https://www.bdbinhdanhocvu.com/library.html",
      mascot: "https://www.bdbinhdanhocvu.com/mascot_rain.jpg"
    },
    {
      subject: `Luyện phản xạ thực chiến ngày ${dayName}! 🦉`,
      message: `Bản tin kinh tế: "${newsTitle}". Hãy dành 2 phút giải trí và rèn luyện phản xạ xử lý từ chối cùng <b>Minigame B2B Challenge</b> để tích lũy điểm đổi quà nhé!`,
      buttonText: "🎮 Chơi Game Thực Chiến",
      buttonUrl: "https://www.bdbinhdanhocvu.com/#minigame-section",
      mascot: "https://www.bdbinhdanhocvu.com/mascot_challenge.jpg"
    }
  ];

  // Dynamic indexing based on dayOfWeek to ensure diversity even if Gemini API is rate-limited
  const templateIndex = (dayOfYear + dayOfWeek) % fallbackTemplates.length;
  let template = fallbackTemplates[templateIndex];

  // 5. Try generating personalized context email using Gemini 2.5 Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const systemPrompt = `Bạn là trợ lý Cú BeeDee của cổng thông tin học tập "BD Bình Dân Học Vụ" (https://bdbinhdanhocvu.com).
Nhiệm vụ của bạn là viết một email ngắn gọn, thông minh và cực kỳ hóm hỉnh gửi học viên BD vào đầu giờ sáng.

BỐI CẢNH THỰC TẾ TRONG NGÀY:
- Ngày trong tuần: ${dayName}
- Tình hình thời tiết Việt Nam: ${weatherDesc} (${temp}°C)
- Tin tức kinh tế tiêu điểm trên VnExpress: "${newsTitle}"

DANH SÁCH TÍNH NĂNG/CÔNG CỤ CỦA WEBSITE ĐỂ ĐIỀU HƯỚNG:
1. Mini Game B2B Challenge (https://bdbinhdanhocvu.com/quests.html hoặc https://bdbinhdanhocvu.com/#minigame-section) -> Chơi game xử lý từ chối B2B thực chiến để tích lũy BD-Points đổi quà.
2. Cộng Đồng B2B (https://bdbinhdanhocvu.com/community.html) -> Nơi chia sẻ bài viết, kết nối chiến thần B2B và thảo luận sôi nổi.
3. Test Tính Cách BD (https://bdbinhdanhocvu.com/personality-test.html) -> Làm trắc nghiệm tính cách BD chuyên sâu để khám phá điểm mạnh/yếu thực chiến và nhận diện phong cách sales.
4. AI Email Assistant (https://bdbinhdanhocvu.com/email-assistant.html) -> Viết Cold Email B2B bứt phá tỷ lệ chuyển đổi.
5. Thư Viện BD (https://bdbinhdanhocvu.com/library.html) -> Các case study và bài viết chiều sâu từ anh Peter Vo.
6. KPI & Phễu (https://bdbinhdanhocvu.com/kpi-estimation.html) -> Lập kế hoạch B2B và tính toán tỷ lệ chuyển đổi phễu.
7. Lương Gross-Net (https://bdbinhdanhocvu.com/salary.html) -> Công cụ tính lương Gross/Net chi tiết và tra cứu Luật Lao Động.

YÊU CẦU NỘI DUNG & PHONG CÁCH:
1. Độ dài: CỰC KỲ NGẮN GỌN (tối đa 2 đến 3 câu ngắn).
2. Tinh thần sáng tạo: Viết theo phong cách hài hước (funny), hóm hỉnh đặc trưng của dân Sales/BD thực chiến (ví dụ: cày KPI, chốt deal, pipeline, lead bị ghost, chốt PIC, sếp dí...).
3. Cách lồng ghép tin tức & thời tiết:
   - Hãy lấy tiêu đề VnExpress "${newsTitle}" làm nguồn cảm hứng để tạo ra một câu đùa ẩn dụ hài hước kết nối trực tiếp với cuộc sống Sales/BD.
   - Lồng ghép khéo léo yếu tố thời tiết "${weatherDesc} (${temp}°C)" làm gia vị phụ họa hài hước.
4. TUYỆT ĐỐI KHÔNG chào hỏi bằng các câu sáo rỗng như "Chào Peter", "Chào bạn", "Chào Chiến thần B2B", "Xin chào" ở đầu email vì hệ thống đã tự động chèn lời chào rồi. Hãy đi thẳng ngay vào câu đùa/nội dung chính ở câu đầu tiên.
5. SỰ ƯU TIÊN VỀ TÍNH NĂNG (QUAN TRỌNG): Hãy tập trung cao độ (khoảng 80% số ngày) xoay quanh và dẫn dắt người dùng click vào 3 tính năng trọng tâm sau:
   - "Mini Game B2B Challenge" (Tích điểm đổi quà)
   - "Cộng Đồng B2B" (Thảo luận kết nối)
   - "Test Tính Cách BD" (Khám phá bản thân)
   TUYỆT ĐỐI KHÔNG giới thiệu hay dẫn link đến tính năng "Pitching AI" (không dùng link pitching.html). Hạn chế nhắc đến AI Email Assistant, Lương Gross-Net hay các tính năng khác trừ khi có thời tiết/tin tức cực kỳ liên quan trực tiếp.
6. Chọn Mascot phù hợp: Lựa chọn linh hoạt loại biểu cảm mascot phản ánh đúng tâm lý/nội dung email đó để chú cú hiển thị sinh động và đa dạng (ví dụ: dùng ghost khi bị khách ghost, wrong khi deal tạch, milktea khi đổi quà/thưởng, relax khi cuối tuần/thả lỏng, hot/rain/storm tương ứng thời tiết hoặc áp lực KPI).

ĐỊNH DẠNG ĐẦU RA: Trả về duy nhất một chuỗi JSON hợp lệ (không bọc trong tag code markdown) có cấu trúc như sau:
{
  "subject": "Tiêu đề email cực kỳ ngắn gọn, giật gân hài hước, đánh trúng tâm lý dân sales/BD kèm emoji",
  "message": "Nội dung email viết bằng HTML ngắn gọn (tối đa 2-3 câu, dùng <br> để xuống dòng, không dùng ký tự markdown như ** hay #)",
  "buttonText": "Nút bấm CTA hài hước, cuốn hút và tích cực",
  "buttonUrl": "Đường dẫn tuyệt đối tương ứng với công cụ được chọn giới thiệu",
  "mascotType": "chọn 1 trong các chuỗi sau: challenge (khuyên học/game), correct (mẹo hay), wrong (thất bại/từ chối), ghost (bị khách ghost), law (lương/luật), milktea (đổi quà/thưởng), relax (cuối tuần/thả lỏng), hot (áp lực/nắng nóng), rain (mưa lạnh/deal nguội), storm (bão/khủng hoảng), default (bình thường)"
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
              challenge: "https://bdbinhdanhocvu.com/mascot_challenge.jpg",
              correct: "https://bdbinhdanhocvu.com/mascot_correct.jpg",
              wrong: "https://bdbinhdanhocvu.com/mascot_wrong.jpg",
              ghost: "https://bdbinhdanhocvu.com/mascot_ghost.jpg",
              law: "https://bdbinhdanhocvu.com/mascot_law.jpg",
              milktea: "https://bdbinhdanhocvu.com/mascot_milktea.jpg",
              relax: "https://bdbinhdanhocvu.com/mascot_relax.jpg",
              hot: "https://bdbinhdanhocvu.com/mascot_hot.jpg",
              rain: "https://bdbinhdanhocvu.com/mascot_rain.jpg",
              storm: "https://bdbinhdanhocvu.com/mascot_storm.jpg",
              default: "https://bdbinhdanhocvu.com/mascot_mascot.jpg"
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
        message: "6h00 chiều thứ Sáu đã điểm! Hãy gấp laptop lại, xả stress cực mạnh bằng câu chuyện cười BD giòn giã tại <b>Thư viện BD</b> và tận hưởng kỳ nghỉ cuối tuần trọn vẹn nhé!",
        buttonText: "🤪 Đọc Truyện Cười BD",
        buttonUrl: "https://bdbinhdanhocvu.com/library.html",
        mascot: "https://bdbinhdanhocvu.com/mascot_relax.jpg"
      };
    } else {
      template = {
        subject: "Thứ 6 rồi! Cùng share chuyện vui lên cộng đồng nào! 🧋✨",
        message: "Cuối cùng thì ngày thứ 6 mong đợi cũng đã tới! Hãy ghé ngay <b>Diễn đàn Cộng đồng</b> chia sẻ những câu chuyện vui hoặc kỷ niệm đi làm đáng nhớ trong tuần qua nhé!",
        buttonText: "💬 Chia Sẻ Chuyện Vui Ngay",
        buttonUrl: "https://bdbinhdanhocvu.com/community.html",
        mascot: "https://bdbinhdanhocvu.com/mascot_milktea.jpg"
      };
    }
  }

  const subject = template.subject;
  const webhookUrl = 'https://script.google.com/macros/s/AKfycbzhevaZUCV0ITOxOeeFTx4lFG4jqknpCFV1EJ4l_L75-zkgmmY0eJlKc68jEgk_mVU/exec';

  // If overriding for testing via ?email=...
  if (req.query.email) {
    const isUnverified = req.query.verified === 'false';
    const targetEmail = req.query.email;
    const targetName = req.query.name || 'Chiến thần B2B';
    console.log(`[DAILY_EMAIL_CRON] Test mode. Sending email to ${targetEmail} via Resend...`);

    let resendResult = null;
    if (isUnverified) {
      resendResult = await sendVerificationReminderEmail({ email: targetEmail, name: targetName });
    } else {
      const sep = template.buttonUrl.includes('?') ? '&' : '?';
      const personalizedUrl = `${template.buttonUrl}${sep}sync_email=${encodeURIComponent(targetEmail)}&sync_name=${encodeURIComponent(targetName)}&utm_source=daily_email&utm_medium=email&utm_campaign=daily_reminder`;
      const emailHtml = renderHtmlEmailTemplate({
        greeting: `Chào bạn ${targetName}`,
        message: template.message,
        buttonText: template.buttonText,
        buttonUrl: personalizedUrl
      });
      resendResult = await sendResendEmail({
        to: targetEmail,
        subject: subject,
        html: emailHtml
      });
    }

    // Also sync to Google Sheets for records
    let sheetText = "";
    if (webhookUrl) {
      try {
        const payload = isUnverified 
          ? { action: 'sendVerificationReminder', email: targetEmail, name: targetName }
          : { action: 'sendSingleEmail', to: targetEmail, name: targetName, subject, message: template.message, buttonText: template.buttonText, buttonUrl: template.buttonUrl };
        const emailRes = await httpPost(webhookUrl, payload);
        sheetText = await emailRes.text();
      } catch (err) {
        console.warn(`[DAILY_EMAIL_SHEET_SYNC_WARN]`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      resendResult: resendResult,
      message: `Test email (${isUnverified ? 'unverified flow' : 'verified flow'}) sent via Resend to ${targetEmail}`,
      sheetResponse: sheetText,
      context: { temp, weatherDesc, newsTitle, mascot: template.mascot }
    });
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
