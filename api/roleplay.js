const https = require('https');

// Local Fallback Generators
function generateLocalContext(scenario, industry, size, personality, product, language = 'vi') {
  const isEn = language === 'en';
  const companyName = `${size === 'Startup' ? 'NextGen' : size === 'SME' ? 'VietCorp' : 'GlobalGroup'} ${industry}`;
  const timeline = isEn 
    ? (size === 'Startup' ? '2-4 weeks' : size === 'SME' ? '1-2 months' : '3-6 months')
    : (size === 'Startup' ? '2-4 tuần' : size === 'SME' ? '1-2 tháng' : '3-6 tháng');
  const budget = size === 'Startup' ? '50-100M VND/year' : size === 'SME' ? '200-500M VND/year' : '1.5-3B VND/year';
  
  return {
    company: companyName,
    currentChallenges: isEn 
      ? `Manual management processes are not synchronized, data is fragmented, and human resources are overloaded.`
      : `Quy trình quản lý thủ công chưa đồng bộ, dữ liệu phân mảnh và nhân sự quá tải.`,
    budget: budget,
    painPoints: isEn
      ? `Operational costs are rising but business efficiency is stalling, losing contact details.`
      : `Chi phí vận hành tăng cao nhưng hiệu quả kinh doanh chững lại, thất thoát thông tin liên lạc.`,
    existingSolutions: isEn
      ? `Using Excel sheets combined with Zalo/Slack chat and separate software tools.`
      : `Sử dụng file Excel kết hợp chat Zalo/Slack và một số phần mềm rời rạc.`,
    buyingStage: isEn
      ? `Researching and comparing available market solutions.`
      : `Đang tìm hiểu và so sánh các giải pháp trên thị trường.`,
    urgency: isEn
      ? `High-medium, aiming to deploy before the next business quarter.`
      : `Trung bình khá, muốn triển khai trước thềm quý kinh doanh tới.`,
    decisionMakers: isEn
      ? (size === 'Enterprise' ? 'CEO, CIO, Head of Procurement' : 'CEO and Operations Manager')
      : (size === 'Enterprise' ? 'CEO, Giám đốc CNTT, Trưởng phòng Mua hàng' : 'CEO và Quản lý vận hành'),
    timeline: timeline
  };
}

