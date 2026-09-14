/**
 * ==================================================================
 * B2B BD TIPS PORTAL - GLOBAL I18N ENGINE (BILINGUAL VI / EN)
 * High-performance Bidirectional DOM TreeWalker & Dynamic MutationObserver
 * Covers Navbar, 10 Tools, Dynamic Scripts, Modals, Forms & AI Assistant
 * ==================================================================
 */

(function() {
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    const storage = isBrowser && typeof localStorage !== 'undefined' ? localStorage : {
        getItem: () => 'vi',
        setItem: () => {}
    };

    let currentLang = storage.getItem('bd_lang') || 'vi';
    let isTranslating = false;

    // 1. Comprehensive Exact Translation Map (880+ Phrases)
    const EXACT_MAP = {
        "Lead &rarr; Approaching (Tiếp cận)": "Lead → Approaching",
        "Approaching &rarr; Qualified (Quan tâm)": "Approaching → Qualified",
        "Qualified &rarr; Proposal (Báo giá)": "Qualified → Proposal",
        "Proposal &rarr; Convert (Đàm phán)": "Proposal → Negotiation",
        "Convert &rarr; Close Win (Hợp đồng)": "Negotiation → Close Win",
        "SQL &rarr; Close Win (Hợp đồng)": "SQL → Close Win",
        "&copy; 2026 B2B BD Portal. Đào tạo Business Development thực chiến hàng đầu.": "© 2026 B2B BD Portal. Premier Battle-Tested Business Development Training.",
        "© 2026 B2B BD Portal. Đào tạo Business Development thực chiến hàng đầu.": "© 2026 B2B BD Portal. Premier Battle-Tested Business Development Training.",
        "Nhận Template Ngay &rarr;": "Get Template Now →",
        "&larr; Quay lại danh sách thảo luận": "← Back to discussions",
        "• Đăng bài": "• Post",
        "kèm treo thưởng tối thiểu từ": "with a minimum bounty of",
        "để được cộng đồng hỗ trợ nhanh nhất.": "for the fastest community support.",
        "• Nhấp vào tên thành viên có icon": "• Click on member names with an icon",
        "để chat trực tiếp bảo mật!": "to chat directly & securely!",
    "Bình Dân Học Vụ": "BD Binh Dan Hoc Vu",
    "BD Bình Dân Học Vụ": "BD Binh Dan Hoc Vu",
    "Để bạn không đơn độc trên hành trình BD": "Never walk alone on your BD journey",
    "Trang Chủ": "Home",
    "Thư Viện": "Library",
    "Nhiệm Vụ": "Quests",
    "Cộng Đồng": "Community",
    "Bộ Công Cụ BD ▾": "B2B Tools ▾",
    "Bộ Công Cụ BD": "B2B Tools",
    "Công Cụ B2B ▾": "B2B Tools ▾",
    "Test Tính Cách B2B": "B2B Personality Test",
    "Trắc Nghiệm Tính Cách BD": "BD Personality Test",
    "Ma Trận KPI BD": "B2B KPI Funnel Matrix",
    "Ma Trận Phễu KPI B2B": "B2B KPI Funnel Matrix",
    "Tính Lương Gross - Net": "Gross - Net Salary Calculator",
    "Tra Cứu Luật Lao Động": "Labor Law Reference",
    "B2B Challenge": "B2B Challenge",
    "🔑 Đăng Nhập": "🔑 Login",
    "📝 Đăng Ký": "📝 Register",
    "🚪 Đăng Xuất": "🚪 Logout",
    "🎯 Cổng Đặc Quyền Alumni VIP (Tìm PIC) →": "🎯 Alumni VIP Portal (Find PIC) →",
    "🔒 Đặc quyền dành cho học viên khóa BD": "🔒 Exclusive for BD Course Alumni",
    "📅 Sự Kiện B2B Các Ngành →": "📅 Industry B2B Events →",
    "Thông báo": "Notifications",
    "Đã đọc tất cả": "Mark all read",
    "Không có thông báo mới.": "No new notifications.",
    "Đóng Lại": "Close",
    "Hủy bỏ": "Cancel",
    "Lưu thay đổi": "Save Changes",
    "Về Peter Võ (Võ Phước Tân)": "About Peter Vo (Vo Phuoc Tan)",
    "Chuyên gia đào tạo Business Development B2B thực chiến. Người sáng lập BD Bình Dân Học Vụ và hệ sinh thái công cụ hỗ trợ người làm nghề phát triển kinh doanh bền vững.": "Veteran B2B Business Development strategist & mentor. Founder of BD Binh Dan Hoc Vu and an integrated ecosystem empowering sustainable sales careers.",
    "Kết Nối Trực Tiếp": "Direct Contact",
    "📞 Hotline / Zalo: 0931.100.569": "📞 Hotline / WhatsApp / Zalo: 0931.100.569",
    "✉️ Email: bdtraining@bdbinhdanhocvu.com": "✉️ Email: bdtraining@bdbinhdanhocvu.com",
    "© 2026 BD Bình Dân Học Vụ - Founder Peter Võ. All rights reserved.": "© 2026 BD Binh Dan Hoc Vu - Founder Peter Vo. All rights reserved.",
    "THÔNG TIN LIÊN HỆ": "CONTACT INFORMATION",
    "Peter Vo (Tân Võ Phước) – BD Bình Dân Học Vụ": "Peter Vo (Vo Phuoc Tan) – BD Binh Dan Hoc Vu",
    "Chuyên gia Tư vấn B2B Business Development & Strategic Partnership": "B2B Business Development & Strategic Partnership Consultant",
    "BD Bình Dân Học Vụ - Nơi Học Hỏi & Kết Nối của BD": "BD Binh Dan Hoc Vu - Learning & Networking Hub for BD",
    "Kết nối LinkedIn với Peter Vo (SĐT/Zalo: 0931100569)": "Connect on LinkedIn with Peter Vo (Hotline/Zalo: 0931100569)",
    "ĐỪNG ĐỂ": "DON'T LET",
    "\"CÁI MIỆNG HẠI CÁI DEAL\"": "\"YOUR WORDS KILL THE DEAL\"",
    "Mindsets, Skillsets & AI Toolsets Thực Chiến Dành Cho B2B Business Development": "Battle-Tested Mindsets, Skillsets & AI Toolsets for B2B Business Development",
    "🦉 Chú cú BeeDee thông thái": "🦉 BeeDee The Wise Owl",
    "Xin chào bạn!": "Hello there!",
    "Tôi là BeeDee – trợ lý AI của BD Bình Dân Học Vụ. Hãy hỏi tôi về tính lương Gross-Net, luật thử việc, cách viết email outreach, hoặc làm bài test tính cách BD nhé!": "I am BeeDee – your smart AI assistant at BD Binh Dan Hoc Vu. Ask me about Gross-Net salary calculations, probation regulations, cold outreach emails, or taking the BD Personality Test!",
    "💬 Chat nhanh với BeeDee": "💬 Chat with BeeDee",
    "🎯 Nhiệm vụ nhận quà": "🎯 Earn Rewards",
    "Hệ Sinh Thái BD Bình Dân Học Vụ": "The BD Binh Dan Hoc Vu Ecosystem",
    "Bộ 9 Công cụ AI, Tra cứu Pháp lý, Thư viện Tri thức & Cộng đồng Thực chiến dành riêng cho B2B Business Development.": "The 9 Tactical AI Tools, Legal Hub, Knowledge Library & Field Community tailored for B2B Business Development.",
    "Truy cập ngay →": "Access Tool →",
    "Test Tính Cách": "Personality Test",
    "AI Email": "AI Email",
    "Challenge Game": "Challenge Game",
    "Luật Lao Động": "Labor Law",
    "Lương Gross-Net": "Gross-Net Salary",
    "Thư Viện BD": "BD Library",
    "KPI & Phễu": "KPI & Funnel",
    "Cộng Đồng B2B": "B2B Community",
    "Sự Kiện B2B": "B2B Events",
    "B2B CHALLENGE": "B2B CHALLENGE",
    "Chọn cấp độ kinh nghiệm BD của bạn để tham gia thử thách phù hợp:": "Select your BD experience level to join the appropriate challenge:",
    "Dưới 1 Năm (Tân Binh)": "< 1 Year (Rookie)",
    "1 - 3 Năm (Chiến Binh)": "1 - 3 Years (Warrior)",
    "Trên 3 Năm (Chuyên Gia)": "> 3 Years (Expert)",
    "Bắt Đầu Chơi": "Start Challenge",
    "← Quay lại chọn game khác": "← Back to select challenge",
    "Chào mừng trở lại, Chiến thần!": "Welcome back, Warrior!",
    "Hôm nay bạn đã hoàn thành thử thách chưa? Cú BeeDee Thông Thái đang ngóng trông bạn.": "Have you completed today's challenge? BeeDee is waiting for you.",
    "Tính Lương Gross - Net Chuẩn Thuế TNCN 2026 | BD Bình Dân Học Vụ": "Gross - Net Salary Calculator 2026 | BD Binh Dan Hoc Vu",
    "TÍNH LƯƠNG": "CALCULATE SALARY",
    "TÍNH LƯƠNG GROSS ↔ NET": "GROSS ↔ NET SALARY CALCULATOR",
    "Công cụ quy đổi lương và phân tích chi tiết bảo hiểm, thuế TNCN theo cập nhật Luật Lao Động mới nhất": "Salary conversion and detailed breakdown of statutory insurances & Personal Income Tax under latest 2026 regulations",
    "🧮 Quy Đổi Gross - Net": "🧮 Gross - Net Calculator",
    "💼 Tra Cứu Mức Lương B2B": "💼 B2B Salary Benchmark",
    "🧮 Trình Quy Đổi Lương": "🧮 Salary Converter",
    "Phương thức quy đổi": "Conversion Method",
    "Thu nhập hàng tháng (VND)": "Monthly Income (VND)",
    "Lương đóng bảo hiểm": "Insurance Salary Base",
    "Trên lương thực tế": "On Actual Salary",
    "Mức khác": "Custom Amount",
    "Mức lương đóng bảo hiểm (VND)": "Insurance Base Salary (VND)",
    "Số người phụ thuộc": "Number of Dependents",
    "Giảm trừ: 6.2M / người": "Deduction: 6.2M / person",
    "Vùng đóng bảo hiểm": "Insurance Wage Region",
    "Vùng I (5.31M)": "Region I (5.31M)",
    "Vùng II (4.73M)": "Region II (4.73M)",
    "Vùng III (4.14M)": "Region III (4.14M)",
    "Vùng IV (3.70M)": "Region IV (3.70M)",
    "Ảnh hưởng trần BHTN": "Affects Unemployment Ins. cap",
    "⚡ Bắt Đầu Quy Đổi": "⚡ Calculate Salary",
    "📊 Biểu Đồ Phân Phối Lương": "📊 Salary Distribution Chart",
    "Thực Nhận": "Net Pay",
    "Thực nhận (Net)": "Net Take-Home",
    "Bảo hiểm bắt buộc": "Mandatory Insurances",
    "Thuế thu nhập (TNCN)": "Personal Income Tax (PIT)",
    "📋 Bảng Phân Tích Chi Tiết (VND)": "📋 Detailed Breakdown Table (VND)",
    "Người Lao Động (NLĐ)": "Employee Breakdown",
    "Người Sử Dụng Lao Động (NSDLĐ)": "Employer Cost",
    "Khoản mục": "Item",
    "Số tiền (VND)": "Amount (VND)",
    "Chi tiết tính toán": "Calculation Details",
    "Lương Gross (Lương tổng)": "Gross Salary (Total)",
    "Mức lương thỏa thuận ban đầu": "Agreed initial contractual salary",
    "Bảo hiểm xã hội (BHXH)": "Social Insurance (BHXH)",
    "8% (Trần đóng tối đa: 50,600,000đ)": "8% (Maximum cap: 50,600,000 VND)",
    "Bảo hiểm y tế (BHYT)": "Health Insurance (BHYT)",
    "1.5% (Trần đóng tối đa: 50,600,000đ)": "1.5% (Maximum cap: 50,600,000 VND)",
    "Bảo hiểm thất nghiệp (BHTN)": "Unemployment Insurance (BHTN)",
    "1% (Trần đóng theo vùng)": "1% (Capped by wage region)",
    "Thu nhập trước thuế (TNTT)": "Income Before Tax",
    "Lương Gross − Tổng bảo hiểm đóng": "Gross Salary − Total Insurances",
    "Giảm trừ gia cảnh bản thân": "Personal Allowance",
    "Định mức cố định theo quy định": "Statutory fixed deduction (15.5M/mo)",
    "Giảm trừ người phụ thuộc": "Dependent Allowance",
    "Thu nhập tính thuế (TNTT)": "Taxable Assessable Income",
    "TNTT − Giảm trừ gia cảnh (nếu âm = 0)": "Assessable Income − Deductions (min 0)",
    "Thuế thu nhập cá nhân (TNCN)": "Personal Income Tax (PIT)",
    "Tính theo lũy tiến từng phần (chi tiết bên dưới)": "Progressive tax brackets (details below)",
    "LƯƠNG THỰC NHẬN (NET)": "NET TAKE-HOME SALARY",
    "Số tiền thực tế nhận về tài khoản": "Actual net amount received in bank",
    "⚡ Chi Tiết Thuế Lũy Tiến Từng Phần": "⚡ Progressive Tax Brackets Detail",
    "Khoản mục chi phí": "Cost Item",
    "Tỷ lệ đóng": "Rate",
    "Ghi chú giải thích": "Explanation Notes",
    "Lương Gross của Nhân viên": "Employee Gross Salary",
    "Lương thỏa thuận trả cho nhân viên": "Agreed contractual salary paid to employee",
    "Trần đóng tối đa: 50,600,000đ": "Maximum cap: 50,600,000 VND",
    "Trần đóng tối đa theo vùng tuyển dụng": "Maximum cap by regional minimum wage",
    "TỔNG CHI PHÍ DOANH NGHIỆP": "TOTAL EMPLOYER COST",
    "Tổng ngân sách doanh nghiệp chi trả cho nhân sự": "Total budget incurred by employer per employee",
    "📖 Diễn giải chi tiết cách tính toán": "📖 Step-by-Step Calculation Explanation",
    "📋 Sao chép": "📋 Copy",
    "🔍 Tra Cứu Mức Lương B2B / BD": "🔍 B2B / BD Compensation Benchmark",
    "Vị trí công việc": "Job Role",
    "Cấp bậc / Kinh nghiệm": "Seniority / Experience",
    "Junior (0 - 2 năm kinh nghiệm)": "Junior (0 - 2 years exp)",
    "Mid-level (2 - 5 năm kinh nghiệm)": "Mid-level (2 - 5 years exp)",
    "Senior / Lead (5+ năm kinh nghiệm)": "Senior / Lead (5+ years exp)",
    "Director / Head of (8+ năm kinh nghiệm)": "Director / Head of (8+ years exp)",
    "Lĩnh vực hoạt động": "Industry Sector",
    "Công nghệ / SaaS / FinTech": "Technology / SaaS / FinTech",
    "Vận tải / Logistics / Supply Chain": "Logistics / Supply Chain",
    "Quảng cáo / Agency / Media": "Advertising / Agency / Media",
    "Dịch vụ Tài chính / Ngân hàng": "Financial Services / Banking",
    "Sản xuất / Công nghiệp": "Manufacturing / Industrial",
    "🔎 Tra Cứu Mức Lương": "🔎 Lookup Salary",
    "📈 Phân Khúc Thu Nhập": "📈 Compensation Quartiles",
    "Trung vị lương cố định": "Base Median Salary",
    "Cơ cấu thu nhập cố định": "Fixed/Variable Pay Structure",
    "Biểu đồ phân phối lương cố định (VND)": "Base Salary Distribution (VND)",
    "T.Nhất": "Min",
    "Trung Vị": "Median",
    "Cao Nhất": "Max",
    "💼 Gói Thu Nhập Chi Tiết & Khuyến Nghị Chỉ Tiêu (OTE)": "💼 Detailed Compensation & OTE Quota Guidance",
    "📊 Đặc thù doanh số & chỉ tiêu (B2B Quota)": "📊 Sales Quota & Target Characteristics",
    "Chỉ tiêu doanh số phổ biến (Quota)": "Typical Sales Quota",
    "Tỷ lệ hoa hồng (Commission Rate)": "Commission Rate",
    "Tỷ lệ cố định / Biến động": "Base / Incentive Ratio",
    "Tổng thu nhập OTE trung bình": "Average OTE Total Income",
    "💡 Khuyến nghị đàm phán thù lao": "💡 Compensation Negotiation Guidance",
    "Vui lòng tra cứu thông tin lương để nhận khuyến nghị đàm phán tương ứng cho vị trí này.": "Lookup compensation benchmarks to receive tailored negotiation advice for this role.",
    "⚡ Đồng bộ sang Gross ↔ Net": "⚡ Sync to Gross ↔ Net Converter",
    "❓ Các câu hỏi thường gặp (FAQs)": "❓ Frequently Asked Questions (FAQs)",
    "Lương Gross là gì?": "What is Gross Salary?",
    "Lương Net là gì?": "What is Net Salary?",
    "Công thức tính lương Gross là gì?": "What is the Gross Salary formula?",
    "Công thức tính lương Net là gì?": "What is the Net Salary formula?",
    "Cách tính lương Gross sang Net?": "How to convert Gross to Net?",
    "Cách quy đổi lương Net sang Gross?": "How to convert Net to Gross?",
    "Lương Net có bao gồm thuế thu nhập cá nhân không?": "Does Net salary include Personal Income Tax?",
    "Nên deal lương Gross hay Net?": "Should I negotiate Gross or Net salary?",
    "Tra Cứu Luật Lao Động 2019 & 15 Case Study BD | BD Bình Dân Học Vụ": "Vietnam Labor Law 2019 & 15 BD Case Studies | BD Binh Dan Hoc Vu",
    "BẢN ĐỒ": "MAP OF",
    "LUẬT LAO ĐỘNG": "VIETNAM LABOR LAW",
    "Tra cứu nhanh quy định pháp lý & Tình huống tranh chấp lao động thực tế dành cho B2B Employee": "Quick legal regulations & real-world labor dispute case studies for B2B professionals",
    "Tất Cả": "All",
    "Thử Việc": "Probation",
    "Nghỉ Phép & Làm Việc": "Leave & Working Hours",
    "Nghỉ Việc & Báo Trước": "Resignation & Notice Period",
    "Bảo Hiểm Xã Hội": "Social Insurance",
    "Trợ Cấp Thôi Việc": "Severance Allowance",
    "Tình Huống Thực Tế": "Case Studies",
    "📌 Quy Định Pháp Lý Hiện Hành": "📌 Current Statutory Regulations",
    "💼 Tình Huống Thực Tế (Case Studies)": "💼 Practical Dispute Case Studies",
    "Qui Định Pháp Lý Hiện Hành": "Current Legal Framework",
    "Điều khoản áp dụng": "Applicable Articles",
    "📖 Tra cứu nguồn luật →": "📖 View Legal Source →",
    "Tên tình huống thực tế": "Case Study Title",
    "Trắc Nghiệm 4 Phong Cách BD Thực Chiến | BD Bình Dân Học Vụ": "4 B2B Sales Archetypes Test | BD Binh Dan Hoc Vu",
    "BD Match • Tính Cách Challenge": "BD Match • Sales Archetype Challenge",
    "QUẸT THẺ ĐO CHỈ SỐ BD CỦA BẠN 🦉": "SWIPE TO TEST YOUR BD SALES ARCHETYPE 🦉",
    "BẮT ĐẦU TRÒ CHƠI QUẸT THẺ": "START THE SWIPE CARD GAME",
    "Đứng trước 12 tình huống lưỡng lự, hóc búa của giới sales B2B, bạn sẽ chọn thế nào? Hãy trả lời chân thật để Cú BeeDee phân tích phong cách chiến đấu của bạn!": "Facing 12 tough B2B sales dilemmas, how will you decide? Answer honestly for BeeDee to unveil your sales warrior archetype!",
    "🚀 Vào Trận Quẹt Thẻ Ngay": "🚀 Start Swiping Now",
    "👈 Quẹt Trái (Không phù hợp)": "👈 Swipe Left (Disagree)",
    "👉 Quẹt Phải (Đồng ý)": "👉 Swipe Right (Agree)",
    "In / Lưu File PDF 📥": "Print / Save PDF 📥",
    "Giám khảo thẩm định:": "Certified by:",
    "Cú Thông Thái BeeDee": "BeeDee The Wise Owl",
    "Ma Trận Phễu KPI & Ước Tính Doanh Số B2B | BD Bình Dân Học Vụ": "B2B KPI Funnel Matrix & Revenue Estimator | BD Binh Dan Hoc Vu",
    "📊 BỘ CÔNG CỤ ƯỚC TÍNH KPI BD": "📊 B2B KPI & REVENUE FUNNEL MATRIX",
    "Nhập mục tiêu doanh thu, hợp đồng trung bình để tự động tính toán ngược phễu hoạt động và số lượng Lead cần thiết.": "Enter revenue targets and average deal sizes to reverse-engineer operational funnels and required leads.",
    "🎯 THIẾT LẬP MỤC TIÊU & TỶ LỆ CHUYỂN ĐỔI (CR)": "🎯 SET TARGETS & CONVERSION RATES (CR)",
    "Doanh Thu Mục Tiêu ($)": "Revenue Target ($)",
    "Giá Trị Hợp Đồng TB ($)": "Average Contract Value ACV ($)",
    "Số lượng Hợp đồng cần chốt (Close Win):": "Required Closed Deals (Close Win):",
    "Tỷ lệ chuyển đổi chặng Outbound:": "Outbound Conversion Funnel Rates:",
    "Lead → Approaching (Tiếp cận)": "Lead → Approaching",
    "Approaching → Qualified (Quan tâm)": "Approaching → Qualified",
    "Qualified → Proposal (Báo giá)": "Qualified → Proposal",
    "Proposal → Convert (Đàm phán)": "Proposal → Negotiation",
    "Convert → Close Win (Hợp đồng)": "Negotiation → Close Win",
    "Tỷ lệ chuyển đổi chặng Inbound:": "Inbound Conversion Funnel Rates:",
    "SQL → Close Win (Hợp đồng)": "SQL → Close Win",
    "📐 PHỄU HOẠT ĐỘNG BD LŨY TIẾN NGƯỢC": "📐 REVERSE PROGRESSIVE BD FUNNEL",
    "📥 Tải Full KPI Tracking & Plan Template (XLSX)": "📥 Download Full KPI Tracking Template (XLSX)",
    "AI Email Assistant - Soạn & Đánh Giá Email B2B | BD Bình Dân Học Vụ": "B2B AI Email Assistant | BD Binh Dan Hoc Vu",
    "Đánh giá hiệu quả cold email và tự động soạn thảo mẫu tiếp cận đối tác đạt tỷ lệ chuyển đổi cao": "Audit outreach cold email power and generate high-converting enterprise email templates",
    "Cấu hình API Key (Gemini)": "Gemini API Key Configuration",
    "🛡️ Đánh Giá Email": "🛡️ Audit Email",
    "✍️ Soạn Email AI": "✍️ AI Email Writer",
    "🔍 Phân Tích & Chấm Điểm Email": "🔍 Email Analysis & Strength Scoring",
    "Nội dung email cần đánh giá *": "Email Content to Audit *",
    "Cấp bậc đối tác (Level)": "Recipient Decision Level",
    "Bộ phận đối tác (Department)": "Recipient Department",
    "Ngành nghề doanh nghiệp": "Industry Vertical",
    "Giọng văn chủ đạo": "Primary Tone of Voice",
    "Chuyên nghiệp, Lịch sự": "Professional & Courteous",
    "Thân thiện, Hợp tác": "Friendly & Collaborative",
    "Mạnh mẽ, Thuyết phục": "Assertive & Persuasive",
    "Ngắn gọn, Trực diện": "Concise & Direct",
    "Trang trọng, Ngoại giao": "Formal & Diplomatic",
    "Ngôn ngữ phân tích": "Analysis Language",
    "Thư Viện Ebook & Thuật Ngữ B2B BD | BD Bình Dân Học Vụ": "B2B BD Ebook Library & Glossary | BD Binh Dan Hoc Vu",
    "THƯ VIỆN": "LIBRARY",
    "Tổng hợp bài viết chuyên môn, newsletter và cẩm nang thực chiến chốt deal doanh nghiệp": "Curated expert articles, newsletters, and battle-tested enterprise closing handbooks",
    "📚 BD B2B Ebook (9 Quyển)": "📚 9 B2B BD Ebooks",
    "📖 Từ Điển Thuật Ngữ BD (B2B Glossary)": "📖 B2B BD Glossary",
    "🔄 Cập Nhật Bài Mới Từ LinkedIn": "🔄 Latest LinkedIn Articles",
    "Tài Liệu Thực Chiến": "Battle-Tested Playbooks",
    "Đăng Ký Nhận Ebook Qua Email": "Subscribe to Receive Ebooks",
    "Nhiệm Vụ & Quà Tặng Tích Lũy BD | BD Bình Dân Học Vụ": "Quests & Reward System | BD Binh Dan Hoc Vu",
    "Gamification Thực Chiến": "Actionable Gamification",
    "NHIỆM VỤ & QUÀ TẶNG": "QUESTS & REWARDS",
    "Rèn luyện kỹ năng BD mỗi ngày, tích lũy BD-Points để mở khóa phần thưởng thực chiến độc quyền!": "Sharpen BD skills daily, accumulate BD-Points, and unlock exclusive real-world rewards!",
    "🎯 NHIỆM VỤ & CHIẾN DỊCH": "🎯 QUESTS & CAMPAIGNS",
    "⭐ ĐẶC QUYỀN ALUMNI VIP": "⭐ ALUMNI VIP PRIVILEGES",
    "🎁 CỬA HÀNG ĐỔI QUÀ": "🎁 REWARDS REDEMPTION STORE",
    "Chiến Binh VIP": "VIP Warrior",
    "🎯 Tìm PIC": "🎯 Find PIC",
    "Kích hoạt Hệ thống Điểm Tích Lũy": "Activate Points Accumulation",
    "Kích Hoạt Ngay": "Activate Now",
    "Số dư tích lũy": "Current Balance",
    "Đổi Mã": "Redeem Code",
    "Cổng Đặc Quyền Alumni VIP (Tìm PIC Doanh Nghiệp) | BD Bình Dân Học Vụ": "Alumni VIP Portal (Find Enterprise PIC) | BD Binh Dan Hoc Vu",
    "B2B PIC FINDER • ĐẶC QUYỀN CAO CẤP": "B2B PIC FINDER • EXCLUSIVE ALUMNI PRIVILEGE",
    "CỔNG ĐẶC QUYỀN": "EXCLUSIVE PORTAL",
    "Hỗ trợ tìm kiếm & xác thực Person-in-Charge (PIC) độc quyền dành riêng cho học viên Khóa BD Thực Chiến cùng anh Peter Võ": "Search and verify enterprise Person-in-Charge (PIC) contacts, exclusive for Peter Vo's BD Masterclass Alumni",
    "⭐ ĐẶC QUYỀN ALUMNI VIP - KHÓA BD THỰC CHIẾN": "⭐ ALUMNI VIP PRIVILEGE - BD MASTERCLASS",
    "Khu Vực Alumni VIP": "Alumni VIP Area",
    "Mật Khẩu VIP Cá Nhân": "Personal VIP Passcode",
    "Email Học Viên": "Student Email",
    "(để đối soát đúng danh sách Học Viên Đã Học)": "(to verify with Enrolled Alumni registry)",
    "🚀 Mở Khóa Đặc Quyền Alumni VIP": "🚀 Unlock Alumni VIP Portal",
    "Cộng Đồng BD B2B Thực Chiến | BD Bình Dân Học Vụ": "Vietnam B2B BD Community | BD Binh Dan Hoc Vu",
    "🤝 CỘNG ĐỒNG B2B BD VIỆT NAM": "🤝 VIETNAM B2B BD COMMUNITY",
    "Nơi đặt câu hỏi, chia sẻ câu chuyện thực chiến, và hỗ trợ kết nối sếp mua hàng (PIC).": "A hub to ask questions, share frontline stories, and facilitate procurement PIC introductions.",
    "📂 Tất cả thảo luận": "📂 All Discussions",
    "🧠 Hỏi đáp nghiệp vụ": "🧠 Tactical Q&A",
    "🔍 Yêu cầu kết nối PIC": "🔍 Request PIC Connection",
    "🧗 Câu chuyện BD": "🧗 Sales War Stories",
    "⚔️ Đấu Trường PvP": "⚔️ PvP Arena",
    "⚙️ Thiết lập Profile": "⚙️ Profile Settings",
    "✏️ Đặt Câu Hỏi / Chia Sẻ": "✏️ New Post / Question",
    "← Quay lại danh sách thảo luận": "← Back to discussions",
    "0 đồng": "0 VND",
    "6.200.000đ × 0 người": "6,200,000 VND × 0 dependents",
    "Lương Gross là tổng số tiền mà người lao động nhận được trước khi trừ các khoản thuế, bảo hiểm, phụ cấp và các chi phí khác. Đây là số tiền thường được đưa ra khi đàm phán về mức lương và được thông báo trong hợp đồng lao động.": "Gross salary is the total compensation an employee earns before mandatory insurances, personal income tax, and other deductions. This is typically the agreed figure negotiated and stated in the official employment contract.",
    "Lương Net là mức lương thực nhận mà người lao động được công ty chuyển khoản vào tài khoản ngân hàng sau khi đã khấu trừ hết bảo hiểm bắt buộc và thuế TNCN.": "Net salary is the actual take-home pay transferred directly to the employee's bank account after deducting all statutory insurances and personal income taxes.",
    "Công thức tính:": "Formula:",
    "Lương Gross = Lương Net + Bảo hiểm bắt buộc (NLĐ đóng) + Thuế TNCN (nếu có)": "Gross Salary = Net Salary + Statutory Insurances (Employee share) + Personal Income Tax (if any)",
    "Lương Net = Lương Gross - Bảo hiểm bắt buộc (NLĐ đóng) - Thuế TNCN (nếu có)": "Net Salary = Gross Salary - Statutory Insurances (Employee share) - Personal Income Tax (if any)",
    "Quy trình tính:": "Calculation Procedure:",
    "Tính các khoản bảo hiểm bắt buộc: BHXH (8%), BHYT (1.5%), BHTN (1%).": "Calculate statutory insurances: Social (8%), Health (1.5%), Unemployment (1%).",
    "Tính Thu nhập trước thuế = Lương Gross - Tổng bảo hiểm.": "Compute Pre-Tax Income = Gross Salary - Total Insurances.",
    "Tính Thu nhập tính thuế = Thu nhập trước thuế - Các khoản giảm trừ gia cảnh (bản thân 15.5M, người phụ thuộc 6.2M/người).": "Compute Assessable Taxable Income = Pre-Tax Income - Deductions (Personal 15.5M, Dependents 6.2M/each).",
    "Tính Thuế TNCN lũy tiến theo biểu thuế 5 bậc mới.": "Apply 5-tier progressive tax rate brackets to assess PIT.",
    "Lương Net = Thu nhập trước thuế - Thuế TNCN.": "Net Salary = Pre-Tax Income - Personal Income Tax.",
    "Sử dụng thuật toán quy đổi ngược để tìm mức Gross tương ứng từ mức Net đích. Khi tính toán xuôi theo các bước khấu trừ của mức Gross này, kết quả nhận được sẽ trùng khớp với số Net ban đầu.": "Utilize reverse-engineering algorithms to derive the exact Gross wage from a target Net take-home. When verified forward, the deducted take-home matches the initial target Net precisely.",
    "Lương Net là phần thực nhận sau thuế, do đó nó đã khấu trừ thuế TNCN. Công ty tuyển dụng có nghĩa vụ khấu trừ tại nguồn và nộp khoản thuế này trực tiếp cho cơ quan thuế thay cho bạn.": "Net salary represents after-tax take-home earnings. Employers are legally obligated to withhold PIT at source and remit it directly to Vietnam tax authorities on your behalf.",
    "Khuyến nghị nên deal lương": "We recommend negotiating",
    ". Lương Gross giúp đảm bảo các quyền lợi bảo hiểm, thai sản, và thất nghiệp được tính đúng trên tổng thu nhập thực tế. Nếu deal Net, hãy yêu cầu ghi rõ điều khoản doanh nghiệp đóng bảo hiểm trên thực tế lương Net để tránh bị đóng bảo hiểm theo mức tối thiểu.": " Gross salary. Gross guarantees statutory social, maternity, and unemployment benefits match your true earnings. If negotiating Net, ensure the contract mandates insurance contributions on true earnings.",
    "\"Thương lượng tổng chi phí (Total Package) luôn hiệu quả hơn việc chỉ nhìn vào lương Net.\"": "\"Negotiating the Total Package is far superior to merely focusing on Net take-home.\"",
    "📞 SĐT / Zalo:": "📞 Phone / WhatsApp / Zalo:",
    "Nhập số tiền...": "Enter amount...",
    "Nhập mức đóng bảo hiểm...": "Enter insurance base salary...",
    "Bối cảnh thực tế:": "Real-World Context:",
    "Nội dung tình huống thực tế xảy ra ở doanh nghiệp...": "Case scenario details occurring in actual business settings...",
    "Hướng giải quyết khuyến nghị:": "Recommended Solution:",
    "Các bước hành động cụ thể...": "Actionable strategic steps...",
    "Đã Hiểu": "Understood",
    "\"Trong lao động, sự hiểu biết về luật pháp là tấm khiên bảo vệ vững chắc nhất cho sự nghiệp của bạn.\"": "\"In the workplace, legal knowledge is the strongest shield protecting your career.\"",
    "Tìm kiếm điều luật, chủ đề (thử việc, nghỉ phép, thôi việc...)...": "Search labor law articles, topics (probation, leave, termination...)...",
    "Phân tích pháp lý lý thuyết...": "Theoretical legal breakdown...",
    "© 2026 B2B BD Portal. Đào tạo Business Development thực chiến hàng đầu.": "© 2026 B2B BD Portal. Premier Battle-Tested Business Development Training.",
    "Tải File Kế Hoạch & KPI Tracking": "Download KPI Tracking & Plan Template",
    "Nhập email của bạn để nhận trực tiếp liên kết tải xuống file Excel KPI & Lộ trình tự động tính toán.": "Enter your work email to receive the direct download link for the automated Excel KPI Model & Roadmap.",
    "Email B2B của bạn *": "Your Work Email *",
    "Nhận Template Ngay →": "Get Template Now →",
    "Hủy": "Cancel",
    "Đăng Ký Thành Công!": "Success!",
    "Template KPI Tracking B2B đã được lập lịch gửi tới hòm thư của bạn. Bấm nút dưới để tải trực tiếp file mẫu.": "B2B KPI Tracking Template is on its way to your inbox. Click below to download immediately.",
    "Tải File Ngay": "Download File Now",
    "Quẹt thẻ sang": "Swipe card to",
    "Phải (Đồng ý)": "Right (Agree)",
    "hoặc": "or",
    "Trái (Không đồng ý)": "Left (Disagree)",
    "để BeeDee kiểm tra tính cách thực chiến của bạn và tặng quà BD-Points nhé!": "for BeeDee to analyze your tactical sales archetype and award bonus BD-Points!",
    "👥 CỘNG ĐỒNG": "👥 COMMUNITY",
    "Kết Nối Đối Tác B2B": "B2B Partner Network",
    "Pitching, kết nối và hợp tác cùng 5,000+ thành viên BD.": "Pitch, network, and collaborate with 5,000+ BD professionals.",
    "Vào thảo luận →": "Join Discussion →",
    "📚 THƯ VIỆN": "📚 LIBRARY",
    "Tải miễn phí Ebook độc quyền, kịch bản mẫu và file KPI.": "Download free exclusive ebooks, outreach scripts, and KPI models.",
    "Tải tài liệu →": "Download Resources →",
    "\"Thấu hiểu bản thân để định vị phong cách - Chìa khóa nâng tầm kỹ năng chốt sale B2B.\"": "\"Know yourself to master your style - The key to elevating high-stakes B2B closing.\"",
    "CHỌN ẢI THÁCH ĐẤU PVP": "SELECT PVP DUEL ARENA",
    "Chọn một minigame dưới đây để chơi lấy điểm cao và tự động tạo link khiêu chiến gửi đối thủ của bạn!": "Choose a challenge minigame below to compete for high scores and generate challenge links for your peers!",
    "Đóng": "Close",
    "Chế độ Ngoại tuyến:": "Offline Heuristics Mode:",
    "Bạn chưa nhập API Key. Hệ thống đang chạy bộ phân tích quy tắc cục bộ (local heuristics). Nhập API Key ở phần Cấu hình để mở khóa AI chấm điểm chi tiết.": "No API Key provided. Running local rule-based analysis. Provide an API Key in Settings to unlock deep Gemini AI scoring.",
    "Tiếng Việt": "Vietnamese",
    "Tiếng Anh": "English",
    "Phân Tích Email Ngay": "Audit Email Now",
    "✨ Soạn Email Tiếp Cận Bằng AI": "✨ Generate Cold Email with AI",
    "Ý tưởng chính hoặc đề xuất cốt lõi của bạn *": "Core Idea or Value Proposition *",
    "Tên doanh nghiệp đối tác tiếp cận": "Target Enterprise Name",
    "Ngôn ngữ soạn thảo": "Drafting Language",
    "Soạn Email AI": "Generate AI Email",
    "📊 Kết Quả Phân Tích & Soạn Thảo": "📊 Audit & Generation Results",
    "Nhập thông tin bên trái và nhấn nút xử lý để nhận kết quả phân tích hoặc mẫu email tự động từ AI.": "Fill in the details on the left and submit to receive instant AI scoring and optimized templates.",
    "BeeDee AI đang xử lý...": "BeeDee AI is processing...",
    "Quá trình này mất khoảng 2-5 giây": "This usually takes 2-5 seconds",
    "Điểm": "Score",
    "Từ khóa Spam": "Spam Triggers",
    "0 từ": "0 words",
    "Thời gian đọc": "Read Time",
    "Gợi ý dòng Tiêu đề (Subject lines):": "Recommended Subject Lines:",
    "Bản email đề xuất tối ưu:": "Optimized Email Recommendation:",
    "Copy bản nháp": "Copy Draft",
    "📚 Cẩm Nang Thực Chiến": "📚 Battle Playbooks",
    "Thư Viện B2B BD": "B2B BD Library",
    "Ebooks, bài viết chuyên sâu của Peter Vo.": "Exclusive Ebooks & in-depth guides by Peter Vo.",
    "Khám Phá →": "Explore →",
    "🤝 Kết Nối Thực Chiến": "🤝 Frontline Network",
    "Cộng Đồng BD Việt Nam": "Vietnam BD Community",
    "Thảo luận ca khó, kết nối sếp mua hàng.": "Troubleshoot tough deals, connect with procurement PICs.",
    "Để sử dụng tính năng chấm điểm và soạn thảo AI tốt nhất, vui lòng cung cấp Gemini API Key cá nhân của bạn. Key được lưu an toàn cục bộ trong trình duyệt của bạn (localStorage) và chỉ gửi tới API Gemini của Google.": "To unlock advanced AI scoring and rewriting, please provide your personal Gemini API Key. It is stored securely in your browser (localStorage) and transmitted only to Google API.",
    "Gemini API Key của bạn": "Your Gemini API Key",
    "Xóa Key hiện có": "Remove Existing Key",
    "Lưu API Key": "Save API Key",
    "Mở Khóa Tính Năng Sao Chép": "Unlock Copy Feature",
    "Nhập email của bạn để sao chép mẫu email này và nhận thêm 10 mẫu outreach B2B chuyển đổi cao gửi trực tiếp vào hòm thư.": "Enter your work email to copy this template and receive 10 high-converting B2B outreach playbooks directly in your inbox.",
    "Mở Khóa Ngay": "Unlock Now",
    "Dán toàn bộ tiêu đề và nội dung email nháp của bạn vào đây...": "Paste your email subject and draft body here...",
    "Ví dụ: Đề xuất giải pháp kiểm thử phần mềm tự động giúp FPT Software giảm 20% chi phí vận hành...": "e.g., Automated testing proposal helping FPT Software reduce operational costs by 20%...",
    "Ví dụ: VNG Corporation, Stripe, Shopee...": "e.g., VNG Corporation, Stripe, Shopee...",
    "Kết nối LinkedIn với Peter Vo": "Connect on LinkedIn with Peter Vo",
    "Nhập email của bạn (ví dụ: name@company.com)": "Enter your email (e.g., name@company.com)",
    "📊 Trắc Nghiệm Tính Cách B2B": "📊 B2B Sales Archetype Test",
    "Khám phá nhóm tính cách bán hàng của bạn (Thợ Săn, Nông Dân, Kiến Trúc Sư, Chỉ Huy) và nhận chiến thuật tương ứng.": "Discover your selling archetype (Hunter, Farmer, Architect, Commander) and unlock tailored tactics.",
    "👥 CỘNG ĐỒNG HOT": "👥 TRENDING COMMUNITY",
    "🤝 Cộng Đồng BD Việt Nam": "🤝 Vietnam BD Community",
    "Giao lưu, chia sẻ bài học thực chiến B2B, săn điểm thưởng Bounty Point và kết nối PIC hiệu quả!": "Network, share field tactics, claim Bounty Points, and connect with verified enterprise PICs!",
    "🔥 BD Challenge: Rèn Phản Xạ": "🔥 BD Challenge: Sharpen Reflexes",
    "Đối đầu trực diện với 3 phong cách đàm phán Purchasing xương xẩu và leo bảng xếp hạng cao thủ.": "Face 3 tough procurement negotiation styles and climb the leaderboard.",
    "Ngôn từ B2B": "B2B Communication",
    "Tiêu Đề Bài Viết": "Article Title",
    "Tác giả:": "Author:",
    "Xem trên LinkedIn": "View on LinkedIn",
    "Tên sách": "Book Title",
    "💡 Ebook sẽ được gửi tự động qua email của bạn kèm link xác thực kích hoạt tài khoản (+15đ ⚡).": "💡 The Ebook will be delivered to your inbox with an account activation link (+15 Points ⚡).",
    "Tên của bạn": "Your Name",
    "Email nhận Ebook": "Email to Receive Ebook",
    "Kinh nghiệm BD/Sales": "BD/Sales Experience",
    "(Không bắt buộc)": "(Optional)",
    "-- Chọn kinh nghiệm (Tùy chọn) --": "-- Select Experience (Optional) --",
    "Dưới 2 năm": "< 2 years",
    "Từ 2 - 4 năm": "2 - 4 years",
    "Trên 4 năm": "> 4 years",
    "📨 Gửi Ebook Đến Email Của Tôi ➔": "📨 Send Ebook to My Email ➔",
    "Đã Đạt Giới Hạn Tải Hôm Nay (1/1 Cuốn)": "Daily Download Limit Reached (1/1)",
    "Mỗi học viên được tải miễn phí": "Each professional gets 1 free download",
    "1 cuốn Ebook/ngày": "1 Ebook / day",
    ". Để mở khóa tải thêm các cuốn Ebook tiếp theo hôm nay, hãy mở rộng trải nghiệm hệ sinh thái B2B BD:": ". To unlock additional downloads today, engage with our ecosystem:",
    "Thử Thách B2B Challenge (+1 Lượt Tải)": "Complete B2B Challenge (+1 Download)",
    "Tham Gia Cộng Đồng BD (+1 Lượt Tải)": "Join BD Community (+1 Download)",
    "Tìm kiếm nhanh cẩm nang Ebook, bài viết chuyên môn B2B...": "Search ebooks, guides, and specialized B2B articles...",
    "Cập nhật bài viết mới nhất từ LinkedIn Newsletter": "Latest articles from LinkedIn Newsletter",
    "Nhập tên của bạn (ví dụ: Peter)": "Enter your name (e.g., Peter)",
    "Nhập email của bạn": "Enter your email",
    "1. Trắc Nghiệm Tính Cách BD": "1. BD Personality Test",
    "Khám phá 4 phong cách bán hàng thực chiến: Thợ Săn, Nông Dân, Kiến Trúc Sư, Chỉ Huy.": "Discover your 4 sales archetypes: Hunter, Farmer, Architect, Commander.",
    "2. Thư Viện Ebook Thực Chiến": "2. Tactical Ebook Library",
    "Tải ngay 9+ Ebook độc quyền của anh Peter Võ về Mindset BD, Social Selling LinkedIn & chốt deal.": "Download 9+ exclusive ebooks by Peter Vo on BD mindset, LinkedIn social selling & closing.",
    "3. AI Trợ Lý Viết Email B2B": "3. B2B AI Email Assistant",
    "Trợ lý ảo soạn email chào hàng, follow-up & kịch bản xử lý từ chối giá thực tế.": "AI assistant to draft cold emails, follow-ups & objection-handling scripts.",
    "4. Ma Trận KPI & Lương OTE": "4. KPI Funnel & OTE Compensation",
    "Dự toán phễu chuyển đổi doanh thu, tra cứu Luật Lao Động 2026 & tính Gross - Net.": "Forecast revenue funnel metrics, lookup 2026 Labor Code & calculate Gross-Net.",
    "Vé Mời VIP Đồng Đội (Mã Giới Thiệu Độc Quyền)": "VIP Peer Invitation Pass (Exclusive Referral Code)",
    "Tặng vé VIP cho đồng nghiệp: Người nhận được ngay": "Gift VIP access to colleagues: Receivers immediately get",
    "Ebook B2B đầu tiên": "their first tactical B2B Ebook",
    ". Bạn nhận": ". You earn",
    "mỗi bạn và tích lũy mở khóa 3 Mốc Thưởng!": "per referral and progress towards 3 Milestones!",
    "Đã Mời Tham Gia": "Peers Invited",
    "/ 15 Bạn": "/ 15 Colleagues",
    "💡 Cơ chế tính điểm & nhận thưởng minh bạch:": "💡 Transparent Points & Rewards Engine:",
    "Đồng nghiệp nhận:": "Colleague receives:",
    "+50 BD-Points ví điểm + Tải miễn phí Ebook B2B đầu tiên.": "+50 BD-Points wallet credit + 1 Free Tactical Ebook download.",
    "Bạn (Alumni VIP) nhận:": "You (Alumni VIP) earn:",
    "+50 BD-Points/bạn + Tự động mở khóa 3 Mốc Thưởng (Mốc 5 bạn: 1 Ly Trà Sữa, Mốc 10 bạn: 30 Phút Online 1-1, Mốc 15 bạn: Buổi Lunch trực tiếp cùng Peter Võ).": "+50 BD-Points/peer + Unlock 3 Reward Milestones (5 peers: Milk Tea, 10 peers: 30-min 1-on-1 Strategy, 15 peers: VIP Lunch with Peter Vo).",
    "+50 BD-Points cho mỗi đồng nghiệp (tối đa +750đ) + Tự động mở khóa quà tặng khi chạm các Mốc 5, 10, 15 bạn.": "+50 BD-Points per colleague (up to +750pts) + unlock rewards at Milestones 5, 10, 15.",
    "+50 BD-Points ví tài khoản + Tải trọn đời Ebook B2B đầu tiên.": "+50 BD-Points account balance + lifetime access to first B2B Ebook.",
    "Link VIP Của Bạn:": "Your Exclusive VIP Link:",
    "Link Tặng Quà Độc Quyền Của Bạn:": "Your Exclusive Gift Link:",
    "Mã VIP:": "VIP Passcode:",
    "💬 Copy Lời Mời Mẫu": "💬 Copy Invitation Message",
    "📋 Sao Chép Link": "📋 Copy Link",
    "🏆 3 MỐC THƯỞNG MILESTONE KHI ĐỒNG ĐỘI THAM GIA": "🏆 3 REWARD MILESTONES WHEN PEERS JOIN",
    "🏆 3 MỐC THƯỞNG VIP ĐỒNG ĐỘI": "🏆 3 VIP PEER REWARD MILESTONES",
    "Tiến độ:": "Progress:",
    "MỐC 1 (5 BẠN)": "TIER 1 (5 PEERS)",
    "🥤 GIẢI NHIỆT": "🥤 REFRESHMENT",
    "Tặng 01 Ly Trà Sữa Size L Mát Lạnh": "01 Size L Cold Milk Tea",
    "Ly Trà Sữa Size L hoặc voucher thương hiệu gửi tặng bạn khi rủ đủ 5 đồng nghiệp BD (kèm +250đ).": "01 Size L Milk Tea or brand voucher gifted upon inviting 5 BD colleagues (+250pts).",
    "MỐC 2 (10 BẠN)": "TIER 2 (10 PEERS)",
    "30 Phút Online 1-1 Với Anh Peter Võ": "30-Min 1-on-1 Online Strategy with Peter Vo",
    "Tư vấn chiến lược 1-1: Thiết kế sales pipeline & gỡ rối deal B2B khó chốt cùng anh Peter (kèm +500đ).": "1-on-1 Strategy Consultation: Pipeline architecture & unsticking complex enterprise deals (+500pts).",
    "MỐC 3 (15 BẠN)": "TIER 3 (15 PEERS)",
    "Buổi Lunch 1-1 Cùng Anh Peter Võ": "Executive VIP Lunch with Peter Vo",
    "Buổi ăn trưa thân mật 1-1: Cố vấn sự nghiệp BD, mở rộng quan hệ cấp cao cùng anh Peter.": "Executive 1-on-1 Lunch: Strategic BD career mentoring and high-level networking.",
    "👉 Kết nối LinkedIn": "👉 Connect on LinkedIn",
    "💬 Vào Cộng Đồng": "💬 Join Community",
    "📖 Vào Thư Viện Ebook": "📖 Open Ebook Library",
    "Mã quà tặng...": "Gift code...",
    "Hạn Mức Tìm PIC": "PIC Search Quota",
    "Lượt / Tháng": "Requests / Month",
    "3 contacts/tháng (3 tháng đầu, tối đa 9 contacts)": "3 contacts/month (first 3 months, up to 9 contacts)",
    "Thời Hạn Áp Dụng": "Eligibility Period",
    "3 Tháng Đầu": "First 3 Months",
    "Tự động làm mới 3 contacts mỗi tháng": "Auto-refreshed with 3 contacts each month",
    "Phạm Vi Hỗ Trợ": "Network Scope",
    "30.000+ Kết nối LinkedIn của anh Peter Võ": "30,000+ LinkedIn Enterprise Connections of Peter Vo",
    "Lưu ý quan trọng:": "Important Notice:",
    "Gửi Yêu Cầu Tìm PIC Cho Anh Peter Võ": "Submit PIC Search Request to Peter Vo",
    "Điền thông tin doanh nghiệp bạn muốn tiếp cận. Anh Peter Võ sẽ trực tiếp rà soát qua network cá nhân và phản hồi thông tin PIC phù hợp trong": "Submit target enterprise details. Peter Vo personally reviews his network and responds within",
    "1. Tên Doanh Nghiệp Mục Tiêu": "1. Target Enterprise Name",
    "2. Bộ Phận Bạn Muốn Tiếp Cận": "2. Target Department",
    "👥 Khối Nhân Sự (HR)": "👥 Human Resources (HR)",
    "📢 Khối Marketing": "📢 Marketing Division",
    "👔 Khối C-Level / Ban Giám Đốc": "👔 C-Level / Executive Board",
    "CEO, COO, Founder, Managing Director, Phó Tổng GĐ": "CEO, COO, Founder, Managing Director, Vice President",
    "💻 Khối Công Nghệ & Kỹ Thuật (IT)": "💻 Technology & Engineering (IT)",
    "3. Chức Danh Cụ Thể & Mục Đích Kết Nối": "3. Specific Job Title & Connection Goal",
    "4. Ghi Chú Thêm / Link Tuyển Dụng": "4. Additional Context / Job Posting Link",
    "(nếu có)": "(if any)",
    "🚀 Gửi Yêu Cầu Tìm PIC Cho Anh Peter Võ": "🚀 Submit PIC Request to Peter Vo",
    "📋 Lịch Sử Yêu Cầu Của Bạn": "📋 Your Request History",
    "0 yêu cầu": "0 requests",
    "Bạn chưa gửi yêu cầu nào. Hãy tận dụng 3 lượt đặc quyền của bạn nhé!": "You haven't submitted any requests yet. Make the most of your 3 monthly VIP quotas!",
    "CỘNG ĐỒNG BD THỰC CHIẾN • PETER VÕ": "B2B PRACTITIONERS COMMUNITY • PETER VO",
    "Chưa Phải Alumni VIP?": "Not an Alumni VIP yet?",
    "Gia Nhập Cộng Đồng Để Săn PIC!": "Join Community to Source PICs!",
    "Kết nối trực tiếp cùng": "Connect directly with",
    "500+ anh em BD thực chiến": "500+ active B2B BD practitioners",
    "trên toàn quốc. Tham gia thảo luận case study, chia sẻ mạng lưới và cùng nhau": "nationwide. Join case studies, share networks, and collaborate to",
    "săn & giới thiệu PIC chất lượng": "source & refer high-quality PIC contacts",
    "từ các buổi networking thực chiến!": "from real-world networking sessions!",
    "Tham Gia Cộng Đồng & Săn PIC Cùng Anh Em →": "Join Community & Source PICs Together →",
    "Mở Khóa Thông Tin Liên Hệ": "Unlock Contact Information",
    "Nhập email của bạn để hiển thị đầy đủ Email và SĐT của tất cả các PIC tìm được.": "Enter your work email to reveal full verified emails and phone numbers for all retrieved PICs.",
    "Nhập Mật khẩu VIP riêng trong email của bạn (VD: BD-xxxx)...": "Enter personal VIP passcode from your email (e.g., BD-xxxx)...",
    "Ví dụ: name@company.com": "e.g., name@company.com",
    "Tự đổi Tên / Funny Nickname của bạn": "Custom Display Name / Nickname",
    "Ví dụ: Shopee, VNG, Momo, FPT Software, Techcombank, Unilever...": "e.g., Shopee, VNG, Momo, FPT Software, Techcombank, Unilever...",
    "Ví dụ: Cần tìm HRD hoặc CTO để đề xuất giải pháp B2B / đào tạo nội bộ cho quý 4...": "e.g., Looking for HRD or CTO to propose Q4 B2B enterprise training solutions...",
    "Dán link bài đăng hoặc bối cảnh deal giúp Peter tìm chính xác hơn...": "Paste job link or deal context to help Peter source precisely...",
    "BD Challenge: Rèn Phản Xạ": "BD Challenge: Tactical Reflexes",
    "Đối đầu với 3 phong cách đàm phán từ Purchasing hành xác và leo bảng xếp hạng cao thủ.": "Confront 3 tough purchasing negotiation archetypes and conquer the leaderboard.",
    "Chơi Ngay +25⚡": "Play Now +25⚡",
    "📖 TÀI LIỆU HOT": "📖 TRENDING RESOURCES",
    "Cẩm Nang BD Thực Chiến": "Battle-Tested BD Playbook",
    "Tổng hợp 100+ mẫu email tiếp cận, kịch bản pitching và cẩm nang đàm phán.": "Curated 100+ cold outreach templates, pitching scripts & negotiation playbooks.",
    "Tải Ebook Miễn Phí": "Download Free Ebook",
    "✍️ Tạo Bài Viết Mới": "✍️ Create New Post",
    "Cú BeeDee:": "BeeDee The Owl:",
    "Đăng bài chia sẻ nghiệp vụ, kinh nghiệm BD hoặc kết nối PIC mua hàng. Treo thêm Bounty Point ⚡ để được phản hồi siêu tốc!": "Share field tactics, BD insights, or request enterprise PIC referrals. Add Bounty Points ⚡ for rapid replies!",
    "Chèn nhanh Icon B2B:": "Quick B2B Icons:",
    "Treo thưởng Bounty Point ⚡ để nhận hỗ trợ nhanh hơn:": "Offer Bounty Points ⚡ for accelerated responses:",
    "Thưởng 100đ ⚡": "Bounty 100pts ⚡",
    "Thưởng 150đ ⚡": "Bounty 150pts ⚡",
    "Thưởng 200đ ⚡": "Bounty 200pts ⚡",
    "Thưởng 500đ ⚡": "Bounty 500pts ⚡",
    "Đã chọn: 0 ảnh, 0 video": "Selected: 0 images, 0 videos",
    "🖼️ Ảnh": "🖼️ Images",
    "Đăng bài": "Publish Post",
    "⚙️ Thiết Lập Hồ Sơ BD": "⚙️ BD Profile Settings",
    "🖼️ Đổi ảnh đại diện": "🖼️ Change Avatar",
    "Nickname của bạn:": "Your Nickname:",
    "Email B2B (Dùng để xác thực & đổi tên/ảnh):": "Work Email (For verification & identity):",
    "* Lưu ý: Bạn cần điền email hợp lệ để kích hoạt khả năng tùy chỉnh tên và ảnh đại diện mong muốn.": "* Notice: Provide a valid work email to activate custom nickname and avatar editing.",
    "🔍 Tìm kiếm chủ đề, câu hỏi, tên công ty...": "🔍 Search topics, questions, company names...",
    "Bạn muốn chia sẻ điều gì hoặc cần hỗ trợ kết nối PIC mua hàng của doanh nghiệp nào?...": "What would you like to share or which company's purchasing PIC are you seeking?...",
    "Ví dụ: Chiến thần Săn lead": "e.g., Enterprise Hunter",
    "BD Bình Dân Học Vụ - Để Bạn Không Đơn Độc Trên Hành Trình BD": "BD Binh Dan Hoc Vu - Never walk alone on your BD journey",
    "BD BÌNH DÂN HỌC VỤ": "BD BINH DAN HOC VU",
    "✨ \"Để Bạn Không Đơn Độc Trên Hành Trình BD\"": "✨ \"Never walk alone on your BD journey\"",
    "▶ Tự động": "▶ Auto Play",
    "Tiếp": "Next",
    "Slide trước (Phím ←)": "Previous Slide (Key ←)",
    "Slide sau (Phím →)": "Next Slide (Key →)",
    "BẢN ĐỒ LUẬT LAO ĐỘNG": "VIETNAM LABOR LAW MAP",
    "Bản Đồ Luật Lao Động": "Vietnam Labor Law Map",
    "CỔNG ĐẶC QUYỀN ALUMNI VIP": "EXCLUSIVE ALUMNI VIP PORTAL",
    "Cổng Đặc Quyền Alumni VIP": "Exclusive Alumni VIP Portal",
    "CỘNG ĐỒNG B2B BD VIỆT NAM": "VIETNAM B2B BD COMMUNITY",
    "Cộng Đồng B2B BD Việt Nam": "Vietnam B2B BD Community",
    "THƯ VIỆN B2B BD": "B2B BD LIBRARY",
    "Nhiệm Vụ & Quà Tặng": "Quests & Rewards",
    "BỘ CÔNG CỤ ƯỚC TÍNH KPI BD": "B2B KPI & REVENUE FUNNEL MATRIX",
    "Bộ Công Cụ Ước Tính KPI BD": "B2B KPI & Revenue Funnel Matrix",
    "TRẮC NGHIỆM 4 PHONG CÁCH BD THỰC CHIẾN": "4 B2B SALES ARCHETYPES TEST",
    "Trắc Nghiệm 4 Phong Cách BD Thực Chiến": "4 B2B Sales Archetypes Test",
    "TÍNH LƯƠNG GROSS - NET": "GROSS - NET SALARY CALCULATOR",
    "Tra Cứu Mức Lương B2B / BD": "B2B / BD Compensation Benchmark",
    "AI EMAIL ASSISTANT": "B2B AI EMAIL ASSISTANT",
    "B2B Email Assistant": "B2B AI Email Assistant",
    "Quy Trình Hưởng Trợ Cấp Thất Nghiệp (TCTN)": "Unemployment Allowance Application Process (TCTN)",
    "Tư Duy BD \"Thép\" & Tâm Lý Học B2B Mindset": "\"Steel\" BD Mindset & B2B Sales Psychology",
    "Chiến Lược Social Selling & LinkedIn BD 2026": "Social Selling & LinkedIn BD Strategy 2026",
    "9 Nguyên Tắc Thực Chiến B2B BD": "The 9 Battle-Tested B2B BD Principles",
    "Bộ Cẩm Nang Ngôn Từ B2B BD (5 Pha Chuyển Mình)": "B2B Communication Playbook (5 Metamorphic Phases)",
    "Cẩm Nang Thực Chiến HubSpot CRM Cho B2B BD": "Hands-on HubSpot CRM Handbook for B2B BD",
    "Ma Trận Phễu KPI & Quy Đổi Doanh Thu B2B": "B2B KPI Funnel Matrix & Revenue Forecasting",
    "Cẩm Nang Nhận Diện & Loại Bỏ Fake Lead B2B": "Detecting & Disqualifying B2B Fake Leads",
    "Ebook Scale Up Yourself - Bứt Phá Năng Lực BD B2B": "Scale Up Yourself - Breakthrough B2B BD Capabilities",
    "Chân dung BD 'Fullstack': Từ Tư Duy Đến Thực Chiến !": "Profile of a 'Fullstack' BD: From Mindset to Frontline Execution!",
    "10th BD Tips: \"Gửi anh bảng giá tham khảo được không?\" – Cạm bẫy ngọt ngào nhất của BD B2B": "10th BD Tip: \"Can you send me a price quote?\" – The Sweetest Trap in B2B BD",
    "9th BD Tips: \"Giỏi giao tiếp\" chưa chắc \"giỏi chốt deal\" – Bẫy tâm lý khiến BD hoang tưởng về năng lực": "9th BD Tip: Great Communicators Don't Always Close Deals – The Illusion Trap in BD",
    "8th BD Tips: Khi nào một BD chuyên nghiệp cần dũng cảm nói \"KHÔNG\"?": "8th BD Tip: When Must a Professional BD Have the Courage to Say \"NO\"?",
    "7th BD Tips: Làm sao để “RÃ ĐÔNG” mối quan hệ bị GHOSTING trong B2B?": "7th BD Tip: How to \"Defrost\" Deals Ghosted by Enterprise Clients?",
    "6th BD Tips: Tinh hoa \"vẩy tin\" B2B: Khi nào dùng LinkedIn, khi nào dùng Zalo hay Email?": "6th BD Tip: B2B Outreach Channels: When to Use LinkedIn, Zalo, or Cold Email?",
    "5th BD Tip: Đừng để khách hàng biết bạn là \"TÂN BINH\": 3 CHIÊU \"HÓA THÂN\" thành chuyên gia trong 5 PHÚT 🎩": "5th BD Tip: Never Look Like a \"Rookie\": 3 Tactics to Project Authority in 5 Minutes 🎩",
    "4th BD tips: 3 Dấu \"Tick xanh\" quyết định vận mệnh của một bản Proposal B2B. ✅": "4th BD Tip: 3 Essential Checks Deciding the Fate of a B2B Proposal ✅",
    "3rd BD Tips: Tại sao có những BD CÀNG LÀM CÀNG NHÀN, còn bạn CÀNG LÀM CÀNG ĐUỐI?": "3rd BD Tip: Why Some BDs Scale Effortlessly While You Grow Burned Out?",
    "Lương trong thời gian thử việc": "Salary During Probation",
    "Thời gian thử việc tối đa": "Maximum Probation Period",
    "Quy định số ngày nghỉ phép năm": "Annual Leave Regulations",
    "Thời hạn báo trước khi nghỉ việc": "Statutory Resignation Notice Period",
    "Đơn phương chấm dứt hợp đồng trái luật": "Illegal Unilateral Contract Termination",
    "Điều kiện nhận trợ cấp thôi việc": "Severance Allowance Conditions",
    "Khấu trừ tiền lương và Phạt tiền": "Wage Deductions & Fines",
    "Quy định tiền lương làm thêm giờ (OT)": "Overtime (OT) Pay Regulations",
    "Hết hạn thử việc công ty vẫn trả 85% lương": "Company Continues Paying 85% After Probation Expires",
    "Yêu cầu ký hợp đồng thử việc lần 2": "Mandatory Second Probation Contract",
    "Không quy đổi phép năm chưa nghỉ thành tiền": "Unused Annual Leave Compensation Refusal",
    "Nhân viên tự ý nghỉ việc đột ngột": "Sudden Employee Resignation Without Notice",
    "Ép nghỉ việc ngay lập tức vì không đạt Kpi": "Forced Immediate Termination for Missing KPI",
    "Doanh nghiệp quỵt trợ cấp thôi việc": "Employer Evading Severance Pay",
    "Trừ lương vì đi muộn và làm mất tài liệu": "Salary Deductions for Tardiness & Document Loss",
    "Bắt tăng ca cuối tuần không trả lương OT": "Weekend Overtime Forced Without OT Pay",
    "Nghỉ việc trong thử việc không cần báo trước": "Resigning During Probation Without Prior Notice",
    "Công ty không đóng bảo hiểm bắt buộc": "Employer Fails to Pay Statutory Insurances",
    "Làm việc ngày lễ online không tính lương OT 300%": "Remote Holiday Work Without 300% OT Compensation",
    "Nghỉ việc ngay lập tức do bị nợ lương": "Immediate Resignation Due to Withheld Salary",
    "Sa thải nhân viên BD nữ mang thai": "Illegal Termination of Pregnant Female BD",
    "Công ty tạm giữ bằng đại học gốc": "Company Withholding Original University Degree",
    "Tự ý giảm cơ chế tính hoa hồng doanh số B2B": "Arbitrary Reduction of B2B Commission Scheme",
    "Khi thâm nhập thị trường mới, tôi thích tham dự trực tiếp các hội thảo doanh nghiệp lớn để networking trực tiếp hơn là ngồi lập quy trình gửi email hàng loạt.": "When entering a new market, I prefer attending major enterprise conferences for direct face-to-face networking rather than building mass cold email sequences.",
    "Tôi sẵn sàng dành hàng giờ tự nghiên cứu chi tiết sơ đồ phòng ban và LinkedIn của PIC doanh nghiệp trước khi gọi cuộc gọi đầu tiên, thay vì gọi điện thăm dò trực tiếp.": "I gladly spend hours mapping org charts and researching target PICs on LinkedIn before placing the first call, rather than dialing cold to probe blindly.",
    "Gặp khách hàng từ chối thẳng thừng, tôi thích gọi lại ngay sau vài ngày bằng một góc tiếp cận hoàn toàn mới lạ hơn là im lặng gửi tài liệu bổ sung qua email.": "Facing a blunt rejection, I prefer calling back in a few days with a fresh, unconventional angle rather than passively emailing follow-up brochures.",
    "Tôi luôn dựa vào số liệu doanh thu lịch sử và cấu trúc ngân sách thực tế của khách hàng để làm đề xuất thương mại, thay vì đề cập đến các viễn cảnh công nghệ tương lai.": "I anchor commercial proposals firmly on historical revenue data and fiscal budgets rather than speculative future technology visions.",
    "Khi pitching giải pháp B2B, tôi muốn vẽ ra bức tranh thay đổi vị thế chiến lược của khách hàng trong 3 năm tới hơn là liệt kê chi tiết các bước triển khai kỹ thuật hàng ngày.": "When pitching B2B solutions, I inspire C-levels with strategic competitive shifts over the next 3 years rather than enumerating technical rollout steps.",
    "Tôi thích thử nghiệm các ý tưởng tiếp cận khách hàng độc lạ (như gửi quà tặng sáng tạo cá nhân hóa) hơn là bám sát quy trình gọi điện/email truyền thống.": "I enjoy experimenting with unorthodox outreach (like hyper-personalized creative gifts) rather than adhering strictly to rigid calling sequences.",
    "Tôi sẵn sàng từ chối thẳng thắn các yêu cầu phát sinh ngoài hợp đồng của đối tác nếu điều đó làm giảm biên lợi nhuận tối thiểu của công ty tôi.": "I firmly decline scope creep requests from clients if they erode my company's baseline profit margins.",
    "Mối quan hệ tin tưởng và sự 'hợp cạ' (chemistry) giữa tôi và người quyết định phía khách hàng quan trọng hơn việc giải pháp của tôi có giá rẻ hơn đối thủ 10%.": "Personal trust and rapport with the decision-maker matter far more than having a 10% price undercut against competitors.",
    "Khi giải quyết sự cố hợp đồng với khách hàng, tôi tập trung phân tích điều khoản pháp lý và đền bù tài chính rõ ràng thay vì dành nhiều thời gian để xoa dịu cảm xúc của PIC mua hàng.": "When resolving contract disputes, I focus squarely on clear contractual terms and financial remedies rather than spending time placating buyer emotions.",
    "Tôi luôn cập nhật CRM đầy đủ mỗi ngày và bám sát kịch bản sales định sẵn của công ty để đảm bảo tính hệ thống, kỷ luật.": "I rigorously update CRM pipelines daily and follow standard sales playbooks to ensure disciplined systemic execution.",
    "Tôi thích tự ý điều chỉnh cấu trúc hợp đồng và thỏa thuận giá ngay trong cuộc họp tùy theo phản ứng của khách hàng, hơn là chờ đợi quy trình phê duyệt giá cứng nhắc.": "I prefer dynamically tailoring contract terms and concessions live in meetings based on client cues rather than awaiting bureaucratic approval cycles.",
    "Tôi thấy thoải mái nhất khi làm việc với các mục tiêu chỉ số (KPI) được định lượng cụ thể rõ ràng theo tuần, hơn là các định hướng hành động tự do tự quản.": "I thrive when working toward unambiguous, weekly quantified KPIs rather than ambiguous, self-directed high-level guidance.",
    "BD Bình Dân Học Vụ | Nơi Chiến Binh BD Bắt Đầu": "BD Binh Dan Hoc Vu | Where BD Warriors Begin",
    "Đang chuẩn bị lời chào hóm hỉnh...": "Preparing witty greeting...",
    "🧭 Khám phá nhanh (30s)": "🧭 Quick Discovery (30s)",
    "BD B2B không đơn thuần là bán sản phẩm.": "B2B BD is not merely selling a product.",
    "SỰ TIN TƯỞNG": "TRUST",
    "GIẢI PHÁP": "SOLUTION",
    "Ngôn từ bạn chọn sẽ quyết định bạn là một người bán hàng đang nài nỉ, hay một chuyên gia đang gỡ rối bài toán cho doanh nghiệp.": "The words you choose define whether you are a pleading vendor or a trusted advisor solving business challenges.",
    "Hệ Sinh Thái": "Ecosystem",
    "Streak: 1 ngày 🔥": "Streak: 1 Day 🔥",
    "Thử thách 1 / 7": "Challenge 1 / 7",
    "Câu tiếp theo →": "Next Question →",
    "Câu tiếp theo &rarr;": "Next Question →",
    "🔍 Xem Lại Đáp Án Chi Tiết": "🔍 Review Detailed Answers",
    "🏆 ĐĂNG BẢNG VÀNG CHIẾN THẦN B2B": "🏆 ENTER B2B LEADERBOARD",
    "Tên đề xuất cho bạn:": "Suggested name:",
    ". Bạn có muốn đổi tên khác hoặc lưu lại email để khóa danh hiệu không?": ". Would you like to change your display name or save email to lock your title?",
    "Xác Nhận Đăng Bảng Vàng": "Confirm Leaderboard Entry",
    "Chơi Lại": "Play Again",
    "Đổi Game Khác": "Choose Another Game",
    "🏆 BẢNG VÀNG CHIẾN THẦN B2B": "🏆 B2B LEADERBOARD",
    "Vinh danh Top 10 chuyên viên BD xuất sắc nhất hoàn thành thử thách tình huống thực tế.": "Honoring the Top 10 BD professionals mastering real-world sales challenges.",
    "BẬT NHẮC NHỞ HÀI HƯỚC TỪ CÚ BEEDEE": "ENABLE WITTY REMINDERS FROM BEEDEE",
    "Mẹo thực chiến hài hước mỗi sáng lúc 8h45 từ Peter Vo & Nhận ngay 25đ ⚡": "Daily 8:45 AM witty sales tips from Peter Vo & earn 25 Points ⚡",
    "Mẹo thực chiến hài hước mỗi sáng lúc 8h45 từ Peter Vo &amp; Nhận ngay 25đ ⚡": "Daily 8:45 AM witty sales tips from Peter Vo & earn 25 Points ⚡",
    "Bật Nhắc Nhở & Nhận 25đ ⚡": "Enable Reminders & Earn 25pts ⚡",
    "Bật Nhắc Nhở &amp; Nhận 25đ ⚡": "Enable Reminders & Earn 25pts ⚡",
    "🎉 Đăng ký thành công! Cú BeeDee đã mở tài khoản tích lũy 25 BD-Points cho bạn.": "🎉 Success! BeeDee opened your account with 25 BD-Points bonus.",
    "⚔️ B2B ARCADE: ĐẤU TRƯỜNG BD THỰC CHIẾN": "⚔️ B2B ARCADE: ACTION ARENA",
    "Trải nghiệm 4 trò chơi tương tác thực tế với **12 cấp độ thử thách tăng dần**. Vượt mỗi ải để tích lũy BD-Points ⚡ lũy tiến và chinh phục danh hiệu Huyền Thoại BD!": "Experience 4 interactive situational games across 12 escalating difficulty tiers. Conquer stages to accumulate BD-Points ⚡ and claim the BD Legend title!",
    "Nối đường ống bán hàng từ Lead đến Closed Won. Nhận diện các điểm nghẽn và tối ưu phễu.": "Build pipeline from Lead to Closed Won. Pinpoint bottlenecks and optimize conversion.",
    "Cấp 1 / 12": "Tier 1 / 12",
    "Tải 01 Ebook BD Hiệu Quả": "Download 1 Actionable BD Ebook",
    "Mốc 500 Điểm 🪙": "500 Points Tier 🪙",
    "Khóa (500đ) 🔒": "Locked (500pts) 🔒",
    "Trà Sữa L Mát Lạnh": "Size L Refreshing Milk Tea",
    "Mốc 850 Điểm 🪙": "850 Points Tier 🪙",
    "Khóa (850đ) 🔒": "Locked (850pts) 🔒",
    "Sổ Tay / Đồ Decor Cute": "Notebook / Desk Decor",
    "Mốc 1500 Điểm 🪙": "1,500 Points Tier 🪙",
    "Khóa (1500đ) 🔒": "Locked (1,500pts) 🔒",
    "30 Phút Tư Vấn Online 1-1": "30-Min 1-on-1 Online Consultation",
    "Mốc 3500 Điểm 🪙": "3,500 Points Tier 🪙",
    "Khóa (3500đ) 🔒": "Locked (3,500pts) 🔒",
    "Voucher Giảm 30% Học Phí": "30% Course Tuition Voucher",
    "Mốc 5500 Điểm 🪙": "5,500 Points Tier 🪙",
    "Khóa (5500đ) 🔒": "Locked (5,500pts) 🔒",
    "Ăn Trưa Cùng Anh Peter": "Executive Lunch with Peter Vo",
    "Mốc 9500 Điểm 🪙": "9,500 Points Tier 🪙",
    "Khóa (9500đ) 🔒": "Locked (9,500pts) 🔒",
    "📅 NHIỆM VỤ HÀNG NGÀY": "📅 DAILY QUESTS",
    "🗓️ NHIỆM VỤ HÀNG TUẦN": "🗓️ WEEKLY QUESTS",
    "🚀 CHIẾN DỊCH TUẦN": "🚀 WEEKLY CAMPAIGNS",
    "📜 Lịch sử tích điểm & đổi quà": "📜 Points & Redemption History",
    "📜 Lịch sử tích điểm &amp; đổi quà": "📜 Points & Redemption History",
    "(Nhấn để xem chi tiết)": "(Click to view details)",
    "Luyện tập đều đặn để tích lũy ngày Streak và nhận quà tương ứng:": "Practice consistently to build your Streak and unlock rewards:",
    "Cộng Đồng BD B2B Thực Chiến": "B2B BD Practitioners Community",
    "Thảo luận case-study, nhận feedback trực tiếp từ anh Peter và tăng tốc Streak học tập!": "Discuss case studies, get direct feedback from Peter Vo, and accelerate your learning Streak!",
    "👉 Vào Cộng Đồng (Free)": "👉 Join Community (Free)",
    "🎯 Hạn mức:": "🎯 Quota:",
    "3 Contacts / Tháng": "3 Contacts / Month",
    "• Hạn dùng:": "• Validity:",
    "&bull; Hạn dùng:": "• Validity:",
    "3 Tháng Đầu (Tối đa 9 contacts)": "First 3 Months (Up to 9 contacts)",
    "🎯 Mở Cổng Tìm PIC →": "🎯 Open PIC Finder →",
    "🎯 Mở Cổng Tìm PIC &rarr;": "🎯 Open PIC Finder →",
    "💬 Zalo Peter Võ": "💬 Zalo Peter Vo",
    "⭐ 4 ĐẶC QUYỀN TRỌN ĐỜI CHO ALUMNI KHÓA BD": "⭐ 4 LIFETIME PRIVILEGES FOR BD COURSE ALUMNI",
    "Độc quyền cựu học viên": "Exclusive for Alumni",
    "3 lượt/3 tháng xác thực PIC C-Level, HR, IT & Marketing từ 30k LinkedIn.": "3 requests/mo for 3 months to verify C-Level, HR, IT & Marketing PICs from 30k LinkedIn network.",
    "3 lượt/3 tháng xác thực PIC C-Level, HR, IT &amp; Marketing từ 30k LinkedIn.": "3 requests/mo for 3 months to verify C-Level, HR, IT & Marketing PICs from 30k LinkedIn network.",
    "2. Ebook B2B Thực Chiến": "2. Tactical B2B Ebooks",
    "Mở khóa trọn bộ tài liệu mật: Tâm lý B2B, Social Selling & 9 Nguyên tắc chốt deal.": "Unlock secret playbooks: B2B psychology, Social Selling & 9 Closing Principles.",
    "Mở khóa trọn bộ tài liệu mật: Tâm lý B2B, Social Selling &amp; 9 Nguyên tắc chốt deal.": "Unlock secret playbooks: B2B psychology, Social Selling & 9 Closing Principles.",
    "Chương trình": "Program",
    "\"Hỗ Trợ Tìm PIC\"": "\"PIC Sourcing Support\"",
    "(3 contacts / tháng trong 3 tháng đầu tiên, tối đa 9 contacts) chuyên khối": "(3 contacts / month for first 3 months, up to 9 contacts) targeting",
    "qua mạng lưới 30,000+ kết nối LinkedIn của anh": "via 30,000+ LinkedIn network connections of",
    "Peter Võ": "Peter Vo",
    "là đặc quyền chỉ dành riêng cho cựu học viên Khóa BD Thực Chiến.": "is an exclusive privilege solely for BD Masterclass Alumni.",
    "Mật khẩu VIP chưa chính xác hoặc email không có trong danh sách Alumni. Vui lòng kiểm tra lại.": "Incorrect VIP Passcode or email not found in Alumni registry. Please double check.",
    "Cơ chế bảo mật:": "Security Policy:",
    "Mỗi học viên được cấp một Mật khẩu VIP riêng biệt gửi qua email. Mật khẩu gắn liền với hạn mức 3 contacts/tháng của bạn, vui lòng": "Each student is issued a unique VIP passcode via email tied to your 3 contacts/month quota. Please",
    "không chia sẻ cho người lạ": "do not share with others",
    "để tránh bị dùng mất lượt nhé!": "to avoid consuming your quota!",
    "⭐ ALUMNI VIP - KHÓA BD THỰC CHIẾN": "⭐ ALUMNI VIP - BD MASTERCLASS",
    "Chào mừng,": "Welcome,",
    "Chiến Thần BD": "BD Warrior",
    "✏️ Đổi Tên": "✏️ Rename",
    "🔒 Khóa Lại / Đổi Tài Khoản": "🔒 Lock / Switch Account",
    "Thông tin PIC cung cấp có thể là": "Verified PIC details may include",
    "Số điện thoại (SĐT)": "Phone Number",
    ", hoặc": ", or",
    "cả hai": "both",
    "tùy theo khả năng và dữ liệu xác thực thực tế của anh Peter Võ.": "depending on available verified data from Peter Vo.",
    "ĐẶC QUYỀN ALUMNI • GIVER MENTALITY": "ALUMNI PRIVILEGE • GIVER MENTALITY",
    "ĐẶC QUYỀN ALUMNI &bull; GIVER MENTALITY": "ALUMNI PRIVILEGE • GIVER MENTALITY",
    "và": "and",
    "tải miễn phí Ebook thực chiến đầu tiên": "download their first tactical Ebook for free",
    "cho mỗi bạn tham gia và tích lũy mở khóa 3 Mốc Thưởng!": "per participating colleague and progress towards 3 Milestones!",
    "💡 Cơ chế tính điểm &amp; nhận thưởng minh bạch:": "💡 Transparent Points & Rewards Engine:",
    "(Tiến độ:": "(Progress:",
    "/15 bạn)": "/15 peers)",
    "Chi tiết quà tặng": "Reward Details",
    "&bull; Còn": "• Remaining",
    "3/3 lượt": "3/3 quotas",
    "tìm PIC": "PIC requests",
    "⭐ Xem Đặc Quyền & Vé Mời VIP →": "⭐ View Privileges & VIP Passes →",
    "⭐ Xem Đặc Quyền &amp; Vé Mời VIP &rarr;": "⭐ View Privileges & VIP Passes →",
    "Cách quà tiếp theo: 200đ": "Next reward in: 200pts",
    "Ma Trận Tư Duy B2B BD": "B2B BD Mindset Matrix",
    "Khía Cạnh": "Dimension",
    "Nghiệp Dư": "Amateur",
    "(Nên tránh)": "(Avoid)",
    "Chuyên Gia": "Expert",
    "(Nên dùng)": "(Recommended)",
    "Bước Nhảy Vọt": "Quantum Leap",
    "Giá cả": "Pricing",
    "\"Rẻ nhất\"": "\"Cheapest\"",
    "\"Tối ưu/Phù hợp nhất\"": "\"Optimal / Best Fit\"",
    "Từ phá giá → Giải bài toán tài chính": "From Price Dumping → Solving Financial Problems",
    "Từ phá giá &rarr; Giải bài toán tài chính": "From Price Dumping → Solving Financial Problems",
    "Năng lực": "Capability",
    "\"Để em thử\"": "\"Let me try\"",
    "\"Phương án tốt nhất\"": "\"The best solution\"",
    "Từ thử nghiệm → Trách nhiệm": "From Trial → Accountability",
    "Từ thử nghiệm &rarr; Trách nhiệm": "From Trial → Accountability",
    "Bằng chứng": "Evidence",
    "\"Em nghĩ là\"": "\"I think that\"",
    "\"Dựa trên dữ liệu\"": "\"Data-driven\"",
    "Từ cảm tính → Sự thật & Số liệu": "From Intuition → Facts & Data",
    "Từ cảm tính &rarr; Sự thật & Số liệu": "From Intuition → Facts & Data",
    "Tính năng": "Features",
    "\"Bên em không có\"": "\"We don't support that\"",
    "\"Tập trung mạnh vào\"": "\"We heavily focus on\"",
    "Từ thiếu hụt → Thế mạnh lõi": "From Missing Features → Core Strength",
    "Từ thiếu hụt &rarr; Thế mạnh lõi": "From Missing Features → Core Strength",
    "Chốt Deal": "Closing the Deal",
    "\"Cứ cân nhắc đi ạ\"": "\"Take your time to consider\"",
    "\"Bước tiếp theo sẽ là\"": "\"The next concrete step is\"",
    "Từ chờ đợi → Dẫn dắt cuộc chơi": "From Waiting → Leading the Engagement",
    "Từ chờ đợi &rarr; Dẫn dắt cuộc chơi": "From Waiting → Leading the Engagement",
    "Theo dõi và kết nối trực tiếp tại các hội thảo, triển lãm và tọa đàm B2B hàng đầu tại Việt Nam.": "Discover and network at premier B2B seminars, trade exhibitions, and enterprise conferences in Vietnam.",
    "Tất cả lĩnh vực": "All Industries",
    "Công nghệ & Khởi nghiệp": "Tech & Startups",
    "Sản xuất & Công nghiệp nặng": "Manufacturing & Heavy Industry",
    "F&B, Nhà hàng & Khách sạn": "F&B, Hospitality",
    "Xây dựng, Thiết kế & Nội thất": "Construction & Interior Design",
    "Y tế, Dược phẩm & Làm đẹp": "Healthcare & Pharma",
    "Thương mại, Logistics & Xúc tiến": "Trade & Logistics",
    "Tất cả hình thức": "All Formats",
    "Offline / Trực tiếp": "Offline / In-person",
    "Online / Trực tuyến": "Online / Virtual",
    "Hybrid (Cả hai)": "Hybrid",
    "Tự động cập nhật: 15s": "Auto-updated: 15s",
    "Tháng 7/2026": "July 2026",
    "Tháng 8/2026": "August 2026",
    "Tháng 9/2026": "September 2026",
    "Tháng 10/2026": "October 2026",
    "Tháng 11/2026": "November 2026",
    "Tháng 12/2026": "December 2026",
    "BD khó có Peter lo": "Tough deals? Peter has your back",
    "Chiến thần BD đang online thực chiến. Bấm khiêu chiến để đấu điểm trực tiếp!": "BD Warriors are online. Click to challenge them directly in a score duel!",
    "⚔️ ĐẤU TRƯỜNG PVP ONLINE": "⚔️ ONLINE PVP ARENA",
    "Tìm kiếm thuật ngữ B2B cốt lõi bị ẩn giấu trong ma trận chữ cái.": "Find core B2B sales terms hidden in the letter matrix.",
    "Phân bổ deal (🤝 hoặc ❌) thỏa mãn điều kiện logic phân phối của doanh nghiệp.": "Allocate deals (🤝 or ❌) meeting enterprise distribution logic.",
    "Sắp xếp các BD Manager vào sơ đồ vùng địa bàn không trùng lặp quyền lợi.": "Map BD Managers into territorial grids without commission conflicts.",
    "Đăng Nhập": "Login",
    "Đăng Ký": "Register",
    "Đăng Xuất": "Logout",
    "Cổng Đặc Quyền Alumni VIP (Tìm PIC) →": "Alumni VIP Portal (Find PIC) →",
    "Đặc quyền dành cho học viên khóa BD": "Exclusive for BD Course Alumni",
    "Sự Kiện B2B Các Ngành →": "Industry B2B Events →",
    "Hotline / Zalo: 0931.100.569": "Hotline / WhatsApp / Zalo: 0931.100.569",
    "Email: bdtraining@bdbinhdanhocvu.com": "Email: bdtraining@bdbinhdanhocvu.com",
    "Chú cú BeeDee thông thái": "BeeDee The Wise Owl",
    "Chat nhanh với BeeDee": "Chat with BeeDee",
    "Nhiệm vụ nhận quà": "Earn Rewards",
    "Quy Đổi Gross - Net": "Gross - Net Calculator",
    "Tra Cứu Mức Lương B2B": "B2B Salary Benchmark",
    "Trình Quy Đổi Lương": "Salary Converter",
    "Bắt Đầu Quy Đổi": "Calculate Salary",
    "Biểu Đồ Phân Phối Lương": "Salary Distribution Chart",
    "Bảng Phân Tích Chi Tiết (VND)": "Detailed Breakdown Table (VND)",
    "Chi Tiết Thuế Lũy Tiến Từng Phần": "Progressive Tax Brackets Detail",
    "Diễn giải chi tiết cách tính toán": "Step-by-Step Calculation Explanation",
    "Sao chép": "Copy",
    "Tra Cứu Mức Lương": "Lookup Salary",
    "Phân Khúc Thu Nhập": "Compensation Quartiles",
    "Gói Thu Nhập Chi Tiết & Khuyến Nghị Chỉ Tiêu (OTE)": "Detailed Compensation & OTE Quota Guidance",
    "Đặc thù doanh số & chỉ tiêu (B2B Quota)": "Sales Quota & Target Characteristics",
    "Khuyến nghị đàm phán thù lao": "Compensation Negotiation Guidance",
    "Đồng bộ sang Gross ↔ Net": "Sync to Gross ↔ Net Converter",
    "Các câu hỏi thường gặp (FAQs)": "Frequently Asked Questions (FAQs)",
    "Quy Định Pháp Lý Hiện Hành": "Current Statutory Regulations",
    "Tình Huống Thực Tế (Case Studies)": "Practical Dispute Case Studies",
    "Tra cứu nguồn luật →": "View Legal Source →",
    "QUẸT THẺ ĐO CHỈ SỐ BD CỦA BẠN": "SWIPE TO TEST YOUR BD SALES ARCHETYPE",
    "Vào Trận Quẹt Thẻ Ngay": "Start Swiping Now",
    "Quẹt Trái (Không phù hợp)": "Swipe Left (Disagree)",
    "Quẹt Phải (Đồng ý)": "Swipe Right (Agree)",
    "In / Lưu File PDF": "Print / Save PDF",
    "THIẾT LẬP MỤC TIÊU & TỶ LỆ CHUYỂN ĐỔI (CR)": "SET TARGETS & CONVERSION RATES (CR)",
    "PHỄU HOẠT ĐỘNG BD LŨY TIẾN NGƯỢC": "REVERSE PROGRESSIVE BD FUNNEL",
    "Tải Full KPI Tracking & Plan Template (XLSX)": "Download Full KPI Tracking Template (XLSX)",
    "Đánh Giá Email": "Audit Email",
    "Phân Tích & Chấm Điểm Email": "Email Analysis & Strength Scoring",
    "BD B2B Ebook (9 Quyển)": "9 B2B BD Ebooks",
    "Từ Điển Thuật Ngữ BD (B2B Glossary)": "B2B BD Glossary",
    "Cập Nhật Bài Mới Từ LinkedIn": "Latest LinkedIn Articles",
    "NHIỆM VỤ & CHIẾN DỊCH": "QUESTS & CAMPAIGNS",
    "ĐẶC QUYỀN ALUMNI VIP": "ALUMNI VIP PRIVILEGES",
    "CỬA HÀNG ĐỔI QUÀ": "REWARDS REDEMPTION STORE",
    "Tìm PIC": "Find PIC",
    "ĐẶC QUYỀN ALUMNI VIP - KHÓA BD THỰC CHIẾN": "ALUMNI VIP PRIVILEGE - BD MASTERCLASS",
    "Mở Khóa Đặc Quyền Alumni VIP": "Unlock Alumni VIP Portal",
    "Tất cả thảo luận": "All Discussions",
    "Hỏi đáp nghiệp vụ": "Tactical Q&A",
    "Yêu cầu kết nối PIC": "Request PIC Connection",
    "Câu chuyện BD": "Sales War Stories",
    "Đấu Trường PvP": "PvP Arena",
    "Thiết lập Profile": "Profile Settings",
    "Đặt Câu Hỏi / Chia Sẻ": "New Post / Question",
    "SĐT / Zalo:": "Phone / WhatsApp / Zalo:",
    "CỘNG ĐỒNG": "COMMUNITY",
    "Soạn Email Tiếp Cận Bằng AI": "Generate Cold Email with AI",
    "Kết Quả Phân Tích & Soạn Thảo": "Audit & Generation Results",
    "Cẩm Nang Thực Chiến": "Battle Playbooks",
    "Kết Nối Thực Chiến": "Frontline Network",
    "Trắc Nghiệm Tính Cách B2B": "B2B Sales Archetype Test",
    "CỘNG ĐỒNG HOT": "TRENDING COMMUNITY",
    "Ebook sẽ được gửi tự động qua email của bạn kèm link xác thực kích hoạt tài khoản (+15đ ).": "The Ebook will be delivered to your inbox with an account activation link (+15 Points ).",
    "Gửi Ebook Đến Email Của Tôi": "Send Ebook to My Email",
    "Cơ chế tính điểm & nhận thưởng minh bạch:": "Transparent Points & Rewards Engine:",
    "Copy Lời Mời Mẫu": "Copy Invitation Message",
    "Sao Chép Link": "Copy Link",
    "3 MỐC THƯỞNG MILESTONE KHI ĐỒNG ĐỘI THAM GIA": "3 REWARD MILESTONES WHEN PEERS JOIN",
    "3 MỐC THƯỞNG VIP ĐỒNG ĐỘI": "3 VIP PEER REWARD MILESTONES",
    "GIẢI NHIỆT": "REFRESHMENT",
    "Kết nối LinkedIn": "Connect on LinkedIn",
    "Vào Cộng Đồng": "Join Community",
    "Vào Thư Viện Ebook": "Open Ebook Library",
    "Khối Nhân Sự (HR)": "Human Resources (HR)",
    "Khối Marketing": "Marketing Division",
    "Khối C-Level / Ban Giám Đốc": "C-Level / Executive Board",
    "Khối Công Nghệ & Kỹ Thuật (IT)": "Technology & Engineering (IT)",
    "Lịch Sử Yêu Cầu Của Bạn": "Your Request History",
    "Chơi Ngay +25": "Play Now +25",
    "TÀI LIỆU HOT": "TRENDING RESOURCES",
    "Tạo Bài Viết Mới": "Create New Post",
    "Đăng bài chia sẻ nghiệp vụ, kinh nghiệm BD hoặc kết nối PIC mua hàng. Treo thêm Bounty Point để được phản hồi siêu tốc!": "Share field tactics, BD insights, or request enterprise PIC referrals. Add Bounty Points for rapid replies!",
    "Treo thưởng Bounty Point để nhận hỗ trợ nhanh hơn:": "Offer Bounty Points for accelerated responses:",
    "Thưởng 100đ": "Bounty 100pts",
    "Thưởng 150đ": "Bounty 150pts",
    "Thưởng 200đ": "Bounty 200pts",
    "Thưởng 500đ": "Bounty 500pts",
    "Ảnh": "Images",
    "Thiết Lập Hồ Sơ BD": "BD Profile Settings",
    "Đổi ảnh đại diện": "Change Avatar",
    "Tìm kiếm chủ đề, câu hỏi, tên công ty...": "Search topics, questions, company names...",
    "\"Để Bạn Không Đơn Độc Trên Hành Trình BD\"": "\"Never walk alone on your BD journey\"",
    "5th BD Tip: Đừng để khách hàng biết bạn là \"TÂN BINH\": 3 CHIÊU \"HÓA THÂN\" thành chuyên gia trong 5 PHÚT": "5th BD Tip: Never Look Like a \"Rookie\": 3 Tactics to Project Authority in 5 Minutes",
    "4th BD tips: 3 Dấu \"Tick xanh\" quyết định vận mệnh của một bản Proposal B2B.": "4th BD Tip: 3 Essential Checks Deciding the Fate of a B2B Proposal",
    "Khám phá nhanh (30s)": "Quick Discovery (30s)",
    "Streak: 1 ngày": "Streak: 1 Day",
    "Xem Lại Đáp Án Chi Tiết": "Review Detailed Answers",
    "ĐĂNG BẢNG VÀNG CHIẾN THẦN B2B": "ENTER B2B LEADERBOARD",
    "BẢNG VÀNG CHIẾN THẦN B2B": "B2B LEADERBOARD",
    "Mẹo thực chiến hài hước mỗi sáng lúc 8h45 từ Peter Vo & Nhận ngay 25đ": "Daily 8:45 AM witty sales tips from Peter Vo & earn 25 Points",
    "Mẹo thực chiến hài hước mỗi sáng lúc 8h45 từ Peter Vo &amp; Nhận ngay 25đ": "Daily 8:45 AM witty sales tips from Peter Vo & earn 25 Points",
    "Bật Nhắc Nhở & Nhận 25đ": "Enable Reminders & Earn 25pts",
    "Bật Nhắc Nhở &amp; Nhận 25đ": "Enable Reminders & Earn 25pts",
    "Đăng ký thành công! Cú BeeDee đã mở tài khoản tích lũy 25 BD-Points cho bạn.": "Success! BeeDee opened your account with 25 BD-Points bonus.",
    "B2B ARCADE: ĐẤU TRƯỜNG BD THỰC CHIẾN": "B2B ARCADE: ACTION ARENA",
    "Trải nghiệm 4 trò chơi tương tác thực tế với **12 cấp độ thử thách tăng dần**. Vượt mỗi ải để tích lũy BD-Points lũy tiến và chinh phục danh hiệu Huyền Thoại BD!": "Experience 4 interactive situational games across 12 escalating difficulty tiers. Conquer stages to accumulate BD-Points and claim the BD Legend title!",
    "Mốc 500 Điểm": "500 Points Tier",
    "Khóa (500đ)": "Locked (500pts)",
    "Mốc 850 Điểm": "850 Points Tier",
    "Khóa (850đ)": "Locked (850pts)",
    "Mốc 1500 Điểm": "1,500 Points Tier",
    "Khóa (1500đ)": "Locked (1,500pts)",
    "Mốc 3500 Điểm": "3,500 Points Tier",
    "Khóa (3500đ)": "Locked (3,500pts)",
    "Mốc 5500 Điểm": "5,500 Points Tier",
    "Khóa (5500đ)": "Locked (5,500pts)",
    "Mốc 9500 Điểm": "9,500 Points Tier",
    "Khóa (9500đ)": "Locked (9,500pts)",
    "NHIỆM VỤ HÀNG NGÀY": "DAILY QUESTS",
    "NHIỆM VỤ HÀNG TUẦN": "WEEKLY QUESTS",
    "CHIẾN DỊCH TUẦN": "WEEKLY CAMPAIGNS",
    "Lịch sử tích điểm & đổi quà": "Points & Redemption History",
    "Lịch sử tích điểm &amp; đổi quà": "Points & Redemption History",
    "Vào Cộng Đồng (Free)": "Join Community (Free)",
    "Hạn mức:": "Quota:",
    "Mở Cổng Tìm PIC →": "Open PIC Finder →",
    "Mở Cổng Tìm PIC &rarr;": "Open PIC Finder →",
    "Zalo Peter Võ": "Zalo Peter Vo",
    "4 ĐẶC QUYỀN TRỌN ĐỜI CHO ALUMNI KHÓA BD": "4 LIFETIME PRIVILEGES FOR BD COURSE ALUMNI",
    "ALUMNI VIP - KHÓA BD THỰC CHIẾN": "ALUMNI VIP - BD MASTERCLASS",
    "Đổi Tên": "Rename",
    "Khóa Lại / Đổi Tài Khoản": "Lock / Switch Account",
    "Cơ chế tính điểm &amp; nhận thưởng minh bạch:": "Transparent Points & Rewards Engine:",
    "Xem Đặc Quyền & Vé Mời VIP →": "View Privileges & VIP Passes →",
    "Xem Đặc Quyền &amp; Vé Mời VIP &rarr;": "View Privileges & VIP Passes →",
    "ĐẤU TRƯỜNG PVP ONLINE": "ONLINE PVP ARENA",
    "Phân bổ deal ( hoặc ) thỏa mãn điều kiện logic phân phối của doanh nghiệp.": "Allocate deals ( or ) meeting enterprise distribution logic."
};

    // 2. Phrase Substring Replacements (Sorted by Length Descending)
    const PHRASE_PAIRS = [
    [
        "Bảo hiểm xã hội",
        "Social Insurance"
    ],
    [
        "Bảo hiểm y tế",
        "Health Insurance"
    ],
    [
        "Bảo hiểm thất nghiệp",
        "Unemployment Insurance"
    ],
    [
        "Thuế thu nhập cá nhân",
        "Personal Income Tax"
    ],
    [
        "Người lao động",
        "Employee"
    ],
    [
        "Người sử dụng lao động",
        "Employer"
    ],
    [
        "Thử việc",
        "Probation"
    ],
    [
        "Nghỉ việc",
        "Resignation"
    ],
    [
        "Thôi việc",
        "Severance"
    ],
    [
        "Hợp đồng lao động",
        "Labor Contract"
    ],
    [
        "Giảm trừ gia cảnh",
        "Family Deductions"
    ],
    [
        "Thu nhập trước thuế",
        "Income Before Tax"
    ],
    [
        "Thu nhập tính thuế",
        "Assessable Income"
    ],
    [
        "Lương Gross",
        "Gross Salary"
    ],
    [
        "Lương Net",
        "Net Salary"
    ],
    [
        "Thực nhận",
        "Take-Home Pay"
    ],
    [
        "Đồng bộ",
        "Synchronize"
    ],
    [
        "Quy đổi",
        "Convert"
    ],
    [
        "Tra cứu",
        "Lookup"
    ],
    [
        "Tải Ebook",
        "Download Ebook"
    ],
    [
        "Chi tiết",
        "Details"
    ],
    [
        "Mô tả",
        "Description"
    ],
    [
        "Bắt đầu",
        "Start"
    ],
    [
        "Kết thúc",
        "Finish"
    ],
    [
        "Xác nhận",
        "Confirm"
    ],
    [
        "Học viên",
        "Student"
    ],
    [
        "Đặc quyền",
        "Exclusive Privilege"
    ],
    [
        "Cộng đồng",
        "Community"
    ],
    [
        "Thư viện",
        "Library"
    ],
    [
        "Nhiệm vụ",
        "Quests"
    ],
    [
        "Thử thách",
        "Challenge"
    ]
];

    function translateText(text) {
        if (!text || typeof text !== 'string') return text;
        const trimmed = text.trim();
        if (!trimmed) return text;

        // Exact match check
        if (EXACT_MAP[trimmed]) {
            return text.replace(trimmed, EXACT_MAP[trimmed]);
        }

        // Substring phrase replacement
        let result = text;
        for (let i = 0; i < PHRASE_PAIRS.length; i++) {
            const vi = PHRASE_PAIRS[i][0];
            const en = PHRASE_PAIRS[i][1];
            if (result.includes(vi)) {
                result = result.split(vi).join(en);
            }
        }
        return result;
    }

    // 3. Bidirectional DOM TreeWalker
    function walkAndTranslate(rootNode, toLang) {
        if (!isBrowser || !rootNode) return;
        isTranslating = true;

        const walker = document.createTreeWalker(
            rootNode,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parent = node.parentNode;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    const tag = parent.tagName;
                    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (node.nodeValue && node.nodeValue.trim().length > 0) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            }
        );

        let currentNode = walker.nextNode();
        while (currentNode) {
            if (toLang === 'en') {
                if (currentNode._origViText === undefined) {
                    currentNode._origViText = currentNode.nodeValue;
                }
                const translated = translateText(currentNode._origViText);
                if (translated !== currentNode.nodeValue) {
                    currentNode.nodeValue = translated;
                }
            } else {
                // Revert to Vietnamese
                if (currentNode._origViText !== undefined) {
                    currentNode.nodeValue = currentNode._origViText;
                }
            }
            currentNode = walker.nextNode();
        }

        // Translate Form Elements (Placeholders, Options, Titles)
        const formInputs = rootNode.querySelectorAll ? rootNode.querySelectorAll('input, textarea, select, button') : [];
        formInputs.forEach(el => {
            // Placeholders
            if (el.placeholder) {
                if (toLang === 'en') {
                    if (el.dataset.origPlaceholder === undefined) el.dataset.origPlaceholder = el.placeholder;
                    el.placeholder = translateText(el.dataset.origPlaceholder);
                } else {
                    if (el.dataset.origPlaceholder !== undefined) el.placeholder = el.dataset.origPlaceholder;
                }
            }

            // Titles
            if (el.title) {
                if (toLang === 'en') {
                    if (el.dataset.origTitle === undefined) el.dataset.origTitle = el.title;
                    el.title = translateText(el.dataset.origTitle);
                } else {
                    if (el.dataset.origTitle !== undefined) el.title = el.dataset.origTitle;
                }
            }

            // Select Options
            if (el.tagName === 'SELECT') {
                for (let i = 0; i < el.options.length; i++) {
                    const opt = el.options[i];
                    if (toLang === 'en') {
                        if (opt.dataset.origText === undefined) opt.dataset.origText = opt.text;
                        opt.text = translateText(opt.dataset.origText);
                    } else {
                        if (opt.dataset.origText !== undefined) opt.text = opt.dataset.origText;
                    }
                }
            }
        });

        isTranslating = false;
    }

    // 4. Language Switcher Button Injection & UI Updating
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
                applyLanguage(currentLang === 'vi' ? 'en' : 'vi');
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

    // 5. Apply Language Core
    function applyLanguage(lang) {
        if (!isBrowser) return;
        currentLang = lang;
        storage.setItem('bd_lang', lang);
        document.documentElement.setAttribute('lang', lang);

        // Update TreeWalker across the entire DOM
        walkAndTranslate(document.body, lang);

        // Update toggle buttons
        updateSwitcherButtons(lang);

        // Dispatch Custom Event for Reactive Components (AI Chat, Dynamic Tools)
        window.dispatchEvent(new CustomEvent('bdLanguageChanged', { detail: { lang } }));
    }

    // 6. Real-Time Mutation Observer for Dynamic Script Outputs
    function setupMutationObserver() {
        if (!isBrowser || typeof MutationObserver === 'undefined') return;

        const observer = new MutationObserver((mutations) => {
            if (isTranslating || currentLang !== 'en') return;

            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        walkAndTranslate(node, 'en');
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        if (node.nodeValue && node.nodeValue.trim().length > 0) {
                            if (node._origViText === undefined) node._origViText = node.nodeValue;
                            const translated = translateText(node._origViText);
                            if (translated !== node.nodeValue) {
                                isTranslating = true;
                                node.nodeValue = translated;
                                isTranslating = false;
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 7. Initialization
    function init() {
        if (!isBrowser) return;
        injectLanguageSwitcher();
        setupMutationObserver();
        if (currentLang === 'en') {
            applyLanguage('en');
        }
    }

    if (isBrowser) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    // Global Public API
    if (typeof window !== 'undefined') {
        window.BDI18n = {
            getLang: () => currentLang,
            setLang: applyLanguage,
            toggle: () => applyLanguage(currentLang === 'vi' ? 'en' : 'vi'),
            t: translateText,
            walk: (el) => walkAndTranslate(el || document.body, currentLang)
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { EXACT_MAP, PHRASE_PAIRS, translateText };
    }
})();
