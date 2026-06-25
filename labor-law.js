document.addEventListener('DOMContentLoaded', () => {
    // --- Data Bases ---
    const legalRules = [
        {
            id: "probation-salary",
            title: "Lương trong thời gian thử việc",
            article: "Điều 26 Bộ luật Lao động 2019",
            category: "Thử việc",
            content: "Tiền lương của người lao động trong thời gian thử việc do hai bên thỏa thuận nhưng **ít nhất phải bằng 85%** mức lương của công việc đó."
        },
        {
            id: "probation-duration",
            title: "Thời gian thử việc tối đa",
            article: "Điều 25 Bộ luật Lao động 2019",
            category: "Thử việc",
            content: "Thời gian thử việc do hai bên thỏa thuận căn cứ vào tính chất và mức độ phức tạp của công việc nhưng chỉ được thử việc **01 lần** đối với một công việc và bảo đảm điều kiện sau:<br>• Không quá **180 ngày** đối với công việc của người quản lý doanh nghiệp.<br>• Không quá **60 ngày** đối với công việc có chức danh nghề nghiệp cần trình độ chuyên môn, kỹ thuật từ cao đẳng trở lên (hầu hết vị trí BD, Sales Executive chuyên nghiệp).<br>• Không quá **30 ngày** đối với công việc cần trình độ trung cấp, công nhân kỹ thuật.<br>• Không quá **06 ngày làm việc** đối với công việc khác."
        },
        {
            id: "annual-leave",
            title: "Quy định số ngày nghỉ phép năm",
            article: "Điều 113 Bộ luật Lao động 2019",
            category: "Thời giờ làm việc & Nghỉ ngơi",
            content: "Người lao động làm việc đủ 12 tháng cho một người sử dụng lao động thì được nghỉ hằng năm, hưởng nguyên lương theo hợp đồng lao động như sau:<br>• **12 ngày làm việc** đối với người làm công việc trong điều kiện bình thường.<br>• Cứ **đủ 05 năm làm việc** liên tục thì số ngày nghỉ hằng năm được **tăng thêm tương ứng 01 ngày** phép (nghỉ phép thâm niên)."
        },
        {
            id: "resignation-notice",
            title: "Thời hạn báo trước khi người lao động nghỉ việc",
            article: "Điều 35 Bộ luật Lao động 2019",
            category: "Nghỉ việc & Báo trước",
            content: "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động nhưng phải báo trước cho người sử dụng lao động:<br>• Ít nhất **45 ngày** đối với hợp đồng lao động không xác định thời hạn.<br>• Ít nhất **30 ngày** đối với hợp đồng lao động xác định thời hạn từ 12 đến 36 tháng.<br>• Ít nhất **03 ngày làm việc** đối với hợp đồng xác định thời hạn dưới 12 tháng.<br>• **Không cần báo trước** nếu: không được bố trí đúng công việc/địa điểm; không được trả đủ lương đúng hạn; bị ngược đãi, cưỡng bức lao động; lao động nữ mang thai phải nghỉ theo chỉ định y khoa."
        },
        {
            id: "insurance-rates",
            title: "Tỷ lệ đóng bảo hiểm bắt buộc",
            article: "Luật BHXH & BHYT",
            category: "Bảo hiểm xã hội",
            content: "Người lao động đóng tổng cộng **10.5%** lương đóng bảo hiểm hàng tháng:<br>• **BHXH (Bảo hiểm xã hội):** 8% (mức lương trần đóng tối đa bằng 20 lần lương cơ sở).<br>• **BHYT (Bảo hiểm y tế):** 1.5% (mức lương trần đóng tối đa bằng 20 lần lương cơ sở).<br>• **BHTN (Bảo hiểm thất nghiệp):** 1% (mức lương trần đóng tối đa bằng 20 lần lương tối thiểu vùng).<br><br>Người sử dụng lao động đóng **21.5%** (hoặc 22% nếu đóng quỹ tai nạn lao động bệnh nghề nghiệp)."
        },
        {
            id: "severance-pay",
            title: "Điều kiện nhận trợ cấp thôi việc",
            article: "Điều 46 Bộ luật Lao động 2019",
            category: "Trợ cấp thôi việc",
            content: "Khi hợp đồng lao động chấm dứt hợp pháp (trừ trường hợp người lao động đủ tuổi nghỉ hưu hoặc tự ý bỏ việc từ 5 ngày liên tục không lý do), doanh nghiệp có trách nhiệm trả trợ cấp thôi việc cho người lao động đã làm việc thường xuyên cho mình **từ đủ 12 tháng trở lên**:<br>• Mỗi năm làm việc được trợ cấp **nửa tháng tiền lương**.<br>• Thời gian làm việc tính trợ cấp = Tổng thời gian làm việc thực tế - Thời gian đã tham gia bảo hiểm thất nghiệp - Thời gian đã nhận trợ cấp trước đó."
        }
    ];

    const caseStudies = [
        {
            id: "case-probation-silent",
            title: "Hết 60 ngày thử việc công ty im lặng",
            desc: "Tình huống kết thúc thời gian thử việc nhưng công ty không ký hợp đồng chính thức và tiếp tục trả 85% lương.",
            category: "Thử việc",
            scenario: "Nguyễn Văn A làm thử việc vị trí Business Development (BD) từ ngày 01/03/2026. Hợp đồng thử việc ghi rõ thời hạn là 60 ngày (hết ngày 30/04/2026). Hết thời hạn này, anh A vẫn đi làm bình thường, ký kết hợp đồng cho công ty và tham gia các cuộc họp đầy đủ. Tuy nhiên, công ty im lặng, không ký hợp đồng chính thức cũng không thông báo kết quả thử việc. Đến kỳ nhận lương tháng 5, công ty vẫn chỉ trả anh A mức lương bằng 85% lương chính thức với lý do 'đang đánh giá thêm hiệu quả bán hàng'.",
            analysis: "Theo quy định tại Điều 27 Bộ luật Lao động 2019, khi kết thúc thời gian thử việc, nếu người lao động đạt yêu cầu thì người sử dụng lao động phải giao kết hợp đồng lao động ngay. Nếu công ty không có thông báo thử việc không đạt yêu cầu và anh A vẫn tiếp tục làm việc bình thường sau ngày 30/04, thì quan hệ lao động chính thức đã mặc nhiên được hình thành. Việc công ty tiếp tục trả lương thử việc 85% là vi phạm pháp luật lao động.",
            resolution: "1. Anh A cần gửi email chính thức cho phòng Nhân sự (HR) và Quản lý trực tiếp yêu cầu xác nhận kết quả thử việc và ký hợp đồng chính thức.\n2. Yêu cầu công ty hoàn trả (truy thu) 15% lương còn thiếu của tất cả những ngày làm việc từ ngày 01/05 trở đi.\n3. Nếu công ty bất ngờ cho anh A nghỉ việc vì đòi hỏi này, đó sẽ được tính là hành vi đơn phương chấm dứt hợp đồng lao động trái pháp luật của công ty, anh A có quyền yêu cầu bồi thường theo Điều 41 BLLĐ."
        },
        {
            id: "case-sudden-layoff",
            title: "Sa thải đột ngột vì sụt giảm doanh số",
            desc: "Giám đốc yêu cầu nhân viên BD nghỉ việc ngay lập tức vì lý do doanh số sụt giảm và khó khăn kinh tế.",
            category: "Nghỉ việc & Báo trước",
            scenario: "Chị B là nhân viên BD ký hợp đồng xác định thời hạn 2 năm (đến hết tháng 12/2026). Vào ngày 15/06/2026, Giám đốc gọi chị B vào phòng làm việc và yêu cầu chị bàn giao toàn bộ tài khoản bán hàng, nghỉ việc ngay từ ngày mai với lý do 'mảng khách hàng B2B gặp khó khăn, doanh số sụt giảm liên tục nên công ty phải cắt giảm nhân sự'. Công ty từ chối bồi thường và nói rằng đây là tình hình bất khả kháng nên không cần báo trước.",
            analysis: "Việc công ty đột ngột chấm dứt hợp đồng với chị B là **trái pháp luật**. Thứ nhất, 'sụt giảm doanh số' của một nhân viên hoặc mảng kinh doanh không phải lý do hợp pháp để đơn phương chấm dứt hợp đồng lao động theo Điều 36 BLLĐ. Thứ hai, đối với hợp đồng xác định thời hạn, công ty bắt buộc phải báo trước ít nhất 30 ngày. Muốn cắt giảm nhân sự do thay đổi cơ cấu hoặc lý do kinh tế lớn, công ty phải xây dựng phương án sử dụng lao động và gửi cơ quan quản lý trước 30 ngày chứ không được tự ý sa thải đột ngột.",
            resolution: "Chị B cần thực hiện các hành động sau theo Điều 41 BLLĐ:\n1. Tuyệt đối không ký vào bất kỳ đơn xin thôi việc hay biên bản thỏa thuận chấm dứt hợp đồng bất lợi nào. Yêu cầu công ty ra quyết định chấm dứt hợp đồng bằng văn bản.\n2. Yêu cầu công ty bồi thường tối thiểu: Tiền lương trong những ngày không báo trước (30 ngày lương) + 02 tháng tiền lương hợp đồng do sa thải trái luật + trợ cấp thôi việc.\n3. Nếu công ty từ chối, gửi đơn khiếu nại lên Phòng Lao động - TB&XH quận/huyện nơi công ty đặt trụ sở để tiến hành hòa giải và bảo vệ quyền lợi."
        },
        {
            id: "case-sudden-resignation",
            title: "Nhân viên tự ý nghỉ việc đột ngột",
            desc: "Nhân viên BD đột ngột nghỉ việc không báo trước đủ 45 ngày để chuyển sang công ty đối thủ cạnh tranh.",
            category: "Nghỉ việc & Báo trước",
            scenario: "Anh C đang ký hợp đồng lao động không xác định thời hạn tại công ty Y. Nhận được lời mời làm việc với mức thu nhập gấp đôi từ một đối thủ cạnh tranh, anh C lập tức gửi email xin nghỉ việc vào tối ngày 20/06/2026 và quyết định không đi làm nữa từ ngày 21/06/2026 để sang công ty mới, bỏ dở toàn bộ hồ sơ khách hàng đang đàm phán thương thảo.",
            analysis: "Theo Điều 35 BLLĐ, người lao động ký hợp đồng không xác định thời hạn có quyền nghỉ việc bất cứ lúc nào nhưng **bắt buộc phải báo trước ít nhất 45 ngày** (trừ trường hợp bị ngược đãi, không được trả lương đúng hạn...). Việc anh C nghỉ việc ngay lập tức mà không có lý do được luật cho phép là hành vi đơn phương chấm dứt hợp đồng lao động trái pháp luật.",
            resolution: "Anh C sẽ phải chịu các hình phạt tài chính nghiêm trọng theo quy định tại Điều 40 BLLĐ:\n1. Không được nhận bất kỳ khoản trợ cấp thôi việc nào từ công ty Y.\n2. Phải bồi thường cho công ty Y nửa tháng tiền lương theo hợp đồng lao động.\n3. Phải bồi thường cho công ty Y một khoản tiền tương ứng với tiền lương trong những ngày không báo trước (45 ngày lương).\n4. Phải hoàn trả toàn bộ chi phí đào tạo (nếu có) mà công ty Y đã tài trợ cho anh trước đó."
        }
    ];

    // --- DOM Elements ---
    const rulesContainer = document.getElementById('rules-container');
    const casesContainer = document.getElementById('cases-container');
    const searchInput = document.getElementById('labor-search');
    const filtersContainer = document.getElementById('labor-filters');

    // Modal Elements
    const caseModal = document.getElementById('case-modal');
    const caseCloseBtn = document.getElementById('case-close-btn');
    const btnCaseClose = document.getElementById('btn-case-close');
    const modalCaseTitle = document.getElementById('case-title');
    const modalCaseScenario = document.getElementById('case-scenario');
    const modalCaseAnalysis = document.getElementById('case-analysis');
    const modalCaseResolution = document.getElementById('case-resolution');

    // State
    let activeCategory = 'All';
    let searchQuery = '';

    // Render Legal Rules
    function renderRules() {
        rulesContainer.innerHTML = '';
        
        const filtered = legalRules.filter(r => {
            const matchesCategory = activeCategory === 'All' || activeCategory === 'Case Study' || r.category === activeCategory;
            const matchesSearch = r.title.toLowerCase().includes(searchQuery) || 
                                  r.article.toLowerCase().includes(searchQuery) ||
                                  r.content.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            rulesContainer.innerHTML = `<div class="glass-panel text-center" style="color: var(--text-muted);">Không tìm thấy quy định pháp lý nào.</div>`;
            return;
        }

        filtered.forEach(rule => {
            const card = document.createElement('div');
            card.className = 'glass-panel law-card';
            card.innerHTML = `
                <div class="law-header">
                    <div class="law-title-box">
                        <h3>${rule.title}</h3>
                        <span class="law-article-code">${rule.article}</span>
                    </div>
                    <span class="status-badge scraped" style="font-size: 0.7rem;">${rule.category}</span>
                </div>
                <div class="law-body">
                    <p>${rule.content}</p>
                </div>
            `;
            rulesContainer.appendChild(card);
        });
    }

    // Open Case Study Modal
    function openCaseModal(caseStudy) {
        modalCaseTitle.textContent = caseStudy.title;
        modalCaseScenario.innerHTML = caseStudy.scenario.replace(/\n/g, '<br>');
        modalCaseAnalysis.innerHTML = caseStudy.analysis.replace(/\n/g, '<br>');
        modalCaseResolution.innerHTML = caseStudy.resolution.replace(/\n/g, '<br>');
        caseModal.classList.remove('hidden');
    }

    function closeCaseModal() {
        caseModal.classList.add('hidden');
    }

    // Render Case Studies
    function renderCases() {
        casesContainer.innerHTML = '';
        
        const filtered = caseStudies.filter(c => {
            const matchesCategory = activeCategory === 'All' || activeCategory === 'Case Study' || c.category === activeCategory;
            const matchesSearch = c.title.toLowerCase().includes(searchQuery) || 
                                  c.desc.toLowerCase().includes(searchQuery) || 
                                  c.scenario.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            casesContainer.innerHTML = `<div class="glass-panel text-center" style="color: var(--text-muted);">Không có tình huống thực tế nào phù hợp.</div>`;
            return;
        }

        filtered.forEach(cs => {
            const card = document.createElement('div');
            card.className = 'glass-panel case-card';
            card.innerHTML = `
                <div class="case-header">
                    <h3>${cs.title}</h3>
                    <span class="status-badge guessed" style="font-size: 0.7rem;">${cs.category}</span>
                </div>
                <p class="case-card-desc">${cs.desc}</p>
                <div class="case-card-footer">
                    <span class="resolve-badge">💡 Xem hướng dẫn giải quyết &rarr;</span>
                </div>
            `;
            card.addEventListener('click', () => openCaseModal(cs));
            casesContainer.appendChild(card);
        });
    }

    // Update both sections
    function renderDashboard() {
        renderRules();
        renderCases();
    }

    // --- Event Listeners ---

    // Filter pills click
    filtersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-pill');
        if (!btn) return;

        filtersContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');

        activeCategory = btn.getAttribute('data-category');
        renderDashboard();
    });

    // Search bar input
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase().trim();
        renderDashboard();
    });

    // Modal close events
    caseCloseBtn.addEventListener('click', closeCaseModal);
    btnCaseClose.addEventListener('click', closeCaseModal);
    caseModal.addEventListener('click', (e) => {
        if (e.target === caseModal) closeCaseModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !caseModal.classList.contains('hidden')) {
            closeCaseModal();
        }
    });

    // Initialize Dashboard
    renderDashboard();
});
