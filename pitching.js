// Pitching with AI - AI Sales Roleplay Simulator Engine

// Global State for Speech Synthesis
let loadedVoices = [];
window.sharedAIAudio = new Audio();

function preloadVoices() {
    if (window.speechSynthesis) {
        loadedVoices = window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = () => {
                loadedVoices = window.speechSynthesis.getVoices();
            };
        }
    }
}
preloadVoices();

function unlockSharedAudio() {
    if (window.sharedAIAudio) {
        // Set a tiny blank silence wav source to unlock on user gesture
        window.sharedAIAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
        window.sharedAIAudio.play().catch(() => {});
    }
}

// Global State
let activeTab = 'dashboard';
let activeStep = 1;
let currentScenario = null;
let currentConfig = {};
let currentProduct = null;
let generatedContext = null;
let chatHistory = [];
let isSimulationActive = false;

// Voice vs Text Interaction Mode Configuration
let interactionMode = 'voice'; 
let isRecording = false;
let recognition = null;
let inactivityTimeout = null;
let isWaitingForAI = false;
let speechTimeout = null;

// Default Scenarios (with voiceOnly parameters)
const DEFAULT_SCENARIOS = [
    { id: 'cold-call', title: 'First Cold Call', category: 'external', desc: 'Gọi điện lạnh tiếp cận người duyệt (gatekeeper/decision maker) để đặt lịch hẹn.', icon: '📞', voiceOnly: true },
    { id: 'discovery', title: 'Discovery Meeting', category: 'external', desc: 'Họp tìm hiểu khó khăn, quy trình vận hành và tiêu chí lựa chọn của khách hàng.', icon: '🕵️‍♂️', voiceOnly: true },
    { id: 'demo', title: 'Product Demo', category: 'external', desc: 'Trình diễn giải pháp, thuyết trình tính năng giải quyết đúng nỗi đau của khách.', icon: '💻', voiceOnly: true },
    { id: 'proposal', title: 'Proposal Presentation', category: 'external', desc: 'Thuyết trình đề xuất giải pháp chi tiết và báo giá kế hoạch triển khai.', icon: '📊', voiceOnly: true },
    { id: 'negotiation', title: 'Contract Negotiation', category: 'external', desc: 'Đàm phán điều khoản hợp đồng, thời hạn thanh toán và mức chiết khấu.', icon: '🤝', voiceOnly: true },
    { id: 'competitor', title: 'Competitor Challenge', category: 'external', desc: 'Khách hàng đang dùng giải pháp của đối thủ lớn. Hãy xử lý phản đối để giành khách.', icon: '⚔️', voiceOnly: true },
    { id: 'security', title: 'Technical & Security Review', category: 'external', desc: 'Làm việc với CTO/Tech Lead về bảo mật dữ liệu, tích hợp hệ thống cũ và hiệu năng.', icon: '🔒', voiceOnly: true },
    { id: 'closing', title: 'Closing Deal Call', category: 'external', desc: 'Cuộc gọi chốt điều khoản thương mại cuối cùng để đi đến ký kết hợp đồng.', icon: '✍️', voiceOnly: true }
];

// Default Products
const DEFAULT_PRODUCTS = [
    {
        id: 'antigravity-crm',
        companyName: 'Antigravity Tech',
        productName: 'CRM Auto-Sales',
        productDesc: 'Hệ thống CRM tự động hóa chăm sóc khách hàng bằng AI, quản lý phễu cơ hội và kết nối đa kênh.',
        usp: 'Giảm 70% thao tác nhập liệu thủ công của Sales, tăng 25% tỷ lệ chốt deal nhờ gợi ý AI.',
        pricing: '$30/người dùng/tháng',
        competitors: 'Salesforce, HubSpot, GetFly',
        targetCustomers: 'Doanh nghiệp SMEs phân phối, bán lẻ và dịch vụ.'
    },
    {
        id: 'pic-finder-pro',
        companyName: 'BD Bình Dân Học Vụ',
        productName: 'B2B PIC Finder Pro',
        productDesc: 'Phần mềm tìm kiếm và làm giàu thông tin liên hệ (Email, SĐT) của người có quyền quyết định (PIC) trên LinkedIn.',
        usp: 'Xác thực hộp thư tồn tại qua cổng MX/SMTP thời gian thực, độ chính xác dữ liệu 98%.',
        pricing: '$49/tháng gói không giới hạn',
        competitors: 'Apollo.io, ZoomInfo, Lusha',
        targetCustomers: 'Đội ngũ Outbound Sales, Business Development săn khách hàng doanh nghiệp.'
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    renderScenariosList();
    renderProductsList();
    renderHistoryList();
    renderDashboardStats();
    renderAdminScenarios();
    updateSidebarGamification();
    initSpeechRecognition();
});

// Database Initialization (LocalStorage)
function initDatabase() {
    // Force overwrite DEFAULT_SCENARIOS to apply new external voice-only kịch bản
    localStorage.setItem('b2b_sim_scenarios', JSON.stringify(DEFAULT_SCENARIOS));
    
    if (!localStorage.getItem('b2b_sim_products')) {
        localStorage.setItem('b2b_sim_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem('b2b_sim_history')) {
        localStorage.setItem('b2b_sim_history', JSON.stringify([]));
    }
    
    // User Profile Stats
    if (!localStorage.getItem('b2b_sim_xp')) localStorage.setItem('b2b_sim_xp', '0');
    if (!localStorage.getItem('b2b_sim_level')) localStorage.setItem('b2b_sim_level', '1');
    if (!localStorage.getItem('b2b_sim_streak')) localStorage.setItem('b2b_sim_streak', '0');
    if (!localStorage.getItem('b2b_sim_badges')) {
        localStorage.setItem('b2b_sim_badges', JSON.stringify([]));
    }
}

// Sidebar Navigation Tab Control
function switchTab(tabId) {
    activeTab = tabId;
    
    // Toggle active classes on sidebar buttons
    document.querySelectorAll('.sidebar-menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`menu-btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Toggle panels
    document.querySelectorAll('.screen-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    document.getElementById(`screen-${tabId}`).classList.remove('hidden');

    // Render corresponding database items
    if (tabId === 'dashboard') {
        renderDashboardStats();
        updateSidebarGamification();
    } else if (tabId === 'products') {
        renderProductsList();
    } else if (tabId === 'history') {
        renderHistoryList();
    } else if (tabId === 'admin') {
        renderAdminScenarios();
    }
}

// Wizard Step Navigation
function showWizardStep(stepNum) {
    activeStep = stepNum;
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.add('hidden');
    });
    document.getElementById(`sim-step-${stepNum}`).classList.remove('hidden');
}

function nextWizardStep(currentStep) {
    if (currentStep === 1) {
        if (!currentScenario) {
            alert('Vui lòng chọn một kịch bản thử thách trước!');
            return;
        }
        showWizardStep(2);
    } else if (currentStep === 2) {
        currentConfig = {
            industry: document.getElementById('config-industry').value,
            size: document.getElementById('config-size').value,
            difficulty: document.getElementById('config-difficulty').value,
            personality: document.getElementById('config-personality').value,
            language: document.getElementById('config-language').value,
            voiceGender: document.getElementById('config-voice-gender').value
        };
        showWizardStep(3);
    } else if (currentStep === 3) {
        // Read manual input if no selected saved product
        const activeProdCard = document.querySelector('.product-card.selected');
        if (activeProdCard) {
            const products = JSON.parse(localStorage.getItem('b2b_sim_products') || '[]');
            currentProduct = products.find(p => p.id === activeProdCard.dataset.id);
        } else {
            const manualComp = document.getElementById('manual-company-name').value.trim();
            const manualProd = document.getElementById('manual-product-name').value.trim();
            const manualDesc = document.getElementById('manual-product-desc').value.trim();
            const manualUsp = document.getElementById('manual-product-usp').value.trim();
            const manualPrice = document.getElementById('manual-product-pricing').value.trim();

            if (!manualComp || !manualProd || !manualDesc) {
                alert('Vui lòng chọn sản phẩm đã lưu hoặc nhập đầy đủ thông tin sản phẩm thủ công!');
                return;
            }

            currentProduct = {
                id: 'manual-temp',
                companyName: manualComp,
                productName: manualProd,
                productDesc: manualDesc,
                usp: manualUsp,
                pricing: manualPrice,
                competitors: 'Không rõ',
                targetCustomers: 'Doanh nghiệp chung'
            };
        }
        
        // Block wizard transition, show loading indicator on button, and start simulation once context is generated
        generateMeetingContextAndStart();
    } else if (currentStep === 4) {
        showWizardStep(5);
    }
}

function prevWizardStep(currentStep) {
    showWizardStep(currentStep - 1);
}

// Render Scenario Cards in Wizard Step 1
function renderScenariosList() {
    const listContainer = document.getElementById('scenarios-container-list');
    if (!listContainer) return;
    
    const scenarios = JSON.parse(localStorage.getItem('b2b_sim_scenarios') || '[]');
    listContainer.innerHTML = '';

    scenarios.forEach(scen => {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.dataset.id = scen.id;
        if (currentScenario && currentScenario.id === scen.id) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <span class="scenario-category-badge ${scen.category}">${scen.category}</span>
            <div class="card-icon">${scen.icon}</div>
            <h3 class="card-title">${scen.title}</h3>
            <p class="card-desc">${scen.desc}</p>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            currentScenario = scen;
            
            if (window.trackUserBehavior) {
                window.trackUserBehavior('pitching_scenario_select', scen.title);
            }

            // Scenario Lock Check
            const textCard = document.getElementById('mode-card-text');
            const alertText = document.getElementById('mode-lock-alert-text');
            if (scen.voiceOnly) {
                selectInteractionMode('voice');
                if (textCard) {
                    textCard.style.opacity = '0.4';
                    textCard.style.pointerEvents = 'none';
                }
                if (alertText) alertText.classList.remove('hidden');
            } else {
                if (textCard) {
                    textCard.style.opacity = '1';
                    textCard.style.pointerEvents = 'auto';
                }
                if (alertText) alertText.classList.add('hidden');
            }
        });

        listContainer.appendChild(card);
    });
}