function getLocalChatResponse(message, history, context, config, product, language = 'vi') {
  const personality = config.personality || 'Analytical';
  const difficulty = config.difficulty || 'Intermediate';
  const isEn = language === 'en';
  
  let reply = '';
  let coachHint = null;

  const lowerMsg = message.toLowerCase();
  const turnCount = history ? history.length : 0;
  
  if (isEn) {
    if (turnCount <= 1) {
      reply = `Thank you. I see your product is ${product.productName || 'the software solution'}. Could you explain how it specifically addresses our current issues with operational overhead?`;
      coachHint = `Clearly define your product value and align it with the customer's pain points.`;
    } else if (turnCount <= 3) {
      if (personality === 'Skeptical' || personality === 'Analytical') {
        reply = `That sounds good, but do you have concrete data or case studies showing this actual impact in our industry? Vague claims don't work for us.`;
        coachHint = `Share social proof, reference key numbers or propose sending a case study document.`;
      } else if (personality === 'Procurement' || personality === 'Aggressive') {
        reply = `Pricing is our main issue. Your license costs seem steep. Can you offer a trial period or a 20% volume discount?`;
        coachHint = `Offer a limited-time pilot or link discounts to a longer contract commit.`;
      } else {
        reply = `Our team is quite busy. How long does onboarding typically take, and does it require high effort from our tech team?`;
        coachHint = `Emphasize your dedicated customer success onboarding support and low setup time.`;
      }
    } else if (turnCount <= 5) {
      reply = `I see the value. However, our CFO needs to sign off on this. Can you send a formal proposal and a draft NDA so we can evaluate it internally?`;
      coachHint = `Agree to send the deck, and request a calendar invitation for a follow-up session next week.`;
    } else {
      if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('discount')) {
        reply = `Cost is definitely a gatekeeper. If you want us to proceed, we need your absolute best pricing.`;
        coachHint = `Acknowledge cost concerns but keep the focus on ROI value.`;
      } else {
        reply = `Alright. Let's align on the next steps. Send me the technical documentation and we will discuss it in our next meeting.`;
        coachHint = `Wrap up, confirm email address, and schedule a next touchpoint.`;
      }
    }
  } else {
    // Custom response logic based on stakeholder personality (Vietnamese)
    if (turnCount <= 1) {
      reply = `Cảm ơn bạn. Tôi thấy sản phẩm bên bạn là ${product.productName || 'giải pháp phần mềm'}. Bạn có thể chia sẻ cụ thể công cụ này giúp tối ưu hóa chi phí vận hành cho bên tôi bằng cách nào không?`;
      coachHint = `Tập trung nói về giải pháp giải quyết điểm đau vận hành của khách hàng.`;
    } else if (turnCount <= 3) {
      if (personality === 'Skeptical' || personality === 'Analytical') {
        reply = `Nghe thì có vẻ ổn, nhưng bên bạn có số liệu thực tế hoặc case study nào chứng minh hiệu quả trong ngành này chưa? Bên tôi cần số liệu thật.`;
        coachHint = `Đưa ra dẫn chứng thực tế (ví dụ: giúp đối tác A tăng 25% hiệu suất) hoặc cam kết gửi file.`;
      } else if (personality === 'Procurement' || personality === 'Aggressive') {
        reply = `Vấn đề lớn nhất là ngân sách. Chi phí bên bạn đang cao hơn ngân sách dự kiến của chúng tôi. Liệu bên bạn có chính sách chiết khấu 20% cho năm đầu không?`;
        coachHint = `Giữ vững giá trị sản phẩm, đề xuất gói dùng thử nhỏ hoặc cam kết dài hạn để giảm giá.`;
      } else {
        reply = `Đội ngũ nhân sự bên tôi đang rất bận. Thời gian triển khai tích hợp mất bao lâu, và có cần đội kỹ thuật hỗ trợ nhiều không?`;
        coachHint = `Nhấn mạnh quy trình triển khai nhanh và cam kết hỗ trợ 24/7 từ đội ngũ chăm sóc khách hàng.`;
      }
    } else if (turnCount <= 5) {
      reply = `Tôi hiểu giá trị rồi. Nhưng quyết định cuối cùng vẫn thuộc về ban giám đốc. Bạn có thể gửi giúp tôi bản đề xuất (proposal) chi tiết kèm NDA qua email không?`;
      coachHint = `Đồng ý gửi tài liệu và đề xuất đặt lịch hẹn cuộc họp tiếp theo có sự tham gia của sếp.`;
    } else {
      if (lowerMsg.includes('giá') || lowerMsg.includes('chi phí') || lowerMsg.includes('giảm')) {
        reply = `Mức giá này thực sự cần được cân nhắc kỹ. Bạn hãy gửi cho tôi bảng so sánh tính năng và chi phí với các gói nhỏ hơn nhé.`;
        coachHint = `Giới thiệu các option gói dịch vụ linh hoạt hơn để khách hàng lựa chọn.`;
      } else {
        reply = `Được rồi. Hãy gửi email proposal chi tiết cho tôi. Tôi sẽ thảo luận lại với phòng ban rồi phản hồi bạn sớm.`;
        coachHint = `Xác nhận thông tin liên lạc và chốt lịch gọi lại tuần sau.`;
      }
    }
  }

  // General heuristic coach tips if user is talking too much
  if (message.length > 250) {
    coachHint = isEn 
      ? `Your message is a bit long. Keep paragraphs short and ask interactive questions to keep the client engaged.`
      : `Bạn đang nói hơi dài. Hãy ngắt câu ngắn và đặt câu hỏi tương tác để khách hàng chia sẻ thêm.`;
  }

  return { reply, coachHint, endSession: false };
}

