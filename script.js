document.addEventListener('DOMContentLoaded', () => {
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
            // Remove 'flipped' from other cards if we want accordion style behavior
            // cards.forEach(c => {
            //     if (c !== card) c.classList.remove('flipped');
            // });
            card.classList.toggle('flipped');
        });
    });

    // Minigame Logic
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playTone(freq, type, duration, vol) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
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
    }
    const sfx = {
        correct: () => { playTone(600, 'sine', 0.1, 0.1); setTimeout(() => playTone(800, 'sine', 0.2, 0.1), 100); },
        wrong: () => { playTone(300, 'sawtooth', 0.15, 0.1); setTimeout(() => playTone(200, 'sawtooth', 0.25, 0.1), 150); },
        win: () => { playTone(400, 'square', 0.1, 0.1); setTimeout(() => playTone(500, 'square', 0.1, 0.1), 100); setTimeout(() => playTone(600, 'square', 0.1, 0.1), 200); setTimeout(() => playTone(800, 'square', 0.4, 0.1), 300); },
        lose: () => { playTone(300, 'square', 0.2, 0.1); setTimeout(() => playTone(250, 'square', 0.2, 0.1), 200); setTimeout(() => playTone(200, 'square', 0.4, 0.1), 400); },
        tick: () => { playTone(1000, 'sine', 0.05, 0.05); }
    };

    const games = [
        {
            id: "game-expert",
            title: "Thử Thách B2B: Bạn là Tân Binh hay Chuyên Gia?",
            description: "Cùng đánh giá năng lực qua 5 tình huống thực tế nhé!",
            type: "scenario_challenge",
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
            id: "game-system",
            title: "Quiz: Bạn đang làm BD kiểu 'thủ công' hay kiểu 'hệ thống'?",
            description: "Bạn có đang làm việc chăm chỉ nhưng kết quả vẫn lẹt đẹt? Hay bạn đã có một quy trình bài bản giúp deal tự đến? Hãy dành 2 phút trả lời 8 câu hỏi.",
            type: "personality_scoring",
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
                    context: "Khi khách hàng nói \"để tôi suy nghĩ thêm\", phản ứng đầu tiên của bạn là:",
                    options: [
                        { text: "Cảm thấy hơi chạnh lòng nhưng vẫn chờ đợi, không làm gì thêm.", points: 0, feedback: "Thụ động chờ đợi đồng nghĩa với việc giao phó deal cho may rủi." },
                        { text: "Hỏi lại nhẹ nhàng \"anh/chị còn băn khoăn điều gì không?\" tùy hứng.", points: 1, feedback: "Có phản xạ tốt, nhưng cần chuyên nghiệp và bài bản hơn." },
                        { text: "Có sẵn một vài câu hỏi để khai thác lý do thực sự và lên kế hoạch follow-up.", points: 2, feedback: "Chuyên gia! Chủ động thăm dò để gỡ rối nút thắt tâm lý cho đối tác." }
                    ]
                },
                {
                    context: "Trước khi gửi proposal, bạn kiểm tra những gì?",
                    options: [
                        { text: "Xem lại bảng giá, tên khách hàng cho đúng, định dạng file.", points: 0, feedback: "Đây chỉ là mức kiểm tra kỹ thuật tối thiểu." },
                        { text: "Soát lỗi chính tả, đảm bảo slide nhìn đẹp, có logo công ty.", points: 1, feedback: "Tốt, mặt hình ảnh chuyên nghiệp giúp tăng độ tin cậy ban đầu." },
                        { text: "Có checklist riêng: đúng người quyết định, ROI cụ thể, điểm mạnh so với đối thủ.", points: 2, feedback: "Xuất sắc! Proposal của bạn giải quyết trực tiếp lợi ích kinh tế." }
                    ]
                },
                {
                    context: "Sau khi gửi proposal, nếu không nhận được phản hồi trong 1 tuần, bạn sẽ:",
                    options: [
                        { text: "Tự nhủ \"chắc họ không có nhu cầu” hoặc chờ thêm, không muốn làm phiền.", points: 0, feedback: "80% deal được chốt sau lần follow-up thứ 5. Đừng bỏ cuộc quá sớm!" },
                        { text: "Gửi lại email hỏi thăm \"anh/chị đã xem chưa?\" một lần, nếu vẫn im thì thôi.", points: 1, feedback: "Cách hỏi thăm này hơi nhàm chán và chưa tạo thêm giá trị mới." },
                        { text: "Có kế hoạch follow-up 2-3 lần với nội dung bổ sung giá trị mới mỗi lần.", points: 2, feedback: "Chuyên gia! Cung cấp thông tin giá trị mới giúp hâm nóng deal tự nhiên." }
                    ]
                },
                {
                    context: "Việc học thêm kỹ năng hoặc cập nhật kiến thức BD của bạn diễn ra thế nào?",
                    options: [
                        { text: "Học khi bị sếp yêu cầu hoặc khi gặp vấn đề lớn.", points: 0, feedback: "Học tập thụ động sẽ khiến bạn đi lùi trong thị trường B2B đầy biến động." },
                        { text: "Thỉnh thoảng đọc bài viết, xem video nhưng không áp dụng thường xuyên.", points: 1, feedback: "Kiến thức không áp dụng là kiến thức chết. Hãy cố gắng thực hành." },
                        { text: "Có thói quen học một điều mới mỗi tuần và thử nghiệm ngay vào công việc.", points: 2, feedback: "Tuyệt vời! Tự học chủ động là chìa khóa thăng tiến của BD xuất sắc." }
                    ]
                },
                {
                    context: "Bạn có xây dựng hình ảnh cá nhân trên mạng xã hội (LinkedIn, Facebook,...) không?",
                    options: [
                        { text: "Có tài khoản nhưng ít khi đăng bài, chỉ kết nối để apply job.", points: 0, feedback: "Bạn đang bỏ phí kênh Social Selling - nơi khách hàng tự tìm tới bạn." },
                        { text: "Thỉnh thoảng chia sẻ bài viết của công ty hoặc vài suy nghĩ ngẫu hứng.", points: 1, feedback: "Đã có hiện diện thương hiệu, cần thêm sự đều đặn và chuyên môn sâu." },
                        { text: "Chủ động viết bài, chia sẻ góc nhìn chuyên môn, thu hút khách hàng tiềm năng.", points: 2, feedback: "Đỉnh cao Social Selling! Thương hiệu cá nhân mạnh kéo theo deal tự động đổ về." }
                    ]
                }
            ],
            getResult: (points) => {
                if (points >= 12) {
                    return { sfx: 'win', title: "BD 'Hệ Thống' (12 - 16 điểm) 🚀", color: "var(--primary)", text: "Bạn đang làm việc cực kỳ bài bản, có quy trình và sử dụng dữ liệu để chốt deal. Tiếp tục duy trì và nâng cấp các công cụ tự động hóa nhé!" };
                } else if (points >= 7) {
                    return { sfx: 'correct', title: "BD 'Kết Hợp' (7 - 11 điểm) 🤔", color: "var(--text-main)", text: "Bạn đã có tư duy tốt nhưng quy trình làm việc còn thủ công ở một vài khâu. Hãy tập trung hệ thống hóa và tự động hóa thêm." };
                } else {
                    return { sfx: 'lose', title: "BD 'Thủ Công' (0 - 6 điểm) 😅", color: "var(--danger)", text: "Bạn đang làm việc dựa nhiều vào cảm tính, may mắn hoặc nỗ lực cơ bắp. Hãy bắt đầu xây dựng các checklist và quy trình rõ ràng hơn để tránh kiệt sức." };
                }
            }
        },
        {
            id: "game-suitability",
            title: "Nhảy qua làm BD có dễ ko ta?",
            description: "Nghe BD thì oai, nhưng không phải ai cũng “hợp”. Làm bài quiz 5 câu này, trả lời thật lòng, 1 phút xong.",
            type: "suitability_scoring",
            questions: [
                {
                    context: "Bạn có chịu được áp lực KPI không?",
                    options: [
                        { text: "Thoải mái, có KPI mới có động lực", points: 2, feedback: "Tố chất tuyệt vời! Áp lực là động lực phát triển." },
                        { text: "Chấp nhận được, nhưng phải có lộ trình rõ ràng", points: 1, feedback: "Hợp lý, cần sự rõ ràng trong đo lường kết quả." },
                        { text: "Hơi căng thẳng, thích làm việc không áp lực chỉ tiêu", points: 0, feedback: "BD là nghề chịu KPI doanh số trực tiếp. Bạn nên cân nhắc." }
                    ]
                },
                {
                    context: "Bạn có thích nghiên cứu về ngành mới không?",
                    options: [
                        { text: "Rất thích – research là sở thích", points: 2, feedback: "Tuyệt vời! BD cần đọc hiểu sâu về mô hình kinh doanh của đối tác." },
                        { text: "Cũng được, nhưng hơi ngại khi phải đọc nhiều", points: 1, feedback: "Tập thói quen đọc báo cáo phân tích ngành mỗi tuần nhé." },
                        { text: "Không thích, thích làm việc với những gì đã có sẵn", points: 0, feedback: "BD liên tục mở rộng thị trường mới nên đòi hỏi tinh thần tự nghiên cứu rất cao." }
                    ]
                },
                {
                    context: "Bạn có thường xuyên tự tìm cơ hội mới mà không cần ai giao không?",
                    options: [
                        { text: "Có, thích chủ động và tự tìm hướng đi mới", points: 2, feedback: "Tinh thần khởi nghiệp (intrapreneurship) - tố chất số 1 của BD thành công." },
                        { text: "Thỉnh thoảng, nhưng cần có sự gợi ý, như sếp bắt làm", points: 1, feedback: "Cần cải thiện tính chủ động để tự tìm ra các phân khúc đối tác mới." },
                        { text: "Không, em thích làm theo kế hoạch có sẵn", points: 0, feedback: "Làm BD cần tự vẽ đường đi, nếu thích làm việc rập khuôn bạn sẽ thấy rất khó thích nghi." }
                    ]
                },
                {
                    context: "Khi gặp một vấn đề khó giải quyết (ví dụ: khách hàng im lặng, đối tác không hợp tác), bạn thường làm gì?",
                    options: [
                        { text: "Tìm nhiều cách tiếp cận khác, không bỏ cuộc sớm", points: 2, feedback: "Kiên trì vượt qua lời từ chối là kỹ năng sống còn của BD." },
                        { text: "Thử thêm 1-2 lần, nếu vẫn không được thì bỏ qua", points: 1, feedback: "Nên kiên trì và thử nghiệm các góc tiếp cận khác (email, linkedin, điện thoại)." },
                        { text: "Nhanh chóng buông xuôi và chuyển việc khác", points: 0, feedback: "Tỷ lệ bị từ chối trong BD B2B rất cao. Bạn cần rèn luyện tinh thần thép." }
                    ]
                },
                {
                    context: "Bạn cảm thấy thế nào khi phải làm việc trong môi trường liên tục thay đổi (sản phẩm mới, thị trường mới, quy trình mới)?",
                    options: [
                        { text: "Rất thích – sự thay đổi mang lại cơ hội và thử thách mới.", points: 2, feedback: "Khả năng thích ứng (Adaptability) cao giúp bạn luôn dẫn đầu." },
                        { text: "Chấp nhận được, nhưng cần có thời gian thích nghi.", points: 1, feedback: "Thích nghi nhanh sẽ giúp bạn bắt kịp tốc độ thay đổi nhanh của sản phẩm." },
                        { text: "Không thích – em muốn mọi thứ ổn định và có thể dự đoán trước.", points: 0, feedback: "Thị trường B2B thay đổi hàng ngày. BD đòi hỏi sự linh hoạt rất lớn." }
                    ]
                }
            ],
            getResult: (points) => {
                if (points >= 8) {
                    return { sfx: 'win', title: "Nên theo BD (8 - 10 điểm) 🔥", color: "var(--primary)", text: "Chúc mừng! Bạn có đầy đủ tố chất cần thiết để thành công trong nghề BD: chịu được áp lực, chủ động, kiên trì và ham học hỏi. Hãy bắt đầu chiến đấu ngay thôi!" };
                } else if (points >= 5) {
                    return { sfx: 'correct', title: "Cần Trau Dồi Thêm (5 - 7 điểm) 📊", color: "var(--text-main)", text: "Bạn có tiềm năng nhưng cần rèn luyện thêm tính chủ động và khả năng chịu áp lực từ chối. Hãy thử tập research và gửi đề xuất hàng tuần nhé." };
                } else {
                    return { sfx: 'lose', title: "Hợp Sales Hoặc Account Hơn (0 - 4 điểm) 😅", color: "var(--danger)", text: "Nghề BD đòi hỏi tinh thần tự trị, tự tìm cơ hội và khả năng kiên trì trước hàng trăm lời từ chối. Bạn có thể sẽ tỏa sáng hơn ở các vai trò chăm sóc khách hàng (Account) hoặc Sales vận hành." };
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

    // Attach selection event to selector cards
    const gameCards = document.querySelectorAll('#game-selector .game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.getAttribute('data-game-index'), 10);
            selectGame(idx);
        });
    });

    function selectGame(index) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        activeGameIndex = index;
        const activeGame = games[activeGameIndex];
        
        introGameTitle.textContent = activeGame.title;
        introGameDesc.textContent = activeGame.description;
        
        gameSelector.classList.add('hidden');
        gameIntro.classList.remove('hidden');
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
            if(audioCtx.state === 'suspended') audioCtx.resume();
            startGame();
        });
        nextBtn.addEventListener('click', loadNextQuestion);
        restartBtn.addEventListener('click', () => {
             if(audioCtx.state === 'suspended') audioCtx.resume();
             startGame();
        });
    }

    function startGame() {
        currentQIndex = 0;
        score = 0;
        gameIntro.classList.add('hidden');
        gameResult.classList.add('hidden');
        gamePlay.classList.remove('hidden');
        loadQuestion();
    }

    function loadQuestion() {
        nextBtn.classList.add('hidden');
        feedbackMsg.classList.add('hidden');
        optionsContainer.innerHTML = '';
        clearInterval(timerInterval);
        
        const activeGame = games[activeGameIndex];
        const q = activeGame.questions[currentQIndex];
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

        // Shuffle options only for scenario challenge
        let displayOptions = [...q.options];
        if (activeGame.type === 'scenario_challenge') {
            displayOptions.sort(() => Math.random() - 0.5);
        }

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
    }
});
