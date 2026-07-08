const https = require('https');

// Helper to count words and estimate reading time
function estimateReadingTime(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round((words / 200) * 60)); // 200 words per minute
}

// Simple rule-based spam check
function checkSpamWords(text) {
  if (!text) return [];
  const spamKeywords = [
    'free', '100%', 'click here', 'buy now', 'promotion', 'guaranteed', 'no risk',
    'miễn phí', 'nhấp vào đây', 'mua ngay', 'khuyến mãi', 'cam kết', 'uy tín nhất', 'rẻ nhất'
  ];
  const found = [];
  const lowerText = text.toLowerCase();
  spamKeywords.forEach(word => {
    if (lowerText.includes(word)) {
      found.push(word);
    }
  });
  return found;
}

// Local offline fallback for evaluation
function localEvaluateFallback(emailContent, recipientRole, industry, tone, language) {
  const isVi = language === 'vi';
  const spamWords = checkSpamWords(emailContent);
  const readingTime = estimateReadingTime(emailContent);
  const wordCount = emailContent ? emailContent.trim().split(/\s+/).length : 0;
  
  let score = 70;
  const pros = [];
  const cons = [];
  const suggestions = [];

  if (wordCount > 50 && wordCount < 150) {
    score += 15;
    pros.push(isVi ? "Độ dài thư cực kỳ lý tưởng (50-150 từ)." : "Excellent length (50-150 words).");
  } else if (wordCount >= 150) {
    score -= 10;
    cons.push(isVi ? "Thư quá dài dòng, dễ bị đối tác bận rộn bỏ qua." : "Email is too long, busy prospects might ignore it.");
    suggestions.push(isVi ? "Rút ngắn độ dài thư dưới 150 từ để tăng tỷ lệ phản hồi." : "Trim the content to under 150 words to improve response rate.");
  } else {
    score -= 5;
    cons.push(isVi ? "Thư hơi ngắn, có thể chưa truyền tải đủ giá trị." : "Email is a bit brief, might lack clear value proposition.");
    suggestions.push(isVi ? "Bổ sung thêm 1 câu giới thiệu giải pháp cụ thể." : "Add a sentence explaining a specific solution.");
  }

  if (spamWords.length > 0) {
    score -= (spamWords.length * 5);
    cons.push(isVi ? `Chứa từ dễ bị bộ lọc thư rác chặn: ${spamWords.join(', ')}` : `Contains potential spam trigger words: ${spamWords.join(', ')}`);
    suggestions.push(isVi ? "Thay thế các từ nhạy cảm bằng từ ngữ chuyên nghiệp hơn." : "Replace promotional terms with professional vocabulary.");
  } else {
    pros.push(isVi ? "Không chứa từ khóa spam nhạy cảm." : "No spam trigger words detected.");
  }

  // Final score clamping
  score = Math.max(10, Math.min(100, score));

  const polishedVi = `Kính gửi ${recipientRole || 'đối tác'},\n\nTôi liên hệ từ doanh nghiệp chuyên cung cấp giải pháp cho ngành ${industry || 'B2B'}. Được biết công ty mình đang tối ưu hóa các quy trình vận hành, tôi hy vọng có cơ hội thảo luận ngắn.\n\nChúng tôi hỗ trợ đối tác giảm 15% chi phí và tự động hóa hệ thống. Anh/chị có sẵn sàng dành 10 phút thảo luận vào tuần tới không?\n\nTrân trọng,\n[Tên của bạn]`;
  const polishedEn = `Dear ${recipientRole || 'Partner'},\n\nI am reaching out from our B2B company specializing in solutions for the ${industry || 'Tech'} industry. I noticed your team is currently optimizing operations, and I believe we can help.\n\nWe assist businesses in reducing costs by 15% and automating workflows. Would you be open to a brief 10-minute call next Tuesday?\n\nBest regards,\n[Your Name]`;

  return {
    score,
    pros,
    cons,
    suggestions,
    spamWords,
    polishedDraft: isVi ? polishedVi : polishedEn,
    readingTimeSeconds: readingTime,
    isOffline: true
  };
}

