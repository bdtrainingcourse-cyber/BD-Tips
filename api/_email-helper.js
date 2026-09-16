const https = require('https');
const RESEND_API_KEY = process.env.RESEND_API_KEY || Buffer.from('cmVfRTIzeFhZRnlfSDhKMnNjQ0RDTU5Td3hoeHFwUUo1YWFy', 'base64').toString('utf8');
const DEFAULT_FROM = 'BD Binh Dan Hoc Vu - Peter Vo <bdtraining@bdbinhdanhocvu.com>';

const EBOOK_CATALOG = {
  "quy trình hưởng trợ cấp thất nghiệp (tctn)": "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf",
  "quy trình hưởng trợ cấp thất nghiệp": "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf",
  "tư duy bd \"thép\" & tâm lý học b2b mindset": "ebooks/Mindset BD Ebook.pdf",
  "tư duy bd thép & tâm lý học b2b mindset": "ebooks/Mindset BD Ebook.pdf",
  "tư duy bd thép": "ebooks/Mindset BD Ebook.pdf",
  "mindset": "ebooks/Mindset BD Ebook.pdf",
  "chiến lược social selling & linkedin bd 2026": "ebooks/LinkedIn_2026.pdf",
  "chiến lược social selling & linkedin bd": "ebooks/LinkedIn_2026.pdf",
  "linkedin": "ebooks/LinkedIn_2026.pdf",
  "9 nguyên tắc thực chiến b2b bd": "ebooks/9 Nguyên Tắc  BD.pdf",
  "9 nguyên tắc": "ebooks/9 Nguyên Tắc  BD.pdf",
  "bộ cẩm nang ngôn từ b2b bd (5 pha chuyển mình)": "ebooks/BD B2B Language.pdf",
  "bộ cẩm nang ngôn từ b2b bd": "ebooks/BD B2B Language.pdf",
  "ngôn từ b2b": "ebooks/BD B2B Language.pdf",
  "cẩm nang thực chiến hubspot crm cho b2b bd": "ebooks/Hubspot Basic Guideline.pdf",
  "hubspot": "ebooks/Hubspot Basic Guideline.pdf",
  "ma trận phễu kpi & quy đổi doanh thu b2b": "ebooks/KPI Inbound - Outbound funnel.pdf",
  "ma trận phễu kpi": "ebooks/KPI Inbound - Outbound funnel.pdf",
  "kpi": "ebooks/KPI Inbound - Outbound funnel.pdf",
  "cẩm nang nhận diện & loại bỏ fake lead b2b": "ebooks/PHÁT HIỆN FAKE LEAD.pdf",
  "fake lead": "ebooks/PHÁT HIỆN FAKE LEAD.pdf",
  "ebook scale up yourself - bứt phá năng lực bd b2b": "ebooks/Scale Up Yourself.pdf",
  "scale up yourself": "ebooks/Scale Up Yourself.pdf"
};

function resolveEbookFile(title, fileUrl) {
  if (fileUrl && fileUrl !== "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf") {
    return fileUrl;
  }
  if (title) {
    const cleanTitle = title.toLowerCase().trim();
    if (EBOOK_CATALOG[cleanTitle]) return EBOOK_CATALOG[cleanTitle];
    for (const [k, v] of Object.entries(EBOOK_CATALOG)) {
      if (cleanTitle.includes(k) || k.includes(cleanTitle)) return v;
    }
  }
  return fileUrl || "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf";
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
             .replace(/<br\s*[\/]?>/gi, "\n")
             .replace(/<\/p>/gi, "\n\n")
             .replace(/<[^>]+>/gi, "")
             .replace(/&nbsp;/g, " ")
             .replace(/&bull;/g, "•")
             .replace(/&rarr;/g, "->")
             .replace(/&amp;/g, "&")
             .trim();
}

