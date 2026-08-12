/**
 * B2B Email Assistant - Client-side script
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements Mapping ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const settingsModal = document.getElementById('settings-modal');
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const geminiKeyInput = document.getElementById('gemini-key-input');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const clearKeyBtn = document.getElementById('clear-key-btn');
    const offlineWarnBanner = document.getElementById('offline-warn-banner');

    const evaluateForm = document.getElementById('evaluate-form');
    const generateForm = document.getElementById('generate-form');
    const evalSubmitBtn = document.getElementById('eval-submit-btn');
    const genSubmitBtn = document.getElementById('gen-submit-btn');

    const outputEmpty = document.getElementById('output-empty');
    const outputLoading = document.getElementById('output-loading');
    const outputResult = document.getElementById('output-result');
    const tableSearch = document.getElementById('table-search');
    const resultsTbody = document.getElementById('results-tbody');
    const evalResultSection = document.getElementById('eval-result-section');
    const subjectLinesSection = document.getElementById('subject-lines-section');
    const scoreCircle = document.getElementById('score-circle');
    const scoreValue = document.getElementById('score-value');
    const spamCount = document.getElementById('spam-count');
    const readingTime = document.getElementById('reading-time');
    const critiqueList = document.getElementById('critique-list');
    const subjectOptionsList = document.getElementById('subject-options-list');
    const draftTitle = document.getElementById('draft-title');
    const draftContent = document.getElementById('draft-content');
    const copyDraftBtn = document.getElementById('copy-draft-btn');

    // Unlock Modal Elements
    const unlockModal = document.getElementById('unlock-modal');
    const unlockModalCloseBtn = document.getElementById('unlock-modal-close-btn');
    const unlockForm = document.getElementById('unlock-form');
    const unlockEmailInput = document.getElementById('unlock-email-input');
    let pendingUnlockAction = null;

    function requireEmailUnlock(callback) {
        if (localStorage.getItem('user_gated_email')) {
            if (callback) callback();
            return true;
        }
        pendingUnlockAction = callback;
        unlockModal.classList.remove('hidden');
        return false;
    }

    // --- 2. Initialize Settings & Key Warning ---
    let hasSharedKey = false;

    async function initSharedKeyStatus() {
        try {
            const res = await fetch('/api/email-assistant');
            if (res.ok) {
                const data = await res.json();
                hasSharedKey = !!data.hasSharedKey;
            }
        } catch (e) {
            console.error('Failed to check shared key status:', e);
        }
        checkApiKeyStatus();
    }
    initSharedKeyStatus();

    function checkApiKeyStatus() {
        const key = localStorage.getItem('gemini_api_key');
        if (key) {
            offlineWarnBanner.classList.add('hidden');
            geminiKeyInput.value = key;
        } else if (hasSharedKey) {
            // Shared mode: green color theme
            offlineWarnBanner.style.background = 'rgba(16, 185, 129, 0.08)';
            offlineWarnBanner.style.borderColor = 'var(--primary)';
            offlineWarnBanner.style.color = '#34d399';
            offlineWarnBanner.querySelector('span').innerHTML = '<strong>Chế độ Hệ thống:</strong> Đang dùng chung API Key (Giới hạn 5 lượt gọi/ngày). Nhập API Key cá nhân trong phần Cấu hình để sử dụng không giới hạn.';
            offlineWarnBanner.classList.remove('hidden');
            geminiKeyInput.value = '';
        } else {
            // Offline fallback mode: default orange warning
            offlineWarnBanner.style.background = '';
            offlineWarnBanner.style.borderColor = '';
            offlineWarnBanner.style.color = '';
            offlineWarnBanner.querySelector('span').innerHTML = '<strong>Chế độ Ngoại tuyến:</strong> Bạn chưa nhập API Key. Hệ thống đang chạy bộ phân tích quy tắc cục bộ (local heuristics). Nhập API Key ở phần Cấu hình để mở khóa AI chấm điểm chi tiết.';
            offlineWarnBanner.classList.remove('hidden');
            geminiKeyInput.value = '';
        }
    }

    function checkAndIncrementRateLimit() {
        const key = localStorage.getItem('gemini_api_key');
        if (key) return true; // user key = unlimited
        if (!hasSharedKey) return true; // offline fallback = unlimited (no cost)

        const today = new Date().toDateString();
        let limitData = localStorage.getItem('gemini_usage_limit');
        try {
            limitData = limitData ? JSON.parse(limitData) : { date: today, count: 0 };
        } catch (e) {
            limitData = { date: today, count: 0 };
        }

        if (limitData.date !== today) {
            limitData.date = today;
            limitData.count = 0;
        }

        if (limitData.count >= 5) {
            alert('Bạn đã dùng hết 5 lượt gọi AI miễn phí trong ngày hôm nay.\n\nĐể tiếp tục sử dụng không giới hạn, vui lòng click vào nút "⚙ Cấu hình API Key (Gemini)" ở góc trên bên phải để nhập API Key cá nhân của bạn (hoàn toàn miễn phí!).');
            return false;
        }

        limitData.count++;
        localStorage.setItem('gemini_usage_limit', JSON.stringify(limitData));
        return true;
    }

    // Modal Events
    openSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });

    saveKeyBtn.addEventListener('click', () => {
        const val = geminiKeyInput.value.trim();
        if (val) {
            localStorage.setItem('gemini_api_key', val);
            alert('Lưu API Key thành công!');
            settingsModal.classList.add('hidden');
            checkApiKeyStatus();
        } else {
            alert('Vui lòng nhập API Key hợp lệ.');
        }
    });

    clearKeyBtn.addEventListener('click', () => {
        localStorage.removeItem('gemini_api_key');
        alert('Đã xóa API Key thành công!');
        settingsModal.classList.add('hidden');
        checkApiKeyStatus();
    });

    // --- 3. Tab Management ---
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- 4. Loading States ---
    function showLoading(isLoading) {
        if (isLoading) {
            outputEmpty.classList.add('hidden');
            outputResult.classList.add('hidden');
            outputLoading.classList.remove('hidden');
            evalSubmitBtn.disabled = true;
            genSubmitBtn.disabled = true;
        } else {
            outputLoading.classList.add('hidden');
            evalSubmitBtn.disabled = false;
            genSubmitBtn.disabled = false;
        }
    }

    // --- 5. Clipboard Copy Utility ---
    function setupCopyListener(button, textGetter) {
        button.addEventListener('click', () => {
            requireEmailUnlock(() => {
                const text = textGetter();
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = button.innerHTML;
                    button.textContent = 'Copied!';
                    button.style.background = 'var(--primary)';
                    button.style.borderColor = 'var(--primary)';
                    button.style.color = '#ffffff';
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.background = '';
                        button.style.borderColor = '';
                        button.style.color = '';
                    }, 1500);
                }).catch(err => {
                    console.error('Lỗi khi sao chép:', err);
                });
            });
        });
    }
    setupCopyListener(copyDraftBtn, () => draftContent.textContent);

    // --- Unlock Modal Event Listeners ---
    unlockModalCloseBtn.addEventListener('click', () => {
        unlockModal.classList.add('hidden');
        pendingUnlockAction = null;
    });

    unlockModal.addEventListener('click', (e) => {
        if (e.target === unlockModal) {
            unlockModal.classList.add('hidden');
            pendingUnlockAction = null;
        }
    });

    unlockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = unlockEmailInput.value.trim();
        if (email && email.includes('@')) {
            localStorage.setItem('user_gated_email', email);
            unlockModal.classList.add('hidden');
            
            // Log email to backend serverless function
            try {
                await fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, tool: 'Email Assistant' })
                });
            } catch (err) {
                console.error('Failed to log email to backend:', err);
            }

            if (pendingUnlockAction) {
                pendingUnlockAction();
                pendingUnlockAction = null;
            }
        }
    });

    // --- 6. Form Handlers ---
    evaluateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!checkAndIncrementRateLimit()) {
            return;
        }

        const content = document.getElementById('eval-content').value.trim();
        const level = document.getElementById('eval-level').value;
        const dept = document.getElementById('eval-dept').value;
        const industry = document.getElementById('eval-industry').value;
        const tone = document.getElementById('eval-tone').value;
        const lang = document.getElementById('eval-lang').value;
        const key = localStorage.getItem('gemini_api_key');

        const role = `${level} - ${dept}`;

        showLoading(true);

        try {
            const res = await fetch('/api/email-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'evaluate',
                    emailContent: content,
                    recipientRole: role,
                    industry: industry,
                    tone: tone,
                    language: lang,
                    geminiApiKey: key
                })
            });

            if (!res.ok) {
                if (res.status === 429) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Rate limit exceeded');
                }
                throw new Error(`Status error: ${res.status}`);
            }
            const data = await res.json();
            
            renderEvaluation(data);
            if (window.registerUserAction) {
                window.registerUserAction('ai_email');
            }
        } catch (error) {
            console.error('Evaluation failed:', error);
            alert(error.message || 'Gặp lỗi khi kết nối hệ thống AI. Vui lòng thử lại.');
            outputEmpty.classList.remove('hidden');
        } finally {
            showLoading(false);
        }
    });

    generateForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!checkAndIncrementRateLimit()) {
            return;
        }

        const promptVal = document.getElementById('gen-prompt').value.trim();
        const companyVal = document.getElementById('gen-company').value.trim();
        const level = document.getElementById('gen-level').value;
        const dept = document.getElementById('gen-dept').value;
        const industry = document.getElementById('gen-industry').value;

        if (window.trackUserBehavior) {
            window.trackUserBehavior('email_generate', `Company: ${companyVal}, Level: ${level}, Dept: ${dept}`);
        }
        const tone = document.getElementById('gen-tone').value;
        const lang = document.getElementById('gen-lang').value;
        const key = localStorage.getItem('gemini_api_key');

        const role = `${level} - ${dept}`;

        showLoading(true);

        try {
            const res = await fetch('/api/email-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate',
                    prompt: promptVal,
                    company: companyVal,
                    recipientRole: role,
                    industry: industry,
                    tone: tone,
                    language: lang,
                    geminiApiKey: key
                })
            });

            if (!res.ok) {
                if (res.status === 429) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Rate limit exceeded');
                }
                throw new Error(`Status error: ${res.status}`);
            }
            const data = await res.json();

            renderGeneration(data);
            if (window.registerUserAction) {
                window.registerUserAction('ai_email');
            }
        } catch (error) {
            console.error('Generation failed:', error);
            alert(error.message || 'Gặp lỗi khi soạn email bằng AI. Vui lòng thử lại.');
            outputEmpty.classList.remove('hidden');
        } finally {
            showLoading(false);
        }
    });

    // --- 7. Rendering Functions ---
    function renderEvaluation(data) {
        // Show/hide sections
        evalResultSection.classList.remove('hidden');
        subjectLinesSection.classList.add('hidden'); // evaluation doesn't require generating new subjects
        outputResult.classList.remove('hidden');

        // Render Score Circle
        scoreValue.textContent = data.score || 0;
        scoreCircle.className = 'score-badge-circle';
        if (data.score >= 80) {
            // green/primary
        } else if (data.score >= 50) {
            scoreCircle.classList.add('warning');
        } else {
            scoreCircle.classList.add('danger');
        }

        // Render Spam count & Reading time
        const spamWordsList = data.spamWords || [];
        spamCount.textContent = `${spamWordsList.length} từ`;
        spamCount.style.color = spamWordsList.length > 0 ? 'var(--danger)' : 'var(--primary)';
        
        const readTime = data.readingTimeSeconds || 0;
        readingTime.textContent = `${readTime}s`;

        // Render Critique points
        critiqueList.innerHTML = '';
        
        if (data.pros && data.pros.length > 0) {
            data.pros.forEach(item => {
                const li = document.createElement('div');
                li.className = 'critique-item pro';
                li.textContent = `✅ ${item}`;
                critiqueList.appendChild(li);
            });
        }
        
        if (data.cons && data.cons.length > 0) {
            data.cons.forEach(item => {
                const li = document.createElement('div');
                li.className = 'critique-item con';
                li.textContent = `❌ ${item}`;
                critiqueList.appendChild(li);
            });
        }
        
        if (data.suggestions && data.suggestions.length > 0) {
            data.suggestions.forEach(item => {
                const li = document.createElement('div');
                li.className = 'critique-item suggest';
                li.textContent = `💡 ${item}`;
                critiqueList.appendChild(li);
            });
        }

        // Render Polished draft
        draftTitle.textContent = "Bản email đề xuất tối ưu (Polished Draft):";
        draftContent.textContent = data.polishedDraft || '';
    }

    function renderGeneration(data) {
        // Show/hide sections
        evalResultSection.classList.add('hidden');
        subjectLinesSection.classList.remove('hidden');
        outputResult.classList.remove('hidden');

        // Render Subject options
        subjectOptionsList.innerHTML = '';
        const list = data.subjectLines || [];
        list.forEach((sub, index) => {
            const card = document.createElement('div');
            card.className = 'subject-option-card';
            card.innerHTML = `
                <div>
                    <span>#${index + 1}</span> ${sub}
                </div>
                <button class="copy-sub-btn" data-text="${sub.replace(/"/g, '&quot;')}">Copy</button>
            `;
            subjectOptionsList.appendChild(card);
            
            // Setup individual copy button for subject line card
            const copyBtn = card.querySelector('.copy-sub-btn');
            setupCopyListener(copyBtn, () => copyBtn.getAttribute('data-text'));
        });

        // Render Email body
        draftTitle.textContent = "Nội dung email được soạn thảo bởi AI:";
        draftContent.textContent = data.draft || '';
    }
});
