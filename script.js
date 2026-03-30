document.addEventListener('DOMContentLoaded', () => {
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

    const questions = [
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
    ];

    let currentQIndex = 0;
    let score = 0;
    let timerInterval = null;
    let timeLeft = 15;

    const gameIntro = document.getElementById('game-intro');
    const gamePlay = document.getElementById('game-play');
    const gameResult = document.getElementById('game-result');
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMsg = document.getElementById('feedback-msg');
    const progressBar = document.getElementById('progress');
    const timerDisplay = document.getElementById('timer-display');

    if(startBtn) {
        startBtn.addEventListener('click', () => {
            // Unsuspend audio context on first user interaction
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
        
        const q = questions[currentQIndex];
        questionText.textContent = `Câu ${currentQIndex + 1}/5: ${q.context}`;
        progressBar.style.width = `${((currentQIndex) / questions.length) * 100}%`;

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

        // Shuffle options
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach(opt => {
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
        
        // Highlight correct answer
        allBtns.forEach(b => {
            if (b.textContent === allOptionsData.find(o => o.isCorrect).text) {
                b.classList.add('correct');
            }
        });
        
        progressBar.style.width = `${((currentQIndex + 1) / questions.length) * 100}%`;
        nextBtn.classList.remove('hidden');
    }

    function selectAnswer(selectedOpt, selectedBtn, allOptionsData) {
        clearInterval(timerInterval);
        // Disable all buttons
        const allBtns = optionsContainer.querySelectorAll('.btn-option');
        allBtns.forEach(b => b.disabled = true);

        feedbackMsg.classList.remove('hidden');
        feedbackMsg.textContent = selectedOpt.feedback;

        if (selectedOpt.isCorrect) {
            sfx.correct();
            selectedBtn.classList.add('correct');
            feedbackMsg.className = 'feedback-msg success';
            score++;
        } else {
            sfx.wrong();
            selectedBtn.classList.add('wrong');
            feedbackMsg.className = 'feedback-msg error';
            
            // Highlight correct answer
            allBtns.forEach(b => {
                if (b.textContent === allOptionsData.find(o => o.isCorrect).text) {
                    b.classList.add('correct');
                }
            });
        }
        
        progressBar.style.width = `${((currentQIndex + 1) / questions.length) * 100}%`;
        nextBtn.classList.remove('hidden');
    }

    function loadNextQuestion() {
        currentQIndex++;
        if (currentQIndex < questions.length) {
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
        
        if (score === 5) {
            sfx.win();
            resultTitle.textContent = "Xuất Sắc! BD Khó Có Peter Lo 💪";
            resultTitle.style.color = "var(--primary)";
            resultText.textContent = "Tuyệt vời, bạn phản ứng rất bén! Bạn đã hoàn toàn làm chủ ngôn từ của một chuyên gia B2B thực thụ.";
        } else if (score >= 3) {
            sfx.correct();
            resultTitle.textContent = "Khá Tốt! 🤔";
            resultTitle.style.color = "var(--text-main)";
            resultText.textContent = `Bạn đạt ${score}/5 điểm. Hãy rèn luyện thêm chút nữa để thành phản xạ bất bại nhé!`;
        } else {
            sfx.lose();
            resultTitle.textContent = "Cần Rèn Luyện Thêm! 😅";
            resultTitle.style.color = "var(--danger)";
            resultText.textContent = `Bạn đạt ${score}/5 điểm. Bí kíp đã có, hãy ghi nhớ và thực hành nhiều hơn. Chúc bạn lần sau "chốt deal" mượt hơn!`;
        }
    }
});
