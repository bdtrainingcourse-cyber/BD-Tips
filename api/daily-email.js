const https = require('https');
const { readUsers } = require('./db-helper');

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
function httpPost(url, body) {
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
      
      const req = https.request(options, (postRes) => {
        let data = '';
        postRes.on('data', (chunk) => data += chunk);
        postRes.on('end', () => {
          resolve({
            ok: postRes.statusCode >= 200 && postRes.statusCode < 300,
            status: postRes.statusCode,
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

// Helper to wrap message in a premium bright warm-themed HTML template
function getHtmlTemplate(message, buttonText, buttonUrl, mascotUrl) {
  const finalMascotUrl = mascotUrl || 'https://bd-tips.vercel.app/bd_mascot.png';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B2B BD Tips Daily Reminder</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fcf9f4;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
      width: 85px;
      height: 85px;
      object-fit: contain;
      display: block;
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
    <div class="headline">Chào ngày mới đầy năng lượng cùng Cú BeeDee! 🦉☀️</div>
    <div class="content-text">
      ${message}
    </div>
    <div class="cta-container">
      <a href="${buttonUrl}" target="_blank" class="cta-btn">${buttonText}</a>
    </div>
    <div class="footer-text">
      Bạn nhận được email này vì đã kích hoạt chế độ tự động nhắc nhở rèn luyện hàng ngày tại <a href="https://bd-tips.vercel.app" class="accent-link">BD Bình Dân Học Vụ</a>.<br>
      © 2026 B2B BD Tips Portal. All rights reserved.
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
      buttonUrl: "https://bd-tips.vercel.app/email-assistant.html"
    },
    {
      subject: `Nắng nóng ${temp}°C làm deal bốc hơi? ☀️`,
      message: `Chào Chiến thần B2B!<br><br>Trời hôm nay đang nắng nóng gay gắt (${temp}°C) dễ làm tụt năng lượng. Tin nóng: "${newsTitle}". Đừng để deal bị bốc hơi, hãy cày ngay kịch bản pitching thuyết phục cùng <b>Pitching AI</b>!`,
      buttonText: "🎤 Pitching AI Ngay",
      buttonUrl: "https://bd-tips.vercel.app/pitching.html"
    },
    {
      subject: `Trời mưa rả rích, làm sao để lead không ghost? 🌧️`,
      message: `Chào Chiến thần B2B!<br><br>Thời tiết mưa ẩm dễ làm tinh thần đi xuống. Đọc ngay tin tiêu điểm: "${newsTitle}" và vào <b>Thư viện BD</b> xem mẹo rã đông lead từ anh Peter Vo!`,
      buttonText: "📚 Đọc Case-Study Ngay",
      buttonUrl: "https://bd-tips.vercel.app/library.html"
    },
    {
      subject: `Luyện phản xạ thực chiến ngày ${dayName}! 🦉`,
      message: `Chào Chiến thần B2B!<br><br>Bản tin kinh tế: "${newsTitle}". Hãy dành 2 phút giải trí và rèn luyện phản xạ xử lý từ chối cùng <b>Minigame B2B Challenge</b> để tích lũy điểm đổi quà nhé!`,
      buttonText: "🎮 Chơi Game Thực Chiến",
      buttonUrl: "https://bd-tips.vercel.app/#minigame-section"
    }
  ];

  let template = fallbackTemplates[dayOfYear % fallbackTemplates.length];
  template.mascot = selectedMascot;

  // 5. Try generating personalized context email using Gemini 2.5 Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const systemPrompt = `Bạn là trợ lý Cú BeeDee của B2B BD Tips Portal.
Nhiệm vụ của bạn là viết một email ngắn gọn nhắc nhở học viên BD rèn luyện mỗi ngày.

YÊU CẦU:
1. Nội dung phải cực kỳ NGẮN GỌN (tối đa 2 đến 3 câu ngắn), phong cách thân thiện, thực chiến, pha chút hài hước của dân Sales B2B (lead, deal, PIC, pipeline, cold email...).
2. Phải lồng ghép thông tin ngữ cảnh thời gian/thời tiết thực tế sau đây:
   - Ngày trong tuần: ${dayName}
   - Thời tiết: ${weatherDesc}
   - Nhiệt độ: ${temp}°C
   - Tin tức kinh tế nóng trong ngày: "${newsTitle}"
3. Phải điều hướng người dùng click nút CTA để trải nghiệm 1 trong các công cụ thực chiến trên web:
   - Pitching & Thuyết Trình AI (https://bd-tips.vercel.app/pitching.html)
   - AI Cold Email Assistant (https://bd-tips.vercel.app/email-assistant.html)
   - Minigame B2B Challenge (https://bd-tips.vercel.app/#minigame-section)
   - Công cụ Tính Lương & Tra Luật Lao Động (https://bd-tips.vercel.app/salary.html)
   - Thư Viện Ebook BD (https://bd-tips.vercel.app/library.html)

ĐỊNG DẠNG ĐẦU RA: Trả về duy nhất một chuỗi JSON (không bọc trong tag code markdown) có cấu trúc như sau:
{
  "subject": "Tiêu đề email ngắn gọn, thu hút kèm emoji phù hợp",
  "message": "Nội dung email viết bằng HTML ngắn gọn (2-3 câu, dùng <br> để xuống dòng, không dùng ký tự markdown như ** hay #)",
  "buttonText": "Tên nút kêu gọi hành động (CTA)",
  "buttonUrl": "Đường dẫn tuyệt đối tương ứng với công cụ được chọn"
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
            template = {
              subject: parsed.subject,
              message: parsed.message,
              buttonText: parsed.buttonText,
              buttonUrl: parsed.buttonUrl,
              mascot: selectedMascot
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

  const demoEmail = req.query.email || 'hocvien@gmail.com';
  const demoName = req.query.name || 'Chiến thần B2B';

  const subject = template.subject;
  const bodyText = getHtmlTemplate(template.message, template.buttonText, template.buttonUrl, template.mascot);

  // Load all registered users from the simulated local database
  const users = readUsers();
  let recipients = Object.values(users).filter(u => u.email && u.email.includes('@'));

  // If no users found, fall back to the demo recipient
  if (recipients.length === 0) {
    recipients.push({ email: demoEmail, name: demoName });
  }

  // If we are overriding for testing via ?email=...
  if (req.query.email) {
    recipients = [{ email: req.query.email, name: req.query.name || 'Chiến thần B2B' }];
  }

  console.log(`[DAILY_EMAIL_CRON] Dispatching to ${recipients.length} recipients...`);
  console.log(`[DAILY_EMAIL_CRON] Subject: ${subject}`);

  const BATCH_SIZE = 50;
  const DELAY_BETWEEN_BATCHES = 2000;
  const dispatchLogs = [];
  let triggeredWebhook = false;

  const webhookUrl = process.env.GOOGLE_SHEET_LEADS_WEBHOOK;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const currentBatch = recipients.slice(i, i + BATCH_SIZE);
    console.log(`[DAILY_EMAIL_CRON] Sending Batch ${Math.floor(i / BATCH_SIZE) + 1} (${currentBatch.length} emails)...`);

    const batchPromises = currentBatch.map(async (recipient) => {
      const personalizedBody = bodyText.replace(/Chiến thần B2B/g, recipient.name || 'Chiến thần B2B');
      
      if (webhookUrl) {
        try {
          const emailRes = await httpPost(webhookUrl, {
            action: 'sendSingleEmail',
            to: recipient.email,
            name: recipient.name,
            subject: subject,
            body: personalizedBody
          });
          const resText = await emailRes.text();
          triggeredWebhook = true;
          return { email: recipient.email, success: true, detail: resText };
        } catch (err) {
          console.error(`[DAILY_EMAIL_CRON_ERROR] Failed for ${recipient.email}:`, err.message);
          return { email: recipient.email, success: false, error: err.message };
        }
      } else {
        return { email: recipient.email, success: true, detail: 'Mock send successful (Dev mode)' };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    dispatchLogs.push(...batchResults);

    if (i + BATCH_SIZE < recipients.length) {
      console.log(`[DAILY_EMAIL_CRON] Throttling for ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  let fallbackResponse = '';
  if (webhookUrl && !triggeredWebhook) {
    try {
      const response = await httpPost(webhookUrl, { 
        action: 'sendDailyEmails', 
        subject: subject, 
        body: bodyText 
      });
      fallbackResponse = await response.text();
      triggeredWebhook = true;
    } catch (err) {
      console.error(`[DAILY_EMAIL_CRON_ERROR] Fallback webhook failed:`, err);
    }
  }

  return res.status(200).json({
    success: true,
    message: `Daily emails processed. Dispatched ${dispatchLogs.length} messages.`,
    triggeredWebhook: triggeredWebhook,
    fallbackResponse: fallbackResponse,
    dispatchLogs: dispatchLogs.slice(0, 10),
    totalSent: dispatchLogs.length,
    context: {
      temp,
      weatherDesc,
      newsTitle,
      mascot: template.mascot
    }
  });
};