// Render Product Picker Cards in Wizard Step 3
function renderProductsList() {
    const pickerGrid = document.getElementById('sim-product-picker-grid');
    const libraryGrid = document.getElementById('library-products-grid');
    const products = JSON.parse(localStorage.getItem('b2b_sim_products') || '[]');

    const buildHtml = (p) => `
        <h4 style="margin: 0; font-weight: 800; color: var(--text-primary); font-size: 0.95rem;">${p.productName}</h4>
        <div style="font-size: 0.72rem; color: #f3a83b; font-weight: 700; margin-top: 3px;">Cty: ${p.companyName}</div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.productDesc}</p>
    `;

    // Render picker inside Wizard Step 3
    if (pickerGrid) {
        pickerGrid.innerHTML = '';
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = p.id;
            card.innerHTML = buildHtml(p);
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
            pickerGrid.appendChild(card);
        });
    }

    // Render libraries tab
    if (libraryGrid) {
        libraryGrid.innerHTML = '';
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'default';
            card.innerHTML = `
                ${buildHtml(p)}
                <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
                    <span style="font-size: 0.7rem; color: var(--text-muted);">Giá: ${p.pricing}</span>
                    <button class="btn" style="padding: 3px 8px; font-size: 0.68rem; background: #a20a0a; color: #fff; border: none; border-radius: 4px;" onclick="deleteProduct('${p.id}')">Xóa</button>
                </div>
            `;
            libraryGrid.appendChild(card);
        });
    }
}

async function generateMeetingContext() {
    const titleEl = document.getElementById('dossier-company');
    const stageEl = document.getElementById('dossier-stage');
    const budgetEl = document.getElementById('dossier-budget');
    const timelineEl = document.getElementById('dossier-timeline');
    const challengesEl = document.getElementById('dossier-challenges');
    const painpointsEl = document.getElementById('dossier-painpoints');
    const decisionmakersEl = document.getElementById('dossier-decisionmakers');

    const spinner = document.getElementById('dossier-load-spinner');

    if (titleEl) titleEl.textContent = 'Đang tải...';
    if (stageEl) stageEl.textContent = 'Đang tải...';
    if (budgetEl) budgetEl.textContent = 'Đang tải...';
    if (timelineEl) timelineEl.textContent = 'Đang tải...';
    if (challengesEl) challengesEl.textContent = 'Đang tải...';
    if (painpointsEl) painpointsEl.textContent = 'Đang tải...';
    if (decisionmakersEl) decisionmakersEl.textContent = 'Đang tải...';

    if (spinner) spinner.classList.remove('hidden');

    try {
        const response = await fetch('/api/roleplay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContext',
                scenario: currentScenario.title,
                industry: currentConfig.industry,
                size: currentConfig.size,
                difficulty: currentConfig.difficulty,
                personality: currentConfig.personality,
                product: currentProduct,
                language: currentConfig.language || 'vi'
            })
        });

        const data = await response.json();
        generatedContext = data.context;

        // Step 4 fields
        if (titleEl) titleEl.textContent = generatedContext.company;
        if (stageEl) stageEl.textContent = generatedContext.buyingStage;
        if (budgetEl) budgetEl.textContent = generatedContext.budget;
        if (timelineEl) timelineEl.textContent = generatedContext.timeline;
        if (challengesEl) challengesEl.textContent = generatedContext.currentChallenges;
        if (painpointsEl) painpointsEl.textContent = generatedContext.painPoints;
        if (decisionmakersEl) decisionmakersEl.textContent = generatedContext.decisionMakers;

        // Populate sidebar fields
        const sideCompany = document.getElementById('sidebar-dossier-company');
        const sideStage = document.getElementById('sidebar-dossier-stage');
        const sideBudget = document.getElementById('sidebar-dossier-budget');
        const sideTimeline = document.getElementById('sidebar-dossier-timeline');
        const sideChallenges = document.getElementById('sidebar-dossier-challenges');
        const sidePainpoints = document.getElementById('sidebar-dossier-painpoints');
        const sideDecisionmakers = document.getElementById('sidebar-dossier-decisionmakers');

        if (sideCompany) sideCompany.textContent = generatedContext.company;
        if (sideStage) sideStage.textContent = generatedContext.buyingStage;
        if (sideBudget) sideBudget.textContent = generatedContext.budget;
        if (sideTimeline) sideTimeline.textContent = generatedContext.timeline;
        if (sideChallenges) sideChallenges.textContent = generatedContext.currentChallenges;
        if (sidePainpoints) sidePainpoints.textContent = generatedContext.painPoints;
        if (sideDecisionmakers) sideDecisionmakers.textContent = generatedContext.decisionMakers;

        // Populate modal fields
        const modalCompany = document.getElementById('modal-dossier-company');
        const modalStage = document.getElementById('modal-dossier-stage');
        const modalBudget = document.getElementById('modal-dossier-budget');
        const modalTimeline = document.getElementById('modal-dossier-timeline');
        const modalChallenges = document.getElementById('modal-dossier-challenges');
        const modalPainpoints = document.getElementById('modal-dossier-painpoints');
        const modalDecisionmakers = document.getElementById('modal-dossier-decisionmakers');

        if (modalCompany) modalCompany.textContent = generatedContext.company;
        if (modalStage) modalStage.textContent = generatedContext.buyingStage;
        if (modalBudget) modalBudget.textContent = generatedContext.budget;
        if (modalTimeline) modalTimeline.textContent = generatedContext.timeline;
        if (modalChallenges) modalChallenges.textContent = generatedContext.currentChallenges;
        if (modalPainpoints) modalPainpoints.textContent = generatedContext.painPoints;
        if (modalDecisionmakers) modalDecisionmakers.textContent = generatedContext.decisionMakers;

    } catch (e) {
        console.error(e);
        alert('Tạo hồ sơ bối cảnh thất bại. Đang tải bối cảnh cục bộ.');
    } finally {
        if (spinner) spinner.classList.add('hidden');
    }
}