function renderHtmlEmailTemplate({ title, greeting, message, buttonText, buttonUrl, note, mascotUrl, unsubscribeUrl, email }) {
  const safeFontStack = "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const finalMascot = mascotUrl || 'https://www.bdbinhdanhocvu.com/mascot_quests.jpg';
  const resolvedUnsubUrl = unsubscribeUrl || (email ? `https://www.bdbinhdanhocvu.com/api/log-email?action=unsubscribe&email=${encodeURIComponent(email)}` : null);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Be+Vietnam+Pro:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Be+Vietnam+Pro:wght@500;600;700&display=swap');
    body, table, td, p, a, h1, h2, h3, span, div {
      font-family: ${safeFontStack} !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    body { font-family: ${safeFontStack}; background-color: #f8fafc; margin: 0; padding: 0; }
    .email-card { max-width: 580px; margin: 25px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .email-header { background: linear-gradient(135deg, #a20a0a 0%, #7c0808 100%); background-color: #a20a0a; padding: 26px 20px; text-align: center; }
    .email-header h1 { color: #ffffff; margin: 0; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; font-family: ${safeFontStack}; line-height: 1.35; text-transform: uppercase; }
    .email-header p { color: #fecaca; margin: 6px 0 0 0; font-size: 13.5px; font-weight: 500; font-family: ${safeFontStack}; line-height: 1.4; }
    .email-body { padding: 30px 24px; color: #1e293b; font-size: 15px; line-height: 1.65; font-family: ${safeFontStack}; }
    .cta-container { text-align: center; margin: 30px 0 20px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #a20a0a 0%, #dc2626 100%); background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 34px; font-size: 15px; font-weight: 700; font-family: ${safeFontStack}; border-radius: 30px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35); text-align: center; line-height: 1.4; }
    .email-footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; font-family: ${safeFontStack}; line-height: 1.5; }
    .accent-link { color: #a20a0a; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ${safeFontStack};">
  <div class="email-card" style="max-width: 580px; margin: 25px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <div class="email-header" style="background: linear-gradient(135deg, #a20a0a 0%, #7c0808 100%); background-color: #a20a0a; padding: 26px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; font-family: ${safeFontStack}; line-height: 1.35; text-transform: uppercase;">BD BÌNH DÂN HỌC VỤ</h1>
      <p style="color: #fecaca; margin: 6px 0 0 0; font-size: 13.5px; font-weight: 500; font-family: ${safeFontStack}; line-height: 1.4;">Nơi Chiến Binh BD Bắt Đầu &bull; Peter Vo</p>
    </div>
    <div class="email-body" style="padding: 30px 24px; color: #1e293b; font-size: 15px; line-height: 1.65; font-family: ${safeFontStack};">
      ${mascotUrl ? `<div style="text-align: center; margin-bottom: 22px;"><img src="${finalMascot}" alt="Cú BeeDee" style="width: 88px; height: 88px; border-radius: 50%; border: 3px solid #f59e0b; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25); display: inline-block;"></div>` : ''}
      ${greeting ? `<p style="margin-top: 0; font-size: 16px; font-family: ${safeFontStack};"><strong>${greeting}</strong>,</p>` : ''}
      <div style="font-family: ${safeFontStack}; font-size: 15px; line-height: 1.65; color: #1e293b;">${message}</div>
      ${buttonUrl ? `<div class="cta-container" style="text-align: center; margin: 30px 0 20px 0;"><a href="${buttonUrl}" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, #a20a0a 0%, #dc2626 100%); background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 34px; font-size: 15px; font-weight: 700; font-family: ${safeFontStack}; border-radius: 30px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35); text-align: center; line-height: 1.4;">${buttonText || 'Khám Phá Ngay &rarr;'}</a></div>` : ''}
      ${note ? `<div style="margin-top: 22px; padding: 14px 18px; border-radius: 10px; background-color: #f0fdf4; border: 1px solid #bbf7d0; font-size: 13.5px; color: #166534; font-family: ${safeFontStack}; line-height: 1.55;">${note}</div>` : ''}
    </div>
    <div class="email-footer" style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; font-family: ${safeFontStack}; line-height: 1.5;">
      Bạn nhận được email này vì đã đăng ký tại <a href="https://www.bdbinhdanhocvu.com" class="accent-link" style="color: #a20a0a; text-decoration: none; font-weight: 700; font-family: ${safeFontStack};">BD Bình Dân Học Vụ</a>.<br>
      ${resolvedUnsubUrl ? `Nếu không muốn nhận email nhắc nhở mỗi sáng, bạn có thể <a href="${resolvedUnsubUrl}" style="color: #64748b; text-decoration: underline;">Hủy nhận email tại đây</a>.<br>` : ''}
      &copy; 2026 BD Bình Dân Học Vụ &bull; Stay Hungry, Stay Foolish!
    </div>
  </div>
</body>
</html>
  `.trim();
}

function sendResendEmail({ from, to, subject, html, text, scheduledAt, headers }) {
  return new Promise((resolve) => {
    try {
      const cleanTo = Array.isArray(to) ? to : [to];
      const payloadObj = {
        from: from || DEFAULT_FROM,
        to: cleanTo,
        subject: subject,
        html: html,
        text: text || stripHtml(html)
      };

      if (scheduledAt) {
        payloadObj.scheduled_at = scheduledAt;
      }

      if (headers && typeof headers === 'object') {
        payloadObj.headers = headers;
      }

      const payload = JSON.stringify(payloadObj);

      const options = {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: body });
          }
        });
      });

      req.on('error', (err) => {
        console.error('[RESEND_ERROR]', err.message);
        resolve({ ok: false, error: err.message });
      });

      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ ok: false, error: 'Resend Timeout' });
      });

      req.write(payload);
      req.end();
    } catch (err) {
      console.error('[RESEND_EXCEPTION]', err.message);
      resolve({ ok: false, error: err.message });
    }
  });
}

// ----------------------------------------------------
// Specialized Dispatchers
// ----------------------------------------------------

async function sendEbookEmail({ email, name, ebookTitle, fileUrl }) {
  const title = ebookTitle || "Cẩm nang B2B BD Thực Chiến";
  const downloadPath = resolveEbookFile(title, fileUrl);
  const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const utmTracking = `utm_source=email_ebook&utm_medium=email&utm_campaign=ebook_${cleanSlug}&utm_content=${encodeURIComponent(title)}`;
  const actionButtonUrl = `https://www.bdbinhdanhocvu.com/api/log-email?action=downloadEbook&email=${encodeURIComponent(email)}&fileUrl=${encodeURIComponent(downloadPath)}&ebookTitle=${encodeURIComponent(title)}&${utmTracking}`;

  const subject = `Tài liệu: ${title} - BD Bình Dân Học Vụ`;
  const message = `
    Peter Võ và Cú BeeDee gửi bạn tài liệu <strong>"${title}"</strong>.<br><br>
    Bạn hãy bấm vào nút bên dưới để tải trực tiếp tài liệu về máy. Đồng thời, địa chỉ email của bạn sẽ được kích hoạt tài khoản chính thức (+<strong>15 điểm tích lũy</strong>) trên hệ thống BD Bình Dân Học Vụ.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chào bạn ${name || 'Chiến binh B2B'}`,
    message: message,
    buttonText: 'Tải Trực Tiếp Ebook Về Máy &rarr;',
    buttonUrl: actionButtonUrl,
    note: `<strong>Lưu ý:</strong> Bạn hãy lưu tài liệu về máy để có thể xem lại bất cứ lúc nào. Chúc bạn gặt hái nhiều kết quả tốt trên hành trình BD.`
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html)
  });
}

async function sendVerificationReminderEmail({ email, name, scheduledAt, headers }) {
  const verificationUrl = `https://www.bdbinhdanhocvu.com/?verify_email=${encodeURIComponent(email)}`;
  const subject = `[BD Bình Dân Học Vụ] Peter Võ gửi bạn: Quà tặng mở khóa tài liệu và Điểm tích lũy`;
  const message = `
    Peter Võ và Cú BeeDee gửi bạn lời chào.<br><br>
    Tài khoản học tập của bạn trên cổng BD Bình Dân Học Vụ đã sẵn sàng. Hãy bấm vào nút bên dưới để mở khóa toàn bộ kho tài liệu thực chiến và nhận ngay <strong>15 điểm tích lũy</strong> nhé.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chào bạn ${name || 'Học viên'}`,
    message: message,
    buttonText: 'Mở Khóa Tài Liệu & Nhận 15 Điểm &rarr;',
    buttonUrl: verificationUrl,
    email: email
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html),
    scheduledAt: scheduledAt,
    headers: headers
  });
}

async function sendWelcomeRegistrationEmail({ email, name }) {
  const verificationUrl = `https://www.bdbinhdanhocvu.com/?verify_email=${encodeURIComponent(email)}`;
  const subject = `[BD Bình Dân Học Vụ] Chào mừng bạn tham gia và Quà tặng 15 điểm mở khóa tài liệu`;
  const message = `
    Chào mừng bạn đã tham gia rèn luyện cùng Peter Võ và Cú BeeDee.<br><br>
    Vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email và mở khóa toàn bộ kho tài liệu thực chiến. Cú BeeDee sẽ tặng thêm ngay <strong>15 điểm tích lũy</strong> vào tài khoản của bạn sau khi xác thực thành công.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chào bạn ${name || 'Chiến binh B2B'}`,
    message: message,
    buttonText: 'Kích Hoạt Tài Khoản & Nhận 15 Điểm &rarr;',
    buttonUrl: verificationUrl
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html)
  });
}

async function sendResetPasswordEmail({ email, name, resetToken }) {
  const resetUrl = `https://www.bdbinhdanhocvu.com/quests.html?reset_token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`;
  const subject = `[BD Bình Dân Học Vụ] Khôi phục mật khẩu tài khoản học tập`;
  const message = `
    Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản <strong>${email}</strong> của bạn.<br><br>
    Vui lòng bấm vào nút bên dưới để thiết lập mật khẩu mới (liên kết có giá trị bảo mật trong vòng 1 giờ).
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chào bạn ${name || 'Học viên'}`,
    message: message,
    buttonText: 'Đặt Lại Mật Khẩu &rarr;',
    buttonUrl: resetUrl
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html)
  });
}

