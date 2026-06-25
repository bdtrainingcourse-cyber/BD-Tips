/**
 * B2B Portal Floating AI Chat Widget with Smart Navigation Router
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dynamic HTML Injection ---
    const chatContainer = document.createElement('div');
    chatContainer.id = 'b2b-ai-chat-root';
    chatContainer.innerHTML = `
        <!-- Floating Launcher -->
        <div class="ai-chat-launcher" id="ai-chat-launcher" title="Hỏi Trợ Lý B2B">
            <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
            </svg>
        </div>

        <!-- Chat Widget Panel -->
        <div class="ai-chat-widget" id="ai-chat-widget">
            <!-- Header -->
            <div class="chat-header">
                <div class="chat-header-info">
                    <h3>Trợ Lý B2B AI</h3>
                    <span>Tự động phản hồi & Điều hướng</span>
                </div>
                <button class="chat-close-btn" id="chat-close-btn">&times;</button>
            </div>

            <!-- Messages Area -->
            <div class="chat-messages" id="chat-messages">
                <div class="chat-bubble-container bot">
                    <div class="chat-bubble">
                        Xin chào! Tôi là Trợ lý ảo của **B2B BD Portal**. Tôi có thể giúp bạn giải đáp các kỹ năng bán hàng B2B, tra cứu Luật Lao động nhanh hoặc hướng dẫn sử dụng các công cụ tính lương, tìm kiếm email PIC.
                    </div>
                </div>
                
                <!-- Quick Suggestion Chips -->
                <div class="chat-suggestions" id="chat-suggestions">
                    <div class="suggestion-chip" data-question="Cách tính lương Net từ Gross?">Cách tính lương Net từ Gross?</div>
                    <div class="suggestion-chip" data-question="Hết thử việc công ty im lặng thì sao?">Hết thử việc im lặng?</div>
                    <div class="suggestion-chip" data-question="Thời hạn báo trước khi thôi việc?">Thời hạn báo trước thôi việc?</div>
                    <div class="suggestion-chip" data-question="Làm sao tìm email PIC doanh nghiệp?">Tìm email PIC như thế nào?</div>
                    <div class="suggestion-chip" data-question="Xem cẩm nang đàm phán B2B?">Cẩm nang đàm phán B2B?</div>
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
            keywords: [/lương/, /salary/, /net/, /gross/, /tính tiền/i],
            reply: "Bạn có thể sử dụng **Trình Quy Đổi Lương Gross - Net** của chúng tôi. Công cụ hỗ trợ tính toán lương thực nhận, bảo hiểm đóng bắt buộc (BHXH 8%, BHYT 1.5%, BHTN 1%) và thuế TNCN lũy tiến từng phần mới nhất.",
            navTarget: "salary",
            navLabel: "⚡ Quy Đổi Lương Ngay"
        },
        {
            keywords: [/thử việc/i],
            reply: "Theo Điều 25 & 26 Bộ luật Lao động 2019, thời gian thử việc tối đa là **60 ngày** đối với vị trí chuyên môn (như BD/Sales) và mức lương thử việc phải đạt **ít nhất 85%** mức lương chính thức. Nếu công ty im lặng sau thử việc, bạn mặc nhiên trở thành nhân sự chính thức.",
            navTarget: "labor-law",
            navLabel: "⚖️ Xem Chi Tiết Luật Thử Việc"
        },
        {
            keywords: [/nghỉ việc/, /thôi việc/, /báo trước/, /đơn phương chấm dứt/i],
            reply: "Theo quy định Điều 35 Bộ luật Lao động, thời hạn báo trước bắt buộc khi người lao động nghỉ việc là:\n- Ít nhất **45 ngày** (Hợp đồng không xác định thời hạn).\n- Ít nhất **30 ngày** (Hợp đồng xác định thời hạn 12-36 tháng).\nTự ý nghỉ đột ngột không báo trước sẽ không được hưởng trợ cấp thôi việc và phải bồi thường.",
            navTarget: "labor-law",
            navLabel: "📋 Xem Luật Nghỉ Việc & Đền Bù"
        },
        {
            keywords: [/luật/, /bảo hiểm/, /sa thải/, /bồi thường/i],
            reply: "Cổng tra cứu **Luật Lao Động** của chúng tôi cung cấp đầy đủ các quy định về thử việc, thời giờ nghỉ ngơi, báo trước thôi việc và bảo hiểm xã hội, đi kèm các **Case Study** tranh chấp thực tế để bạn đối chiếu.",
            navTarget: "labor-law",
            navLabel: "⚖️ Mở Cổng Luật Lao Động"
        },
        {
            keywords: [/tìm email/, /finder/, /email/, /linkedin/, /sđt/, /pic/i],
            reply: "Công cụ **LinkedIn PIC Finder** giúp bạn tìm kiếm thông tin liên hệ (Email, Chức danh) của Người chịu trách nhiệm chính (PIC) thuộc các doanh nghiệp mục tiêu bằng cách quét các bộ lọc nâng cao.",
            navTarget: "finder",
            navLabel: "🔍 Mở Trình Tìm Kiếm PIC"
        },
        {
            keywords: [/ebook/, /thư viện/, /bài viết/, /sách/, /newsletter/, /linkedin post/i],
            reply: "Mục **Thư Viện** lưu trữ các bài viết, cẩm nang thực chiến chuyên sâu về kỹ năng Sales B2B, đàm phán hợp đồng thương mại và xây dựng thương hiệu cá nhân của Peter Vo.",
            navTarget: "library",
            navLabel: "📚 Truy Cập Thư Viện"
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

        for (const rule of offlineDatabase) {
            const matches = rule.keywords.some(regex => regex.test(query));
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

        const navMatch = cleanedText.match(/\[NAV:(salary|labor-law|finder|library)\]/);
        if (navMatch) {
            aiNavTarget = navMatch[1];
            cleanedText = cleanedText.replace(navMatch[0], '').trim();
            
            // Map label based on target
            if (aiNavTarget === 'salary') aiNavLabel = '⚡ Tính Lương Ngay';
            else if (aiNavTarget === 'labor-law') aiNavLabel = '⚖️ Xem Luật Lao Động';
            else if (aiNavTarget === 'finder') aiNavLabel = '🔍 Mở PIC Finder';
            else if (aiNavTarget === 'library') aiNavLabel = '📚 Vào Thư Viện';
        }

        let bubbleHtml = `<div class="chat-bubble">${parseBubbleMarkdown(cleanedText)}</div>`;

        // If there is a navigation target, append action button
        if (aiNavTarget && aiNavLabel) {
            const linkMap = {
                'salary': 'salary.html',
                'labor-law': 'labor-law.html',
                'finder': 'finder.html',
                'library': 'library.html'
            };
            bubbleHtml += `<a href="${linkMap[aiNavTarget]}" class="chat-router-btn">${aiNavLabel} &rarr;</a>`;
        }

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
            <div class="chat-bubble">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
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
