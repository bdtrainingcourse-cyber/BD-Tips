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
                },
                {
                    context: "Trong một buổi họp pitching, vai trò chủ yếu của bạn là gì?",
                    options: [
                        { text: "Nói liên tục để giới thiệu sản phẩm không ngừng nghỉ.", points: 0, feedback: "Bán hàng B2B không phải là độc thoại. Bạn đang đẩy khách hàng ra xa." },
                        { text: "Lắng nghe 70%, hỏi câu hỏi định hướng 20%, giới thiệu giải pháp 10%.", points: 2, feedback: "Chính xác! BD xuất sắc là người lắng nghe giỏi nhất." },
                        { text: "Ngồi im lặng hoàn toàn để kỹ thuật nói.", points: 0, feedback: "Bạn cần đóng vai trò điều phối và chốt lộ trình cuộc họp." }
                    ]
                },
                {
                    context: "Nếu deal bị đóng băng 2 tháng không phản hồi, bạn sẽ làm gì?",
                    options: [
                        { text: "Hàng ngày nhắn tin hỏi họ đã quyết định chưa.", points: 0, feedback: "Spam liên tục gây phản cảm và hạ thấp giá trị giải pháp." },
                        { text: "Cung cấp thêm tài liệu giá trị hữu ích liên quan đến khó khăn của họ để giữ ấm liên hệ.", points: 2, feedback: "Đỉnh cao follow-up! Luôn trao giá trị thay vì đòi hỏi kết quả." },
                        { text: "Bỏ cuộc và xóa luôn thông tin lead đó.", points: 0, feedback: "Có những deal B2B mất 6-12 tháng nuôi dưỡng mới chốt được." }
                    ]
                }
            ],
            getResult: (points) => {
                if (points >= 8) {
                    return { sfx: 'win', title: "Nên theo BD (Tố chất cao) 🔥", color: "var(--primary)", text: `Bạn đạt ${points}/10 điểm. Bạn có đầy đủ tố chất cần thiết để thành công trong nghề BD: chịu được áp lực, chủ động, kiên trì và ham học hỏi. Hãy bắt đầu chiến đấu ngay thôi!` };
                } else if (points >= 5) {
                    return { sfx: 'correct', title: "Cần Trau Dồi Thêm (Tiềm năng) 📊", color: "var(--text-main)", text: `Bạn đạt ${points}/10 điểm. Bạn có tiềm năng nhưng cần rèn luyện thêm tính chủ động và khả năng chịu áp lực từ chối. Hãy thử tập research và gửi đề xuất hàng tuần nhé.` };
                } else {
                    return { sfx: 'lose', title: "Hợp Sales Hoặc Account Hơn 😅", color: "var(--danger)", text: `Bạn đạt ${points}/10 điểm. Nghề BD đòi hỏi tinh thần tự trị, tự tìm cơ hội và khả năng kiên trì trước hàng trăm lời từ chối. Bạn có thể sẽ tỏa sáng hơn ở các vai trò chăm sóc khách hàng (Account) hoặc Sales vận hành.` };
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
                },
                {
                    context: "Để lễ tân cảm thấy bạn là người quen cũ của sếp, kỹ thuật xưng hô nào tốt nhất?",
                    options: [
                        { text: "Dạ anh cho em gặp anh [Tên Sếp] nhé, em [Tên Bạn] gọi lại theo lịch hẹn.", isCorrect: true, feedback: "Chính xác! Giọng điệu tự tin, xưng hô tên riêng tạo cảm giác thân thuộc như đối tác hiện hữu." },
                        { text: "Dạ cho em hỏi có phải đây là số của công ty mình không ạ?", isCorrect: false, feedback: "Tự lộ diện là telesale lạ gọi dò thông tin." },
                        { text: "Chào em, sếp em có nhà không?", isCorrect: false, feedback: "Cách hỏi thiếu tôn trọng và thiếu tính chuyên nghiệp." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Bất Bại Vượt Ải Lễ Tân! 🚪", color: "var(--primary)", text: "Kỹ năng giao tiếp và lách rào cản của bạn quá xuất sắc! Bạn biến Gatekeeper thành đồng minh một cách tự nhiên." };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Vượt Ải Thành Công! 🗝️", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Cần tự tin và lịch sự hơn nữa để tạo lòng tin nhanh chóng.` };
                } else {
                    return { sfx: 'lose', title: "Bị Chặn Rất Tiếc! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Đừng chào hàng trực tiếp với lễ tân, hãy nói về lý do nghiệp vụ hợp lệ.` };
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
                    context: "Phần mở bài (Opening line) của Cold Email nên viết như thế nào?",
                    options: [
                        { text: "Em xin giới thiệu công ty em thành lập 10 năm, có 200 nhân sự...", isCorrect: false, feedback: "Sai lầm! Khách hàng không quan tâm bạn là ai, họ chỉ quan tâm bạn giúp gì được cho họ." },
                        { text: "Em theo dõi thấy dự án X của anh chị vừa ra mắt và nhận thấy cơ hội tối ưu khâu Y...", isCorrect: true, feedback: "Chính xác! Cho thấy bạn đã nghiên cứu kỹ về họ, tạo thiện cảm cá nhân hóa sâu sắc." },
                        { text: "Lời đầu tiên cho em xin chúc anh chị vạn sự như ý...", isCorrect: false, feedback: "Quá rườm rà xã giao, lãng phí 3 giây vàng ngọc đầu tiên của email B2B." }
                    ]
                },
                {
                    context: "Lời kêu gọi hành động (Call to Action - CTA) nào ở cuối email là thông minh nhất?",
                    options: [
                        { text: "Anh chị mua sản phẩm thì chuyển khoản cho em nhé.", isCorrect: false, feedback: "Quá vội vàng! Không ai mua hàng B2B ngay từ email đầu tiên." },
                        { text: "Em xin phép gửi anh đề xuất sơ bộ dài 50 trang để anh đọc trước.", isCorrect: false, feedback: "Quá nặng nề! Khách hàng bận rộn sẽ từ chối đọc tài liệu quá dài." },
                        { text: "Em có thể xin anh 10 phút thảo luận nhanh qua phone vào 9h sáng thứ Năm này không?", isCorrect: true, feedback: "Tuyệt vời! CTA có rào cản thấp (chỉ 10 phút) và thời gian cụ thể dễ phản hồi." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Master Cold Email! ✉️", color: "var(--primary)", text: "Email của bạn viết cực kỳ cuốn hút, cá nhân hóa tốt và tập trung vào giá trị thực tế. Tỷ lệ mở và phản hồi chắc chắn sẽ rất cao!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Email Khá Ổn! 📝", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Hãy chú ý tối ưu hóa tiêu đề ngắn gọn và CTA cụ thể hơn.` };
                } else {
                    return { sfx: 'lose', title: "Cần Viết Lại! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Tránh viết email dài dòng chào bán dịch vụ ngay lập tức. Hãy tập trung vào nỗi đau của họ.` };
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
                    context: "Lead B2B được phân loại là MQL (Marketing Qualified Lead) chất lượng cao nhất khi nào?",
                    options: [
                        { text: "Chỉ cần để lại email và số điện thoại trên form đăng ký.", isCorrect: false, feedback: "Chưa đủ! Đó mới chỉ là thông tin thô (Raw Lead)." },
                        { text: "Họ khớp chính xác với chân dung khách hàng lý tưởng (ICP) và đã mở email/xem đề xuất nhiều lần...", isCorrect: true, feedback: "Chính xác! Cho thấy cả độ phù hợp cao lẫn hành vi quan tâm tích cực." },
                        { text: "Họ là doanh nghiệp lớn có doanh thu nghìn tỷ nhưng chưa biết bạn là ai.", isCorrect: false, feedback: "Họ mới chỉ là đối tượng mục tiêu trong danh sách mơ ước (Target List), chưa tương tác." }
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
                if (score === 3) {
                    return { sfx: 'win', title: "Chuyên Gia Định Vị Lead! 🎯", color: "var(--primary)", text: "Bạn nắm rất rõ cách định vị đúng người đưa ra quyết định tại doanh nghiệp mục tiêu!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Kỹ Năng Khá! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Hãy sử dụng thêm các công cụ định vị PIC tự động như B2B PIC Finder.` };
                } else {
                    return { sfx: 'lose', title: "Cần Trau Dồi Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Hãy tìm đọc kỹ sách về ICP (Ideal Customer Profile) và phễu B2B.` };
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
                    context: "Nhắn tin tiếp cận đối tác qua Zalo, cấu trúc tin nhắn nào tăng tỷ lệ đồng ý kết bạn nhất?",
                    options: [
                        { text: "Gửi ảnh bảng báo giá sản phẩm ngay kèm lời nhắn: 'Kết bạn với em nhé'.", isCorrect: false, feedback: "Quá thực dụng! Khách hàng sẽ chặn hoặc từ chối kết bạn ngay vì sợ bị spam bán hàng." },
                        { text: "Chào anh [Tên], em là [Tên Bạn] từ [Công Ty]. Em có theo dõi bài chia sẻ của anh về khâu X và muốn kết nối trao đổi thêm...", isCorrect: true, feedback: "Rất tốt! Lý do kết nối rõ ràng, tôn trọng chuyên môn của họ và tạo thiện cảm cá nhân hóa." },
                        { text: "Anh kết bạn zalo với em nhé, em có việc cần bàn.", isCorrect: false, feedback: "Mơ hồ, thiếu lịch sự tạo cảm giác nghi ngờ cho người nhận." }
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
                if (score === 3) {
                    return { sfx: 'win', title: "Chiến Thần Cold-Call! 📞", color: "var(--primary)", text: "Phản xạ giao tiếp tiếp cận của bạn rất khéo léo, tự tin và hướng đến giá trị!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Giao Tiếp Khá Tốt! 🗣️", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Hãy chú ý giữ tông giọng trầm ấm và nhịp điệu vừa phải khi gọi điện.` };
                } else {
                    return { sfx: 'lose', title: "Cần Thực Hành Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Hãy ghi hình thử các kịch bản gọi điện để tự điều chỉnh giọng nói và phản xạ.` };
                }
            }
        },

        // LEVEL 2: Từ 1 - 3 Năm (Chiến Binh)
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
                        { text: "Bên em đắt hơn vì chất lượng cao hơn.", isCorrect: false, feedback: "Nghiệp dư! Bạn đang phòng thủ mà chưa giải quyết bài toán tài chính cốt lõi." },
                        { text: "Bên em có mức giá tối ưu / phù hợp nhất.", isCorrect: true, feedback: "Chuyên gia! Cho thấy bạn đang giải bài toán tài chính chứ không đơn thuần phá giá." }
                    ]
                },
                {
                    context: "Đối diện với một bài toán khó mà khách hàng đưa ra, bạn (vai trò BD) sẽ trả lời:",
                    options: [
                        { text: "Để em ráng về thử cách này xem sao.", isCorrect: false, feedback: "Nghiệp dư! Khách hàng không muốn làm chuột bạch. Câu nói tạo sự thiếu chắc chắn." },
                        { text: "Cái này khó quá, chắc không làm được đâu ạ.", isCorrect: false, feedback: "Nghiệp dư! Bạn đã bỏ cuộc quá sớm, đánh mất vị thế chuyên gia." },
                        { text: "Chắc chắn 100% bên em làm được!", isCorrect: false, feedback: "Nghiệp dư! Hứa hẹn quá lời khi chưa có giải pháp rõ ràng là rủi ro cực lớn." },
                        { text: "Em sẽ tìm kiếm phương án tốt nhất cho anh/chị.", isCorrect: true, feedback: "Chuyên gia! Chuẩn xác, bạn đang khẳng định trách nhiệm tuyệt đối đối với kết quả." }
                    ]
                },
                {
                    context: "Khi khách hàng cần bằng chứng chứng minh bạn có thể làm được:",
                    options: [
                        { text: "Em nghĩ là sản phẩm sẽ giải quyết được...", isCorrect: false, feedback: "Nghiệp dư! Nhấn mạnh 'Em nghĩ là' mang tính cảm tính, thiếu sức nặng." },
                        { text: "Tin em đi, em không lừa anh/chị đâu.", isCorrect: false, feedback: "Nghiệp dư! Đừng ép buộc lòng tin một cách vô căn cứ trong B2B." },
                        { text: "Mọi người đều dùng bên em cả, anh yên tâm.", isCorrect: false, feedback: "Nghiệp dư! Lối nói hoa mỹ không có số liệu không thể thuyết phục C-level." },
                        { text: "Dựa trên dữ liệu và case study triển khai...", isCorrect: true, feedback: "Chuyên gia! Tuyệt vời. Con số và thực tế là 'vua' khi thuyết phục." }
                    ]
                },
                {
                    context: "Khách hàng hỏi về một tính năng mà sản phẩm của bạn CHƯA CÓ:",
                    options: [
                        { text: "Thực ra thì bên em KHÔNG có tính năng đó.", isCorrect: false, feedback: "Nghiệp dư! Bạn vừa dập tắt sự hào hứng của khách bằng điểm mù (sự thiếu hụt)." },
                        { text: "Tính năng đó không quan trọng đâu ạ.", isCorrect: false, feedback: "Nghiệp dư! Đừng hạ thấp nhu cầu của khách hàng, điều đó gây phản cảm." },
                        { text: "Sắp tới bên em sẽ làm tính năng đó (dù chưa có plan).", isCorrect: false, feedback: "Nghiệp dư! Nói dối để giữ khách là con dao hai lưỡi rủi ro cực cao." },
                        { text: "Hiện tại bên em đang TẬP TRUNG mạnh vào...", isCorrect: true, feedback: "Chuyên gia! Thông minh, bạn đã điều hướng sự chú ý thành cơ hội trình bày điểm cốt lõi mạnh mẽ." }
                    ]
                },
                {
                    context: "Cuộc họp sắp kết thúc, bạn muốn chốt bước tiếp theo:",
                    options: [
                        { text: "Dạ vậy anh/chị cứ cân nhắc đi ạ.", isCorrect: false, feedback: "Kẻ sát nhân của mọi deal! Đừng tạo ra khoảng trống làm nguội lạnh mối quan hệ." },
                        { text: "Khi nào quyết định thì gọi em nhé.", isCorrect: false, feedback: "Nghiệp dư! Sự bị động sẽ khiến bạn rớt deal vào tay đối thủ nhanh chóng." },
                        { text: "Anh/chị ký hợp đồng luôn bây giờ nhé?", isCorrect: false, feedback: "Nghiệp dư! Chốt sale vội vàng tạo áp lực ngược, khiến khách hàng phòng thủ." },
                        { text: "Bước tiếp theo chúng ta sẽ tiến hành...", isCorrect: true, feedback: "Chuyên gia! Chính xác. Hãy luôn chủ động dẫn dắt cuộc chơi và đưa ra lộ trình." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 5) {
                    return { sfx: 'win', title: "Xuất Sắc! BD Khó Có Peter Lo 💪", color: "var(--primary)", text: "Tuyệt vời, bạn phản ứng rất bén! Bạn đã hoàn toàn làm chủ ngôn từ của một chuyên gia B2B thực thụ." };
                } else if (score >= 3) {
                    return { sfx: 'correct', title: "Khá Tốt! 🤔", color: "var(--text-main)", text: `Bạn đạt ${score}/5 điểm. Hãy rèn luyện thêm chút nữa để thành phản xạ bất bại nhé!` };
                } else {
                    return { sfx: 'lose', title: "Cần Rèn Luyện Thêm! 😅", color: "var(--danger)", text: `Bạn đạt ${score}/5 điểm. Bí kíp đã có, hãy ghi nhớ và thực hành nhiều hơn. Chúc bạn lần sau "chốt deal" mượt hơn!` };
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
                    context: "Khách hàng nói: 'Anh cần hỏi ý kiến ban giám đốc'. Bạn phản ứng ra sao?",
                    options: [
                        { text: "Dạ vâng, khi nào anh hỏi xong báo em nhé.", isCorrect: false, feedback: "Bị động! Deal dễ bị chìm và trôi đi mất." },
                        { text: "Để hỗ trợ anh báo cáo tốt nhất, em xin phép gửi bản tóm tắt giá trị dự án ngắn gọn cho sếp, hoặc cùng anh tham gia buổi họp nhé?", isCorrect: true, feedback: "Chuyên gia! Hỗ trợ họ làm báo cáo nội bộ và tìm cơ hội tiếp cận người có quyền quyết định thực sự." },
                        { text: "Anh là trưởng phòng mà không quyết được à?", isCorrect: false, feedback: "Cách nói khiêu khích xúc phạm nghiêm trọng lòng tự trọng của đối tác." }
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
                if (score === 3) {
                    return { sfx: 'win', title: "Vua Xử Lý Từ Chối! 🛡️", color: "var(--primary)", text: "Tuyệt vời! Bạn có khả năng bẻ lái tình huống và thuyết phục khách hàng vô cùng sắc bén." };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Kỹ Năng Khá! 🤔", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Cần hiểu rõ hơn về các kỹ thuật cô lập và làm rõ nỗi đau khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Cần Rèn Luyện Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Hãy ghi nhớ: đừng vội giảm giá hay đối đầu, hãy đồng cảm và làm rõ lý do từ chối.` };
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
                        { text: "Bên em bắt buộc phải tạm ứng 50%, không bàn cãi gì nữa.", isCorrect: false, feedback: "Cách nói thiếu thiện chí hợp tác đàm phán." }
                    ]
                },
                {
                    context: "Đâu là thời điểm phù hợp nhất để đưa ra báo giá hoặc khung chi phí chính thức?",
                    options: [
                        { text: "Ngay trong email đầu tiên tiếp cận khách hàng.", isCorrect: false, feedback: "Quá sớm! Bạn chưa hiểu nhu cầu của họ, báo giá sớm dễ bị loại vì đắt hoặc rẻ quá." },
                        { text: "Sau khi đã thực hiện Discovery Call làm rõ nhu cầu và thống nhất được giải pháp kỹ thuật phù hợp...", isCorrect: true, feedback: "Chính xác! Chỉ báo giá khi khách hàng đã hiểu rõ giá trị giải pháp mang lại cho doanh nghiệp họ." },
                        { text: "Đợi khách hàng chủ động hỏi giá mới báo.", isCorrect: false, feedback: "BD cần chủ động dẫn dắt tiến trình thương vụ." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Chuyên Gia Đàm Phán Win-Win! 🤝", color: "var(--primary)", text: "Bạn bảo vệ giá trị hợp đồng rất tốt bằng nguyên tắc trao đổi có điều kiện. Thỏa thuận của bạn luôn bền vững." };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Thỏa Thuận Tốt! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Cần tránh nhượng bộ quá nhanh mà không đòi hỏi lại quyền lợi tương xứng.` };
                } else {
                    return { sfx: 'lose', title: "Chịu Nhiều Thiệt Thòi! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Hãy nhớ: luôn đàm phán có điều kiện (Give and Take) để tránh bị ép giá.` };
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
                        { text: "Lắng nghe đồng cảm hết cơn giận, xin lỗi vì sự gián đoạn và lập tức kết nối đội hỗ trợ xử lý khẩn cấp...", points: 2, feedback: "Chính xác! Hãy xoa dịu cảm xúc của họ trước khi đi vào giải quyết vấn đề kỹ thuật." },
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
                },
                {
                    context: "Deal lớn sắp ký bị hủy phút chót vì đối tác thay đổi nhân sự C-level. Bạn đối diện ra sao?",
                    options: [
                        { text: "Buồn bã, mất động lực làm việc trong suốt cả tuần tiếp theo.", points: 0, feedback: "BD cần có khả năng phục hồi tinh thần nhanh chóng (Resilience)." },
                        { text: "Bình tĩnh tìm hiểu thông tin sếp mới, lên kế hoạch tiếp cận giới thiệu lại giải pháp từ đầu...", points: 2, feedback: "Tuyệt vời! Khó khăn là một phần của trò chơi. Sự kiên trì sẽ mở ra cơ hội mới." },
                        { text: "Bỏ mặc khách hàng đó vĩnh viễn.", points: 0, feedback: "Bỏ lỡ cơ hội hồi sinh deal khi nhân sự mới đi vào vận hành ổn định." }
                    ]
                }
            ],
            getResult: (points) => {
                if (points === 6) {
                    return { sfx: 'win', title: "BD Có EQ Đỉnh Cao! ❤️", color: "var(--primary)", text: `Bạn đạt ${points}/6 điểm. Khả năng thấu cảm, kiên trì và quản trị mối quan hệ nội bộ của bạn là hình mẫu lý tưởng.` };
                } else if (points >= 4) {
                    return { sfx: 'correct', title: "EQ Trung Bình Khá! 📈", color: "var(--text-main)", text: `Bạn đạt ${points}/6 điểm. Cần rèn luyện thêm khả năng giữ bình tĩnh trước phàn nàn và kiên trì theo đuổi deal.` };
                } else {
                    return { sfx: 'lose', title: "Cần Quản Trị Cảm Xúc! 😅", color: "var(--danger)", text: `Bạn đạt ${points}/6 điểm. BD là một cuộc marathon dài hạn. Hãy rèn luyện sự kiên trì và đồng cảm sâu sắc hơn.` };
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
                    context: "Khách hàng liên tục đòi thêm tính năng kỹ thuật mới. Đâu là động cơ thực sự sau những yêu cầu đó?",
                    options: [
                        { text: "Họ đơn thuần chỉ muốn phá bĩnh bạn.", isCorrect: false, feedback: "Nhận định sai lầm. Khách hàng luôn muốn giải quyết vấn đề của họ." },
                        { text: "Họ muốn dùng các tính năng đó làm đòn bẩy thương lượng ép giảm giá.", isCorrect: false, feedback: "Đôi khi đúng nhưng chưa phải bản chất cốt lõi của pain point kỹ thuật." },
                        { text: "Họ đang gặp một rào cản nghiệp vụ thực tế khiến công việc của họ bị chậm hoặc báo cáo bị sai lệch...", isCorrect: true, feedback: "Chính xác! Cần tìm hiểu nghiệp vụ đằng sau yêu cầu kỹ thuật để thiết kế giải pháp thay thế phù hợp." }
                    ]
                },
                {
                    context: "Khi hỏi về ngân sách dự toán (Budget), câu hỏi nào khéo léo và hiệu quả nhất?",
                    options: [
                        { text: "Dự án này anh chị dự kiến đầu tư khoảng bao nhiêu tiền ạ?", isCorrect: false, feedback: "Hỏi trực diện chi phí sớm dễ khiến khách hàng phòng thủ và nói tránh." },
                        { text: "Dựa trên quy mô vận hành hiện tại, bên em ước lượng khoản đầu tư khoảng X-Y. Con số này có nằm trong tầm ngân sách phê duyệt của anh không?", isCorrect: true, feedback: "Chuyên gia! Đưa ra khoảng ước lượng trước để neo khung giá và giúp đối tác dễ dàng phản hồi." },
                        { text: "Bên anh có đủ tiền mua gói này không?", isCorrect: false, feedback: "Hỏi cực kỳ thô lỗ, hủy hoại quan hệ đối tác lập tức." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Vua Đọc Vị Pain Point! 🎯", color: "var(--primary)", text: "Kịch bản đào sâu của bạn rất thông minh, hướng thẳng vào tối ưu vận hành và tài chính của đối tác!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Kỹ Năng Đào Sâu Khá! 📊", color: "var(--text-main)", text: `Bạn đúng 	hì đúng ${score}/3 câu. Hãy đặt thêm các câu hỏi định lượng số liệu thất thoát của khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Cần Học Hỏi Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Hãy luyện tập mô hình SPIN Selling (Situation, Problem, Implication, Need-payoff).` };
                }
            }
        },

        // LEVEL 3: Trên 3 Năm (Chuyên Gia)
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
                        { text: "Dùng file Excel, Google Sheet, có cột ghi chú nhưng chưa đồng bộ.", points: 1, feedback: "Đã có ý thức quản lý, nhưng chưa tự động hóa và thiếu nhắc nhở." },
                        { text: "Sử dụng CRM hoặc bảng pipeline rõ ràng, cập nhật đều đặn.", points: 2, feedback: "Tuyệt vời! Bạn đang kiểm soát chặt chẽ từng điểm tiếp xúc của deal." }
                    ]
                },
                {
                    context: "Bạn có thường xuyên nhìn vào số liệu để biết mình đang làm tốt hay chưa?",
                    options: [
                        { text: "Thỉnh thoảng xem doanh số cuối tháng là chính.", points: 0, feedback: "Chỉ nhìn phần nổi của tảng băng chìm sẽ khó phát hiện điểm nghẽn." },
                        { text: "Có theo dõi số cuộc gọi, email, cuộc hẹn nhưng chưa tính tỷ lệ chuyển đổi.", points: 1, feedback: "Tốt, bạn đã có dữ liệu thô nhưng cần phân tích sâu hơn để tối ưu." },
                        { text: "Theo dõi tỷ lệ chuyển đổi qua từng giai đoạn để biết điểm yếu.", points: 2, feedback: "Tư duy hệ thống hoàn hảo! Số liệu không biết nói dối." }
                    ]
                },
                {
                    context: "Cách bạn chuẩn bị tài liệu pitching (Pitch Deck) cho mỗi đối tác?",
                    options: [
                        { text: "Dùng chung 1 slide giới thiệu chung cho mọi khách hàng.", points: 0, feedback: "Không cá nhân hóa sẽ không chạm được đúng nỗi đau của họ." },
                        { text: "Sửa lại một vài trang theo thông tin đối tác trước buổi gặp.", points: 1, feedback: "Đã có cải thiện, nhưng cần nghiên cứu kỹ hơn vấn đề riêng biệt của họ." },
                        { text: "Nghiên cứu sâu, thiết kế giải pháp cá nhân hóa dựa trên pain point cụ thể.", points: 2, feedback: "Làm chủ cuộc chơi! Pitching giải pháp chứ không bán tính năng." }
                    ]
                },
                {
                    context: "Khi khách hàng im lặng sau cuộc gặp đầu tiên, bạn sẽ:",
                    options: [
                        { text: "Đợi khi nào họ chủ động liên hệ lại.", points: 0, feedback: "Deal sẽ nhanh chóng chìm vào quên lãng." },
                        { text: "Gửi email nhắc nhở chung chung: 'Bên anh đã cân nhắc xong chưa?'", points: 1, feedback: "Thiếu giá trị cộng thêm, dễ gây phiền hà cho đối tác." },
                        { text: "Gửi tài liệu nghiên cứu hoặc bài toán tối ưu liên quan để follow-up có giá trị.", points: 2, feedback: "Đỉnh cao follow-up! Luôn cung cấp giá trị để thúc đẩy hành động." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score >= 8) {
                    return { sfx: 'win', title: "BD Hệ Thống Đỉnh Cao! 🚀", color: "var(--primary)", text: `Bạn đạt ${score}/10 điểm. Quy trình làm việc của bạn rất bài bản, chuyên nghiệp và có tính tự động hóa cao. Bạn đang tối ưu hóa thời gian rất tốt!` };
                } else if (score >= 5) {
                    return { sfx: 'correct', title: "BD Kết Hợp (Bán Hệ Thống) 📊", color: "var(--text-main)", text: `Bạn đạt ${score}/10 điểm. Bạn đã có ý thức quy trình nhưng vẫn còn phụ thuộc nhiều vào nỗ lực thủ công. Hãy áp dụng thêm công cụ và tự động hóa để đột phá doanh số.` };
                } else {
                    return { sfx: 'lose', title: "BD Thủ Công (Cơ Bắp) 😅", color: "var(--danger)", text: `Bạn đạt ${score}/10 điểm. Bạn đang làm việc rất chăm chỉ nhưng thiếu quy trình và công cụ hỗ trợ. Hãy bắt đầu xây dựng phễu khách hàng và sử dụng CRM ngay.` };
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
                },
                {
                    context: "Khách hàng ngắt lời giữa buổi thuyết trình và hỏi dồn dập vào khâu rủi ro triển khai. Bạn ứng xử ra sao?",
                    options: [
                        { text: "Dạ xin anh để em thuyết trình xong slide rồi em trả lời sau.", isCorrect: false, feedback: "Từ chối trả lời ngay làm mất sự hứng thú và tạo cảm giác bạn đang trốn tránh rủi ro." },
                        { text: "Đồng cảm, dừng slide và trả lời thẳng thắn vào phương án quản trị rủi ro đã chuẩn bị sẵn, sau đó liên kết lại bài giải pháp...", isCorrect: true, feedback: "Chuyên gia xuất sắc! Luôn sẵn sàng đối thoại trực diện rủi ro để khẳng định tính thực chiến của giải pháp." },
                        { text: "Khẳng định sản phẩm hoàn hảo 100% không có bất kỳ rủi ro nào.", isCorrect: false, feedback: "Hứa hẹn thiếu thực tế tạo cảm giác không đáng tin cậy." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Siêu Sao Thuyết Trình B2B! 📊", color: "var(--primary)", text: "Slide của bạn trực quan, cấu trúc chặt chẽ và bài thuyết trình thu hút C-level từ giây đầu tiên!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Buổi Pitching Khá! 🗣️", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Nên phân bổ nhiều thời gian hơn cho việc hỏi đáp và lắng nghe khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Bài Pitching Tẻ Nhạt! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Đừng biến slide thành file Word đọc tài liệu. Hãy tập trung vào Pain Point.` };
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
                },
                {
                    context: "Tỷ lệ đóng góp doanh thu lý tưởng nhất của khách hàng cũ (Retention Revenue) đối với một doanh nghiệp B2B bền vững là:",
                    options: [
                        { text: "Khoảng 20% doanh thu toàn công ty.", isCorrect: false, feedback: "Vẫn quá thấp, phản ánh dịch vụ sau bán hàng kém khiến khách rời đi liên tục." },
                        { text: "Chiếm từ 60% đến 80% doanh thu hàng năm nhờ cơ chế gia hạn và upsell (Farm & Expand)...", isCorrect: true, feedback: "Chính xác! Khách hàng cũ là mỏ vàng bền vững của mọi mô hình B2B thành công." },
                        { text: "100%, không cần tìm bất kỳ khách hàng mới nào.", isCorrect: false, feedback: "Rủi ro tập trung quá cao! Nếu một vài khách hàng lớn rời đi, công ty sẽ sụp đổ lập tức." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Vua Upsell & Chăm Sóc Khách Hàng! 📈", color: "var(--primary)", text: "Khách hàng cũ sẽ liên tục tái ký và mua thêm giải pháp nhờ quy trình chăm sóc chuyên nghiệp của bạn!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Tỷ Lệ Giữ Chân Tốt! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Hãy tận dụng thời điểm khách hàng đạt được giá trị thực tế để đề xuất upsell.` };
                } else {
                    return { sfx: 'lose', title: "Khách Hàng Rời Đi Nhiều! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Đừng bỏ rơi khách sau khi ký hợp đồng. Customer Success là chìa khóa của sự bền vững.` };
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
                },
                {
                    context: "Chỉ số hàng đầu (Leading Indicator) quan trọng nhất để đánh giá sức khỏe của một mối quan hệ Đối Tác Chiến Lược là gì?",
                    options: [
                        { text: "Số lượng biên bản ghi nhớ hợp tác (MOU) đã ký.", isCorrect: false, feedback: "MOU chỉ là thủ tục ban đầu, không phản ánh năng lực vận hành thực tế." },
                        { text: "Số lượng cơ hội chất lượng được giới thiệu qua lại (Referral Pipeline) và tần suất họp đồng tiếp thị (Co-selling)...", isCorrect: true, feedback: "Chính xác! Pipeline chuyển giao thực tế phản ánh mức độ cam kết và hiệu quả hợp tác." },
                        { text: "Số lượng ảnh chụp lễ ký kết đăng báo.", isCorrect: false, feedback: "Đó chỉ là hoạt động PR bề nổi, không mang lại giá trị kinh tế trực tiếp." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Vua Đối Tác Chiến Lược! 🤝", color: "var(--primary)", text: "Tư duy thiết lập liên minh và kích hoạt kênh phân phối của bạn rất đẳng cấp và bài bản!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Kỹ Năng Hợp Tác Khá! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Hãy chú ý hơn đến quy trình Sales Enablement cho đại lý.` };
                } else {
                    return { sfx: 'lose', title: "Cần Trau Dồi Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Hãy nghiên cứu kỹ mô hình Channel Sales và Strategic Alliance.` };
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
                },
                {
                    context: "Phễu ngược báo cáo khâu 'Họp Demo xong khách im lặng' chiếm 80% tỷ lệ rơi rớt. Bạn sửa lỗi hệ thống này thế nào?",
                    options: [
                        { text: "Tăng cường chạy quảng cáo tìm thêm lead mới.", isCorrect: false, feedback: "Lãng phí ngân sách! Phễu đang bị rò rỉ ở giữa, đổ thêm nước vào chỉ làm lãng phí." },
                        { text: "Chuẩn hóa tiêu chí thẩm định chất lượng lead trước demo (Qualification) và ràng buộc 'Bước tiếp theo' (Next Step) ở cuối buổi demo...", isCorrect: true, feedback: "Chuyên gia xuất sắc! Sửa lỗi ngay tại khâu lọc lead và khâu chốt cuộc họp để giữ chân cơ hội." },
                        { text: "Yêu cầu đội sale gọi điện giục khách hàng ký hợp đồng mỗi ngày.", isCorrect: false, feedback: "Làm khách hàng phiền lòng và đẩy deal vào bế tắc." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 3) {
                    return { sfx: 'win', title: "Master Phễu Ngược & KPIs! 📊", color: "var(--primary)", text: "Tư duy quản trị dữ liệu và thiết kế hệ thống vận hành BD của bạn rất chuyên nghiệp và thực chiến!" };
                } else if (score >= 2) {
                    return { sfx: 'correct', title: "Thiết Kế Khá Tốt! 📈", color: "var(--text-main)", text: `Bạn đúng ${score}/3 câu. Hãy chú ý kiểm soát chặt chẽ tỷ lệ chuyển đổi giữa các bước trên CRM.` };
                } else {
                    return { sfx: 'lose', title: "Cần Rèn Luyện Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/3 câu. Hãy thiết lập lại hệ thống B2B Sales Operation.` };
                }
            }
        }
    ];

    let activeGameIndex = 0;
    let currentQIndex = 0;
    let score = 0;
    let timerInterval = null;
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

    // Dynamic Render Minigames based on selected Level
    function renderGamesForLevel(level) {
        const track = document.getElementById('game-slider-track');
        if (!track) return;
        
        const levelGames = games.filter(g => g.level === parseInt(level, 10));
        
        track.innerHTML = levelGames.map(game => {
            const globalIndex = games.findIndex(g => g.id === game.id);
            const icon = game.icon || "🧠";
            return `
                <div class="game-card glass-panel" style="padding: 20px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; border: 1px solid var(--border-color); border-radius: 12px; background: rgba(255, 255, 255, 0.6);" data-game-index="${globalIndex}">
                    <div style="font-size: 1.8rem; margin-bottom: 5px;">${icon}</div>
                    <h4 style="font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text-main);">${game.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-light); flex: 1; margin: 5px 0 0 0;">${game.description}</p>
                    <button class="btn btn-primary" style="padding: 8px 12px; font-size: 0.85rem; margin-top: 15px; width: 100%;">Chơi Ngay</button>
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

    // Initialize with Level 1 games
    renderGamesForLevel(1);

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
        console.log('gameIntro before:', gameIntro ? gameIntro.className : 'null');
        console.log('gamePlay before:', gamePlay ? gamePlay.className : 'null');
        currentQIndex = 0;
        score = 0;
        gameIntro.classList.add('hidden');
        gameResult.classList.add('hidden');
        gamePlay.classList.remove('hidden');
        console.log('gameIntro after:', gameIntro ? gameIntro.className : 'null');
        console.log('gamePlay after:', gamePlay ? gamePlay.className : 'null');
        try {
            loadQuestion();
        } catch (e) {
            console.error('CRASH IN loadQuestion():', e.message, e.stack);
        }
    }

    function loadQuestion() {
        console.log('loadQuestion() called, currentQIndex =', currentQIndex);
        nextBtn.classList.add('hidden');
        feedbackMsg.classList.add('hidden');
        optionsContainer.innerHTML = '';
        clearInterval(timerInterval);
        
        const activeGame = games[activeGameIndex];
        console.log('activeGame =', activeGame ? activeGame.id : 'none');
        const q = activeGame.questions[currentQIndex];
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

    function timeOutAction(allOptionsData) {
        sfx.wrong();
        const allBtns = optionsContainer.querySelectorAll('.btn-option');
        allBtns.forEach(b => b.disabled = true);
        
        feedbackMsg.classList.remove('hidden');
        feedbackMsg.textContent = "HẾT GIỜ! Bạn đã chậm chân. Một chuyên gia cần phản ứng nhanh hơn.";
        feedbackMsg.className = 'feedback-msg error';
        
        const activeGame = games[activeGameIndex];
        if (activeGame.type === 'scenario_challenge') {
            const correctOpt = allOptionsData.find(o => o.isCorrect);
            allBtns.forEach(b => {
                if (correctOpt && b.textContent === correctOpt.text) {
                    b.classList.add('correct');
                }
            });
        } else {
            allBtns.forEach(b => b.classList.add('wrong'));
        }
        
        progressBar.style.width = `${((currentQIndex + 1) / activeGame.questions.length) * 100}%`;
        nextBtn.classList.remove('hidden');
    }

    function selectAnswer(selectedOpt, selectedBtn, allOptionsData) {
        clearInterval(timerInterval);
        const allBtns = optionsContainer.querySelectorAll('.btn-option');
        allBtns.forEach(b => b.disabled = true);

        const activeGame = games[activeGameIndex];
        feedbackMsg.classList.remove('hidden');
        feedbackMsg.textContent = selectedOpt.feedback || '';

        if (activeGame.type === 'scenario_challenge') {
            if (selectedOpt.isCorrect) {
                sfx.correct();
                selectedBtn.classList.add('correct');
                feedbackMsg.className = 'feedback-msg success';
                score++;
            } else {
                sfx.wrong();
                selectedBtn.classList.add('wrong');
                feedbackMsg.className = 'feedback-msg error';
                
                const correctOpt = allOptionsData.find(o => o.isCorrect);
                allBtns.forEach(b => {
                    if (correctOpt && b.textContent === correctOpt.text) {
                        b.classList.add('correct');
                    }
                });
            }
        } else {
            sfx.correct();
            selectedBtn.classList.add('correct');
            feedbackMsg.className = 'feedback-msg success';
            score += (selectedOpt.points || 0);
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
        gamePlay.classList.add('hidden');
        gameResult.classList.remove('hidden');
        if(timerDisplay) timerDisplay.classList.add('hidden');
        
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        
        const activeGame = games[activeGameIndex];
        const result = activeGame.getResult(score);
        
        if (result.sfx === 'win') sfx.win();
        else if (result.sfx === 'correct') sfx.correct();
        else sfx.lose();
        
        resultTitle.textContent = result.title;
        resultTitle.style.color = result.color;
        resultText.textContent = result.text;

        // Leaderboard Submission Logic
        const assignedNick = funnyNicknames[Math.floor(Math.random() * funnyNicknames.length)] + " " + Math.floor(Math.random() * 90 + 10);
        const assignedNickEl = document.getElementById('assigned-nickname');
        const submitBox = document.getElementById('leaderboard-submit-box');
        
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
                
                // Get title based on score
                let title = "Tân Binh BD";
                if (score === 5) title = "Chuyên Gia Chốt Deal";
                else if (score === 4) title = "Chiến Binh Pipeline";
                else if (score === 3) title = "Thực Tập Sinh Cold Call";

                const newEntry = {
                    name: finalName,
                    email: email,
                    title: title,
                    score: score
                };

                const board = getLeaderboard();
                board.push(newEntry);
                
                // Sort by score desc
                board.sort((a, b) => b.score - a.score);
                
                // Cap at 10 items
                const capped = board.slice(0, 10);
                localStorage.setItem('bd_leaderboard', JSON.stringify(capped));
                
                // Log email if provided
                if (email) {
                    fetch('/api/log-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email, source: 'leaderboard-submit' })
                    }).catch(console.error);
                }

                renderLeaderboard();
                
                // Hide submit box and show thank you
                submitBox.innerHTML = `<div style="text-align: center; font-weight: bold; color: var(--primary); padding: 10px;">🎉 Đăng Bảng Vàng thành công! Chúc mừng Chiến thần B2B!</div>`;
                setTimeout(() => {
                    submitBox.style.display = 'none';
                }, 3000);
            });
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
 