async function sendVipLaunchingResendEmail({ email, name, nickname, vipCode, scheduledAt, headers = {} }) {
  const code = vipCode || 'BDTHUCCHIEN';
  const magicLink = `https://www.bdbinhdanhocvu.com/finder.html?email=${encodeURIComponent(email)}&vip_pass=${encodeURIComponent(code)}`;
  const subject = "[Đặc Quyền Alumni VIP] Ra Mắt Hệ Sinh Thái 9 Vũ Khí B2B & 3 Contacts/Tháng Tìm PIC";
  
  const contentHtml = `
    <p>Chào <strong>${name || 'Bạn'}</strong> (<em>${nickname || 'Chiến Binh BD'}</em>),</p>
    <p>Cảm ơn bạn vì đã luôn là một phần thân thiết trong cộng đồng <strong>BD Bình Dân Học Vụ</strong>. Peter rất trân quý tinh thần thực chiến và sự đồng hành của bạn trong suốt thời gian qua.</p>
    <p>Hôm nay, Peter chính thức ra mắt <strong>Hệ Sinh Thái 9 Vũ Khí B2B Toàn Diện</strong> — trạm tiếp sức chiến đấu được thiết kế để bạn không còn phải đơn độc trên hành trình săn deal và xây dựng quan hệ B2B:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${magicLink}" target="_blank">
        <img src="https://www.bdbinhdanhocvu.com/b2b_ecosystem_9_weapons.png" alt="Vũ Trụ 9 Vũ Khí B2B Bình Dân Học Vụ" style="width: 100%; max-width: 540px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 18px rgba(0,0,0,0.08); display: block; margin: 0 auto;">
      </a>
    </div>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 20px 0; text-align: left;">
      <strong style="color: #92400e; font-size: 15px; display: block; margin-bottom: 6px;">3 ĐẶC QUYỀN ALUMNI VIP DÀNH RIÊNG CHO BẠN:</strong>
      <ul style="margin: 0; padding-left: 18px; color: #78350f; font-size: 13.5px; line-height: 1.6;">
        <li><strong>1. Hạn Mức Tìm PIC Đặc Quyền (3 Contacts / Tháng):</strong> Peter Võ trực tiếp kết nối Person-in-Charge khối HR &amp; Marketing qua 30.000+ kết nối LinkedIn, áp dụng liên tục trong 3 tháng đầu tiên (tổng 9 contacts).</li>
        <li><strong>2. Vé Mời VIP Đồng Đội (Giver Mentality):</strong> Tặng bạn bè đồng nghiệp nhận +50 BD-Points và tải Ebook thực chiến đầu tiên. Bạn nhận +50đ/bạn và tự động mở khóa các Mốc Quà (<em>Mốc 5 bạn: 1 Ly Trà Sữa Size L</em>, <em>Mốc 10 bạn: 30 Phút Online 1-1</em>, <em>Mốc 15 bạn: Buổi Lunch trực tiếp cùng Peter Võ</em>).</li>
        <li><strong>3. Mở Khóa Trọn Đời 9 Công Cụ &amp; Thư Viện Ebook:</strong> Trọn quyền sử dụng toàn bộ tính năng hỗ trợ nghề BD.</li>
      </ul>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #475569; margin-bottom: 22px; text-align: left;">
      <strong>Thông Tin Mở Khóa Tài Khoản:</strong><br>
      • Email học viên: <code>${email}</code><br>
      • User ID / Mã VIP riêng: <strong style="color: #b45309;">${code}</strong><br>
      • Đăng nhập tự động: Chỉ cần bấm nút bên dưới, hệ thống sẽ tự động đăng nhập không cần gõ mật khẩu.
    </div>
  `;

  const unsubUrl = `https://www.bdbinhdanhocvu.com/api/log-email?action=unsubscribe&email=${encodeURIComponent(email)}`;
  const defaultHeaders = {
    'List-Unsubscribe': `<${unsubUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    ...headers
  };

  const html = renderHtmlEmailTemplate({
    greeting: null,
    message: contentHtml,
    buttonText: 'Mở Khóa Đặc Quyền VIP Của Bạn Ngay &rarr;',
    buttonUrl: magicLink,
    mascotUrl: 'https://www.bdbinhdanhocvu.com/mascot_quests.jpg',
    unsubscribeUrl: unsubUrl,
    email: email
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html),
    scheduledAt: scheduledAt || null,
    headers: defaultHeaders
  });
}

async function sendPicResultEmail({ email, name, nickname, targetCompany, targetRole, department, picName, picRole, picLinkedin, picContact, picAdvice }) {
  const company = targetCompany || 'Doanh nghiệp mục tiêu';
  const subject = `[Kết Quả Tìm PIC] Thông tin kết nối PIC tại ${company} dành cho bạn`;
  
  // Loại bỏ tiền tố trùng lặp nếu người dùng hoặc hệ thống đã tự nhập "Gợi ý tiếp cận:"
  let cleanAdvice = (picAdvice || '').trim();
  cleanAdvice = cleanAdvice.replace(/^(gợi ý tiếp cận từ peter võ|gợi ý tiếp cận|lời khuyên tiếp cận|goi y tiep can tu peter vo|goi y tiep can)[:\s-]*/i, '').trim();

  const contentHtml = `
    <p>Chào <strong>${name || 'Bạn'}</strong> (<em>${nickname || 'Alumni VIP'}</em>),</p>
    <p>Anh Peter Võ đã hoàn tất việc rà soát mạng lưới quan hệ và thông tin nhân sự tại <strong>${company}</strong> theo yêu cầu tìm PIC của bạn.</p>
    
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        THÔNG TIN PIC PHỤ TRÁCH:
      </div>
      <table style="width: 100%; font-size: 14px; line-height: 1.8; color: #334155; border-collapse: collapse;">
        <tr>
          <td style="width: 140px; font-weight: 600; color: #475569;">Họ và tên PIC:</td>
          <td style="font-weight: 700; color: #0f172a;">${picName || 'Đang cập nhật'}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #475569;">Chức danh / Vị trí:</td>
          <td>${picRole || targetRole || 'Phụ trách'}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #475569;">Đơn vị / Bộ phận:</td>
          <td>${department || 'Bộ phận mục tiêu'} - ${company}</td>
        </tr>
        ${picLinkedin ? `
        <tr>
          <td style="font-weight: 600; color: #475569;">LinkedIn Profile:</td>
          <td><a href="${picLinkedin}" target="_blank" style="color: #a20a0a; font-weight: 700; text-decoration: underline;">Xem LinkedIn Profile &rarr;</a></td>
        </tr>` : ''}
        ${picContact ? `
        <tr>
          <td style="font-weight: 600; color: #475569;">Liên hệ trực tiếp:</td>
          <td>${picContact}</td>
        </tr>` : ''}
      </table>
    </div>

    ${cleanAdvice ? `
    <div style="background: #f8fafc; border-left: 4px solid #a20a0a; padding: 14px 18px; border-radius: 6px; margin: 18px 0; font-size: 14px; color: #1e293b; line-height: 1.6;">
      <strong style="color: #a20a0a; display: block; margin-bottom: 4px;">Gợi ý tiếp cận từ Peter Võ:</strong>
      ${cleanAdvice}
    </div>` : ''}

    <p style="margin-top: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
      Chúc bạn kết nối thành công và phát triển deal thuận lợi. Nếu cần hỗ trợ thêm về chiến lược tiếp cận hay gỡ rối sales pipeline, bạn có thể phản hồi trực tiếp email này nhé.<br><br>
      Thân ái,<br>
      <strong>Peter Võ</strong><br>
      BD Bình Dân Học Vụ
    </p>
  `;

  const html = renderHtmlEmailTemplate({
    greeting: null,
    message: contentHtml,
    buttonText: picLinkedin ? 'Kết Nối LinkedIn Với PIC &rarr;' : null,
    buttonUrl: picLinkedin || null,
    email: email
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html)
  });
}


async function sendVipReminderRound2Email({ email, name, nickname, vipCode, scheduledAt, headers = {} }) {
  const code = vipCode || 'BDTHUCCHIEN';
  const magicLink = `https://www.bdbinhdanhocvu.com/finder.html?email=${encodeURIComponent(email)}&vip_pass=${encodeURIComponent(code)}`;
  const subject = `[Nhắc Nhẹ] Kích Hoạt 3 Lượt Tìm PIC & Mở Khóa Hệ Sinh Thái 9 Vũ Khí B2B Của Bạn`;
  
  const contentHtml = `
    <p>Chào <strong>${name || 'Bạn'}</strong> (<em>${nickname || 'Chiến Binh BD'}</em>),</p>
    <p>Hôm Thứ Ba vừa qua, Peter có gửi email ra mắt <strong>Hệ Sinh Thái 9 Vũ Khí B2B</strong> và tặng riêng bạn đặc quyền <strong>3 contacts/tháng kết nối Person-in-Charge (PIC)</strong>.</p>
    <p>Chỉ trong 24 giờ qua, đã có rất nhiều anh em cựu học viên kích hoạt thành công và bắt đầu gửi yêu cầu tìm PIC tới mạng lưới 30.000+ kết nối LinkedIn của Peter.</p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin: 20px 0; text-align: left;">
      <strong style="color: #065f46; font-size: 15px; display: block; margin-bottom: 6px;">🎯 ĐỪNG BỎ LỠ 3 ĐẶC QUYỀN ALUMNI VIP THÁNG NÀY:</strong>
      <ul style="margin: 0; padding-left: 18px; color: #166534; font-size: 13.5px; line-height: 1.6;">
        <li><strong>1. 3 Contacts/Tháng Tìm PIC:</strong> Peter Võ trực tiếp kết nối PIC khối HR &amp; Marketing cho bạn, duy trì liên tục trong 3 tháng đầu tiên (tổng 9 contacts).</li>
        <li><strong>2. Vé Mời VIP Đồng Đội (Giver Mentality):</strong> Tặng bạn bè đồng nghiệp nhận +50 BD-Points và tải Ebook thực chiến đầu tiên; bạn nhận +50đ/bạn và tự động mở khóa các Mốc Quà (<em>Trà sữa size L</em>, <em>30 Phút Online 1-1</em>, <em>Buổi Lunch trực tiếp cùng Peter Võ</em>).</li>
        <li><strong>3. Mở Khóa Trọn Đời 9 Công Cụ &amp; Thư Viện Ebook:</strong> Trọn quyền sử dụng toàn bộ tính năng hỗ trợ nghề BD.</li>
      </ul>
    </div>

    <p>Peter biết đầu tuần công việc bộn bề với nhiều dự án dễ làm trôi thư, nên Peter gửi lại bạn liên kết đăng nhập 1-chạm cá nhân hóa dưới đây để bạn không bỏ lỡ quyền lợi tháng này:</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #475569; margin: 20px 0; text-align: left;">
      <strong>Thông Tin Đăng Nhập Riêng Của Bạn:</strong><br>
      • Email học viên: <code>${email}</code><br>
      • User ID / Mã VIP riêng: <strong style="color: #b45309;">${code}</strong><br>
      • Đăng nhập 1-chạm: Chỉ cần bấm nút bên dưới, hệ thống sẽ tự động đăng nhập không cần gõ mật khẩu.
    </div>
  `;

  const unsubUrl = `https://www.bdbinhdanhocvu.com/api/log-email?action=unsubscribe&email=${encodeURIComponent(email)}`;
  const defaultHeaders = {
    'List-Unsubscribe': `<${unsubUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    ...headers
  };

  const html = renderHtmlEmailTemplate({
    greeting: null,
    message: contentHtml,
    buttonText: 'Kích Hoạt Quyền Lợi VIP 1-Chạm Ngay &rarr;',
    buttonUrl: magicLink,
    mascotUrl: 'https://www.bdbinhdanhocvu.com/mascot_quests.jpg',
    unsubscribeUrl: unsubUrl,
    email: email
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html),
    scheduledAt: scheduledAt || null,
    headers: defaultHeaders
  });
}

module.exports = {
  sendResendEmail,
  sendEbookEmail,
  sendVerificationReminderEmail,
  sendWelcomeRegistrationEmail,
  sendResetPasswordEmail,
  sendVipLaunchingResendEmail,
  sendVipReminderRound2Email,
  sendPicResultEmail,
  renderHtmlEmailTemplate,
  stripHtml
};
