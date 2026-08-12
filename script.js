const initB2BApp = () => {
    // Smooth scroll for nav link anchor on the same page
    const b2bChallengeLink = document.querySelector('nav.nav-links a[href*="#minigame-section"]');
    if (b2bChallengeLink) {
        b2bChallengeLink.addEventListener('click', (e) => {
            const currentPath = window.location.pathname;
            if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '' || currentPath.endsWith('/')) {
                const target = document.getElementById('minigame-section');
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Update URL hash without reload
                    history.pushState(null, null, '#minigame-section');
                }
            }
        });
    }

    const questsLink = document.querySelector('nav.nav-links a[href*="#quests-section"]');
    if (questsLink) {
        questsLink.addEventListener('click', (e) => {
            const currentPath = window.location.pathname;
            if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '' || currentPath.endsWith('/')) {
                const target = document.getElementById('quests-section');
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Update URL hash without reload
                    history.pushState(null, null, '#quests-section');
                }
            }
        });
    }

    const homeLinks = document.querySelectorAll('nav.nav-links a[href="index.html"]');
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const currentPath = window.location.pathname;
            if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '' || currentPath.endsWith('/')) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                history.pushState(null, null, ' ');
            }
        });
    });

    // Reveal animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation starting state to all cards and matrix
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    const matrix = document.querySelector('.summary');
    if (matrix) {
        matrix.style.opacity = 0;
        matrix.style.transform = 'translateY(30px)';
        matrix.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(matrix);
    }

    // Add keyboard support for accessibility on flip cards
    cards.forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('flipped');
            }
        });
        
        // Touch support for mobile devices
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // Minigame Logic
    let audioCtx = null;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('AudioContext not supported or blocked:', e);
    }

    function playTone(freq, type, duration, vol) {
        if (!audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('Failed to play tone:', e);
        }
    }

    const sfx = {
        correct: () => { playTone(600, 'sine', 0.1, 0.1); setTimeout(() => playTone(800, 'sine', 0.2, 0.1), 100); },
        wrong: () => { playTone(300, 'sawtooth', 0.15, 0.1); setTimeout(() => playTone(200, 'sawtooth', 0.25, 0.1), 150); },
        win: () => { playTone(400, 'square', 0.1, 0.1); setTimeout(() => playTone(500, 'square', 0.1, 0.1), 100); setTimeout(() => playTone(600, 'square', 0.1, 0.1), 200); setTimeout(() => playTone(800, 'square', 0.4, 0.1), 300); },
        lose: () => { playTone(300, 'square', 0.2, 0.1); setTimeout(() => playTone(250, 'square', 0.2, 0.1), 200); setTimeout(() => playTone(200, 'square', 0.4, 0.1), 400); },
        tick: () => { playTone(1000, 'sine', 0.05, 0.05); }
    };

    const games = [
        // LEVEL 1: Dưới 1 Năm (Tân Binh)
        {
            id: "game-zip",
            title: "Thử Thách: B2B Zip (Sales Path)",
            description: "Kết nối đường ống bán hàng từ Leads đến Closed Won theo đúng thứ tự logic.",
            type: "puzzle_zip",
            icon: "🔗",
            level: 1,
            questions: [
                {
                    context: "Kết nối đường dẫn từ điểm khởi đầu (Leads Generated) đến điểm kết thúc (Deal Closed Won) theo đúng trình tự.",
                    options: []
                }
            ],
            getResult: (score) => {
                return { sfx: 'win', title: "Khai Thông Đường Ống! 🔗", color: "var(--primary)", text: "Tuyệt vời! Bạn đã kết nối thành công quy trình bán hàng chuẩn xác không một vết gợn." };
            }
        },
        {
            id: "game-suitability",
            title: "Thử Thách 1.1: Nhảy qua làm BD có dễ ko ta?",
            description: "Đánh giá mức độ phù hợp về tố chất bản thân (chịu áp lực, khả năng research, chủ động) với nghề BD.",
            type: "suitability_scoring",
            icon: "🧗",
            level: 1,
            questions: [
                {
                    context: "Khi gặp một dự án B2B hoàn toàn mới mà bạn chưa từng nghe tên ngành đó bao giờ, phản xạ đầu tiên của bạn là gì?",
                    options: [
                        { text: "Chờ người hướng dẫn hoặc sếp giao tài liệu nghiên cứu sẵn.", points: 0, feedback: "Thiếu tính chủ động! BD cần tự lực tìm kiếm thông tin ban đầu." },
                        { text: "Lên Google, đọc nhanh 3-5 bài viết tổng quan về chuỗi giá trị và thuật ngữ cốt lõi của ngành đó.", points: 2, feedback: "Chính xác! Kỹ năng research độc lập là vũ khí hàng đầu của BD." },
                        { text: "Báo cáo sếp là ngành này quá lạ, không làm được.", points: 0, feedback: "Chưa thử sức đã bỏ cuộc sẽ giới hạn cơ hội phát triển." }
                    ]
                },
                {
                    context: "Khách hàng từ chối cuộc hẹn và nói thẳng: 'Không có nhu cầu'. Cảm xúc của bạn lúc này thế nào?",
                    options: [
                        { text: "Cảm thấy nản lòng, nghi ngờ bản thân và không muốn gọi lead tiếp theo.", points: 0, feedback: "Nghề BD đối diện với hàng chục lời từ chối mỗi ngày, cần rèn luyện tâm lý thép." },
                        { text: "Bình thản đón nhận. Ghi chú lại lý do từ chối và tiếp tục gọi lead kế tiếp.", points: 2, feedback: "Chuyên nghiệp! Cần coi từ chối là xác suất bình thường của phễu bán hàng." },
                        { text: "Tức giận tranh cãi lý lẽ với khách hàng.", points: 0, feedback: "Hành động phi chuyên nghiệp, hủy hoại uy tín cá nhân và công ty." }
                    ]
                },
                {
                    context: "Bạn chuẩn bị tiếp cận một sếp lớn (C-level). Bạn dành bao nhiêu thời gian để tìm hiểu về họ?",
                    options: [
                        { text: "Không cần, cứ gọi đại rồi tùy cơ ứng biến.", points: 0, feedback: "Chuẩn bị sơ sài là chuẩn bị cho sự thất bại khi tiếp cận C-level." },
                        { text: "Dành 10-15 phút đọc LinkedIn, website doanh nghiệp để cá nhân hóa lý do kết nối.", points: 2, feedback: "Rất tốt! Cá nhân hóa sâu giúp tăng tỷ lệ phản hồi lên gấp 3 lần." },
                        { text: "Dành cả ngày trời nghiên cứu chi tiết lịch sử từ nhỏ của họ.", points: 1, feedback: "Quá mức cần thiết, gây lãng phí thời gian vận hành phễu." }
                    ]
                }
            ],
            getResult: (points) => {
                if (points >= 5) {
                    return { sfx: 'win', title: "Nên theo BD (Tố chất cao) 🔥", color: "var(--primary)", text: `Bạn đạt ${points}/6 điểm. Bạn có đầy đủ tố chất cần thiết để thành công trong nghề BD: chịu được áp lực, chủ động, kiên trì và ham học hỏi. Hãy bắt đầu chiến đấu ngay thôi!` };
                } else if (points >= 3) {
                    return { sfx: 'correct', title: "Cần Trau Dồi Thêm (Tiềm năng) 📊", color: "var(--text-main)", text: `Bạn đạt ${points}/6 điểm. Bạn có tiềm năng nhưng cần rèn luyện thêm tính chủ động và khả năng chịu áp lực từ chối. Hãy thử tập research và gửi đề xuất hàng tuần nhé.` };
                } else {
                    return { sfx: 'lose', title: "Hợp Sales Hoặc Account Hơn 😅", color: "var(--danger)", text: `Bạn đạt ${points}/6 điểm. Nghề BD đòi hỏi tinh thần tự trị, tự tìm cơ hội và khả năng kiên trì trước hàng trăm lời từ chối. Bạn có thể sẽ tỏa sáng hơn ở các vai trò chăm sóc khách hàng (Account) hoặc Sales vận hành.` };
                }
            }
        },
        {
            id: "game-gatekeeper",
            title: "Thử Thách 1.2: Vượt Ải Gatekeeper",
            description: "Kỹ thuật giao tiếp khôn khéo để vượt qua bộ lọc lễ tân/thư ký và kết nối sếp lớn.",
            type: "scenario_challenge",
            icon: "🚪",
            level: 1,
            questions: [
                {
                    context: "Lễ tân nói: 'Anh/chị gửi thông tin qua email chung nhé'. Bạn phản xạ thế nào?",
                    options: [
                        { text: "Dạ vâng ạ, email là gì để em gửi.", isCorrect: false, feedback: "Thất bại! Gửi mail chung 99% sẽ rơi vào hòm thư rác hoặc bị phớt lờ." },
                        { text: "Em cần gặp sếp trực tiếp, email không giải quyết được.", isCorrect: false, feedback: "Thái độ trịch thượng sẽ khiến lễ tân cúp máy ngay lập tức." },
                        { text: "Dạ em có tài liệu mật thiết thiết kế riêng cho dự án X của sếp. Nhờ chị báo giúp có bên Y gửi...", isCorrect: true, feedback: "Chuyên nghiệp! Đưa ra lý do nghiệp vụ đặc thù để tạo tính khẩn cấp và giá trị." }
                    ]
                },
                {
                    context: "Lễ tân hỏi: 'Bên mình gọi có việc gì thế?' Bạn trả lời ra sao?",
                    options: [
                        { text: "Em muốn chào bán dịch vụ quảng cáo giá rẻ.", isCorrect: false, feedback: "Thất bại ngay lập tức! Bạn vừa tự gắn nhãn 'Spammer/Telesale'." },
                        { text: "Dạ em liên hệ từ công ty X liên quan đến việc tối ưu vận hành khâu Y mà sếp đang chỉ đạo...", isCorrect: true, feedback: "Tuyệt vời! Cách nói này cho thấy cuộc gọi mang tính nghiệp vụ quan trọng chứ không phải chào hàng." },
                        { text: "Hỏi để làm gì thế em?", isCorrect: false, feedback: "Cách nói thô lỗ sẽ khiến bạn bị đưa vào danh sách chặn số vĩnh viễn." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Bất Bại Vượt Ải Lễ Tân! 🚪", color: "var(--primary)", text: "Kỹ năng giao tiếp và lách rào cản của bạn quá xuất sắc! Bạn biến Gatekeeper thành đồng minh một cách tự nhiên." };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Vượt Ải Thành Công! 🗝️", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Cần tự tin và lịch sự hơn nữa để tạo lòng tin nhanh chóng.` };
                } else {
                    return { sfx: 'lose', title: "Bị Chặn Rất Tiếc! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Đừng chào hàng trực tiếp với lễ tân, hãy nói về lý do nghiệp vụ hợp lệ.` };
                }
            }
        },
        {
            id: "game-email",
            title: "Thử Thách 1.3: Nghệ Thuật Viết Cold Email",
            description: "Tối ưu tỷ lệ mở và phản hồi email tiếp cận đối tác với các cấu trúc chuẩn chuyên gia.",
            type: "scenario_challenge",
            icon: "✉️",
            level: 1,
            questions: [
                {
                    context: "Tiêu đề (Subject Line) nào dưới đây sẽ đạt tỷ lệ mở (Open Rate) cao nhất?",
                    options: [
                        { text: "THƯ CHÀO HÀNG DỊCH VỤ MARKETING B2B CỦA CÔNG TY X", isCorrect: false, feedback: "Quá giống thư rác! Tiêu đề viết hoa toàn bộ và chứa chữ 'Chào hàng' sẽ bị bỏ qua." },
                        { text: "Hợp tác tối ưu chi phí logistics khâu vận chuyển - [Tên Công Ty Đối Tác]", isCorrect: true, feedback: "Rất tốt! Rõ ràng, cá nhân hóa và tập trung trực tiếp vào giá trị/pain point của họ." },
                        { text: "Xin chào anh, có cơ hội hợp tác làm ăn này rất hay", isCorrect: false, feedback: "Mơ hồ, thiếu chuyên nghiệp và không tạo được sự tin cậy ban đầu." }
                    ]
                },
                {
                    context: "Lời kêu gọi hành động (Call to Action - CTA) nào ở cuối email là thông minh nhất?",
                    options: [
                        { text: "Anh chị mua sản phẩm thì chuyển khoản cho em nhé.", isCorrect: false, feedback: "Quá vội vàng! Không ai mua hàng B2B ngay từ email đầu tiên." },
                        { text: "Em có thể xin anh 10 phút thảo luận nhanh qua phone vào 9h sáng thứ Năm này không?", isCorrect: true, feedback: "Tuyệt vời! CTA có rào cản thấp (chỉ 10 phút) và thời gian cụ thể dễ phản hồi." },
                        { text: "Em xin phép gửi anh đề xuất sơ bộ dài 50 trang để anh đọc trước.", isCorrect: false, feedback: "Quá nặng nề! Khách hàng bận rộn sẽ từ chối đọc tài liệu quá dài." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Master Cold Email! ✉️", color: "var(--primary)", text: "Email của bạn viết cực kỳ cuốn hút, cá nhân hóa tốt và tập trung vào giá trị thực tế. Tỷ lệ mở và phản hồi chắc chắn sẽ rất cao!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Email Khá Ổn! 📝", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy chú ý tối ưu hóa tiêu đề ngắn gọn và CTA cụ thể hơn.` };
                } else {
                    return { sfx: 'lose', title: "Cần Viết Lại! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Tránh viết email dài dòng chào bán dịch vụ ngay lập tức. Hãy tập trung vào nỗi đau của họ.` };
                }
            }
        },
        {
            id: "game-prospecting",
            title: "Thử Thách 1.4: Tìm Kiếm & Lọc Lead B2B",
            description: "Thực hành phương pháp định vị và phân loại khách hàng mục tiêu để tối ưu phễu.",
            type: "scenario_challenge",
            icon: "🔍",
            level: 1,
            questions: [
                {
                    context: "Bạn cần tiếp cận đại diện phòng mua hàng tại một tập đoàn bán lẻ. Kênh nào là nơi định vị PIC chuẩn xác nhất?",
                    options: [
                        { text: "Tìm kiếm từ khóa 'Trưởng phòng mua hàng [Tên Tập Đoàn]' trên LinkedIn.", isCorrect: true, feedback: "Chính xác! LinkedIn là công cụ tìm kiếm nhân sự B2B chuyên nghiệp nhất hiện nay." },
                        { text: "Lên Group Facebook hỏi xin thông tin lung tung.", isCorrect: false, feedback: "Dễ nhận được thông tin cũ, thiếu chính xác và kém bảo mật." },
                        { text: "Đứng canh trước cổng công ty chờ sếp đi ra.", isCorrect: false, feedback: "Quá mất thời gian và thiếu tính chuyên nghiệp." }
                    ]
                },
                {
                    context: "Bạn thu thập được 100 Lead tiềm năng. Bạn nên xử lý như thế nào trước khi chạy chiến dịch outreach?",
                    options: [
                        { text: "Cắm đầu gửi mail hàng loạt bằng tính năng gửi chung CC.", isCorrect: false, feedback: "Hủy deal hàng loạt! CC lộ thông tin đối tác, email dễ rơi vào mục spam." },
                        { text: "Phân nhóm theo ngành hàng/quy mô để tùy biến thông điệp chào giải pháp phù hợp...", isCorrect: true, feedback: "Chính xác! Phân nhóm giúp nâng cao chất lượng cá nhân hóa nội dung." },
                        { text: "Nhờ bộ phận Telesale gọi điện chào giá ngay lập tức.", isCorrect: false, feedback: "Gây phiền nhiễu cho khách hàng khi chưa thẩm định kỹ nhu cầu của họ." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Chuyên Gia Định Vị Lead! 🎯", color: "var(--primary)", text: "Bạn nắm rất rõ cách định vị đúng người đưa ra quyết định tại doanh nghiệp mục tiêu!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Kỹ Năng Lọc Khá! 🔍", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy sử dụng thêm các công cụ định vị PIC tự động.` };
                } else {
                    return { sfx: 'lose', title: "Cần Trau Dồi Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy tìm đọc kỹ sách về ICP (Ideal Customer Profile) và phễu B2B.` };
                }
            }
        },
        {
            id: "game-outreach",
            title: "Thử Thách 1.5: Phone & Zalo Outreach",
            description: "Thực hành bẻ lái phản xạ giao tiếp ban đầu qua điện thoại và nhắn tin tiếp cận đối tác.",
            type: "scenario_challenge",
            icon: "📞",
            level: 1,
            questions: [
                {
                    context: "Khi khách hàng nghe máy cuộc gọi lạnh và nói: 'Bên anh không có nhu cầu nhé em'. Bạn ứng phó thế nào?",
                    options: [
                        { text: "Dạ em cảm ơn anh rồi tắt máy.", isCorrect: false, feedback: "Bỏ cuộc quá dễ dàng khi chưa bóc tách lý do từ chối." },
                        { text: "Dạ em hiểu. Thực ra em gọi không phải để bán hàng ngay, mà muốn chia sẻ cách bên X tối ưu 15% khâu Y. Em nhắn Zalo thông tin ngắn gọn nhé?", isCorrect: true, feedback: "Chính xác! Giảm áp lực mua bán, chuyển hướng sang chia sẻ giá trị và xin kênh kết nối Zalo." },
                        { text: "Sao anh chưa biết sản phẩm thế nào mà đã kêu không có nhu cầu ạ?", isCorrect: false, feedback: "Hỏi chất vấn đối đầu sẽ khiến khách hàng cúp máy ngay lập tức." }
                    ]
                },
                {
                    context: "Khách hàng nói: 'Anh đang bận họp'. Bạn phản xạ nhanh ra sao?",
                    options: [
                        { text: "Anh họp xong lúc mấy giờ để em gọi lại ạ?", isCorrect: false, feedback: "Hỏi dồn dập tạo cảm giác bị làm phiền và ép buộc thời gian." },
                        { text: "Dạ em hiểu. Em xin phép kết nối Zalo nhắn nhanh thông tin chính, hoặc em gọi lại anh vào 2h chiều nay nhé?", isCorrect: true, feedback: "Chuyên gia! Lịch sự đồng cảm, đồng thời đưa ra 2 lựa chọn thông minh để chốt lịch hẹn." },
                        { text: "Dạ em xin lỗi ạ rồi cúp máy luôn không hẹn lại.", isCorrect: false, feedback: "Bỏ lỡ cơ hội thiết lập cuộc gọi tiếp theo." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Chiến Thần Cold-Call! 📞", color: "var(--primary)", text: "Phản xạ giao tiếp tiếp cận của bạn rất khéo léo, tự tin và hướng đến giá trị!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Giao Tiếp Khá Tốt! 🗣️", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy chú ý giữ tông giọng trầm ấm và nhịp điệu vừa phải khi gọi điện.` };
                } else {
                    return { sfx: 'lose', title: "Cần Thực Hành Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy ghi hình thử các kịch bản gọi điện để tự điều chỉnh phản xạ.` };
                }
            }
        },
        {
            id: "game-networking",
            title: "Thử Thách 1.6: Kỹ Năng Giao Tiếp Networking",
            description: "Thực hành giới thiệu Elevator Pitch và kết nối hiệu quả với các đối tác tiềm năng tại hội thảo B2B.",
            type: "scenario_challenge",
            icon: "🤝",
            level: 1,
            questions: [
                {
                    context: "Để giới thiệu nhanh bản thân (Elevator Pitch) tại một hội thảo B2B trong 30 giây, cấu trúc nào ấn tượng nhất?",
                    options: [
                        { text: "Nói chi tiết lịch sử 10 năm của công ty và mọi danh mục dịch vụ đang có.", isCorrect: false, feedback: "Quá dài dòng! Người nghe sẽ nhanh chóng quên đi thông điệp chính." },
                        { text: "Nêu rõ đối tượng hỗ trợ, vấn đề cốt lõi giúp giải quyết, kết quả đo lường được và đặt câu hỏi gợi mở...", isCorrect: true, feedback: "Chính xác! Đi thẳng vào giá trị thực tế mang lại cho đối tác tiềm năng." },
                        { text: "Hỏi xin số điện thoại và mời họ đi nhậu ngay lập tức.", isCorrect: false, feedback: "Quá vồ vập, thiếu chuyên nghiệp khi vừa mới gặp mặt." }
                    ]
                },
                {
                    context: "Sau khi xin được danh thiếp của đối tác tiềm năng tại sự kiện, bạn nên follow-up khi nào?",
                    options: [
                        { text: "Đợi 1 tuần sau rồi mới gửi email kết nối.", isCorrect: false, feedback: "Quá muộn! Đối tác bận rộn sẽ quên mất bạn là ai." },
                        { text: "Gửi email kết nối cá nhân hóa trong vòng 24 giờ, nhắc lại câu chuyện thú vị đã thảo luận...", isCorrect: true, feedback: "Chuyên gia! Tận dụng thời điểm mối liên hệ còn ấm để thiết lập lịch hẹn tiếp theo." },
                        { text: "Nhắn tin chào giá bán sản phẩm ngay lập tức vào tối hôm đó.", isCorrect: false, feedback: "Tạo cảm giác bị săn đuổi bán hàng, dễ bị chặn số." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Chiến Thần Networking! 🏆", color: "var(--primary)", text: "Bạn kết nối và giao tiếp tại sự kiện vô cùng tự tin, định vị thương hiệu cá nhân cực tốt!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Kết Nối Khá Tốt! 🗣️", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy tập luyện thêm kịch bản Elevator Pitch ngắn gọn hơn nhé.` };
                } else {
                    return { sfx: 'lose', title: "Còn Ngượng Ngùng! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy nhớ: Networking là để lắng nghe và tìm điểm chung, không phải để ép bán hàng.` };
                }
            }
        },
        {
            id: "game-linkedin-tools",
            title: "Thử Thách 1.7: Sử Dụng LinkedIn Tìm Lead",
            description: "Thực hành kỹ năng tối ưu profile cá nhân và sử dụng bộ lọc tìm kiếm để định vị đúng Person-in-Charge.",
            type: "scenario_challenge",
            icon: "💼",
            level: 1,
            questions: [
                {
                    context: "Tiêu đề (Headline) nào trên LinkedIn cá nhân giúp BD thu hút lead inbound tốt nhất?",
                    options: [
                        { text: "Nhân viên kinh doanh tại Công ty X - Liên hệ mua hàng ngay.", isCorrect: false, feedback: "Quá thực dụng! Khách hàng sẽ đề phòng vì sợ bị chèo kéo." },
                        { text: "Hỗ trợ các Doanh nghiệp bán lẻ tối ưu 20% chi phí Logistics khâu vận hành vận chuyển | BD Manager tại Y...", isCorrect: true, feedback: "Rất tốt! Định vị rõ giá trị mang lại cho tệp đối tượng mục tiêu cụ thể." },
                        { text: "Chuyên gia bán hàng B2B số 1 Việt Nam.", isCorrect: false, feedback: "Tự phong quá mức, thiếu uy tín thực tế đối với đối tác chuyên nghiệp." }
                    ]
                },
                {
                    context: "Để tìm chính xác Giám Đốc Mua Hàng của các công ty Logistics tại Việt Nam bằng Boolean Search, chuỗi nào chuẩn nhất?",
                    options: [
                        { text: "Vietnam Logistics Giám Đốc Mua Hàng", isCorrect: false, feedback: "Thiếu chính xác, thuật toán LinkedIn sẽ trả về kết quả nhiễu." },
                        { text: "(\"Purchasing Director\" OR \"Head of Procurement\") AND \"Logistics\" AND \"Vietnam\"", isCorrect: true, feedback: "Chính xác! Chuỗi Boolean chuẩn giúp lọc sạch danh sách người quyết định thực tế." },
                        { text: "Logistics * Mua hàng * Việt Nam", isCorrect: false, feedback: "Cú pháp sai quy tắc Boolean tìm kiếm cơ bản." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Master Tìm Lead LinkedIn! 💼", color: "var(--primary)", text: "Bạn làm chủ hoàn toàn các bộ lọc định vị và xây dựng thương hiệu cá nhân trên mạng xã hội B2B lớn nhất!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Kỹ Năng Lọc Khá! 🔍", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Nên thực hành viết thêm chuỗi Boolean kết hợp nhiều điều kiện.` };
                } else {
                    return { sfx: 'lose', title: "Tìm Lead Thủ Công! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy học kỹ lại các thuật toán tìm kiếm nâng cao của LinkedIn để nâng tầm BD nhé.` };
                }
            }
        },

        // LEVEL 2: Từ 1 - 3 Năm (Chiến Binh)
        {
            id: "game-wend",
            title: "Thử Thách: B2B Wend (Word Search)",
            description: "Tìm kiếm các từ khóa B2B cốt lõi ẩn giấu trong mê cung ký tự.",
            type: "puzzle_wend",
            icon: "🔍",
            level: 2,
            questions: [
                {
                    context: "Tìm đủ 3 từ khóa B2B trong bảng chữ cái: LEAD, DEAL, SPIN.",
                    options: []
                }
            ],
            getResult: (score) => {
                return { sfx: 'win', title: "Tinh Mắt Chiến Thần! 🔍", color: "var(--primary)", text: "Xuất sắc! Bạn đã tìm ra toàn bộ các thuật ngữ B2B cốt lõi trong mê cung chữ cái." };
            }
        },
        {
            id: "game-tango",
            title: "Thử Thách: B2B Tango (Reasoning Grid)",
            description: "Điền các trạng thái 🤝 (Closed) và ❌ (Lost) vào lưới thỏa mãn các quy tắc logic B2B.",
            type: "puzzle_tango",
            icon: "🤝",
            level: 2,
            questions: [
                {
                    context: "Điền lưới sao cho mỗi hàng & cột có đúng hai 🤝 và hai ❌, không có 3 biểu tượng giống nhau đứng cạnh nhau.",
                    options: []
                }
            ],
            getResult: (score) => {
                return { sfx: 'win', title: "Trí Tuệ B2B Tango! 🤝", color: "var(--primary)", text: "Chính xác! Bạn đã hoàn thành sơ đồ phân bổ trạng thái deal hoàn hảo." };
            }
        },
        {
            id: "game-expert",
            title: "Thử Thách 2.1: Bạn là Tân Binh hay Chuyên Gia?",
            description: "Cùng đánh giá phản xạ giao tiếp và xử lý tình huống thực tế của BD khi đàm phán thương lượng.",
            type: "scenario_challenge",
            icon: "🧠",
            level: 2,
            questions: [
                {
                    context: "Khách hàng so sánh giá của bạn với đối thủ rẻ hơn. Bạn sẽ chọn nói gì?",
                    options: [
                        { text: "Bên em giá rẻ nhất thị trường.", isCorrect: false, feedback: "Nghiệp dư! Cụm từ 'Rẻ nhất' sẽ kích hoạt sự nghi ngờ về chi phí ẩn hoặc hậu mãi kém!" },
                        { text: "Tiền nào của nấy anh/chị ơi.", isCorrect: false, feedback: "Nghiệp dư! Cách nói này có phần ngạo mạn và thiếu sự đồng cảm chuyên nghiệp." },
                        { text: "Bên em có mức giá tối ưu / phù hợp nhất.", isCorrect: true, feedback: "Chuyên gia! Cho thấy bạn đang giải bài toán tài chính chứ không đơn thuần phá giá." }
                    ]
                },
                {
                    context: "Đối diện với một bài toán khó mà khách hàng đưa ra, bạn (vai trò BD) sẽ trả lời:",
                    options: [
                        { text: "Cái này khó quá, chắc không làm được đâu ạ.", isCorrect: false, feedback: "Nghiệp dư! Bạn đã bỏ cuộc quá sớm, đánh mất vị thế chuyên gia." },
                        { text: "Em sẽ tìm kiếm phương án tốt nhất cho anh/chị.", isCorrect: true, feedback: "Chuyên gia! Chuẩn xác, bạn đang khẳng định trách nhiệm tuyệt đối đối với kết quả." },
                        { text: "Chắc chắn 100% bên em làm được!", isCorrect: false, feedback: "Nghiệp dư! Hứa hẹn quá lời khi chưa có giải pháp rõ ràng là rủi ro cực lớn." }
                    ]
                },
                {
                    context: "Khi khách hàng cần bằng chứng chứng minh bạn có thể làm được:",
                    options: [
                        { text: "Em nghĩ là sản phẩm sẽ giải quyết được...", isCorrect: false, feedback: "Nghiệp dư! Nhấn mạnh 'Em nghĩ là' mang tính cảm tính, thiếu sức nặng." },
                        { text: "Tin em đi, em không lừa anh/chị đâu.", isCorrect: false, feedback: "Nghiệp dư! Đừng ép buộc lòng tin một cách vô căn cứ trong B2B." },
                        { text: "Dựa trên dữ liệu và case study triển khai...", isCorrect: true, feedback: "Chuyên gia! Tuyệt vời. Con số và thực tế là 'vua' khi thuyết phục." }
                    ]
                },
                {
                    context: "Khách hàng hỏi về một tính năng mà sản phẩm của bạn CHƯA CÓ:",
                    options: [
                        { text: "Thực ra thì bên em KHÔNG có tính năng đó.", isCorrect: false, feedback: "Nghiệp dư! Bạn vừa dập tắt sự hào hứng của khách bằng điểm mù (sự thiếu hụt)." },
                        { text: "Hiện tại bên em đang TẬP TRUNG mạnh vào...", isCorrect: true, feedback: "Chuyên gia! Thông minh, bạn đã điều hướng sự chú ý thành cơ hội trình bày điểm cốt lõi mạnh mẽ." },
                        { text: "Sắp tới bên em sẽ làm tính năng đó (dù chưa có plan).", isCorrect: false, feedback: "Nghiệp dư! Nói dối để giữ khách là con dao hai lưỡi rủi ro cực cao." }
                    ]
                },
                {
                    context: "Cuộc họp sắp kết thúc, bạn muốn chốt bước tiếp theo:",
                    options: [
                        { text: "Dạ vậy anh/chị cứ cân nhắc đi ạ.", isCorrect: false, feedback: "Kẻ sát nhân của mọi deal! Đừng tạo ra khoảng trống làm nguội lạnh mối quan hệ." },
                        { text: "Khi nào quyết định thì gọi em nhé.", isCorrect: false, feedback: "Nghiệp dư! Sự bị động sẽ khiến bạn rớt deal vào tay đối thủ nhanh chóng." },
                        { text: "Bước tiếp theo chúng ta sẽ tiến hành...", isCorrect: true, feedback: "Chuyên gia! Chính xác. Hãy luôn chủ động dẫn dắt cuộc chơi và đưa ra lộ trình." }
                    ]
                },
                {
                    context: "Khách hàng nói: 'Bên anh quy mô nhỏ lắm, chắc chưa dùng được'. Bạn phản hồi sao?",
                    options: [
                        { text: "Dạ quy mô nào cũng dùng được anh ơi.", isCorrect: false, feedback: "Nghiệp dư! Cách trả lời hời hợt, chưa giải quyết được tâm lý phòng thủ." },
                        { text: "Dạ thế khi nào lớn gọi em nhé.", isCorrect: false, feedback: "BD chạy bằng cơm! Bạn vừa vứt đi một khách hàng tiềm năng tương lai." },
                        { text: "Bên em có nhiều khách hàng quy mô giống anh, họ đã tối ưu được 30% chi phí vận hành...", isCorrect: true, feedback: "Chuyên gia! Đưa ra minh chứng tương tự giúp khách hàng tự tin đưa ra quyết định." }
                    ]
                },
                {
                    context: "Khi gửi Proposal (Đề xuất) qua Email, bạn nên làm gì để tăng tỷ lệ phản hồi?",
                    options: [
                        { text: "Đính kèm file PDF nặng 20MB và không viết gì thêm.", isCorrect: false, feedback: "Thư rác 100%! Rất dễ rơi vào bộ lọc spam." },
                        { text: "Gửi liên tục 5 email nhắc nhở mỗi ngày.", isCorrect: false, feedback: "Hành động spam thô thiển làm khách hàng block bạn vĩnh viễn." },
                        { text: "Tóm tắt 3 giá trị cốt lõi trong Email và đề xuất một cuộc gọi 10 phút để giải thích chi tiết...", isCorrect: true, feedback: "Tuyệt vời! B2B bận rộn cần sự ngắn gọn, rõ ràng giá trị và Call to action cụ thể." }
                    ]
                },
                {
                    context: "Khách hàng Enterprise yêu cầu thời gian dùng thử (POC) kéo dài 6 tháng. Bạn đàm phán thế nào?",
                    options: [
                        { text: "Đồng ý ngay để làm hài lòng khách hàng.", isCorrect: false, feedback: "Sai lầm! POC quá dài làm lãng phí tài nguyên hỗ trợ kỹ thuật mà không chốt được deal." },
                        { text: "Từ chối thẳng thừng và yêu cầu mua ngay.", isCorrect: false, feedback: "Cứng nhắc! Làm đứt mạch đàm phán." },
                        { text: "Đề xuất thời gian dùng thử 2-4 tuần với các tiêu chí nghiệm thu (success criteria) rõ ràng...", isCorrect: true, feedback: "Chuyên gia! Đóng khung thời gian và tiêu chí thành công giúp thúc đẩy tiến độ ký hợp đồng." }
                    ]
                },
                {
                    context: "Khi gặp tình huống 'Champion' (người ủng hộ bạn) trong công ty khách hàng bị chuyển công tác:",
                    options: [
                        { text: "Dừng theo đuổi deal vì mất liên lạc.", isCorrect: false, feedback: "Bỏ cuộc quá sớm! Bạn đang bỏ lỡ deal đã dày công nuôi dưỡng." },
                        { text: "Tiếp tục gửi email cho hòm thư cũ.", isCorrect: false, feedback: "Vô ích!" },
                        { text: "Nhờ Champion giới thiệu người thay thế và thiết lập mối quan hệ với Quyết định định đoạt (Decision Maker) mới...", isCorrect: true, feedback: "Chuyên gia! Kế thừa mối quan hệ và tiếp cận người tiếp quản nhanh chóng." }
                    ]
                },
                {
                    context: "Đối thủ cạnh tranh tung tin đồn ác ý về sản phẩm của bạn. Phản ứng của bạn là gì?",
                    options: [
                        { text: "Nói xấu lại đối thủ gấp đôi.", isCorrect: false, feedback: "Thiếu chuyên nghiệp! Khách hàng sẽ đánh giá thấp cả hai bên." },
                        { text: "Im lặng và chấp nhận mất khách hàng.", isCorrect: false, feedback: "Bị động và yếu thế!" },
                        { text: "Tập trung chứng minh năng lực bằng dữ liệu thực tế và các chứng chỉ bảo mật độc lập...", isCorrect: true, feedback: "Chuẩn chuyên gia! Dữ liệu khách quan là lá chắn thép đập tan tin đồn." }
                    ]
                },
                {
                    context: "Lần đầu gặp gỡ khách hàng B2B, mục tiêu lớn nhất của bạn là gì?",
                    options: [
                        { text: "Bán được hàng ngay lập tức.", isCorrect: false, feedback: "Quá vội vàng! Giao dịch B2B cần chu kỳ dài và xây dựng niềm tin." },
                        { text: "Giới thiệu toàn bộ tính năng sản phẩm từ A đến Z.", isCorrect: false, feedback: "Quá tải thông tin! Khách hàng không muốn nghe bạn thuyết trình lý thuyết." },
                        { text: "Lắng nghe để hiểu rõ quy trình vận hành và xác định các Pain Point thực sự của họ...", isCorrect: true, feedback: "Chính xác! Hiểu nỗi đau trước khi bán thuốc là cốt lõi của Solution Selling." }
                    ]
                },
                {
                    context: "Khi đàm phán hợp đồng, khách hàng đòi giảm giá thêm 5% vào phút chót. Bạn phản ứng thế nào?",
                    options: [
                        { text: "Dạ đồng ý ngay để ký hợp đồng.", isCorrect: false, feedback: "Yếu thế! Khách hàng sẽ nghĩ họ bị hớ và tiếp tục đòi giảm giá lần sau." },
                        { text: "Từ chối và dọa hủy bỏ thỏa thuận.", isCorrect: false, feedback: "Dễ làm gãy deal vào phút chót." },
                        { text: "Đề xuất giảm giá đi kèm với điều kiện thanh toán trước 100% hoặc kéo dài thời hạn hợp đồng...", isCorrect: true, feedback: "Chuyên gia! Nguyên tắc vàng trong đàm phán: Không bao giờ cho đi cái gì mà không nhận lại (Give and Take)." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 12) {
                    return { sfx: 'win', title: "Xuất Sắc! BD Khó Có Peter Lo 💪", color: "var(--primary)", text: "Tuyệt vời, bạn phản ứng rất bén! Bạn đã hoàn toàn làm chủ ngôn từ của một chuyên gia B2B thực thụ." };
                } else if (score >= 6) {
                    return { sfx: 'correct', title: "Khá Tốt! 🤔", color: "var(--text-main)", text: "Bạn đạt " + score + "/12 điểm. Hãy rèn luyện thêm chút nữa để thành phản xạ bất bại nhé!" };
                } else {
                    return { sfx: 'lose', title: "Cố Lên Bạn Ơi! 📈", color: "var(--danger)", text: "Hãy cố gắng rèn luyện thêm để nâng tầm kỹ năng nhé." };
                }
            }

        },
        {
            id: "game-objection",
            title: "Thử Thách 2.2: Xử Lý Từ Chối Kinh Điển",
            description: "Học cách bẻ lái các câu từ chối phổ biến nhất của khách hàng B2B sang cơ hội trình bày.",
            type: "scenario_challenge",
            icon: "🛡️",
            level: 2,
            questions: [
                {
                    context: "Khách hàng nói: 'Giá bên em cao quá so với đối thủ'. Bạn xử lý thế nào đầu tiên?",
                    options: [
                        { text: "Giảm giá ngay 10% để giữ chân khách hàng.", isCorrect: false, feedback: "Sai lầm! Giảm giá vội vã phá hỏng giá trị giải pháp và làm giảm biên lợi nhuận." },
                        { text: "Đồng cảm, sau đó đặt câu hỏi làm rõ đối thủ đang báo giá bao gồm những hạng mục cụ thể nào...", isCorrect: true, feedback: "Tuyệt vời! Cần so sánh 'táo với táo' thay vì so sánh chung chung dẫn đến bị ép giá." },
                        { text: "Khẳng định đối thủ phá giá và chất lượng kém.", isCorrect: false, feedback: "Nói xấu đối thủ trực diện tạo hình ảnh thiếu chuyên nghiệp." }
                    ]
                },
                {
                    context: "Khách hàng nói: 'Hiện tại bên anh đã có đối tác cung ứng khâu này ổn rồi'. Bạn mở rào cản thế nào?",
                    options: [
                        { text: "Dạ thế em xin lỗi đã làm phiền anh.", isCorrect: false, feedback: "Bỏ cuộc quá nhanh! Bạn chưa khai thác được cơ hội dự phòng." },
                        { text: "Đồng ý rằng đối tác cũ rất tốt. Xin phép gửi họ một đề xuất làm phương án dự phòng (Back-up) hoặc thử nghiệm quy mô nhỏ để đối chiếu...", isCorrect: true, feedback: "Chính xác! Khách hàng B2B luôn muốn có phương án dự phòng rủi ro chuỗi cung ứng." },
                        { text: "Bên em tốt hơn đối tác cũ nhiều, anh nên đổi đi.", isCorrect: false, feedback: "Khẳng định vô căn cứ khi chưa chứng minh được năng lực." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Vua Xử Lý Từ Chối! 🛡️", color: "var(--primary)", text: "Tuyệt vời! Bạn có khả năng bẻ lái tình huống và thuyết phục khách hàng vô cùng sắc bén." };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Kỹ Năng Khá! 🤔", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Cần hiểu rõ hơn về các kỹ thuật cô lập và làm rõ nỗi đau khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Cần Rèn Luyện Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy nhớ: đừng vội giảm giá hay đối đầu, hãy đồng cảm và làm rõ lý do từ chối.` };
                }
            }
        },
        {
            id: "game-negotiation",
            title: "Thử Thách 2.3: Đàm Phán Hợp Đồng B2B",
            description: "Thương lượng điều khoản hợp đồng hiệu quả để đạt thỏa thuận win-win tối ưu rủi ro.",
            type: "scenario_challenge",
            icon: "🤝",
            level: 2,
            questions: [
                {
                    context: "Khách hàng muốn tăng thời hạn bảo hành từ 1 năm lên 2 năm nhưng giữ nguyên giá trị hợp đồng. Bạn xử lý thế nào?",
                    options: [
                        { text: "Đồng ý luôn để giữ mối quan hệ.", isCorrect: false, feedback: "Nhượng bộ vô điều kiện sẽ tạo tiền lệ xấu khiến khách tiếp tục ép các điều khoản khác." },
                        { text: "Dạ em hỗ trợ tăng lên 2 năm, đổi lại anh ký cam kết mua thêm gói hỗ trợ Y hoặc gia hạn dịch vụ...", isCorrect: true, feedback: "Chính xác! Nguyên tắc vàng đàm phán: Luôn trao đổi có điều kiện (Give and Take)." },
                        { text: "Không được đâu anh, quy định công ty em chỉ có 1 năm thôi.", isCorrect: false, feedback: "Cứng nhắc từ chối làm bế tắc cuộc thương lượng." }
                    ]
                },
                {
                    context: "Khách hàng yêu cầu điều khoản thanh toán trả sau 100% trong vòng 60 ngày sau nghiệm thu. Bạn ứng biến ra sao?",
                    options: [
                        { text: "Đồng ý ngay để nhanh chóng ký được hợp đồng.", isCorrect: false, feedback: "Rủi ro dòng tiền và nợ xấu cực kỳ lớn cho công ty của bạn." },
                        { text: "Đề xuất chia làm 3 đợt thanh toán (Tạm ứng - Nghiệm thu từng phần - Tất toán sau nghiệm thu) để san sẻ rủi ro tài chính...", isCorrect: true, feedback: "Thiết kế lộ trình thanh toán linh hoạt giúp bảo vệ dòng tiền mà vẫn khả thi cho đối tác." },
                        { text: "Bên em bắt buộc phải tạm ứng 50, không bàn cãi gì nữa.", isCorrect: false, feedback: "Cách nói thiếu thiện chí hợp tác đàm phán." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Chuyên Gia Đàm Phán Win-Win! 🤝", color: "var(--primary)", text: "Bạn bảo vệ giá trị hợp đồng rất tốt bằng nguyên tắc trao đổi có điều kiện. Thỏa thuận của bạn luôn bền vững." };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Thỏa Thuận Tốt! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Cần tránh nhượng bộ quá nhanh mà không đòi hỏi lại quyền lợi tương xứng.` };
                } else {
                    return { sfx: 'lose', title: "Chịu Nhiều Thiệt Thòi! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy nhớ: luôn đàm phán có điều kiện (Give and Take) để tránh bị ép giá.` };
                }
            }
        },
        {
            id: "game-eq",
            title: "Thử Thách 2.4: EQ trong B2B Sales",
            description: "Khảo sát chỉ số EQ - khả năng chịu áp lực, thấu cảm và kiên trì của chiến binh BD.",
            type: "suitability_scoring",
            icon: "❤️",
            level: 2,
            questions: [
                {
                    context: "Bạn đang gọi điện thoại cho một đối tác hiện hữu và họ đang rất giận dữ phàn nàn về lỗi kỹ thuật sản phẩm làm ảnh hưởng kinh doanh của họ. Bạn làm gì đầu tiên?",
                    options: [
                        { text: "Ngắt lời họ giải thích rằng lỗi này thuộc về phòng kỹ thuật chứ không phải của bạn.", points: 0, feedback: "Đổ lỗi nội bộ làm giảm uy tín công ty và khiến khách giận dữ hơn." },
                        { text: "Lắng nghe đồng cảm hết cơn giận, xin lỗi vì sự gián đoạn và lập tức kết nối đội hỗ trợ xử lý khân cấp...", points: 2, feedback: "Chính xác! Hãy xoa dịu cảm xúc của họ trước khi đi vào giải quyết vấn đề kỹ thuật." },
                        { text: "Im lặng hoàn toàn không trả lời gì.", points: 0, feedback: "Thái độ trốn tránh trách nhiệm hủy hoại mối quan hệ hợp tác." }
                    ]
                },
                {
                    context: "Đồng nghiệp giành mất một Lead lớn mà bạn đã cất công chăm sóc suốt 1 tháng qua. Bạn ứng xử thế nào?",
                    options: [
                        { text: "Lên gặp sếp làm ầm ĩ yêu cầu phân xử công bằng.", points: 1, feedback: "Cách giải quyết xung đột có phần cảm tính và tạo căng thẳng." },
                        { text: "Hẹn đồng nghiệp nói chuyện thẳng thắn, đưa ra bằng chứng lịch sử tương tác trên CRM và thống nhất cách chia sẻ lợi ích...", points: 2, feedback: "Rất tốt! Quản trị xung đột nội bộ một cách chuyên nghiệp, văn minh dựa trên dữ liệu." },
                        { text: "Im lặng chịu đựng nhưng nói xấu họ sau lưng.", points: 0, feedback: "Hành động tiêu cực phá hỏng văn hóa đội ngũ." }
                    ]
                }
            ],
            getResult: (points) => {
                if (points === 4) {
                    return { sfx: 'win', title: "BD Có EQ Đỉnh Cao! ❤️", color: "var(--primary)", text: `Bạn đạt ${points}/4 điểm. Khả năng thấu cảm, kiên trì và quản trị mối quan hệ nội bộ của bạn là hình mẫu lý tưởng.` };
                } else if (points >= 2) {
                    return { sfx: 'correct', title: "EQ Trung Bình Khá! 📈", color: "var(--text-main)", text: `Bạn đạt ${points}/4 điểm. Cần rèn luyện thêm khả năng giữ bình tĩnh trước phàn nàn và kiên trì theo đuổi deal.` };
                } else {
                    return { sfx: 'lose', title: "Cần Quản Trị Cảm Xúc! 😅", color: "var(--danger)", text: `Bạn đạt ${points}/4 điểm. BD là một cuộc marathon dài hạn. Hãy rèn luyện sự kiên trì và đồng cảm sâu sắc hơn.` };
                }
            }
        },
        {
            id: "game-painpoint",
            title: "Thử Thách 2.5: Đọc Vị Pain Point Khách Hàng",
            description: "Thực hành các câu hỏi đào sâu nỗi đau vận hành và chi phí ẩn của doanh nghiệp.",
            type: "scenario_challenge",
            icon: "🎯",
            level: 2,
            questions: [
                {
                    context: "Khách hàng nói: 'Quy trình hiện tại của bên anh vẫn chạy tốt, không cần thay đổi gì'. Bạn đào sâu thế nào?",
                    options: [
                        { text: "Dạ thế thì tốt quá ạ, chúc mừng anh.", isCorrect: false, feedback: "Bạn vừa tự đóng lại cánh cửa cơ hội giới thiệu giải pháp tối ưu hơn." },
                        { text: "Dạ quy trình tốt là rất đáng mừng. Cho em hỏi thêm bên mình đang tốn bao nhiêu thời gian để tổng hợp báo cáo thủ công mỗi tuần ạ?", isCorrect: true, feedback: "Chính xác! Hỏi xoáy vào thời gian lãng phí/thất thoát ẩn giúp họ tự nhận ra điểm nghẽn." },
                        { text: "Nhưng quy trình cũ của anh thủ công lắm, dùng bên em sẽ tự động hơn.", isCorrect: false, feedback: "Cách nói mang tính phán xét chủ quan tạo rào cản phòng thủ tâm lý." }
                    ]
                },
                {
                    context: "Khi hỏi về ngân sách dự toán (Budget), câu hỏi nào khéo léo và hiệu quả nhất?",
                    options: [
                        { text: "Dài án này anh chị dự kiến đầu tư khoảng bao nhiêu tiền ạ?", isCorrect: false, feedback: "Hỏi trực diện chi phí sớm dễ khiến khách hàng phòng thủ và nói tránh." },
                        { text: "Dựa trên quy mô vận hành hiện tại, bên em ước lượng khoản đầu tư khoảng X-Y. Con số này có nằm trong tầm ngân sách phê duyệt của anh không?", isCorrect: true, feedback: "Chuyên gia! Đưa ra khoảng ước lượng trước để neo khung giá và giúp đối tác dễ dàng phản hồi." },
                        { text: "Bên anh có đủ tiền mua gói này không?", isCorrect: false, feedback: "Hỏi cực kỳ thô lỗ, hủy hoại quan hệ đối tác lập tức." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Vua Đọc Vị Pain Point! 🎯", color: "var(--primary)", text: "Kịch bản đào sâu của bạn rất thông minh, hướng thẳng vào tối ưu vận hành và tài chính của đối tác!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Kỹ Năng Đào Sâu Khá! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy đặt thêm các câu hỏi định lượng số liệu thất thoát của khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Cần Học Hỏi Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy luyện tập mô hình SPIN Selling (Situation, Problem, Implication, Need-payoff).` };
                }
            }
        },
        {
            id: "game-case-parentinc",
            title: "Thử Thách 2.6: Case Study The ParentInc",
            description: "Thực hành giải bài toán quảng cáo và tối ưu ROI dựa trên năng lực của Webtretho & Bé Yêu.",
            type: "scenario_challenge",
            icon: "📈",
            level: 2,
            questions: [
                {
                    context: "Điểm mạnh cốt lõi nhất của Webtretho & Bé Yêu khi tiếp cận khách hàng B2B (nhãn hàng mẹ & bé) là gì?",
                    options: [
                        { text: "Có lượng người dùng nữ và mẹ bỉm sữa lớn, tạo độ tập trung mục tiêu cao...", isCorrect: true, feedback: "Chính xác! Lợi thế tệp đối tượng ngách tập trung cao giúp nhãn hàng không lãng phí ngân sách." },
                        { text: "Có giá dịch vụ rẻ nhất thị trường quảng cáo hiện nay.", isCorrect: false, feedback: "Bán hàng B2B bằng cách phá giá không phải là điểm mạnh bền vững." },
                        { text: "Chỉ tập trung vào quảng cáo biểu ngữ (banner) truyền thống.", isCorrect: false, feedback: "Hệ sinh thái mẹ & bé hỗ trợ đa dạng giải pháp từ Content, KOLs đến Khảo sát." }
                    ]
                },
                {
                    context: "Khi một thương hiệu mỹ phẩm lo ngại về tỷ lệ hoàn vốn đầu tư (ROI) khi chạy thử nghiệm, BD nên giải quyết thế nào?",
                    options: [
                        { text: "Đề xuất một chiến dịch thử nghiệm quy mô nhỏ để đánh giá trước ROI thực tế...", isCorrect: true, feedback: "Chuyên gia! Thử nghiệm nhỏ giúp giảm bớt rào cản lo sợ rủi ro tài chính của đối tác." },
                        { text: "Ép khách hàng ký hợp đồng dài hạn tối thiểu 1 năm mới đảm bảo hiệu quả.", isCorrect: false, feedback: "Ép buộc điều khoản dài hạn khi chưa chứng minh năng lực sẽ làm rớt deal ngay." },
                        { text: "Khẳng định ROI là không quan trọng trong quảng cáo Digital.", isCorrect: false, feedback: "Với C-Level doanh nghiệp B2B, ROI là chỉ số sống còn quyết định duyệt ngân sách." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Chiến Thần Giải Pháp Mẹ & Bé! 🏆", color: "var(--primary)", text: "Bạn thấu hiểu rất sâu sắc cách bán giải pháp giá trị (Value-selling) dựa trên hệ sinh thái cộng đồng!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Tư Vấn Khá Tốt! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy tập trung khai thác sâu hơn khó khăn về định lượng khách hàng tiềm năng nhé.` };
                } else {
                    return { sfx: 'lose', title: "Tư Duy Bán Banner! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy nhớ: khách hàng mua giải pháp giải quyết nỗi đau của họ, không phải mua vị trí đặt banner.` };
                }
            }
        },
        {
            id: "game-proposal",
            title: "Thử Thách 2.7: Thiết Kế Đề Xuất Proposal",
            description: "Thực hành cấu trúc slide Proposal và trình bày khung chi phí linh hoạt thuyết phục đối tác.",
            type: "scenario_challenge",
            icon: "📝",
            level: 2,
            questions: [
                {
                    context: "Cấu trúc phần mở đầu một slide Proposal B2B gửi cho đối tác nên là gì?",
                    options: [
                        { text: "Sơ lược lịch sử hình thành và danh sách sếp của công ty mình.", isCorrect: false, feedback: "Khách hàng không quan tâm bạn là ai, họ quan tâm bạn giải quyết gì cho họ." },
                        { text: "Nhắc lại bối cảnh, khó khăn cốt lõi của họ (đã xác nhận ở bước Discovery) và mục tiêu đo lường...", isCorrect: true, feedback: "Chính xác! Bắt đầu bằng nỗi đau của khách hàng để tạo tính liên quan tối đa." },
                        { text: "Bảng báo giá chi tiết từng hạng mục chi phí.", isCorrect: false, feedback: "Gửi báo giá quá sớm khi chưa trình bày giá trị sẽ kích hoạt cơ chế so sánh giá." }
                    ]
                },
                {
                    context: "Để khách hàng không so sánh giá và từ chối vì 'quá đắt', cách thiết kế báo giá nào thông minh nhất?",
                    options: [
                        { text: "Chỉ đưa ra duy nhất 1 mức giá bắt buộc ký kết.", isCorrect: false, feedback: "Khách hàng chỉ có 1 lựa chọn: Có hoặc Không. Tỷ lệ rớt deal cao." },
                        { text: "Đưa ra 3 gói giải pháp (Gói Tiêu chuẩn - Gói Đề nghị tối ưu - Gói Nâng cao) để khách hàng chọn lựa...", isCorrect: true, feedback: "Chuyên nghiệp! Đưa ra nhiều sự lựa chọn chuyển đổi tâm lý từ 'Mua hay không' sang 'Nên mua gói nào'." },
                        { text: "Không ghi giá, để khách hàng tự điền giá mong muốn.", isCorrect: false, feedback: "Thiếu tính chuyên nghiệp và chủ động dẫn dắt thương lượng." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Bậc Thầy Soạn Thảo Proposal! 📝", color: "var(--primary)", text: "Cách thiết kế Proposal của bạn luôn hướng đến giá trị, giúp hạ thấp rào cản duyệt chi của đối tác!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Đề Xuất Khá Thuyết Phục! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Nên học cách đóng gói giải pháp thành các module linh hoạt hơn.` };
                } else {
                    return { sfx: 'lose', title: "Chỉ Biết Bán Báo Giá! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Một Proposal thất bại là Proposal chỉ có bảng giá mà không có bối cảnh nỗi đau và lộ trình hành động.` };
                }
            }
        },

        // LEVEL 3: Trên 3 Năm (Chuyên Gia)
        {
            id: "game-queens",
            title: "Thử Thách: B2B Queens (Team Alignment)",
            description: "Xếp 4 BD Star (👑) vào lưới sao cho họ không cạnh tranh, không chồng chéo địa bàn.",
            type: "puzzle_queens",
            icon: "👑",
            level: 3,
            questions: [
                {
                    context: "Đặt 4 vương miện (👑) sao cho không có hai vương miện nào nằm trên cùng một hàng, một cột hoặc đường chéo.",
                    options: []
                }
            ],
            getResult: (score) => {
                return { sfx: 'win', title: "Quy Hoạch Lãnh Thổ Hoàn Hảo! 👑", color: "var(--primary)", text: "Đỉnh cao! Bạn đã phân chia địa bàn hoạt động cho các Key Account Managers cực kỳ khoa học." };
            }
        },
        {
            id: "game-system",
            title: "Thử Thách 3.1: BD kiểu 'thủ công' hay 'hệ thống'?",
            description: "Đo lường quy trình làm việc của bạn đang ở mức nỗ lực cơ bắp thủ công hay quy trình hệ thống hóa.",
            type: "personality_scoring",
            icon: "⚙️",
            level: 3,
            questions: [
                {
                    context: "Khi bắt đầu tìm kiếm khách hàng mới, bạn thường:",
                    options: [
                        { text: "Sử dụng danh sách có sẵn từ công ty hoặc mạng lưới quen biết, ít khi mở rộng thêm.", points: 0, feedback: "Cách tiếp cận thụ động sẽ giới hạn quy mô cơ hội." },
                        { text: "Dành thời gian nghiên cứu và xây dựng danh sách riêng, nhưng đôi khi hơi tốn công.", points: 1, feedback: "Nỗ lực cá nhân tốt, nhưng cần tối ưu hóa bằng công cụ." },
                        { text: "Kết hợp nhiều nguồn, có quy trình lọc và phân loại sẵn.", points: 2, feedback: "Tuyệt vời! Tư duy hệ thống giúp bạn tiết kiệm thời gian lọc lead chất lượng." }
                    ]
                },
                {
                    context: "Việc theo dõi tiến độ với từng khách hàng của bạn hiện tại?",
                    options: [
                        { text: "Ghi nhớ trong đầu hoặc note nhanh trên điện thoại.", points: 0, feedback: "Rất nguy hiểm! Dễ bỏ lỡ cơ hội lớn khi lượng khách tăng lên." },
                        { text: "Sử dụng CRM hoặc bảng pipeline rõ ràng, cập nhật đều đặn.", points: 2, feedback: "Tuyệt vời! Bạn đang kiểm soát chặt chẽ từng điểm tiếp xúc của deal." },
                        { text: "Dùng file Excel, Google Sheet, có cột ghi chú nhưng chưa đồng bộ.", points: 1, feedback: "Đã có ý thức quản lý, nhưng chưa tự động hóa và thiếu nhắc nhở." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 4) {
                    return { sfx: 'win', title: "BD Hệ Thống Đỉnh Cao! 🚀", color: "var(--primary)", text: "Quy trình làm việc của bạn rất bài bản, chuyên nghiệp và có tính tự động hóa cao. Bạn đang tối ưu hóa thời gian rất tốt!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "BD Kết Hợp (Bán Hệ Thống) 📊", color: "var(--text-main)", text: `Bạn đạt ${score}/4 điểm. Bạn đã có ý thức quy trình nhưng vẫn còn phụ thuộc nhiều vào nỗ lực thủ công. Hãy áp dụng thêm công cụ và tự động hóa để đột phá doanh số.` };
                } else {
                    return { sfx: 'lose', title: "BD Thủ Công (Cơ Bắp) 😅", color: "var(--danger)", text: `Bạn đạt ${score}/4 điểm. Bạn đang làm việc rất chăm chỉ nhưng thiếu quy trình và công cụ hỗ trợ. Hãy bắt đầu xây dựng phễu khách hàng và sử dụng CRM ngay.` };
                }
            }
        },
        {
            id: "game-pitching",
            title: "Thử Thách 3.2: Pitching & Slide Thuyết Phục",
            description: "Lập luận sắc bén thuyết phục Ban giám đốc/C-level gật đầu đồng ý thử nghiệm.",
            type: "scenario_challenge",
            icon: "📊",
            level: 3,
            questions: [
                {
                    context: "Khi trình bày slide cho Hội Đồng Quản Trị hoặc C-Level, cấu trúc thuyết trình nào hiệu quả nhất?",
                    options: [
                        { text: "Dành 20 phút giới thiệu lịch sử công ty và chứng chỉ năng lực, sau đó giới thiệu sản phẩm.", isCorrect: false, feedback: "Thất bại! Sếp lớn không có thời gian nghe giới thiệu bản thân. Họ muốn thấy kết quả ngay." },
                        { text: "Bắt đầu trực tiếp bằng Pain Point cốt lõi của họ, đề xuất Giải pháp định lượng tài chính, minh chứng case study thành công...", isCorrect: true, feedback: "Tuyệt vời! Cấu trúc đi thẳng vào vấn đề và tài chính là cách duy nhất thuyết phục C-level." },
                        { text: "Đọc từng chữ trên slide từ đầu đến cuối.", isCorrect: false, feedback: "Cách thuyết trình buồn ngủ, phản cảm và thiếu tôn trọng người nghe." }
                    ]
                },
                {
                    context: "Slide của bạn chứa quá nhiều chữ và bảng biểu kỹ thuật phức tạp. Bạn tối ưu hóa thế nào?",
                    options: [
                        { text: "Giữ nguyên vì đó là tài liệu kỹ thuật quan trọng.", isCorrect: false, feedback: "Slide quá tải thông tin khiến người xem mất tập trung vào thông điệp lõi." },
                        { text: "Thay thế bằng các biểu đồ trực quan hóa dữ liệu (Data Visualization), tóm tắt các chỉ số ROI/tiết kiệm chi phí bằng số lớn nổi bật...", isCorrect: true, feedback: "Chính xác! Trực quan hóa giúp sếp lớn nắm bắt nhanh chóng bức tranh tài chính toàn cảnh." },
                        { text: "Xóa hết bảng biểu chỉ giữ lại hình nền minh họa cho đẹp.", isCorrect: false, feedback: "Thiếu dữ liệu minh chứng khiến bài thuyết trình thiếu tính thuyết phục." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Siêu Sao Thuyết Trình B2B! 📊", color: "var(--primary)", text: "Slide của bạn trực quan, cấu trúc chi tiết và bài thuyết trình thu hút C-level từ giây đầu tiên!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Buổi Pitching Khá! 🗣️", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Nên phân bổ nhiều thời gian hơn cho việc hỏi đáp và lắng nghe khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Bài Pitching Tẻ Nhạt! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Đừng biến slide thành file Word đọc tài liệu. Hãy tập trung vào Pain Point.` };
                }
            }
        },
        {
            id: "game-upsell",
            title: "Thử Thách 3.3: Upsell & Giữ Chân Khách",
            description: "Chăm sóc khách hàng cũ hiệu quả để tối ưu hóa giá trị trọn đời (LTV) và thúc đẩy gia hạn hợp đồng.",
            type: "scenario_challenge",
            icon: "📈",
            level: 3,
            questions: [
                {
                    context: "Khách hàng cũ chuẩn bị đến hạn tái ký hợp đồng nhưng im lặng không phản hồi. Bạn kích hoạt thương vụ thế nào?",
                    options: [
                        { text: "Gửi báo giá đề nghị tái ký ngay lập tức.", isCorrect: false, feedback: "Thiếu giá trị thúc đẩy, tạo cảm giác chỉ muốn lấy tiền của họ." },
                        { text: "Hẹn gặp đánh giá hiệu quả (Quarterly Business Review), chứng minh các giá trị tài chính bên bạn đã mang lại sau 1 năm và đề xuất kế hoạch năm tới...", isCorrect: true, feedback: "Chuyên gia! Dùng số liệu thực tế chứng minh giá trị (ROI) đã bàn giao là cách tốt nhất để tái ký." },
                        { text: "Báo cáo sếp chuẩn bị thanh lý hợp đồng.", isCorrect: false, feedback: "Bỏ cuộc quá sớm khi chưa nỗ lực kết nối lại." }
                    ]
                },
                {
                    context: "Đối tác đang gặp khó khăn tài chính đột xuất và muốn hủy hợp đồng dịch vụ trước hạn. Bạn xử lý thế nào?",
                    options: [
                        { text: "Chấp nhận hủy ngay và chúc họ may mắn.", isCorrect: false, feedback: "Thiếu sự nỗ lực cứu vãn và giữ mối quan hệ." },
                        { text: "Đề xuất gói dịch vụ thu gọn (Downgrade) giữ lại tính năng lõi với chi phí thấp hơn để giúp họ vượt khó, duy trì sự hiện diện của bạn...", isCorrect: true, feedback: "Chuyên gia! Linh hoạt đồng hành cùng khó khăn của đối tác để giữ chân tài khoản dài hạn." },
                        { text: "Ép họ phải bồi thường hợp đồng theo đúng điều khoản cam kết.", isCorrect: false, feedback: "Cứng nhắc! Ép buộc pháp lý có thể giúp bạn lấy được chút tiền phạt nhưng mất vĩnh viễn mối quan hệ trong tương lai." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Vua Upsell & Chăm Sóc Khách Hàng! 📈", color: "var(--primary)", text: "Khách hàng cũ sẽ liên tục tái ký và mua thêm giải pháp nhờ quy trình chăm sóc chuyên nghiệp của bạn!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Tỷ Lệ Giữ Chân Tốt! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy tận dụng thời điểm khách hàng đạt được giá trị thực tế để đề xuất upsell.` };
                } else {
                    return { sfx: 'lose', title: "Khách Hàng Rời Đi Nhiều! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Đừng bỏ rơi khách sau khi ký hợp đồng. Customer Success là chìa khóa của sự bền vững.` };
                }
            }
        },
        {
            id: "game-partnership",
            title: "Thử Thách 3.4: Phát Triển Đối Tác Chiến Lược",
            description: "Thực hành thiết lập liên minh đối tác và xây dựng chương trình Co-Marketing/Reseller hiệu quả.",
            type: "scenario_challenge",
            icon: "🤝",
            level: 3,
            questions: [
                {
                    context: "Bạn muốn thuyết phục một đối tác công nghệ lớn tích hợp chéo (cross-integration) sản phẩm của họ với bạn. Đâu là lập luận thuyết phục nhất?",
                    options: [
                        { text: "Sản phẩm bên em tích hợp vào sẽ giúp hệ thống bên anh trông hiện đại hơn.", isCorrect: false, feedback: "Lập luận quá mơ hồ, thiếu định lượng giá trị kinh doanh thực tế." },
                        { text: "Tích hợp chéo sẽ giải quyết trọn gói bài toán X cho tệp khách hàng chung, tăng tỷ lệ giữ chân khách (Retention) và tạo doanh thu phụ trội...", isCorrect: true, feedback: "Chuyên gia xuất sắc! Nêu bật được lợi ích sát sườn về giữ chân khách hàng và doanh thu chung." },
                        { text: "Bên em sẽ trả anh hoa hồng giới thiệu 10%.", isCorrect: false, feedback: "Đối tác lớn quan tâm đến giá trị giải pháp hệ thống hơn là hoa hồng nhỏ lẻ." }
                    ]
                },
                {
                    context: "Khi ký kết hợp tác Reseller (Đại lý bán lại), rào cản lớn nhất khiến đại lý không chủ động bán sản phẩm của bạn là gì?",
                    options: [
                        { text: "Do chiết khấu hoa hồng của bạn chưa đủ cao.", isCorrect: false, feedback: "Chưa hẳn, chiết khấu cao mà khó bán thì đại lý vẫn bỏ xó sản phẩm." },
                        { text: "Do nhân viên sale của đại lý chưa được đào tạo (Enablement) kỹ và không có tài liệu marketing hỗ trợ sẵn để tự tin tư vấn...", isCorrect: true, feedback: "Chính xác! Sales Enablement là yếu tố sống còn để kích hoạt kênh phân phối bán hàng." },
                        { text: "Do sản phẩm của bạn không có thương hiệu lớn toàn cầu.", isCorrect: false, feedback: "Sản phẩm ngách giải quyết tốt nỗi đau vẫn bán chạy qua kênh đại lý." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Vua Đối Tác Chiến Lược! 🤝", color: "var(--primary)", text: "Tư duy thiết lập liên minh và kích hoạt kênh phân phối của bạn rất đẳng cấp và bài bản!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Kỹ Năng Hợp Tác Khá! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy chú ý hơn đến quy trình Sales Enablement cho đại lý.` };
                } else {
                    return { sfx: 'lose', title: "Cần Trau Dồi Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy nghiên cứu kỹ mô hình Channel Sales và Strategic Alliance.` };
                }
            }
        },
        {
            id: "game-kpi",
            title: "Thử Thách 3.5: Thiết Kế KPIs & Phễu Ngược",
            description: "Thực hành quy đổi mục tiêu doanh thu thành chỉ số hành động cụ thể cho đội ngũ BD.",
            type: "scenario_challenge",
            icon: "📊",
            level: 3,
            questions: [
                {
                    context: "Mục tiêu doanh thu outbound mới năm nay là 10 tỷ. Giá trị trung bình 1 deal chốt là 500 triệu. Tỷ lệ chốt sau demo là 20%. Tỷ lệ demo thành công từ lead là 10%. Hỏi cần bao nhiêu lead thô ban đầu?",
                    options: [
                        { text: "Cần 500 lead thô.", isCorrect: false, feedback: "Tính toán sai số lượng lead chuyển đổi qua phễu." },
                        { text: "Cần 1000 lead thô (10 tỷ = 20 deal chốt -> Cần 100 cuộc họp demo -> Cần 1000 lead thô)...", isCorrect: true, feedback: "Chính xác! Lập kế hoạch phễu ngược chuẩn xác giúp định lượng rõ rệt khối lượng công việc." },
                        { text: "Cần 2000 lead thô.", isCorrect: false, feedback: "Con số quá cao không cần thiết, làm giảm hiệu suất quản lý lead." }
                    ]
                },
                {
                    context: "Để đánh giá hiệu suất hàng tuần của một BD Outbound, chỉ số nào dưới đây là KPI Hành Động (Leading Indicator) phù hợp nhất?",
                    options: [
                        { text: "Doanh số thực tế thu về cuối tháng.", isCorrect: false, feedback: "Đây là KPI Kết Quả (Lagging Indicator), không giúp kiểm soát hành vi hàng ngày." },
                        { text: "Số lượng tài khoản mục tiêu được nghiên cứu sâu và gửi email/Zalo cá nhân hóa (Accounts Outreached)...", isCorrect: true, feedback: "Chính xác! Đây là chỉ số hành vi kiểm soát được trực tiếp, quyết định đầu vào của phễu." },
                        { text: "Số lượng hợp đồng đang chờ pháp lý duyệt.", isCorrect: false, feedback: "Chỉ số này phụ thuộc nhiều vào các yếu tố khách quan và quy trình nội bộ." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Master Phễu Ngược & KPIs! 📊", color: "var(--primary)", text: "Tư duy quản trị dữ liệu và thiết kế hệ thống vận hành BD của bạn rất chuyên nghiệp và thực chiến!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Thiết Kế Khá Tốt! 📈", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Hãy chú ý kiểm soát chặt chẽ tỷ lệ chuyển đổi giữa các bước trên CRM.` };
                } else {
                    return { sfx: 'lose', title: "Cần Rèn Luyện Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy thiết lập lại hệ thống B2B Sales Operation.` };
                }
            }
        },
        {
            id: "game-enterprise-deals",
            title: "Thử Thách 3.6: Quản Trị Deal Enterprise",
            description: "Thực hành vẽ bản đồ thế lực và vượt qua rào cản đánh giá kỹ thuật tại khách hàng doanh nghiệp lớn.",
            type: "scenario_challenge",
            icon: "🏢",
            level: 3,
            questions: [
                {
                    context: "Khi lập bản đồ ảnh hưởng (Influence Map) tại một tập đoàn Enterprise, vai trò của 'Champion' (Người ủng hộ cốt lõi) là gì?",
                    options: [
                        { text: "Người ký tên đóng dấu hợp đồng pháp lý.", isCorrect: false, feedback: "Đó là Economic Buyer (Người duyệt chi tài chính)." },
                        { text: "Người trực tiếp hưởng lợi từ giải pháp và sẵn sàng bán giải pháp của bạn cho các sếp nội bộ của họ...", isCorrect: true, feedback: "Chính xác! Champion là nội gián quan trọng nhất để đẩy deal Enterprise đi tiếp." },
                        { text: "Người đứng gác cổng lễ tân công ty.", isCorrect: false, feedback: "Đó là Gatekeeper." }
                    ]
                },
                {
                    context: "Sếp lớn C-level đã rất thích giải pháp của bạn, nhưng phòng Kỹ thuật/IT liên tục trì hoãn đánh giá bảo mật hệ thống. BD làm thế nào?",
                    options: [
                        { text: "Nhờ sếp lớn ép phòng IT phải duyệt ngay lập tức.", isCorrect: false, feedback: "Tạo xung đột nội bộ khiến IT ghét sản phẩm của bạn và tìm lỗi phá bĩnh." },
                        { text: "Họp riêng với IT để hiểu rõ tiêu chuẩn bảo mật của họ, cung cấp tài liệu kỹ thuật đầy đủ và giải quyết lo ngại của họ...", isCorrect: true, feedback: "Chuyên gia! Tôn trọng nghiệp vụ của IT và biến họ thành người phê duyệt thay vì đối đầu." },
                        { text: "Bỏ qua phòng IT và tiến hành ký hợp đồng trực tiếp.", isCorrect: false, feedback: "Rủi ro pháp lý và vận hành khiến dự án dễ bị đình chỉ sau khi ký." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Chiến Thần Chốt Deal Enterprise! 🏢", color: "var(--primary)", text: "Bạn làm chủ xuất sắc tiến trình mua hàng nhiều bên phức tạp tại các tập đoàn lớn!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Nắm Bắt Deal Khá! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Cần chú trọng hơn nữa việc nuôi dưỡng nhiều mối quan hệ nội bộ.` };
                } else {
                    return { sfx: 'lose', title: "Bị Kẹt Pipeline! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Bán hàng Enterprise đòi hỏi sự bền bỉ phối hợp giữa các phòng ban. Hãy kiên trì xây dựng Champion nhé.` };
                }
            }
        },
        {
            id: "game-channel-enablement",
            title: "Thử Thách 3.7: Kênh Đại Lý Reseller",
            description: "Thực hành kích hoạt đại lý bán lại (Sales Enablement) và xử lý xung đột kênh.",
            type: "scenario_challenge",
            icon: "⚙️",
            level: 3,
            questions: [
                {
                    context: "Đội ngũ sales của Đại lý Reseller không chủ động bán sản phẩm của bạn. Đâu là hành động giải quyết tận gốc?",
                    options: [
                        { text: "Tăng chiết khấu hoa hồng lên gấp đôi.", isCorrect: false, feedback: "Tốn chi phí mà không giải quyết được vấn đề năng lực tư vấn của đại lý." },
                        { text: "Tổ chức chuỗi đào tạo (Sales Enablement), cung cấp slide so sánh tính năng và kịch bản chốt deal nhanh...", isCorrect: true, feedback: "Chính xác! Giúp sales của đại lý tự tin tư vấn là cách tốt nhất thúc đẩy doanh số đại lý." },
                        { text: "Đe dọa hủy quyền Reseller nếu không đạt doanh số.", isCorrect: false, feedback: "Hủy hoại mối quan hệ hợp tác lâu dài." }
                    ]
                },
                {
                    context: "Để tránh xung đột kênh (Channel Conflict) khi cả Đại lý và đội Sales trực tiếp của bạn cùng tiếp cận một khách hàng lớn, quy tắc nào là tốt nhất?",
                    options: [
                        { text: "Ai chốt được hợp đồng trước thì được tính doanh số.", isCorrect: false, feedback: "Gây chiến tranh nội bộ và làm mất hình ảnh chuyên nghiệp trong mắt khách hàng." },
                        { text: "Áp dụng cơ chế đăng ký cơ hội (Deal Registration) trên cổng CRM: bên nào đăng ký cơ hội trước sẽ được độc quyền bảo vệ...", isCorrect: true, feedback: "Tuyệt vời! Cơ chế Deal Registration chuẩn quốc tế giúp đảm bảo tính minh bạch và công bằng tối đa." },
                        { text: "Bắt buộc đại lý phải nhường deal cho đội sales trực tiếp của công ty.", isCorrect: false, feedback: "Mất lòng tin của đại lý, khiến họ ngừng hợp tác giới thiệu sản phẩm của bạn." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 2) {
                    return { sfx: 'win', title: "Bậc Thầy Channel Sales! ⚙️", color: "var(--primary)", text: "Tư duy đóng gói quy trình hỗ trợ đối tác đại lý và phân chia lợi ích của bạn rất xuất sắc!" };
                } else if (score >= 1) {
                    return { sfx: 'correct', title: "Quản Lý Kênh Khá! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/2 câu. Cần lưu ý chuẩn hóa sớm cổng thông tin CRM đăng ký deal.` };
                } else {
                    return { sfx: 'lose', title: "Xung Đột Kênh Phức Tạp! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/2 câu. Hãy nhớ: Channel Enablement và Deal Registration là 2 trụ cột của mô hình Channel Sales thành công.` };
                }
            }
        }
    ];

    let activeGameIndex = 0;

    // Scale question counts by levels: Level 1 -> 8, Level 2 -> 12, Level 3 -> 16
    function padGameQuestions() {
        const pool = [
            {
                context: "Khách hàng nói: 'Để anh bàn với sếp đã'. Sếp của họ thực ra là ai trong tình huống trì hoãn?",
                options: [
                    { text: "Giám đốc điều hành bận rộn.", isCorrect: false, feedback: "Có thể, nhưng thường là cái cớ." },
                    { text: "Một cái cớ khéo léo để từ chối bạn.", isCorrect: true, feedback: "Chính xác! Gần 80% trường hợp 'hỏi sếp' là để trì hoãn đàm phán." },
                    { text: "Vợ của họ.", isCorrect: false, feedback: "Hài hước, nhưng không chuyên nghiệp trong B2B." }
                ]
            },
            {
                context: "Để cold email có tỷ lệ mở (Open Rate) cao nhất, tiêu đề nên viết thế nào?",
                options: [
                    { text: "[HỢP TÁC] Giới thiệu giải pháp doanh nghiệp...", isCorrect: false, feedback: "Nhìn như thư rác, tỷ lệ xóa cực cao." },
                    { text: "Ý kiến của anh/chị về vấn đề vận hành tại [Tên công ty]?", isCorrect: true, feedback: "Tuyệt vời! Tiêu đề cá nhân hóa và khơi gợi tò mò." },
                    { text: "GIẢM GIÁ 50% DỊCH VỤ BD B2B NGAY HÔM NAY!", isCorrect: false, feedback: "Sẽ rơi thẳng vào hộp thư Spam." }
                ]
            },
            {
                context: "Khi khách hàng nói: 'Để anh suy nghĩ thêm'. BD chuyên nghiệp sẽ nói gì?",
                options: [
                    { text: "Dạ vâng, anh cứ suy nghĩ đi ạ.", isCorrect: false, feedback: "Thụ động! Bạn vừa đóng lại cơ hội thảo luận." },
                    { text: "Dạ em hiểu suy nghĩ kỹ là rất cần thiết. Cho em hỏi mình đang băn khoăn về phần chi phí hay tính năng nào để em làm rõ thêm ạ?", isCorrect: true, feedback: "Chuyên gia! Đặt câu hỏi làm rõ để giải quyết nỗi lo." },
                    { text: "Bên em sắp hết khuyến mãi rồi, anh chốt nhanh đi.", isCorrect: false, feedback: "Gây áp lực thô thiển dễ làm khách hàng phản cảm." }
                ]
            },
            {
                context: "Trong mô hình SPIN Selling, chữ 'P' đại diện cho điều gì?",
                options: [
                    { text: "Product (Sản phẩm của bạn).", isCorrect: false, feedback: "SPIN tập trung vào khách hàng, không phải sản phẩm." },
                    { text: "Problem (Nỗi đau/Vấn đề của khách hàng).", isCorrect: true, feedback: "Chính xác! Đào sâu vấn đề giúp khách hàng tự thấy nhu cầu thay đổi." },
                    { text: "Price (Giá cả thương lượng).", isCorrect: false, feedback: "Giá là khâu sau cùng." }
                ]
            },
            {
                context: "Khi khách hàng phàn nàn dịch vụ lỗi ngay trong đêm, phản ứng đầu tiên của BD là gì?",
                options: [
                    { text: "Bảo khách hàng đợi đến giờ hành chính.", isCorrect: false, feedback: "Thiếu trách nhiệm! Bạn sẽ mất khách hàng Enterprise nhanh chóng." },
                    { text: "Ghi nhận sự cố, đồng cảm với ảnh hưởng vận hành của họ và lập tức báo kỹ thuật xử lý khẩn cấp...", isCorrect: true, feedback: "Chính xác! Sự đồng hành lúc khó khăn tạo dựng lòng tin bền vững nhất." },
                    { text: "Đổ lỗi cho nhà mạng hoặc bên thứ ba.", isCorrect: false, feedback: "Đổ lỗi chỉ làm tăng thêm sự bực tức của khách." }
                ]
            },
            {
                context: "Mục tiêu cốt lõi của một cuộc hẹn 'Networking' là gì?",
                options: [
                    { text: "Ký hợp đồng ngay lập tức.", isCorrect: false, feedback: "Không thực tế! Networking là để gieo hạt mối quan hệ." },
                    { text: "Kết nối, hiểu biết về đối phương và hẹn một buổi làm việc chính thức sau đó...", isCorrect: true, feedback: "Chuẩn xác! Mối quan hệ tốt là nền tảng của mọi deal B2B." },
                    { text: "Phát danh thiếp cho càng nhiều người càng tốt.", isCorrect: false, feedback: "Phát card vô tội vạ không đem lại giá trị thực tế." }
                ]
            },
            {
                context: "Tại sao không nên nói xấu đối thủ cạnh tranh trước mặt khách hàng?",
                options: [
                    { text: "Vì sợ đối thủ biết sẽ kiện bạn.", isCorrect: false, feedback: "Không hẳn." },
                    { text: "Vì nói xấu đối thủ làm giảm uy tín chuyên nghiệp của chính bạn và tạo cảm giác phòng thủ cho khách...", isCorrect: true, feedback: "Chính xác! Hãy tập trung nói về thế mạnh của mình thay vì hạ bệ người khác." },
                    { text: "Vì đối thủ thực ra rất tốt.", isCorrect: false, feedback: "Không liên quan." }
                ]
            },
            {
                context: "Khách hàng chê đề xuất của bạn 'quá phức tạp'. Bạn nên điều chỉnh thế nào?",
                options: [
                    { text: "Yêu cầu khách hàng tự đi học để hiểu.", isCorrect: false, feedback: "Thái độ không thể chấp nhận được!" },
                    { text: "Đơn giản hóa đề xuất thành bảng so sánh tóm tắt một trang (One-pager) tập trung vào ROI...", isCorrect: true, feedback: "Chuẩn chuyên gia! Khách hàng bận rộn cần sự tinh gọn và kết quả tài chính." },
                    { text: "Gửi thêm 50 trang tài liệu kỹ thuật để chứng minh.", isCorrect: false, feedback: "Gửi thêm tài liệu chỉ làm họ thêm quá tải." }
                ]
            }
        ];

        games.forEach(g => {
            const targetCount = g.level === 1 ? 8 : (g.level === 2 ? 12 : 16);
            if (g.questions.length < targetCount) {
                let poolIdx = 0;
                while (g.questions.length < targetCount) {
                    const pQ = pool[poolIdx % pool.length];
                    g.questions.push({
                        context: `[Luyện tập] ${pQ.context}`,
                        options: JSON.parse(JSON.stringify(pQ.options))
                    });
                    poolIdx++;
                }
            }
        });
    }

    padGameQuestions();


    let currentQIndex = 0;
    let score = 0;
    let timerInterval = null;
    let userAnswers = [];
    let timeLeft = 15;

    const gameSelector = document.getElementById('game-selector');
    const gameIntro = document.getElementById('game-intro');
    const gamePlay = document.getElementById('game-play');
    const gameResult = document.getElementById('game-result');
    
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backToSelectorBtn = document.getElementById('back-to-selector');
    const selectorBtn = document.getElementById('selector-btn');
    
    const introGameTitle = document.getElementById('intro-game-title');
    const introGameDesc = document.getElementById('intro-game-desc');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMsg = document.getElementById('feedback-msg');
    const progressBar = document.getElementById('progress');
    const timerDisplay = document.getElementById('timer-display');

    // Horizontal Slide & Level Selector Logic
    let autoSlideInterval = null;
    let currentSlideIndex = 0;

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            const container = document.querySelector('.game-slider-container');
            const track = document.getElementById('game-slider-track');
            if (!container || !track) return;
            const cards = track.querySelectorAll('.game-card');
            if (cards.length <= 1) return;
            
            currentSlideIndex = (currentSlideIndex + 1) % cards.length;
            const targetCard = cards[currentSlideIndex];
            if (targetCard) {
                const targetLeft = targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;
                container.scrollTo({ left: targetLeft, behavior: 'smooth' });
            }
        }, 3500);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Dynamic Render Minigames based on selected Level & Track Played Games
    function renderGamesForLevel(level) {
        const track = document.getElementById('game-slider-track');
        const prevBtn = document.getElementById('slider-prev-btn');
        const nextBtn = document.getElementById('slider-next-btn');
        const indicator = document.getElementById('slider-indicator');
        if (!track) return;
        
        const completedGames = JSON.parse(localStorage.getItem('completed_games') || '[]');
        const levelGames = games.filter(g => g.level === parseInt(level, 10));
        
        // Update level tab button text dynamically
        updateTabCounts();

        // Show navigation buttons
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
        
        const completedCount = levelGames.filter(g => completedGames.includes(g.id)).length;
        if (indicator) {
            indicator.textContent = `Đã hoàn thành: ${completedCount} / ${levelGames.length}`;
        }
        
        track.innerHTML = levelGames.map(game => {
            const globalIndex = games.findIndex(g => g.id === game.id);
            const isCompleted = completedGames.includes(game.id);
            const icon = game.icon || "🧠";
            
            const badgeHtml = isCompleted 
                ? `<span style="font-size: 0.72rem; font-weight: bold; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1.5px solid #10b981; padding: 2px 8px; border-radius: 20px;">✓ Đã Hoàn Thành</span>`
                : `<span style="font-size: 0.72rem; font-weight: bold; background: rgba(243, 168, 59, 0.15); color: #f3a83b; border: 1.5px solid #f3a83b; padding: 2px 8px; border-radius: 20px;">Chưa Chơi</span>`;

            return `
                <div class="game-card glass-panel" style="padding: 20px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; border: 1px solid var(--border-color); border-radius: 12px; background: rgba(255, 255, 255, 0.6); position: relative; width: 230px;" data-game-index="${globalIndex}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 1.8rem;">${icon}</span>
                        ${badgeHtml}
                    </div>
                    <h4 style="font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text-main);">${game.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-light); flex: 1; margin: 5px 0 0 0; line-height: 1.35;">${game.description}</p>
                    <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" style="padding: 8px 12px; font-size: 0.85rem; margin-top: 15px; width: 100%;">
                        ${isCompleted ? 'Chơi Lại' : 'Chơi Ngay'}
                    </button>
                </div>
            `;
        }).join('');
        
        // Re-attach selection events
        const cards = track.querySelectorAll('.game-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.getAttribute('data-game-index'), 10);
                selectGame(idx);
            });
            
            const btn = card.querySelector('button');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(card.getAttribute('data-game-index'), 10);
                    selectGame(idx);
                });
            }
        });

        // Add Hover triggers to pause/resume auto-slide
        const container = document.querySelector('.game-slider-container');
        if (container) {
            container.removeEventListener('mouseenter', stopAutoSlide);
            container.removeEventListener('mouseleave', startAutoSlide);
            container.addEventListener('mouseenter', stopAutoSlide);
            container.addEventListener('mouseleave', startAutoSlide);
            
            // Also pause on touch interaction for mobile robustness
            container.removeEventListener('touchstart', stopAutoSlide);
            container.addEventListener('touchstart', stopAutoSlide, { passive: true });
            
            container.scrollLeft = 0;
        }

        currentSlideIndex = 0;
        startAutoSlide();
    }

    // Reset Level Progress
    function resetLevelProgress(level) {
        let completedGames = JSON.parse(localStorage.getItem('completed_games') || '[]');
        const levelGameIds = games.filter(g => g.level === level).map(g => g.id);
        completedGames = completedGames.filter(id => !levelGameIds.includes(id));
        localStorage.setItem('completed_games', JSON.stringify(completedGames));
        
        // Re-render
        renderGamesForLevel(level);
        updateTabCounts();
    }

    // Dynamic Level tab count updater
    function updateTabCounts() {
        const completedGames = JSON.parse(localStorage.getItem('completed_games') || '[]');
        [1, 2, 3].forEach(lvl => {
            const tab = document.querySelector(`.level-tab-btn[data-level="${lvl}"]`);
            if (tab) {
                let baseText = "";
                if (lvl === 1) baseText = "Dưới 1 Năm (Tân Binh)";
                else if (lvl === 2) baseText = "1 - 3 Năm (Chiến Binh)";
                else baseText = "Trên 3 Năm (Chuyên Gia)";
                
                const levelGames = games.filter(g => g.level === lvl);
                const unplayed = levelGames.filter(g => !completedGames.includes(g.id)).length;
                
                tab.innerHTML = `${baseText} <span style="font-size: 0.8rem; font-weight: bold; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 10px; margin-left: 5px;">${unplayed}/${levelGames.length}</span>`;
            }
        });
    }

    // Wire up Level tab click triggers
    const levelTabs = document.querySelectorAll('.level-tab-btn');
    levelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            levelTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'rgba(255,255,255,0.05)';
                t.style.borderColor = 'var(--border-color)';
                t.style.color = 'var(--text-main)';
                t.style.boxShadow = 'none';
            });
            tab.classList.add('active');
            tab.style.background = 'var(--primary)';
            tab.style.borderColor = 'var(--primary)';
            tab.style.color = '#fff';
            tab.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            
            const level = tab.getAttribute('data-level');
            renderGamesForLevel(level);
        });
    });

    // Setup Slider Scroll Indicator Tracker
    const sliderContainer = document.querySelector('.game-slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('scroll', () => {
            const cards = sliderContainer.querySelectorAll('.game-card');
            if (cards.length === 0) return;
            const containerCenter = sliderContainer.scrollLeft + sliderContainer.clientWidth / 2;
            let closestIndex = 0;
            let minDiff = Infinity;
            cards.forEach((card, idx) => {
                const cardCenter = card.offsetLeft + card.clientWidth / 2;
                const diff = Math.abs(containerCenter - cardCenter);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = idx;
                }
            });
            currentSlideIndex = closestIndex;
            const ind = document.getElementById('slider-indicator');
            if (ind) {
                ind.textContent = `Thử thách ${closestIndex + 1} / ${cards.length}`;
            }
        });
    }

    // Initialize level counts and load Level 1 games
    updateTabCounts();
    renderGamesForLevel(1);

    // Auto-select game from query parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    if (gameId) {
        const gameIdx = games.findIndex(g => g.id === 'game-' + gameId || g.id === gameId);
        if (gameIdx !== -1) {
            setTimeout(() => {
                const targetGame = games[gameIdx];
                const tab = document.querySelector(`.level-tab-btn[data-level="${targetGame.level}"]`);
                if (tab) {
                    // Trigger level tab change visually
                    const levelTabs = document.querySelectorAll('.level-tab-btn');
                    levelTabs.forEach(t => {
                        t.classList.remove('active');
                        t.style.background = 'rgba(255,255,255,0.05)';
                        t.style.borderColor = 'var(--border-color)';
                        t.style.color = 'var(--text-main)';
                        t.style.boxShadow = 'none';
                    });
                    tab.classList.add('active');
                    tab.style.background = 'var(--primary)';
                    tab.style.borderColor = 'var(--primary)';
                    tab.style.color = '#fff';
                    tab.style.boxShadow = '0 0 15px var(--primary-glow)';
                    renderGamesForLevel(targetGame.level);
                }
                selectGame(gameIdx);
            }, 300);
        }
    }

    // B2B Challenge Slider Navigation Arrow click triggers
    const sliderPrevBtn = document.getElementById('slider-prev-btn');
    const sliderNextBtn = document.getElementById('slider-next-btn');

    if (sliderPrevBtn) {
        sliderPrevBtn.addEventListener('click', () => {
            const container = document.querySelector('.game-slider-container');
            const track = document.getElementById('game-slider-track');
            if (!container || !track) return;
            const cards = track.querySelectorAll('.game-card');
            if (cards.length === 0) return;

            currentSlideIndex = (currentSlideIndex - 1 + cards.length) % cards.length;
            const targetCard = cards[currentSlideIndex];
            if (targetCard) {
                const targetLeft = targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;
                container.scrollTo({ left: targetLeft, behavior: 'smooth' });
            }
            // Temporarily pause auto slide to let reader focus
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000);
        });
    }

    if (sliderNextBtn) {
        sliderNextBtn.addEventListener('click', () => {
            const container = document.querySelector('.game-slider-container');
            const track = document.getElementById('game-slider-track');
            if (!container || !track) return;
            const cards = track.querySelectorAll('.game-card');
            if (cards.length === 0) return;

            currentSlideIndex = (currentSlideIndex + 1) % cards.length;
            const targetCard = cards[currentSlideIndex];
            if (targetCard) {
                const targetLeft = targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;
                container.scrollTo({ left: targetLeft, behavior: 'smooth' });
            }
            // Temporarily pause auto slide to let reader focus
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000);
        });
    }


    function selectGame(index) {
        try {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } catch (e) {}
        activeGameIndex = index;
        const activeGame = games[activeGameIndex];
        
        introGameTitle.textContent = activeGame.title;
        introGameDesc.textContent = activeGame.description;
        
        gameSelector.classList.add('hidden');
        gameIntro.classList.remove('hidden');

        // Smooth scroll to minigame section container
        const target = document.getElementById('minigame-section');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (backToSelectorBtn) {
        backToSelectorBtn.addEventListener('click', () => {
            gameIntro.classList.add('hidden');
            gameSelector.classList.remove('hidden');
        });
    }

    if (selectorBtn) {
        selectorBtn.addEventListener('click', () => {
            gameResult.classList.add('hidden');
            gameSelector.classList.remove('hidden');
        });
    }

    if(startBtn) {
        startBtn.addEventListener('click', () => {
            try {
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            } catch (e) {}
            startGame();
        });
        nextBtn.addEventListener('click', loadNextQuestion);
        restartBtn.addEventListener('click', () => {
             try {
                 if (audioCtx && audioCtx.state === 'suspended') {
                     audioCtx.resume();
                 }
             } catch (e) {}
             startGame();
        });
    }

    function startGame() {
        console.log('startGame() called, activeGameIndex =', activeGameIndex);
        currentQIndex = 0;
        score = 0;
        userAnswers = [];
        
        const activeGame = games[activeGameIndex];
        // Shuffle questions for this session to mix order
        activeGame.shuffledQuestions = [...activeGame.questions].sort(() => Math.random() - 0.5);

        gameIntro.classList.add('hidden');
        gameResult.classList.add('hidden');
        gamePlay.classList.remove('hidden');
        try {
            loadQuestion();
        } catch (e) {
            console.error('CRASH IN loadQuestion():', e.message, e.stack);
        }
    }

    function handlePuzzleSolved(pointsToAdd) {
        clearInterval(timerInterval);
        const activeGame = games[activeGameIndex];
        
        let completedGames = JSON.parse(localStorage.getItem('completed_games') || '[]');
        if (!completedGames.includes(activeGame.id)) {
            completedGames.push(activeGame.id);
            localStorage.setItem('completed_games', JSON.stringify(completedGames));
        }

        const currentPoints = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
        localStorage.setItem('b2b_points_balance', (currentPoints + pointsToAdd).toString());
        if (window.updateNavbarUserHUD) window.updateNavbarUserHUD();
        if (window.showPointToast) window.showPointToast(pointsToAdd, `Giải đố thành công!`);

        gamePlay.classList.add('hidden');
        gameResult.classList.remove('hidden');

        const result = activeGame.getResult(1);
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        const statsBox = document.getElementById('result-stats-box');
        
        if (resultTitle) {
            resultTitle.textContent = result.title;
            resultTitle.style.color = result.color;
        }
        if (resultText) {
            resultText.innerHTML = `${result.text}<br><br>🏆 Bạn nhận được <strong>+${pointsToAdd} BD-Points</strong> thưởng học tập!`;
        }

        if (statsBox) {
            statsBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>Thử thách:</span>
                    <strong>${activeGame.title}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Phần thưởng:</span>
                    <strong style="color: #6ee7b7;">+${pointsToAdd} BD-Points</strong>
                </div>
            `;
        }

        const reviewBtn = document.getElementById('btn-toggle-review');
        if (reviewBtn) reviewBtn.classList.add('hidden');
    }

    function renderPuzzleZip() {
        const container = document.getElementById('options-container');
        container.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; margin-bottom: 20px; font-size: 0.85rem; line-height: 1.45; text-align: left; max-width: 480px; margin-left: auto; margin-right: auto;">
                <h5 style="margin: 0 0 8px 0; font-weight: 800; color: var(--primary); font-size: 0.95rem;">⚡ QUY TẮC ĐƯỜNG ỐNG PIPELINE:</h5>
                • Điểm xuất phát: <strong>Leads Generated</strong> (màu xanh lá).<br>
                • Nhiệm vụ: Nối tiếp các bước bán hàng theo đúng thứ tự logic.<br>
                • Quy tắc: Bạn **chỉ được phép** click chọn các ô đứng sát cạnh nhau (ngang, dọc, chéo) để duy trì đường truyền dẫn của pipeline.<br>
                • Thứ tự nối: <strong>Leads Generated ➔ Cold Outreach ➔ Product Pitch ➔ Proposal Sent ➔ Contract Negotiated ➔ Deal Closed Won</strong>
            </div>
            <div id="zip-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 320px; margin: 0 auto; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 16px; border: 1px solid var(--border-color);">
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <button id="btn-reset-zip" class="btn btn-secondary" style="padding: 8px 20px; font-size: 0.85rem;">Chơi Lại</button>
            </div>
        `;

        const gridData = [
            { type: 'start', label: 'Leads Generated', seq: 1 },
            { type: 'step2', label: 'Cold Outreach', seq: 2 },
            { type: 'blocked', label: 'Budget Frozen (Chặn)', seq: 0 },
            { type: 'blocked', label: 'No Response (Chặn)', seq: 0 },
            
            { type: 'blocked', label: 'Competitor Win (Chặn)', seq: 0 },
            { type: 'step3', label: 'Product Pitch', seq: 3 },
            { type: 'blocked', label: 'Ghosted (Chặn)', seq: 0 },
            { type: 'blocked', label: 'Price Shock (Chặn)', seq: 0 },
            
            { type: 'blocked', label: 'No Decision (Chặn)', seq: 0 },
            { type: 'step4', label: 'Proposal Sent', seq: 4 },
            { type: 'step5', label: 'Contract Negotiated', seq: 5 },
            { type: 'blocked', label: 'Legal Delay (Chặn)', seq: 0 },
            
            { type: 'blocked', label: 'Wrong PIC (Chặn)', seq: 0 },
            { type: 'blocked', label: 'Bad Timing (Chặn)', seq: 0 },
            { type: 'blocked', label: 'Lost Lead (Chặn)', seq: 0 },
            { type: 'end', label: 'Deal Closed Won', seq: 6 }
        ];

        const gridEl = document.getElementById('zip-grid');
        let currentStep = 1;
        let lastClickedIdx = 0; // Starts at Leads Generated (index 0)

        gridData.forEach((cell, idx) => {
            const btn = document.createElement('button');
            btn.style.aspectRatio = '1/1';
            btn.style.borderRadius = '10px';
            btn.style.border = '1px solid rgba(255,255,255,0.05)';
            btn.style.fontFamily = 'inherit';
            btn.style.fontSize = '0.72rem';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = cell.type === 'blocked' ? 'not-allowed' : 'pointer';
            btn.style.padding = '5px';
            btn.style.transition = 'all 0.2s';
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.gap = '4px';

            if (cell.type === 'start') {
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
                btn.style.color = '#fff';
            } else if (cell.type === 'end') {
                btn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                btn.style.color = '#fff';
            } else if (cell.type === 'blocked') {
                btn.style.background = 'rgba(255,255,255,0.02)';
                btn.style.color = 'var(--text-light)';
                btn.style.opacity = '0.4';
            } else {
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.color = 'var(--text-main)';
            }

            btn.innerHTML = `
                <span style="font-size: 1.1rem;">${cell.type === 'start' ? '🦉' : cell.type === 'end' ? '🤝' : cell.type === 'blocked' ? '❌' : '⚡'}</span>
                <span style="font-size: 0.6rem; text-align: center; line-height: 1.2;">${cell.label}</span>
            `;

            btn.addEventListener('click', () => {
                if (cell.type === 'blocked') {
                    sfx.wrong();
                    alert(`🚫 Ô bị chặn: "${cell.label}"!\nDự án B2B bị đóng băng tại đây. Hãy tìm đường vòng qua ô khác nhé!`);
                    return;
                }
                
                // Enforce physical adjacency from last clicked cell
                if (currentStep > 1) {
                    const r1 = Math.floor(lastClickedIdx / 4);
                    const c1 = lastClickedIdx % 4;
                    const r2 = Math.floor(idx / 4);
                    const c2 = idx % 4;
                    if (Math.abs(r1 - r2) > 1 || Math.abs(c1 - c2) > 1) {
                        sfx.wrong();
                        alert("⚠️ Lỗi đứt quãng đường ống!\nBạn chỉ được chọn bước tiếp theo nằm sát cạnh (ngang, dọc, chéo) của bước vừa chọn trước đó.");
                        return;
                    }
                }

                if (cell.seq === currentStep) {
                    btn.style.background = 'linear-gradient(135deg, #f3a83b 0%, #d97706 100%)';
                    btn.style.color = '#fff';
                    btn.style.boxShadow = '0 0 15px rgba(243, 168, 59, 0.4)';
                    sfx.correct();
                    lastClickedIdx = idx;
                    
                    if (currentStep === 6) {
                        setTimeout(() => handlePuzzleSolved(15), 500);
                    } else {
                        currentStep++;
                    }
                } else {
                    sfx.wrong();
                    alert(`Sai trình tự quy trình bán hàng!\nBạn phải nối tiếp theo đúng trình tự logic (Bước tiếp theo cần tìm là bước số ${currentStep}).`);
                }
            });

            gridEl.appendChild(btn);
        });

        document.getElementById('btn-reset-zip').addEventListener('click', renderPuzzleZip);
    }

    function renderPuzzleWend() {
        const container = document.getElementById('options-container');
        container.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; margin-bottom: 20px; font-size: 0.85rem; line-height: 1.45; text-align: left; max-width: 480px; margin-left: auto; margin-right: auto;">
                <h5 style="margin: 0 0 8px 0; font-weight: 800; color: var(--primary); font-size: 0.95rem;">🔍 LUẬT CHƠI WORD SEARCH:</h5>
                • Nhiệm vụ: Tìm 3 từ khóa B2B ẩn giấu: <strong style="color: var(--primary);">LEAD</strong>, <strong style="color: var(--primary);">DEAL</strong>, <strong style="color: var(--primary);">SPIN</strong>.<br>
                • Quy tắc nối chữ: Các chữ cái được chọn **phải nằm sát nhau** (ngang hoặc dọc) để tạo thành từ có nghĩa.<br>
                • Cách chọn: Click từng chữ cái kế tiếp nhau. Khi ghép đủ từ chính xác, hệ thống sẽ tự động chuyển màu xanh và ghi nhận.
            </div>
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 12px; font-size: 0.88rem; font-weight: bold;">
                <span id="word-lead" style="color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px;">[ ] LEAD</span>
                <span id="word-deal" style="color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px;">[ ] DEAL</span>
                <span id="word-spin" style="color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px;">[ ] SPIN</span>
            </div>
            <div id="selected-word" style="text-align: center; font-size: 1.1rem; font-weight: 800; min-height: 25px; color: var(--primary); margin-bottom: 10px;">
                Đang chọn: -
            </div>
            <div id="wend-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; max-width: 280px; margin: 0 auto; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);">
            </div>
            <div style="text-align: center; margin-top: 12px; display: flex; justify-content: center; gap: 10px;">
                <button id="btn-clear-wend" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">Xóa Chọn</button>
                <button id="btn-reset-wend" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">Chơi Lại</button>
            </div>
        `;

        const gridLetters = [
            ['L', 'E', 'A', 'D', 'X', 'P'],
            ['K', 'S', 'P', 'I', 'N', 'D'],
            ['Q', 'W', 'D', 'E', 'A', 'L'],
            ['A', 'O', 'Z', 'M', 'N', 'K'],
            ['P', 'I', 'P', 'E', 'L', 'I'],
            ['S', 'A', 'L', 'E', 'S', 'T']
        ];

        const gridEl = document.getElementById('wend-grid');
        let selectedIndices = [];
        let currentSelectedWord = '';
        const foundWords = { LEAD: false, DEAL: false, SPIN: false };

        gridLetters.forEach((row, rIdx) => {
            row.forEach((letter, cIdx) => {
                const btn = document.createElement('button');
                btn.textContent = letter;
                btn.style.aspectRatio = '1/1';
                btn.style.borderRadius = '8px';
                btn.style.background = 'rgba(255,255,255,0.04)';
                btn.style.color = 'var(--text-main)';
                btn.style.border = '1px solid rgba(255,255,255,0.02)';
                btn.style.fontWeight = '800';
                btn.style.fontSize = '1rem';
                btn.style.cursor = 'pointer';
                btn.style.transition = 'all 0.15s';
                
                const cellId = `${rIdx}-${cIdx}`;
                btn.id = `cell-${cellId}`;

                btn.addEventListener('click', () => {
                    if (selectedIndices.includes(cellId)) return;
                    
                    // Enforce adjacency to the previously selected cell
                    if (selectedIndices.length > 0) {
                        const prevCell = selectedIndices[selectedIndices.length - 1];
                        const [prevR, prevC] = prevCell.split('-').map(Number);
                        const rowDiff = Math.abs(rIdx - prevR);
                        const colDiff = Math.abs(cIdx - prevC);
                        if (rowDiff > 1 || colDiff > 1) {
                            sfx.wrong();
                            alert("⚠️ Lỗi nối chữ!\nChữ cái tiếp theo phải nằm ngay sát cạnh chữ cái trước đó để tạo thành chuỗi liên tục.");
                            return;
                        }
                    }
                    
                    selectedIndices.push(cellId);
                    btn.style.background = 'var(--primary)';
                    btn.style.color = '#fff';
                    btn.style.boxShadow = '0 0 10px var(--primary-glow)';

                    currentSelectedWord += letter;
                    document.getElementById('selected-word').textContent = `Đang chọn: ${currentSelectedWord}`;

                    if (foundWords[currentSelectedWord] === false) {
                        foundWords[currentSelectedWord] = true;
                        sfx.correct();
                        
                        const label = document.getElementById(`word-${currentSelectedWord.toLowerCase()}`);
                        if (label) {
                            label.style.color = '#10b981';
                            label.innerHTML = `✓ ${currentSelectedWord}`;
                        }

                        selectedIndices.forEach(id => {
                            const el = document.getElementById(`cell-${id}`);
                            if (el) {
                                el.style.background = '#047857';
                                el.style.color = '#fff';
                                el.style.boxShadow = 'none';
                                el.disabled = true;
                            }
                        });

                        selectedIndices = [];
                        currentSelectedWord = '';
                        document.getElementById('selected-word').textContent = `Đang chọn: -`;

                        if (Object.values(foundWords).every(v => v === true)) {
                            setTimeout(() => handlePuzzleSolved(20), 600);
                        }
                    }
                });

                gridEl.appendChild(btn);
            });
        });

        document.getElementById('btn-clear-wend').addEventListener('click', () => {
            selectedIndices.forEach(id => {
                const el = document.getElementById(`cell-${id}`);
                if (el && !el.disabled) {
                    el.style.background = 'rgba(255,255,255,0.04)';
                    el.style.color = 'var(--text-main)';
                    el.style.boxShadow = 'none';
                }
            });
            selectedIndices = [];
            currentSelectedWord = '';
            document.getElementById('selected-word').textContent = `Đang chọn: -`;
        });

        document.getElementById('btn-reset-wend').addEventListener('click', renderPuzzleWend);
    }

    function renderPuzzleTango() {
        const container = document.getElementById('options-container');
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 12px; color: var(--text-light); font-size: 0.85rem; line-height: 1.4;">
                Mỗi hàng & cột có đúng hai 🤝 và hai ❌.<br>
                Không được có 3 biểu tượng giống nhau đứng cạnh nhau. Click để đổi ô.
            </div>
            <div id="tango-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 240px; margin: 0 auto; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 16px; border: 1px solid var(--border-color);">
            </div>
            <div style="text-align: center; margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
                <button id="btn-verify-tango" class="btn btn-primary" style="padding: 8px 20px; font-size: 0.85rem;">Xác Nhận</button>
                <button id="btn-reset-tango" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">Chơi Lại</button>
            </div>
        `;

        const initialGrid = [
            [1, 0, 0, -1],
            [0, 1, 0, 0],
            [0, 0, -1, 0],
            [-1, 0, 0, 1]
        ];

        const targetSolution = [
            [1, -1, 1, -1],
            [-1, 1, -1, 1],
            [1, -1, -1, 1],
            [-1, 1, 1, -1]
        ];

        const currentGrid = JSON.parse(JSON.stringify(initialGrid));
        const gridEl = document.getElementById('tango-grid');

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const btn = document.createElement('button');
                btn.style.aspectRatio = '1/1';
                btn.style.borderRadius = '10px';
                btn.style.fontSize = '1.5rem';
                btn.style.fontWeight = 'bold';
                btn.style.border = '1px solid rgba(255,255,255,0.05)';
                btn.style.transition = 'all 0.15s';
                
                const val = initialGrid[r][c];
                if (val !== 0) {
                    btn.textContent = val === 1 ? '🤝' : '❌';
                    btn.style.background = 'rgba(255,255,255,0.08)';
                    btn.style.cursor = 'not-allowed';
                    btn.disabled = true;
                } else {
                    btn.textContent = '';
                    btn.style.background = 'rgba(0,0,0,0.3)';
                    btn.style.cursor = 'pointer';
                    
                    btn.addEventListener('click', () => {
                        if (currentGrid[r][c] === 0) {
                            currentGrid[r][c] = 1;
                            btn.textContent = '🤝';
                            btn.style.background = 'rgba(16, 185, 129, 0.15)';
                            btn.style.borderColor = '#10b981';
                        } else if (currentGrid[r][c] === 1) {
                            currentGrid[r][c] = -1;
                            btn.textContent = '❌';
                            btn.style.background = 'rgba(239, 68, 68, 0.15)';
                            btn.style.borderColor = '#ef4444';
                        } else {
                            currentGrid[r][c] = 0;
                            btn.textContent = '';
                            btn.style.background = 'rgba(0,0,0,0.3)';
                            btn.style.borderColor = 'rgba(255,255,255,0.05)';
                        }
                    });
                }
                gridEl.appendChild(btn);
            }
        }

        document.getElementById('btn-verify-tango').addEventListener('click', () => {
            // Check if there are empty cells
            let hasEmpty = false;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (currentGrid[r][c] === 0) hasEmpty = true;
                }
            }
            if (hasEmpty) {
                sfx.wrong();
                alert("⚠️ Chưa hoàn thành!\nVui lòng điền kín tất cả các ô trên lưới trước khi nhấn xác nhận.");
                return;
            }

            // Check row totals (each row must have exactly two 🤝 and two ❌, sum must be 0)
            let rowErrors = [];
            for (let r = 0; r < 4; r++) {
                let sum = currentGrid[r].reduce((a, b) => a + b, 0);
                if (sum !== 0) {
                    rowErrors.push(r + 1);
                }
            }

            // Check col totals (each col must have exactly two 🤝 and two ❌, sum must be 0)
            let colErrors = [];
            for (let c = 0; c < 4; c++) {
                let sum = 0;
                for (let r = 0; r < 4; r++) {
                    sum += currentGrid[r][c];
                }
                if (sum !== 0) {
                    colErrors.push(c + 1);
                }
            }

            // Check consecutive triples in rows
            let tripleErrors = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 2; c++) {
                    if (currentGrid[r][c] !== 0 && 
                        currentGrid[r][c] === currentGrid[r][c+1] && 
                        currentGrid[r][c] === currentGrid[r][c+2]) {
                        tripleErrors.push(`Hàng ${r+1}`);
                    }
                }
            }

            // Check consecutive triples in cols
            for (let c = 0; c < 4; c++) {
                for (let r = 0; r < 2; r++) {
                    if (currentGrid[r][c] !== 0 && 
                        currentGrid[r][c] === currentGrid[r+1][c] && 
                        currentGrid[r][c] === currentGrid[r+2][c]) {
                        tripleErrors.push(`Cột ${c+1}`);
                    }
                }
            }

            if (rowErrors.length === 0 && colErrors.length === 0 && tripleErrors.length === 0) {
                sfx.correct();
                handlePuzzleSolved(20);
            } else {
                sfx.wrong();
                let errMsg = "❌ Sai rồi bác ơi! Hãy kiểm tra lại các lỗi sau:\n";
                if (rowErrors.length > 0) {
                    errMsg += `• Hàng ${rowErrors.join(', ')}: số lượng 🤝 và ❌ chưa bằng nhau (phải có đúng 2 chiếc mỗi loại).\n`;
                }
                if (colErrors.length > 0) {
                    errMsg += `• Cột ${colErrors.join(', ')}: số lượng 🤝 và ❌ chưa bằng nhau (phải có đúng 2 chiếc mỗi loại).\n`;
                }
                if (tripleErrors.length > 0) {
                    errMsg += `• Có 3 biểu tượng giống nhau đứng cạnh nhau tại: ${[...new Set(tripleErrors)].join(', ')}.\n`;
                }
                alert(errMsg + "\nHãy tư duy và sắp xếp lại nhé!");
            }
        });

        document.getElementById('btn-reset-tango').addEventListener('click', renderPuzzleTango);
    }

    function renderPuzzleQueens() {
        const container = document.getElementById('options-container');
        container.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; margin-bottom: 20px; font-size: 0.85rem; line-height: 1.45; text-align: left; max-width: 480px; margin-left: auto; margin-right: auto;">
                <h5 style="margin: 0 0 8px 0; font-weight: 800; color: var(--primary); font-size: 0.95rem;">👑 QUY TẮC ĐỊA BÀN BD STAR (4 QUEENS):</h5>
                • Nhiệm vụ: Đặt đúng **4 vương miện** (👑) lên lưới 4x4 đại diện cho địa bàn quản lý của 4 BD Star.<br>
                • Quy tắc không trùng lặp: Không được có bất kỳ 2 vương miện nào nằm **chung một hàng ngang, hàng dọc, hoặc đường chéo chéo nhau** (để tránh xung đột thị trường).<br>
                • Click vào ô để đặt hoặc hủy vương miện. Ô bị xung đột sẽ tự động đổi màu đỏ.
            </div>
            <div id="queens-status" style="text-align: center; font-size: 1rem; font-weight: 800; color: var(--primary); margin-bottom: 12px;">
                Đã đặt: 0 / 4 Vương miện 👑
            </div>
            <div id="queens-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 240px; margin: 0 auto; background: rgba(0,0,0,0.25); padding: 15px; border-radius: 16px; border: 1px solid var(--border-color);">
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <button id="btn-reset-queens" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">Chơi Lại</button>
            </div>
        `;

        const board = Array(4).fill(0).map(() => Array(4).fill(false));
        const gridEl = document.getElementById('queens-grid');
        const buttons = [];

        for (let r = 0; r < 4; r++) {
            buttons[r] = [];
            for (let c = 0; c < 4; c++) {
                const btn = document.createElement('button');
                btn.style.aspectRatio = '1/1';
                btn.style.borderRadius = '10px';
                btn.style.fontSize = '1.8rem';
                btn.style.border = '1px solid rgba(255,255,255,0.05)';
                btn.style.background = 'rgba(0,0,0,0.3)';
                btn.style.cursor = 'pointer';
                btn.style.transition = 'all 0.15s';
                
                btn.addEventListener('click', () => {
                    board[r][c] = !board[r][c];
                    sfx.tick();
                    updateQueensBoard();
                });
                
                gridEl.appendChild(btn);
                buttons[r][c] = btn;
            }
        }

        function updateQueensBoard() {
            let queenCoords = [];
            let conflictCoords = new Set();
            let totalQueens = 0;

            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (board[r][c]) {
                        queenCoords.push({ r, c });
                        totalQueens++;
                    }
                }
            }

            for (let i = 0; i < queenCoords.length; i++) {
                for (let j = i + 1; j < queenCoords.length; j++) {
                    const q1 = queenCoords[i];
                    const q2 = queenCoords[j];
                    
                    const sameRow = q1.r === q2.r;
                    const sameCol = q1.c === q2.c;
                    const sameDiag = Math.abs(q1.r - q2.r) === Math.abs(q1.c - q2.c);

                    if (sameRow || sameCol || sameDiag) {
                        conflictCoords.add(`${q1.r}-${q1.c}`);
                        conflictCoords.add(`${q2.r}-${q2.c}`);
                    }
                }
            }

            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const btn = buttons[r][c];
                    const isQueen = board[r][c];
                    const hasConflict = conflictCoords.has(`${r}-${c}`);

                    if (isQueen) {
                        btn.textContent = '👑';
                        if (hasConflict) {
                            btn.style.background = 'rgba(239, 68, 68, 0.25)';
                            btn.style.borderColor = '#ef4444';
                            btn.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
                        } else {
                            btn.style.background = 'rgba(243, 168, 59, 0.2)';
                            btn.style.borderColor = '#f3a83b';
                            btn.style.boxShadow = '0 0 10px rgba(243, 168, 59, 0.4)';
                        }
                    } else {
                        btn.textContent = '';
                        btn.style.background = 'rgba(0,0,0,0.3)';
                        btn.style.borderColor = 'rgba(255,255,255,0.05)';
                        btn.style.boxShadow = 'none';
                    }
                }
            }

            const statusEl = document.getElementById('queens-status');
            if (statusEl) {
                if (conflictCoords.size > 0) {
                    statusEl.style.color = '#ef4444';
                    statusEl.innerHTML = `Đã đặt: ${totalQueens} / 4 👑 <span style="font-size: 0.82rem; font-weight: normal; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 8px; border-radius: 4px; margin-left: 5px;">Xung đột địa bàn! ❌</span>`;
                } else if (totalQueens === 4) {
                    statusEl.style.color = '#10b981';
                    statusEl.innerHTML = `Đã đặt: 4 / 4 👑 <span style="font-size: 0.82rem; font-weight: normal; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px; margin-left: 5px;">Thành công tối ưu! ✅</span>`;
                } else {
                    statusEl.style.color = 'var(--primary)';
                    statusEl.textContent = `Đã đặt: ${totalQueens} / 4 Vương miện 👑`;
                }
            }

            if (totalQueens === 4 && conflictCoords.size === 0) {
                sfx.correct();
                setTimeout(() => handlePuzzleSolved(25), 600);
            }
        }

        document.getElementById('btn-reset-queens').addEventListener('click', renderPuzzleQueens);
    }

    function loadQuestion() {
        console.log('loadQuestion() called, currentQIndex =', currentQIndex);
        
        const activeGame = games[activeGameIndex];
        console.log('activeGame =', activeGame ? activeGame.id : 'none');

        // Check if game is a custom interactive puzzle type
        if (activeGame.type && activeGame.type.startsWith('puzzle_')) {
            clearInterval(timerInterval);
            if (timerDisplay) timerDisplay.classList.add('hidden');
            questionText.textContent = activeGame.title;
            progressBar.style.width = '100%';
            optionsContainer.innerHTML = '';
            
            if (activeGame.type === 'puzzle_zip') {
                renderPuzzleZip();
            } else if (activeGame.type === 'puzzle_wend') {
                renderPuzzleWend();
            } else if (activeGame.type === 'puzzle_tango') {
                renderPuzzleTango();
            } else if (activeGame.type === 'puzzle_queens') {
                renderPuzzleQueens();
            }
            return;
        }

        nextBtn.classList.add('hidden');
        feedbackMsg.classList.add('hidden');
        
        const feedbackOwl = document.getElementById('feedback-owl');
        if (feedbackOwl) feedbackOwl.classList.add('hidden');

        optionsContainer.innerHTML = '';
        clearInterval(timerInterval);
        
        // activeGame is already declared above
        const q = (activeGame.shuffledQuestions && activeGame.shuffledQuestions[currentQIndex]) || activeGame.questions[currentQIndex];
        console.log('q =', q ? q.context : 'none');
        questionText.textContent = `Câu ${currentQIndex + 1}/${activeGame.questions.length}: ${q.context}`;
        progressBar.style.width = `${((currentQIndex) / activeGame.questions.length) * 100}%`;

        // Timer setup
        timeLeft = 15;
        if(timerDisplay) {
            timerDisplay.textContent = `${timeLeft}s`;
            timerDisplay.classList.remove('hidden');
        }
        
        timerInterval = setInterval(() => {
            timeLeft--;
            if(timerDisplay) timerDisplay.textContent = `${timeLeft}s`;
            
            if (timeLeft <= 5 && timeLeft > 0) sfx.tick();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timeOutAction(q.options);
            }
        }, 1000);

        // Shuffle options for all games to mix up the answers
        let displayOptions = [...q.options];
        displayOptions.sort(() => Math.random() - 0.5);

        displayOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                if(timeLeft > 0) selectAnswer(opt, btn, q.options);
            });
            optionsContainer.appendChild(btn);
        });
    }

    const owlCorrect = [
        { emoji: "🦉✨", quote: "Cú BeeDee Thông Thái gật gù: Đúng rồi! Đỉnh chóp em ơi! ✨" },
        { emoji: "🦉😎", quote: "Cú BeeDee Thông Thái cười tươi: Chuẩn không cần chỉnh, sếp Peter Võ khen! 😎" },
        { emoji: "🦉👏", quote: "Cú BeeDee Thông Thái vỗ cánh: Hay quá, thần thái chuyên gia đây rồi! 👏" },
        { emoji: "🦉🔥", quote: "Cú BeeDee Thông Thái tự hào: Nuột nà! Đóng deal này chắc rồi! 🔥" }
    ];

    const owlWrong = [
        { emoji: "🦉🤦‍♂️", quote: "Cú BeeDee Thông Thái lắc đầu: Nghiệp dư quá em ơi! Ăn cơm trưa ngắm cảnh à? 🤦‍♂️" },
        { emoji: "🦉🥺", quote: "Cú BeeDee Thông Thái thở dài: Ui là trời! Trả lời thế này là mất deal rồi! 🥺" },
        { emoji: "🦉🧐", quote: "Cú BeeDee Thông Thái nhíu mày: Đọc kỹ hướng dẫn sử dụng sếp Peter Võ trước khi dùng! 🧐" },
        { emoji: "🦉😱", quote: "Cú BeeDee Thông Thái té xỉu: Úi giời! Khách chạy mất dép rồi em ơi! 😱" },
        { emoji: "🦉🥶", quote: "Cú BeeDee Thông Thái đóng băng: Khách từ chối nhẹ nhàng nhưng đau đớn... 🥶" }
    ];

    function timeOutAction(allOptionsData) {
        sfx.wrong();
        const allBtns = optionsContainer.querySelectorAll('.btn-option');
        allBtns.forEach(b => b.disabled = true);
        
        feedbackMsg.classList.remove('hidden');
        feedbackMsg.className = 'feedback-msg error';
        feedbackMsg.style.background = 'rgba(185, 28, 28, 0.1)';
        feedbackMsg.style.border = '1px solid #b91c1c';
        feedbackMsg.style.color = '#991b1b';
        
        const activeGame = games[activeGameIndex];
        
        if (activeGame.type === 'scenario_challenge') {
            const correctOpt = allOptionsData.find(o => o.isCorrect);
            allBtns.forEach(b => {
                if (correctOpt && b.textContent === correctOpt.text) {
                    b.classList.add('correct');
                }
            });
        } else {
            const bestOpt = allOptionsData.find(o => o.points === 2);
            allBtns.forEach(b => {
                if (bestOpt && b.textContent === bestOpt.text) {
                    b.style.background = 'rgba(21, 128, 61, 0.15)';
                    b.style.border = '2px solid #15803d';
                    b.style.color = '#166534';
                }
            });
        }

        userAnswers.push({ text: "Không trả lời (Hết giờ)", isCorrect: false });

        const mascotImg = document.getElementById('mascot-img');
        const feedbackTextEl = document.getElementById('feedback-text');
        
        if (mascotImg) mascotImg.src = 'mascot_rain.jpg?v=1.0.4';

        const picked = owlWrong[Math.floor(Math.random() * owlWrong.length)];
        let feedbackText = `<strong>HẾT GIỜ! Bạn đã chậm chân. Một chuyên gia cần phản ứng nhanh hơn.</strong><br><br><strong>🦉 BD Mascot: "${picked.quote}"</strong><br><br>`;
        if (activeGame.type === 'scenario_challenge') {
            const correctOpt = allOptionsData.find(o => o.isCorrect);
            if (correctOpt) {
                feedbackText += `<span style="color: #15803d; font-weight: bold;">🔑 Đáp án đúng: "${correctOpt.text}"</span><br>`;
                feedbackText += `<span style="font-size: 0.85rem;">Lý do đúng: ${correctOpt.feedback || 'Chính xác!'}</span>`;
            }
        } else {
            const bestOpt = allOptionsData.find(o => o.points === 2);
            if (bestOpt) {
                feedbackText += `<span style="color: #15803d; font-weight: bold;">🔑 Lựa chọn đột phá (+2đ): "${bestOpt.text}"</span><br>`;
                feedbackText += `<span style="font-size: 0.85rem;">Lý do: ${bestOpt.feedback || 'Chính xác!'}</span>`;
            }
        }
        if (feedbackTextEl) feedbackTextEl.innerHTML = feedbackText;
        else feedbackMsg.innerHTML = feedbackText;

        progressBar.style.width = `${((currentQIndex + 1) / activeGame.questions.length) * 100}%`;
        nextBtn.classList.remove('hidden');
    }

    function selectAnswer(selectedOpt, selectedBtn, allOptionsData) {
        clearInterval(timerInterval);
        const allBtns = optionsContainer.querySelectorAll('.btn-option');
        allBtns.forEach(b => b.disabled = true);

        const activeGame = games[activeGameIndex];
        const mascotImg = document.getElementById('mascot-img');
        const feedbackTextEl = document.getElementById('feedback-text');
        feedbackMsg.classList.remove('hidden');

        // Record user selection
        userAnswers.push(selectedOpt);

        let isBest = false;
        let isNeutral = false;
        let isPoor = false;

        if (activeGame.type === 'scenario_challenge') {
            if (selectedOpt.isCorrect) {
                isBest = true;
                score++;
            } else {
                isPoor = true;
            }
        } else {
            // suitability_scoring
            const points = selectedOpt.points || 0;
            score += points;
            if (points === 2) {
                isBest = true;
            } else if (points === 1) {
                isNeutral = true;
            } else {
                isPoor = true;
            }
        }

        if (isBest) {
            sfx.correct();
            selectedBtn.classList.add('correct');
            feedbackMsg.className = 'feedback-msg success';
            feedbackMsg.style.background = 'rgba(21, 128, 61, 0.1)';
            feedbackMsg.style.border = '1px solid #15803d';
            feedbackMsg.style.color = '#166534';
            
            const bestMascots = ['mascot_correct.jpg', 'mascot_hot.jpg', 'mascot_challenge.jpg'];
            const chosenMascot = bestMascots[Math.floor(Math.random() * bestMascots.length)];
            if (mascotImg) mascotImg.src = chosenMascot + '?v=1.0.4';

            const pickedQuote = owlCorrect[Math.floor(Math.random() * owlCorrect.length)].quote;
            const htmlVal = `<strong>🦉 BD Mascot: "${pickedQuote}"</strong><br><br>${selectedOpt.feedback || 'Tuyệt vời! Lựa chọn vô cùng sắc sảo.'}`;
            if (feedbackTextEl) feedbackTextEl.innerHTML = htmlVal;
            else feedbackMsg.innerHTML = htmlVal;
        } else if (isNeutral) {
            sfx.correct();
            selectedBtn.style.background = 'rgba(243, 168, 59, 0.2)';
            selectedBtn.style.border = '2px solid #f3a83b';
            selectedBtn.style.color = '#b45309';
            selectedBtn.style.fontWeight = 'bold';
            
            feedbackMsg.className = 'feedback-msg warning';
            feedbackMsg.style.background = 'rgba(243, 168, 59, 0.1)';
            feedbackMsg.style.border = '1px solid #f3a83b';
            feedbackMsg.style.color = '#b45309';

            const neutralMascots = ['mascot_relax.jpg', 'mascot_milktea.jpg'];
            const chosenMascot = neutralMascots[Math.floor(Math.random() * neutralMascots.length)];
            if (mascotImg) mascotImg.src = chosenMascot + '?v=1.0.4';

            const htmlVal = `<strong>🦉 BD Mascot: "Phương án này khá ổn, nhưng vẫn còn cách tối ưu hơn!"</strong><br><br>${selectedOpt.feedback || 'Lựa chọn tương đối hợp lý.'}`;
            if (feedbackTextEl) feedbackTextEl.innerHTML = htmlVal;
            else feedbackMsg.innerHTML = htmlVal;
        } else {
            sfx.wrong();
            selectedBtn.classList.add('wrong');
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.style.background = 'rgba(185, 28, 28, 0.1)';
            feedbackMsg.style.border = '1px solid #b91c1c';
            feedbackMsg.style.color = '#991b1b';

            if (activeGame.type === 'scenario_challenge') {
                const correctOpt = allOptionsData.find(o => o.isCorrect);
                allBtns.forEach(b => {
                    if (correctOpt && b.textContent === correctOpt.text) {
                        b.classList.add('correct');
                    }
                });
            } else {
                const bestOpt = allOptionsData.find(o => o.points === 2);
                allBtns.forEach(b => {
                    if (bestOpt && b.textContent === bestOpt.text) {
                        b.style.background = 'rgba(21, 128, 61, 0.15)';
                        b.style.border = '2px solid #15803d';
                        b.style.color = '#166534';
                    }
                });
            }

            const poorMascots = ['mascot_wrong.jpg', 'mascot_ghost.jpg', 'mascot_storm.jpg'];
            const chosenMascot = poorMascots[Math.floor(Math.random() * poorMascots.length)];
            if (mascotImg) mascotImg.src = chosenMascot + '?v=1.0.4';

            const pickedQuote = owlWrong[Math.floor(Math.random() * owlWrong.length)].quote;
            let feedbackText = `<strong>🦉 BD Mascot: "${pickedQuote}"</strong><br><br>`;
            feedbackText += `<span style="color: #b91c1c; font-weight: bold;">Lựa chọn của bạn: "${selectedOpt.text}"</span><br>`;
            feedbackText += `<span style="font-size: 0.85rem; font-style: italic;">${selectedOpt.feedback || ''}</span><br><br>`;
            
            if (activeGame.type === 'scenario_challenge') {
                const correctOpt = allOptionsData.find(o => o.isCorrect);
                if (correctOpt) {
                    feedbackText += `<span style="color: #15803d; font-weight: bold;">🔑 Đáp án tối ưu nhất: "${correctOpt.text}"</span><br>`;
                    feedbackText += `<span style="font-size: 0.85rem;">Lý do: ${correctOpt.feedback || 'Chính xác!'}</span>`;
                }
            } else {
                const bestOpt = allOptionsData.find(o => o.points === 2);
                if (bestOpt) {
                    feedbackText += `<span style="color: #15803d; font-weight: bold;">🔑 Lựa chọn đột phá (+2đ): "${bestOpt.text}"</span><br>`;
                    feedbackText += `<span style="font-size: 0.85rem;">Lý do: ${bestOpt.feedback || 'Chính xác!'}</span>`;
                }
            }
            if (feedbackTextEl) feedbackTextEl.innerHTML = feedbackText;
            else feedbackMsg.innerHTML = feedbackText;
        }
        
        progressBar.style.width = `${((currentQIndex + 1) / activeGame.questions.length) * 100}%`;
        nextBtn.classList.remove('hidden');
    }

    function loadNextQuestion() {
        currentQIndex++;
        const activeGame = games[activeGameIndex];
        if (currentQIndex < activeGame.questions.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }

        function showResult() {
        const activeGame = games[activeGameIndex];
        const totalQ = activeGame.questions.length;
        const passThreshold = Math.ceil(totalQ * 0.5);
        const didPass = score >= passThreshold;
        const correctCount = score;
        const wrongCount = totalQ - score;

        if (didPass) {
            // User completed game tracking
            const completedGames = JSON.parse(localStorage.getItem('completed_games') || '[]');
            if (!completedGames.includes(activeGame.id)) {
                completedGames.push(activeGame.id);
                localStorage.setItem('completed_games', JSON.stringify(completedGames));
            }
            updateTabCounts();

            // Trigger action-based quest/point increase
            if (window.registerUserAction) {
                window.registerUserAction('game_complete', { perfect: score === totalQ });
            }
        }

        gamePlay.classList.add('hidden');
        gameResult.classList.remove('hidden');
        if(timerDisplay) timerDisplay.classList.add('hidden');
        
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        const submitBox = document.getElementById('leaderboard-submit-box');
        const statsBox = document.getElementById('result-stats-box');
        const result = activeGame.getResult(score);

        const resultMascot = document.getElementById('result-mascot-img');
        if (resultMascot) {
            resultMascot.src = didPass ? 'mascot_correct.jpg?v=1.0.4' : 'mascot_wrong.jpg?v=1.0.4';
        }

        // Populate result-stats-box
        if (statsBox) {
            statsBox.innerHTML = `
                <h4 style="margin-top: 0; font-size: 1.05rem; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; color: var(--text-main); margin-bottom: 10px;">
                    📊 KẾT QUẢ THỬ THÁCH
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                    <div>✔️ Số câu đúng: <strong style="color: #15803d; font-size: 1.05rem;">${correctCount}</strong></div>
                    <div>❌ Số câu sai: <strong style="color: #b91c1c; font-size: 1.05rem;">${wrongCount}</strong></div>
                    <div style="grid-column: span 2; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 8px; margin-top: 5px; font-weight: bold;">
                        Trạng thái qua ải: 
                        ${didPass 
                            ? `<strong style="color: #166534; background: #dcfce7; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; border: 1px solid #15803d;">ĐẠT YÊU CẦU ✅</strong>` 
                            : `<strong style="color: #991b1b; background: #fee2e2; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; border: 1px solid #b91c1c;">CHƯA ĐẠT ❌</strong> <span style="font-size: 0.75rem; color: var(--text-light); font-weight: normal;">(Yêu cầu tối thiểu 50%)</span>`
                        }
                    </div>
                </div>
            `;
        }

        // Reset review answers toggle and panel
        const toggleBtn = document.getElementById('btn-toggle-review');
        const reviewPanel = document.getElementById('review-answers-panel');
        if (toggleBtn && reviewPanel) {
            toggleBtn.classList.remove('hidden');
            reviewPanel.classList.add('hidden');
            reviewPanel.innerHTML = '';
            toggleBtn.textContent = '🔍 Xem Lại Đáp Án Chi Tiết';
            
            // Remove old listener by replacing button with clone
            const newToggleBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
            
            newToggleBtn.addEventListener('click', () => {
                const isHidden = reviewPanel.classList.contains('hidden');
                if (isHidden) {
                    renderReviewAnswers(reviewPanel, activeGame, userAnswers);
                    reviewPanel.classList.remove('hidden');
                    newToggleBtn.textContent = '🙈 Thu Gọn Đáp Án';
                } else {
                    reviewPanel.classList.add('hidden');
                    newToggleBtn.textContent = '🔍 Xem Lại Đáp Án Chi Tiết';
                }
            });
        }
        let resultTextContent = (result.text || '').replace(/\/\d+\s*câu/g, '/' + totalQ + ' câu');

        if (didPass) {
            if (result.sfx === 'win') sfx.win();
            else if (result.sfx === 'correct') sfx.correct();
            else sfx.lose();

            resultTitle.textContent = result.title;
            resultTitle.style.color = result.color || 'var(--primary)';
            resultText.innerHTML = resultTextContent;

            // Leaderboard Submission Logic
            const assignedNick = funnyNicknames[Math.floor(Math.random() * funnyNicknames.length)] + " " + Math.floor(Math.random() * 90 + 10);
            const assignedNickEl = document.getElementById('assigned-nickname');
            
            if (assignedNickEl && submitBox) {
                assignedNickEl.textContent = assignedNick;
                submitBox.innerHTML = `
                    <h4 style="font-weight: bold; margin-bottom: 5px; color: var(--text-main); font-size: 1rem;">🏆 ĐĂNG BẢNG VÀNG CHIẾN THẦN B2B</h4>
                    <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 15px;">
                        Tên đề xuất cho bạn: <strong id="assigned-nickname" style="color: var(--primary);">${assignedNick}</strong>. Bạn có muốn đổi tên khác hoặc lưu lại email để khóa danh hiệu không?
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <input type="text" id="leaderboard-name" placeholder="Biệt danh tự chọn (mặc định sẽ lấy tên đề xuất trên)" style="padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg); color: var(--text-main); font-family: inherit; font-size: 0.9rem;">
                        <input type="email" id="leaderboard-email" placeholder="Email của bạn (để khóa danh hiệu & nhận template kế hoạch)" style="padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg); color: var(--text-main); font-family: inherit; font-size: 0.9rem;">
                        <button id="btn-submit-leaderboard" class="btn btn-primary" style="padding: 10px; width: 100%; border: none; font-weight: bold;">Xác Nhận Đăng Bảng Vàng</button>
                    </div>
                `;
                submitBox.style.display = 'block';
                
                const nameInput = document.getElementById('leaderboard-name');
                const emailInput = document.getElementById('leaderboard-email');
                const submitBtn = document.getElementById('btn-submit-leaderboard');

                submitBtn.addEventListener('click', () => {
                    const finalName = nameInput.value.trim() || assignedNick;
                    const email = emailInput.value.trim();
                    
                    // Get title based on score percentage
                    let title = "Tân Binh BD";
                    const percentage = (score / totalQ) * 100;
                    if (percentage >= 90) title = "Chuyên Gia Chốt Deal";
                    else if (percentage >= 70) title = "Chiến Binh Pipeline";
                    else title = "Thực Tập Sinh Cold Call";

                    const newEntry = {
                        name: finalName,
                        email: email,
                        title: title,
                        score: score
                    };

                    const board = getLeaderboard();
                    board.push(newEntry);
                    saveLeaderboard(board);
                    renderLeaderboard();
                    submitBox.style.display = 'none';
                });
            }
        } else {
            if (submitBox) submitBox.style.display = 'none';
            sfx.lose();

            resultTitle.textContent = "Chưa Đạt Yêu Cầu! 😅";
            resultTitle.style.color = "var(--danger)";
            resultText.innerHTML = `Bạn trả lời đúng <strong>${score}/${totalQ}</strong> câu hỏi (Dưới 50%). BD chuyên nghiệp cần phản xạ chính xác tối thiểu 50% để giữ uy tín. Hãy chơi lại để vượt qua nhé!`;
        }
    }

    // --- Hall of Fame (Leaderboard) Logic ---
    const funnyNicknames = [
        "Chúa Tể Chốt Deal", "Kẻ Hủy Diệt Từ Chối", "Sát Thủ Cold Email", "BD Chạy Bằng Cơm",
        "Chiến Thần CRM", "Giáo Chủ Doanh Số", "Đại Hiệp Pipeline", "Thần Thoại Roleplay",
        "Anh Hùng Đàm Phán", "Vua Khảo Sát", "Bậc Thầy Gatekeeper", "Khắc Tinh Churn Rate"
    ];

    const defaultLeaderboard = [
        { name: "Chúa Tể Chốt Deal", title: "Chuyên Gia Chốt Deal", score: 5 },
        { name: "Kẻ Hủy Diệt Từ Chối", title: "Chuyên Gia Chốt Deal", score: 5 },
        { name: "Sát Thủ Cold Email", title: "Chiến Binh Pipeline", score: 4 },
        { name: "BD Chạy Bằng Cơm", title: "Chiến Binh Pipeline", score: 4 },
        { name: "Chiến Thần CRM", title: "Thực Tập Sinh Cold Call", score: 3 }
    ];

    function getLeaderboard() {
        const board = localStorage.getItem('bd_leaderboard');
        if (!board) {
            localStorage.setItem('bd_leaderboard', JSON.stringify(defaultLeaderboard));
            return defaultLeaderboard;
        }
        return JSON.parse(board);
    }

    function renderLeaderboard() {
        const board = getLeaderboard();
        const listContainer = document.getElementById('leaderboard-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        board.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = 'other';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';

            let funnyTitle = entry.title || "Tân Binh BD";
            const verifiedBadgeHtml = entry.email ? `<span class="verified-badge" style="font-size: 0.65rem; padding: 1px 4px; background: rgba(243, 168, 59, 0.15); color: #e59a18; border-radius: 12px; font-weight: bold; margin-left: 5px;">✔ Verified</span>` : '';

            item.innerHTML = `
                <div class="rank-badge ${rankClass}">${index + 1}</div>
                <div class="user-info">
                    <div class="user-name">
                        <span>${entry.name}</span>
                        ${verifiedBadgeHtml}
                    </div>
                    <div class="user-title">${funnyTitle}</div>
                </div>
                <div class="score-badge">${entry.score}/5</div>
            `;
            listContainer.appendChild(item);
        });
    }

    // Call on load
    renderLeaderboard();


    // --- B2B Events Data Model ---
    // --- B2B Events Data Model ---
    const b2bEvents = [
        {
            id: 'evt-1',
            title: 'Triển lãm Quốc tế lần thứ 18 về Máy công cụ, Cơ khí chính xác và Gia công kim loại (MTA Vietnam 2026)',
            sector: 'industrial',
            sectorLabel: 'Sản xuất & Công nghiệp',
            badgeClass: 'badge-manufacturing',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '07/07/2026 - 10/07/2026',
            month: '7',
            monthNum: '07',
            day: '07',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 1850,
            online: 12,
            host: 'Informa Markets Vietnam',
            link: 'https://events.informamarkets.com/en/event-listing.html',
            realtimeLink: 'https://events.informamarkets.com/en/event-listing.html'
        },
        {
            id: 'evt-2',
            title: 'Triển lãm Quốc tế về Công nghệ Chế biến, Đóng gói và Bảo quản Nông sản Thực phẩm (Vietnam PFA 2026)',
            sector: 'hospitality',
            sectorLabel: 'F&B, Nhà hàng & Khách sạn',
            badgeClass: 'badge-logistics',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '15/07/2026 - 17/07/2026',
            month: '7',
            monthNum: '07',
            day: '15',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 920,
            online: 8,
            host: 'VINEXAD',
            link: 'https://vinexad.com.vn/',
            realtimeLink: 'https://vinexad.com.vn/'
        },
        {
            id: 'evt-3',
            title: 'Triển lãm Quốc tế về Sản phẩm, Công nghệ & Dịch vụ Làm đẹp (Beautycare Expo 2026)',
            sector: 'health-beauty',
            sectorLabel: 'Y tế, Dược phẩm & Làm đẹp',
            badgeClass: 'badge-agency',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '23/07/2026 - 25/07/2026',
            month: '7',
            monthNum: '07',
            day: '23',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 780,
            online: 15,
            host: 'ADPEX Joint Stock Company',
            link: 'https://secc.com.vn/events/',
            realtimeLink: 'https://secc.com.vn/events/'
        },
        {
            id: 'evt-4',
            title: 'Diễn đàn Đổi mới Sáng tạo và Xúc tiến Thương mại Doanh nghiệp (InnoEx 2026)',
            sector: 'tech',
            sectorLabel: 'Công nghệ & Khởi nghiệp',
            badgeClass: 'badge-tech',
            format: 'hybrid',
            formatLabel: 'Hybrid (Online & Offline)',
            date: '27/08/2026 - 28/08/2026',
            month: '8',
            monthNum: '08',
            day: '27',
            location: 'Riverside Palace, Quận 4, TP.HCM',
            registered: 1200,
            online: 65,
            host: 'BSSC & YBA HCM',
            link: 'https://innoex.vn/',
            realtimeLink: 'https://innoex.vn/'
        },
        {
            id: 'evt-5',
            title: 'Hội thảo Trực tuyến về Hợp tác Đầu tư và Xúc tiến B2B Châu Âu (EuroCham B2B Webinar 2026)',
            sector: 'trade-logistics',
            sectorLabel: 'Thương mại & Xúc tiến',
            badgeClass: 'badge-finance',
            format: 'online',
            formatLabel: 'Online / Trực tuyến',
            date: '18/08/2026 - 14:00',
            month: '8',
            monthNum: '08',
            day: '18',
            location: 'Zoom Meetings / Trực tuyến',
            registered: 350,
            online: 110,
            host: 'EuroCham Vietnam',
            link: 'https://www.eurocham-vietnam.org/',
            realtimeLink: 'https://www.eurocham-vietnam.org/'
        },
        {
            id: 'evt-6',
            title: 'Triển lãm Quốc tế Xây dựng, Vật liệu Xây dựng & Trang trí Nội ngoại thất (Vietbuild HCMC 2026)',
            sector: 'construction',
            sectorLabel: 'Xây dựng & Nội thất',
            badgeClass: 'badge-manufacturing',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '25/08/2026 - 29/08/2026',
            month: '8',
            monthNum: '08',
            day: '25',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 1720,
            online: 22,
            host: 'Vietbuild Organizer',
            link: 'https://secc.com.vn/events/',
            realtimeLink: 'https://secc.com.vn/events/'
        },
        {
            id: 'evt-7',
            title: 'Chuỗi Sự kiện Kết nối Chuỗi Cung ứng Hàng hóa Quốc tế (Vietnam International Sourcing 2026)',
            sector: 'trade-logistics',
            sectorLabel: 'Thương mại & Xúc tiến',
            badgeClass: 'badge-finance',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '03/09/2026 - 05/09/2026',
            month: '9',
            monthNum: '09',
            day: '03',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 1650,
            online: 28,
            host: 'Bộ Công Thương (MoIT)',
            link: 'https://secc.com.vn/events/',
            realtimeLink: 'https://secc.com.vn/events/'
        },
        {
            id: 'evt-8',
            title: 'Hội nghị Giao thương B2B Công nghiệp và Chế tạo ASEAN (FBC ASEAN 2026)',
            sector: 'industrial',
            sectorLabel: 'Sản xuất & Công nghiệp',
            badgeClass: 'badge-manufacturing',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '16/09/2026 - 18/09/2026',
            month: '9',
            monthNum: '09',
            day: '16',
            location: 'I.C.E. Exhibition Center, Hà Nội',
            registered: 690,
            online: 14,
            host: 'Factory Network Asia',
            link: 'https://fbcasean.vn/',
            realtimeLink: 'https://fbcasean.vn/'
        },
        {
            id: 'evt-9',
            title: 'Triển lãm Quốc tế lần thứ 24 về Ngành Nhựa và Thiết bị Cao su (VietnamPlas 2026)',
            sector: 'industrial',
            sectorLabel: 'Sản xuất & Công nghiệp',
            badgeClass: 'badge-manufacturing',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '09/09/2026 - 12/09/2026',
            month: '9',
            monthNum: '09',
            day: '09',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 1420,
            online: 20,
            host: 'Chan Chao & VINEXAD',
            link: 'https://vinexad.com.vn/',
            realtimeLink: 'https://vinexad.com.vn/'
        },
        {
            id: 'evt-10',
            title: 'Triển lãm Quốc tế lần thứ 24 về Thiết bị & Ngành Công nghiệp Dệt may (Vietnam VTG 2026)',
            sector: 'industrial',
            sectorLabel: 'Sản xuất & Công nghiệp',
            badgeClass: 'badge-manufacturing',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '14/10/2026 - 17/10/2026',
            month: '10',
            monthNum: '10',
            day: '14',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 1350,
            online: 20,
            host: 'Chan Chao & VINEXAD',
            link: 'https://vinexad.com.vn/',
            realtimeLink: 'https://vinexad.com.vn/'
        },
        {
            id: 'evt-11',
            title: 'Triển lãm Quốc tế về Công nghệ Lọc nước, Cấp thoát nước & Môi trường (Vietwater 2026)',
            sector: 'industrial',
            sectorLabel: 'Sản xuất & Công nghiệp',
            badgeClass: 'badge-manufacturing',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '04/11/2026 - 06/11/2026',
            month: '11',
            monthNum: '11',
            day: '04',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 1250,
            online: 18,
            host: 'Informa Markets Vietnam',
            link: 'https://events.informamarkets.com/en/event-listing.html',
            realtimeLink: 'https://events.informamarkets.com/en/event-listing.html'
        },
        {
            id: 'evt-12',
            title: 'Hội chợ Thương mại Quốc tế Việt Nam lần thứ 24 tại TP.HCM (Vietnam Expo HCMC 2026)',
            sector: 'trade-logistics',
            sectorLabel: 'Thương mại & Xúc tiến',
            badgeClass: 'badge-finance',
            format: 'offline',
            formatLabel: 'Offline / Trực tiếp',
            date: '03/12/2026 - 05/12/2026',
            month: '12',
            monthNum: '12',
            day: '03',
            location: 'SECC, Quận 7, TP.HCM',
            registered: 2400,
            online: 52,
            host: 'VINEXAD',
            link: 'https://vietnamexpo.com.vn/',
            realtimeLink: 'https://vietnamexpo.com.vn/'
        }
    ];

    const eventsGrid = document.getElementById('events-grid');
    const eventSearch = document.getElementById('event-search');
    const eventFilter = document.getElementById('event-filter');
    const liveUpdateTimer = document.getElementById('live-update-timer');
    let selectedMonth = 'all';

    function renderEvents() {
        if (!eventsGrid) return;

        const searchQuery = eventSearch.value.toLowerCase().trim();
        const sectorQuery = eventFilter.value;
        
        // Get the selected format filter value (default to 'all' if element not found)
        const formatFilterEl = document.getElementById('event-format-filter');
        const formatQuery = formatFilterEl ? formatFilterEl.value : 'all';

        const filtered = b2bEvents.filter(evt => {
            const matchesSearch = evt.title.toLowerCase().includes(searchQuery) ||
                                 evt.location.toLowerCase().includes(searchQuery) ||
                                 evt.host.toLowerCase().includes(searchQuery) ||
                                 evt.sectorLabel.toLowerCase().includes(searchQuery);
            const matchesSector = sectorQuery === 'all' || evt.sector === sectorQuery;
            const matchesFormat = formatQuery === 'all' || evt.format === formatQuery;
            const matchesMonth = selectedMonth === 'all' || evt.month === selectedMonth;
            return matchesSearch && matchesSector && matchesFormat && matchesMonth;
        });

        if (filtered.length === 0) {
            eventsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    📭 Không tìm thấy sự kiện B2B nào phù hợp với bộ lọc của bạn.
                </div>
            `;
            return;
        }

        eventsGrid.innerHTML = filtered.map(evt => `
            <div class="event-card glass-effect" id="${evt.id}">
                <div class="event-header" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; width: 100%;">
                    <!-- Calendar Date Block -->
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 1.1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">📅</span>
                        <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary-light);">T.${evt.monthNum}/${evt.day}</span>
                    </div>
                    <span class="event-badge ${evt.badgeClass}" style="margin: 0;">${evt.sectorLabel}</span>
                    <span class="format-badge ${evt.format}" style="font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; background: rgba(255,255,255,0.05); border: 1px solid ${evt.format === 'online' ? 'rgba(162,10,10,0.3)' : evt.format === 'hybrid' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}; color: ${evt.format === 'online' ? '#a20a0a' : evt.format === 'hybrid' ? '#f59e0b' : '#3b82f6'};">
                        ${evt.formatLabel}
                    </span>
                    <span class="event-status ${evt.online > 0 ? 'live' : ''}" style="margin-left: auto;">
                        ${evt.online > 0 ? '<span class="live-dot" style="display:inline-block; width:6px; height:6px; background:#ef4444; border-radius:50%; box-shadow:0 0 6px #ef4444; animation:pulse 1.5s infinite;"></span> ' + evt.online + ' Online' : 'Đăng ký mở'}
                    </span>
                </div>
                <h3 class="event-title" style="margin-top: 5px;">
                    <a href="${evt.link}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='inherit'">
                        ${evt.title}
                    </a>
                </h3>
                <div class="event-meta">
                    <div class="meta-item">
                        <span>📅</span>
                        <span>${evt.date}</span>
                    </div>
                    <div class="meta-item">
                        <span>📍</span>
                        <span>${evt.location}</span>
                    </div>
                    <div class="meta-item" style="font-size: 0.8rem; color: var(--accent-glow);">
                        <span>🏢 Host:</span>
                        <span>${evt.host}</span>
                    </div>
                </div>
                <div class="event-live-stats" style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px; flex-wrap: wrap;">
                    <div class="attendees-count" id="count-${evt.id}">
                        👥 <strong>${evt.registered}</strong> Đã đăng ký
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <a href="${evt.realtimeLink}" target="_blank" rel="noopener noreferrer" class="event-realtime-link" style="font-size: 0.85rem; color: #11998e; text-decoration: none; border-bottom: 1px dashed #11998e; transition: all 0.3s; font-weight: 600;">
                            Chi tiết realtime ↗
                        </a>
                        <a href="${evt.link}" target="_blank" rel="noopener noreferrer" class="event-register-btn">
                            Đăng Ký &rarr;
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (eventSearch) eventSearch.addEventListener('input', renderEvents);
    if (eventFilter) eventFilter.addEventListener('change', renderEvents);
    
    const eventFormatFilter = document.getElementById('event-format-filter');
    if (eventFormatFilter) eventFormatFilter.addEventListener('change', renderEvents);

    const monthTabs = document.querySelectorAll('.month-tab');
    monthTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            monthTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'rgba(255,255,255,0.05)';
                t.style.color = 'var(--text-primary)';
                t.style.borderColor = 'var(--border-color)';
                t.style.boxShadow = 'none';
            });
            tab.classList.add('active');
            tab.style.background = 'var(--primary)';
            tab.style.color = '#fff';
            tab.style.borderColor = 'var(--primary)';
            tab.style.boxShadow = 'var(--shadow-sm)';
            
            selectedMonth = tab.getAttribute('data-month');
            renderEvents();
        });
    });

    // Initial render
    renderEvents();

    // --- Real-time updates simulation ---
    let timerCountdown = 15;
    if (liveUpdateTimer) {
        setInterval(() => {
            timerCountdown--;
            if (timerCountdown <= 0) {
                timerCountdown = 15;
                
                // Simulate new attendee registrations
                b2bEvents.forEach(evt => {
                    if (Math.random() < 0.6) {
                        const increment = Math.floor(Math.random() * 3) + 1;
                        evt.registered += increment;
                        
                        evt.online = Math.floor(Math.random() * 15) + 3;

                        const countEl = document.getElementById(`count-${evt.id}`);
                        if (countEl) {
                            countEl.classList.add('pulse-glow');
                            const strongEl = countEl.querySelector('strong');
                            if (strongEl) {
                                strongEl.textContent = evt.registered;
                            }
                            setTimeout(() => {
                                countEl.classList.remove('pulse-glow');
                            }, 1200);
                        }
                    }
                });

                // Update online status in cards
                b2bEvents.forEach(evt => {
                    const card = document.getElementById(evt.id);
                    if (card) {
                        const statusEl = card.querySelector('.event-status');
                        if (statusEl) {
                            statusEl.innerHTML = `${evt.online > 0 ? '<span class="live-dot" style="display:inline-block; width:6px; height:6px; background:#ef4444; border-radius:50%; box-shadow:0 0 6px #ef4444; animation:pulse 1.5s infinite;"></span> ' + evt.online + ' Online' : 'Đăng ký mở'}`;
                            statusEl.className = `event-status ${evt.online > 0 ? 'live' : ''}`;
                        }
                    }
                });
            }
            liveUpdateTimer.textContent = `Tự động cập nhật: ${timerCountdown}s`;
        }, 1000);
    }

    // --- Cosmic Galaxy Ecosystem Visualizer Logic ---
    const planetNodes = document.querySelectorAll('.planet-node');
    const planetTooltip = document.getElementById('planet-tooltip');
    const tooltipIcon = document.getElementById('tooltip-icon');
    const tooltipBadge = document.getElementById('tooltip-badge');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipDesc = document.getElementById('tooltip-desc');
    const tooltipLink = document.getElementById('tooltip-link');
    const ecoTabs = document.querySelectorAll('.eco-tab-btn');

    let activePlanetIndex = 0;
    let autoRotationInterval = null;

    if (planetNodes.length > 0) {
        // Update details card dynamically
        function selectPlanet(index) {
            if (index < 0 || index >= planetNodes.length) return;
            activePlanetIndex = index;

            planetNodes.forEach((node, i) => {
                if (i === index) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
            });

            const activeNode = planetNodes[index];
            const title = activeNode.getAttribute('data-title');
            const desc = activeNode.getAttribute('data-desc');
            const badge = activeNode.getAttribute('data-badge');
            const link = activeNode.getAttribute('data-link');
            const icon = activeNode.getAttribute('data-icon');
            const color = activeNode.style.getPropertyValue('--planet-color');
            const rgb = activeNode.style.getPropertyValue('--planet-rgb');

            // Apply values to tooltip
            tooltipTitle.textContent = title;
            tooltipDesc.textContent = desc;
            tooltipBadge.textContent = badge;
            tooltipIcon.textContent = icon;
            tooltipLink.setAttribute('href', link);

            // Dynamically customize tooltip styling with active planet color
            tooltipBadge.style.color = color;
            tooltipBadge.style.borderColor = `rgba(${rgb}, 0.25)`;
            tooltipBadge.style.backgroundColor = `rgba(${rgb}, 0.12)`;
            tooltipIcon.style.color = color;
            tooltipIcon.style.backgroundColor = `rgba(${rgb}, 0.1)`;
            
            if (tooltipLink) {
                tooltipLink.style.backgroundColor = color;
                tooltipLink.style.borderColor = color;
                tooltipLink.style.boxShadow = `0 4px 14px rgba(${rgb}, 0.3)`;
            }

            // Animate card entrance
            planetTooltip.style.opacity = '0';
            planetTooltip.style.transform = 'translateY(10px)';
            setTimeout(() => {
                planetTooltip.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                planetTooltip.style.opacity = '1';
                planetTooltip.style.transform = 'translateY(0)';
                
                // On mobile, scroll to the tooltip card so it is immediately visible
                if (window.innerWidth <= 992) {
                    planetTooltip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 50);
        }

        // Initialize with first planet details
        selectPlanet(0);

        // Add event listeners to planets
        planetNodes.forEach((node, index) => {
            node.addEventListener('mouseenter', () => {
                clearInterval(autoRotationInterval);
                selectPlanet(index);
            });

            node.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Clear any pending redirect
                if (window.planetRedirectTimeout) {
                    clearTimeout(window.planetRedirectTimeout);
                }
                
                // Show the introduction immediately
                selectPlanet(index);
                
                const link = node.getAttribute('data-link');
                if (link) {
                    window.planetRedirectTimeout = setTimeout(() => {
                        if (link.startsWith('#')) {
                            const target = document.getElementById(link.substring(1));
                            if (target) {
                                target.scrollIntoView({ behavior: 'smooth' });
                                history.pushState(null, null, link);
                            }
                        } else {
                            window.location.href = link;
                        }
                    }, 1000); // 1.0s delay so they see the introduction card pop up first
                }
            });
        });

        // Mobile Carousel Controls
        const planetPrevBtn = document.getElementById('planet-prev-btn');
        const planetNextBtn = document.getElementById('planet-next-btn');

        if (planetPrevBtn && planetNextBtn) {
            planetPrevBtn.addEventListener('click', () => {
                let nextIdx = activePlanetIndex - 1;
                if (nextIdx < 0) nextIdx = planetNodes.length - 1;
                selectPlanet(nextIdx);
            });

            planetNextBtn.addEventListener('click', () => {
                let nextIdx = activePlanetIndex + 1;
                if (nextIdx >= planetNodes.length) nextIdx = 0;
                selectPlanet(nextIdx);
            });
        }

        let currentCategory = 'all';
        let orbitAngleOffset = 0;
        let isHovered = false;

        function arrangeActivePlanets() {
            const isMobile = window.innerWidth <= 992;
            
            if (isMobile) {
                // Clear inline style positions on mobile to let CSS Grid layout take over
                planetNodes.forEach(node => {
                    node.style.left = '';
                    node.style.top = '';
                    node.style.opacity = '';
                    node.style.pointerEvents = '';
                    node.style.transform = '';
                    const sphere = node.querySelector('.planet-sphere');
                    if (sphere) {
                        sphere.style.transform = '';
                    }
                });
                return;
            }
            
            const radius = 200;
            
            // Filter matching planet nodes
            const matchedNodes = [];
            planetNodes.forEach(node => {
                const nodeCat = node.getAttribute('data-category');
                if (currentCategory === 'all' || nodeCat === currentCategory) {
                    matchedNodes.push(node);
                    node.style.opacity = '1';
                    node.style.pointerEvents = 'auto';
                    node.style.transform = 'translate(-50%, -50%) scale(1)';
                } else {
                    node.style.opacity = '0';
                    node.style.pointerEvents = 'none';
                    node.style.transform = 'translate(-50%, -50%) scale(0)';
                }
            });

            // Distribute matched nodes evenly in a circle orbit
            const count = matchedNodes.length;
            matchedNodes.forEach((node, index) => {
                const baseAngle = (index * 360 / count);
                const currentAngle = (baseAngle + orbitAngleOffset) % 360;
                const angleRad = currentAngle * Math.PI / 180;
                const x = radius * Math.cos(angleRad);
                const y = radius * Math.sin(angleRad);
                node.style.left = `calc(50% + ${x}px)`;
                node.style.top = `calc(50% + ${y}px)`;

                // Counter-rotate the sphere icon to keep it upright
                const sphere = node.querySelector('.planet-sphere');
                if (sphere) {
                    sphere.style.transform = `rotate(${-currentAngle}deg)`;
                }
            });
        }

        // Initialize positions
        arrangeActivePlanets();



        window.addEventListener('resize', () => {
            arrangeActivePlanets();
        });

        // Category Tab Filter Sync
        if (ecoTabs.length > 0) {
            ecoTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    ecoTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    currentCategory = tab.getAttribute('data-category');
                    arrangeActivePlanets(currentCategory);

                    // Fade-update the category description paragraph
                    const catIntroEl = document.getElementById('ecosystem-cat-intro');
                    if (catIntroEl) {
                        const intros = {
                            all: "Bộ 9 Công cụ AI, Tra cứu Pháp lý, Thư viện Tri thức & Cộng đồng Thực chiến dành riêng cho B2B Business Development.",
                            tools: "Hệ thống giải pháp thông minh giúp tìm kiếm, xác thực thông tin Person-in-Charge (PIC) và tự động hóa soạn thảo email tiếp cận khách hàng chất lượng cao.",
                            finance: "Bộ công cụ quy đổi lương Gross/Net chính xác, cổng tra cứu nhanh luật lao động 2026 và lịch trình sự kiện giao thương B2B mới nhất.",
                            community: "Không gian tri thức thực chiến gồm Minigame xử lý đàm phán, 100+ thuật ngữ BD chuyên sâu, Ebook độc quyền và diễn đàn kết nối nghiệp vụ."
                        };
                        catIntroEl.style.opacity = '0';
                        setTimeout(() => {
                            catIntroEl.textContent = intros[currentCategory] || intros.all;
                            catIntroEl.style.opacity = '1';
                        }, 200);
                    }

                    // Select the first matching planet in the filtered list
                    let firstMatchedIndex = -1;
                    planetNodes.forEach((node, index) => {
                        const nodeCat = node.getAttribute('data-category');
                        if ((currentCategory === 'all' || nodeCat === currentCategory) && firstMatchedIndex === -1) {
                            firstMatchedIndex = index;
                        }
                    });

                    if (firstMatchedIndex !== -1) {
                        selectPlanet(firstMatchedIndex);
                    }
                });
            });
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initB2BApp);
} else {
    initB2BApp();
}

    // points-based subscriber activation
    const btnActivateStreak = document.getElementById('btn-activate-streak');
    if (btnActivateStreak) {
        btnActivateStreak.addEventListener('click', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('streak-name');
            const emailInput = document.getElementById('streak-email');
            if (!nameInput || !emailInput) return;

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();

            if (!name || !email || !email.includes('@')) {
                alert('Vui lòng nhập tên và địa chỉ email hợp lệ!');
                return;
            }

            btnActivateStreak.disabled = true;
            btnActivateStreak.textContent = 'Đang kích hoạt...';

            try {
                // Step 1: Check if email already exists
                const checkUrl = `/api/log-email?action=checkEmail&email=${encodeURIComponent(email)}`;
                const checkRes = await fetch(checkUrl);
                const checkData = await checkRes.json();

                if (checkData.exists && checkData.user) {
                    window.showGlobalNotification(
                        '⚠️ Đã Đăng Ký Tài Khoản',
                        `Email <strong>${email}</strong> này đã được đăng ký và hoạt động.<br><br>Để bảo vệ tính nhất quán dữ liệu và bảo mật, hệ thống B2B Portal đã tự động ghi nhận phiên đăng nhập của thiết bị này. <strong>Bạn không cần phải nhập email này để đăng nhập/đăng ký lại nữa!</strong>`
                    );
                    
                    // Under-the-hood sync if not already logged in
                    if (localStorage.getItem('streak_email') !== email) {
                        localStorage.setItem('streak_active', 'true');
                        localStorage.setItem('streak_name', checkData.user.name || name);
                        localStorage.setItem('streak_email', email);
                        localStorage.setItem('b2b_points_balance', (checkData.user.points || 0).toString());
                        if (checkData.user.avatar) localStorage.setItem('b2b_custom_avatar', checkData.user.avatar);
                    }
                    
                    nameInput.value = '';
                    emailInput.value = '';
                    btnActivateStreak.disabled = false;
                    btnActivateStreak.textContent = 'Kích Hoạt Ngay';
                    
                    const regBox = document.getElementById('streak-registration-box');
                    const questBox = document.getElementById('quests-dashboard-box');
                    if (regBox) regBox.classList.add('hidden');
                    if (questBox) questBox.classList.remove('hidden');
                    if (window.updateNavbarUserHUD) window.updateNavbarUserHUD();
                    return;
                }

                // Call serverless log-email function
                const response = await fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, tool: 'daily-points' })
                });
                
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('streak_name', name);
                    localStorage.setItem('streak_email', email);
                    localStorage.setItem('streak_active', 'true');
                    localStorage.setItem('b2b_points_balance', '25'); // Welcoming bonus!
                    localStorage.setItem('b2b_points_converted', 'true');
                    
                    // Show quest dashboard
                    const regBox = document.getElementById('streak-registration-box');
                    const questBox = document.getElementById('quests-dashboard-box');
                    if (regBox) regBox.classList.add('hidden');
                    if (questBox) questBox.classList.remove('hidden');

                    initPointsAndTracking();
                    alert(`🎉 Kích hoạt Hệ thống Điểm thành công! Bạn nhận được 25 BD-Points thưởng chào mừng. Bắt đầu làm nhiệm vụ để tích lũy thêm điểm nhé!`);
                } else {
                    alert('Có lỗi xảy ra, vui lòng thử lại sau.');
                    btnActivateStreak.disabled = false;
                    btnActivateStreak.textContent = 'Kích Hoạt Ngay';
                }
            } catch (err) {
                console.error(err);
                alert('Không thể kết nối máy chủ để kích hoạt.');
                btnActivateStreak.disabled = false;
                btnActivateStreak.textContent = 'Kích Hoạt Ngay';
            }
        });
    }

    // Auto-initialize points dashboard if already active
    if (localStorage.getItem('streak_active') === 'true') {
        const regBox = document.getElementById('streak-registration-box');
        const questBox = document.getElementById('quests-dashboard-box');
        if (regBox) regBox.classList.add('hidden');
        if (questBox) questBox.classList.remove('hidden');
    }
    // --- Phase 3: Streak, Exit Intent, Rewards Shop, and Social Sharing ---

    // Tab switcher logic
    const tabStreakBtn = document.getElementById('tab-streak-btn');
    const tabRewardsBtn = document.getElementById('tab-rewards-btn');
    const tabContentStreak = document.getElementById('tab-content-streak');
    const tabContentRewards = document.getElementById('tab-content-rewards');
    
    if (tabStreakBtn && tabRewardsBtn && tabContentStreak && tabContentRewards) {
        tabStreakBtn.addEventListener('click', () => {
            tabStreakBtn.classList.add('active');
            tabRewardsBtn.classList.remove('active');
            tabContentStreak.classList.remove('hidden');
            tabContentRewards.classList.add('hidden');
        });
        tabRewardsBtn.addEventListener('click', () => {
            tabRewardsBtn.classList.add('active');
            tabStreakBtn.classList.remove('active');
            tabContentRewards.classList.remove('hidden');
            tabContentStreak.classList.add('hidden');
        });
    }

    // Dynamically inject Tabbed Exit Intent Modal HTML & CSS if not present
    if (!document.getElementById('exit-intent-modal')) {
        const style = document.createElement('style');
        style.innerHTML = `
            .exit-modal-overlay {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(8px);
                animation: exitFadeIn 0.3s ease;
            }
            .exit-modal-overlay.hidden {
                display: none !important;
            }
            .exit-modal-content {
                background: var(--bg-card, #1e1e24);
                border: 2px solid var(--primary, #f3a83b);
                border-radius: 20px;
                width: 92%; max-width: 680px;
                position: relative;
                box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                color: var(--text-main, #ffffff);
                display: flex;
                overflow: hidden;
                height: 420px;
                animation: exitSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .exit-modal-left-nav {
                width: 180px;
                background: rgba(255, 255, 255, 0.02);
                border-right: 1px solid var(--border-color, #2d3748);
                display: flex;
                flex-direction: column;
                padding: 30px 12px;
                gap: 10px;
                box-sizing: border-box;
                flex-shrink: 0;
            }
            .exit-nav-tab {
                background: none;
                border: none;
                padding: 12px 14px;
                border-radius: 8px;
                color: var(--text-light, #a0aec0);
                font-size: 0.85rem;
                font-weight: 700;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
            }
            .exit-nav-tab:hover {
                background: rgba(255, 255, 255, 0.05);
                color: var(--text-main, #fff);
            }
            .exit-nav-tab.active {
                background: rgba(243, 168, 59, 0.15);
                color: var(--primary, #f3a83b);
                border-left: 3px solid var(--primary, #f3a83b);
            }
            .exit-modal-right-body {
                flex: 1;
                padding: 35px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
                position: relative;
                text-align: left;
                overflow-y: auto;
            }
            .exit-close-btn {
                position: absolute;
                top: 15px; right: 20px;
                background: none; border: none;
                font-size: 2rem; color: var(--text-light, #a0aec0);
                cursor: pointer;
                line-height: 1;
                z-index: 10;
            }
            .exit-close-btn:hover {
                color: var(--primary, #f3a83b);
            }
            .exit-badge {
                background: rgba(243, 168, 59, 0.15);
                color: var(--primary, #f3a83b);
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.72rem;
                font-weight: bold;
                letter-spacing: 1px;
                width: fit-content;
                display: inline-block;
            }
            .exit-tab-content {
                animation: exitFadeIn 0.3s ease;
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .exit-tab-content.hidden {
                display: none !important;
            }
            .exit-tab-content h2 {
                font-size: 1.5rem;
                margin: 12px 0 8px 0;
                font-weight: 800;
                line-height: 1.3;
                color: var(--text-main);
            }
            .exit-book-box {
                display: flex;
                align-items: center;
                gap: 15px;
                background: rgba(255, 255, 255, 0.04);
                border-radius: 12px;
                padding: 12px 15px;
                margin: 12px 0 18px 0;
            }
            .exit-book-emoji {
                font-size: 2.5rem;
                flex-shrink: 0;
            }
            .exit-book-box p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--text-light);
                line-height: 1.45;
            }
            .exit-form-group {
                margin-bottom: 10px;
            }
            .exit-form-group input {
                width: 100%;
                padding: 11px;
                border-radius: 8px;
                border: 1px solid var(--border-color, #2d3748);
                background: var(--bg, #1a202c);
                color: var(--text-main, #ffffff);
                font-size: 0.85rem;
                outline: none;
                box-sizing: border-box;
                font-family: inherit;
            }
            .exit-form-group input:focus {
                border-color: var(--primary, #f3a83b);
            }
            .exit-submit-btn {
                width: 100%;
                padding: 12px;
                border-radius: 8px;
                background: linear-gradient(135deg, var(--primary, #f3a83b), #e29022);
                color: #1a202c;
                font-weight: 700;
                border: none;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 5px;
                transition: all 0.2s;
                box-shadow: 0 4px 15px rgba(243, 168, 59, 0.3);
                font-family: inherit;
            }
            .exit-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(243, 168, 59, 0.4);
            }
            .exit-submit-btn:disabled {
                background: #4a5568;
                cursor: not-allowed;
                box-shadow: none;
                color: #a0aec0;
            }
            .exit-decline-btn {
                background: none; border: none;
                color: var(--text-light, #a0aec0);
                font-size: 0.8rem;
                margin-top: 15px;
                cursor: pointer;
                text-decoration: underline;
                align-self: center;
                font-family: inherit;
            }
            .exit-decline-btn:hover {
                color: var(--danger, #fc8181);
            }
            .exit-scenario-preview {
                background: rgba(255, 255, 255, 0.03);
                border-left: 3px solid var(--primary);
                padding: 12px 15px;
                border-radius: 4px;
                margin: 15px 0 20px 0;
            }
            .exit-scenario-preview strong {
                font-size: 0.72rem;
                color: var(--primary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: block;
                margin-bottom: 4px;
            }
            .exit-scenario-preview p {
                margin: 0;
                font-size: 0.85rem;
                font-style: italic;
                color: var(--text-main);
                line-height: 1.4;
            }
            .exit-action-btn {
                width: 100%;
                padding: 12px;
                border-radius: 8px;
                background: linear-gradient(135deg, var(--primary, #f3a83b), #e29022);
                color: #1a202c;
                font-weight: 700;
                border: none;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
                box-shadow: 0 4px 15px rgba(243, 168, 59, 0.3);
                font-family: inherit;
                text-align: center;
            }
            .exit-action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(243, 168, 59, 0.4);
            }
            .exit-tools-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin: 15px 0 20px 0;
            }
            .exit-tool-item {
                background: rgba(255, 255, 255, 0.03);
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 0.78rem;
                cursor: pointer;
                border: 1px solid transparent;
                transition: all 0.2s;
                line-height: 1.4;
            }
            .exit-tool-item:hover {
                border-color: var(--primary);
                background: rgba(243, 168, 59, 0.05);
            }
            .exit-tool-item strong {
                color: var(--primary);
            }
            .exit-community-preview {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin: 15px 0 20px 0;
            }
            .exit-news-item {
                background: rgba(255, 255, 255, 0.03);
                padding: 12px;
                border-radius: 8px;
                font-size: 0.75rem;
                line-height: 1.45;
            }
            .exit-news-item strong {
                color: var(--accent);
            }
            @keyframes exitFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes exitSlideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @media (max-width: 580px) {
                .exit-modal-content {
                    flex-direction: column;
                    height: auto;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .exit-modal-left-nav {
                    width: 100%;
                    flex-direction: row;
                    overflow-x: auto;
                    border-right: none;
                    border-bottom: 1px solid var(--border-color);
                    padding: 10px;
                }
                .exit-nav-tab {
                    white-space: nowrap;
                    padding: 8px 12px;
                    font-size: 0.75rem;
                }
                .exit-modal-right-body {
                    padding: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const modalDiv = document.createElement('div');
        modalDiv.id = 'exit-intent-modal';
        modalDiv.className = 'exit-modal-overlay hidden';
        modalDiv.innerHTML = `
            <div class="exit-modal-content">
                <button id="btn-close-exit-modal" class="exit-close-btn">&times;</button>
                
                <div class="exit-modal-left-nav">
                    <button class="exit-nav-tab active" data-tab="tab-gift">🎁 Nhận Quà</button>
                    <button class="exit-nav-tab" data-tab="tab-challenge">🎮 Luyện Tập</button>
                    <button class="exit-nav-tab" data-tab="tab-tools">⚡ Trợ Thủ AI</button>
                    <button class="exit-nav-tab" data-tab="tab-community">💬 Cộng Đồng</button>
                </div>
                
                <div class="exit-modal-right-body">
                    <!-- Tab Content: Gift -->
                    <div id="exit-tab-gift" class="exit-tab-content">
                        <span class="exit-badge">🎁 QUÀ TẶNG GIỮ CHÂN</span>
                        <h2>Đừng rời đi tay trắng!</h2>
                        <div class="exit-book-box">
                            <span class="exit-book-emoji">📖</span>
                            <p>Nhận miễn phí Ebook <strong>"Mindset Thép của BD"</strong> để rèn luyện tinh thần kiên cường, vượt qua mọi từ chối của khách hàng B2B.</p>
                        </div>
                        <form id="exit-intent-form">
                            <div class="exit-form-group">
                                <input type="text" id="exit-name" placeholder="Tên của bạn" required />
                            </div>
                            <div class="exit-form-group">
                                <input type="email" id="exit-email" placeholder="Email nhận sách" required />
                            </div>
                            <button type="submit" class="exit-submit-btn">📥 Nhận Ebook Free & Bật Nhắc Nhở</button>
                        </form>
                    </div>

                    <!-- Tab Content: Challenge -->
                    <div id="exit-tab-challenge" class="exit-tab-content hidden">
                        <span class="exit-badge">🎮 LUYỆN TẬP HÀNG NGÀY</span>
                        <h2>B2B Challenge Tình Huống</h2>
                        <p style="font-size: 0.8rem; color: var(--text-light); line-height: 1.45; margin: 8px 0 0 0;">Chỉ 3 phút mỗi ngày để rèn luyện phản xạ đỉnh cao trước khách hàng. Thử thách của hôm nay đang chờ bạn:</p>
                        <div class="exit-scenario-preview">
                            <strong>🔥 Câu Hỏi Hot Hôm Nay:</strong>
                            <p>"Khi khách hàng Enterprise đòi thời gian dùng thử (POC) kéo dài tới 6 tháng..."</p>
                        </div>
                        <button id="btn-exit-play" class="exit-action-btn">🎮 Chơi Thử Thách Ngay</button>
                    </div>

                    <!-- Tab Content: Tools -->
                    <div id="exit-tab-tools" class="exit-tab-content hidden">
                        <span class="exit-badge">⚡ TRỢ THỦ BD B2B</span>
                        <h2>Tối Ưu 80% Vận Hành</h2>
                        <p style="font-size: 0.8rem; color: var(--text-light); line-height: 1.4; margin: 8px 0 0 0;">Trải nghiệm các tính năng miễn phí giúp bạn chốt hợp đồng nhanh hơn:</p>
                        <div class="exit-tools-list">
                            <div class="exit-tool-item" data-url="pitching.html">
                                <strong>🎤 Pitching AI:</strong> Tạo kịch bản & slide thuyết trình dự án bằng AI.
                            </div>
                            <div class="exit-tool-item" data-url="email-assistant.html">
                                <strong>✉️ AI Email:</strong> Viết cold email cá nhân hóa chuẩn chuyên gia.
                            </div>
                            <div class="exit-tool-item" data-url="salary.html">
                                <strong>📊 Lương Gross-Net:</strong> Tính toán hoa hồng B2B thực tế.
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: Community -->
                    <div id="exit-tab-community" class="exit-tab-content hidden">
                        <span class="exit-badge">💬 KẾT NỐI ĐỒNG ĐỘI</span>
                        <h2>Cộng Đồng BD Thực Chiến</h2>
                        <p style="font-size: 0.8rem; color: var(--text-light); line-height: 1.4; margin: 8px 0 0 0;">Nơi thảo luận case-study thực tế và nhận feedback trực tiếp từ anh Peter Vo:</p>
                        <div class="exit-community-preview">
                            <div class="exit-news-item">
                                🔥 <strong>Hot Post:</strong> Kịch bản xử lý khi sếp đối tác hoãn ký phút chót.
                            </div>
                            <div class="exit-news-item">
                                💬 <strong>Thảo luận:</strong> Pitching trực tiếp vs Gửi Proposal qua mail - cái nào tốt hơn?
                            </div>
                        </div>
                        <a href="community.html" class="exit-action-btn" style="text-decoration: none; display: block; text-align: center; line-height: 40px; height: 40px; padding: 0;">💬 Ghé Thăm Cộng Đồng Ngay</a>
                    </div>

                    <button id="btn-decline-exit" class="exit-decline-btn">Không, tôi muốn rời đi</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    // Exit Intent Dialog closing and submissions
    const exitIntentModal = document.getElementById('exit-intent-modal');
    const btnCloseExitModal = document.getElementById('btn-close-exit-modal');
    const btnDeclineExit = document.getElementById('btn-decline-exit');
    const exitIntentForm = document.getElementById('exit-intent-form');

    // Tab switcher logic
    const exitNavTabs = document.querySelectorAll('.exit-nav-tab');
    const exitTabContents = document.querySelectorAll('.exit-tab-content');
    exitNavTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            exitNavTabs.forEach(t => t.classList.remove('active'));
            exitTabContents.forEach(c => c.classList.add('hidden'));
            
            tab.classList.add('active');
            const targetTabId = 'exit-' + tab.getAttribute('data-tab');
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) targetContent.classList.remove('hidden');
        });
    });

    // Play action trigger
    const btnExitPlay = document.getElementById('btn-exit-play');
    if (btnExitPlay) {
        btnExitPlay.addEventListener('click', () => {
            if (exitIntentModal) exitIntentModal.classList.add('hidden');
            const minigameSection = document.getElementById('minigame-section');
            if (minigameSection) {
                minigameSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = '/index.html#minigame-section';
            }
        });
    }

    // Tool items redirect trigger
    const exitToolItems = document.querySelectorAll('.exit-tool-item');
    exitToolItems.forEach(item => {
        item.addEventListener('click', () => {
            if (exitIntentModal) exitIntentModal.classList.add('hidden');
            const url = item.getAttribute('data-url');
            if (url) window.location.href = url;
        });
    });

    if (btnCloseExitModal) {
        btnCloseExitModal.addEventListener('click', () => {
            if (exitIntentModal) exitIntentModal.classList.add('hidden');
            localStorage.setItem('exit_intent_dismissed', 'true');
        });
    }
    if (btnDeclineExit) {
        btnDeclineExit.addEventListener('click', () => {
            if (exitIntentModal) exitIntentModal.classList.add('hidden');
            localStorage.setItem('exit_intent_dismissed', 'true');
        });
    }
    if (exitIntentForm) {
        exitIntentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('exit-name');
            const emailInput = document.getElementById('exit-email');
            if (!nameInput || !emailInput) return;
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();

            const submitBtn = exitIntentForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang xử lý...';
            }

            try {
                const ebookUrl = '/ebooks/Mindset BD Ebook.pdf';
                const res = await fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        tool: 'exit-intent-ebook',
                        ebookTitle: 'Mindset Thép của BD',
                        downloadLink: window.location.origin + ebookUrl
                    })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('streak_name', name);
                    localStorage.setItem('streak_email', email);
                    localStorage.setItem('streak_active', 'true');
                    localStorage.setItem('b2b_points_balance', '25'); // Welcoming bonus!
                    localStorage.setItem('b2b_points_converted', 'true');

                    // Instantly update welcome banner & tab counts
                    initPointsAndTracking();
                    
                    // Instantly open the ebook PDF in a new window/tab
                    window.open(ebookUrl, '_blank');
                    
                    alert(`🎉 Đăng ký thành công! Bạn nhận được 25 BD-Points thưởng chào mừng. Ebook "Mindset Thép của BD" đã được mở trong tab mới.`);
                    if (exitIntentModal) exitIntentModal.classList.add('hidden');
                } else {
                    alert('Có lỗi xảy ra, vui lòng thử lại.');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '📥 Nhận Ebook Free & Bật Nhắc Nhở';
                    }
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối máy chủ.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '📥 Nhận Ebook Free & Bật Nhắc Nhở';
                }
            }
        });
    }
// Claim Reward action
    const claimBtns = document.querySelectorAll('.btn-claim');
    claimBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const reward = btn.getAttribute('data-reward');
            const reqVal = parseInt(btn.getAttribute('data-requirement') || '200', 10);
            const points = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
            
            if (points < reqVal) {
                alert(`🦉 Cú BeeDee Thông Thái lắc đầu từ chối! Bạn mới tích lũy được ${points} BD-Points. Cần đạt tối thiểu ${reqVal} điểm để mở khóa món quà "${reward}" nhé!`);
                return;
            }

            // Valid points balance, prompt for confirmation
            const name = localStorage.getItem('streak_name') || prompt('Nhập tên của bạn để nhận quà:');
            const email = localStorage.getItem('streak_email') || prompt('Nhập email nhận quà của bạn:');
            
            if (!name || !email) {
                alert('Thông tin không hợp lệ, không thể đổi quà!');
                return;
            }

            // Deduct points
            const newBalance = points - reqVal;
            localStorage.setItem('b2b_points_balance', newBalance.toString());

            if (reqVal === 200) {
                // Ebook unlock: Local activation
                localStorage.setItem('b2b_streak_unlocked_ebook', 'true');
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.borderColor = 'var(--border-color)';
                btn.style.color = '#34d399';
                btn.textContent = 'Đã Mở Khóa';
                btn.disabled = true;

                // Log to spreadsheet
                try {
                    await fetch('/api/log-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, tool: 'claim-reward', reward: reward, streak: points })
                    });
                } catch(e) {}

                alert(`🎉 Chúc mừng! Bạn đã mở khóa đặc quyền "Tải Ebook Mới" thành công (-200 BD-Points). Từ bây giờ bạn có thể tự do tải các tài liệu thực chiến trên Thư viện mà không bị giới hạn 1 cuốn/ngày!`);
                if (typeof updateUIElements === 'function') updateUIElements();
                return;
            }

            // For >=600 points: claim via email request
            btn.disabled = true;
            btn.textContent = 'Đang đăng ký...';

            try {
                // Log to spreadsheet for backup
                await fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, tool: 'claim-reward', reward: reward, streak: points })
                });

                alert(`🎉 Đủ điều kiện đổi quà! Để nhận món quà "${reward}", bạn vui lòng gửi email về: bdtrainingcourse@gmail.com kèm ảnh chụp màn hình số Điểm của bạn để anh Peter xác nhận và trao quà nhé! (Hệ thống sẽ tự động mở hòm thư soạn sẵn cho bạn bây giờ).`);

                // Open mailto client
                const mailtoSubject = `[Đổi Quà Tích Điểm] Đăng ký nhận: ${reward}`;
                const mailtoBody = `Chào anh Peter Võ,\n\nTên tôi là: ${name}\nEmail của tôi: ${email}\n\nTôi muốn đổi phần quà mốc ${reqVal} BD-Points: ${reward}.\nDưới đây là ảnh chụp màn hình số Điểm & Nhiệm vụ của tôi trên portal.\n\nCảm ơn anh!`;
                const mailtoUrl = `mailto:bdtrainingcourse@gmail.com?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;
                window.location.href = mailtoUrl;

                btn.textContent = 'Mở Khóa Quà';
                btn.disabled = false;
                if (typeof updateUIElements === 'function') updateUIElements();
            } catch(err) {
                console.error(err);
                alert('Lỗi kết nối máy chủ, nhưng bạn vẫn có thể gửi email thủ công về bdtrainingcourse@gmail.com để đổi quà!');
                btn.textContent = 'Mở Khóa Quà';
                btn.disabled = false;
                if (typeof updateUIElements === 'function') updateUIElements();
            }
        });
    });

    // Social share triggers
    const shareLinkedin = document.getElementById('share-linkedin-btn');
    const shareFacebook = document.getElementById('share-facebook-btn');
    const shareCopy = document.getElementById('share-copy-btn');

    if (shareLinkedin) {
        shareLinkedin.addEventListener('click', () => {
            if (window.registerUserAction) window.registerUserAction('share_click');
            const shareText = `Tôi vừa đạt điểm tối đa trong thử thách B2B Challenge của Peter Võ! 🚀 Học hỏi thực chiến mỗi ngày để nâng cấp tư duy BD B2B. Luyện tập cùng tôi tại: https://bd-tips.vercel.app/`;
            const url = encodeURIComponent(window.location.href);
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        });
    }
    if (shareFacebook) {
        shareFacebook.addEventListener('click', () => {
            if (window.registerUserAction) window.registerUserAction('share_click');
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
        });
    }
    if (shareCopy) {
        shareCopy.addEventListener('click', () => {
            if (window.registerUserAction) window.registerUserAction('share_click');
            const copyText = `Tôi vừa đạt điểm tối đa trong thử thách B2B Challenge của Peter Võ! 🚀 Luyện tập cùng tôi tại: https://bd-tips.vercel.app/`;
            navigator.clipboard.writeText(copyText).then(() => {
                alert('📋 Đã sao chép liên kết chia sẻ! Bạn có thể dán trực tiếp lên LinkedIn, Facebook, Instagram hoặc Tiktok.');
            }).catch(err => {
                console.error('Error copying text:', err);
            });
        });
    }

    const CAMPAIGN_NAMES = {
        pic_search: '🎙️ Luyện Pitching AI',
        ai_email: '✍️ Soạn Cold Email AI',
        share_click: '📢 Chia sẻ template',
        labor_read: '⚖️ Nghiên cứu Luật',
        salary_calc: '💸 Tính hoa hồng BD',
        library_read: '📖 Đọc Thư viện',
        forum_post: '💬 Đóng góp diễn đàn'
    };

    window.renderQuestBoard = function() {
        const dailyContainer = document.getElementById('daily-quests-list');
        const weeklyContainer = document.getElementById('weekly-quests-list');
        if (!dailyContainer) return;

        const QUEST_CONFIG = window.QUEST_CONFIG || {};
        const todayStr = new Date().toISOString().split('T')[0];
        const progressKeyDaily = `b2b_quest_progress_${todayStr}`;
        let progressDaily = {};
        try {
            progressDaily = JSON.parse(localStorage.getItem(progressKeyDaily) || '{}');
        } catch(e) {}

        if (!progressDaily.check_in && Object.keys(progressDaily).length > 0) {
            progressDaily.check_in = 1;
        }

        let progressWeekly = {};
        if (typeof window.getWeekCode === 'function') {
            const progressKeyWeekly = `b2b_quest_progress_weekly_${window.getWeekCode()}`;
            try {
                progressWeekly = JSON.parse(localStorage.getItem(progressKeyWeekly) || '{}');
            } catch(e) {}
        }

        dailyContainer.innerHTML = '';
        if (weeklyContainer) weeklyContainer.innerHTML = '';

        for (let key in QUEST_CONFIG) {
            const quest = QUEST_CONFIG[key];
            const isWeekly = quest.period === 'weekly';
            const progress = isWeekly ? progressWeekly : progressDaily;
            const current = progress[key] || 0;
            const isCompleted = current >= quest.limit;

            const questEl = document.createElement('div');
            questEl.style.display = 'flex';
            questEl.style.alignItems = 'center';
            questEl.style.justifyContent = 'space-between';
            questEl.style.background = 'rgba(255, 255, 255, 0.02)';
            questEl.style.padding = '8px 12px';
            questEl.style.borderRadius = '6px';
            questEl.style.border = '1px solid rgba(255, 255, 255, 0.05)';
            questEl.style.opacity = isCompleted ? '0.65' : '1';
            questEl.style.cursor = 'pointer';
            questEl.style.transition = 'all 0.2s ease';

            questEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.95rem; line-height: 1;">${isCompleted ? '✅' : '⬜'}</span>
                    <div>
                        <div style="font-size: 0.75rem; font-weight: bold; color: ${isCompleted ? 'var(--text-light)' : 'var(--text-main)'}; ${isCompleted ? 'text-decoration: line-through;' : ''}">${quest.name}</div>
                        <div style="font-size: 0.65rem; color: var(--text-light); margin-top: 1px;">Tiến trình: ${current}/${quest.limit}</div>
                    </div>
                </div>
                <span style="font-size: 0.72rem; font-weight: bold; color: var(--primary);">+${quest.points}đ</span>
            `;

            // Click navigation
            const destMap = {
                check_in: '#personalized-welcome-banner',
                game_complete: '#minigame-section',
                perfect_game: '#minigame-section',
                pic_search: 'pitching.html',
                ai_email: 'email-assistant.html',
                share_click: 'email-assistant.html',
                labor_read: 'labor-law.html',
                salary_calc: 'salary.html',
                library_read: 'library.html',
                forum_post: 'community.html',
                forum_comment: 'community.html'
            };
            const dest = destMap[key];
            if (dest) {
                questEl.addEventListener('click', (e) => {
                    // Prevent navigation click trigger if they click specific sub-elements if any
                    if (dest.startsWith('#')) {
                        const target = document.getElementById(dest.substring(1));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    } else {
                        window.location.href = dest;
                    }
                });
            }

            if (isWeekly && weeklyContainer) {
                weeklyContainer.appendChild(questEl);
            } else {
                dailyContainer.appendChild(questEl);
            }
        }
    };

    window.renderCampaignBoard = function() {
        const campaignBox = document.getElementById('active-campaign-box');
        if (!campaignBox) return;

        const CAMPAIGNS_CONFIG = window.CAMPAIGNS_CONFIG || {};
        campaignBox.innerHTML = '';

        for (let campId in CAMPAIGNS_CONFIG) {
            const campaign = CAMPAIGNS_CONFIG[campId];
            const isCompleted = localStorage.getItem(`b2b_campaign_completed_${campId}`) === 'true';
            const campaignProgressKey = `b2b_campaign_progress_${campId}`;
            let campProgress = {};
            try {
                campProgress = JSON.parse(localStorage.getItem(campaignProgressKey) || '{}');
            } catch(e) {}

            const destMap = {
                check_in: '#personalized-welcome-banner',
                game_complete: '#minigame-section',
                perfect_game: '#minigame-section',
                pic_search: 'pitching.html',
                ai_email: 'email-assistant.html',
                share_click: 'email-assistant.html',
                labor_read: 'labor-law.html',
                salary_calc: 'salary.html',
                library_read: 'library.html',
                forum_post: 'community.html',
                forum_comment: 'community.html'
            };

            let checklistHtml = '';
            for (let key in campaign.requirements) {
                const current = campProgress[key] || 0;
                const req = campaign.requirements[key];
                const isTaskDone = current >= req;
                const displayName = CAMPAIGN_NAMES[key] || key;
                const dest = destMap[key] || '#';

                checklistHtml += `
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem; color: var(--text-light); cursor: pointer; padding: 3px 6px; border-radius: 4px; transition: background 0.2s;" class="campaign-req-item" onclick="if ('${dest}'.startsWith('#')) { const t = document.getElementById('${dest.substring(1)}'); if (t) t.scrollIntoView({behavior:'smooth'}); } else { window.location.href='${dest}'; }">
                        <span style="${isTaskDone ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${isTaskDone ? '🔹' : '🔸'} ${displayName}</span>
                        <span style="font-weight: bold; color: ${isTaskDone ? '#10b981' : 'inherit'};">${current}/${req}</span>
                    </div>
                `;
            }

            const campaignCard = document.createElement('div');
            campaignCard.style.cssText = 'background: rgba(243, 168, 59, 0.03); border: 1px dashed var(--primary); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;';
            campaignCard.innerHTML = `
                <div style="font-size: 0.78rem; font-weight: bold; color: var(--primary); margin-bottom: 2px;">${campaign.title}</div>
                <div style="font-size: 0.65rem; color: var(--text-light); line-height: 1.3; margin-bottom: 8px;">${campaign.desc}</div>
                <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px solid rgba(243, 168, 59, 0.15); padding-top: 8px; margin-bottom: 10px;">
                    ${checklistHtml}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed rgba(243, 168, 59, 0.2); padding-top: 8px;">
                    <span style="font-size: 0.65rem; color: #34d399; font-weight: bold;">Thưởng: +${campaign.bonus}đ bonus</span>
                    <span style="font-size: 0.65rem; background: ${isCompleted ? '#10b981' : '#4b5563'}; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                        ${isCompleted ? 'Đã xong 🏆' : 'Đang chạy ⚡'}
                    </span>
                </div>
            `;
            campaignBox.appendChild(campaignCard);
        }
    };

    window.navigateFromWelcomeBack = function(dest) {
        if (typeof window.closeWelcomeBackModal === 'function') {
            window.closeWelcomeBackModal();
        }
        if (dest.includes('#')) {
            const parts = dest.split('#');
            const file = parts[0];
            const hash = parts[1];
            const currentPath = window.location.pathname;
            const isOnSamePage = (file === '' || 
                                  (file === 'index.html' && (currentPath === '/' || currentPath === '' || currentPath.endsWith('/') || currentPath.endsWith('index.html'))) ||
                                  currentPath.endsWith(file));
            if (isOnSamePage) {
                const target = document.getElementById(hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, null, '#' + hash);
                    return;
                }
            }
        }
        window.location.href = dest;
    };

    window.initWelcomeBackPopup = function() {
        if (localStorage.getItem('streak_active') !== 'true') return;

        const todayStr = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('last_welcome_back_shown') === todayStr) return;

        const QUEST_CONFIG = window.QUEST_CONFIG || {};
        const progressKeyDaily = `b2b_quest_progress_${todayStr}`;
        let progressDaily = {};
        try {
            progressDaily = JSON.parse(localStorage.getItem(progressKeyDaily) || '{}');
        } catch(e) {}

        let remainingQuests = [];
        for (let key in QUEST_CONFIG) {
            const quest = QUEST_CONFIG[key];
            if (quest.period !== 'daily') continue;
            const current = progressDaily[key] || 0;
            if (current < quest.limit) {
                remainingQuests.push({
                    key: key,
                    name: quest.name,
                    points: quest.points,
                    current: current,
                    limit: quest.limit
                });
            }
        }

        if (remainingQuests.length === 0) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'welcome-back-remind-modal';
        modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100000; opacity: 0; transition: opacity 0.3s ease;';

        const name = localStorage.getItem('streak_name') || 'Chiến thần';
        
        const destMap = {
            check_in: 'quests.html#personalized-welcome-banner',
            game_complete: 'index.html#minigame-section',
            perfect_game: 'index.html#minigame-section',
            pic_search: 'pitching.html',
            ai_email: 'email-assistant.html',
            share_click: 'email-assistant.html',
            labor_read: 'labor-law.html',
            salary_calc: 'salary.html',
            library_read: 'library.html',
            forum_post: 'community.html',
            forum_comment: 'community.html'
        };

        const closeModal = () => {
            modalOverlay.style.opacity = '0';
            if (typeof modalOverlay.querySelector === 'function') {
                const innerDiv = modalOverlay.querySelector('div');
                if (innerDiv) innerDiv.style.transform = 'scale(0.9)';
            }
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };
        window.closeWelcomeBackModal = closeModal;

        let checklistHtml = remainingQuests.map(q => {
            const dest = destMap[q.key] || '#';
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s ease;" class="welcome-popup-item" onclick="window.navigateFromWelcomeBack('${dest}')">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border: 1.5px solid #94a3b8; border-radius: 3px; background: transparent; flex-shrink: 0;"></span>
                        <span style="font-size: 0.8rem; font-weight: bold; color: #ffffff;">${q.name}</span>
                    </div>
                    <span style="font-weight: 800; font-size: 0.75rem; color: #ff6b6b;">+${q.points}đ</span>
                </div>
            `;
        }).join('');

        modalOverlay.innerHTML = `
            <div style="background: linear-gradient(135deg, #1d1e2a 0%, #11121d 100%); border: 1.5px solid var(--primary); border-radius: 24px; max-width: 480px; width: 90%; padding: 30px; box-shadow: 0 25px 60px rgba(0,0,0,0.55); position: relative; text-align: left; transform: scale(0.9); transition: transform 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif;">
                <button id="btn-close-welcome-back" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.3rem; color: #94a3b8; cursor: pointer; line-height: 1;">&times;</button>
                
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(243, 168, 59, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0;">🦉</div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;">Chào mừng trở lại, ${name}!</h3>
                        <p style="margin: 3px 0 0 0; font-size: 0.72rem; color: #f3a83b; font-weight: bold;">Hôm nay bạn đã rèn luyện chưa?</p>
                    </div>
                </div>

                <p style="font-size: 0.8rem; line-height: 1.5; color: #94a3b8; margin: 0 0 20px 0;">
                    Cú BeeDee vẫn luôn ở đây đồng hành cùng bạn trên con đường nâng tầm ngôn từ B2B. Hôm nay bạn còn <strong style="color: #ff6b6b;">${remainingQuests.length} nhiệm vụ hàng ngày</strong> chưa hoàn thành đấy nhé:
                </p>

                <div style="max-height: 220px; overflow-y: auto; margin-bottom: 25px; padding-right: 5px;">
                    ${checklistHtml}
                </div>

                <button id="btn-action-welcome-back" class="btn btn-primary" style="width: 100%; padding: 12px; border-radius: 10px; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #ff416c, #ff4b2b); border: none; color: #ffffff; cursor: pointer;">
                    ⚡ Bắt Đầu Thực Chiến Ngay!
                </button>
           </div>
        `;

        document.body.appendChild(modalOverlay);
        localStorage.setItem('last_welcome_back_shown', todayStr);

        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            if (typeof modalOverlay.querySelector === 'function') {
                const innerDiv = modalOverlay.querySelector('div');
                if (innerDiv) innerDiv.style.transform = 'scale(1)';
            }
        }, 50);

        document.getElementById('btn-close-welcome-back').addEventListener('click', closeModal);
        
        const ctaBtn = document.getElementById('btn-action-welcome-back');
        ctaBtn.addEventListener('click', () => {
            closeModal();
            window.location.href = 'quests.html';
        });
    };

    function updateWelcomeBanner(points) {
        const banner = document.getElementById('personalized-welcome-banner');
        const bannerTitle = document.getElementById('welcome-banner-title');
        const bannerStreak = document.getElementById('welcome-banner-streak');
        const streakActive = localStorage.getItem('streak_active') === 'true';
        const name = localStorage.getItem('streak_name');

        if (banner && streakActive && name) {
            banner.classList.remove('hidden');
            bannerTitle.textContent = `Chào mừng trở lại, ${name}! 🦉`;
            bannerStreak.textContent = `Số dư: ${points} BD-Points 🪙`;
        } else if (banner) {
            banner.classList.add('hidden');
        }

        const hudPointsVal = document.getElementById('hud-points-val');
        const hudNextGiftLbl = document.getElementById('hud-next-gift-lbl');
        const hudNextGiftBar = document.getElementById('hud-next-gift-bar');
        
        if (hudPointsVal) {
            hudPointsVal.textContent = `${points} BD-Points`;
        }

        if (hudNextGiftLbl && hudNextGiftBar) {
            const rewards = [200, 600, 1200, 1800, 3000];
            let nextThreshold = 200;
            let prevThreshold = 0;
            for (let r of rewards) {
                if (points < r) {
                    nextThreshold = r;
                    break;
                }
                prevThreshold = r;
                nextThreshold = 3000;
            }

            if (points >= 3000) {
                hudNextGiftLbl.textContent = 'Đã đạt mốc tối đa! 🎉';
                hudNextGiftBar.style.width = '100%';
            } else {
                const diff = nextThreshold - points;
                hudNextGiftLbl.textContent = `Cách quà tiếp theo: ${diff}đ`;
                
                const range = nextThreshold - prevThreshold;
                const progressVal = points - prevThreshold;
                const pct = Math.min(100, Math.max(0, (progressVal / range) * 100));
                hudNextGiftBar.style.width = `${pct}%`;
            }
        }
    }

    function updateRewardShopUI(points) {
        const claimBtns = document.querySelectorAll('.btn-claim');
        claimBtns.forEach(btn => {
            const reqVal = parseInt(btn.getAttribute('data-requirement') || '200', 10);
            const reward = btn.getAttribute('data-reward');

            if (reqVal === 200 && localStorage.getItem('b2b_streak_unlocked_ebook') === 'true') {
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.borderColor = 'var(--border-color)';
                btn.style.color = '#34d399';
                btn.textContent = 'Đã Mở Khóa';
                btn.disabled = true;
                return;
            }

            if (points >= reqVal) {
                btn.style.background = 'var(--primary)';
                btn.style.borderColor = 'var(--primary)';
                btn.style.color = '#fff';
                btn.textContent = 'Mở Khóa Quà';
                btn.disabled = false;
            } else {
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.borderColor = 'var(--border-color)';
                btn.style.color = 'var(--text-light)';
                btn.textContent = `Khóa (${reqVal}đ) 🔒`;
            }
        });
    }

    function initPointsAndTracking() {
        const streakActive = localStorage.getItem('streak_active') === 'true';
        const regBox = document.getElementById('streak-registration-box');
        const questBox = document.getElementById('quests-dashboard-box');

        if (streakActive) {
            if (regBox) regBox.classList.add('hidden');
            if (questBox) questBox.classList.remove('hidden');

            if (localStorage.getItem('b2b_points_converted') !== 'true') {
                const streakVal = parseInt(localStorage.getItem('streak_days') || '0', 10);
                const initialPoints = Math.max(25, streakVal * 25);
                localStorage.setItem('b2b_points_balance', initialPoints.toString());
                localStorage.setItem('b2b_points_converted', 'true');
            }

            if (typeof window.renderQuestBoard === 'function') window.renderQuestBoard();
            if (typeof window.renderCampaignBoard === 'function') window.renderCampaignBoard();
        } else {
            if (regBox) regBox.classList.remove('hidden');
            if (questBox) questBox.classList.add('hidden');
        }

        const balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
        updateWelcomeBanner(balance);
        updateRewardShopUI(balance);
    }

    let exitIntentTriggered = false;
    function initExitIntent() {
        if (localStorage.getItem('streak_active') === 'true' || localStorage.getItem('exit_intent_dismissed') === 'true') return;

        // Desktop mouseleave exit intent
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 50 && !exitIntentTriggered && localStorage.getItem('streak_active') !== 'true' && localStorage.getItem('exit_intent_dismissed') !== 'true') {
                showExitIntentPopup();
            }
        });

        // Mobile timer exit intent fallback
        setTimeout(() => {
            if (!exitIntentTriggered && localStorage.getItem('streak_active') !== 'true' && localStorage.getItem('exit_intent_dismissed') !== 'true') {
                showExitIntentPopup();
            }
        }, 40000);
    }

    function showExitIntentPopup() {
        const modal = document.getElementById('exit-intent-modal');
        if (modal) {
            modal.classList.remove('hidden');
            exitIntentTriggered = true;
        }
    }

    // Run initializations on startup
    initPointsAndTracking();
    initExitIntent();
    if (typeof window.initWelcomeBackPopup === 'function') {
        window.initWelcomeBackPopup();
    }

    function renderReviewAnswers(container, activeGame, userAnswers) {
        const questionsList = activeGame.shuffledQuestions || activeGame.questions;
        container.innerHTML = `
            <h4 style="margin-top: 0; font-size: 1.05rem; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; color: var(--text-main); margin-bottom: 15px;">
                📋 CHI TIẾT CÂU HỎI & ĐÁP ÁN
            </h4>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                ${questionsList.map((q, qIdx) => {
                    const userAns = userAnswers[qIdx];
                    const correctOpt = q.options.find(o => o.isCorrect);
                    const isUserCorrect = userAns && userAns.isCorrect;
                    
                    return `
                        <div style="border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 15px; margin-bottom: 5px;">
                            <h5 style="margin: 0 0 10px 0; font-size: 0.9rem; font-weight: bold; color: var(--text-main); line-height: 1.4;">
                                Câu ${qIdx + 1}: ${q.context}
                            </h5>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                ${q.options.map(opt => {
                                    let style = 'padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.8rem; line-height: 1.3;';
                                    let prefix = '';
                                    
                                    if (opt.isCorrect) {
                                        style += ' background: #dcfce7 !important; border-color: #15803d !important; color: #166534 !important; font-weight: bold;';
                                        prefix = '✅ ';
                                    } else if (userAns && userAns.text === opt.text) {
                                        style += ' background: #fee2e2 !important; border-color: #b91c1c !important; color: #991b1b !important;';
                                        prefix = '❌ ';
                                    } else {
                                        style += ' opacity: 0.6;';
                                    }
                                    
                                    return `
                                        <div style="${style}">
                                            ${prefix}${opt.text}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.02); border-left: 3px solid ${isUserCorrect ? '#15803d' : '#b91c1c'}; border-radius: 4px; font-size: 0.75rem; color: var(--text-light); line-height: 1.4;">
                                <strong>Lý giải đáp án đúng:</strong> ${correctOpt ? (correctOpt.feedback || 'Chính xác.') : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Scroll to #quests-section if hash is present on load
    window.addEventListener('load', () => {
        if (window.location.hash === '#quests-section') {
            const target = document.getElementById('quests-section');
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    });