// Active Chat Simulation controls
function startChatSimulation() {
    chatHistory = [];
    isSimulationActive = true;
    showWizardStep(5);

    // Toggle Input Mode views
    const textInputRow = document.getElementById('text-input-row');
    const voiceInputRow = document.getElementById('voice-input-row');
    
    // Toggle Layout panels
    const textLayout = document.getElementById('text-simulator-layout');
    const voiceLayout = document.getElementById('voice-simulator-layout');

    if (interactionMode === 'voice') {
        if (textLayout) textLayout.classList.add('hidden');
        if (voiceLayout) voiceLayout.classList.remove('hidden');
        if (textInputRow) textInputRow.classList.add('hidden');
        if (voiceInputRow) voiceInputRow.classList.remove('hidden');
        
        // Update labels
        const scenTitleEl = document.getElementById('voice-call-scenario-title');
        if (scenTitleEl && currentScenario) {
            scenTitleEl.innerHTML = `${currentScenario.title} <span style="font-size: 0.72rem; opacity: 0.7; font-weight: bold; background: var(--accent-glow); color: #f3a83b; padding: 2px 8px; border-radius: 10px; margin-left: 5px;">VOICE</span> ℹ️`;
        }
        
        const aiNameEl = document.getElementById('voice-ai-name-label');
        const aiRoleEl = document.getElementById('voice-ai-role-label');
        if (aiNameEl) aiNameEl.textContent = generatedContext ? generatedContext.company : 'Khách hàng AI';
        if (aiRoleEl) aiRoleEl.textContent = `${currentConfig.personality || 'Manager'} (${currentConfig.difficulty || 'Intermediate'})`;

        const isEn = (currentConfig && currentConfig.language === 'en');
        const subEl = document.getElementById('voice-subtitles-text');
        if (subEl) subEl.textContent = isEn ? 'Connecting call... Please speak after clicking the microphone.' : 'Đang kết nối đàm thoại thoại... Hãy nhấp Micro bên dưới để nói chuyện.';

        startVoiceCallTimer();
    } else {
        if (textLayout) textLayout.classList.remove('hidden');
        if (voiceLayout) voiceLayout.classList.add('hidden');
        if (textInputRow) textInputRow.classList.remove('hidden');
        if (voiceInputRow) voiceInputRow.classList.add('hidden');
        stopVoiceCallTimer();
    }

    const msgContainer = document.getElementById('simulation-messages-container');
    msgContainer.innerHTML = '';

    // Add initial AI client greeting based on language and scenario
    const isEn = (currentConfig && currentConfig.language === 'en');
    const company = generatedContext.company || 'chúng tôi';
    const product = currentProduct.productName || 'giải pháp bên bạn';
    const scenId = currentScenario.id;

    let welcomeMsg = '';
    let welcomeCoachHint = '';

    if (isEn) {
        if (scenId === 'cold-call') {
            welcomeMsg = `Hello, this is the representative from ${company} speaking. Who is calling, please?`;
            welcomeCoachHint = "Introduce yourself quickly, build rapid rapport, and ask for 2 minutes to explain the purpose of your call.";
        } else if (scenId === 'discovery') {
            welcomeMsg = `Hi, I'm the manager at ${company}. As scheduled, let's have a quick discovery chat to see if your solution fits our operational needs. What would you like to ask first?`;
            welcomeCoachHint = "Start with open-ended questions about their current challenges, team structure, and workflow bottleneck.";
        } else if (scenId === 'demo') {
            welcomeMsg = `Hi, I'm ready. Go ahead and demo the product. Please focus on how it solves our specific challenges rather than showing general features.`;
            welcomeCoachHint = "Guide them through a tailored demo matching their pain points, and check for alignment after each feature.";
        } else if (scenId === 'negotiation') {
            welcomeMsg = `Hello. I reviewed your proposal for ${product}. Today, let's discuss the commercial terms, pricing, and discount policy, as your current cost is quite high.`;
            welcomeCoachHint = "Acknowledge the budget concern, justify value, and propose contract commitments in exchange for discounts.";
        } else if (scenId === 'manager') {
            welcomeMsg = `Hi there. I heard you wanted to pitch a new tool for our department. Budgets are very tight this quarter, so explain how this actually boosts our team's productivity.`;
            welcomeCoachHint = "Treat your manager as a partner. Emphasize team efficiency, ease of adoption, and quick implementation.";
        } else if (scenId === 'proposal') {
            welcomeMsg = `Hello. Thanks for joining. Let's go through your detailed solution proposal and implementation roadmap for ${company}. What is your plan?`;
            welcomeCoachHint = "Present the solution proposal, emphasize custom milestones, and ask about their timeline approval process.";
        } else if (scenId === 'budget') {
            welcomeMsg = `Hello. The board is ready to hear your proposal to allocate budget for ${product}. Please clearly explain the business case and expected ROI of this investment.`;
            welcomeCoachHint = "Make a strong financial business case, show ROI calculations, and address potential implementation risks.";
        } else {
            welcomeMsg = `Hello, I am the representative of ${company}. Let's discuss your solution ${product}. May I know what you would like to discuss first?`;
            welcomeCoachHint = "Begin the meeting with a warm greeting, build rapport, and set a clear meeting agenda.";
        }
    } else {
        if (scenId === 'cold-call') {
            welcomeMsg = `Alo, tôi nghe đây. Ai đầu dây đấy ạ?`;
            welcomeCoachHint = "Giới thiệu bản thân và công ty ngắn gọn (dưới 20 giây), xin 2 phút trình bày lý do cuộc gọi và thăm dò xem có đúng người phụ trách không.";
        } else if (scenId === 'discovery') {
            welcomeMsg = `Chào em, anh là quản lý bên ${company}. Như đã hẹn, hôm nay mình làm buổi trao đổi ngắn để tìm hiểu xem giải pháp bên em có giúp ích gì được cho quy trình vận hành bên anh không nhé.`;
            welcomeCoachHint = "Bắt đầu đặt các câu hỏi mở để tìm hiểu quy trình hiện tại, khó khăn cốt lõi và các công cụ họ đang dùng.";
        } else if (scenId === 'demo') {
            welcomeMsg = `Chào em, anh chuẩn bị xong rồi. Em cứ demo sản phẩm đi. Tập trung vào phần giải quyết chồng chéo dữ liệu và phân quyền nhân sự ấy nhé.`;
            welcomeCoachHint = "Trình bày bản demo cá nhân hóa tập trung vào điểm đau của họ. Thường xuyên dừng lại tương tác xem họ có hiểu không.";
        } else if (scenId === 'negotiation') {
            welcomeMsg = `Chào em, anh xem qua hồ sơ đề xuất cho giải pháp ${product} rồi. Hôm nay mình ngồi lại thương lượng về mức giá, chiết khấu và điều khoản thanh toán nhé. Giá bên em đang hơi cao.`;
            welcomeCoachHint = "Không vội vàng giảm giá. Bảo vệ giá trị sản phẩm trước, đề xuất các gói thanh toán năm hoặc hợp đồng dài hạn để có chiết khấu.";
        } else if (scenId === 'manager') {
            welcomeMsg = `Chào em, nghe nói em muốn đề xuất bộ công cụ mới cho phòng mình à? Quý này ngân sách sếp tổng duyệt đang kẹt lắm, em trình bày nhanh xem giải pháp này giúp đội mình tăng năng suất thế nào đi.`;
            welcomeCoachHint = "Đặt bản thân vào vị trí của sếp: nhấn mạnh sự ổn định, giảm tải cho nhân viên và thời gian làm quen công cụ nhanh.";
        } else if (scenId === 'proposal') {
            welcomeMsg = `Chào em. Hôm nay mình đi chi tiết vào phương án triển khai và báo giá cho bên ${company} nhé. Em bắt đầu đi.`;
            welcomeCoachHint = "Trình bày rõ các mốc bàn giao (milestones), cam kết chất lượng (SLA) và hỏi về quy trình phê duyệt ký kết.";
        } else if (scenId === 'budget') {
            welcomeMsg = `Chào em. Ban giám đốc đã có mặt đông đủ để nghe em thuyết trình xin cấp ngân sách cho giải pháp ${product}. Em làm rõ bài toán kinh tế ROI và rủi ro triển khai xem nào.`;
            welcomeCoachHint = "Đưa ra các con số tài chính thuyết phục, so sánh chi phí cơ hội giữa việc tự xây dựng/dùng công cụ cũ và mua mới.";
        } else {
            welcomeMsg = `Chào bạn, tôi là người đại diện của công ty ${company}. Theo lịch thì hôm nay chúng ta có buổi trao đổi về giải pháp ${product} bên bạn. Không biết bạn muốn trình bày/thảo luận phần nào trước?`;
            welcomeCoachHint = "Hãy mở đầu buổi gặp thật cởi mở, xây dựng quan hệ (Rapport Building) và giới thiệu sơ bộ mục tiêu.";
        }
    }
        
    addChatMessage('stakeholder', welcomeMsg);
    
    // Log initial history item
    chatHistory.push({ role: 'model', content: welcomeMsg });

    // Update voice subtitle box in voice mode
    const subEl = document.getElementById('voice-subtitles-text');
    if (subEl && interactionMode === 'voice') {
        subEl.textContent = welcomeMsg;
    }

    // Initial TTS reading
    speakStakeholderResponse(welcomeMsg);

    // Initial coach advice based on language
    if (!welcomeCoachHint) {
        welcomeCoachHint = isEn 
            ? "Begin the meeting with a warm greeting, build rapport, and outline the meeting agenda."
            : "Hãy mở đầu buổi gặp thật cởi mở, xây dựng quan hệ (Rapport Building) và giới thiệu sơ bộ mục tiêu.";
    }
    updateCoachHint(welcomeCoachHint);
}

