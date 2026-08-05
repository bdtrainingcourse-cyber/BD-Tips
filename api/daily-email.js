const https = require('https');

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

// Customized templates with real-time contexts (weather, BD struggles, hot trends)
// and mapping to specific website features.
const emailTemplates = [
  {
    subject: "Nắng 40 độ nhưng Pipeline của bạn vẫn đóng băng? ❄️",
    message: "Chào Chiến thần B2B!<br><br>Hôm nay ngoài trời nắng nóng đỉnh điểm, dắt xe ra đường là mồ hôi đầm đìa. Nhưng nóng nhất lúc này chắc chắn là tin nhắn của sếp dí KPI hỏi: <i>\"Hôm nay tìm được bao nhiêu thông tin liên hệ (PIC) của đối tác rồi em?\"</i>.<br><br>Đừng để nhiệt độ văn phòng tăng thêm vì sếp gầm rú! Hãy bật điều hòa lên, uống một ngụm trà sữa mát lạnh và dùng ngay công cụ <b>B2B LinkedIn PIC Finder</b> của chúng tôi để quét ra email sếp tổng doanh nghiệp mục tiêu chỉ trong 5 giây. Có số báo cáo sếp ngay lập tức!<br><br>Quét xong, đừng quên click qua mục <b>B2B Challenge</b> giải trắc nghiệm thực chiến để duy trì chuỗi Streak rèn luyện nhé!",
    buttonText: "🔍 Tìm PIC Doanh Nghiệp Ngay",
    buttonUrl: "https://bd-tips.vercel.app/finder.html",
    mascot: "https://bd-tips.vercel.app/mascot_hot.jpg"
  },
  {
    subject: "Mưa rơi ướt áo, đừng để cold email bị ghost! 🌧️",
    message: "Chào Chiến thần B2B!<br><br>Trời đang đổ mưa giông ngoài cửa sổ, ngồi ngắm mưa ngẫm sự đời thì lãng mạn đấy, nhưng ngắm hòm thư gửi đi trống trơn không một lời hồi âm từ khách hàng thì chỉ thấy lòng giông bão. Sao email chào hàng Enterprise gửi đi cứ như muối bỏ bể vậy ta?<br><br>Thay vì ngồi \"suy\" một mình, hãy để trợ lý trí tuệ nhân tạo <b>AI Cold Email Assistant</b> viết hộ bạn những bản nháp email chào hàng cực sắc bén, đánh trúng trực tiếp nỗi đau của đối tác Enterprise. Soạn nhanh gấp 10 lần, nâng tỷ lệ mở thư và phản hồi vượt trội!<br><br>Soạn xong email, hãy click qua mục <b>Tính Lương & Hoa Hồng</b> để quy đổi thu nhập tháng này xem chốt deal xong có được tăng thưởng không nhé!",
    buttonText: "✍️ Soạn Cold Email Bằng AI",
    buttonUrl: "https://bd-tips.vercel.app/email-assistant.html",
    mascot: "https://bd-tips.vercel.app/mascot_rain.jpg"
  },
  {
    subject: "Sếp đang 'flex' KPI, bạn đã sẵn sàng 'chữa lành' chưa? 🦉",
    message: "Chào Chiến thần B2B!<br><br>Trong khi mạng xã hội rầm rộ trào lưu \"flexing\" thành tựu, sếp bạn cũng vừa nhẹ nhàng flex bảng KPI đỏ lòm của tháng này kèm lời nhắn nhủ đầy áp lực. Bạn định lên kế hoạch đi Đà Lạt để \"chữa lành\" tâm hồn sao? Không đâu, thứ duy nhất chữa lành ví tiền lúc này là kỹ năng chốt deal thực chiến!<br><br>Hãy vào ngay <b>B2B Challenge (Minigame)</b> để rèn luyện 3 phút với các tình huống xử lý từ chối hóc búa nhất. Vừa chơi game giải trí, vừa tích điểm đổi quà, lại có thêm kịch bản sắc bén để đối phó với khách hàng.<br><br>Rèn luyện xong, hãy ghé qua <b>Thư viện BD</b> để hấp thụ các chia sẻ thực tế từ anh Peter Vo nhé!",
    buttonText: "🎮 Chơi Game Thực Chiến Ngay",
    buttonUrl: "https://bd-tips.vercel.app/#minigame-section",
    mascot: "https://bd-tips.vercel.app/mascot_challenge.jpg"
  },
  {
    subject: "Thợ săn tiền thưởng quyết không để 'quỵt' hoa hồng! 💸",
    message: "Chào Chiến thần B2B!<br><br>Làm BD vất vả ngày đêm, đi tiếp khách uống cạn ly, đàm phán trầy da tróc vảy chốt hợp đồng. Nhưng đến cuối tháng bảng tính lương gửi về lại mập mờ, hoa hồng bị tính hụt làm bạn muốn hướng nội luôn?<br><br>Đừng im lặng chịu thiệt! Hãy sử dụng ngay công cụ <b>Tính Lương Gross-Net & Tra Cứu Luật Lao Động</b> để quy đổi chuẩn xác và tra cứu nhanh 15 tình huống tranh chấp thực tế (như nợ commission, ép doanh số thử việc...). Ngôn từ sắc bén của luật sẽ bảo vệ thành quả lao động của bạn!<br><br>Sau khi tính toán xong, hãy ghé qua <b>Diễn đàn Cộng đồng</b> để cùng thảo luận chia sẻ kinh nghiệm nhé!",
    buttonText: "🧮 Tính Lương & Tra Luật Ngay",
    buttonUrl: "https://bd-tips.vercel.app/salary.html",
    mascot: "https://bd-tips.vercel.app/mascot_law.jpg"
  },
  {
    subject: "Khi khách hàng bỗng hóa thành 'hư vô'... 👻",
    message: "Chào Chiến thần B2B!<br><br>Khách hàng hứa hẹn \"thứ Hai anh ký hợp đồng\", nhưng giờ đã là thứ Sáu và họ bỗng hóa thành \"hư vô\", nhắn tin không rep, gọi điện thuê bao. Cảm giác này còn đau đớn hơn cả bị người yêu cũ block đúng không?<br><br>Đừng nản lòng! Hãy truy cập mục <b>Thư Viện BD B2B</b> để xem các bài viết hướng dẫn độc quyền từ anh Peter Vo về cách \"kéo xác\" các lead đã nguội lạnh, cách bám đuổi (follow-up) khách hàng tinh tế mà hiệu quả.<br><br>Tìm hiểu xong, hãy rèn luyện nhanh một câu hỏi trong <b>B2B Challenge</b> để giữ vững chuỗi Streak nhận trà sữa miễn phí mốc 7 ngày của bạn nào!",
    buttonText: "📚 Đọc Case-Study Thực Chiến",
    buttonUrl: "https://bd-tips.vercel.app/library.html",
    mascot: "https://bd-tips.vercel.app/mascot_ghost.jpg"
  },
  {
    subject: "Một ly trà sữa chiều hay một topic thảo luận BD chất lượng? 🧋",
    message: "Chào Chiến thần B2B!<br><br>Tầm này chiều rồi, bụng cồn cào và não bộ đang phát đi tín hiệu khẩn cấp: <i>\"Cần gấp một ly trà sữa full topping để nạp năng lượng!\"</i>. Nhưng trong lúc chờ shipper giao tới, tại sao không nâng tầm tư duy chốt deal của mình?<br><br>Ghé ngay <b>Diễn đàn Cộng đồng B2B BD Tips</b> để kết nối, thảo luận các chủ đề nóng hổi về nghề BD, cách đàm phán hợp đồng hoặc chia sẻ câu chuyện dở khóc dở cười hàng ngày. Giao lưu học hỏi từ những người đi trước là lối tắt dẫn đến thành công!<br><br>Đồng thời, trọn bộ công cụ hỗ trợ như <b>AI Cold Email Assistant</b> và <b>B2B PIC Finder</b> vẫn luôn sẵn sàng phục vụ bạn!",
    buttonText: "💬 Tham Gia Thảo Luận Cộng Đồng",
    buttonUrl: "https://bd-tips.vercel.app/community.html",
    mascot: "https://bd-tips.vercel.app/mascot_milktea.jpg"
  },
  {
    subject: "Thời tiết giông bão, nhưng Pipeline phải luôn rực rỡ! ⛈️",
    message: "Chào Chiến thần B2B!<br><br>Ngoài trời mây đen kéo lối, giông bão sắp đổ bộ. Nhưng giông bão thời tiết không đáng sợ bằng \"giông bão\" trong pipeline của bạn khi không có bất kỳ deal mới nào trong phễu.<br><br>Hãy biến ngày mưa bão thành ngày bùng nổ doanh số! Hệ sinh thái hỗ trợ BD của chúng tôi đã online đầy đủ: Tìm email sếp lớn bằng <b>B2B LinkedIn PIC Finder</b>, soạn email tự động bằng <b>AI Cold Email Assistant</b>, kiểm tra hợp đồng bằng <b>Luật Lao Động</b> và trau dồi bài học tại <b>Thư Viện</b>.<br><br>Hãy làm một thử thách game hôm nay để giữ chuỗi ngày Streak nhận buổi ăn trưa tri ân cùng anh Peter Vo nào!",
    buttonText: "🌐 Khám Phá Hệ Sinh Thái BD",
    buttonUrl: "https://bd-tips.vercel.app/quests.html",
    mascot: "https://bd-tips.vercel.app/mascot_storm.jpg"
  }
];