function calculateLocalEvaluation(transcript, context, config, product) {
  const userMessages = transcript.filter(m => m.role === 'user');
  
  let score = 75;
  const strengths = [];
  const weaknesses = [];
  const missedOpportunities = [];
  
  // Basic heuristics based on user messages
  let hasAskedBudget = false;
  let hasAskedTimeline = false;
  let questionCount = 0;

  userMessages.forEach(m => {
    const text = m.content.toLowerCase();
    if (text.includes('ngân sách') || text.includes('chi phí') || text.includes('budget') || text.includes('bao nhiêu')) {
      hasAskedBudget = true;
    }
    if (text.includes('khi nào') || text.includes('tiến độ') || text.includes('lộ trình') || text.includes('timeline')) {
      hasAskedTimeline = true;
    }
    const matches = text.match(/\?/g);
    if (matches) questionCount += matches.length;
  });

  if (hasAskedBudget) {
    score += 5;
    strengths.push("Đã chủ động tìm hiểu ngân sách của khách hàng.");
  } else {
    score -= 5;
    weaknesses.push("Chưa đào sâu khai thác ngân sách (Budget) trong buổi họp.");
    missedOpportunities.push("Bỏ lỡ cơ hội xác minh khả năng chi trả sớm để phân loại lead.");
  }

  if (hasAskedTimeline) {
    score += 5;
    strengths.push("Khai thác tốt mốc thời gian (Timeline) triển khai của khách hàng.");
  } else {
    score -= 5;
    weaknesses.push("Thiếu thông tin về mốc thời gian khách hàng mong muốn chốt deal.");
  }

  if (questionCount >= 4) {
    score += 5;
    strengths.push("Sử dụng tốt các câu hỏi mở để lắng nghe khách hàng (Discovery tốt).");
  } else {
    score -= 10;
    weaknesses.push("Thuyết trình quá nhiều thay vì đặt câu hỏi khám phá nhu cầu.");
  }

  score = Math.max(40, Math.min(100, score));

  // Category breakdowns
  const scores = {
    opening: Math.round(score * 0.95),
    discovery: hasAskedBudget && hasAskedTimeline ? 90 : 70,
    activeListening: Math.round(score * 1.02),
    problemDiagnosis: questionCount >= 3 ? 85 : 65,
    valueSelling: Math.round(score * 0.98),
    productKnowledge: 85,
    businessAcumen: 80,
    handlingObjections: 75,
    negotiation: 70,
    communication: Math.round(score * 1.05),
    confidence: 80,
    closing: 65
  };

  return {
    score,
    scores,
    strengths: strengths.length > 0 ? strengths : ["Giao tiếp tự tin, mạch lạc."],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Cần tập trung đặt nhiều câu hỏi mở chất lượng hơn."],
    missedOpportunities: missedOpportunities.length > 0 ? missedOpportunities : ["Nên tận dụng các case study thực tế để tạo sự tin tưởng."],
    questionsNotAsked: [
      "Anh/chị có thể chia sẻ cụ thể hơn về những rào cản kỹ thuật nếu tích hợp giải pháp mới không?",
      "Quy trình duyệt ngân sách và ký kết hợp đồng bên mình thường mất bao lâu?"
    ],
    suggestedAnswers: [
      {
        moment: "Khi khách hàng chê giá sản phẩm cao hơn đối thủ",
        userResponse: userMessages[0] ? userMessages[0].content : "Dạ vâng, bên em có thể cân đối bớt chút giá ạ.",
        suggestedResponse: "Tôi hiểu chi phí là yếu tố rất quan trọng. Tuy nhiên, so với đối thủ, giải pháp của bên tôi giúp giảm 20% tỷ lệ lỗi vận hành, tức là tiết kiệm thêm hàng trăm triệu đồng mỗi tháng cho doanh nghiệp. Anh/chị có muốn xem chi tiết bài toán kinh tế này không?"
      }
    ],
    salesFramework: config.difficulty === 'Expert' ? 'MEDDICC' : 'BANT',
    estimatedSkillLevel: score >= 90 ? 'Expert' : score >= 80 ? 'Advanced' : score >= 65 ? 'Intermediate' : 'Beginner',
    resources: [
      "https://bd-tips.vercel.app/library.html#L123 (Xem cẩm nang xử lý từ chối B2B)",
      "https://bd-tips.vercel.app/course.html (Khóa học BD B2B Thực chiến Peter Vo)"
    ]
  };
}