function handleChatEnter(e) {
    if (e.key === 'Enter') {
        unlockSharedAudio();
        sendSimulatorMessage();
    }
}

async function sendSimulatorMessage() {
    unlockSharedAudio();
    const inputEl = document.getElementById('simulation-user-input');
    const messageText = inputEl.value.trim();
    if (!messageText || !isSimulationActive) return;

    inputEl.value = '';
    sendSimulatorMessageFromText(messageText);
}

function addChatMessage(role, text) {
    const container = document.getElementById('simulation-messages-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg-wrapper ${role}`;
    
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const avatar = role === 'user' ? '👨‍💼' : '🏢';

    wrapper.innerHTML = `
        <div class="chat-msg-avatar">${avatar}</div>
        <div class="chat-bubble">
            ${text}
            <span class="chat-bubble-meta">${timeStr}</span>
        </div>
    `;

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('simulation-messages-container');
    const id = `typing-${Date.now()}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-msg-wrapper stakeholder';
    wrapper.id = id;
    
    wrapper.innerHTML = `
        <div class="chat-msg-avatar">🏢</div>
        <div class="chat-bubble">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function updateCoachHint(text) {
    const box = document.getElementById('coach-hint-display-box');
    if (box) {
        box.textContent = text;
        // Trigger subtle animation restart
        box.style.animation = 'none';
        box.offsetHeight; /* trigger reflow */
        box.style.animation = null; 
    }
    const voiceCoachBox = document.getElementById('voice-coach-hint-display');
    if (voiceCoachBox) {
        voiceCoachBox.textContent = `💡 HUẤN LUYỆN VIÊN: ${text}`;
    }
}

function toggleCoachPanel() {
    const checked = document.getElementById('coach-toggle-checkbox').checked;
    const sidebar = document.querySelector('.coach-sidebar');
    if (sidebar) {
        sidebar.style.opacity = checked ? '1' : '0.5';
    }
}

// End sales session and trigger evaluation API
async function endSalesSimulation(force = false) {
    if (!force && !confirm('Bạn có thực sự muốn kết thúc cuộc họp này và nhận đánh giá không?')) return;
    clearInactivityTimer();
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    isWaitingForAI = false;
    isSimulationActive = false;
    stopVoiceCallTimer();
    cancelAIResponseSpeech();
    showWizardStep(6);

    const scoreCircle = document.getElementById('report-overall-score-circle');
    const scoreVal = document.getElementById('report-overall-score-val');
    const titleEl = document.getElementById('report-overall-title');
    const skillsContainer = document.getElementById('report-bar-skills-container');
    const strengthsUl = document.getElementById('report-strengths-list');
    const weaknessesUl = document.getElementById('report-weaknesses-list');
    const suggestionsBox = document.getElementById('report-suggested-answers-container');
    const replayContainer = document.getElementById('report-replay-transcript-list');

    scoreVal.textContent = '...';
    scoreCircle.style.strokeDashoffset = '402'; // reset animation

    try {
        const response = await fetch('/api/roleplay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'evaluateSession',
                history: chatHistory,
                context: generatedContext,
                scenario: currentScenario.title,
                industry: currentConfig.industry,
                size: currentConfig.size,
                difficulty: currentConfig.difficulty,
                personality: currentConfig.personality,
                product: currentProduct
            })
        });

        const data = await response.json();
        const report = data.report;

        // Render Radial Score Circle
        scoreVal.textContent = report.score;
        const offset = 402 - (402 * report.score) / 100;
        scoreCircle.style.strokeDashoffset = offset;

        // Skill Level & Frameworks
        document.getElementById('report-skill-level').textContent = report.estimatedSkillLevel;
        document.getElementById('report-sales-framework').textContent = `Khung: ${report.salesFramework}`;

        // Overall nickname title
        titleEl.textContent = report.score >= 90 ? 'Chiến Thần Chốt Deal' : report.score >= 80 ? 'Cao Thủ Đàm Phán' : report.score >= 65 ? 'Chiến Binh Thực Chiến' : 'Tân Binh Sales';

        // Render Skill breakdown bars
        skillsContainer.innerHTML = '';
        for (let key in report.scores) {
            const cleanName = getSkillCleanName(key);
            const val = report.scores[key];
            const row = document.createElement('div');
            row.className = 'skill-bar-row';
            row.innerHTML = `
                <div class="skill-bar-meta">
                    <span>${cleanName}</span>
                    <span>${val}%</span>
                </div>
                <div class="skill-bar-bg">
                    <div class="skill-bar-fill" style="width: ${val}%"></div>
                </div>
            `;
            skillsContainer.appendChild(row);
        }

        // Render Strengths / Weaknesses
        strengthsUl.innerHTML = report.strengths.map(s => `<li>${s}</li>`).join('');
        weaknessesUl.innerHTML = report.weaknesses.map(w => `<li>${w}</li>`).join('');

        // Render Suggestions
        suggestionsBox.innerHTML = '';
        report.suggestedAnswers.forEach(item => {
            const box = document.createElement('div');
            box.style.background = 'rgba(255,255,255,0.02)';
            box.style.border = '1px solid var(--border-color)';
            box.style.padding = '15px';
            box.style.borderRadius = '8px';
            box.innerHTML = `
                <div style="font-weight: 800; color: #f3a83b; font-size: 0.8rem; margin-bottom: 5px;">KHOẢNH KHẮC: ${item.moment}</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); text-decoration: line-through; margin-bottom: 6px;">Bạn nói: "${item.userResponse}"</div>
                <div style="font-size: 0.85rem; color: #10b981; font-weight: 700;">Gợi ý: "${item.suggestedResponse}"</div>
            `;
            suggestionsBox.appendChild(box);
        });

        // Render Replay Transcript list
        replayContainer.innerHTML = '';
        chatHistory.forEach((msg, idx) => {
            if (msg.role === 'model') {
                const item = document.createElement('div');
                item.className = 'transcript-message-item';
                item.innerHTML = `<b style="color: #ef4444;">Khách hàng:</b> "${msg.content}"`;
                replayContainer.appendChild(item);
            } else {
                const item = document.createElement('div');
                item.className = 'transcript-message-item';
                
                // Highlight heuristics
                let highlightClass = '';
                let badge = '';
                if (idx === 1) {
                    highlightClass = 'highlight-good';
                    badge = '<span class="highlight-badge good">Mở đầu tự tin</span>';
                } else if (msg.content.length > 200) {
                    highlightClass = 'highlight-bad';
                    badge = '<span class="highlight-badge bad">Nói quá dài, khách hàng dễ chán</span>';
                } else if (msg.content.toLowerCase().includes('ngân sách') || msg.content.toLowerCase().includes('giá trị')) {
                    highlightClass = 'highlight-good';
                    badge = '<span class="highlight-badge good">Gây dựng lòng tin</span>';
                }

                item.className += ` ${highlightClass}`;
                item.innerHTML = `
                    ${badge}
                    <div><b style="color: #6366f1;">Bạn:</b> "${msg.content}"</div>
                `;
                replayContainer.appendChild(item);
            }
        });

        // Save session history
        saveSessionToHistory(report.score, report.salesFramework, report.estimatedSkillLevel);

        // Update gamification data
        awardPointsAndXP(report.score, report.scores);

    } catch (e) {
        console.error(e);
        alert('Tạo đánh giá cuộc họp thất bại.');
    }
}

function getSkillCleanName(key) {
    const map = {
        opening: "Mở đầu tiếp cận (Opening)",
        discovery: "Đặt câu hỏi khám phá (Discovery)",
        activeListening: "Lắng nghe chủ động (Active Listening)",
        problemDiagnosis: "Chẩn đoán bối cảnh khó (Diagnosis)",
        valueSelling: "Bán giá trị giải pháp (Value Selling)",
        productKnowledge: "Kiến thức sản phẩm (Product)",
        businessAcumen: "Độ sắc bén tư duy (Business Acumen)",
        handlingObjections: "Xử lý phản đối (Objections)",
        negotiation: "Thương lượng điều khoản (Negotiation)",
        communication: "Phong thái truyền thông (Communication)",
        confidence: "Độ tin cậy & tự tin (Confidence)",
        closing: "Chốt bước tiếp theo (Closing)"
    };
    return map[key] || key;
}

