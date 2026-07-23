const https = require('https');

// Customized funny Duolingo-style email templates for BD B2B tools
const emailTemplates = [
  {
    subject: "Cú Peter đang nhìn bạn... 🦉",
    body: (name) => `Chào ${name}!\n\nHôm qua bạn không vào ôn luyện B2B Challenge. Cú Peter buồn phát khóc rồi đây này. Đừng để chú cú đáng yêu này biến thành cú dữ đi đòi nợ kiến thức nhé!\n\n🔥 Giữ chuỗi ngày (Streak) ngay tại đây: https://bd-tips.vercel.app/\n\nBật mí: Mục "Cộng Đồng" đang thảo luận cực xôm về kịch bản đàm phán giá B2B đấy, vào xem ngay đi!`
  },
  {
    subject: "Học BD không khó, bỏ cuộc mới khó giải thích với sếp! 💼",
    body: (name) => `Chào ${name}!\n\nLại một ngày trôi qua và bảng vàng Chiến Thần B2B vẫn chưa thấy tên bạn. Đối thủ của bạn đang tăng trưởng vù vù, còn bạn thì đang... bận lướt TikTok? Đùa thôi, vào click 1 thử thách đi nào:\n\n👉 Luyện tập ngay: https://bd-tips.vercel.app/\n\nĐừng quên công cụ "B2B LinkedIn PIC Finder" và "AI Email Assistant" của chúng ta vẫn miễn phí nhé. Đừng làm BD chạy bằng cơm nữa!`
  },
  {
    subject: "Ủa, bạn block Cú Peter rồi hả? 😭",
    body: (name) => `Ủa ${name} ơi, bạn quên Peter rồi đúng không? Cơn giận của Cú Peter đang tích tụ đấy.\n\nChỉ 3 phút mỗi ngày để nâng cấp tư duy BD, đừng để bộ óc bị rỉ sét nhé! Vào giải quyết 1 tình huống đi nào:\n\nẤn vào để học: https://bd-tips.vercel.app/`
  },
  {
    subject: "Tài khoản của bạn sắp đóng băng! ❄️",
    body: (name) => `Này ${name}!\n\nPeter vừa check CRM và thấy lead tên ${name} đã đóng băng 4 ngày rồi. Đừng bắt Peter phải gọi điện lạnh (cold-calling) trực tiếp cho bạn nhé!\n\n👉 Vào mở khóa deal ngay: https://bd-tips.vercel.app/\n\nLưu ý: Bạn chỉ còn cách cốc trà sữa miễn phí hoặc buổi ăn trưa với sếp Peter vài ngày streak thôi. Giữ streak ngay!`
  },
  {
    subject: "Peter Vo gửi tín hiệu vũ trụ tới bạn... ✨",
    body: (name) => `Chào ${name},\n\nHôm nay Peter Vo vừa viết thêm một case study siêu thực chiến về The ParentInc & Webtretho trong mục B2B Challenge. Vào đọc vị nỗi đau khách hàng và lấy điểm chốt hợp đồng ngay:\n\n📈 Đọc ngay: https://bd-tips.vercel.app/\n\nĐừng quên ghé qua mục "Tính Lương Gross-Net" để xem hoa hồng tháng này có tăng không nha!`
  },
  {
    subject: "Làm Chiến Thần B2B hay làm BD chạy bằng cơm? 🤖",
    body: (name) => `Chào ${name}!\n\nCông cụ "AI Email Assistant" vừa được nâng cấp giúp viết cold email nhanh gấp 10 lần. Bạn định tiếp tục viết tay từng cái một sao?\n\n💻 Vào trải nghiệm và làm game B2B Challenge ngay: https://bd-tips.vercel.app/\n\nGiữ vững streak 7 ngày để giật cốc trà sữa Phúc Long free nhé!`
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
  const bodyText = template.body(demoName);

  // In production, sync with database/CRM and send out emails.
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
