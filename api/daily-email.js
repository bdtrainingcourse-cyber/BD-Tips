const https = require('https');

// Funny Duolingo-style B2B motivation email templates
const emailTemplates = [
  {
    subject: "Cú Peter đang nhìn bạn... 🦉",
    body: (name) => `Chào ${name}!\n\nHôm qua bạn không vào ôn luyện B2B Challenge. Cú Peter buồn phát khóc rồi đây này. Đừng để chú cú đáng yêu này biến thành cú hung dữ đi đòi nợ kiến thức nhé!\n\nVào giữ chuỗi ngày (Streak) ngay đi: https://bd-tips.vercel.app/`
  },
  {
    subject: "Học BD không khó, bỏ cuộc mới khó giải thích với sếp! 💼",
    body: (name) => `Chào ${name}!\n\nLại một ngày trôi qua và bảng vàng Chiến Thần B2B vẫn chưa thấy tên bạn. Đối thủ của bạn đang tăng trưởng vù vù, còn bạn thì đang... bận lướt TikTok? Đùa thôi, vào làm ngay 1 thử thách đi nào:\n\nGiữ streak tại đây: https://bd-tips.vercel.app/`
  },
  {
    subject: "Ủa, bạn block Cú Peter rồi hả? 😭",
    body: (name) => `Ủa ${name} ơi, bạn quên Peter rồi đúng không? Cơn giận của Cú Peter đang tích tụ đấy.\n\nChỉ 3 phút mỗi ngày để nâng cấp tư duy BD, đừng để bộ óc bị rỉ sét nhé! Vào giải quyết 1 tình huống đi nào:\n\nẤn vào để học: https://bd-tips.vercel.app/`
  },
  {
    subject: "Tài khoản của bạn sắp đóng băng! ❄️",
    body: (name) => `Này ${name}!\n\nPeter vừa check CRM và thấy lead tên ${name} đã đóng băng 4 ngày rồi. Đừng bắt Peter phải gọi điện lạnh (cold-calling) trực tiếp cho bạn nhé!\n\nVào mở khóa deal ngay: https://bd-tips.vercel.app/`
  },
  {
    subject: "Peter Vo gửi tín hiệu vũ trụ tới bạn... ✨",
    body: (name) => `Chào ${name},\n\nHôm nay Peter Vo vừa viết thêm một case study siêu thực chiến trong Ma trận tư duy B2B. Vào đọc vị nỗi đau khách hàng và lấy điểm chốt hợp đồng ngay:\n\nĐọc ngay: https://bd-tips.vercel.app/`
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Choose a random funny template
  const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
  const demoEmail = req.query.email || 'hocvien@gmail.com';
  const demoName = req.query.name || 'Chiến thần B2B';

  const subject = template.subject;
  const bodyText = template.body(demoName);

  // In production, you would fetch subscribers from your Google Sheet or database
  // and loop over them using Resend, SendGrid, or mailgun:
  /*
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
     // Send email using Resend API...
  }
  */

  console.log(`[DAILY_EMAIL_CRON] Target: ${demoEmail}, Name: ${demoName}`);
  console.log(`[DAILY_EMAIL_CRON] Subject: ${subject}`);
  console.log(`[DAILY_EMAIL_CRON] Content:\n${bodyText}`);

  return res.status(200).json({
    success: true,
    message: "Daily emails processed successfully.",
    sampleSent: {
      to: demoEmail,
      name: demoName,
      subject: subject,
      body: bodyText
    }
  });
};
