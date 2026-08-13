const { readLogs } = require('./_db-helper');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const email = req.query.email;
  const logs = readLogs();
  
  let categoryCounts = {
    compliance: 0, // labor-law, salary
    pitching: 0,   // pitching, roleplay
    outreach: 0,   // email-assistant
    finder: 0      // finder, pic
  };

  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    const userLogs = logs.filter(l => l.email === cleanEmail);

    userLogs.forEach(log => {
      const act = (log.action || '').toLowerCase();
      const cat = (log.category || '').toLowerCase();
      const det = (log.detail || '').toLowerCase();

      if (cat.includes('labor') || cat.includes('law') || cat.includes('salary') || det.includes('labor') || det.includes('salary')) {
        categoryCounts.compliance++;
      } else if (cat.includes('pitch') || cat.includes('roleplay') || det.includes('pitch') || det.includes('roleplay')) {
        categoryCounts.pitching++;
      } else if (cat.includes('email') || det.includes('email')) {
        categoryCounts.outreach++;
      } else if (cat.includes('finder') || cat.includes('pic') || det.includes('finder') || det.includes('pic')) {
        categoryCounts.finder++;
      }
    });
  }

  // Find dominant interest
  let dominant = 'default';
  let maxCount = 0;
  for (const key of Object.keys(categoryCounts)) {
    if (categoryCounts[key] > maxCount) {
      maxCount = categoryCounts[key];
      dominant = key;
    }
  }

  // Default recommendations
  let recs = {
    interest: dominant,
    tool: {
      name: "Luyện Pitching AI",
      link: "pitching.html",
      icon: "🔥 VOICE AI",
      desc: "Luyện thuyết trình giải pháp, phản xạ xử lý phản đối từ khách hàng Enterprise bằng AI Voice."
    },
    ebook: {
      id: "ebook-mindset-bd",
      title: "Tư Duy BD \"Thép\" & Tâm Lý Học B2B Mindset",
      desc: "Giải mã tâm lý khách hàng B2B, vượt qua rào cản từ chối giá và xây dựng tư duy chốt deal vững chắc.",
      icon: "🧠",
      coverImage: "ebook-covers/cover-mindset-bd.png"
    },
    article: {
      id: "bd-fullstack-article",
      title: "Chân dung BD 'Fullstack': Từ Tư Duy Đến Thực Chiến !",
      desc: "Phân tích lộ trình chuyển mình của một BD hiện đại - Làm chủ cả Mindsets, Skillsets và AI Toolsets.",
      link: "https://vn.linkedin.com/pulse/ch%C3%A2n-dung-bd-fullstack-t%E1%BB%AB-t%C6%B0-duy-%C4%91%E1%BA%BFn-th%E1%BB%B1c-chi%E1%BA%BFn-t%C3%A2n-v%C3%B5-ph%C6%B0%E1%BB%9Bc-ptunc"
    }
  };

  if (dominant === 'compliance') {
    recs.tool = {
      name: "Tính Lương Gross - Net",
      link: "salary.html",
      icon: "💸 NET GROSS",
      desc: "Quy đổi lương Gross/Net chính xác, tính toán hoa hồng doanh số B2B thực tế không lo hụt chi phí."
    };
    recs.ebook = {
      id: "ebook-kpi-funnel",
      title: "Ma Trận Phễu KPI & Quy Đổi Doanh Thu B2B",
      desc: "Bảng tính & cẩm nang thiết lập phễu ngược Inbound & Outbound, tính toán hoa hồng thực nhận của BD.",
      icon: "📊",
      coverImage: "ebook-covers/cover-kpi-funnel.png"
    };
    recs.article = {
      id: "8th-bd-tips",
      title: "8th BD Tips: Khi nào một BD chuyên nghiệp cần dũng cảm nói \"KHÔNG\"?",
      desc: "Nghệ thuật loại bỏ các thương vụ độc hại và tranh chấp hoa hồng không rõ ràng.",
      link: "https://vn.linkedin.com/pulse/8th-bd-tips-khi-n%C3%A0o-m%E1%BB%99t-chuy%C3%AAn-nghi%E1%BB%87p-c%E1%BA%A7n-d%C5%A9ng-c%E1%BA%A3m-n%C3%B3i-t%C3%A2n-v%C3%B5-ph%C6%B0%E1%BB%9Bc-deryc"
    };
  } else if (dominant === 'pitching') {
    recs.tool = {
      name: "Luyện Pitching AI",
      link: "pitching.html",
      icon: "🔥 VOICE AI",
      desc: "Môi trường giả lập đàm phán giải pháp cấp cao B2B trực quan bằng giọng nói AI."
    };
    recs.ebook = {
      id: "ebook-b2b-language",
      title: "Bộ Cẩm Nang Ngôn Từ B2B BD (5 Pha Chuyển Mình)",
      desc: "Cách loại bỏ 5 cụm từ làm mất uy thế thương mại và nâng cấp ngôn từ chốt deal đỉnh cao.",
      icon: "🗣️",
      coverImage: "ebook-covers/cover-b2b-language.png"
    };
    recs.article = {
      id: "9th-bd-tips",
      title: "9th BD Tips: \"Giỏi giao tiếp\" chưa chắc \"giỏi chốt deal\"",
      desc: "Phân biệt giữa giao tiếp quan hệ xã giao thông thường và năng lực đàm phán thương mại thực chiến.",
      link: "https://vn.linkedin.com/pulse/9th-bd-tips-gi%E1%BB%8Fi-giao-ti%E1%BA%BFp-ch%C6%B0a-ch%E1%BA%AFc-ch%E1%BB%91t-deal-b%E1%BA%ABy-t%C3%A2m-t%C3%A2n-v%C3%B5-ph%C6%B0%E1%BB%9Bc-m66re"
    };
  } else if (dominant === 'outreach') {
    recs.tool = {
      name: "AI Email Assistant",
      link: "email-assistant.html",
      icon: "✍️ EMAIL AI",
      desc: "Trợ lý soạn thảo email cold outreach tỷ lệ phản hồi cao, đàm phán thương mại qua thư điện tử."
    };
    recs.ebook = {
      id: "ebook-linkedin-2026",
      title: "Chiến Lược Social Selling & LinkedIn BD 2026",
      desc: "Tiếp cận Person-in-Charge qua LinkedIn, tối ưu hồ sơ cá nhân để tăng tỷ lệ mở email.",
      icon: "💼",
      coverImage: "ebook-covers/cover-linkedin-2026.png"
    };
    recs.article = {
      id: "10th-bd-tips",
      title: "10th BD Tips: \"Gửi anh bảng giá tham khảo được không?\" – Cạm bẫy ngọt ngào",
      desc: "Tránh dập tắt cơ hội chốt deal sớm bằng kịch bản email điều hướng thông minh.",
      link: "https://vn.linkedin.com/pulse/10th-bd-tips-g%E1%BB%ADi-anh-b%E1%BA%A3ng-gi%C3%A1-tham-kh%E1%BA%A3o-%C4%91%C6%B0%E1%BB%A3c-kh%C3%B4ng-c%E1%BA%A1m-t%C3%A2n-v%C3%B5-ph%C6%B0%E1%BB%9Bc-jwrxc"
    };
  } else if (dominant === 'finder') {
    recs.tool = {
      name: "B2B PIC Finder",
      link: "finder.html",
      icon: "PRO TOOL",
      desc: "Xác thực danh tính, email và số điện thoại của Person-in-Charge tại doanh nghiệp mục tiêu."
    };
    recs.ebook = {
      id: "ebook-fake-lead",
      title: "Cẩm Nang Nhận Diện & Loại Bỏ Fake Lead B2B",
      desc: "Nhận diện khách hàng ảo, tránh lãng phí thời gian chào hàng cho các công ty không có ngân sách thực.",
      icon: "🕵️",
      coverImage: "ebook-covers/cover-fake-lead.png"
    };
    recs.article = {
      id: "bd-fullstack-article",
      title: "Chân dung BD 'Fullstack': Từ Tư Duy Đến Thực Chiến !",
      desc: "Tích hợp đa kỹ năng tìm kiếm khách hàng, viết email và làm chủ AI Toolsets hiệu quả.",
      link: "https://vn.linkedin.com/pulse/ch%C3%A2n-dung-bd-fullstack-t%E1%BB%AB-t%C6%B0-duy-%C4%91%E1%BA%BFn-th%E1%BB%B1c-chi%E1%BA%BFn-t%C3%A2n-v%C3%B5-ph%C6%B0%E1%BB%9Bc-ptunc"
    };
  }

  return res.status(200).json(recs);
};