// Gamification Engine
function awardPointsAndXP(score, scores) {
    let currentXP = parseInt(localStorage.getItem('b2b_sim_xp') || '0', 10);
    let currentLevel = parseInt(localStorage.getItem('b2b_sim_level') || '1', 10);
    let streak = parseInt(localStorage.getItem('b2b_sim_streak') || '0', 10);
    let badges = JSON.parse(localStorage.getItem('b2b_sim_badges') || '[]');

    // Award XP based on score
    const gainedXP = score;
    currentXP += gainedXP;

    // Check level up (100 XP per level)
    if (currentXP >= 100) {
        currentLevel += Math.floor(currentXP / 100);
        currentXP = currentXP % 100;
        alert(`🎉 CHÚC MỪNG! Bạn đã tăng lên Cấp độ ${currentLevel}!`);
    }

    // Daily streak logic
    streak += 1;
    localStorage.setItem('b2b_sim_streak', streak.toString());

    // Badges unlock checks
    const prevBadgesCount = badges.length;
    
    // Badge 1: Pitch Master (completed 3 simulations)
    const history = JSON.parse(localStorage.getItem('b2b_sim_history') || '[]');
    if (history.length >= 3 && !badges.includes('pitch-master')) {
        badges.push('pitch-master');
    }
    // Badge 2: Discovery Expert (score >= 85 in discovery)
    if (scores.discovery >= 85 && !badges.includes('discovery-expert')) {
        badges.push('discovery-expert');
    }
    // Badge 3: Negotiation King (score >= 85 in negotiation)
    if (scores.negotiation >= 85 && !badges.includes('negotiation-king')) {
        badges.push('negotiation-king');
    }
    // Badge 4: Top Performer (overall score >= 90)
    if (score >= 90 && !badges.includes('top-performer')) {
        badges.push('top-performer');
    }

    localStorage.setItem('b2b_sim_xp', currentXP.toString());
    localStorage.setItem('b2b_sim_level', currentLevel.toString());
    localStorage.setItem('b2b_sim_badges', JSON.stringify(badges));

    if (badges.length > prevBadgesCount) {
        alert(`🏆 HUY CHƯƠNG MỚI ĐÃ ĐƯỢC MỞ KHÓA! Hãy kiểm tra trong profile của bạn.`);
    }

    updateSidebarGamification();
    
    // Award general B2B portal points (Points-Based Gamification Integration)
    if (typeof window.registerUserAction === 'function') {
        window.registerUserAction('pic_search'); // Treat simulation completion as Outbound action to award 3 points
    }
}

function updateSidebarGamification() {
    const xp = parseInt(localStorage.getItem('b2b_sim_xp') || '0', 10);
    const level = parseInt(localStorage.getItem('b2b_sim_level') || '1', 10);
    const streak = parseInt(localStorage.getItem('b2b_sim_streak') || '0', 10);
    
    const xpText = document.getElementById('sidebar-xp-text');
    const xpProgress = document.getElementById('sidebar-xp-progress');
    const levelBadge = document.getElementById('sidebar-level-badge');
    const levelName = document.getElementById('sidebar-level-name');
    const streakText = document.getElementById('sidebar-streak-text');

    if (xpText) xpText.textContent = `${xp} / 100 XP`;
    if (xpProgress) xpProgress.style.width = `${xp}%`;
    if (levelBadge) levelBadge.textContent = level;
    if (streakText) streakText.textContent = `Streak: ${streak} ngày 🔥`;

    if (levelName) {
        levelName.textContent = level >= 10 ? 'Chiến thần B2B' : level >= 5 ? 'Chuyên Gia' : level >= 3 ? 'Chiến Binh' : 'Tân Binh';
    }

    // Update Badges UI in dashboard
    const badges = JSON.parse(localStorage.getItem('b2b_sim_badges') || '[]');
    badges.forEach(bId => {
        const card = document.getElementById(`badge-${bId}`);
        if (card) card.classList.add('unlocked');
    });
}

function restartSimulationWizard() {
    activeStep = 1;
    currentScenario = null;
    currentConfig = {};
    currentProduct = null;
    generatedContext = null;
    chatHistory = [];
    isSimulationActive = false;

    // Reset Scenario selections
    document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
    
    showWizardStep(1);
    switchTab('simulator');
}

// Save Completed Session to History Logs
function saveSessionToHistory(score, framework, skillLevel) {
    const history = JSON.parse(localStorage.getItem('b2b_sim_history') || '[]');
    const dateStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    history.unshift({
        date: dateStr,
        scenario: currentScenario.title,
        company: generatedContext.company,
        industry: currentConfig.industry,
        difficulty: currentConfig.difficulty,
        score: score,
        framework: framework,
        skillLevel: skillLevel
    });

    localStorage.setItem('b2b_sim_history', JSON.stringify(history));
}