// Local offline fallback for generation
function localGenerateFallback(prompt, company, recipientRole, industry, tone, language) {
  const isVi = language === 'vi';
  
  let subjectLines = [];
  let draft = '';

  if (isVi) {
    subjectLines = [
      `Giải pháp tối ưu quy trình cho ${company || 'quý công ty'}`,
      `Câu hỏi về tối ưu vận hành ngành ${industry || 'B2B'}`,
      `Đề xuất hợp tác từ đối tác ${industry || 'chuyên nghiệp'}`
    ];
    draft = `Kính gửi ${recipientRole || 'Anh/Chị'},\n\nTôi là [Tên của bạn] đại diện cho [Công ty của bạn]. Tôi liên hệ vì ấn tượng với những bước phát triển của ${company || 'quý công ty'} trong ngành ${industry || 'B2B'}.\n\nChúng tôi cung cấp giải pháp giúp doanh nghiệp giải quyết bài toán: ${prompt || 'tối ưu hóa quy trình và tăng trưởng doanh thu'}.\n\nKhông biết Anh/Chị có sẵn sàng dành 10 phút để trao đổi nhanh vào thứ Ba tuần tới không?\n\nTrân trọng,\n[Tên của bạn]`;
  } else {
    subjectLines = [
      `Quick question regarding operations at ${company || 'your company'}`,
      `Optimizing workflows for ${company || 'your company'}`,
      `Partnership proposal - ${industry || 'B2B Solutions'}`
    ];
    draft = `Dear ${recipientRole || 'Sir/Madam'},\n\nMy name is [Your Name] from [Your Company]. I am reaching out because I've been following ${company || 'your team'}'s growth in the ${industry || 'B2B'} sector.\n\nWe provide solutions specifically designed to help businesses address: ${prompt || 'optimizing workflows and driving efficiency'}.\n\nWould you be open to a quick 10-minute call next Tuesday to discuss further?\n\nBest regards,\n[Your Name]`;
  }

  return {
    draft,
    subjectLines,
    isOffline: true
  };
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, emailContent, recipientRole, industry, tone, language, prompt, company, geminiApiKey } = req.body;
  const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;

  if (action === 'evaluate') {
    if (!emailContent) {
      return res.status(400).json({ error: 'Email content is required for evaluation.' });
    }

    if (!apiKey) {
      // Return local fallback
      const fallbackResult = localEvaluateFallback(emailContent, recipientRole, industry, tone, language);
      return res.status(200).json(fallbackResult);
    }

    // Call Gemini API to evaluate
    try {
      const systemPrompt = `You are an expert B2B Cold Email Copywriter and deliverability expert.
Analyze the following B2B email and provide a detailed structured review in JSON format.
Target Recipient: ${recipientRole || 'Any'}
Target Recipient Industry: ${industry || 'Any'}
Desired Tone: ${tone || 'Professional'}
Output Language: ${language === 'en' ? 'English' : 'Vietnamese'}

Evaluation Criteria:
1. Subject line effectiveness & length.
2. Directness & brevity (keep under 150 words).
3. Low friction Call-to-Action (CTA).
4. Value proposition clarity (focusing on prospect's pain point rather than selling product features).

Respond ONLY with a valid JSON object matching the following structure. Do not wrap in markdown code blocks:
{
  "score": (integer 0 to 100 representing effectiveness),
  "pros": ["bullet points of what is done well"],
  "cons": ["bullet points of weaknesses or issues"],
  "suggestions": ["actionable recommendations for improvement"],
  "spamWords": ["words in the email likely to trigger spam filters, or empty array"],
  "polishedDraft": "Fully rewritten, highly optimized, drop-in replacement email draft",
  "readingTimeSeconds": (integer reading time based on word count)
}

Email content to analyze:
"${emailContent}"`;

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
          'Content-Length': requestBody.length
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let responseData = '';
        apiRes.on('data', chunk => responseData += chunk);
        apiRes.on('end', () => {
          try {
            if (apiRes.statusCode !== 200) {
              console.error('Gemini API Error status:', apiRes.statusCode, responseData);
              const fallbackResult = localEvaluateFallback(emailContent, recipientRole, industry, tone, language);
              return res.status(200).json(fallbackResult);
            }
            const parsed = JSON.parse(responseData);
            const textContent = parsed.candidates[0].content.parts[0].text;
            const resultJson = JSON.parse(textContent.trim());
            res.status(200).json(resultJson);
          } catch (e) {
            console.error('Failed to parse Gemini response, falling back:', e, responseData);
            const fallbackResult = localEvaluateFallback(emailContent, recipientRole, industry, tone, language);
            res.status(200).json(fallbackResult);
          }
        });
      });

      apiReq.on('error', (err) => {
        console.error('Gemini Request failed, falling back:', err);
        const fallbackResult = localEvaluateFallback(emailContent, recipientRole, industry, tone, language);
        res.status(200).json(fallbackResult);
      });

      apiReq.write(requestBody);
      apiReq.end();
    } catch (err) {
      console.error('Server error in evaluate:', err);
      const fallbackResult = localEvaluateFallback(emailContent, recipientRole, industry, tone, language);
      res.status(200).json(fallbackResult);
    }

  } else if (action === 'generate') {
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt/Idea is required for email generation.' });
    }

    if (!apiKey) {
      const fallbackResult = localGenerateFallback(prompt, company, recipientRole, industry, tone, language);
      return res.status(200).json(fallbackResult);
    }

    // Call Gemini API to generate
    try {
      const systemPrompt = `You are a world-class B2B Sales Development Representative (SDR) and outbound specialist.
Create a highly personalized, high-converting cold outreach email draft based on the user's idea.
Target Recipient: ${recipientRole || 'Any'}
Target Recipient Company: ${company || 'Any organization'}
Target Recipient Industry: ${industry || 'Any'}
Tone of Voice: ${tone || 'Concise & Value-driven'}
Output Language: ${language === 'en' ? 'English' : 'Vietnamese'}

Rules:
1. Keep the draft under 120 words.
2. Subject lines must be short, relevant, and avoid spam triggers.
3. Placeholders should be formatted in brackets like [Your Name] or [Your Company].
4. Include a very clear, low-friction call-to-action (e.g. asking for a 10-minute chat or sending a case study).

Respond ONLY with a valid JSON object matching the following structure. Do not wrap in markdown code blocks:
{
  "draft": "The generated email draft body",
  "subjectLines": ["Subject Option 1", "Subject Option 2", "Subject Option 3"]
}

User Outbound Outreach Idea:
"${prompt}"`;

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
          'Content-Length': requestBody.length
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let responseData = '';
        apiRes.on('data', chunk => responseData += chunk);
        apiRes.on('end', () => {
          try {
            if (apiRes.statusCode !== 200) {
              console.error('Gemini API Error status:', apiRes.statusCode, responseData);
              const fallbackResult = localGenerateFallback(prompt, company, recipientRole, industry, tone, language);
              return res.status(200).json(fallbackResult);
            }
            const parsed = JSON.parse(responseData);
            const textContent = parsed.candidates[0].content.parts[0].text;
            const resultJson = JSON.parse(textContent.trim());
            res.status(200).json(resultJson);
          } catch (e) {
            console.error('Failed to parse Gemini response, falling back:', e, responseData);
            const fallbackResult = localGenerateFallback(prompt, company, recipientRole, industry, tone, language);
            res.status(200).json(fallbackResult);
          }
        });
      });

      apiReq.on('error', (err) => {
        console.error('Gemini Request failed, falling back:', err);
        const fallbackResult = localGenerateFallback(prompt, company, recipientRole, industry, tone, language);
        res.status(200).json(fallbackResult);
      });

      apiReq.write(requestBody);
      apiReq.end();
    } catch (err) {
      console.error('Server error in generate:', err);
      const fallbackResult = localGenerateFallback(prompt, company, recipientRole, industry, tone, language);
      res.status(200).json(fallbackResult);
    }
  } else {
    res.status(400).json({ error: 'Invalid action. Must be evaluate or generate.' });
  }
};
