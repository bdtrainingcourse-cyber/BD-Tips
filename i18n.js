/**
 * ==================================================================
 * B2B BD TIPS PORTAL - GLOBAL I18N ENGINE (BILINGUAL VI / EN)
 * Seamless instant translation engine for all 10 tools, navbar & AI
 * ==================================================================
 */

(function() {
    // Environment safe check
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    const storage = isBrowser && typeof localStorage !== 'undefined' ? localStorage : {
        getItem: () => 'vi',
        setItem: () => {}
    };

    // 1. Comprehensive Bilingual Dictionary
    const DICTIONARY = {
        vi: {
            // Navbar & Common
            "nav.logo_sub": "Để bạn không đơn độc trên hành trình BD",
            "nav.home": "Trang Chủ",
            "nav.library": "Thư Viện",
            "nav.quests": "Nhiệm Vụ",
            "nav.b2b_tools": "Công Cụ B2B ▾",
            "nav.tool_personality": "Trắc Nghiệm Tính Cách BD",
            "nav.tool_email": "Trợ Lý Email B2B (AI)",
            "nav.tool_kpi": "Ma Trận Phễu KPI B2B",
            "nav.tool_salary": "Tính Lương Gross - Net",
            "nav.tool_law": "Tra Cứu Luật Lao Động",
            "nav.challenge": "B2B Challenge",
            "nav.community": "Cộng Đồng",
            "nav.login": "🔑 Đăng Nhập",
            "nav.register": "📝 Đăng Ký",
            "nav.logout": "🚪 Đăng Xuất",
            "nav.alumni_vip": "🎯 Cổng Đặc Quyền Alumni VIP (Tìm PIC) →",
            "nav.alumni_sub": "🔒 Đặc quyền dành cho học viên khóa BD",
            "nav.events": "📅 Sự Kiện B2B Các Ngành →",

            // Hero Section (Home)
            "hero.title_pre": "ĐỪNG ĐỂ ",
            "hero.title_highlight": "\"CÁI MIỆNG HẠI CÁI DEAL\"",
            "hero.subtitle": "Mindsets, Skillsets & AI Toolsets Thực Chiến Dành Cho B2B Business Development",

            // BeeDee Mascot Hub
            "beedee.tag": "🦉 Chú cú BeeDee thông thái",
            "beedee.greeting_title": "Xin chào bạn!",
            "beedee.greeting_text": "Tôi là BeeDee – trợ lý AI của BD Bình Dân Học Vụ. Hãy hỏi tôi về tính lương Gross-Net, luật thử việc, cách viết email outreach, hoặc làm bài test tính cách BD nhé!",
            "beedee.btn_chat": "💬 Chat nhanh với BeeDee",
            "beedee.btn_quests": "🎯 Nhiệm vụ nhận quà",

            // Ecosystem Showcase
            "ecosystem.title": "Hệ Sinh Thái BD Bình Dân Học Vụ",
            "ecosystem.cat_intro": "Bộ 9 Công cụ AI, Tra cứu Pháp lý, Thư viện Tri thức & Cộng đồng Thực chiến dành riêng cho B2B Business Development.",
            "ecosystem.cta_access": "Truy cập ngay →",

            // 9 Planets (Ecosystem)
            "planet.1.label": "Test Tính Cách",
            "planet.1.title": "Test Tính Cách B2B",
            "planet.1.desc": "Trắc nghiệm khám phá nhóm tính cách bán hàng của bạn (Thợ Săn, Nông Dân, Kiến Trúc Sư, Chỉ Huy) và nhận chiến thuật tương ứng.",
            "planet.2.label": "AI Email",
            "planet.2.title": "AI Email Assistant",
            "planet.2.desc": "Tự động hóa soạn thảo cold email tiếp cận khách hàng & email đàm phán chốt deal dựa trên vị thế thế mạnh.",
            "planet.3.label": "Challenge Game",
            "planet.3.title": "B2B Challenge Minigame",
            "planet.3.desc": "Tham gia Minigame thử thách giải quyết tình huống đàm phán, xử lý từ chối & đăng danh Bảng Vàng BD.",
            "planet.4.label": "Luật Lao Động",
            "planet.4.title": "Cổng Tra Cứu Luật Lao Động",
            "planet.4.desc": "Tra cứu nhanh các quy định pháp lý, chế độ BHXH, thai sản, thôi việc và phân tích tình huống lao động 2026.",
            "planet.5.label": "Lương Gross-Net",
            "planet.5.title": "Tính Lương Gross ↔ Net",
            "planet.5.desc": "Quy đổi lương Gross/Net chính xác theo biểu thuế mới năm 2026, tích hợp bảng tra cứu thù lao ngành B2B.",
            "planet.6.label": "Thư Viện BD",
            "planet.6.title": "Thư Viện Ebook & Thuật Ngữ BD",
            "planet.6.desc": "Tổng hợp 100+ thuật ngữ BD/Sales có công thức tính, Ebook độc quyền & bài viết chuyên môn từ Peter Vo.",
            "planet.7.label": "KPI & Phễu",
            "planet.7.title": "Ước Tính KPI & Phễu Ngược",
            "planet.7.desc": "Ước tính nhanh chỉ số phễu hoạt động ngược từ mục tiêu doanh thu, hỗ trợ cả luồng Outbound & Inbound.",
            "planet.8.label": "Cộng Đồng B2B",
            "planet.8.title": "Cộng Đồng BD Việt Nam",
            "planet.8.desc": "Diễn đàn thảo luận nghiệp vụ, kết nối sếp mua hàng (PIC) & chia sẻ những câu chuyện bán hàng thực chiến.",
            "planet.9.label": "Sự Kiện B2B",
            "planet.9.title": "Sự Kiện B2B Các Ngành",
            "planet.9.desc": "Cập nhật lịch trình hội thảo B2B, triển lãm giao thương quốc tế và sự kiện networking kết nối doanh nghiệp mới nhất 2026.",

            // Challenge Section
            "challenge.title": "B2B CHALLENGE",
            "challenge.selector_desc": "Chọn cấp độ kinh nghiệm BD của bạn để tham gia thử thách phù hợp:",
            "challenge.lvl_1": "Dưới 1 Năm (Tân Binh)",
            "challenge.lvl_2": "1 - 3 Năm (Chiến Binh)",
            "challenge.lvl_3": "Trên 3 Năm (Chuyên Gia)",
            "challenge.btn_start": "Bắt Đầu Chơi",
            "challenge.btn_back": "← Quay lại chọn game khác",

            // Footer
            "footer.about_title": "Về Peter Võ (Võ Phước Tân)",
            "footer.about_desc": "Chuyên gia đào tạo Business Development B2B thực chiến. Người sáng lập BD Bình Dân Học Vụ và hệ sinh thái công cụ hỗ trợ người làm nghề phát triển kinh doanh bền vững.",
            "footer.contact_title": "Kết Nối Trực Tiếp",
            "footer.phone": "📞 Hotline / Zalo: 0931.100.569",
            "footer.email": "✉️ Email: bdtraining@bdbinhdanhocvu.com",
            "footer.copyright": "© 2026 BD Bình Dân Học Vụ - Founder Peter Võ. All rights reserved.",

            // Tool 1: Personality Test
            "test.hero_title": "QUẸT THẺ ĐO CHỈ SỐ BD CỦA BẠN 🦉",
            "test.hero_desc": "Khám phá chiến binh bán hàng B2B bên trong bạn qua game quẹt thẻ tình huống thực chiến",
            "test.swipe_right": "👉 Quẹt Phải: Đồng ý",
            "test.swipe_left": "👈 Quẹt Trái: Không phù hợp",
            "test.btn_start": "Bắt Đầu Làm Test",
            "test.btn_print": "In / Lưu File PDF 📥",
            "test.cert_sign": "Giám khảo thẩm định: Cú Thông Thái BeeDee",

            // Tool 2: Salary
            "salary.h1": "TÍNH LƯƠNG GROSS ↔ NET",
            "salary.subtitle": "Công cụ quy đổi lương và phân tích chi tiết bảo hiểm, thuế TNCN theo cập nhật Luật Lao Động mới nhất",
            "salary.box_title": "🧮 Trình Quy Đổi Lương",
            "salary.lbl_gross": "Lương Gross (VNĐ)",
            "salary.lbl_net": "Lương Net (VNĐ)",
            "salary.lbl_dependents": "Số người phụ thuộc",
            "salary.lbl_region": "Vùng lương tối thiểu",
            "salary.btn_gross_to_net": "Quy Đổi Gross → Net",
            "salary.btn_net_to_gross": "Quy Đổi Net → Gross",

            // Tool 3: Labor Law
            "law.h1": "BẢN ĐỒ LUẬT LAO ĐỘNG",
            "law.subtitle": "Tra cứu nhanh quy định pháp lý & Tình huống tranh chấp lao động thực tế dành cho B2B Employee",
            "law.search_placeholder": "Nhập từ khóa tra cứu (thử việc, nghỉ việc, trợ cấp...)...",
            "law.section_title": "📌 Quy Định Pháp Lý Hiện Hành",

            // Tool 4: KPI
            "kpi.h1": "📊 BỘ CÔNG CỤ ƯỚC TÍNH KPI BD",
            "kpi.subtitle": "Mô hình tính toán phễu ngược Inbound & Outbound từ mục tiêu doanh thu",
            "kpi.lbl_revenue": "Mục Tiêu Doanh Số (VNĐ)",
            "kpi.lbl_deal_size": "Quy Mô Hợp Đồng Trung Bình (ACV)",
            "kpi.lbl_win_rate": "Tỷ Lệ Chốt Thành Công (%)",
            "kpi.btn_calculate": "Tính Toán Phễu KPI Ngay",

            // Tool 5: Email Assistant
            "email.h1": "B2B Email Assistant",
            "email.subtitle": "Trợ lý AI phân tích, chấm điểm và tối ưu email tiếp cận khách hàng doanh nghiệp",
            "email.btn_audit": "Phân tích Email",
            "email.btn_rewrite": "Viết lại Email Chuẩn 5 Pha",

            // Tool 6: Library
            "library.h1": "THƯ VIỆN B2B BD",
            "library.subtitle": "Tổng hợp bài viết chuyên môn, newsletter và cẩm nang thực chiến chốt deal doanh nghiệp",
            "library.search_placeholder": "Tìm kiếm bài viết, thuật ngữ hoặc chủ đề...",
            "library.tab_all": "Tất cả",
            "library.tab_ebooks": "Ebook độc quyền",
            "library.tab_terms": "Thuật ngữ B2B",
            "library.tab_saas": "Tài chính SaaS",

            // Tool 7: Quests
            "quests.h1": "NHIỆM VỤ & QUÀ TẶNG",
            "quests.subtitle": "Rèn luyện kỹ năng BD mỗi ngày, tích lũy BD-Points để mở khóa phần thưởng thực chiến độc quyền!",
            "quests.m1_title": "Mốc 1: 01 Ly Trà Sữa Size L",
            "quests.m2_title": "Mốc 2: 30 Phút Online 1-1 Với Peter Võ",
            "quests.m3_title": "Mốc 3: Buổi Lunch VIP 1-1 Cùng Peter Võ",

            // Tool 8: Finder
            "finder.h1": "CỔNG ĐẶC QUYỀN ALUMNI VIP",
            "finder.subtitle": "Hỗ trợ tìm kiếm & xác thực Person-in-Charge (PIC) độc quyền dành riêng cho học viên Khóa BD Thực Chiến cùng anh Peter Võ",
            "finder.passcode_prompt": "Nhập Mã Passcode VIP (ví dụ: BD-1272) để mở khóa cổng:",
            "finder.btn_unlock": "Mở Khóa Cổng VIP",

            // Tool 9: Community
            "community.h1": "🤝 CỘNG ĐỒNG B2B BD VIỆT NAM",
            "community.subtitle": "Diễn đàn chia sẻ kinh nghiệm, gỡ deal khó và kết nối mạng lưới người làm nghề B2B toàn quốc",

            // Slides
            "slides.ratio_linkedin": "LinkedIn (4:5)",
            "slides.ratio_tiktok": "TikTok (9:16)",
            "slides.ratio_desktop": "Ngang (16:9)",
            "slides.btn_autoplay": "▶ Tự động"
        },
        en: {
            // Navbar & Common
            "nav.logo_sub": "Never walk alone on your BD journey",
            "nav.home": "Home",
            "nav.library": "Library",
            "nav.quests": "Quests",
            "nav.b2b_tools": "B2B Tools ▾",
            "nav.tool_personality": "BD Personality Test",
            "nav.tool_email": "B2B Email Assistant (AI)",
            "nav.tool_kpi": "B2B KPI Funnel Matrix",
            "nav.tool_salary": "Gross - Net Salary Calculator",
            "nav.tool_law": "Labor Law Reference",
            "nav.challenge": "B2B Challenge",
            "nav.community": "Community",
            "nav.login": "🔑 Login",
            "nav.register": "📝 Register",
            "nav.logout": "🚪 Logout",
            "nav.alumni_vip": "🎯 Alumni VIP Portal (Find PIC) →",
            "nav.alumni_sub": "🔒 Exclusive for BD Course Alumni",
            "nav.events": "📅 Industry B2B Events →",

            // Hero Section (Home)
            "hero.title_pre": "DON'T LET ",
            "hero.title_highlight": "\"YOUR WORDS KILL THE DEAL\"",
            "hero.subtitle": "Battle-Tested Mindsets, Skillsets & AI Toolsets for B2B Business Development",

            // BeeDee Mascot Hub
            "beedee.tag": "🦉 BeeDee The Wise Owl",
            "beedee.greeting_title": "Hello there!",
            "beedee.greeting_text": "I am BeeDee – your smart AI assistant at BD Binh Dan Hoc Vu. Ask me about Gross-Net salary calculations, probation regulations, cold outreach emails, or taking the BD Personality Test!",
            "beedee.btn_chat": "💬 Chat with BeeDee",
            "beedee.btn_quests": "🎯 Earn Rewards",

            // Ecosystem Showcase
            "ecosystem.title": "The BD Binh Dan Hoc Vu Ecosystem",
            "ecosystem.cat_intro": "The 9 Tactical AI Tools, Legal Hub, Knowledge Library & Field Community tailored for B2B Business Development.",
            "ecosystem.cta_access": "Access Tool →",

            // 9 Planets (Ecosystem)
            "planet.1.label": "Personality Test",
            "planet.1.title": "B2B Personality Test",
            "planet.1.desc": "Discover your B2B sales archetype (Hunter, Farmer, Architect, Commander) and tailored tactics.",
            "planet.2.label": "AI Email",
            "planet.2.title": "B2B AI Email Assistant",
            "planet.2.desc": "Automate outbound prospecting & closing emails based on strategic leverage and value propositions.",
            "planet.3.label": "B2B Challenge",
            "planet.3.title": "B2B Challenge Minigame",
            "planet.3.desc": "Interactive situational negotiation & objection handling challenge to earn your spot on the Leaderboard.",
            "planet.4.label": "Labor Law",
            "planet.4.title": "Vietnam Labor Law Portal",
            "planet.4.desc": "Quick legal reference, insurance regulations, severance pay and 2026 dispute case studies.",
            "planet.5.label": "Gross-Net Salary",
            "planet.5.title": "Gross ↔ Net Salary Calculator",
            "planet.5.desc": "Accurate Gross/Net conversion according to latest 2026 progressive tax brackets and B2B compensation scales.",
            "planet.6.label": "BD Library",
            "planet.6.title": "Ebook Library & B2B Glossary",
            "planet.6.desc": "100+ B2B terms with formulas, exclusive ebooks & professional articles written by Peter Vo.",
            "planet.7.label": "KPI & Funnel",
            "planet.7.title": "KPI & Reverse Funnel Estimation",
            "planet.7.desc": "Reverse-engineer operational funnel metrics from targeted revenue for Inbound & Outbound pipelines.",
            "planet.8.label": "B2B Community",
            "planet.8.title": "Vietnam B2B Community",
            "planet.8.desc": "Professional forum, procurement PIC networking & real-world high-stakes enterprise sales stories.",
            "planet.9.label": "B2B Events",
            "planet.9.title": "Industry B2B Events",
            "planet.9.desc": "Stay updated with B2B seminars, international trade exhibitions & networking events for 2026.",

            // Challenge Section
            "challenge.title": "B2B CHALLENGE",
            "challenge.selector_desc": "Select your BD experience level to join the appropriate challenge:",
            "challenge.lvl_1": "< 1 Year (Rookie)",
            "challenge.lvl_2": "1 - 3 Years (Warrior)",
            "challenge.lvl_3": "> 3 Years (Expert)",
            "challenge.btn_start": "Start Challenge",
            "challenge.btn_back": "← Back to select challenge",

            // Footer
            "footer.about_title": "About Peter Vo (Vo Phuoc Tan)",
            "footer.about_desc": "Veteran B2B Business Development strategist & mentor. Founder of BD Binh Dan Hoc Vu and an integrated ecosystem empowering sustainable sales careers.",
            "footer.contact_title": "Direct Contact",
            "footer.phone": "📞 Hotline / WhatsApp / Zalo: 0931.100.569",
            "footer.email": "✉️ Email: bdtraining@bdbinhdanhocvu.com",
            "footer.copyright": "© 2026 BD Binh Dan Hoc Vu - Founder Peter Vo. All rights reserved.",

            // Tool 1: Personality Test
            "test.hero_title": "SWIPE TO TEST YOUR BD SALES ARCHETYPE 🦉",
            "test.hero_desc": "Discover the sales warrior within you through an interactive situational swipe card game",
            "test.swipe_right": "👉 Swipe Right: Agree",
            "test.swipe_left": "👈 Swipe Left: Disagree",
            "test.btn_start": "Start Test Now",
            "test.btn_print": "Print / Save PDF 📥",
            "test.cert_sign": "Certified by: BeeDee The Wise Owl",

            // Tool 2: Salary
            "salary.h1": "GROSS ↔ NET SALARY CALCULATOR",
            "salary.subtitle": "Salary conversion and detailed breakdown of statutory insurances & Personal Income Tax under latest 2026 regulations",
            "salary.box_title": "🧮 Salary Converter",
            "salary.lbl_gross": "Gross Salary (VND)",
            "salary.lbl_net": "Net Salary (VND)",
            "salary.lbl_dependents": "Number of Dependents",
            "salary.lbl_region": "Minimum Wage Region",
            "salary.btn_gross_to_net": "Convert Gross → Net",
            "salary.btn_net_to_gross": "Convert Net → Gross",

            // Tool 3: Labor Law
            "law.h1": "VIETNAM LABOR LAW MAP",
            "law.subtitle": "Quick legal regulations & real-world labor dispute case studies for B2B professionals",
            "law.search_placeholder": "Search legal topics (probation, termination, severance pay...)...",
            "law.section_title": "📌 Current Legal Framework",

            // Tool 4: KPI
            "kpi.h1": "📊 B2B KPI & REVENUE FUNNEL ESTIMATOR",
            "kpi.subtitle": "Reverse-engineering inbound & outbound sales pipelines from targeted revenue",
            "kpi.lbl_revenue": "Revenue Target (VND)",
            "kpi.lbl_deal_size": "Average Deal Size (ACV)",
            "kpi.lbl_win_rate": "Proposal Win Rate (%)",
            "kpi.btn_calculate": "Calculate Funnel Now",

            // Tool 5: Email Assistant
            "email.h1": "B2B Email Assistant",
            "email.subtitle": "AI Assistant to audit, score, and optimize high-converting B2B cold outreach emails",
            "email.btn_audit": "Audit Email",
            "email.btn_rewrite": "Rewrite with 5-Phase Framework",

            // Tool 6: Library
            "library.h1": "B2B BD LIBRARY",
            "library.subtitle": "Curated expert articles, newsletters, and battle-tested enterprise closing handbooks",
            "library.search_placeholder": "Search articles, terms, or topics...",
            "library.tab_all": "All",
            "library.tab_ebooks": "Exclusive Ebooks",
            "library.tab_terms": "B2B Glossary",
            "library.tab_saas": "SaaS Financials",

            // Tool 7: Quests
            "quests.h1": "QUESTS & REWARDS",
            "quests.subtitle": "Sharpen your BD skills daily, earn BD-Points, and unlock exclusive real-world rewards!",
            "quests.m1_title": "Tier 1: 01 Size L Milk Tea",
            "quests.m2_title": "Tier 2: 30-Minute 1-on-1 Online Strategy with Peter Vo",
            "quests.m3_title": "Tier 3: Executive VIP Lunch 1-on-1 with Peter Vo",

            // Tool 8: Finder
            "finder.h1": "EXCLUSIVE ALUMNI VIP PORTAL",
            "finder.subtitle": "Search and verify enterprise Person-in-Charge (PIC) contacts, exclusive for Peter Vo's BD Masterclass Alumni",
            "finder.passcode_prompt": "Enter VIP Passcode (e.g., BD-1272) to unlock the portal:",
            "finder.btn_unlock": "Unlock VIP Portal",

            // Tool 9: Community
            "community.h1": "🤝 VIETNAM B2B BD COMMUNITY",
            "community.subtitle": "Forum for sharing battle-tested tactics, unsticking tough deals, and networking with BD professionals nationwide",

            // Slides
            "slides.ratio_linkedin": "LinkedIn (4:5)",
            "slides.ratio_tiktok": "TikTok (9:16)",
            "slides.ratio_desktop": "Desktop (16:9)",
            "slides.btn_autoplay": "▶ Auto Play"
        }
    };

    // 2. State & Engine
    let currentLang = storage.getItem('bd_lang') || 'vi';

    function getTranslation(key, lang = currentLang) {
        if (DICTIONARY[lang] && DICTIONARY[lang][key]) return DICTIONARY[lang][key];
        if (DICTIONARY['vi'] && DICTIONARY['vi'][key]) return DICTIONARY['vi'][key];
        return key;
    }

    function applyLanguage(lang) {
        if (!isBrowser) return;
        currentLang = lang;
        storage.setItem('bd_lang', lang);
        document.documentElement.setAttribute('lang', lang);

        // 1. Elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = getTranslation(key, lang);
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = translation;
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        // 2. Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = getTranslation(key, lang);
            if (translation) el.setAttribute('placeholder', translation);
        });

        // 3. Dynamic DOM mapping by selectors
        updateDynamicElements(lang);

        // 4. Update Switcher Button
        updateSwitcherButtons(lang);

        // 5. Dispatch Event
        window.dispatchEvent(new CustomEvent('bdLanguageChanged', { detail: { lang } }));
    }

    function updateDynamicElements(lang) {
        // --- 1. Global Navbar ---
        const logoSub = document.querySelector('.logo-sub');
        if (logoSub) logoSub.textContent = getTranslation('nav.logo_sub', lang);

        document.querySelectorAll('.nav-links a').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href.includes('index.html') && !href.includes('#')) {
                a.textContent = getTranslation('nav.home', lang);
            } else if (href.includes('library.html') || href === 'library') {
                a.textContent = getTranslation('nav.library', lang);
            } else if (href.includes('quests.html') || href === 'quests') {
                a.textContent = getTranslation('nav.quests', lang);
            } else if (href.includes('community.html') || href === 'community') {
                a.textContent = getTranslation('nav.community', lang);
            }
        });

        // Dropdown Items
        document.querySelectorAll('.dropdown-content a').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href.includes('personality-test')) a.textContent = getTranslation('nav.tool_personality', lang);
            if (href.includes('email-assistant')) a.textContent = getTranslation('nav.tool_email', lang);
            if (href.includes('kpi-estimation')) a.textContent = getTranslation('nav.tool_kpi', lang);
            if (href.includes('salary')) a.textContent = getTranslation('nav.tool_salary', lang);
            if (href.includes('labor-law')) a.textContent = getTranslation('nav.tool_law', lang);
        });

        const ddToggle = document.querySelector('.dropdown-toggle');
        if (ddToggle) ddToggle.innerHTML = getTranslation('nav.b2b_tools', lang);

        // Login / Register buttons
        const loginBtn = document.getElementById('btn-navbar-login');
        if (loginBtn) loginBtn.textContent = getTranslation('nav.login', lang);
        const regBtn = document.getElementById('btn-navbar-register');
        if (regBtn) regBtn.textContent = getTranslation('nav.register', lang);

        // --- 2. Home Hero Section ---
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && heroTitle.querySelector('.highlight')) {
            heroTitle.innerHTML = `${getTranslation('hero.title_pre', lang)}<span class="highlight">${getTranslation('hero.title_highlight', lang)}</span>`;
        }
        const heroSub = document.querySelector('.hero-subtitle');
        if (heroSub) heroSub.textContent = getTranslation('hero.subtitle', lang);

        // Alumni VIP Button on Hero
        const vipHeroBtn = document.querySelector('.btn-vip-hero');
        if (vipHeroBtn) {
            const mainSpan = vipHeroBtn.querySelector('span:first-child');
            if (mainSpan) mainSpan.innerHTML = getTranslation('nav.alumni_vip', lang);
            const subSpan = vipHeroBtn.querySelector('span:last-child');
            if (subSpan) subSpan.textContent = getTranslation('nav.alumni_sub', lang);
        }

        // BeeDee Welcome Hub
        const beedeeTag = document.querySelector('.beedee-welcome-hub span');
        if (beedeeTag && beedeeTag.textContent.includes('BeeDee')) beedeeTag.textContent = getTranslation('beedee.tag', lang);
        const beedeeTitle = document.getElementById('beedee-greeting-title');
        if (beedeeTitle) beedeeTitle.textContent = getTranslation('beedee.greeting_title', lang);
        const beedeeText = document.getElementById('beedee-greeting-text');
        if (beedeeText && beedeeText.textContent.includes('BeeDee')) beedeeText.textContent = getTranslation('beedee.greeting_text', lang);

        // --- 3. Ecosystem & Galaxy Planets ---
        const ecoSection = document.getElementById('ecosystem-section');
        if (ecoSection) {
            const ecoTitle = ecoSection.querySelector('.section-title');
            if (ecoTitle) {
                ecoTitle.innerHTML = lang === 'en' 
                    ? `The <span class="highlight">BD Binh Dan Hoc Vu</span> Ecosystem` 
                    : `Hệ Sinh Thái <span class="highlight">BD Bình Dân Học Vụ</span>`;
            }
            const catIntro = document.getElementById('ecosystem-cat-intro');
            if (catIntro) catIntro.textContent = getTranslation('ecosystem.cat_intro', lang);

            // Translate 9 planet nodes
            for (let i = 1; i <= 9; i++) {
                const node = ecoSection.querySelector(`.planet-node[data-id="${i}"]`);
                if (node) {
                    const label = node.querySelector('.planet-label');
                    if (label) label.textContent = getTranslation(`planet.${i}.label`, lang);
                    node.setAttribute('data-title', getTranslation(`planet.${i}.title`, lang));
                    node.setAttribute('data-desc', getTranslation(`planet.${i}.desc`, lang));
                }
            }

            const tooltipLink = document.getElementById('tooltip-link');
            if (tooltipLink) tooltipLink.innerHTML = getTranslation('ecosystem.cta_access', lang);
        }

        // --- 4. B2B Challenge Section ---
        const challengeSelector = document.getElementById('game-selector');
        if (challengeSelector) {
            const pDesc = challengeSelector.querySelector('p');
            if (pDesc) pDesc.textContent = getTranslation('challenge.selector_desc', lang);

            const tab1 = challengeSelector.querySelector('.level-tab-btn[data-level="1"]');
            if (tab1) tab1.textContent = getTranslation('challenge.lvl_1', lang);
            const tab2 = challengeSelector.querySelector('.level-tab-btn[data-level="2"]');
            if (tab2) tab2.textContent = getTranslation('challenge.lvl_2', lang);
            const tab3 = challengeSelector.querySelector('.level-tab-btn[data-level="3"]');
            if (tab3) tab3.textContent = getTranslation('challenge.lvl_3', lang);
        }
        const backBtn = document.getElementById('back-to-selector');
        if (backBtn) backBtn.textContent = getTranslation('challenge.btn_back', lang);
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.textContent = getTranslation('challenge.btn_start', lang);

        // --- 5. Tool: Salary ---
        if (window.location.pathname.includes('salary')) {
            const h1 = document.querySelector('.hero-title') || document.querySelector('h1');
            if (h1 && (h1.textContent.includes('GROSS') || h1.textContent.includes('LƯƠNG'))) {
                h1.innerHTML = lang === 'en' 
                    ? `CALCULATE <span class="highlight">GROSS &harr; NET</span> SALARY` 
                    : `TÍNH LƯƠNG <span class="highlight">GROSS &harr; NET</span>`;
            }
            const sub = document.querySelector('.hero-subtitle');
            if (sub) sub.textContent = getTranslation('salary.subtitle', lang);
            const calcH2 = document.querySelector('.card h2') || document.querySelector('.salary-calculator h2');
            if (calcH2 && calcH2.textContent.includes('Quy Đổi')) calcH2.textContent = getTranslation('salary.box_title', lang);
        }

        // --- 6. Tool: Personality Test ---
        if (window.location.pathname.includes('personality-test')) {
            const h1 = document.querySelector('h1');
            if (h1 && (h1.textContent.includes('QUẸT THẺ') || h1.textContent.includes('SWIPE'))) {
                h1.textContent = getTranslation('test.hero_title', lang);
            }
            const printBtn = document.querySelector('.print-btn');
            if (printBtn) printBtn.textContent = getTranslation('test.btn_print', lang);
            const certSign = document.querySelector('.cert-sign-title');
            if (certSign) certSign.textContent = lang === 'en' ? 'Certified by:' : 'Giám khảo thẩm định:';
            const certJudge = document.querySelector('.cert-sign-name');
            if (certJudge) certJudge.textContent = lang === 'en' ? 'BeeDee The Wise Owl' : 'Cú Thông Thái BeeDee';
        }

        // --- 7. Tool: Labor Law ---
        if (window.location.pathname.includes('labor-law')) {
            const h1 = document.querySelector('h1');
            if (h1 && (h1.textContent.includes('LUẬT') || h1.textContent.includes('LAW'))) {
                h1.innerHTML = lang === 'en' 
                    ? `VIETNAM <span class="highlight">LABOR LAW MAP</span>` 
                    : `BẢN ĐỒ <span class="highlight">LUẬT LAO ĐỘNG</span>`;
            }
            const sub = document.querySelector('.hero-subtitle');
            if (sub) sub.textContent = getTranslation('law.subtitle', lang);
            const searchInp = document.getElementById('search-input') || document.querySelector('input[type="search"]');
            if (searchInp) searchInp.setAttribute('placeholder', getTranslation('law.search_placeholder', lang));
        }

        // --- 8. Tool: KPI Estimation ---
        if (window.location.pathname.includes('kpi-estimation')) {
            const h1 = document.querySelector('h1');
            if (h1 && (h1.textContent.includes('KPI') || h1.textContent.includes('CÔNG CỤ'))) {
                h1.innerHTML = getTranslation('kpi.h1', lang);
            }
        }

        // --- 9. Tool: Library ---
        if (window.location.pathname.includes('library')) {
            const h1 = document.querySelector('h1');
            if (h1 && (h1.textContent.includes('THƯ VIỆN') || h1.textContent.includes('LIBRARY'))) {
                h1.innerHTML = lang === 'en' 
                    ? `B2B BD <span class="highlight">LIBRARY</span>` 
                    : `THƯ VIỆN <span class="highlight">B2B BD</span>`;
            }
            const sub = document.querySelector('.hero-subtitle');
            if (sub) sub.textContent = getTranslation('library.subtitle', lang);
            const searchInp = document.getElementById('search-input') || document.querySelector('.search-box input');
            if (searchInp) searchInp.setAttribute('placeholder', getTranslation('library.search_placeholder', lang));
        }

        // --- 10. Tool: Quests ---
        if (window.location.pathname.includes('quests')) {
            const h1 = document.querySelector('h1');
            if (h1 && (h1.textContent.includes('NHIỆM VỤ') || h1.textContent.includes('QUESTS'))) {
                h1.innerHTML = getTranslation('quests.h1', lang);
            }
            const sub = document.querySelector('.hero-subtitle');
            if (sub) sub.textContent = getTranslation('quests.subtitle', lang);
        }

        // --- 11. Tool: Finder ---
        if (window.location.pathname.includes('finder')) {
            const h1 = document.querySelector('h1');
            if (h1 && (h1.textContent.includes('ALUMNI') || h1.textContent.includes('CỔNG'))) {
                h1.innerHTML = lang === 'en' 
                    ? `EXCLUSIVE <span class="highlight">ALUMNI VIP PORTAL</span>` 
                    : `CỔNG ĐẶC QUYỀN <span class="highlight">ALUMNI VIP</span>`;
            }
            const sub = document.querySelector('.hero-subtitle');
            if (sub) sub.textContent = getTranslation('finder.subtitle', lang);
        }

        // --- 12. Tool: Community ---
        if (window.location.pathname.includes('community')) {
            const h1 = document.querySelector('h1');
            if (h1 && (h1.textContent.includes('CỘNG ĐỒNG') || h1.textContent.includes('COMMUNITY'))) {
                h1.innerHTML = getTranslation('community.h1', lang);
            }
        }

        // --- 13. Global Footer on all pages ---
        const footerAboutTitle = document.querySelector('.footer-about h3');
        if (footerAboutTitle) footerAboutTitle.textContent = getTranslation('footer.about_title', lang);
        const footerAboutDesc = document.querySelector('.footer-about p');
        if (footerAboutDesc) footerAboutDesc.textContent = getTranslation('footer.about_desc', lang);
        const footerContactTitle = document.querySelector('.footer-contact h3');
        if (footerContactTitle) footerContactTitle.textContent = getTranslation('footer.contact_title', lang);
        
        const footerLinks = document.querySelectorAll('.footer-contact p');
        if (footerLinks.length >= 2) {
            footerLinks[0].textContent = getTranslation('footer.phone', lang);
            footerLinks[1].textContent = getTranslation('footer.email', lang);
        }
        const copyright = document.querySelector('.footer-bottom p') || document.querySelector('.footer-copyright');
        if (copyright) copyright.textContent = getTranslation('footer.copyright', lang);
    }

    function updateSwitcherButtons(lang) {
        if (!isBrowser) return;
        document.querySelectorAll('.bd-lang-toggle-btn').forEach(btn => {
            if (lang === 'vi') {
                btn.innerHTML = '🌐 EN';
                btn.setAttribute('title', 'Switch to English');
            } else {
                btn.innerHTML = '🇻🇳 VI';
                btn.setAttribute('title', 'Chuyển sang Tiếng Việt');
            }
        });
    }

    function toggleLanguage() {
        applyLanguage(currentLang === 'vi' ? 'en' : 'vi');
    }

    function injectLanguageSwitcher() {
        if (!isBrowser || document.getElementById('bd-lang-toggle')) return;

        const themeToggle = document.getElementById('theme-toggle');
        const targetContainer = themeToggle ? themeToggle.parentNode : document.querySelector('.nav-links');

        if (targetContainer) {
            const btn = document.createElement('button');
            btn.id = 'bd-lang-toggle';
            btn.className = 'bd-lang-toggle-btn';
            btn.style.cssText = `
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: var(--text-main, #1e293b);
                font-size: 0.82rem;
                font-weight: 800;
                padding: 5px 12px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 8px;
                margin-right: 4px;
            `;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleLanguage();
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.22)';
                btn.style.transform = 'translateY(-1px)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.1)';
                btn.style.transform = 'translateY(0)';
            });

            if (themeToggle) {
                targetContainer.insertBefore(btn, themeToggle.nextSibling);
            } else {
                targetContainer.appendChild(btn);
            }

            updateSwitcherButtons(currentLang);
        }
    }

    function init() {
        if (!isBrowser) return;
        injectLanguageSwitcher();
        applyLanguage(currentLang);
    }

    if (isBrowser) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    if (typeof window !== 'undefined') {
        window.BDI18n = {
            getLang: () => currentLang,
            setLang: applyLanguage,
            toggle: toggleLanguage,
            t: getTranslation
        };
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { DICTIONARY, getTranslation };
    }
})();
