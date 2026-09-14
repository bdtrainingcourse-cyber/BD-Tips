/**
 * B2B Portal Floating AI Chat Widget with Smart Navigation Router
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dynamic HTML Injection ---
    const chatContainer = document.createElement('div');
    chatContainer.id = 'b2b-ai-chat-root';
    chatContainer.innerHTML = `
        <!-- Floating Launcher -->
        <div class="ai-chat-launcher" id="ai-chat-launcher" title="Hỏi Chú Cú BeeDee Thông Thái">
            <img src="bd_mascot.png?v=1.0.4" alt="BeeDee Mascot" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            <span class="launcher-online-dot"></span>
        </div>
 
        <!-- Chat Widget Panel -->
        <div class="ai-chat-widget" id="ai-chat-widget">
            <!-- Header -->
            <div class="chat-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="bd_mascot.png?v=1.0.4" alt="BeeDee" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--chat-primary);">
                    <div class="chat-header-info">
                        <h3 style="margin: 0; display: flex; align-items: center; gap: 6px;">BeeDee AI</h3>
                        <span style="font-size: 0.72rem; color: var(--chat-text-muted);">Chú Cú BeeDee Thông Thái</span>
                    </div>
                </div>
                <button class="chat-close-btn" id="chat-close-btn">&times;</button>
            </div>
 
            <!-- Messages Area -->
            <div class="chat-messages" id="chat-messages">
                <div class="chat-bubble-container bot">
                    <img src="bd_mascot.png?v=1.0.4" class="chat-bot-avatar" alt="BeeDee">
                    <div class="chat-bubble-content">
                        <div class="chat-bubble">
                            Xin chào! Tôi là <strong>chú cú BeeDee thông thái</strong>. Tôi có thể giúp bạn giải đáp các kỹ năng BD B2B, tra cứu nhanh Luật Lao động (với 15 tình huống thực tế) hoặc hướng dẫn sử dụng các công cụ trên Portal. Hôm nay tôi có thể hỗ trợ gì cho bạn?
                        </div>
                    </div>
                </div>
                
                <!-- Quick Suggestion Chips -->
                <div class="chat-suggestions" id="chat-suggestions">
                    <div class="suggestion-chip" data-question="Cách tính lương Net từ Gross?">Cách tính lương Net từ Gross?</div>
                    <div class="suggestion-chip" data-question="Tra cứu Công thức ARR, MRR, CAC, LTV?">Công thức ARR, MRR, CAC, LTV?</div>
                    <div class="suggestion-chip" data-question="Hết thử việc công ty im lặng thì sao?">Hết thử việc im lặng?</div>
                    <div class="suggestion-chip" data-question="Làm thế nào để Pitching dự án hiệu quả bằng AI?">Pitching dự án hiệu quả?</div>
                    <div class="suggestion-chip" data-question="Liên hệ trực tiếp Founder Peter Vo?">Liên hệ Founder Peter Vo?</div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Nhập câu hỏi của bạn..." autocomplete="off">
                <button class="chat-send-btn" id="chat-send-btn">
                    <svg viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // --- 2. DOM Elements Mapping ---
    const launcher = document.getElementById('ai-chat-launcher');
    const widget = document.getElementById('ai-chat-widget');
    const closeBtn = document.getElementById('chat-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const suggestionsContainer = document.getElementById('chat-suggestions');

    // --- 3. Offline Fallback Responses Database (Smart Router Rules) ---
    const offlineDatabase = [
        {
            keywords: [/lương/, /luong/, /salary/, /net/, /gross/, /tính tiền/, /thuế tncn/, /thue tncn/, /bảo hiểm xã hội/, /bhxh/i],
            reply: "Bạn có thể sử dụng **Trình Quy Đổi Lương Gross - Net** chuẩn xác nhất 2026. Công cụ hỗ trợ tính toán lương thực nhận, bảo hiểm đóng bắt buộc và thuế TNCN lũy tiến từng phần, kèm bảng hoa hồng OTE thực tế cho BD.\n\n*Gợi ý thêm:* Bạn có muốn tôi hướng dẫn cách tính lương làm thêm giờ (OT) hoặc giảm trừ gia cảnh không?",
            navTarget: "salary",
            navLabel: "⚡ Quy Đổi Lương Ngay"
        },
        {
            keywords: [/tính cách/, /tinh cach/, /trắc nghiệm/, /trac nghiem/, /phong cách bd/, /phong cach/, /cú thông thái/, /sư tử/, /đại bàng/, /cáo thợ săn/, /personality/i],
            reply: "Hãy thử ngay bài **Trắc Nghiệm 4 Phong Cách BD Thực Chiến**! Bạn sẽ khám phá mình thuộc mẫu chiến binh nào: Cú Thông Thái (Chiến lược), Sư Tử Chỉ Huy (Quyết đoán), Đại Bàng Săn Deal (Thống lĩnh) hay Cáo Linh Hoạt (Mềm dẻo), kèm lộ trình thăng tiến và quà tặng điểm thưởng.",
            navTarget: "personality-test",
            navLabel: "📊 Làm Test Tính Cách BD Ngay"
        },
        {
            keywords: [/email/, /soạn mail/, /soan mail/, /viết mail/, /viet mail/, /cold email/, /đánh giá email/, /danh gia email/, /outreach/i],
            reply: "Công cụ **AI Email Assistant** của chúng tôi giúp bạn đánh giá thang điểm sức mạnh của email B2B, tối ưu tỷ lệ mở (Open Rate) và viết lại email tiếp cận khách hàng doanh nghiệp tự động chuẩn 5 pha ngôn từ chuyên nghiệp.",
            navTarget: "email-assistant",
            navLabel: "✍️ Mở Trợ Lý Viết Email AI"
        },
        {
            keywords: [/kpi/, /phễu/, /pheu/, /doanh số/, /doanh so/, /conversion rate/, /tỷ lệ chuyển đổi/, /ty le chuyen doi/, /inbound/, /outbound/, /lead/i],
            reply: "Công cụ **Ma Trận Phễu KPI & Ước Tính Doanh Số B2B** giúp bạn thiết lập phễu ngược Inbound - Outbound, quy đổi chính xác số lượng lead, lịch hẹn meeting và tỷ lệ chốt hợp đồng cần đạt để hoàn thành doanh thu mục tiêu.",
            navTarget: "kpi-estimation",
            navLabel: "📈 Ước Tính Ma Trận KPI Ngay"
        },
        {
            keywords: [/nhiệm vụ/, /nhiem vu/, /quest/, /đổi quà/, /doi qua/, /trà sữa/, /tra sua/, /voucher/, /mốc 1/, /mốc 2/, /mốc 3/, /streak/, /điểm danh/, /quà tặng/i],
            reply: "Hệ thống **Nhiệm Vụ & Quà Tặng Tích Lũy BD** cho phép bạn duy trì chuỗi ngày học tập (Streak) và rủ đồng nghiệp tham gia để nhận ngay các mốc quà hấp dẫn: \n- **Mốc 1 (5 bạn):** 🥤 01 Ly Trà Sữa Size L mát lạnh\n- **Mốc 2 (10 bạn):** 💻 30 Phút Online 1-1 gỡ deal khó cùng anh Peter Võ\n- **Mốc 3 (15 bạn):** 🍽️ Buổi Lunch VIP 1-1 thân mật cố vấn sự nghiệp cùng anh Peter Võ.",
            navTarget: "quests",
            navLabel: "🎯 Xem Nhiệm Vụ & Đổi Quà"
        },
        {
            keywords: [/tìm pic/, /tim pic/, /pic finder/, /alumni vip/, /passcode/, /person in charge/, /mã vip/, /ma vip/, /học viên vip/i],
            reply: "Cổng **Alumni VIP (Tìm PIC Doanh Nghiệp)** là đặc quyền cao cấp dành riêng cho học viên Khóa BD Thực Chiến của anh Peter Võ. Bạn chỉ cần nhập Mã Passcode VIP (ví dụ: `BD-1272`) để mở khóa cổng tra cứu và gửi yêu cầu tìm thông tin quyết định viên của các doanh nghiệp mục tiêu.",
            navTarget: "finder",
            navLabel: "🔒 Vào Cổng Đặc Quyền Alumni VIP"
        },
        {
            keywords: [/cộng đồng/, /cong dong/, /community/, /diễn đàn/, /dien dan/, /thảo luận/, /thao luan/, /hỏi đáp/i],
            reply: "Hãy ghé thăm **Diễn Đàn Cộng Đồng BD Thực Chiến** để giao lưu, học hỏi kinh nghiệm thực tế, thảo luận các deal B2B hóc búa và kết nối mạng lưới cùng hàng nghìn anh em làm nghề Business Development trên toàn quốc.",
            navTarget: "community",
            navLabel: "💬 Tham Gia Diễn Đàn Cộng Đồng"
        },
        {
            keywords: [/thuật ngữ/, /glossary/, /arr/, /mrr/, /cac/, /ltv/, /formula/, /công thức/i],
            reply: "Thư viện BD cung cấp hơn **142+ Thuật ngữ B2B BD** được phân loại bài bản (Nội bộ Team BD, Khách hàng, Tiếng lóng BD & Chỉ số Tài chính), đi kèm **Công thức tính (Formula)** và ví dụ số liệu thực tế.\n\n*Ví dụ:* ARR = MRR × 12 | LTV/CAC Ratio = LTV / CAC.",
            navTarget: "library",
            navLabel: "📖 Tra Cứu Từ Điển Thuật Ngữ BD"
        },
        {
            keywords: [/thử việc/, /thu viec/i],
            reply: "Theo Điều 25 & 26 Bộ luật Lao động 2019, thời gian thử việc tối đa là **60 ngày** đối với vị trí chuyên môn (như BD/Sales) và mức lương thử việc phải đạt **ít nhất 85%** mức lương chính thức. Nếu công ty im lặng sau thử việc, bạn mặc nhiên trở thành nhân sự chính thức.\n\n*Gợi ý thêm:* Hãy tra cứu Tình huống 1 và Tình huống 9 trong Cổng Luật Lao Động để nắm rõ quyền lợi nhé!",
            navTarget: "labor-law",
            navLabel: "⚖️ Xem Chi Tiết Luật Thử Việc"
        },
        {
            keywords: [/nghỉ việc/, /nghi viec/, /thôi việc/, /thoi viec/, /báo trước/, /bao truoc/, /đơn phương chấm dứt/i],
            reply: "Theo quy định Điều 35 Bộ luật Lao động, thời hạn báo trước bắt buộc khi người lao động nghỉ việc là:\n- Ít nhất **45 ngày** (Hợp đồng không xác định thời hạn).\n- Ít nhất **30 ngày** (Hợp đồng xác định thời hạn 12-36 tháng).\nTự ý nghỉ đột ngột không báo trước sẽ không được hưởng trợ cấp thôi việc và phải bồi thường.",
            navTarget: "labor-law",
            navLabel: "📋 Xem Luật Nghỉ Việc & Đền Bù"
        },
        {
            keywords: [/luật/, /luat/, /sa thải/, /sa thai/, /bồi thường/, /tranh chấp/i],
            reply: "Cổng tra cứu **Luật Lao Động** của chúng tôi cung cấp đầy đủ các quy định về thử việc, hợp đồng, báo trước thôi việc và bảo hiểm xã hội, đi kèm **15 Case Study** tình huống tranh chấp lao động thực tế có dẫn nguồn luật chính thống.",
            navTarget: "labor-law",
            navLabel: "⚖️ Mở Cổng Luật Lao Động"
        },
        {
            keywords: [/ebook/, /thư viện/, /thu vien/, /bài viết/, /bai viet/, /sách/, /sach/i],
            reply: "Trang **Thư Viện** của chúng tôi cung cấp trọn bộ **9+ Ebook thực chiến B2B** độc quyền viết bởi Peter Võ (Mindset BD thép, Social Selling LinkedIn 2026, 9 Nguyên tắc chốt deal, Ngôn từ B2B...) để bạn tải hoàn toàn miễn phí.",
            navTarget: "library",
            navLabel: "📰 Tải Ebook & Bài Viết Thực Chiến"
        },
        {
            keywords: [/peter vo/, /tân võ phước/, /tan vo phuoc/, /liên hệ/, /lien he/, /zalo/, /sđt/, /sdt/, /tư vấn/, /founder/i],
            reply: "Bạn muốn kết nối & tư vấn trực tiếp cùng **Founder Peter Võ (Võ Phước Tân)** – Chuyên gia BD B2B & Partnership Strategy?\n\n- 📞 SĐT / Zalo: **0931.100.569**\n- ✉️ Email: **bdtraining@bdbinhdanhocvu.com**\n- 💼 LinkedIn: [LinkedIn Peter Võ](https://www.linkedin.com/in/vp-tan/)",
            navTarget: null,
            navLabel: "💬 Chat Zalo Trực Tiếp (0931100569)"
        },
        {
            keywords: [/chào/, /hello/, /hi/, /xin chào/, /chao ban/i],
            reply: "Xin chào! Rất vui được đồng hành cùng bạn. Tôi là chú cú BeeDee thông thái của BD Bình Dân Học Vụ. Bạn đang quan tâm đến công cụ hay thắc mắc nào về nghề BD hôm nay?",
            navTarget: null,
            navLabel: null
        },
        {
            keywords: [/cảm ơn/, /tạm biệt/, /thanks/, /bye/i],
            reply: "Dạ không có gì ạ! Rất vui được đồng hành cùng bạn. Hy vọng những thông tin của BeeDee hữu ích cho công việc của bạn. Chúc bạn chốt được nhiều deal lớn!",
            navTarget: null,
            navLabel: null
        }
    ];

    // --- 4. Event Handlers ---
    launcher.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', closeWidget);
    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Handle suggestion chips
    suggestionsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.suggestion-chip');
        if (!chip) return;
        const question = chip.dataset.question;
        chatInput.value = question;
        handleSend();
    });

    function toggleWidget() {
        widget.classList.toggle('open');
        launcher.classList.toggle('active');
        if (widget.classList.contains('open')) {
            chatInput.focus();
        }
    }
    window.toggleAIChatWidget = toggleWidget;

    function closeWidget() {
        widget.classList.remove('open');
        launcher.classList.remove('active');
    }

    // --- 5. Message Processing Logic ---
    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Hide suggestions on first send
        suggestionsContainer.classList.add('hidden');

        // Add user message bubble
        appendMessage('user', text);
        chatInput.value = '';

        // Add typing indicator
        const typingId = showTypingIndicator();

        try {
            // Attempt to hit Vercel API Endpoint
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            removeTypingIndicator(typingId);

            if (response.ok) {
                const data = await response.json();
                
                if (data.useFallback) {
                    // Endpoint configured but returned API Key warning
                    processLocalFallback(text);
                } else {
                    // Regular AI response
                    appendMessage('bot', data.reply);
                }
            } else {
                // API error fallback
                processLocalFallback(text);
            }
        } catch (error) {
            console.warn("AI Chat API connection error, falling back offline:", error);
            removeTypingIndicator(typingId);
            processLocalFallback(text);
        }
    }

    // Offline logic parsing keywords
    function processLocalFallback(query) {
        let matched = false;
        const cleanQuery = query.toLowerCase().trim();

        for (const rule of offlineDatabase) {
            const matches = rule.keywords.some(regex => regex.test(cleanQuery));
            if (matches) {
                appendMessage('bot', rule.reply, rule.navTarget, rule.navLabel);
                matched = true;
                break;
            }
        }

        if (!matched) {
            const fallbackReply = "Tôi chưa tìm thấy từ khóa khớp trực tiếp với câu hỏi của bạn. Hãy thử hỏi các chủ đề cụ thể như: *lương net, thời gian thử việc, cách tìm email PIC, hoặc các bài viết đàm phán B2B* để tôi có thể hỗ trợ và điều hướng bạn tốt nhất.";
            appendMessage('bot', fallbackReply);
        }
    }

    // Helper to format/markdown text in assistant bubbles
    function parseBubbleMarkdown(text) {
        let html = text;
        
        // Escape standard HTML tags
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Markdown Links: [text](url) -> <a href="url" target="_blank" rel="noopener noreferrer" class="chat-inline-link">text</a>
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-inline-link">$1</a>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // New lines
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    function appendMessage(sender, text, navTarget = null, navLabel = null) {
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = `chat-bubble-container ${sender}`;
        
        // Parse navigation tags embedded in AI responses
        let cleanedText = text;
        let aiNavTarget = navTarget;
        let aiNavLabel = navLabel;

        const navMatch = cleanedText.match(/\[NAV:(salary|labor-law|library|personality-test|email-assistant|kpi-estimation|quests|finder|community)\]/);
        if (navMatch) {
            aiNavTarget = navMatch[1];
            cleanedText = cleanedText.replace(navMatch[0], '').trim();
            
            const labelMap = {
                'salary': '⚡ Quy Đổi Lương Ngay',
                'labor-law': '⚖️ Tra Cứu Luật Lao Động',
                'library': '📖 Mở Thư Viện Ebook & Thuật Ngữ',
                'personality-test': '📊 Làm Test Tính Cách BD',
                'email-assistant': '✍️ Dùng AI Viết & Đánh Giá Email',
                'kpi-estimation': '📈 Ước Tính Ma Trận KPI',
                'quests': '🎯 Làm Nhiệm Vụ & Đổi Quà',
                'finder': '🔒 Cổng Alumni VIP (Tìm PIC)',
                'community': '💬 Tham Gia Cộng Đồng BD'
            };
            if (labelMap[aiNavTarget]) aiNavLabel = labelMap[aiNavTarget];
        }

        let bubbleHtml = '';
        if (sender === 'bot') {
            bubbleHtml += `<img src="bd_mascot.png?v=2.4.8" class="chat-bot-avatar" alt="BeeDee">`;
        }
        
        bubbleHtml += `<div class="chat-bubble-content">`;
        bubbleHtml += `<div class="chat-bubble">${parseBubbleMarkdown(cleanedText)}</div>`;

        // If there is a navigation target, append action button
        if (aiNavTarget && aiNavLabel) {
            const linkMap = {
                'salary': 'salary.html',
                'labor-law': 'labor-law.html',
                'library': 'library.html',
                'personality-test': 'personality-test.html',
                'email-assistant': 'email-assistant.html',
                'kpi-estimation': 'kpi-estimation.html',
                'quests': 'quests.html',
                'finder': 'finder.html',
                'community': 'community.html'
            };
            bubbleHtml += `<a href="${linkMap[aiNavTarget]}" class="chat-router-btn">${aiNavLabel} &rarr;</a>`;
        }
        bubbleHtml += `</div>`;

        bubbleContainer.innerHTML = bubbleHtml;
        messagesContainer.appendChild(bubbleContainer);

        // Auto Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'chat-bubble-container bot';
        bubbleContainer.id = id;
        bubbleContainer.innerHTML = `
            <img src="bd_mascot.png?v=1.0.4" class="chat-bot-avatar" alt="BeeDee">
            <div class="chat-bubble-content">
                <div class="chat-bubble">
                    <div class="typing-indicator">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(bubbleContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }
});
