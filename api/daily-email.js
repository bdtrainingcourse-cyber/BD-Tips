const https = require('https');

// Helper to wrap message in a premium dark-themed HTML template
function getHtmlTemplate(message, buttonText, buttonUrl) {
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
      background-color: #0c0707;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc;
    }
    .email-container {
      max-width: 500px;
      margin: 30px auto;
      background-color: #180f0f;
      border: 1.5px solid #f3a83b;
      border-radius: 20px;
      padding: 30px 25px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.55);
    }
    .mascot-container {
      margin-bottom: 20px;
    }
    .mascot-img {
      width: 90px;
      height: 90px;
      object-fit: contain;
    }
    .headline {
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 15px 0;
      line-height: 1.3;
    }
    .content-text {
      font-size: 0.92rem;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0 0 25px 0;
      text-align: left;
    }
    .cta-container {
      margin: 25px 0;
    }
    .cta-btn {
      display: inline-block;
      padding: 13px 30px;
      background: linear-gradient(135deg, #f3a83b 0%, #d97706 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 800;
      font-size: 0.85rem;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(243, 168, 59, 0.45);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .footer-text {
      font-size: 0.75rem;
      color: #94a3b8;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
      margin-top: 20px;
      line-height: 1.4;
      text-align: center;
    }
    .accent-link {
      color: #f3a83b;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="mascot-container">
      <img src="https://bd-tips.vercel.app/bd_mascot.png" class="mascot-img" alt="Cú BeeDee">
    </div>
    <div class="headline">Tín hiệu từ Cú BeeDee! 🦉</div>
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

// Customized funny Duolingo-style email templates for BD B2B tools
const emailTemplates = [
  {
    subject: "Cú BeeDee đang nhìn bạn... 🦉",
    message: "Chào Chiến thần B2B!<br><br>Hôm qua bạn không vào ôn luyện B2B Challenge. Cú BeeDee buồn phát khóc rồi đây này. Đừng để chú cú đáng yêu này biến thành cú dữ đi đòi nợ kiến thức nhé!<br><br>Bật mí: Hôm nay có tình huống xử lý từ chối mới cực hay trong game, vào xem ngay đi!",
    buttonText: "⚡ Chiến Game Ngay",
    buttonUrl: "https://bd-tips.vercel.app/#minigame-section"
  },
  {
    subject: "Học BD không khó, bỏ cuộc mới khó giải thích với sếp! 💼",
    message: "Chào Chiến thần B2B!<br><br>Lại một ngày trôi qua và bảng vàng Chiến Thần B2B vẫn chưa thấy tên bạn. Đối thủ của bạn đang tăng trưởng vù vù, còn bạn thì đang bận... lướt TikTok?<br><br>Hãy bắt đầu ôn luyện ngay hôm nay để nâng trình thực chiến!",
    buttonText: "🚀 Luyện Tập Ngay",
    buttonUrl: "https://bd-tips.vercel.app/"
  },
  {
    subject: "Ủa, bạn block Cú BeeDee rồi hả? 😭",
    message: "Ủa Chiến thần B2B ơi, bạn quên Cú BeeDee rồi đúng không? Cơn giận của Cú BeeDee đang tích tụ đấy.<br><br>Chỉ 3 phút mỗi ngày để nâng cấp tư duy BD, đừng để bộ óc bị rỉ sét nhé! Vào giải quyết một tình huống đi nào!",
    buttonText: "🧠 Giải Quyết Tình Huống",
    buttonUrl: "https://bd-tips.vercel.app/#minigame-section"
  },
  {
    subject: "Tài khoản của bạn sắp đóng băng! ❄️",
    message: "Này Chiến thần B2B!<br><br>Cú BeeDee vừa check CRM và thấy tài khoản của bạn đã đóng băng 4 ngày rồi. Đừng bắt BeeDee phải gọi điện lạnh (cold-calling) trực tiếp cho bạn nhé!<br><br>Lưu ý: Bạn chỉ còn cách cốc trà sữa miễn phí (mốc 7 ngày) hoặc buổi ăn trưa với anh Peter (mốc 30 ngày) vài ngày streak nữa thôi. Giữ streak ngay!",
    buttonText: "🔥 Giữ Streak Ngay",
    buttonUrl: "https://bd-tips.vercel.app/quests.html"
  },
  {
    subject: "Cú BeeDee gửi tín hiệu vũ trụ tới bạn... ✨",
    message: "Chào Chiến thần B2B,<br><br>Hôm nay anh Peter Vo vừa viết thêm bài chia sẻ thực chiến mới trong mục B2B Challenge. Vào đọc vị nỗi đau khách hàng và lấy điểm chốt hợp đồng ngay!",
    buttonText: "📈 Đọc Bài Viết Mới",
    buttonUrl: "https://bd-tips.vercel.app/library.html"
  },
  {
    subject: "Làm Chiến Thần B2B hay làm BD chạy bằng cơm? 🤖",
    message: "Chào Chiến thần B2B!<br><br>Công cụ \"AI Email Assistant\" vừa được nâng cấp giúp viết cold email nhanh gấp 10 lần. Bạn định tiếp tục viết tay từng cái một sao?<br><br>Vào trải nghiệm và làm game B2B Challenge ngay để tích lũy streak nhận trà sữa miễn phí nhé!",
    buttonText: "✉️ Thử AI Email Assistant",
    buttonUrl: "https://bd-tips.vercel.app/email-assistant.html"
  },
  {
    subject: "Tin mật: Đối thủ của bạn vừa vào ôn luyện! 🤫",
    message: "Này Chiến thần B2B!<br><br>Cú BeeDee vừa phát hiện đối thủ cạnh tranh của bạn đã đạt Streak 10 ngày rồi đấy. Bạn có muốn bị tụt lại phía sau trong cuộc đua chốt deal triệu đô không?<br><br>Hãy dùng thử công cụ \"B2B LinkedIn PIC Finder\" để tìm email sếp tổng doanh nghiệp mục tiêu chỉ trong 5 giây!",
    buttonText: "🔍 Thử B2B PIC Finder",
    buttonUrl: "https://bd-tips.vercel.app/finder.html"
  },
  {
    subject: "Có một email chưa gửi đang chờ bạn... ✉️",
    message: "Chào Chiến thần B2B!<br><br>Công cụ \"AI Email Assistant\" của bạn đang trống trải quá. Có phải bạn đang bí ý tưởng viết cold email tiếp cận khách hàng Enterprise?<br><br>Vào để AI viết hộ bạn bản nháp siêu chuyên nghiệp và tích thêm Streak nhé!",
    buttonText: "✍️ Viết Email Bằng AI",
    buttonUrl: "https://bd-tips.vercel.app/email-assistant.html"
  },
  {
    subject: "Đừng để sếp hỏi: 'Hôm nay em tìm được bao nhiêu PIC?' 😰",
    message: "Chào Chiến thần B2B!<br><br>Đừng làm sếp thất vọng khi báo cáo cuối tuần nhé. Hãy để công cụ \"B2B LinkedIn PIC Finder\" hỗ trợ bạn tìm đúng người có quyền quyết định (PIC) của đối tác.",
    buttonText: "🔍 Tìm PIC Doanh Nghiệp",
    buttonUrl: "https://bd-tips.vercel.app/finder.html"
  },
  {
    subject: "15 Tình huống Luật Lao Động bạn đã nắm hết chưa? ⚖️",
    message: "Chào Chiến thần B2B!<br><br>Hết thử việc mà công ty im lặng thì có được tính là nhân viên chính thức? Đi trễ bị trừ lương có đúng luật?<br><br>Cú BeeDee đã tổng hợp 15 tình huống thực tế siêu hot giúp bảo vệ quyền lợi của dân BD B2B tại đây!",
    buttonText: "⚖️ Tra Cứu Luật Lao Động",
    buttonUrl: "https://bd-tips.vercel.app/labor-law.html"
  },
  {
    subject: "Cú BeeDee tặng bạn một chiếc ảnh avatar siêu năng lượng! 🦉",
    message: "Chào Chiến thần B2B!<br><br>Chỉ cần 3 phút làm game B2B Challenge, bạn sẽ tự tin hơn khi pitching trước đối tác lớn. Cú BeeDee gửi bạn chiếc ảnh avatar siêu năng lượng học tập hôm nay!",
    buttonText: "🎮 Chơi B2B Challenge",
    buttonUrl: "https://bd-tips.vercel.app/"
  },
  {
    subject: "Cách tính hoa hồng BD B2B tháng này của bạn? 💸",
    message: "Chào Chiến thần B2B!<br><br>Bạn đã biết cách quy đổi lương từ Gross sang Net chính xác và tính xem mức hoa hồng thực nhận của mình chưa?<br><br>Sử dụng Công cụ Tính Lương thông minh ngay để quy đổi chuẩn xác!",
    buttonText: "🧮 Tính Lương & Hoa Hồng",
    buttonUrl: "https://bd-tips.vercel.app/salary.html"
  },
  {
    subject: "Anh Peter Vo vừa chia sẻ bài viết mới trên LinkedIn! 📰",
    message: "Chào Chiến thần B2B!<br><br>Một bài phân tích thực chiến cực sâu về cách tiếp cận khách hàng B2B khó tính vừa được đồng bộ về thư viện.",
    buttonText: "📚 Vào Đọc Thư Viện",
    buttonUrl: "https://bd-tips.vercel.app/library.html"
  },
  {
    subject: "Chỉ còn vài ngày nữa là được gặp anh Peter Vo! ☕",
    message: "Chào Chiến thần B2B!<br><br>Bạn đã đạt được bao nhiêu ngày streak liên tục rồi? Mốc 14 ngày tư vấn 1on1 online và mốc 30 ngày ăn trưa cùng anh Peter đang rất gần rồi đó.<br><br>Cú BeeDee chúc bạn một ngày làm việc hiệu quả và chốt được nhiều deal!",
    buttonText: "🎯 Xem Mốc Điểm Quà",
    buttonUrl: "https://bd-tips.vercel.app/quests.html"
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Choose a random template
  const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
  const demoEmail = req.query.email || 'hocvien@gmail.com';
  const demoName = req.query.name || 'Chiến thần B2B';

  const subject = template.subject;
  const bodyText = getHtmlTemplate(template.message, template.buttonText, template.buttonUrl);

  // In production, sync with Google Sheets CRM webhook and send out emails.
  console.log(`[DAILY_EMAIL_CRON] Target: ${demoEmail}, Name: ${demoName}`);
  console.log(`[DAILY_EMAIL_CRON] Subject: ${subject}`);

  let triggeredWebhook = false;
  let webhookResponse = '';

  if (process.env.GOOGLE_SHEET_LEADS_WEBHOOK) {
    try {
      const response = await fetch(process.env.GOOGLE_SHEET_LEADS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sendDailyEmails', 
          subject: subject, 
          body: bodyText 
        })
      });
      webhookResponse = await response.text();
      console.log(`[DAILY_EMAIL_CRON] Google Sheets webhook triggered. Response: ${webhookResponse}`);
      triggeredWebhook = true;
    } catch (err) {
      console.error(`[DAILY_EMAIL_CRON_ERROR] Failed to trigger Google Sheets webhook:`, err);
      webhookResponse = err.message;
    }
  } else {
    console.warn(`[DAILY_EMAIL_CRON_WARN] GOOGLE_SHEET_LEADS_WEBHOOK is not configured.`);
    webhookResponse = 'Webhook URL not configured in process.env';
  }

  return res.status(200).json({
    success: true,
    message: "Daily emails processed successfully.",
    triggeredWebhook: triggeredWebhook,
    webhookResponse: webhookResponse,
    sampleSent: {
      to: demoEmail,
      name: demoName,
      subject: subject,
      body: bodyText
    }
  });
};