// Render History Log Lists (Dashboard & History Tab)
function renderHistoryList() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    const history = JSON.parse(localStorage.getItem('b2b_sim_history') || '[]');
    tbody.innerHTML = '';

    if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Bạn chưa tham gia thực hành kịch bản nào.</td></tr>`;
        return;
    }

    history.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.date}</td>
            <td><b>${item.scenario}</b></td>
            <td>${item.company} (${item.industry})</td>
            <td><span style="font-size: 0.75rem; font-weight: 700; color: #f3a83b;">${item.difficulty}</span></td>
            <td><strong style="color: #10b981; font-size: 1rem;">${item.score}đ</strong></td>
            <td><span style="font-size: 0.72rem; font-weight: 800; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">${item.framework}</span></td>
            <td><button class="btn" style="padding: 4px 10px; font-size: 0.75rem; background: var(--primary); border: none; border-radius: 4px; color: #fff;" onclick="viewPastReport('${item.date}')">Xem</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function viewPastReport(date) {
    alert(`Chức năng hiển thị chi tiết lịch sử phiên đàm phán ngày ${date} đang được đồng bộ.`);
}

// Render Dashboard Overall score and skill rating averages
function renderDashboardStats() {
    const history = JSON.parse(localStorage.getItem('b2b_sim_history') || '[]');
    const circle = document.getElementById('dashboard-overall-score-circle');
    const scoreVal = document.getElementById('dashboard-overall-score-val');
    const countEl = document.getElementById('dashboard-eval-count');

    if (!circle || !scoreVal) return;

    if (history.length === 0) {
        scoreVal.textContent = '0';
        circle.style.strokeDashoffset = '402';
        countEl.textContent = 'Chưa hoàn thành lượt roleplay nào';
        return;
    }

    const totalScore = history.reduce((acc, item) => acc + item.score, 0);
    const avgScore = Math.round(totalScore / history.length);

    scoreVal.textContent = avgScore;
    const offset = 402 - (402 * avgScore) / 100;
    circle.style.strokeDashoffset = offset;
    countEl.textContent = `Đã hoàn thành ${history.length} lượt thực hành pitching`;

    // Render Dashboard Skills Breakdown averages
    const discVal = document.getElementById('bar-val-discovery');
    const discFill = document.getElementById('bar-fill-discovery');
    const objVal = document.getElementById('bar-val-objection');
    const objFill = document.getElementById('bar-fill-objection');
    const negVal = document.getElementById('bar-val-negotiation');
    const negFill = document.getElementById('bar-fill-negotiation');

    // Calculate mock/heuristic ratings based on average score
    const discAvg = Math.round(avgScore * 1.02);
    const objAvg = Math.round(avgScore * 0.95);
    const negAvg = Math.round(avgScore * 0.9);

    if (discVal) discVal.textContent = `${discAvg}%`;
    if (discFill) discFill.style.width = `${discAvg}%`;
    if (objVal) objVal.textContent = `${objAvg}%`;
    if (objFill) objFill.style.width = `${objAvg}%`;
    if (negVal) negVal.textContent = `${negAvg}%`;
    if (negFill) negFill.style.width = `${negAvg}%`;
}

// Product Library management
function openNewProductModal() {
    document.getElementById('new-product-form-panel').classList.remove('hidden');
}

function closeNewProductModal() {
    document.getElementById('new-product-form-panel').classList.add('hidden');
}

function saveProductForm() {
    const comp = document.getElementById('prod-form-company').value.trim();
    const name = document.getElementById('prod-form-name').value.trim();
    const desc = document.getElementById('prod-form-desc').value.trim();
    const usp = document.getElementById('prod-form-usp').value.trim();
    const pricing = document.getElementById('prod-form-pricing').value.trim();
    const comps = document.getElementById('prod-form-competitors').value.trim();
    const targets = document.getElementById('prod-form-targets').value.trim();

    if (!comp || !name || !desc) {
        alert('Doanh nghiệp, Tên sản phẩm và Mô tả là bắt buộc!');
        return;
    }

    const products = JSON.parse(localStorage.getItem('b2b_sim_products') || '[]');
    products.push({
        id: `prod-${Date.now()}`,
        companyName: comp,
        productName: name,
        productDesc: desc,
        usp: usp,
        pricing: pricing,
        competitors: comps,
        targetCustomers: targets
    });

    localStorage.setItem('b2b_sim_products', JSON.stringify(products));
    alert('Đã lưu sản phẩm thành công vào thư viện!');

    // Reset inputs
    document.getElementById('prod-form-company').value = '';
    document.getElementById('prod-form-name').value = '';
    document.getElementById('prod-form-desc').value = '';
    document.getElementById('prod-form-usp').value = '';
    document.getElementById('prod-form-pricing').value = '';
    document.getElementById('prod-form-competitors').value = '';
    document.getElementById('prod-form-targets').value = '';

    closeNewProductModal();
    renderProductsList();
}

function deleteProduct(id) {
    if (!confirm('Bạn có thực sự muốn xóa sản phẩm này không?')) return;
    let products = JSON.parse(localStorage.getItem('b2b_sim_products') || '[]');
    products = products.filter(p => p.id !== id);
    localStorage.setItem('b2b_sim_products', JSON.stringify(products));
    renderProductsList();
}

// Admin Panel management
function renderAdminScenarios() {
    const tbody = document.getElementById('admin-scenarios-table-body');
    if (!tbody) return;

    const scenarios = JSON.parse(localStorage.getItem('b2b_sim_scenarios') || '[]');
    tbody.innerHTML = '';

    scenarios.forEach(scen => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size: 1.4rem;">${scen.icon}</td>
            <td><b>${scen.title}</b></td>
            <td><span class="scenario-category-badge ${scen.category}">${scen.category}</span></td>
            <td>${scen.desc}</td>
            <td><button class="btn" style="padding: 4px 10px; font-size: 0.72rem; background: #a20a0a; color: #fff; border: none; border-radius: 4px;" onclick="deleteScenario('${scen.id}')">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function openNewScenarioModal() {
    document.getElementById('new-scenario-form-panel').classList.remove('hidden');
}

function closeNewScenarioModal() {
    document.getElementById('new-scenario-form-panel').classList.add('hidden');
}

function saveScenarioForm() {
    const icon = document.getElementById('scen-form-icon').value.trim();
    const title = document.getElementById('scen-form-title').value.trim();
    const desc = document.getElementById('scen-form-desc').value.trim();
    const cat = document.getElementById('scen-form-category').value;

    if (!icon || !title || !desc) {
        alert('Vui lòng điền đầy đủ thông tin kịch bản!');
        return;
    }

    const scenarios = JSON.parse(localStorage.getItem('b2b_sim_scenarios') || '[]');
    scenarios.push({
        id: `scen-${Date.now()}`,
        title: title,
        category: cat,
        desc: desc,
        icon: icon
    });

    localStorage.setItem('b2b_sim_scenarios', JSON.stringify(scenarios));
    alert('Đã tạo kịch bản mới thành công!');

    document.getElementById('scen-form-icon').value = '';
    document.getElementById('scen-form-title').value = '';
    document.getElementById('scen-form-desc').value = '';

    closeNewScenarioModal();
    renderAdminScenarios();
    renderScenariosList();
}

function deleteScenario(id) {
    if (!confirm('Bạn có thực sự muốn xóa kịch bản này không?')) return;
    let scenarios = JSON.parse(localStorage.getItem('b2b_sim_scenarios') || '[]');
    scenarios = scenarios.filter(s => s.id !== id);
    localStorage.setItem('b2b_sim_scenarios', JSON.stringify(scenarios));
    renderAdminScenarios();
    renderScenariosList();
}

function resetDefaultAdminConfig() {
    if (!confirm('Xác nhận khôi phục danh sách kịch bản mặc định ban đầu?')) return;
    localStorage.removeItem('b2b_sim_scenarios');
    initDatabase();
    renderAdminScenarios();
    renderScenariosList();
}

// Interaction Mode & Web Speech API Utilities
let voiceCallTimerInterval = null;
let voiceCallSeconds = 0;

function selectInteractionMode(mode) {
    interactionMode = 'voice';
}

function startInactivityTimer() {
    clearInactivityTimer();
    if (interactionMode !== 'voice' || !isSimulationActive || isWaitingForAI || isRecording) return;
    
    // Inactivity timeout: 60 seconds of waiting for user feedback
    inactivityTimeout = setTimeout(() => {
        if (!isSimulationActive) return;
        
        if (recognition) {
            try { recognition.stop(); } catch (e) {}
        }
        
        const isEn = (currentConfig && currentConfig.language === 'en');
        const timeoutMsg = isEn 
            ? "I haven't heard anything from you. I have to go now. Goodbye." 
            : "Tôi không thấy bạn phản hồi gì nữa. Tôi có việc bận rồi, xin phép cúp máy nhé.";
            
        const subtitlesEl = document.getElementById('voice-subtitles-text');
        if (subtitlesEl) {
            subtitlesEl.textContent = `${timeoutMsg} (Cuộc họp tự động kết thúc do treo máy quá lâu)`;
        }
        
        // Push timeout response to chat history so it shows in evaluation
        chatHistory.push({ role: 'model', content: timeoutMsg });
        
        // Speak timeout response
        speakStakeholderResponse(timeoutMsg);
        
        setTimeout(() => {
            if (isSimulationActive) {
                endSalesSimulation(true); // Bypass confirm dialog
            }
        }, 6000); // Wait 6 seconds for speech to complete
    }, 60000);
}

function clearInactivityTimer() {
    if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = null;
    }
}

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;

        recognition.onstart = () => {
            isRecording = true;
            clearInactivityTimer();
            
            // Limit user speaking time to 30 seconds continuously
            if (speechTimeout) clearTimeout(speechTimeout);
            speechTimeout = setTimeout(() => {
                if (isRecording && isSimulationActive) {
                    try { recognition.stop(); } catch (e) {}
                    
                    const isEn = (currentConfig && currentConfig.language === 'en');
                    const interruptMsg = isEn 
                        ? "Excuse me, I think you're going a bit too long. Can we get straight to the main point?"
                        : "Xin lỗi em, chị thấy em trình bày hơi dài dòng một chút. Mình có thể đi thẳng vào ý chính được không?";
                    
                    const subtitlesEl = document.getElementById('voice-subtitles-text');
                    if (subtitlesEl) {
                        subtitlesEl.textContent = interruptMsg;
                    }
                    
                    clearInactivityTimer();
                    chatHistory.push({ role: 'model', content: interruptMsg });
                    speakStakeholderResponse(interruptMsg);
                }
            }, 30000); // 30 seconds threshold
            
            // Highlight main micro buttons
            const micBtn = document.getElementById('btn-voice-mic');
            const mainMicBtn = document.getElementById('btn-voice-mic-main');
            if (micBtn) {
                micBtn.classList.add('recording');
                micBtn.textContent = '🛑';
                micBtn.style.background = '#10b981';
            }
            if (mainMicBtn) {
                mainMicBtn.classList.add('recording');
                mainMicBtn.textContent = '🛑';
            }

            const statusLabel = document.getElementById('voice-status-label');
            if (statusLabel) statusLabel.textContent = '🔴 Đang lắng nghe giọng của bạn...';
            const transPreview = document.getElementById('voice-transcription-preview');
            if (transPreview) transPreview.textContent = 'Đang nghe... Hãy nói vào micro.';
            
            const subtitlesEl = document.getElementById('voice-subtitles-text');
            if (subtitlesEl) subtitlesEl.textContent = 'Đang lắng nghe giọng bạn... 🎙️';
        };

        recognition.onend = () => {
            isRecording = false;
            setSpeakerActive('user', false);

            if (speechTimeout) {
                clearTimeout(speechTimeout);
                speechTimeout = null;
            }

            const micBtn = document.getElementById('btn-voice-mic');
            const mainMicBtn = document.getElementById('btn-voice-mic-main');
            if (micBtn) {
                micBtn.classList.remove('recording');
                micBtn.textContent = '🎙️';
                micBtn.style.background = '#ef4444';
            }
            if (mainMicBtn) {
                mainMicBtn.classList.remove('recording');
                mainMicBtn.textContent = '🎙️';
            }

            const statusLabel = document.getElementById('voice-status-label');
            if (statusLabel) statusLabel.textContent = 'Bấm Micro để ghi âm câu thoại';

            if (!isWaitingForAI) {
                startInactivityTimer();
            }
        };

        recognition.onspeechstart = () => {
            clearInactivityTimer();
            setSpeakerActive('user', true);
            const statusLabel = document.getElementById('voice-status-label');
            if (statusLabel) statusLabel.textContent = '🎙️ Đang ghi nhận giọng nói...';
        };

        recognition.onspeechend = () => {
            setSpeakerActive('user', false);
            const statusLabel = document.getElementById('voice-status-label');
            if (statusLabel) statusLabel.textContent = '⏳ Đang xử lý âm thanh...';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const transPreview = document.getElementById('voice-transcription-preview');
            if (transPreview) transPreview.textContent = `Nhận diện được: "${transcript}"`;
            
            const subtitlesEl = document.getElementById('voice-subtitles-text');
            if (subtitlesEl) subtitlesEl.textContent = `Bạn nói: "${transcript}"`;

            setTimeout(() => {
                if (isSimulationActive) {
                    sendSimulatorMessageFromText(transcript);
                }
            }, 800);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setSpeakerActive('user', false);
            
            let errMsg = 'Không bắt được âm thanh. Vui lòng bấm để nói lại.';
            if (event.error === 'not-allowed') {
                errMsg = '⚠️ Thiết bị chưa cho phép truy cập Microphone. Vui lòng click vào ổ khóa trên thanh địa chỉ để cấp quyền ghi âm.';
                alert(errMsg);
            } else if (event.error === 'no-speech') {
                errMsg = 'Không nghe thấy giọng nói. Vui lòng nói to và rõ hơn.';
            }
            
            const statusLabel = document.getElementById('voice-status-label');
            if (statusLabel) statusLabel.textContent = 'Nhận diện lỗi ❌';
            const transPreview = document.getElementById('voice-transcription-preview');
            if (transPreview) transPreview.textContent = errMsg;
        };
    }
}

function toggleVoiceSpeechInput() {
    unlockSharedAudio();
    if (!recognition) {
        alert('Trình duyệt của bạn không hỗ trợ tính năng nhận dạng giọng nói (Speech-to-Text). Vui lòng gõ phím để nhập.');
        return;
    }
    
    cancelAIResponseSpeech();

    if (isRecording) {
        recognition.stop();
    } else {
        const lang = currentConfig.language || 'vi';
        recognition.lang = lang === 'en' ? 'en-US' : 'vi-VN';
        recognition.start();
    }
}

async function sendSimulatorMessageFromText(messageText) {
    if (!messageText || !isSimulationActive) return;

    cancelAIResponseSpeech();
    isWaitingForAI = true;

    addChatMessage('user', messageText);
    chatHistory.push({ role: 'user', content: messageText });

    const typingId = showTypingIndicator();
    
    // In voice mode, show typing status in subtitle
    const subtitlesEl = document.getElementById('voice-subtitles-text');
    if (subtitlesEl && interactionMode === 'voice') {
        subtitlesEl.textContent = 'Khách hàng đang suy nghĩ câu trả lời... ⏳';
    }

    clearInactivityTimer();

    try {
        const response = await fetch('/api/roleplay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'chat',
                message: messageText,
                history: chatHistory.slice(0, -1),
                context: generatedContext,
                scenario: currentScenario.title,
                industry: currentConfig.industry,
                size: currentConfig.size,
                difficulty: currentConfig.difficulty,
                personality: currentConfig.personality,
                voiceGender: currentConfig.voiceGender,
                product: currentProduct,
                liveCoach: document.getElementById('coach-toggle-checkbox').checked,
                language: currentConfig.language || 'vi'
            })
        });

        const data = await response.json();
        isWaitingForAI = false;
        removeTypingIndicator(typingId);

        addChatMessage('stakeholder', data.reply);
        chatHistory.push({ role: 'model', content: data.reply });

        // Update voice subtitles
        if (subtitlesEl && interactionMode === 'voice') {
            subtitlesEl.textContent = data.reply;
        }

        // TTS Speech Synthesis reading
        speakStakeholderResponse(data.reply);

        if (data.coachHint) {
            updateCoachHint(data.coachHint);
        }

        // Check if AI actively requests to end the session
        if (data.endSession) {
            clearInactivityTimer();
            if (recognition) {
                try { recognition.stop(); } catch (e) {}
            }
            if (subtitlesEl && interactionMode === 'voice') {
                subtitlesEl.textContent = `${data.reply} (Cuộc họp kết thúc do đối tác dừng đàm thoại)`;
            }
            setTimeout(() => {
                if (isSimulationActive) {
                    endSalesSimulation(true); // skip confirm box since client hung up
                }
            }, 6500); // Allow time to speak the final words
        }
    } catch (e) {
        isWaitingForAI = false;
        removeTypingIndicator(typingId);
        console.error(e);
        addChatMessage('stakeholder', 'Có lỗi kết nối mạng xảy ra. Vui lòng thử lại câu thoại vừa rồi.');
        startInactivityTimer();
    }
}

function getVoicesAsync() {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
            return;
        }
        const cb = () => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                if (window.speechSynthesis.onvoiceschanged === cb) {
                    window.speechSynthesis.onvoiceschanged = null;
                }
                resolve(voices);
            }
        };
        window.speechSynthesis.onvoiceschanged = cb;
        setTimeout(() => {
            resolve(window.speechSynthesis.getVoices());
        }, 300);
    });
}

async function speakStakeholderResponse(text) {
    if (interactionMode !== 'voice') return;

    try {
        cancelAIResponseSpeech(); // stop current speech & audio
        
        // Clean markdown syntax, stars or emojis before reading to make it sound natural
        const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
                              .replace(/\*/g, '')
                              .trim();

        const lang = (currentConfig && currentConfig.language) ? currentConfig.language : 'vi';
        const gender = (currentConfig && currentConfig.voiceGender) ? currentConfig.voiceGender : 'female';
        const personality = (currentConfig && currentConfig.personality) ? currentConfig.personality : 'Friendly';

        // 1. Compute personality-driven speed rate modifier
        let speedRate = 1.0;
        if (personality === 'Busy') {
            speedRate = 1.15; // Speaks fast and rushed
        } else if (personality === 'Aggressive') {
            speedRate = 1.08; // Fast, assertive
        } else if (personality === 'Analytical') {
            speedRate = 0.94; // Slow but natural, calculated
        } else if (personality === 'Skeptical') {
            speedRate = 0.96; // Hesitant, thoughtful pauses
        } else if (personality === 'CEO') {
            speedRate = 0.94; // Slow, authoritative, clear
        }

        if (lang === 'vi') {
            const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
            const hasViVoice = voices.some(v => v.lang.toLowerCase().includes('vi'));
            
            if (hasViVoice) {
                speakViaWebSpeechAPI(cleanText, 'vi');
            } else if (window.sharedAIAudio) {
                const ttsUrl = `/api/tts?lang=vi&text=${encodeURIComponent(cleanText)}`;
                window.sharedAIAudio.src = ttsUrl;
                window.sharedAIAudio.load();
                
                // 2. Adjust playbackRate to reflect gender & personality naturally
                if (gender === 'male') {
                    // Deepen pitch naturally without sounding slurred or drunk (minimum cap 0.90)
                    window.sharedAIAudio.playbackRate = Math.max(0.90, speedRate * 0.93);
                } else {
                    window.sharedAIAudio.playbackRate = speedRate;
                }
                
                window.sharedAIAudio.onplay = () => {
                    clearInactivityTimer();
                    setSpeakerActive('ai', true);
                };

                window.sharedAIAudio.onended = () => {
                    setSpeakerActive('ai', false);
                    startInactivityTimer();
                };

                window.sharedAIAudio.onerror = (e) => {
                    console.error('Shared Audio TTS playback error:', e);
                    setSpeakerActive('ai', false);
                    speakViaWebSpeechAPI(cleanText, 'vi');
                };

                window.sharedAIAudio.play().catch(err => {
                    if (err.name === 'AbortError') return; // Ignore normal interrupt/src change aborts
                    console.warn('Shared Audio play failed:', err);
                    speakViaWebSpeechAPI(cleanText, 'vi');
                });
            } else {
                speakViaWebSpeechAPI(cleanText, 'vi');
            }
        } else {
            // Use Web Speech API for English
            speakViaWebSpeechAPI(cleanText, 'en');
        }
    } catch (e) {
        console.error('Speech error:', e);
        setSpeakerActive('ai', false);
    }
}

function speakViaWebSpeechAPI(cleanText, lang) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const gender = (currentConfig && currentConfig.voiceGender) ? currentConfig.voiceGender : 'female';
    const personality = (currentConfig && currentConfig.personality) ? currentConfig.personality : 'Friendly';

    // Compute personality speed modifiers
    let speedRate = 1.0;
    if (personality === 'Busy') {
        speedRate = 1.15;
    } else if (personality === 'Aggressive') {
        speedRate = 1.08;
    } else if (personality === 'Analytical') {
        speedRate = 0.92;
    } else if (personality === 'Skeptical') {
        speedRate = 0.95;
    } else if (personality === 'CEO') {
        speedRate = 0.90;
    }

    utterance.lang = lang === 'en' ? 'en-US' : 'vi-VN';
    
    // Apply speed modifiers
    if (lang === 'en') {
        utterance.rate = 0.95 * speedRate;
    } else {
        utterance.rate = (gender === 'male' ? 0.85 : 0.90) * speedRate;
    }

    // Deepen pitch if male is selected to simulate masculine voice
    if (gender === 'male') {
        utterance.pitch = 0.75;
    } else {
        utterance.pitch = 1.0;
    }

    utterance.onstart = () => {
        clearInactivityTimer();
        setSpeakerActive('ai', true);
    };

    utterance.onend = () => {
        setSpeakerActive('ai', false);
        startInactivityTimer();
    };

    utterance.onerror = () => {
        setSpeakerActive('ai', false);
        startInactivityTimer();
    };

    const voices = loadedVoices.length > 0 ? loadedVoices : window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (lang === 'en') {
        const enVoices = voices.filter(v => v.lang.toLowerCase().includes('en'));
        if (gender === 'female') {
            selectedVoice = enVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('online') && (name.includes('samantha') || name.includes('zira') || name.includes('hazel') || name.includes('female') || name.includes('siri') || name.includes('natural') || name.includes('google'));
            }) || enVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('samantha') || name.includes('zira') || name.includes('hazel') || name.includes('female') || name.includes('siri') || name.includes('google');
            });
        } else {
            selectedVoice = enVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('online') && (name.includes('david') || name.includes('mark') || name.includes('george') || name.includes('male') || name.includes('siri') || name.includes('natural') || name.includes('google'));
            }) || enVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('david') || name.includes('mark') || name.includes('george') || name.includes('male') || name.includes('siri') || name.includes('google');
            });
        }
        if (!selectedVoice && enVoices.length > 0) {
            selectedVoice = enVoices[0];
        }
    } else {
        const viVoices = voices.filter(v => v.lang.toLowerCase().includes('vi'));
        if (gender === 'female') {
            selectedVoice = viVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('online') && (name.includes('hoaimy') || name.includes('huyen') || name.includes('linh') || name.includes('female') || name.includes('natural') || name.includes('google'));
            }) || viVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('hoaimy') || name.includes('huyen') || name.includes('linh') || name.includes('female') || name.includes('google');
            });
        } else {
            selectedVoice = viVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('online') && (name.includes('nam') || name.includes('an') || name.includes('phong') || name.includes('male') || name.includes('natural') || name.includes('google'));
            }) || viVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('nam') || name.includes('an') || name.includes('phong') || name.includes('male') || name.includes('google');
            });
        }
        if (!selectedVoice && viVoices.length > 0) {
            selectedVoice = viVoices[0];
        }
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
}

function cancelAIResponseSpeech() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    if (window.currentActiveAudio) {
        try {
            window.currentActiveAudio.pause();
        } catch (e) {}
        window.currentActiveAudio = null;
    }
    setSpeakerActive('ai', false);
}

function showVoiceWarningToast() {
    let warningEl = document.getElementById('voice-engine-warning');
    if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.id = 'voice-engine-warning';
        warningEl.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #eab308; color: #0f172a; padding: 12px 20px; border-radius: 8px; font-size: 0.82rem; font-weight: bold; z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); max-width: 320px; line-height: 1.4; display: flex; flex-direction: column; gap: 4px;';
        warningEl.innerHTML = `
            <div>⚠️ Thiết bị chưa cài giọng Tiếng Việt</div>
            <div style="font-size: 0.72rem; font-weight: normal; opacity: 0.95;">
                Trình duyệt của bạn đang giả lập giọng Tiếng Việt qua ngôn ngữ khác nên nghe có vẻ "lớ". Vui lòng chuyển sang Tiếng Anh hoặc cài đặt gói ngôn ngữ tiếng Việt của Google/Microsoft.
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top: 4px; background: rgba(0,0,0,0.1); border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: bold; width: fit-content;">Đóng</button>
        `;
        document.body.appendChild(warningEl);
        // Auto remove after 8 seconds
        setTimeout(() => {
            if (warningEl.parentElement) warningEl.remove();
        }, 8000);
    }
}

// Asynchronously prefetch voices to fix first-load robotic fallback voice bug
if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
        // pre-query voices
        window.speechSynthesis.getVoices();
    };
}

function toggleKeyboardFallback() {
    const textInputRow = document.getElementById('text-input-row');
    const voiceInputRow = document.getElementById('voice-input-row');
    if (textInputRow && voiceInputRow) {
        textInputRow.classList.toggle('hidden');
        voiceInputRow.classList.add('hidden');
    }
}

function toggleKeyboardFallbackFromVoice() {
    interactionMode = 'text';
    
    // Toggle main screens
    const textLayout = document.getElementById('text-simulator-layout');
    const voiceLayout = document.getElementById('voice-simulator-layout');
    if (textLayout) textLayout.classList.remove('hidden');
    if (voiceLayout) voiceLayout.classList.add('hidden');

    // Make sure text row is visible
    const textInputRow = document.getElementById('text-input-row');
    const voiceInputRow = document.getElementById('voice-input-row');
    if (textInputRow) textInputRow.classList.remove('hidden');
    if (voiceInputRow) voiceInputRow.classList.add('hidden');

    stopVoiceCallTimer();
    cancelAIResponseSpeech();
}

// Voice Call Timer Logic
function startVoiceCallTimer() {
    stopVoiceCallTimer();
    voiceCallSeconds = 0;
    const timerVal = document.getElementById('voice-call-timer-val');
    if (timerVal) timerVal.textContent = '00:00';

    voiceCallTimerInterval = setInterval(() => {
        voiceCallSeconds++;
        const mins = String(Math.floor(voiceCallSeconds / 60)).padStart(2, '0');
        const secs = String(voiceCallSeconds % 60).padStart(2, '0');
        if (timerVal) timerVal.textContent = `${mins}:${secs}`;
    }, 1000);
}

function stopVoiceCallTimer() {
    if (voiceCallTimerInterval) {
        clearInterval(voiceCallTimerInterval);
        voiceCallTimerInterval = null;
    }
}

// Speaker Active visual updates (mockup ripple & bar indicator)
function setSpeakerActive(speaker, isActive) {
    const aiBox = document.getElementById('voice-ai-profile-box');
    const userBox = document.getElementById('voice-user-profile-box');
    
    if (speaker === 'ai' && aiBox) {
        if (isActive) {
            aiBox.classList.add('speaking');
        } else {
            aiBox.classList.remove('speaking');
        }
    } else if (speaker === 'user' && userBox) {
        if (isActive) {
            userBox.classList.add('speaking');
        } else {
            userBox.classList.remove('speaking');
        }
    }
}

async function generateMeetingContextAndStart() {
    const nextBtn = document.querySelector('#sim-step-3 button:not(.btn-secondary)');
    const originalText = nextBtn ? nextBtn.textContent : '';
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = 'Đang chuẩn bị bối cảnh... ⏳';
    }

    try {
        await generateMeetingContext();
        startChatSimulation();
    } catch (e) {
        console.error(e);
        alert('Có lỗi xảy ra khi tạo bối cảnh cuộc họp.');
    } finally {
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = originalText;
        }
    }
}

function toggleDossierDrawer() {
    const content = document.getElementById('dossier-drawer-content');
    const arrow = document.getElementById('dossier-drawer-arrow');
    if (content && arrow) {
        content.classList.toggle('hidden');
        arrow.textContent = content.classList.contains('hidden') ? '▼' : '▲';
    }
}

function toggleDossierModal() {
    const modal = document.getElementById('voice-dossier-modal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

// Global user interaction Web Audio/SpeechSynthesis unlocker
document.addEventListener('click', () => {
    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
    }
    unlockSharedAudio();
}, { once: true });
