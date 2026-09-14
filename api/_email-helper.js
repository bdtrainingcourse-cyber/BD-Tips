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

  const subject = `Tai lieu: ${title} - BD Binh Dan Hoc Vu`;
  const message = `
    Peter Vo va Cu BeeDee gui ban tai lieu <strong>"${title}"</strong>.<br><br>
    Ban hay bam vao nut ben duoi de tai truc tiep tai lieu ve may. Dong thoi, dia chi email cua ban se duoc kich hoat tai khoan chinh thuc (+<strong>15 diem tich luy</strong>) tren he thong BD Binh Dan Hoc Vu.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chao ban ${name || 'Chien binh B2B'}`,
    message: message,
    buttonText: 'Tai Truc Tiep Ebook Ve May &rarr;',
    buttonUrl: actionButtonUrl,
    note: `<strong>Luu y:</strong> Ban hay luu tai lieu ve may de co the xem lai bat cu luc nao. Chuc ban gat hai nhieu ket qua tot tren hanh trinh BD.`
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
  const subject = `[BD Binh Dan Hoc Vu] Peter Vo gui ban: Qua tang mo khoa tai lieu va Diem tich luy`;
  const message = `
    Peter Vo va Cu BeeDee gui ban loi chao.<br><br>
    Tai khoan hoc tap cua ban tren cong BD Binh Dan Hoc Vu da san sang. Hay bam vao nut ben duoi de mo khoa toan bo kho tai lieu thuc chien va nhan ngay <strong>15 diem tich luy</strong> nhe.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chao ban ${name || 'Hoc vien'}`,
    message: message,
    buttonText: 'Mo Khoa Tai Lieu & Nhan 15 Diem &rarr;',
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
  const subject = `[BD Binh Dan Hoc Vu] Chao mung ban tham gia va Qua tang 15 diem mo khoa tai lieu`;
  const message = `
    Chao mung ban da tham gia ren luyen cung Peter Vo va Cu BeeDee.<br><br>
    Vui long nhap vao nut ben duoi de xac thuc dia chi email va mo khoa toan bo kho tai lieu thuc chien. Cu BeeDee se tang them ngay <strong>15 diem tich luy</strong> vao tai khoan cua ban sau khi xac thuc thanh cong.
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chao ban ${name || 'Chien binh B2B'}`,
    message: message,
    buttonText: 'Kich Hoat Tai Khoan & Nhan 15 Diem &rarr;',
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
  const subject = `[BD Binh Dan Hoc Vu] Khoi phuc mat khau tai khoan hoc tap`;
  const message = `
    Chung toi nhan duoc yeu cau khoi phuc mat khau cho tai khoan <strong>${email}</strong> cua ban.<br><br>
    Vui long bam vao nut ben duoi de thiet lap mat khau moi (lien ket co gia tri bao mat trong vong 1 gio).
  `;

  const html = renderHtmlEmailTemplate({
    greeting: `Chao ban ${name || 'Hoc vien'}`,
    message: message,
    buttonText: 'Dat Lai Mat Khau &rarr;',
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
  const subject = "[Dac Quyen Alumni VIP] Ra Mat He Sinh Thai 9 Vu Khi B2B & 3 Contacts/Thang Tim PIC";
  
  const contentHtml = `
    <p>Chao <strong>${name || 'Ban'}</strong> (<em>${nickname || 'Chien Binh BD'}</em>),</p>
    <p>Cam on ban vi da luon la mot phan than thiet trong cong dong <strong>BD Binh Dan Hoc Vu</strong>. Peter rat tran quy tinh than thuc chien va su dong hanh cua ban trong suot thoi gian qua.</p>
    <p>Hom nay, Peter chinh thuc ra mat <strong>He Sinh Thai 9 Vu Khi B2B Toan Dien</strong> - tram tiep suc chien dau duoc thiet ke de ban khong con phai don doc tren hanh trinh san deal va xay dung quan he B2B:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${magicLink}" target="_blank">
        <img src="https://www.bdbinhdanhocvu.com/b2b_ecosystem_9_weapons.png" alt="Vu Tru 9 Vu Khi B2B Binh Dan Hoc Vu" style="width: 100%; max-width: 540px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 18px rgba(0,0,0,0.08); display: block; margin: 0 auto;">
      </a>
    </div>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 20px 0; text-align: left;">
      <strong style="color: #92400e; font-size: 15px; display: block; margin-bottom: 6px;">3 DAC QUYEN ALUMNI VIP DANH RIENG CHO BAN:</strong>
      <ul style="margin: 0; padding-left: 18px; color: #78350f; font-size: 13.5px; line-height: 1.6;">
        <li><strong>1. Han Muc Tim PIC Dac Quyen (3 Contacts / Thang):</strong> Peter Vo truc tiep ket noi Person-in-Charge khoi HR &amp; Marketing qua 30.000+ ket noi LinkedIn, ap dung lien tuc trong 3 thang dau tien (tong 9 contacts).</li>
        <li><strong>2. Ve Moi VIP Dong Doi (Giver Mentality):</strong> Tang ban be dong nghiep nhan +50 BD-Points va tai Ebook thuc chien dau tien. Ban nhan +50d/ban va tu dong mo khoa cac Moc Qua (<em>Moc 5 ban: 1 Ly Tra Sua Size L</em>, <em>Moc 10 ban: 30 Phut Online 1-1</em>, <em>Moc 15 ban: Buoi Lunch truc tiep cung Peter Vo</em>).</li>
        <li><strong>3. Mo Khoa Tron Doi 9 Cong Cu &amp; Thu Vien Ebook:</strong> Tron quyen su dung toan bo tinh nang ho tro nghe BD.</li>
      </ul>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #475569; margin-bottom: 22px; text-align: left;">
      <strong>Thong Tin Mo Khoa Tai Khoan:</strong><br>
      • Email hoc vien: <code>${email}</code><br>
      • User ID / Ma VIP rieng: <strong style="color: #b45309;">${code}</strong><br>
      • Dang nhap tu dong: Chi can bam nut ben duoi, he thong se tu dong dang nhap khong can go pass.
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
    buttonText: 'Mo Khoa Dac Quyen VIP Cua Ban Ngay &rarr;',
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
  const company = targetCompany || 'Doanh nghiep muc tieu';
  const subject = `[Ket Qua Tim PIC] Thong tin ket noi PIC tai ${company} danh cho ban`;
  
  const contentHtml = `
    <p>Chao <strong>${name || 'Ban'}</strong> (<em>${nickname || 'Alumni VIP'}</em>),</p>
    <p>Anh Peter Vo da hoan tat ra soat mang luoi quan he va thong tin nhan su tai <strong>${company}</strong> theo yeu cau tim PIC cua ban.</p>
    
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        THONG TIN PIC PHU TRACH:
      </div>
      <table style="width: 100%; font-size: 14px; line-height: 1.8; color: #334155; border-collapse: collapse;">
        <tr>
          <td style="width: 140px; font-weight: 600; color: #475569;">Ho va ten PIC:</td>
          <td style="font-weight: 700; color: #0f172a;">${picName || 'Dang cap nhat'}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #475569;">Chuc danh / Vi tri:</td>
          <td>${picRole || targetRole || 'Phu trach'}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #475569;">Don vi / Bo phan:</td>
          <td>${department || 'Bo phan muc tieu'} - ${company}</td>
        </tr>
        ${picLinkedin ? `
        <tr>
          <td style="font-weight: 600; color: #475569;">LinkedIn Profile:</td>
          <td><a href="${picLinkedin}" target="_blank" style="color: #a20a0a; font-weight: 700; text-decoration: underline;">Xem LinkedIn Profile &rarr;</a></td>
        </tr>` : ''}
        ${picContact ? `
        <tr>
          <td style="font-weight: 600; color: #475569;">Lien he truc tiep:</td>
          <td>${picContact}</td>
        </tr>` : ''}
      </table>
    </div>

    ${picAdvice ? `
    <div style="background: #f8fafc; border-left: 4px solid #a20a0a; padding: 14px 18px; border-radius: 6px; margin: 18px 0; font-size: 14px; color: #1e293b; line-height: 1.6;">
      <strong style="color: #a20a0a; display: block; margin-bottom: 4px;">Goi y tiep can tu Peter Vo:</strong>
      ${picAdvice}
    </div>` : ''}

    <p style="margin-top: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
      Chuc ban ket noi thanh cong deal nay. Neu can ho tro them ve chien luoc tiep can hay gỡ roi sales pipeline, ban co the phan hoi truc tiep email nay nhe.<br><br>
      Than ai,<br>
      <strong>Peter Vo</strong><br>
      BD Binh Dan Hoc Vu
    </p>
  `;

  const html = renderHtmlEmailTemplate({
    greeting: null,
    message: contentHtml,
    buttonText: picLinkedin ? 'Ket Noi LinkedIn Voi PIC &rarr;' : null,
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

module.exports = {
  sendResendEmail,
  sendEbookEmail,
  sendVerificationReminderEmail,
  sendWelcomeRegistrationEmail,
  sendResetPasswordEmail,
  sendVipLaunchingResendEmail,
  sendPicResultEmail,
  renderHtmlEmailTemplate,
  stripHtml
};
