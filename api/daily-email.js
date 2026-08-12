const https = require('https');
const { readUsers } = require('./db-helper');

/**
 * =========================================================================
 * B2B PORTAL - HƯỚNG DẪN CẤU HÌNH GỬI EMAIL SỐ LƯỢNG LỚN (ANTI-SPAM & REPUTATION)
 * =========================================================================
 * Khi số lượng người dùng đăng ký tăng lên hàng nghìn, việc gửi email đồng loạt 
 * rất dễ bị hệ thống lọc thư rác (như Gmail, Outlook) đánh dấu là Spam/Spammer.
 * 
 * Để bảo vệ tên miền và đảm bảo tỷ lệ vào Inbox đạt 99%, cần tuân thủ các quy tắc sau:
 * 
 * 1. Cấu hình DNS Đầy Đủ (Domain Authentication):
 *    - SPF (Sender Policy Framework): Khai báo các máy chủ được phép gửi email thay mặt tên miền.
 *      Ví dụ: v=spf1 include:sendgrid.net ~all
 *    - DKIM (DomainKeys Identified Mail): Ký chữ ký số mật mã vào tiêu đề email để chứng minh thư 
 *      không bị thay đổi trên đường truyền.
 *    - DMARC (Domain-based Message Authentication): Thiết lập quy tắc xử lý khi SPF hoặc DKIM thất bại.
 *      Ví dụ: v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@yourdomain.com
 * 
 * 2. Sử dụng Máy chủ gửi Email Uy Tín (Email Service Provider - ESP):
 *    - Không tự gửi email trực tiếp từ server Node.js thông qua SMTP mặc định.
 *    - Hãy tích hợp các ESP chuyên dụng như SendGrid, Mailgun, Amazon SES hoặc Postmark.
 *    - Khi bắt đầu, sử dụng dải IP "ấm" (Warm-up IP) tăng dần số lượng email gửi đi mỗi ngày.
 * 
 * 3. Kỹ Thuật Chia Mẻ và Giãn Cách Tần Suất Gửi (Batching & Throttling):
 *    - Thay vì gửi hàng nghìn request đồng thời làm nghẽn API/Connection, ta chia danh sách 
 *      người nhận thành các lô nhỏ (Ví dụ: 50 email mỗi đợt - BATCH_SIZE = 50).
 *    - Giữa các đợt, chèn một khoảng trễ (Ví dụ: 2 giây - DELAY = 2000ms) để hệ thống giãn cách.
 * 
 * 4. Tối Ưu Nội Dung & Tương Tác:
 *    - Thêm link "Hủy đăng ký" (Unsubscribe) rõ ràng ở chân trang.
 *    - Cá nhân hóa nội dung: sử dụng đúng tên, nickname của từng học viên để tránh gửi 1 template giống hệt nhau.
 * =========================================================================
 */

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
    message: "Chào Chiến thần B2B!<br><br>Hôm nay ngoài trời nắng nóng đỉnh điểm, dắt xe ra đường là mồ hôi đầm đìa. Nhưng nóng nhất lúc này chắc chắn là tin nhắn của sếp dí hỏi: <i>\"Hôm nay đã chuẩn bị xong kịch bản Pitching giải pháp cho đối tác Enterprise chưa em?\"</i>.<br><br>Đừng để nhiệt độ văn phòng tăng thêm vì sếp gầm rú! Hãy bật điều hòa lên, uống một ngụm trà sữa mát lạnh và dùng ngay công cụ <b>Thuyết Trình & Pitching AI</b> của chúng tôi để tạo nhanh dàn ý và kịch bản pitching thuyết phục chỉ trong 5 giây. Đảm bảo sếp gật đầu cái rụp!<br><br>Chuẩn bị xong, đừng quên click qua mục <b>B2B Challenge</b> giải trắc nghiệm thực chiến để duy trì chuỗi Streak rèn luyện nhé!",
    buttonText: "🎤 Pitching & Thuyết Trình AI Ngay",
    buttonUrl: "https://bd-tips.vercel.app/pitching.html",
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
    message: "Chào Chiến thần B2B!<br><br>Tầm này chiều rồi, bụng cồn cào và não bộ đang phát đi tín hiệu khẩn cấp: <i>\"Cần gấp một ly trà sữa full topping để nạp năng lượng!\"</i>. Nhưng trong lúc chờ shipper giao tới, tại sao không nâng tầm tư duy chốt deal của mình?<br><br>Ghé ngay <b>Diễn đàn Cộng đồng B2B BD Tips</b> để kết nối, thảo luận các chủ đề nóng hổi về nghề BD, cách đàm phán hợp đồng hoặc chia sẻ câu chuyện dở khóc dở cười hàng ngày. Giao lưu học hỏi từ những người đi trước là lối tắt dẫn đến thành công!<br><br>Đồng thời, trọn bộ công cụ hỗ trợ như <b>AI Cold Email Assistant</b> và <b>Pitching AI</b> vẫn luôn sẵn sàng phục vụ bạn!",
    buttonText: "💬 Tham Gia Thảo Luận Cộng Đồng",
    buttonUrl: "https://bd-tips.vercel.app/community.html",
    mascot: "https://bd-tips.vercel.app/mascot_milktea.jpg"
  },
  {
    subject: "Thời tiết giông bão, nhưng Pipeline phải luôn rực rỡ! ⛈️",
    message: "Chào Chiến thần B2B!<br><br>Ngoài trời mây đen kéo lối, giông bão sắp đổ bộ. Nhưng giông bão thời tiết không đáng sợ bằng \"giông bão\" trong pipeline của bạn khi không có bất kỳ deal mới nào trong phễu.<br><br>Hãy biến ngày mưa bão thành ngày bùng nổ doanh số! Hệ sinh thái hỗ trợ BD của chúng tôi đã online đầy đủ: Luyện tập đối thoại thực chiến cùng <b>Pitching AI</b>, soạn email tự động bằng <b>AI Cold Email Assistant</b>, kiểm tra hợp đồng bằng <b>Luật Lao Động</b> và trau dồi bài học tại <b>Thư Viện</b>.<br><br>Hãy làm một thử thách game hôm nay để giữ chuỗi ngày Streak nhận buổi ăn trưa tri ân cùng anh Peter Vo nào!",
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
  const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay to avoid email/API rate limit block
  const dispatchLogs = [];
  let triggeredWebhook = false;

  const webhookUrl = process.env.GOOGLE_SHEET_LEADS_WEBHOOK;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const currentBatch = recipients.slice(i, i + BATCH_SIZE);
    console.log(`[DAILY_EMAIL_CRON] Sending Batch ${Math.floor(i / BATCH_SIZE) + 1} (${currentBatch.length} emails)...`);

    const batchPromises = currentBatch.map(async (recipient) => {
      // Personalize content slightly for each recipient
      const personalizedBody = bodyText.replace(/Chiến thần B2B/g, recipient.name || 'Chiến thần B2B');
      
      if (webhookUrl) {
        try {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sendSingleEmail',
              to: recipient.email,
              name: recipient.name,
              subject: subject,
              body: personalizedBody
            })
          });
          const resText = await res.text();
          triggeredWebhook = true;
          return { email: recipient.email, success: true, detail: resText };
        } catch (err) {
          console.error(`[DAILY_EMAIL_CRON_ERROR] Failed for ${recipient.email}:`, err.message);
          return { email: recipient.email, success: false, error: err.message };
        }
      } else {
        // Mock send logs for dev environment
        return { email: recipient.email, success: true, detail: 'Mock send successful (Dev mode)' };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    dispatchLogs.push(...batchResults);

    // Throttle delay before next batch, unless it's the last batch
    if (i + BATCH_SIZE < recipients.length) {
      console.log(`[DAILY_EMAIL_CRON] Throttling for ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  // Trigger fallback bulk send if no single emails succeeded but webhook is set (backward compatibility)
  let fallbackResponse = '';
  if (webhookUrl && !triggeredWebhook) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sendDailyEmails', 
          subject: subject, 
          body: bodyText 
        })
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
    dispatchLogs: dispatchLogs.slice(0, 10), // Limit returned logs preview
    totalSent: dispatchLogs.length
  });
};
