const https = require('https');

// Customized funny Duolingo-style email templates for BD B2B tools
const emailTemplates = [
  {
    subject: "Cú BeeDee đang nhìn bạn... 🦉",
    body: (name) => `Chào ${name}!\n\nHôm qua bạn không vào ôn luyện B2B Challenge. Cú BeeDee buồn phát khóc rồi đây này. Đừng để chú cú đáng yêu này biến thành cú dữ đi đòi nợ kiến thức nhé!\n\n🔥 Giữ chuỗi ngày (Streak) ngay tại đây: https://bd-tips.vercel.app/\n\nBật mí: Hôm nay có tình huống xử lý từ chối mới cực hay trong game, vào xem ngay đi!`
  },
  {
    subject: "Học BD không khó, bỏ cuộc mới khó giải thích với sếp! 💼",
    body: (name) => `Chào ${name}!\n\nLại một ngày trôi qua và bảng vàng Chiến Thần B2B vẫn chưa thấy tên bạn. Đối thủ của bạn đang tăng trưởng vù vù, còn bạn thì đang... bận lướt TikTok? Đùa thôi, vào click 1 thử thách đi nào:\n\n👉 Luyện tập ngay: https://bd-tips.vercel.app/\n\nĐừng quên công cụ "B2B LinkedIn PIC Finder" và "AI Email Assistant" của chúng ta vẫn miễn phí nhé. Đừng làm BD chạy bằng cơm nữa!`
  },
  {
    subject: "Ủa, bạn block Cú BeeDee rồi hả? 😭",
    body: (name) => `Ủa ${name} ơi, bạn quên Cú BeeDee rồi đúng không? Cơn giận của Cú BeeDee đang tích tụ đấy.\n\nChỉ 3 phút mỗi ngày để nâng cấp tư duy BD, đừng để bộ óc bị rỉ sét nhé! Vào giải quyết 1 tình huống đi nào:\n\nẤn vào để học: https://bd-tips.vercel.app/`
  },
  {
    subject: "Tài khoản của bạn sắp đóng băng! ❄️",
    body: (name) => `Này ${name}!\n\nCú BeeDee vừa check CRM và thấy lead tên ${name} đã đóng băng 4 ngày rồi. Đừng bắt BeeDee phải gọi điện lạnh (cold-calling) trực tiếp cho bạn nhé!\n\n👉 Vào mở khóa deal ngay: https://bd-tips.vercel.app/\n\nLưu ý: Bạn chỉ còn cách cốc trà sữa miễn phí (mốc 7 ngày) hoặc buổi ăn trưa với anh Peter (mốc 30 ngày) vài ngày streak nữa thôi. Giữ streak ngay!`
  },
  {
    subject: "Cú BeeDee gửi tín hiệu vũ trụ tới bạn... ✨",
    body: (name) => `Chào ${name},\n\nHôm nay anh Peter Vo vừa viết thêm bài chia sẻ thực chiến mới trong mục B2B Challenge. Vào đọc vị nỗi đau khách hàng và lấy điểm chốt hợp đồng ngay:\n\n📈 Đọc ngay: https://bd-tips.vercel.app/\n\nĐừng quên ghé qua mục "Tính Lương Gross-Net" để xem hoa hồng tháng này có tăng không nha!`
  },
  {
    subject: "Làm Chiến Thần B2B hay làm BD chạy bằng cơm? 🤖",
    body: (name) => `Chào ${name}!\n\nCông cụ "AI Email Assistant" vừa được nâng cấp giúp viết cold email nhanh gấp 10 lần. Bạn định tiếp tục viết tay từng cái một sao?\n\n💻 Vào trải nghiệm và làm game B2B Challenge ngay: https://bd-tips.vercel.app/\n\nGiữ vững streak 7 ngày để nhận cốc trà sữa hoặc đồ trang trí bàn cute miễn phí nhé!`
  },
  {
    subject: "Tin mật: Đối thủ của bạn vừa vào ôn luyện! 🤫",
    body: (name) => `Này ${name}!\n\nCú BeeDee vừa phát hiện đối thủ cạnh tranh của bạn đã đạt Streak 10 ngày rồi đấy. Bạn có muốn bị tụt lại phía sau trong cuộc đua chốt deal triệu đô không?\n\n🔥 Vào vượt mặt họ ngay: https://bd-tips.vercel.app/\n\nBật mí: Hãy dùng thử công cụ "B2B LinkedIn PIC Finder" để tìm email sếp tổng doanh nghiệp mục tiêu chỉ trong 5 giây!`
  },
  {
    subject: "Có một email chưa gửi đang chờ bạn... ✉️",
    body: (name) => `Chào ${name}!\n\nCông cụ "AI Email Assistant" của bạn đang trống trải quá. Có phải bạn đang bí ý tưởng viết cold email tiếp cận khách hàng Enterprise?\n\n👉 Vào để AI viết hộ bạn bản nháp siêu chuyên nghiệp: https://bd-tips.vercel.app/\n\nVừa xong nhớ qua làm 1 game nhẹ nhàng để tích thêm Streak nhé!`
  },
  {
    subject: "Đừng để sếp hỏi: 'Hôm nay em tìm được bao nhiêu PIC?' 😰",
    body: (name) => `Chào ${name}!\n\nĐừng làm sếp thất vọng khi báo cáo cuối tuần nhé. Hãy để công cụ "B2B LinkedIn PIC Finder" hỗ trợ bạn tìm đúng người có quyền quyết định (PIC) của đối tác.\n\n🔍 Tìm PIC ngay: https://bd-tips.vercel.app/\n\nTự tin gõ cửa đối tác lớn và tích lũy streak nhận quà mốc 7 ngày nha!`
  },
  {
    subject: "15 Tình huống Luật Lao Động bạn đã nắm hết chưa? ⚖️",
    body: (name) => `Chào ${name}!\n\nHết thử việc mà công ty im lặng thì có được tính là nhân viên chính thức? Đi trễ bị trừ lương có đúng luật?\n\nCú BeeDee đã tổng hợp 15 tình huống thực tế siêu hot giúp bảo vệ quyền lợi của dân BD B2B tại đây:\n\n⚖️ Tra cứu Luật Lao Động ngay: https://bd-tips.vercel.app/\n\nĐọc xong nhớ trả lời câu hỏi game để duy trì streak nhé!`
  },
  {
    subject: "Cú BeeDee tặng bạn một chiếc ảnh siêu năng lượng! 🦉",
    body: (name) => `Chào ${name}!\n\nCú BeeDee gửi bạn chiếc ảnh avatar siêu năng lượng học tập hôm nay: https://bd-tips.vercel.app/bd_mascot.png\n\nChỉ cần 3 phút làm game B2B Challenge, bạn sẽ tự tin hơn khi pitching trước đối tác lớn. Thử ngay:\n\n🎮 Chơi game: https://bd-tips.vercel.app/`
  },
  {
    subject: "Cách tính hoa hồng BD B2B tháng này của bạn? 💸",
    body: (name) => `Chào ${name}!\n\nBạn đã biết cách quy đổi lương từ Gross sang Net chính xác và tính xem mức hoa hồng thực nhận của mình chưa?\n\n📊 Sử dụng Công cụ Tính Lương thông minh ngay: https://bd-tips.vercel.app/\n\nLương tăng, streak cũng phải tăng! Giữ streak hôm nay đi nào!`
  },
  {
    subject: "Anh Peter Vo vừa chia sẻ bài viết mới trên LinkedIn! 📰",
    body: (name) => `Chào ${name}!\n\nMột bài phân tích thực chiến cực sâu về cách tiếp cận khách hàng B2B khó tính vừa được đồng bộ về thư viện.\n\n📰 Đọc ngay tại mục Thư Viện: https://bd-tips.vercel.app/\n\nĐọc xong làm thử thách 1 câu hỏi để tích lũy ngày streak nhận trà sữa nhé!`
  },
  {
    subject: "Chỉ còn vài ngày nữa là được gặp anh Peter Vo! ☕",
    body: (name) => `Chào ${name}!\n\nBạn đã đạt được bao nhiêu ngày streak liên tục rồi? Mốc 14 ngày tư vấn 1on1 online và mốc 30 ngày ăn trưa cùng anh Peter đang rất gần rồi đó.\n\n🔥 Đừng để đứt streak đáng tiếc: https://bd-tips.vercel.app/\n\nCú BeeDee chúc bạn một ngày làm việc hiệu quả và chốt được nhiều deal!`
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

  // In production, sync with Google Sheets CRM webhook and send out emails.
  console.log(`[DAILY_EMAIL_CRON] Target: ${demoEmail}, Name: ${demoName}`);
  console.log(`[DAILY_EMAIL_CRON] Subject: ${subject}`);
  console.log(`[DAILY_EMAIL_CRON] Content:\n${bodyText}`);

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
