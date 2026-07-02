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
                },
                {
                    context: "Quy trình chăm sóc và upsell khách hàng cũ của bạn như thế nào?",
                    options: [
                        { text: "Ký xong là bàn giao hết cho CS, không còn tương tác gì thêm.", points: 0, feedback: "Lãng phí nguồn tài nguyên mở rộng deal vô cùng lớn." },
                        { text: "Thỉnh thoảng hỏi thăm xã giao vào các dịp lễ tết.", points: 1, feedback: "Mối quan hệ tốt, nhưng chưa khai thác được nhu cầu kinh doanh mới." },
                        { text: "Check-in định kỳ 3 tháng, đo lường sự hài lòng và đề xuất giải pháp mở rộng.", points: 2, feedback: "Tuyệt vời! Upsell/Cross-sell từ khách cũ là kênh doanh thu siêu bền vững." }
                    ]
                },
                {
                    context: "Bạn quản lý quỹ thời gian làm việc hàng ngày ra sao?",
                    options: [
                        { text: "Đến đâu hay đến đó, ưu tiên giải quyết các việc phát sinh trước.", points: 0, feedback: "Làm việc thụ động dễ bị cuốn trôi và không đạt chỉ tiêu quan trọng." },
                        { text: "Lập danh sách việc cần làm (to-do list) nhưng đôi khi vẫn bị trễ hạn.", points: 1, feedback: "Tốt, cần áp dụng thêm quy tắc ma trận Eisenhower để lọc việc quan trọng." },
                        { text: "Lên lịch block time cho các nhiệm vụ cốt lõi (research, outreach, follow-up).", points: 2, feedback: "Kỷ luật thép! Quản trị thời gian khoa học là chìa khóa của năng suất." }
                    ]
                },
                {
                    context: "Việc thu thập phản hồi (feedback) sau mỗi deal thất bại?",
                    options: [
                        { text: "Bỏ qua ngay để tập trung vào lead mới.", points: 0, feedback: "Bỏ lỡ bài học đắt giá giúp tối ưu hóa sản phẩm và dịch vụ." },
                        { text: "Hỏi han qua loa rồi ghi chú sơ sài lý do 'giá đắt' hoặc 'chưa phù hợp'.", points: 1, feedback: "Chưa đào sâu được nguyên nhân gốc rễ thực sự." },
                        { text: "Phân tích kỹ lưỡng, tổ chức họp rút kinh nghiệm (Post-mortem) cùng team.", points: 2, feedback: "Học hỏi liên tục! Thất bại là mẹ của những deal thành công tiếp theo." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score >= 12) {
                    return { sfx: 'win', title: "BD Hệ Thống Đỉnh Cao! 🚀", color: "var(--primary)", text: `Bạn đạt ${score}/16 điểm. Quy trình làm việc của bạn rất bài bản, chuyên nghiệp và có tính tự động hóa cao. Bạn đang tối ưu hóa thời gian rất tốt!` };
                } else if (score >= 6) {
                    return { sfx: 'correct', title: "BD Kết Hợp (Bán Hệ Thống) 📊", color: "var(--text-main)", text: `Bạn đạt ${score}/16 điểm. Bạn đã có ý thức quy trình nhưng vẫn còn phụ thuộc nhiều vào nỗ lực thủ công. Hãy áp dụng thêm công cụ và tự động hóa để đột phá doanh số.` };
                } else {
                    return { sfx: 'lose', title: "BD Thủ Công (Cơ Bắp) 😅", color: "var(--danger)", text: `Bạn đạt ${score}/16 điểm. Bạn đang làm việc rất chăm chỉ nhưng thiếu quy trình và công cụ hỗ trợ. Hãy bắt đầu xây dựng phễu khách hàng và sử dụng CRM ngay.` };
                }
            }
        },
        {
            id: "game-suitability",
            title: "Nhảy qua làm BD có dễ ko ta?",
            description: "Đánh giá mức độ phù hợp về tố chất bản thân đối với nghề Business Development qua 5 câu hỏi khảo sát nhanh.",
            type: "suitability_scoring",
            questions: [
                {
                    context: "Bạn cảm thấy thế nào khi nhận được lời từ chối thẳng thừng từ đối tác?",
                    options: [
                        { text: "Cực kỳ xuống tinh thần và ngại liên hệ tiếp.", points: 0, feedback: "BD cần mặt dày và xem từ chối là điểm khởi đầu của đàm phán." },
                        { text: "Hơi buồn nhưng sẽ tiếp tục cố gắng ở deal khác.", points: 1, feedback: "Thái độ tích cực, cần rèn luyện thêm bản lĩnh chịu đòn." },
                        { text: "Xem đó là bình thường, chủ động tìm hiểu lý do để cải thiện tiếp cận.", points: 2, feedback: "Tinh thần thép! Bạn sinh ra để làm BD." }
                    ]
                },
                {
                    context: "Khả năng tự nghiên cứu (research) của bạn đối với một doanh nghiệp lạ?",
                    options: [
                        { text: "Chỉ tìm kiếm sơ sài trên Google trang chủ.", points: 0, feedback: "Thông tin nông sẽ không thể tạo ấn tượng cá nhân hóa." },
                        { text: "Đọc kỹ web doanh nghiệp, tìm kiếm sơ qua profile lãnh đạo trên LinkedIn.", points: 1, feedback: "Khá tốt, cần biết cách đọc báo cáo tài chính hoặc tin tức ngành sâu hơn." },
                        { text: "Nghiên cứu cơ cấu tổ chức, đọc tin tức ngành, tìm đúng PIC và các bài viết của họ.", points: 2, feedback: "Kỹ năng thám tử! Bạn biết cách tìm điểm chạm vàng." }
                    ]
                },
                {
                    context: "Khi phải chủ động tiếp cận một người lạ có vị thế cao (C-Level):",
                    options: [
                        { text: "Rất e ngại và sợ làm phiền người khác.", points: 0, feedback: "BD cần sự tự tin đồng cấp (peer-to-peer mindset) khi giao tiếp." },
                        { text: "Sẵn sàng liên hệ nhưng đôi khi viết văn phong hơi rụt rè.", points: 1, feedback: "Cần cải thiện kỹ năng viết email vị thế chuyên gia." },
                        { text: "Tự tin tiếp cận bằng các giải pháp mang lại giá trị cụ thể cho họ.", points: 2, feedback: "Tuyệt vời! Tư duy tự tin và hướng tới giá trị." }
                    ]
                },
                {
                    context: "Tính chủ động của bạn trong công việc hàng ngày?",
                    options: [
                        { text: "Chờ sếp giao việc rồi làm theo hướng dẫn.", points: 0, feedback: "Nghề BD đòi hỏi tinh thần tự trị rất cao, tự tìm cơ hội." },
                        { text: "Làm tốt việc được giao, thỉnh thoảng có đề xuất cải tiến mới.", points: 1, feedback: "Tốt, cần chủ động thử nghiệm các kênh tiếp cận mới." },
                        { text: "Tự lập kế hoạch hành động, tự tìm cơ hội và chịu trách nhiệm số liệu.", points: 2, feedback: "Tinh thần tự chủ hoàn hảo!" }
                    ]
                },
                {
                    context: "Mức độ kiên trì của bạn khi theo đuổi mục tiêu dài hạn?",
                    options: [
                        { text: "Nếu sau 1-2 tuần không thấy kết quả là muốn đổi hướng.", points: 0, feedback: "Chu kỳ deal B2B trung bình từ 3-6 tháng, bạn cần kiên trì hơn." },
                        { text: "Có thể kiên trì trong 1-2 tháng, sau đó dễ bị nản nếu không có tương tác.", points: 1, feedback: "Hãy tập trung vào quá trình và tối ưu hóa các điểm chạm nhỏ." },
                        { text: "Kiên định bám đuổi mục tiêu dài hạn, liên tục tối ưu hóa phễu tiếp cận.", points: 2, feedback: "Ý chí bền bỉ! Bạn có tố chất làm nên đại nghiệp." }
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
            id: "game-objection",
            title: "Xử Lý Từ Chối Kinh Điển",
            description: "Học cách bẻ lái các câu từ chối phổ biến nhất của khách hàng B2B sang cơ hội thuyết trình giải pháp.",
            type: "scenario_challenge",
            questions: [
                {
                    context: "Khách hàng nói: \"Để chị suy nghĩ thêm.\"",
                    options: [
                        { text: "Dạ chị cứ cân nhắc thoải mái ạ.", isCorrect: false, feedback: "Bị động! Khoảng thời gian trống sẽ khiến deal nguội lạnh nhanh chóng." },
                        { text: "Anh/chị cần suy nghĩ thêm về giá hay tính năng nào ạ?", isCorrect: true, feedback: "Chuyên gia! Thu hẹp lý do từ chối để tập trung giải quyết đúng điểm nghẽn." },
                        { text: "Sản phẩm tốt thế này sao phải suy nghĩ ạ?", isCorrect: false, feedback: "Nghiệp dư! Cách hỏi này tạo cảm giác ép buộc và thiếu tôn trọng khách hàng." },
                        { text: "Bên em sắp hết ưu đãi rồi, chị quyết nhanh đi.", isCorrect: false, feedback: "Nghiệp dư! Tạo sự khẩn cấp giả tạo dễ gây mất lòng tin ở phân khúc B2B." }
                    ]
                },
                {
                    context: "Khách hàng chê: \"Giá bên em đắt quá so với bên X.\"",
                    options: [
                        { text: "Bên em đắt xắt ra miếng chị ơi.", isCorrect: false, feedback: "Nghiệp dư! Cách nói sáo rỗng, chưa chứng minh được giá trị thực tế." },
                        { text: "Dạ, để em làm đơn xin giảm giá cho anh/chị nhé.", isCorrect: false, feedback: "Nghiệp dư! Vội vàng giảm giá làm mất vị thế giải pháp và giảm biên lợi nhuận." },
                        { text: "Không biết anh/chị đang so sánh trên cùng các tiêu chí kỹ thuật nào ạ?", isCorrect: true, feedback: "Chuyên gia! Đưa khách hàng về mặt bằng so sánh chuẩn (tính năng, dịch vụ kèm theo) thay vì chỉ nhìn con số giá." },
                        { text: "Giá bên X rẻ là do chất lượng họ kém đó ạ.", isCorrect: false, feedback: "Cấm kỵ! Hạ thấp đối thủ là hành vi phi chuyên nghiệp lớn nhất trong B2B." }
                    ]
                },
                {
                    context: "Khách hàng bảo: \"Bên anh đang dùng dịch vụ của bên Y rất ổn định rồi.\"",
                    options: [
                        { text: "Bên em tốt hơn bên Y nhiều, anh dùng thử đi.", isCorrect: false, feedback: "Nghiệp dư! Không ai muốn thay đổi một hệ thống đang chạy ổn định chỉ vì lời hứa suông." },
                        { text: "Dạ vậy khi nào bên Y có lỗi thì anh gọi em nhé.", isCorrect: false, feedback: "Quá thụ động! Bạn sẽ mãi chỉ là kẻ dự phòng vô vọng." },
                        { text: "Chúc mừng anh. Không biết trong tương lai gần anh có dự định mở rộng quy mô kinh doanh không?", isCorrect: true, feedback: "Chuyên gia! Tôn trọng nhà cung cấp cũ và tìm cơ hội mới từ bài toán tăng trưởng quy mô mà đối tác cũ chưa đáp ứng." },
                        { text: "Bên Y đắt lắm anh ơi, bên em rẻ hơn nhiều.", isCorrect: false, feedback: "Nghiệp dư! Lại cạnh tranh bằng giá và nói xấu đối thủ." }
                    ]
                },
                {
                    context: "Khách hàng từ chối: \"Bên em quy mô nhỏ quá, anh sợ không đủ năng lực phục vụ.\"",
                    options: [
                        { text: "Bên em tuy nhỏ nhưng làm việc rất nhiệt tình.", isCorrect: false, feedback: "Sự nhiệt tình không thể bù đắp được rủi ro vận hành của doanh nghiệp lớn." },
                        { text: "Dạ tụi em đã làm dự án tương tự cho công ty Z (quy mô tương đương anh/chị) thành công...", isCorrect: true, feedback: "Chuyên gia! Case study thực tế của đối thủ hoặc doanh nghiệp cùng ngành là bằng chứng thép." },
                        { text: "Bên em nhỏ nên giá rẻ hơn mấy ông lớn nhiều.", isCorrect: false, feedback: "Nghiệp dư! Lại dùng chiêu bài giá rẻ cho một nỗi lo về năng lực và rủi ro." },
                        { text: "Anh yên tâm, bên em có đội ngũ cam kết trực 24/7.", isCorrect: false, feedback: "Chưa đủ thuyết phục nếu thiếu các số liệu cam kết dịch vụ (SLA) rõ ràng." }
                    ]
                },
                {
                    context: "Khi gặp từ chối: \"Năm nay bên anh không có ngân sách cho mảng này.\"",
                    options: [
                        { text: "Dạ tiếc quá, hẹn anh sang năm nhé.", isCorrect: false, feedback: "Nghiệp dư! Đầu hàng quá sớm." },
                        { text: "Dạ, nếu bên em hỗ trợ giãn tiến độ thanh toán hoặc chia nhỏ gói chạy thử thì sao?", isCorrect: true, feedback: "Chuyên gia! Đưa ra giải pháp tài chính linh hoạt để lách qua rào cản ngân sách năm tài khóa." },
                        { text: "Anh bớt chút ngân sách mảng khác qua là được mà.", isCorrect: false, feedback: "Nghiệp dư! Can thiệp vào nội bộ phân bổ tài chính của khách là hành vi thiếu lịch sự." },
                        { text: "Bên em đang có chương trình miễn phí tháng đầu.", isCorrect: false, feedback: "Khách hàng B2B lo ngại chi phí triển khai dài hạn và công sức vận hành hơn là 1 tháng miễn phí." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 5) {
                    return { sfx: 'win', title: "Vua Xử Lý Từ Chối! 🛡️", color: "var(--primary)", text: "Tuyệt vời! Bạn có khả năng bẻ lái tình huống và thuyết phục khách hàng vô cùng sắc bén." };
                } else if (score >= 3) {
                    return { sfx: 'correct', title: "Kỹ Năng Khá! 🤔", color: "var(--text-main)", text: `Bạn đúng ${score}/5 câu. Cần hiểu rõ hơn về các kỹ thuật cô lập và làm rõ nỗi đau khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Cần Rèn Luyện Thêm! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/5 câu. Hãy ghi nhớ: đừng vội giảm giá hay đối đầu, hãy đồng cảm và làm rõ lý do từ chối.` };
                }
            }
        },
        {
            id: "game-email",
            title: "Nghệ Thuật Viết Cold Email",
            description: "Tối ưu tỷ lệ mở và phản hồi email tiếp cận đối tác với các cấu trúc chuẩn chuyên gia.",
            type: "scenario_challenge",
            questions: [
                {
                    context: "Khi chọn Tiêu đề (Subject Line) gửi cho Giám đốc Marketing (CMO) doanh nghiệp lớn:",
                    options: [
                        { text: "Hợp tác kinh doanh dịch vụ Marketing hiệu quả", isCorrect: false, feedback: "Nhạt nhòa! Trông giống như hàng ngàn email spam khác trong hòm thư của họ." },
                        { text: "[Tên Công Ty Đối Tác] x [Tên Công Ty Bạn]: Đề xuất tăng 25% tỷ lệ chuyển đổi khách hàng", isCorrect: true, feedback: "Chuyên gia! Tập trung vào giá trị cốt lõi và kết quả cụ thể đo lường được." },
                        { text: "Sản phẩm Marketing đột phá nhất năm 2026!!!", isCorrect: false, feedback: "Spam! Sử dụng quá nhiều dấu chấm than và từ ngữ đao to búa lớn sẽ bị bộ lọc spam chặn đứng." },
                        { text: "Chào anh/chị, em xin phép gửi thông tin giới thiệu dịch vụ.", isCorrect: false, feedback: "Tẻ nhạt! Không khơi gợi được bất kỳ sự tò mò hay giá trị nào." }
                    ]
                },
                {
                    context: "Câu mở đầu (Opening Line) của Cold Email nên là:",
                    options: [
                        { text: "Em tên là Nam, đến từ công ty A, chuyên cung cấp giải pháp...", isCorrect: false, feedback: "Nghiệp dư! Người nhận không quan tâm bạn là ai, họ chỉ quan tâm đến vấn đề của HỌ." },
                        { text: "Chúc anh/chị một ngày làm việc vui vẻ và tràn đầy năng lượng.", isCorrect: false, feedback: "Khách sáo và tốn thời gian. Khách hàng B2B bận rộn muốn đi thẳng vào vấn đề." },
                        { text: "Em thấy bài chia sẻ của anh trên LinkedIn về thách thức tối ưu hóa chi phí vận hành...", isCorrect: true, feedback: "Chuyên gia! Cá nhân hóa dựa trên hành vi thực tế của đối tác, tạo sự kết nối tự nhiên." },
                        { text: "Bên em đang có chương trình khuyến mãi cực lớn dành cho doanh nghiệp.", isCorrect: false, feedback: "Trực diện bán hàng quá sớm khiến người đọc đề phòng và xóa email." }
                    ]
                },
                {
                    context: "Cách đưa số liệu (Case Study) vào email thuyết phục nhất:",
                    options: [
                        { text: "Bên em đã làm cho rất nhiều khách hàng lớn thành công.", isCorrect: false, feedback: "Chung chung! Thiếu bằng chứng cụ thể." },
                        { text: "Tụi em đã giúp đối tác A tăng trưởng doanh thu vượt bậc.", isCorrect: false, feedback: "Mơ hồ! 'Vượt bậc' là bao nhiêu?" },
                        { text: "Tụi em giúp [Đối thủ cùng ngành của họ] giảm 30% thời gian xử lý đơn hàng chỉ sau 3 tháng triển khai.", isCorrect: true, feedback: "Chuyên gia! Đối thủ cùng ngành + Con số cụ thể + Thời gian rõ ràng = Công thức kích thích cao độ." },
                        { text: "Dự án của tụi em đạt điểm đánh giá 5 sao từ tất cả các khách hàng.", isCorrect: false, feedback: "Cảm tính! Khách hàng doanh nghiệp quan tâm đến chỉ số ROI (tỷ lệ hoàn vốn) thực tế." }
                    ]
                },
                {
                    context: "Lời kêu gọi hành động (Call to Action - CTA) tốt nhất ở cuối Cold Email:",
                    options: [
                        { text: "Anh/chị thấy thế nào ạ? Mong nhận được phản hồi.", isCorrect: false, feedback: "Quá chung chung, tạo gánh nặng phải suy nghĩ và trả lời dài dòng cho đối tác." },
                        { text: "Anh ký hợp đồng thử nghiệm với bên em luôn nhé?", isCorrect: false, feedback: "Quá vội vã! Mục tiêu của cold email là chốt cuộc hẹn, không phải chốt hợp đồng." },
                        { text: "Em xin phép đề xuất một cuộc gọi ngắn 10 phút vào 10:00 sáng Thứ Năm tuần này được không ạ?", isCorrect: true, feedback: "Chuyên gia! CTA cụ thể, rõ ràng, giới hạn thời gian ngắn giúp giảm tối đa rào cản đồng ý." },
                        { text: "Dưới đây là link sản phẩm, anh cứ vào xem khi nào rảnh.", isCorrect: false, feedback: "Bị động! Khách hàng sẽ không bao giờ tự vào xem nếu không được dẫn dắt." }
                    ]
                },
                {
                    context: "Sau bao lâu thì bạn nên gửi email nhắc nhở (Follow-up Email) nếu họ chưa trả lời?",
                    options: [
                        { text: "Ngay ngày hôm sau để thể hiện sự nhiệt tình.", isCorrect: false, feedback: "Gây phiền hà! Bạn sẽ bị đánh giá là spammer làm phiền khách hàng." },
                        { text: "Khoảng 3-4 ngày làm việc, bổ sung thêm một giá trị mới (ví dụ: tài liệu nghiên cứu ngành).", isCorrect: true, feedback: "Chuyên gia! Khoảng cách vừa đủ và luôn mang lại giá trị mới thay vì chỉ đòi hỏi câu trả lời." },
                        { text: "Đợi 1 tháng sau gửi lại từ đầu.", isCorrect: false, feedback: "Quá lâu! Đối tác đã hoàn toàn quên mất bạn là ai." },
                        { text: "Không follow-up nữa, họ không trả lời nghĩa là không quan tâm.", isCorrect: false, feedback: "Sai lầm! Hơn 70% các cuộc hẹn B2B được chốt từ email follow-up thứ 3 đến thứ 5." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 5) {
                    return { sfx: 'win', title: "Master Cold Email! ✉️", color: "var(--primary)", text: "Email của bạn viết cực kỳ cuốn hút, cá nhân hóa tốt và tập trung vào giá trị thực tế. Tỷ lệ mở và phản hồi chắc chắn sẽ rất cao!" };
                } else if (score >= 3) {
                    return { sfx: 'correct', title: "Email Khá Ổn! 📝", color: "var(--text-main)", text: `Bạn đúng ${score}/5 câu. Hãy chú ý tối ưu hóa tiêu đề ngắn gọn và CTA cụ thể hơn.` };
                } else {
                    return { sfx: 'lose', title: "Cần Viết Lại! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/5 câu. Tránh viết email dài dòng chào bán dịch vụ ngay lập tức. Hãy tập trung vào nỗi đau của họ.` };
                }
            }
        },
        {
            id: "game-gatekeeper",
            title: "Vượt Ải Gatekeeper",
            description: "Kỹ thuật giao tiếp khôn khéo để vượt qua bộ lọc lễ tân/thư ký và kết nối trực tiếp sếp lớn.",
            type: "scenario_challenge",
            questions: [
                {
                    context: "Gọi điện gặp lễ tân/thư ký (Gatekeeper) để xin gặp Giám đốc Công nghệ (CTO). Bạn sẽ nói:",
                    options: [
                        { text: "Chào bạn, mình bên công ty phần mềm muốn chào bán dịch vụ...", isCorrect: false, feedback: "Bị chặn ngay! Lễ tân được huấn luyện để từ chối các cuộc gọi chào hàng (sales call)." },
                        { text: "Cho chị gặp anh Bình CTO đi cưng.", isCorrect: false, feedback: "Thiếu chuyên nghiệp và trịch thượng, dễ gây ác cảm với lễ tân." },
                        { text: "Chào em, anh Nam gửi tài liệu kỹ thuật theo yêu cầu của anh Bình CTO, phiền em nối máy giúp anh xác nhận.", isCorrect: true, feedback: "Chuyên gia! Đưa ra lý do nghiệp vụ cụ thể, hợp lệ để vượt qua bộ lọc ban đầu." },
                        { text: "Anh là bạn thân của anh Bình, nối máy cho anh.", isCorrect: false, feedback: "Nói dối là điều tối kỵ, khi bị phát hiện bạn sẽ bị đưa vào danh sách đen vĩnh viễn." }
                    ]
                },
                {
                    context: "Lễ tân từ chối: \"Dạ bên em không nhận cuộc gọi giới thiệu dịch vụ, anh gửi qua email chung nhé.\"",
                    options: [
                        { text: "Email chung là gì em, đọc anh ghi.", isCorrect: false, feedback: "Bị động! Gửi vào email chung (info@...) giống như ném đá xuống biển." },
                        { text: "Em cho anh xin email riêng của sếp đi.", isCorrect: false, feedback: "Lễ tân bảo mật thông tin sếp rất nghiêm ngặt, bạn hỏi trực tiếp sẽ bị từ chối ngay." },
                        { text: "Anh hiểu quy định của công ty. Anh muốn gửi tài liệu nghiên cứu bảo mật hệ thống dành riêng cho CTO, email của anh Bình là binh.nguyen@... hay tên khác em nhỉ?", isCorrect: true, feedback: "Chuyên gia! Kỹ thuật dò tìm email bằng cách đưa ra giả định đúng cấu trúc doanh nghiệp giúp đối tác dễ dàng đính chính." },
                        { text: "Vậy thôi anh cảm ơn.", isCorrect: false, feedback: "Đầu hàng quá dễ dàng!" }
                    ]
                },
                {
                    context: "Thư ký sếp hỏi: \"Sếp em bận lắm, anh trao đổi trước với em đi.\"",
                    options: [
                        { text: "Cái này là việc quan trọng của sếp, em không quyết được đâu.", isCorrect: false, feedback: "Hạ thấp vai trò của thư ký sẽ khiến họ block bạn hoàn toàn." },
                        { text: "Dạ, đây là đề xuất giải pháp tối ưu 15% chi phí hạ tầng cloud mà bên em từng triển khai thành công...", isCorrect: true, feedback: "Chuyên gia! Tôn trọng thư ký, cung cấp cho họ thông tin giá trị tóm tắt để họ báo cáo lại sếp thuyết phục hơn." },
                        { text: "Dạ không có gì, khi nào sếp rảnh anh gọi lại.", isCorrect: false, feedback: "Lại một cơ hội bị bỏ lỡ do thiếu sự tương tác giá trị." },
                        { text: "Em cho anh số điện thoại di động của sếp đi.", isCorrect: false, feedback: "Quá đường đột và vi phạm quyền riêng tư của khách hàng." }
                    ]
                },
                {
                    context: "Bạn tìm thấy số điện thoại cá nhân của sếp trên mạng. Khi gọi trực tiếp cho sếp:",
                    options: [
                        { text: "Chào anh, em xin lỗi đã làm phiền nhưng em có giải pháp...", isCorrect: false, feedback: "Yếu thế! Việc mở đầu bằng lời xin lỗi làm giảm giá trị và vị thế chuyên gia của bạn." },
                        { text: "Chào anh Hùng, em thấy số anh trên mạng nên gọi chào dịch vụ...", isCorrect: false, feedback: "Tạo cảm giác bị theo dõi và xâm phạm thông tin cá nhân." },
                        { text: "Chào anh Hùng, tôi là Nam từ công ty A. Tôi gọi trực tiếp vì thấy bài viết của anh về khó khăn khi đồng bộ dữ liệu...", isCorrect: true, feedback: "Chuyên gia! Đi thẳng vào giá trị và lý do liên hệ một cách tự tin, chuyên nghiệp." },
                        { text: "Anh ơi mua phần mềm ủng hộ em đi.", isCorrect: false, feedback: "Nài nỉ mua hàng là hành vi tối kỵ trong giao dịch B2B chuyên nghiệp." }
                    ]
                },
                {
                    context: "Cách tốt nhất để biến Gatekeeper thành đồng minh của bạn là gì?",
                    options: [
                        { text: "Tặng quà cá nhân hoặc hoa hồng cho họ ngay từ đầu.", isCorrect: false, feedback: "Hối lộ sớm dễ bị đánh giá là thiếu chính trực và tạo ác cảm nghiệp vụ." },
                        { text: "Tôn trọng công việc của họ, hỏi tên, trò chuyện lịch sự và giải thích rõ giá trị cuộc gọi giúp ích gì cho sếp của họ.", isCorrect: true, feedback: "Chuyên gia! Xây dựng mối quan hệ dựa trên sự tôn trọng nghề nghiệp và hỗ trợ lẫn nhau." },
                        { text: "Dùng quyền lực từ trên ép xuống (ví dụ nói sếp tổng yêu cầu liên hệ).", isCorrect: false, feedback: "Nếu sếp tổng không thực sự yêu cầu, lời nói dối này sẽ hủy hoại uy tín của bạn lập tức." },
                        { text: "Bỏ qua họ hoàn toàn và chỉ tìm cách add sếp trực tiếp.", isCorrect: false, feedback: "Kể cả khi bạn add sếp thành công, họ vẫn sẽ chuyển thông tin cho thư ký xử lý." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 5) {
                    return { sfx: 'win', title: "Bất Bại Vượt Ải Lễ Tân! 🚪", color: "var(--primary)", text: "Kỹ năng giao tiếp và lách rào cản của bạn quá xuất sắc! Bạn biến Gatekeeper thành đồng minh một cách tự nhiên." };
                } else if (score >= 3) {
                    return { sfx: 'correct', title: "Vượt Ải Thành Công! 🗝️", color: "var(--text-main)", text: `Bạn đúng ${score}/5 câu. Cần tự tin và lịch sự hơn nữa để tạo lòng tin nhanh chóng.` };
                } else {
                    return { sfx: 'lose', title: "Bị Chặn Rất Tiếc! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/5 câu. Đừng chào hàng trực tiếp với lễ tân, hãy nói về lý do nghiệp vụ hợp lệ.` };
                }
            }
        },
        {
            id: "game-negotiation",
            title: "Đàm Phán Hợp Đồng B2B",
            description: "Thực hành kỹ chiến thuật thương lượng điều khoản hợp đồng để đạt thỏa thuận win-win tối ưu rủi ro.",
            type: "scenario_challenge",
            questions: [
                {
                    context: "Đối tác yêu cầu giảm giá 15% thì mới ký hợp đồng. Bạn xử lý:",
                    options: [
                        { text: "Dạ để em giảm luôn cho anh để ký cho nhanh.", isCorrect: false, feedback: "Nghiệp dư! Giảm giá quá dễ dàng làm giảm giá trị giải pháp và mất biên lợi nhuận." },
                        { text: "Bên em không giảm được đồng nào đâu ạ.", isCorrect: false, feedback: "Cứng nhắc! Đàm phán B2B cần sự linh hoạt để đạt thỏa thuận win-win." },
                        { text: "Dạ tụi em có thể hỗ trợ mức giá đó nếu anh đồng ý thanh toán trước 100% hoặc ký cam kết sử dụng 2 năm...", isCorrect: true, feedback: "Chuyên gia! Đàm phán có điều kiện (Give and Take) để bảo vệ giá trị hợp đồng." },
                        { text: "Vậy thôi bên em không làm dự án này nữa.", isCorrect: false, feedback: "Đầu hàng quá sớm trước một lời đề nghị đàm phán thông thường." }
                    ]
                },
                {
                    context: "Khách hàng yêu cầu thêm các tính năng phát sinh ngoài scope nhưng không chịu trả thêm phí:",
                    options: [
                        { text: "Dạ thôi để bên em làm free luôn coi như khuyến mãi.", isCorrect: false, feedback: "Nguy hiểm! Phình to scope (scope creep) không kiểm soát sẽ làm vỡ tiến độ và chi phí dự án." },
                        { text: "Bên em không làm, hợp đồng ghi sao làm vậy.", isCorrect: false, feedback: "Cứng nhắc quá mức dễ làm rạn nứt mối quan hệ hợp tác lâu dài." },
                        { text: "Em đề xuất chúng ta đưa các tính năng phát sinh này vào Phase 2 của dự án với một phụ lục hợp đồng riêng...", isCorrect: true, feedback: "Chuyên gia! Định vị rõ ràng ranh giới hợp đồng đồng thời mở ra cơ hội upsell tăng doanh thu." },
                        { text: "Tính năng này dễ mà, sếp em duyệt làm luôn cho anh.", isCorrect: false, feedback: "Tự ý hứa hẹn khi chưa được bộ phận kỹ thuật thẩm định rủi ro là sai lầm chết người." }
                    ]
                },
                {
                    context: "Đối tác B2B muốn áp điều khoản phạt chậm tiến độ cực nặng (vượt quá quy định pháp luật):",
                    options: [
                        { text: "Dạ không sao, bên em làm chuẩn chỉ nên ký luôn.", isCorrect: false, feedback: "Quá liều lĩnh! Rủi ro pháp lý và vận hành ngoài tầm kiểm soát có thể giết chết doanh nghiệp của bạn." },
                        { text: "Bên anh áp phạt vậy là ép người quá đáng.", isCorrect: false, feedback: "Cảm xúc hóa cuộc đàm phán pháp lý làm mất tính chuyên nghiệp." },
                        { text: "Em đề xuất điều chỉnh mức phạt theo đúng khung Luật Thương mại (tối đa 8%) và áp dụng phạt song phương...", isCorrect: true, feedback: "Chuyên gia! Sử dụng căn cứ pháp luật và nguyên tắc song phương (mutual) để cân bằng quyền lợi." },
                        { text: "Bên em chưa bao giờ bị phạt nên anh không cần ghi điều khoản này.", isCorrect: false, feedback: "Mơ hồ! Mọi hợp đồng chuyên nghiệp đều phải quy định rõ ràng các kịch bản tranh chấp." }
                    ]
                },
                {
                    context: "Khách hàng muốn thanh toán sau 90 ngày kể từ khi nghiệm thu (Net 90):",
                    options: [
                        { text: "Dạ thanh toán lúc nào cũng được anh.", isCorrect: false, feedback: "Nguy hiểm dòng tiền! Doanh nghiệp của bạn sẽ chịu gánh nặng chi phí vận hành quá lớn." },
                        { text: "Bên em chỉ chấp nhận thanh toán trước 100%.", isCorrect: false, feedback: "Khó chốt deal! Doanh nghiệp lớn hiếm khi trả trước 100% cho nhà cung cấp mới do quy trình tài chính." },
                        { text: "Dòng tiền bên em cần tối ưu. Em đề xuất thanh toán theo tiến độ: 40% đặt cọc, 40% sau khi bàn giao bản beta, và 20% Net 30...", isCorrect: true, feedback: "Chuyên gia! Chia nhỏ giai đoạn thanh toán (Milestone-based payment) để giảm thiểu rủi ro dòng tiền cho cả hai bên." },
                        { text: "Anh không trả sớm là bên em dừng dự án đó.", isCorrect: false, feedback: "Đe dọa đối tác khi đang đàm phán là hành vi hủy hoại lòng tin trầm trọng." }
                    ]
                },
                {
                    context: "Mục tiêu cốt lõi của một cuộc đàm phán hợp đồng B2B thành công là gì?",
                    options: [
                        { text: "Ép đối tác chấp nhận mọi điều khoản có lợi nhất cho mình.", isCorrect: false, feedback: "Đàm phán win-lose sẽ dẫn đến việc triển khai dự án khó khăn và không có hợp tác lâu dài." },
                        { text: "Ký được hợp đồng bằng mọi giá, kể cả khi chịu thiệt hại.", isCorrect: false, feedback: "Ký hợp đồng lỗ hoặc quá rủi ro sẽ gây hại cho doanh nghiệp của bạn." },
                        { text: "Đạt được thỏa thuận Win-Win, cân bằng giữa lợi ích kinh tế và mức độ rủi ro chấp nhận được của hai bên...", isCorrect: true, feedback: "Tuyệt vời! Đây là tư duy đàm phán bền vững của mọi chuyên gia B2B." },
                        { text: "Kéo dài thời gian đàm phán càng lâu càng tốt.", isCorrect: false, feedback: "Lãng phí thời gian và cơ hội kinh doanh của cả hai doanh nghiệp." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 5) {
                    return { sfx: 'win', title: "Chuyên Gia Đàm Phán Win-Win! 🤝", color: "var(--primary)", text: "Bạn bảo vệ giá trị hợp đồng rất tốt bằng nguyên tắc trao đổi có điều kiện. Thỏa thuận của bạn luôn bền vững." };
                } else if (score >= 3) {
                    return { sfx: 'correct', title: "Thỏa Thuận Tốt! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/5 câu. Cần tránh nhượng bộ quá nhanh mà không đòi hỏi lại quyền lợi tương xứng.` };
                } else {
                    return { sfx: 'lose', title: "Chịu Nhiều Thiệt Thòi! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/5 câu. Hãy nhớ: luôn đàm phán có điều kiện (Give and Take) để tránh bị ép giá.` };
                }
            }
        },
        {
            id: "game-pitching",
            title: "Kỹ Năng Pitching & Slide Thuyết Phục",
            description: "Làm sao để trình bày giải pháp thuyết phục Ban giám đốc/C-level gật đầu đồng ý thử nghiệm.",
            type: "scenario_challenge",
            questions: [
                {
                    context: "Khi thiết kế slide mở đầu cho buổi Pitching với Ban giám đốc đối tác:",
                    options: [
                        { text: "Slide giới thiệu lịch sử hình thành 20 năm của công ty bạn.", isCorrect: false, feedback: "Tẻ nhạt! Ban giám đốc không muốn nghe lịch sử của bạn, họ muốn nghe về vấn đề của họ." },
                        { text: "Slide nêu rõ nỗi đau (pain point) và tổn thất tài chính họ đang gặp phải...", isCorrect: true, feedback: "Chuyên gia! Đánh thẳng vào vấn đề cốt lõi giúp thu hút sự chú ý của C-level lập tức." },
                        { text: "Slide danh sách tất cả các giải thưởng công ty bạn đạt được.", isCorrect: false, feedback: "Khoe khoang quá sớm trước khi chứng minh được giá trị thực tế cho đối tác." },
                        { text: "Slide bảng giá chi tiết các gói dịch vụ.", isCorrect: false, feedback: "Quá vội vàng! Đừng nói về giá trước khi họ thấy giá trị sản phẩm." }
                    ]
                },
                {
                    context: "Bạn có 20 phút để Pitching giải pháp. Cách phân bổ thời gian tối ưu nhất là:",
                    options: [
                        { text: "Dành 15 phút nói về sản phẩm, 5 phút hỏi đáp.", isCorrect: false, feedback: "Nói quá nhiều về mình sẽ khiến khách hàng mệt mỏi và không tương tác." },
                        { text: "Dành 10 phút trình bày vấn đề & giải pháp cốt lõi, 10 phút thảo luận phản hồi...", isCorrect: true, feedback: "Chuyên gia! Tỷ lệ 50/50 giúp lắng nghe sâu sắc các phản hồi và làm rõ nhu cầu thực tế." },
                        { text: "Nói liên tục 20 phút không cho khách hàng ngắt lời.", isCorrect: false, feedback: "Thuyết trình một chiều là cách nhanh nhất để giết chết một buổi pitching." },
                        { text: "Không cần chuẩn bị slide, vào phòng họp nói chuyện ngẫu hứng.", isCorrect: false, feedback: "Thiếu chuẩn bị là chuẩn bị cho sự thất bại." }
                    ]
                },
                {
                    context: "Khách hàng ngắt lời giữa buổi Pitching để hỏi một câu hỏi hóc búa về lỗi hệ thống:",
                    options: [
                        { text: "Dạ để em nói hết phần này rồi trả lời sau nhé.", isCorrect: false, feedback: "Thiếu tôn trọng! Trì hoãn câu hỏi của khách hàng làm mất đi nhịp tương tác tự nhiên." },
                        { text: "Sản phẩm bên em hoàn hảo, không bao giờ có lỗi đó đâu ạ.", isCorrect: false, feedback: "Nói dối hoặc tự tin thái quá sẽ bị khách hàng đánh giá là thiếu trung thực." },
                        { text: "Câu hỏi rất thực tế. Bên em xử lý lỗi đó bằng quy trình backup tự động và cam kết SLA đền bù...", isCorrect: true, feedback: "Chuyên gia! Trực diện trả lời bằng giải pháp kỹ thuật cụ thể và cam kết trách nhiệm rõ ràng." },
                        { text: "Cái này thuộc bộ phận kỹ thuật, em làm sales nên không biết.", isCorrect: false, feedback: "Đẩy trách nhiệm làm giảm lòng tin của khách hàng vào năng lực chuyên môn của bạn." }
                    ]
                },
                {
                    context: "Cách tốt nhất để kết thúc một buổi Pitching B2B:",
                    options: [
                        { text: "Cảm ơn và chúc khách hàng may mắn.", isCorrect: false, feedback: "Nhạt nhòa, thiếu định hướng tiếp theo." },
                        { text: "Đưa ra lộ trình thử nghiệm (POC) miễn phí trong 2 tuần kèm các tiêu chí đo lường thành công rõ ràng...", isCorrect: true, feedback: "Chuyên gia! Đưa ra hành động tiếp theo cụ thể và có rào cản thấp để khách hàng dễ dàng đồng ý tiến bước tiếp theo." },
                        { text: "Yêu cầu họ ký nháp biên bản ghi nhớ hợp tác ngay tại chỗ.", isCorrect: false, feedback: "Ép buộc quá sớm khi họ chưa kịp thảo luận nội bộ." },
                        { text: "Hỏi: 'Anh chị có mua sản phẩm bên em không?'", isCorrect: false, feedback: "Câu hỏi đóng quá ngây thơ và thiếu chuyên nghiệp ở phân khúc doanh nghiệp." }
                    ]
                },
                {
                    context: "Quy tắc thiết kế slide B2B hiệu quả nhất là gì?",
                    options: [
                        { text: "Càng nhiều chữ càng tốt để thể hiện sự chi tiết.", isCorrect: false, feedback: "Slide quá nhiều chữ sẽ khiến người nghe mất tập trung vào lời bạn nói." },
                        { text: "Sử dụng thật nhiều hiệu ứng chuyển động bắt mắt.", isCorrect: false, feedback: "Gây rối mắt và giảm đi tính nghiêm túc chuyên nghiệp của buổi họp doanh nghiệp." },
                        { text: "Sử dụng sơ đồ trực quan, số liệu rõ ràng và quy tắc 1 ý tưởng chính cho mỗi slide...", isCorrect: true, feedback: "Tuyệt vời! Slide rõ ràng giúp truyền tải thông điệp nhanh chóng và ấn tượng." },
                        { text: "Copy toàn bộ file Word tài liệu kỹ thuật dán vào slide.", isCorrect: false, feedback: "Lười biếng và phản tác dụng hoàn toàn." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 5) {
                    return { sfx: 'win', title: "Siêu Sao Thuyết Trình B2B! 📊", color: "var(--primary)", text: "Slide của bạn trực quan, cấu trúc chặt chẽ và bài thuyết trình thu hút C-level từ giây đầu tiên!" };
                } else if (score >= 3) {
                    return { sfx: 'correct', title: "Buổi Pitching Khá! 🗣️", color: "var(--text-main)", text: `Bạn đúng ${score}/5 câu. Nên phân bổ nhiều thời gian hơn cho việc hỏi đáp và lắng nghe khách hàng.` };
                } else {
                    return { sfx: 'lose', title: "Bài Pitching Tẻ Nhạt! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/5 câu. Đừng biến slide thành file Word đọc tài liệu. Hãy tập trung vào Pain Point.` };
                }
            }
        },
        {
            id: "game-eq",
            title: "EQ trong B2B Sales",
            description: "Khảo sát chỉ số EQ - khả năng chịu áp lực, thấu cảm và tự tạo động lực của chiến binh BD.",
            type: "suitability_scoring",
            questions: [
                {
                    context: "Khi khách hàng B2B tỏ ra giận dữ và phàn nàn rất nặng lời về chất lượng dịch vụ:",
                    options: [
                        { text: "Lập tức tranh cãi và giải thích lỗi không phải do bên mình.", points: 0, feedback: "Tăng thêm xung đột và đổ thêm dầu vào lửa." },
                        { text: "Lắng nghe hết cuộc gọi, ghi chú lại và xin lỗi lịch sự, sau đó chuyển giao cho bộ phận kỹ thuật.", points: 1, feedback: "Xử lý chuẩn mực nhưng cần chủ động đưa ra thời gian cam kết khắc phục cụ thể." },
                        { text: "Đồng cảm với thiệt hại của họ, lắng nghe không ngắt lời, xác định nguyên nhân cốt lõi và cam kết lộ trình xử lý đền bù cụ thể.", points: 2, feedback: "Xuất sắc! EQ cao giúp biến một khách hàng đang giận dữ thành đối tác trung thành lâu dài." }
                    ]
                },
                {
                    context: "Khi một đối tác thân thiết từ chối hợp đồng này để chọn đối thủ cạnh tranh:",
                    options: [
                        { text: "Tỏ thái độ giận dỗi và không bao giờ liên hệ lại nữa.", points: 0, feedback: "Hủy hoại mối quan hệ cá nhân dài hạn chỉ vì một deal ngắn hạn." },
                        { text: "Chúc mừng họ lịch sự và hỏi lý do tại sao họ chọn đối thủ để rút kinh nghiệm.", points: 1, feedback: "Tốt, giúp tích lũy dữ liệu thị trường và giữ mối quan hệ ôn hòa." },
                        { text: "Tôn trọng quyết định của họ, gửi lời chúc mừng chân thành và đề xuất làm phương án dự phòng (backup plan) khi nhà cung cấp kia gặp sự cố.", points: 2, feedback: "Chuyên gia EQ đỉnh cao! Cửa của bạn luôn mở và đối tác sẽ nhớ tới bạn ngay khi đối thủ xảy ra lỗi vận hành." }
                    ]
                },
                {
                    context: "Bạn có khả năng kiên trì tiếp tục liên hệ (outreach) sau khi bị đối tác từ chối thẳng thừng bao nhiêu lần?",
                    options: [
                        { text: "Bỏ cuộc ngay lần đầu tiên bị từ chối để tránh mất thời gian.", points: 0, feedback: "Tỷ lệ chốt deal B2B trung bình cần từ 5-8 điểm chạm." },
                        { text: "Thử gửi thêm 1-2 email follow-up giãn cách rồi dừng lại nếu họ không trả lời.", points: 1, feedback: "Nỗ lực ở mức trung bình, cần đa dạng hóa kênh liên hệ (LinkedIn, Phone, Event)." },
                        { text: "Tiếp tục xây dựng mối quan hệ bằng cách chia sẻ tài liệu giá trị định kỳ, kết nối LinkedIn và kiên trì tiếp cận trong 3-6 tháng.", points: 2, feedback: "Tố chất thép của siêu sao BD! Kiên trì có chiến thuật luôn mang lại quả ngọt." }
                    ]
                },
                {
                    context: "Khi làm việc nhóm với bộ phận Kỹ thuật/Sản phẩm (Product/Tech team) trong công ty:",
                    options: [
                        { text: "Luôn thúc ép họ làm nhanh tính năng mới theo yêu cầu của khách hàng mà không cần quan tâm đến tài nguyên hệ thống.", points: 0, feedback: "Gây xung đột nội bộ nghiêm trọng và làm giảm chất lượng sản phẩm." },
                        { text: "Trao đổi lịch sự, gửi file spec yêu cầu rõ ràng và chờ họ xếp lịch làm việc.", points: 1, feedback: "Cách làm việc chuẩn quy trình nhưng thiếu sự phối hợp chủ động." },
                        { text: "Tìm hiểu quy trình kỹ thuật của họ, cùng thảo luận để đơn giản hóa yêu cầu của khách và bảo vệ tech team trước sức ép vô lý.", points: 2, feedback: "Tuyệt vời! Khả năng kết nối nội bộ (internal alignment) tốt giúp BD có được sự hỗ trợ tối đa từ tech team." }
                    ]
                },
                {
                    context: "Bạn tự đánh giá thế nào về khả năng tự tạo động lực (self-motivation) khi không có doanh số trong 2-3 tháng liền?",
                    options: [
                        { text: "Cực kỳ chán nản, mất phương hướng và nghĩ đến việc chuyển nghề.", points: 0, feedback: "BD chu kỳ deal dài rất cần tinh thần thép và sự kiên định." },
                        { text: "Cố gắng làm việc theo đúng KPI được giao và mong chờ may mắn sẽ đến.", points: 1, feedback: "Bài động! Động lực cần đến từ việc phân tích nguyên nhân và cải tiến phương pháp." },
                        { text: "Xem đây là chu kỳ bình thường của B2B, chủ động phân tích phễu chuyển đổi, tối ưu hóa tệp lead và tin tưởng vào quy trình tích lũy.", points: 2, feedback: "Tư duy đỉnh cao! Sự kiên định dựa trên số liệu giúp bạn vượt qua mọi khó khăn của thị trường." }
                    ]
                }
            ],
            getResult: (points) => {
                if (points >= 8) {
                    return { sfx: 'win', title: "BD Có EQ Đỉnh Cao! ❤️", color: "var(--primary)", text: `Bạn đạt ${points}/10 điểm. Khả năng thấu cảm, kiên trì và quản trị mối quan hệ nội bộ của bạn là hình mẫu lý tưởng.` };
                } else if (points >= 5) {
                    return { sfx: 'correct', title: "EQ Trung Bình Khá! 📈", color: "var(--text-main)", text: `Bạn đạt ${points}/10 điểm. Cần rèn luyện thêm khả năng giữ bình tĩnh trước phàn nàn và kiên trì theo đuổi deal.` };
                } else {
                    return { sfx: 'lose', title: "Cần Quản Trị Cảm Xúc! 😅", color: "var(--danger)", text: `Bạn đạt ${points}/10 điểm. BD là một cuộc marathon dài hạn. Hãy rèn luyện sự kiên trì và đồng cảm sâu sắc hơn.` };
                }
            }
        },
        {
            id: "game-upsell",
            title: "Upsell & Giữ Chân Khách Hàng",
            description: "Chăm sóc khách hàng cũ hiệu quả để tối ưu hóa giá trị tài khoản trọn đời (LTV) và tăng doanh thu upsell.",
            type: "scenario_challenge",
            questions: [
                {
                    context: "Sau khi ký hợp đồng thành công, bước tiếp theo của BD là gì?",
                    options: [
                        { text: "Bàn giao toàn bộ cho đội ngũ vận hành (Operations/CS) và tập trung tìm khách mới ngay lập tức.", isCorrect: false, feedback: "Nghiệp dư! Bỏ rơi khách hàng sau khi ký hợp đồng làm giảm tỷ lệ tái ký và upsell." },
                        { text: "Đợi đến khi sắp hết hạn hợp đồng mới liên hệ lại để mời gia hạn.", isCorrect: false, feedback: "Quá muộn! Đối thủ có thể đã tiếp cận và cướp khách hàng từ trước." },
                        { text: "Tổ chức buổi họp khởi động (Kick-off meeting) cùng CS team để bàn giao chi tiết kỳ vọng của khách và duy trì check-in định kỳ 3 tháng...", isCorrect: true, feedback: "Chuyên gia! Đảm bảo khách hàng đạt được giá trị mong muốn (Customer Success) là gốc rễ của upsell." },
                        { text: "Thường xuyên gọi điện hỏi xem khách hàng có cần mua thêm gì khác không.", isCorrect: false, feedback: "Gây phiền hà! Đừng cố bán hàng khi chưa mang lại giá trị thực tế." }
                    ]
                },
                {
                    context: "Khách hàng phàn nàn: \"Hệ thống của bên em chạy rất chậm và ảnh hưởng đến công việc của tụi anh.\"",
                    options: [
                        { text: "\"Dạ do mạng nhà anh yếu đó chứ bên em chạy nhanh lắm.\"", isCorrect: false, feedback: "Đổ lỗi cho khách hàng là cách nhanh nhất để chấm dứt hợp tác." },
                        { text: "\"Dạ em ghi nhận, để em báo kỹ thuật kiểm tra khi nào rảnh.\"", isCorrect: false, feedback: "Thiếu cam kết khẩn cấp khiến khách hàng cảm thấy không được tôn trọng." },
                        { text: "\"Em xin lỗi vì trải nghiệm không tốt này. Em đã yêu cầu Tech Lead kiểm tra hệ thống và sẽ gửi báo cáo khắc phục cho anh trước 17:00 hôm nay...\"", isCorrect: true, feedback: "Chuyên gia! Chủ động nhận trách nhiệm, đưa ra thời hạn cụ thể và lộ trình khắc phục rõ ràng." },
                        { text: "\"Anh nâng cấp lên gói Enterprise đắt tiền hơn là hết chậm liền.\"", isCorrect: false, feedback: "Vo lý! Bán thêm sản phẩm khi giải pháp cũ đang lỗi là hành vi phi đạo đức kinh doanh." }
                    ]
                },
                {
                    context: "Cơ hội tốt nhất để đề xuất bán thêm (Upsell/Cross-sell) cho khách hàng cũ là:",
                    options: [
                        { text: "Khi họ đang gặp sự cố hệ thống nghiêm trọng.", isCorrect: false, feedback: "Tệ hại! Họ đang bực mình mà bạn đi bán hàng sẽ phản tác dụng lập tức." },
                        { text: "Ngay ngày đầu tiên nghiệm thu Phase 1 dự án.", isCorrect: false, feedback: "Quá sớm! Họ chưa kịp cảm nhận giá trị thực tế của giải pháp." },
                        { text: "Ngay sau khi bạn gửi báo cáo chứng minh dự án của họ đạt vượt chỉ số ROI cam kết (ví dụ tăng 30% doanh số)...", isCorrect: true, feedback: "Chuyên gia! Thời điểm khách hàng hạnh phúc và thấy rõ giá trị thực tế là cơ hội vàng để mở rộng quy mô hợp tác." },
                        { text: "Cuối năm khi công ty bạn cần chạy chỉ tiêu doanh số.", isCorrect: false, feedback: "Bán hàng dựa trên nhu cầu của bạn chứ không phải của khách hàng là thất bại." }
                    ]
                },
                {
                    context: "Khách hàng cũ muốn hủy hợp đồng vì lý do cắt giảm ngân sách toàn công ty:",
                    options: [
                        { text: "Chấp nhận hủy ngay và chúc họ may mắn.", isCorrect: false, feedback: "Thiếu sự nỗ lực cứu vãn và giữ mối quan hệ." },
                        { text: "Ép họ phải bồi thường hợp đồng theo đúng điều khoản cam kết.", isCorrect: false, feedback: "Cứng nhắc! Ép buộc pháp lý có thể giúp bạn lấy được chút tiền phạt nhưng mất vĩnh viễn mối quan hệ trong tương lai." },
                        { text: "Đề xuất gói dịch vụ thu gọn (Downgrade) giữ lại tính năng lõi với chi phí thấp hơn để giúp họ vượt khó, duy trì sự hiện diện của bạn...", isCorrect: true, feedback: "Chuyên gia! Linh hoạt đồng hành cùng khó khăn của đối tác để giữ chân tài khoản dài hạn." },
                        { text: "Nói xấu ban giám đốc của họ thiếu tầm nhìn tài chính.", isCorrect: false, feedback: "Hành vi phi chuyên nghiệp cực kỳ nghiêm trọng." }
                    ]
                },
                {
                    context: "Tỷ lệ đóng góp doanh thu lý tưởng nhất của khách hàng cũ (Retention Revenue) đối với một doanh nghiệp B2B bền vững là:",
                    options: [
                        { text: "Gần 0%, doanh nghiệp chỉ cần tập trung săn khách hàng mới (New Hunter).", isCorrect: false, feedback: "Chi phí tìm khách mới (CAC) đắt gấp 5-25 lần chi phí giữ khách cũ. Doanh nghiệp sẽ kiệt quệ tài chính." },
                        { text: "Khoảng 20% doanh thu toàn công ty.", isCorrect: false, feedback: "Vẫn quá thấp, phản ánh dịch vụ sau bán hàng kém khiến khách rời đi liên tục." },
                        { text: "Chiếm từ 60% đến 80% doanh thu hàng năm nhờ cơ chế gia hạn và upsell (Farm & Expand)...", isCorrect: true, feedback: "Chính xác! Khách hàng cũ là mỏ vàng bền vững của mọi mô hình B2B thành công." },
                        { text: "100%, không cần tìm bất kỳ khách hàng mới nào.", isCorrect: false, feedback: "Rủi ro tập trung quá cao! Nếu một vài khách hàng lớn rời đi, công ty sẽ sụp đổ lập tức." }
                    ]
                }
            ],
            getResult: (score) => {
                if (score === 5) {
                    return { sfx: 'win', title: "Vua Upsell & Chăm Sóc Khách Hàng! 📈", color: "var(--primary)", text: "Khách hàng cũ sẽ liên tục tái ký và mua thêm giải pháp nhờ quy trình chăm sóc chuyên nghiệp của bạn!" };
                } else if (score >= 3) {
                    return { sfx: 'correct', title: "Tỷ Lệ Giữ Chân Tốt! 📊", color: "var(--text-main)", text: `Bạn đúng ${score}/5 câu. Hãy tận dụng thời điểm khách hàng đạt được giá trị thực tế để đề xuất upsell.` };
                } else {
                    return { sfx: 'lose', title: "Khách Hàng Rời Đi Nhiều! 😅", color: "var(--danger)", text: `Bạn đúng ${score}/5 câu. Đừng bỏ rơi khách sau khi ký hợp đồng. Customer Success là chìa khóa của sự bền vững.` };
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

    // Attach selection event to selector cards and internal buttons for robustness
    const gameCards = document.querySelectorAll('#game-selector .game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.getAttribute('data-game-index'), 10);
            selectGame(idx);
        });
    });

    const gameCardBtns = document.querySelectorAll('#game-selector .game-card button');
    gameCardBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid duplicate calls
            const card = btn.closest('.game-card');
            if (card) {
                const idx = parseInt(card.getAttribute('data-game-index'), 10);
                selectGame(idx);
            }
        });
    });

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