const fridayMorningTemplate = {
  subject: "Thứ 6 rồi! Cùng share chuyện vui lên cộng đồng nào! 🧋✨",
  message: "Chào Chiến thần B2B!<br><br>Cuối cùng thì ngày thứ 6 mong đợi cũng đã tới! Một tuần làm việc bận rộn sắp qua đi. Hãy bắt đầu ngày làm việc cuối tuần bằng một nguồn năng lượng tích cực nhất nhé.<br><br>Hôm nay, sếp có dí KPI hay khách hàng có ghost thì cũng đừng lo! Hãy ghé ngay <b>Diễn đàn Cộng đồng</b> để chia sẻ những mẫu chuyện vui, những tình huống hài hước hoặc những meme thú vị mà bạn gặp phải trong tuần qua. Chia sẻ niềm vui sẽ nhân đôi niềm vui!<br><br>Đặc biệt, chiều nay lúc 6h00 sẽ có một món quà email cực kỳ hài hước để bạn giải tỏa mọi stress trước khi nghỉ cuối tuần đấy. Hóng nhé!",
  buttonText: "💬 Chia Sẻ Chuyện Vui Ngay",
  buttonUrl: "https://bd-tips.vercel.app/community.html",
  mascot: "https://bd-tips.vercel.app/mascot_milktea.jpg"
};

