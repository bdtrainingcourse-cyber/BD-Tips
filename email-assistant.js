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

    // --- 2. Initialize Settings & Key Warning ---
    function checkApiKeyStatus() {
        const key = localStorage.getItem('gemini_api_key');
        if (key) {
            offlineWarnBanner.classList.add('hidden');
            geminiKeyInput.value = key;
        } else {
            offlineWarnBanner.classList.remove('hidden');
            geminiKeyInput.value = '';
        }
    }
    checkApiKeyStatus();

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
    }
    setupCopyListener(copyDraftBtn, () => draftContent.textContent);

    // --- 6. Form Handlers ---
    evaluateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('eval-content').value.trim();
        const role = document.getElementById('eval-role').value;
        const industry = document.getElementById('eval-industry').value;
        const tone = document.getElementById('eval-tone').value;
        const lang = document.getElementById('eval-lang').value;
        const key = localStorage.getItem('gemini_api_key');

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

            if (!res.ok) throw new Error(`Status error: ${res.status}`);
            const data = await res.json();
            
            renderEvaluation(data);
        } catch (error) {
            console.error('Evaluation failed:', error);
            alert('Gặp lỗi khi kết nối hệ thống AI. Vui lòng thử lại.');
            outputEmpty.classList.remove('hidden');
        } finally {
            showLoading(false);
        }
    });

    generateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const promptVal = document.getElementById('gen-prompt').value.trim();
        const companyVal = document.getElementById('gen-company').value.trim();
        const role = document.getElementById('gen-role').value;
        const industry = document.getElementById('gen-industry').value;
        const tone = document.getElementById('gen-tone').value;
        const lang = document.getElementById('gen-lang').value;
        const key = localStorage.getItem('gemini_api_key');

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

            if (!res.ok) throw new Error(`Status error: ${res.status}`);
            const data = await res.json();

            renderGeneration(data);
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Gặp lỗi khi soạn email bằng AI. Vui lòng thử lại.');
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
