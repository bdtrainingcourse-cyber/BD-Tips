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

function renderHtmlEmailTemplate({ title, greeting, message, buttonText, buttonUrl, note }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .email-card { max-width: 580px; margin: 25px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .email-header { background: linear-gradient(135deg, #a20a0a 0%, #7c0808 100%); padding: 26px 20px; text-align: center; }
    .email-header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .email-header p { color: #fecaca; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; }
    .email-body { padding: 30px 24px; color: #1e293b; font-size: 15px; line-height: 1.65; }
    .cta-container { text-align: center; margin: 30px 0 20px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #a20a0a 0%, #dc2626 100%); color: #ffffff !important; text-decoration: none; padding: 13px 32px; font-size: 15px; font-weight: 800; border-radius: 30px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35); }
    .email-footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .accent-link { color: #a20a0a; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="email-card">
    <div class="email-header">
      <h1>BD BÌNH DÂN HỌC VỤ</h1>
      <p>Nơi Chiến Binh BD Bắt Đầu &bull; Peter Vo</p>
    </div>
    <div class="email-body">
      ${greeting ? `<p style="margin-top: 0; font-size: 16px;"><strong>${greeting}</strong>,</p>` : ''}
      <div>${message}</div>
      ${buttonUrl ? `<div class="cta-container"><a href="${buttonUrl}" class="cta-btn">${buttonText || 'Khám Phá Ngay &rarr;'}</a></div>` : ''}
      ${note ? `<div style="margin-top: 20px; padding: 12px 16px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; font-size: 13.5px; color: #166534;">${note}</div>` : ''}
    </div>
    <div class="email-footer">
      Bạn nhận được email này vì đã đăng ký tại <a href="https://www.bdbinhdanhocvu.com" class="accent-link">BD Bình Dân Học Vụ</a>.<br>
      &copy; 2026 BD Bình Dân Học Vụ &bull; Stay Hungry, Stay Foolish!
    </div>
  </div>
</body>
</html>
  `.trim();
}

function sendResendEmail({ from, to, subject, html, text }) {
  return new Promise((resolve) => {
    try {
      const cleanTo = Array.isArray(to) ? to : [to];
      const payload = JSON.stringify({
        from: from || DEFAULT_FROM,
        to: cleanTo,
        subject: subject,
        html: html,
        text: text || stripHtml(html)
      });

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

  const subject = `📚 [Tải Về Ngay] ${title} - BD Bình Dân Học Vụ`;
  const message = `
    Peter Vo và Cú BeeDee gửi bạn tài liệu <strong>"${title}"</strong>!<br><br>
    Bạn hãy bấm vào nút bên dưới để tải trực tiếp tài liệu về máy. Đồng thời, địa chỉ email của bạn sẽ được kích hoạt tài khoản chính thức (+<strong>15đ tích lũy ⚡</strong>) trên hệ thống BD Bình Dân Học Vụ.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chào bạn ${name || 'Chiến binh B2B'}`,
    message: message,
    buttonText: `📥 Tải Ebook: ${title.substring(0, 32)} &rarr;`,
    buttonUrl: actionButtonUrl,
    note: `💡 <strong>Mẹo nhỏ:</strong> Bạn hãy lưu tài liệu về máy để có thể xem lại bất cứ lúc nào. Chúc bạn gặt hái nhiều kết quả tốt trên hành trình BD!`
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html)
  });
}

async function sendVerificationReminderEmail({ email, name }) {
  const verificationUrl = `https://www.bdbinhdanhocvu.com/?verify_email=${encodeURIComponent(email)}`;
  const subject = `[BD Bình Dân Học Vụ] Peter Vo gửi bạn: Quà tặng mở khóa tài liệu & Điểm tích lũy`;
  const message = `
    Peter Vo và Cú BeeDee gửi bạn lời chào!<br><br>
    Tài khoản học tập của bạn trên cổng BD Bình Dân Học Vụ đã sẵn sàng. Hãy bấm vào nút bên dưới để mở khóa toàn bộ kho tài liệu thực chiến và nhận ngay <strong>15đ tích lũy ⚡</strong> nhé!
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chào bạn ${name || 'Học viên'}`,
    message: message,
    buttonText: 'Mở Khóa Tài Liệu & Nhận 15đ &rarr;',
    buttonUrl: verificationUrl
  });

  return sendResendEmail({
    to: email,
    subject: subject,
    html: html,
    text: stripHtml(html)
  });
}

async function sendWelcomeRegistrationEmail({ email, name }) {
  const verificationUrl = `https://www.bdbinhdanhocvu.com/?verify_email=${encodeURIComponent(email)}`;
  const subject = `[BD Bình Dân Học Vụ] Chào mừng bạn tham gia & Quà tặng 15đ mở khóa tài liệu`;
  const message = `
    Chào mừng bạn đã tham gia rèn luyện cùng Peter Vo và Cú BeeDee!<br><br>
    Vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email và mở khóa toàn bộ kho tài liệu thực chiến. Cú BeeDee sẽ tặng thêm ngay <strong>15đ tích lũy ⚡</strong> vào tài khoản của bạn sau khi xác thực thành công.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chào bạn ${name || 'Chiến binh B2B'}`,
    message: message,
    buttonText: 'Kích Hoạt Tài Khoản & Nhận 15đ &rarr;',
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

module.exports = {
  sendResendEmail,
  sendEbookEmail,
  sendVerificationReminderEmail,
  sendWelcomeRegistrationEmail,
  sendResetPasswordEmail,
  renderHtmlEmailTemplate,
  stripHtml
};