module.exports = async (req, res) => {
  // CORS Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, scenario, industry, size, difficulty, personality, product, history, context, message, liveCoach, language, voiceGender } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (action === 'generateContext') {
    const isEn = language === 'en';
    if (!apiKey) {
      const localContext = generateLocalContext(scenario, industry, size, personality, product, language);
      return res.status(200).json({ context: localContext, isOffline: true });
    }

    try {
      const systemPrompt = `You are an elite B2B sales trainer.
Generate a realistic, detailed sales client prospect profile in JSON format based on the following configurations:
Scenario: ${scenario}
Industry: ${industry}
Company Size: ${size}
Difficulty: ${difficulty}
Stakeholder Personality: ${personality}
Product Offered: ${JSON.stringify(product)}

Respond in the language: ${isEn ? 'English' : 'Vietnamese'}. All text fields inside the JSON must be entirely written in ${isEn ? 'English' : 'Vietnamese'}.
CRITICAL: Even if the product details or scenario descriptions are in a different language, you MUST write the entire output JSON text fields (company, currentChallenges, budget, painPoints, existingSolutions, buyingStage, urgency, decisionMakers, timeline) strictly and entirely in ${isEn ? 'English' : 'Vietnamese'}. Do not translate proper names of the product, but describe all features, challenges, and details in ${isEn ? 'English' : 'Vietnamese'}.

Respond ONLY with a valid JSON object matching the following structure. Do not wrap in markdown or code blocks:
{
  "company": "Realistic Company Name based on industry and size",
  "currentChallenges": "Specific operational or business problems they face",
  "budget": "Realistic budget numbers (in VND or USD)",
  "painPoints": "Core emotional and financial pain points of this client",
  "existingSolutions": "What solutions/competitors they are using currently",
  "buyingStage": "Current phase (e.g., Discovery, Evaluation, Ready to buy)",
  "urgency": "Urgency level (High/Medium/Low) and why",
  "decisionMakers": "List of roles involved in decision making",
  "timeline": "Timeline for deciding (e.g., 2 weeks, 3 months)"
}`;

      const requestBody = JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let responseData = '';
        apiRes.on('data', chunk => responseData += chunk);
        apiRes.on('end', () => {
          try {
            if (apiRes.statusCode !== 200) {
              const localContext = generateLocalContext(scenario, industry, size, personality, product, language);
              return res.status(200).json({ context: localContext, isOffline: true });
            }
            const parsed = JSON.parse(responseData);
            let textContent = parsed.candidates[0].content.parts[0].text.trim();
            if (textContent.startsWith('```')) {
              textContent = textContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
            }
            const resultJson = JSON.parse(textContent);
            res.status(200).json({ context: resultJson });
          } catch (e) {
            const localContext = generateLocalContext(scenario, industry, size, personality, product, language);
            res.status(200).json({ context: localContext, isOffline: true });
          }
        });
      });

      apiReq.on('error', () => {
        const localContext = generateLocalContext(scenario, industry, size, personality, product, language);
        res.status(200).json({ context: localContext, isOffline: true });
      });

      apiReq.write(requestBody);
      apiReq.end();
    } catch (err) {
      const localContext = generateLocalContext(scenario, industry, size, personality, product, language);
      res.status(200).json({ context: localContext, isOffline: true });
    }

  } else if (action === 'chat') {
    const isEn = language === 'en';
    if (!message) {
      return res.status(400).json({ error: 'Message is required for chat.' });
    }

    if (!apiKey) {
      const localChat = getLocalChatResponse(message, history, context, { scenario, industry, size, difficulty, personality }, product, language);
      return res.status(200).json({ reply: localChat.reply, coachHint: localChat.coachHint, isOffline: true });
    }

    try {
      // Build roleplay system instructions
      const historyPrompt = history.map(h => `${h.role === 'user' ? 'BD Representative (User)' : 'Client Stakeholder (AI)'}: "${h.content}"`).join('\n');
      
      const isMale = (voiceGender === 'male');
      const pronoun = isMale ? 'anh' : 'chị';
      const pronounCap = isMale ? 'Anh' : 'Chị';
      const forbiddenPronoun = isMale ? 'chị' : 'anh';
      const stakeholderTitle = isMale ? 'nam Stakeholder' : 'nữ Stakeholder';

      let scenarioInjection = '';
      const scTitle = (scenario || '').toLowerCase();
      if (scTitle.includes('cold') || scTitle.includes('lạnh')) {
        scenarioInjection = `=== TÌNH HUỐNG 1: FIRST COLD CALL ===
- Vai trò: buyer_role (Thư ký Gatekeeper hoặc Giám đốc bận rộn).
- Bối cảnh: Đang trong giờ làm việc, đột ngột nhận cuộc gọi từ số lạ.
- Phản ứng mẫu:
  + "${pronounCap} đang bận họp, em gửi thông tin qua email đi."
  + "Bên ${pronoun} có đối tác làm rồi, không có nhu cầu nhé."
  + "Bên em là công ty nào? Làm sao có số điện thoại này?"`;
      } else if (scTitle.includes('discovery') || scTitle.includes('nhu cầu')) {
        scenarioInjection = `=== TÌNH HUỐNG 2: DISCOVERY MEETING ===
- Vai trò: buyer_role (Head of Operation / Department Manager).
- Bối cảnh: Buổi họp tìm hiểu nhu cầu. Quy trình hiện tại đang gặp trục trặc nhưng ngại thay đổi.
- Phản ứng mẫu:
  + "Quy trình hiện tại tuy hơi chậm nhưng nhân viên dùng quen rồi, đổi mới phức tạp lắm."
  + "Sếp ${pronoun} chỉ quan tâm đến ROI và thời gian hòa vốn, bên em cam kết thế nào?"`;
      } else if (scTitle.includes('demo') || scTitle.includes('trình diễn')) {
        scenarioInjection = `=== TÌNH HUỐNG 3: PRODUCT DEMO ===
- Vai trò: buyer_role (End-user Lead & Manager).
- Bối cảnh: Đang xem BD demo giao diện/tính năng giải pháp.
- Phản ứng mẫu:
  + "Tính năng này phức tạp quá, nhân viên bên ${pronoun} không thạo công nghệ có dùng được không?"
  + "Demo thì mượt đấy, nhưng khi nạp data lớn vào thì hệ thống có bị lag không?"`;
      } else if (scTitle.includes('proposal') || scTitle.includes('đề xuất')) {
        scenarioInjection = `=== TÌNH HUỐNG 4: PROPOSAL PRESENTATION ===
- Vai trò: buyer_role (CFO / Business Unit Director).
- Bối cảnh: Đánh giá bản đề xuất chi tiết và báo giá.
- Phản ứng mẫu:
  + "Báo giá này cao hơn 40% so với ngân sách dự kiến của bên ${pronoun}."
  + "Có nhiều hạng mục trong proposal này ${pronoun} thấy không cần thiết, bỏ ra để giảm giá được không?"`;
      } else if (scTitle.includes('negotiation') || scTitle.includes('đàm phán')) {
        scenarioInjection = `=== TÌNH HUỐNG 5: CONTRACT NEGOTIATION ===
- Vai trò: buyer_role (Procurement Head / Giám đốc mua hàng).
- Bối cảnh: Đàm phán các điều khoản thương mại cuối cùng.
- Phản ứng mẫu:
  + "Chiết khấu thêm 15% và kéo dài thời hạn thanh toán thành 60 ngày thì ${pronoun} mới ký."
  + "Bên em phải cam kết phạt 20% giá trị hợp đồng nếu trễ tiến độ bàn giao."`;
      } else if (scTitle.includes('competitor') || scTitle.includes('đối thủ')) {
        scenarioInjection = `=== TÌNH HUỐNG 6: COMPETITOR CHALLENGE ===
- Vai trò: buyer_role (Decision Maker đang dùng giải pháp của đối thủ lớn).
- Bối cảnh: BD đang cố gắng thuyết phục chuyển đổi sang giải pháp mới.
- Phản ứng mẫu:
  + "Bên ${pronoun} đang dùng của bên X 3 năm nay rất ổn định. Vì sao ${pronoun} phải mạo hiểm đổi sang em?"
  + "Bên X hỗ trợ 24/7 và có thương hiệu lớn, công ty em còn mới quá."`;
      } else if (scTitle.includes('technical') || scTitle.includes('kỹ thuật') || scTitle.includes('bảo mật')) {
        scenarioInjection = `=== TÌNH HUỐNG 7: TECHNICAL & SECURITY REVIEW ===
- Vai trò: buyer_role (CTO / IT Lead).
- Bối cảnh: Đánh giá khả năng tích hợp, hạ tầng và bảo mật.
- Phản ứng mẫu:
  + "Data của bên ${pronoun} lưu ở đâu? Hệ thống có đạt chuẩn ISO 27001 hay SOC2 không?"
  + "API bên em là RESTful hay SOAP? Khả năng chịu tải đồng thời (Concurrent Users) là bao nhiêu?"`;
      } else {
        scenarioInjection = `=== TÌNH HUỐNG 8: CLOSING DEAL CALL ===
- Vai trò: buyer_role (CEO / General Manager).
- Bối cảnh: Cuộc gọi chốt đơn hàng cuối cùng nhưng khách hàng do dự.
- Phản ứng mẫu:
  + "Thôi để sang quý sau ${pronoun} cân nhắc lại nhé, dạo này ngân sách đang siết chặt."
  + "Nếu triển khai không đạt KPIs như cam kết thì bên em đền bù thế nào?"`;
      }

      const systemPrompt = `PHẦN 1: MASTER SYSTEM PROMPT
# ROLE & PERSONALITY
Bạn là một Khách hàng Doanh nghiệp B2B (B2B Buyer) có tính cách thực tế, bận rộn và khắt khe. 
Nhiệm vụ của bạn là nhập vai (Role-play) thành nhân vật khách hàng theo đúng ngữ cảnh được chọn để giúp nhân viên BD/Sales rèn luyện kỹ năng pitching thực tế.
Bạn đóng vai một ${stakeholderTitle} (luôn xưng hô "${pronoun}" / "mình" và gọi BD là "em" / "bên em" - TUYỆT ĐỐI không dùng "${forbiddenPronoun}", "bạn" hoặc "tôi" trong giao tiếp Việt Nam).

# PROFESSIONAL ROLE-PLAY FOCUS
- Nếu vị trí khách hàng (buyer_role) là "CEO" hoặc "Quản lý": Tập trung vào bài toán ROI (tỷ suất sinh lời), tác động chiến lược lên doanh thu, thời gian hòa vốn và sự tin cậy.
- Nếu vị trí khách hàng là "CTO", "CIO" hoặc "Kỹ thuật" hoặc "Tech Lead": Tập trung hỏi sâu về bảo mật dữ liệu, tích hợp hệ thống qua API, khả năng mở rộng (scalability) và thời gian bảo trì.
- Nếu vị trí khách hàng là "Mua hàng", "CFO" hoặc "Tài chính": Liên tục ép giá, yêu cầu chính sách chiết khấu, đàm phán kéo dài thời hạn thanh toán (ví dụ: công nợ 45-60 ngày) và phạt vi phạm tiến độ.

# CONTEXT VARIABLES (Nhận từ hệ thống Antigravity)
- Kịch bản được chọn (selected_scenario): ${scenario}
- Lĩnh vực khách hàng (target_industry): ${industry}
- Vị trí khách hàng (buyer_role): ${personality}
- Sản phẩm/Giải pháp của BD (bd_solution): ${product ? product.productName : ''} (Thông tin giải pháp: ${JSON.stringify(product)})
- Cấp độ khó (difficulty_level): ${difficulty} (Dễ / Trung bình / Khó)

# CORE BEHAVIOR RULES (QUY TẮC BẮT BỘC)
1. LUÔN GIỮ VAI (STAY IN CHARACTER):
   - Không bao giờ thoát vai, không xưng "Tôi là AI" hay giải thích prompt trong lúc thoại.
   - Trả lời tự nhiên, ngắn gọn như cuộc gọi/buổi họp thực tế. Nếu BD nói dài dòng hoặc đọc slide, hãy ngắt lời hoặc tỏ ra sốt ruột.
   - Sử dụng văn phong nói Việt Nam khẩu ngữ tự nhiên, ngắn gọn (5-15 từ), kèm từ đệm thực tế ("thực ra là...", "ừm", "ờ", "cái này...", "nhỉ", "dạ").

2. MỨC ĐỘ THỬ THÁCH THEO CAP ĐỘ:
   - Dễ: Cởi mở, đặt câu hỏi cơ bản, dễ bị thuyết phục nếu BD đưa ra lợi ích rõ ràng.
   - Trung bình: Đưa ra 2-3 phản đối về giá, thời gian, rủi ro hoặc đối thủ.
   - Khó: Hoài nghi cao, hay vặn quẹo logic, ép giá, bận rộn, đe dọa kết thúc cuộc gọi nếu BD không tạo được giá trị trong 3 câu đầu.

3. DYNAMIC OBJECTIONS (PHẢN ĐỐI ĐỘNG):
   - Đưa ra các rào cản thực tế về: Ngân sách, Sự chấp thuận của Sếp/HĐQT, Quy trình phức tạp, Hoài nghi hiệu quả thực tế, Chi phí chuyển đổi từ hệ thống cũ. Liên hệ trực tiếp với giải pháp và nỗi đau của ${product ? product.productName : ''}.

4. QUY TRÌNH KẾT THÚC & XUẤT SCORECARD:
   - Khi BD gõ \`/end\` hoặc khi cuộc thoại kết thúc tự nhiên, hoặc AI cúp máy, bạn trả về "endSession": true trong JSON.
   - Lưu ý: Không được tự cúp máy sớm trong 3 lượt đầu của cuộc thoại (bắt buộc set endSession = false).

PHẦN 2: SCENARIO INJECTION PROMPTS
${scenarioInjection}

Nếu liveCoach là enabled (${liveCoach ? 'true' : 'false'}), cung cấp một gợi ý ngắn (5-10 từ) hỗ trợ sales cho BD vào trường "coachHint".

Respond ONLY with a valid JSON object matching the following structure. Do not wrap in markdown or backticks:
{
  "reply": "Your response as the client stakeholder (xưng hô ${pronoun} - em)",
  "coachHint": "Brief sales tip for the coach panel, or null",
  "endSession": true or false
}`;

      const chatTurns = [];
      // Skip the very first model welcome turn to ensure Gemini contents starts with 'user'
      const chatHistoryToUse = (history.length > 0 && history[0].role === 'model') 
        ? history.slice(1) 
        : history;

      chatHistoryToUse.forEach(h => {
        chatTurns.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        });
      });
      chatTurns.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const requestBody = JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: chatTurns,
        generationConfig: { responseMimeType: "application/json" }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let responseData = '';
        apiRes.on('data', chunk => responseData += chunk);
        apiRes.on('end', () => {
          try {
            if (apiRes.statusCode !== 200) {
              const localChat = getLocalChatResponse(message, history, context, { scenario, industry, size, difficulty, personality }, product, language);
              return res.status(200).json({ reply: localChat.reply, coachHint: localChat.coachHint, endSession: !!localChat.endSession, isOffline: true });
            }
            const parsed = JSON.parse(responseData);
            let textContent = parsed.candidates[0].content.parts[0].text.trim();
            if (textContent.startsWith('```')) {
              textContent = textContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
            }
            const resultJson = JSON.parse(textContent);
            let endSession = !!resultJson.endSession;
            // Programmatic safety check: Do not allow active termination in the first 3 turns
            if (history && history.length <= 5) {
              endSession = false;
            }
            res.status(200).json({ reply: resultJson.reply, coachHint: resultJson.coachHint, endSession: endSession });
          } catch (e) {
            const localChat = getLocalChatResponse(message, history, context, { scenario, industry, size, difficulty, personality }, product, language);
            let endSession = !!localChat.endSession;
            if (history && history.length <= 5) {
              endSession = false;
            }
            res.status(200).json({ reply: localChat.reply, coachHint: localChat.coachHint, endSession: endSession, isOffline: true });
          }
        });
      });

      apiReq.on('error', () => {
        const localChat = getLocalChatResponse(message, history, context, { scenario, industry, size, difficulty, personality }, product, language);
        res.status(200).json({ reply: localChat.reply, coachHint: localChat.coachHint, endSession: !!localChat.endSession, isOffline: true });
      });

      apiReq.write(requestBody);
      apiReq.end();
    } catch (err) {
      const localChat = getLocalChatResponse(message, history, context, { scenario, industry, size, difficulty, personality }, product, language);
      res.status(200).json({ reply: localChat.reply, coachHint: localChat.coachHint, endSession: !!localChat.endSession, isOffline: true });
    }

  } else if (action === 'evaluateSession') {
    if (!history || history.length === 0) {
      return res.status(400).json({ error: 'Transcript history is required for evaluation.' });
    }

    const userMessages = history.filter(h => h.role === 'user');
    if (userMessages.length === 0) {
      const isEn = language === 'en';
      const emptyReport = {
        score: 0,
        scores: {
          opening: 0, discovery: 0, activeListening: 0, problemDiagnosis: 0,
          valueSelling: 0, productKnowledge: 0, businessAcumen: 0,
          handlingObjections: 0, negotiation: 0, communication: 0,
          confidence: 0, closing: 0
        },
        strengths: isEn ? ["None recorded."] : ["Chưa ghi nhận điểm mạnh."],
        weaknesses: isEn ? ["No response from the sales representative (User)."] : ["Không có phản hồi nào từ đại diện bán hàng (User)."],
        missedOpportunities: isEn ? ["You ended the session without speaking to the client."] : ["Bạn đã kết thúc cuộc họp mà không nói gì với khách hàng."],
        questionsNotAsked: isEn ? ["You must start the conversation and ask questions to discover customer needs."] : ["Bạn cần bắt đầu hội thoại và đặt các câu hỏi khám phá nhu cầu khách hàng."],
        suggestedAnswers: [],
        salesFramework: "N/A",
        estimatedSkillLevel: "Beginner",
        resources: ["https://bd-tips.vercel.app/library.html"]
      };
      return res.status(200).json({ report: emptyReport });
    }

    if (!apiKey) {
      const localEval = calculateLocalEvaluation(history, context, { scenario, industry, size, difficulty, personality }, product);
      return res.status(200).json({ report: localEval, isOffline: true });
    }

    try {
      const transcriptPrompt = history.map(h => `${h.role === 'user' ? 'BD Representative (User)' : 'Client Stakeholder (AI)'}: "${h.content}"`).join('\n');
      
      const systemPrompt = `You are a B2B sales evaluator and master performance coach.
Critically evaluate the following sales simulator transcript based on consultative selling frameworks (BANT, SPIN, MEDDICC).
Meeting Context:
${JSON.stringify(context)}
Product Details:
${JSON.stringify(product)}

Respond ONLY with a valid JSON object matching the following structure. Do not wrap in code blocks:
{
  "score": (integer 0 to 100 overall score),
  "scores": {
    "opening": (0 to 100),
    "discovery": (0 to 100),
    "activeListening": (0 to 100),
    "problemDiagnosis": (0 to 100),
    "valueSelling": (0 to 100),
    "productKnowledge": (0 to 100),
    "businessAcumen": (0 to 100),
    "handlingObjections": (0 to 100),
    "negotiation": (0 to 100),
    "communication": (0 to 100),
    "confidence": (0 to 100),
    "closing": (0 to 100)
  },
  "strengths": ["bullet point strengths of the user"],
  "weaknesses": ["bullet point weaknesses of the user"],
  "missedOpportunities": ["opportunities missed during the talk"],
  "questionsNotAsked": ["critical questions the user should have asked"],
  "suggestedAnswers": [
    {
      "moment": "Brief description of the scenario moment",
      "userResponse": "Actual response text from user",
      "suggestedResponse": "Better recommended response text to use next time"
    }
  ],
  "salesFramework": "SPIN / BANT / MEDDICC / Solution Selling / Challenger",
  "estimatedSkillLevel": "Beginner / Intermediate / Advanced / Expert",
  "resources": ["List of URLs/books/methods to improve"]
}

Transcript:
${transcriptPrompt}`;

      const requestBody = JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let responseData = '';
        apiRes.on('data', chunk => responseData += chunk);
        apiRes.on('end', () => {
          try {
            if (apiRes.statusCode !== 200) {
              const localEval = calculateLocalEvaluation(history, context, { scenario, industry, size, difficulty, personality }, product);
              return res.status(200).json({ report: localEval, isOffline: true });
            }
            const parsed = JSON.parse(responseData);
            let textContent = parsed.candidates[0].content.parts[0].text.trim();
            if (textContent.startsWith('```')) {
              textContent = textContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
            }
            const resultJson = JSON.parse(textContent);
            res.status(200).json({ report: resultJson });
          } catch (e) {
            const localEval = calculateLocalEvaluation(history, context, { scenario, industry, size, difficulty, personality }, product);
            res.status(200).json({ report: localEval, isOffline: true });
          }
        });
      });

      apiReq.on('error', () => {
        const localEval = calculateLocalEvaluation(history, context, { scenario, industry, size, difficulty, personality }, product);
        res.status(200).json({ report: localEval, isOffline: true });
      });

      apiReq.write(requestBody);
      apiReq.end();
    } catch (err) {
      const localEval = calculateLocalEvaluation(history, context, { scenario, industry, size, difficulty, personality }, product);
      res.status(200).json({ report: localEval, isOffline: true });
    }

  } else {
    res.status(400).json({ error: 'Invalid action.' });
  }
};