const fridayEveningTemplate = {
  subject: "Cuối tuần rồi! Xả stress cực mạnh cùng Cú BeeDee thôi! 🦉🎉",
  message: "Chào Chiến thần B2B!<br><br>Keng keng keng! 6h00 chiều thứ Sáu đã điểm, giờ G đã tới! Hãy đóng laptop lại, cất hết deadline sang một bên và chuẩn bị tận hưởng kỳ nghỉ cuối tuần trọn vẹn nào.<br><br>Để giúp bạn xả stress cực mạnh sau một tuần 'săn lead' mệt mỏi, Cú BeeDee đã chuẩn bị sẵn một câu chuyện cười thực chiến BD cực kỳ 'mặn mòi' tại <b>Thư viện BD</b>. Hãy đọc để giải trí và nạp lại năng lượng nhé!<br><br>Chúc bạn có hai ngày cuối tuần ngập tràn niềm vui, không deadline, không check mail và sẵn sàng bung xõa!",
  buttonText: "🤪 Đọc Chuyện Cười BD & Relax",
  buttonUrl: "https://bd-tips.vercel.app/library.html",
  mascot: "https://bd-tips.vercel.app/mascot_relax.jpg"
};

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
  
  // Decide which template to use based on day of week and hour
  let template;
  let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

  if (isWeekend && !req.query.force) {
    return res.status(200).json({
      success: true,
      message: "No emails scheduled on weekends (Saturday and Sunday)."
    });
  }

  const hour = now.getUTCHours();    // 0 to 23
  if (dayOfWeek === 5) {
    // Friday
    const isEvening = req.query.time ? (req.query.time === 'evening') : (hour >= 12);
    if (isEvening) {
      template = fridayEveningTemplate;
    } else {
      template = fridayMorningTemplate;
    }
  } else {
    // Monday - Thursday (or forced weekend tests)
    template = emailTemplates[dayOfYear % emailTemplates.length];
  }

  const demoEmail = req.query.email || 'hocvien@gmail.com';
  const demoName = req.query.name || 'Chiến thần B2B';

  const subject = template.subject;
  const bodyText = getHtmlTemplate(template.message, template.buttonText, template.buttonUrl, template.mascot);

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
