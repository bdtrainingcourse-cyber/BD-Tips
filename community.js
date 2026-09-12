// B2B BD Community Forum Logic

document.addEventListener('DOMContentLoaded', () => {
    let currentCategory = 'all';
    let currentSearch = '';

    // IndexedDB initialization for rich media files
    const DB_NAME = 'bd_community_uploads_db';
    const DB_VERSION = 1;
    const STORE_NAME = 'media_uploads';
    let db = null;

    function initIndexedDB() {
        return new Promise((resolve) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, { keyPath: 'postId' });
                }
            };
            request.onsuccess = (e) => {
                db = e.target.result;
                resolve(db);
            };
            request.onerror = (e) => {
                console.warn('IndexedDB failed to open. Fallback to standard storage.', e);
                resolve(null);
            };
        });
    }

    initIndexedDB();

    function savePostMedia(postId, filesData) {
        return new Promise((resolve) => {
            if (!db) return resolve();
            try {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.put({ postId, media: filesData });
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => resolve();
            } catch(err) {
                console.warn('Failed to save to IndexedDB:', err);
                resolve();
            }
        });
    }

    function getPostMedia(postId) {
        return new Promise((resolve) => {
            if (!db) return resolve([]);
            try {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(postId);
                request.onsuccess = (e) => {
                    const result = e.target.result;
                    resolve(result ? result.media : []);
                };
                request.onerror = () => resolve([]);
            } catch(err) {
                console.warn('Failed to read from IndexedDB:', err);
                resolve([]);
            }
        });
    }

    function readFileAsBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }

    let attachedFiles = []; // Array of { file: File, type: 'image'|'video', previewUrl: string, base64: string }

    // DOM Elements
    const postsContainer = document.getElementById('posts-container');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const searchInput = document.getElementById('community-search');
    const btnCreatePost = document.getElementById('btn-create-post');
    const createPostModal = document.getElementById('create-post-modal');
    const createPostForm = document.getElementById('createPostForm');
    
    const postDetailContainer = document.getElementById('post-detail-container');
    const postsListContainer = document.getElementById('posts-list-container');
    const btnBackToList = document.getElementById('btn-back-to-list');

    // Bounty group toggle
    const postCat = document.getElementById('postCat');
    const postBountyGroup = document.getElementById('postBountyGroup');
    if (postCat && postBountyGroup) {
        postCat.addEventListener('change', () => {
            if (postCat.value === 'pic') {
                postBountyGroup.classList.remove('hidden');
            } else {
                postBountyGroup.classList.add('hidden');
            }
        });
    }

    // Auto survey removed to provide a clean, non-intrusive community reading experience

    // Notification center DOM Elements
    const btnNotiBell = document.getElementById('btn-noti-bell');
    const notiDropdown = document.getElementById('noti-dropdown');
    const notiBadge = document.getElementById('noti-badge');
    const notiList = document.getElementById('noti-list');
    const btnClearNoti = document.getElementById('btn-clear-noti');

    if (btnNotiBell && notiDropdown) {
        btnNotiBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notiDropdown.classList.toggle('hidden');
            renderNotifications();
        });
        document.addEventListener('click', () => {
            notiDropdown.classList.add('hidden');
        });
        notiDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    if (btnClearNoti) {
        btnClearNoti.addEventListener('click', () => {
            const notis = getNotifications();
            notis.forEach(n => n.unread = false);
            saveNotifications(notis);
            updateNotiBadge();
            renderNotifications();
        });
    }

    function getNotifications() {
        const notis = localStorage.getItem('bd_notifications');
        return notis ? JSON.parse(notis) : [];
    }

    function saveNotifications(notis) {
        localStorage.setItem('bd_notifications', JSON.stringify(notis));
    }

    function addNotification(postId, text) {
        const notis = getNotifications();
        notis.unshift({
            id: 'noti-' + Date.now(),
            postId: postId,
            text: text,
            time: 'Vừa xong',
            unread: true
        });
        saveNotifications(notis);
        updateNotiBadge();
        renderNotifications();
    }

    function updateNotiBadge() {
        if (!notiBadge) return;
        const notis = getNotifications();
        const unreadCount = notis.filter(n => n.unread).length;
        if (unreadCount > 0) {
            notiBadge.textContent = unreadCount;
            notiBadge.classList.remove('hidden');
        } else {
            notiBadge.classList.add('hidden');
        }
    }

    function renderNotifications() {
        if (!notiList) return;
        const notis = getNotifications();
        if (notis.length === 0) {
            notiList.innerHTML = '<div class="noti-empty">Không có thông báo mới.</div>';
            return;
        }
        notiList.innerHTML = notis.map(n => `
            <div class="noti-item ${n.unread ? 'unread' : ''}" data-post-id="${n.postId}" data-noti-id="${n.id}">
                <div class="noti-item-text">${n.text}</div>
                <div class="noti-item-time">${n.time}</div>
            </div>
        `).join('');

        notiList.querySelectorAll('.noti-item').forEach(item => {
            item.addEventListener('click', () => {
                const postId = item.getAttribute('data-post-id');
                const notiId = item.getAttribute('data-noti-id');
                
                // Mark as read
                const allNotis = getNotifications();
                const current = allNotis.find(n => n.id === notiId);
                if (current) current.unread = false;
                saveNotifications(allNotis);
                updateNotiBadge();

                // Open post details
                notiDropdown.classList.add('hidden');
                showPostDetails(postId);
            });
        });
    }

    // Simulated email toast alert
    function triggerEmailToast(toEmail, subject) {
        const toast = document.createElement('div');
        toast.className = 'noti-toast';
        toast.innerHTML = `
            <div class="noti-toast-header">
                🦉 BeeDee Mailer Alert
            </div>
            <div class="noti-toast-body">
                Một email thông báo đã được gửi đến <strong>${toEmail}</strong>!<br>
                <em>"${subject}"</em>
            </div>
            <div class="noti-toast-footer">
                Trình mô phỏng Email của BD Bình Dân Học Vụ
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

    // Initial check
    updateNotiBadge();

    // Default preloaded posts with authentic B2B discussions
    const defaultPosts = [
        {
            id: 'challenge-peter',
            category: 'challenge',
            title: '⚔️ KHIÊU CHIẾN: Ai tự tin đàm phán giỏi hơn sếp Peter Võ? (Ải 1 Đàm Phán B2B)',
            content: 'Chào các bạn! Tôi là Peter Võ (Tổng Tư Lệnh). Tôi vừa hoàn thành Ải Đàm phán thương lượng B2B trong Đấu trường Thực chiến và đạt mức điểm 85. Bạn nào tự tin đàm phán giỏi, hãy click nút <b>Nhận lời thách đấu</b> bên dưới để thử tài vượt qua điểm số của tôi. Thắng nhận ngay <b>+50 BD-Points</b> từ Cú BeeDee!',
            author: 'Peter Võ (Mentor B2B)',
            email: 'peter.vo@pvacademy.vn',
            date: 'Hôm nay',
            upvotes: 112,
            upvoted: false,
            isChallenge: true,
            challengeGameId: 'puzzle-negotiation',
            challengeScore: 85,
            comments: [
                {
                    author: 'Hoang_EnterpriseSales',
                    email: 'hoang.sales@cloudhr.vn',
                    content: 'Ải này khó nhất ở đoạn buyer ép giảm 25% kèm hoãn thanh toán 90 ngày. Đang cày lại để phá kỷ lục của anh Peter!',
                    date: 'Hôm nay'
                }
            ]
        },
        {
            id: 'challenge-minh',
            category: 'challenge',
            title: '⚔️ KHIÊU CHIẾN: Thử tài thiết lập KPI B2B cùng chuyên gia MinhBD (Ải 2 KPI Master)',
            content: 'Chào các đồng nghiệp! Mình là MinhBD (Kiến Trúc Sư). Mình thách đấu toàn bộ cộng đồng vượt qua mức điểm 80 tại Ải Cân não thiết lập KPI B2B. Hãy click <b>Nhận lời thách đấu</b> để xem bạn hay mình có tư duy quản trị số liệu sắc bén hơn nhé! Thắng nhận <b>+50 BD-Points</b> thưởng nóng!',
            author: 'MinhBD (Kiến Trúc Sư)',
            email: 'minh.bd@kpiarchitect.com',
            date: 'Hôm nay',
            upvotes: 75,
            upvoted: false,
            isChallenge: true,
            challengeGameId: 'puzzle-kpi',
            challengeScore: 80,
            comments: []
        },
        {
            id: 'post-4',
            category: 'qna',
            title: 'Sếp khách hàng đòi "hoa hồng riêng" 10%: Xử lý khéo thế nào để không vi phạm đạo đức mà vẫn giữ deal?',
            content: 'Chào các anh chị em trong nghề, em đang theo đuổi một deal cung cấp phần mềm nhân sự trị giá hơn 800 triệu. Mọi thứ từ demo tính năng đến phòng ban chuyên môn đều duyệt êm đẹp. Tuy nhiên hôm qua đi cafe riêng, vị Trưởng ban dự án bên khách bóng gió đòi "chiết khấu cá nhân" 10% thì mới ký nghiệm thu đợt 1. Công ty em có quy định kiểm toán rất ngặt và cấm tuyệt đối chi tiền ngoài luồng. Giờ từ chối thẳng thì sợ rớt deal, mà nhận lời thì vừa phạm luật vừa run. Mong các anh chị nhiều năm kinh nghiệm chỉ giáo hướng xử lý ạ!',
            author: 'Hoang_EnterpriseSales',
            email: 'hoang.sales@cloudhr.vn',
            date: 'Hôm nay',
            upvotes: 68,
            upvoted: false,
            comments: [
                {
                    author: 'Lan_B2BConsultant',
                    email: 'lan.consulting@b2bgrowth.vn',
                    content: 'Pha này căng thật sự bạn ơi. Trước mình cũng dính một deal sản xuất tương tự, nếu đồng ý một lần là lần sau họ sẽ đòi tăng lên 15% ngay.',
                    date: 'Hôm nay'
                },
                {
                    author: 'Peter Võ (Mentor B2B)',
                    email: 'peter.vo@pvacademy.vn',
                    isAdmin: true,
                    adminPersona: 'peter',
                    content: 'Cái bẫy lớn nhất ở đây là nếu em thỏa hiệp một lần, họ sẽ nắm đằng chuôi và ép em cả đời. Nguy hiểm hơn, nếu phòng Kiểm toán hay Ban Giám Đốc bên đó phát hiện, em sẽ bị đưa vào blacklist cả thị trường.\n\nKinh nghiệm của anh: Tách rời bài toán "lợi ích cá nhân" sang "sự an toàn và vị thế nội bộ của họ". Hãy gặp riêng và chia sẻ chân thành rằng công ty em có kiểm toán độc lập nên không thể xuất hóa đơn chênh lệch, nhưng em có thể đề xuất Ban Giám Đốc phê duyệt: 1. Một gói đào tạo chuyển giao công nghệ cao cấp có cấp chứng chỉ cho toàn bộ team của anh ấy đứng tên; 2. Cam kết thưởng KPI nội bộ nếu tiến độ triển khai vượt chỉ tiêu.\n\nEm đã thăm dò xem vị Trưởng ban này đang chịu áp lực thành tích gì lớn nhất với Ban Giám Đốc của họ chưa?',
                    date: 'Hôm nay'
                },
                {
                    author: 'Hoang_EnterpriseSales',
                    email: 'hoang.sales@cloudhr.vn',
                    content: 'Cảm ơn anh Peter Võ nhiều lắm ạ! Chiêu biến lợi ích tiền mặt thành gói đào tạo có chứng chỉ giúp họ ghi điểm với Sếp tổng quá xuất sắc. Em sẽ hẹn cafe lại ngay để lái câu chuyện theo hướng này.',
                    date: 'Hôm nay'
                }
            ]
        },
        {
            id: 'post-5',
            category: 'story',
            title: 'Bị sếp cướp deal 2 tỷ ngay trước ngày ký hợp đồng: Bài học xương máu về bảo vệ pipeline cá nhân',
            content: 'Nuôi một deal cung cấp thiết bị tự động hóa suốt 5 tháng ròng, từ lúc khách chưa có nhu cầu đến khi lên proposal kỹ thuật và chốt giá. Đến đúng ngày sếp tổng bên khách hẹn ký hợp đồng, thì sếp trực tiếp của em bất ngờ bảo: "Deal này lớn và mang tính chiến lược của công ty, để anh đích thân đi cùng em và đứng tên ký chính". Kết quả sau đó là toàn bộ hoa hồng và công trạng của quý này rơi vào tay sếp, em chỉ được nhận một lời khen tượng trưng trong buổi họp tuần...',
            author: 'MaiChi_B2B',
            email: 'maichi.sales@iotvina.vn',
            date: 'Hôm qua',
            upvotes: 89,
            upvoted: false,
            comments: [
                {
                    author: 'Minh_Consultant',
                    email: 'minh.bd@kpiarchitect.com',
                    content: 'Chia buồn cùng bạn, đây là mặt tối của nghề mà rất nhiều bạn trẻ từng nếm trải. Lần sau hãy luôn lưu lại vết email trao đổi trực tiếp với khách và CC sếp tổng nếu cần thiết nhé.',
                    date: 'Hôm qua'
                },
                {
                    author: 'Cú BeeDee (Trợ Lý BD)',
                    email: 'bdtraining@bdbinhdanhocvu.com',
                    isAdmin: true,
                    adminPersona: 'beedee',
                    content: 'Úi giời ơi, đọc mà Cú thấy cay đắng thay cho bạn luôn! Nhưng nhớ kỹ lời Cú dặn nhé: Sếp có thể cướp được 1 hợp đồng trên giấy tờ, nhưng KHÔNG BAO GIỜ cướp được kỹ năng, sự tin cậy và mối quan hệ thực chất của khách hàng đối với bạn. Khách chọn giải pháp vì năng lực của bạn chứ không phải vì cái danh của sếp đâu.\n\nCú tặng nóng bạn +10 BD-Points uống ly trà sữa xả stress và lấy lại năng lượng nhé! Giữ vững mạng lưới khách ruột, tháng sau bung sức săn deal 5 tỷ cho sếp "hít khói" luôn! 🔥',
                    date: 'Hôm qua'
                }
            ]
        },
        {
            id: 'post-6',
            category: 'pic',
            title: '🎯 [BOUNTY 200⚡] Cần tìm PIC bộ phận Trade Marketing / Shopper Marketing tại Masan Consumer Miền Nam',
            content: 'Bên mình cung cấp giải pháp POSM kỹ thuật số thông minh tương tác tại điểm bán (Smart Shelf Display) đã chạy thử nghiệm rất hiệu quả tại chuỗi siêu thị. Đang cần kết nối với Trưởng phòng Trade Marketing hoặc Brand Activation Lead của Masan Consumer phụ trách ngành hàng Gia vị hoặc Nước giải khát để gửi đề án hợp tác cho mùa lễ hội cuối năm. Anh em nào có contact trực tiếp xin kết nối giúp mình, sẵn sàng chuyển ngay Bounty 200⚡ và mời cafe hậu tạ!',
            author: 'Vuong_TechRetail',
            email: 'vuong.le@retailsmart.io',
            date: 'July 16, 2026',
            bounty: 200,
            bountyClaimed: false,
            upvotes: 35,
            upvoted: false,
            comments: [
                {
                    author: 'Cú BeeDee (Trợ Lý BD)',
                    email: 'bdtraining@bdbinhdanhocvu.com',
                    isAdmin: true,
                    adminPersona: 'beedee',
                    content: 'Bounty 200⚡ thơm nức mũi thế này anh em Trade MKT đâu hết rồi bơi vào nhận thưởng ngay nào! 🔥 Mách nước cho bạn Vương: Đội Trade Marketing Masan hay ngồi chung tầng với khối Brand tại tòa nhà MPlaza Q1. Thử search trên LinkedIn chức danh "Shopper Marketing Manager - Masan" nhé!',
                    date: 'July 16, 2026'
                },
                {
                    author: 'Quoc_MediaAgency',
                    email: 'quoc.media@agencypoint.vn',
                    content: 'Mình có contact anh Hải phụ trách Trade khối Gia Vị bên Masan. Mình đã gửi tin nhắn riêng qua hệ thống chat nội bộ cho bạn rồi nhé.',
                    date: 'July 16, 2026'
                }
            ]
        },
        {
            id: 'post-7',
            category: 'qna',
            title: 'Khách hàng B2B so sánh giá bên mình đắt hơn đối thủ 30%, xử lý thế nào để không phải giảm giá?',
            content: 'Chào các tiền bối, công ty em làm trong mảng dịch vụ Logistics kho bãi lạnh. Sau buổi pitching, Giám đốc Chuỗi cung ứng bên khách gửi email feedback rằng: "Bên em dịch vụ tốt nhưng giá cước vận hành đang cao hơn bên đối thủ X khoảng 30%. Nếu bên em bằng giá họ thì anh ký ngay". Em biết chắc chắn nếu giảm 30% thì công ty sẽ hòa vốn hoặc lỗ, nhưng nếu không giảm thì mất deal lớn. Làm sao để thuyết phục khách mà không phải cắt máu giảm giá ạ?',
            author: 'Lan_Logistics',
            email: 'lan.logistic@coldchain.vn',
            date: 'July 15, 2026',
            upvotes: 54,
            upvoted: false,
            comments: [
                {
                    author: 'Peter Võ (Mentor B2B)',
                    email: 'peter.vo@pvacademy.vn',
                    isAdmin: true,
                    adminPersona: 'peter',
                    content: 'Đừng bao giờ vội vàng phân bua hay cắt máu giảm giá ngay em ạ. Khi khách hàng bảo "giá em đắt hơn bên X 30%", câu đầu tiên anh luôn hỏi lại một cách điềm đạm:\n\n"Dạ anh, em rất hiểu ngân sách là ưu tiên hàng đầu của doanh nghiệp. Cho em mạn phép hỏi là mức giá bên X đang chào là đã bao gồm cam kết đền bù rủi ro nhiệt độ 100% trong 2 giờ và hệ thống cảm biến theo dõi thời gian thực như giải pháp bên em chưa ạ? Vì nếu chỉ chênh lệch nhiệt độ 2 độ C trong 1 chuyến xe, lượng hàng hỏng có thể thiệt hại gấp 5 lần số tiền 30% giá cước tiết kiệm được".\n\nNhiệm vụ của em là kéo khách hàng từ bài toán "So sánh Chi Phí Mua (Purchase Cost)" sang "Tổng Chi Phí Rủi Ro Vận Hành (Total Cost of Ownership)". Em đã có con số ước tính thiệt hại nếu kho lạnh gặp sự cố chưa?',
                    date: 'July 15, 2026'
                },
                {
                    author: 'Lan_Logistics',
                    email: 'lan.logistic@coldchain.vn',
                    content: 'Thấu suốt luôn anh Peter ơi! Em sẽ làm ngay một bảng so sánh TCO (Total Cost of Ownership) và rủi ro đền bù hàng hỏng để trình bày lại với Giám đốc của họ.',
                    date: 'July 15, 2026'
                }
            ]
        },
        {
            id: 'post-1',
            category: 'pic',
            title: 'Cần xin contact PIC bộ phận Procurement (Thu mua) tại PNJ chi nhánh Miền Nam',
            content: 'Chào các bạn, em bên giải pháp bao bì cao cấp đang muốn tiếp cận phòng Thu mua của PNJ để chào thầu. Bạn nào đã từng làm việc bên này hoặc có email/số điện thoại sếp Procurement cho em xin kết nối với ạ. Em xin hậu tạ ly cafe!',
            author: 'BD_HaoNguyen',
            email: 'hao.nguyen@packagingsolutions.com',
            date: 'July 15, 2026',
            upvotes: 14,
            upvoted: false,
            comments: [
                {
                    author: 'Bob Growth',
                    email: 'bob.growth@gmail.com',
                    content: 'Bên PNJ bạn liên hệ chị Mai phòng Thu mua nhé. Email là mai.nt@pnj.com.vn. Hồi trước mình có chào giải pháp in ấn bên đó.',
                    date: 'July 15, 2026'
                },
                {
                    author: 'BD_HaoNguyen',
                    email: 'hao.nguyen@packagingsolutions.com',
                    content: 'Tuyệt vời quá bạn Bob ơi, để em gửi email chào sân ngay. Cảm ơn bạn nhiều!',
                    date: 'July 15, 2026'
                }
            ]
        },
        {
            id: 'post-2',
            category: 'qna',
            title: 'Sếp giao chỉ tiêu Pipeline X5 trong 2 tháng tới, bắt đầu từ đâu đây các bạn?',
            content: 'Tình hình là công ty SaaS vừa gọi vốn xong, sếp tổng yêu cầu đội BD phải nhân 5 lần lượng cơ hội (Pipeline) trong phễu để chuẩn bị cho chiến dịch quý tới. Em đang hơi ngợp không biết nên tập trung vào Cold outreach diện rộng hay nhờ quan hệ giới thiệu (Referral). Xin lời khuyên thực chiến từ các cao nhân!',
            author: 'SaasWarrior',
            email: '',
            date: 'July 14, 2026',
            upvotes: 28,
            upvoted: false,
            comments: [
                {
                    author: 'Peter Võ (Mentor B2B)',
                    email: 'peter.vo@pvacademy.vn',
                    isAdmin: true,
                    adminPersona: 'peter',
                    content: 'Pipeline X5 trong 2 tháng thì Cold Outreach diện rộng không đủ chuyển đổi kịp đâu em. Hãy tập trung 70% lực lượng vào: 1. Khai thác lại tệp Churn/Lost cũ. 2. Nhờ KH hiện tại giới thiệu (Referral) tặng incentive. 3. Tổ chức webinar mini chia sẻ insight. Chúc em chiến thắng!',
                    date: 'July 14, 2026'
                },
                {
                    author: 'SaasWarrior',
                    email: '',
                    content: 'Lời khuyên của thầy Peter chất quá, em sẽ lên plan triển khai hướng Referral trước!',
                    date: 'July 14, 2026'
                }
            ]
        },
        {
            id: 'post-8',
            category: 'story',
            title: 'Bí quyết "nuôi" deal B2B chu kỳ 9 tháng: Giữ khách "ấm" mà không bị biến thành kẻ làm phiền',
            content: 'Chia sẻ kinh nghiệm săn deal khối Ngân hàng: Từ lúc tiếp cận đến lúc ra thầu mất đúng 9 tháng. Nhiều bạn hay mắc lỗi là cách 2 tuần lại nhắn "Anh ơi dự án tiến triển tới đâu rồi", khiến khách ngán ngẩm không buồn trả lời. Mình áp dụng nguyên tắc: Mỗi lần xuất hiện là 1 lần tặng giá trị. Tháng 1 gửi Báo cáo xu hướng Fintech. Tháng 3 mời vé VIP dự Hội thảo An ninh mạng. Tháng 5 gửi case study giải quyết bài toán tải lớn... Đến tháng 8 khi họ mở thầu, mình là đơn vị duy nhất hiểu sâu bài toán của họ từ gốc rễ.',
            author: 'Dung_Fintech',
            email: 'dung.tran@securitycore.vn',
            date: 'July 13, 2026',
            upvotes: 77,
            upvoted: false,
            comments: [
                {
                    author: 'Peter Võ (Mentor B2B)',
                    email: 'peter.vo@pvacademy.vn',
                    isAdmin: true,
                    adminPersona: 'peter',
                    content: 'Bài đúc kết quá xuất sắc của Dũng! Đây chính là tinh thần "Giver Mentality" mà anh luôn nhấn mạnh trong lớp B2B BD Tips: "Nếu sự xuất hiện của em không mang lại một thông tin đắt giá nào mới cho khách, thì em đang đánh cắp thời gian của họ". Bền bỉ và tinh tế thế này thì không có deal nào mà không chốt được. Chúc mừng em!',
                    date: 'July 13, 2026'
                }
            ]
        },
        {
            id: 'post-9',
            category: 'pic',
            title: '🎯 [BOUNTY 150⚡] Cần kết nối Giám Đốc Nhân Sự (CHRO) khối Ngân Hàng TMCP quy mô >2000 nhân sự',
            content: 'Chào cả nhà, mình bên Edtech chuyên đào tạo kỹ năng lãnh đạo và quản trị số liệu cho khối Ngân hàng. Cần kết nối với CHRO hoặc Head of L&D (Đào tạo & Phát triển) tại các ngân hàng TMCP như Techcombank, VPBank, VIB hoặc TPBank. Bạn nào có network xin hỗ trợ kết nối, mình xin gửi tặng Bounty 150⚡ ngay khi nhận được contact hợp lệ!',
            author: 'Huong_HRTech',
            email: 'huong.le@edulead.vn',
            date: 'July 12, 2026',
            bounty: 150,
            bountyClaimed: false,
            upvotes: 29,
            upvoted: false,
            comments: [
                {
                    author: 'Cú BeeDee (Trợ Lý BD)',
                    email: 'bdtraining@bdbinhdanhocvu.com',
                    isAdmin: true,
                    adminPersona: 'beedee',
                    content: 'Kèo tìm Head of L&D khối Ngân hàng này rất tiềm năng! Các anh em mảng HR Tech hoặc Headhunter bơi vào hỗ trợ bạn Hương gắp Bounty 150⚡ nào! Cú đã cộng sẵn +10 BD-Points cho bạn Hương vì bài viết rất rõ ràng, chuẩn chỉ! 🦉',
                    date: 'July 12, 2026'
                }
            ]
        },
        {
            id: 'post-3',
            category: 'story',
            title: 'Pha \'lật kèo\' ngoạn mục từ bị Blacklist sang chốt hợp đồng $80k sau 3 tháng kiên trì',
            content: 'Chia sẻ với các bạn câu chuyện xương máu vừa rồi của em. Gặp khách hàng doanh nghiệp sản xuất, lúc đầu chào giải pháp quản lý ERP thì bị sếp bên đó gạt phắt đi, thậm chí bảo lễ tân chặn số em vì phiền. Thay vì bỏ cuộc, em chuyển sang viết bản tin tổng hợp xu hướng chuyển đổi số sản xuất gửi hàng tuần cho trợ lý sếp đọc...',
            author: 'ChuaTeChotDeal',
            email: 'dealmaster@salesforce.com',
            date: 'July 11, 2026',
            upvotes: 42,
            upvoted: false,
            comments: [
                {
                    author: 'An Nguyen',
                    email: 'an.nguyen@esoft.com',
                    content: 'Quá nể sự kiên trì của bạn. Đúng là BD thực chiến phải có tư duy bền bỉ như vậy!',
                    date: 'July 11, 2026'
                }
            ]
        }
    ];

    // Load posts from localStorage and synchronize new seeds intelligently
    function getPosts() {
        const raw = localStorage.getItem('bd_community_posts');
        if (!raw) {
            localStorage.setItem('bd_community_posts', JSON.stringify(defaultPosts));
            return defaultPosts;
        }
        let posts = [];
        try {
            posts = JSON.parse(raw);
        } catch(e) {
            posts = defaultPosts;
        }
        
        // Seed synchronization: merge new rich seed discussions if not present
        const existingIds = new Set(posts.map(p => p.id));
        let hasNewSeeds = false;
        defaultPosts.forEach(seed => {
            if (!existingIds.has(seed.id)) {
                posts.push(seed);
                hasNewSeeds = true;
            }
        });
        if (hasNewSeeds) {
            localStorage.setItem('bd_community_posts', JSON.stringify(posts));
        }
        return posts;
    }

    function savePosts(posts) {
        localStorage.setItem('bd_community_posts', JSON.stringify(posts));
    }

    // ==================================================================
    // ANTI-AI COMMUNITY AUTO-ENGAGEMENT ENGINE
    // Persona 1: Peter Võ (Mentor B2B) - Điềm đạm, micro-insight, hỏi vặn lại
    // Persona 2: Cú BeeDee (Trợ Lý BD) - Năng lượng, ngắn gọn 2-3 dòng, tặng điểm
    // ==================================================================
    function generateAuthenticAdminComment(post) {
        const title = (post.title || '').toLowerCase();
        const content = (post.content || '').toLowerCase();
        const text = title + ' ' + content;
        const cat = post.category;

        // 1. PIC Bounty requests -> Cú BeeDee enters
        if (cat === 'pic') {
            const isBounty = post.bounty && post.bounty > 0;
            return {
                author: 'Cú BeeDee (Trợ Lý BD)',
                email: 'bdtraining@bdbinhdanhocvu.com',
                isAdmin: true,
                adminPersona: 'beedee',
                bonusPoints: 10,
                date: 'Vừa xong',
                isPrivate: false,
                content: isBounty
                    ? `Kèo tìm PIC này thơm quá anh em ơi! Treo thưởng ${post.bounty}⚡ thế này thì ai có "tay trong" hoặc kết nối bên này bơi vào bắn tín hiệu gắp Bounty liền tay nào! 🔥\n\nMách nước thêm cho chủ thớt: Thử tìm kiếm trên LinkedIn theo cú pháp [Tên doanh nghiệp] + "Procurement" hoặc "Sourcing" rồi gửi lời mời kết nối kèm ghi chú 3 dòng chân thành, tỷ lệ rep tăng gấp 3 lần đấy nhé. Cú thưởng nóng bạn +10 BD-Points mở bát thảo luận!`
                    : `Cần kết nối bộ phận này thì bạn nên chuẩn bị sẵn 1 bản One-pager giới thiệu giải pháp thật súc tích nhé. Anh em ai có contact hợp lệ hỗ trợ bạn một tay nào! Cú BeeDee thưởng bạn +10 BD-Points khích lệ tinh thần chủ động tìm lead!`
            };
        }

        // 2. High-context keywords matching for Q&A or Strategy
        if (text.includes('báo giá') || text.includes('proposal') || text.includes('ghost') || text.includes('im lặng') || text.includes('không rep') || text.includes('không trả lời')) {
            return {
                author: 'Peter Võ (Mentor B2B)',
                email: 'peter.vo@pvacademy.vn',
                isAdmin: true,
                adminPersona: 'peter',
                date: 'Vừa xong',
                isPrivate: false,
                content: `Bị khách ghost sau khi gửi proposal là cái cảm giác cay nhất của anh em làm BD. Hồi mới vào nghề anh cũng từng gửi file PDF dài 30 trang rồi ngồi hy vọng.\n\nSau này vấp nhiều mới vỡ lẽ: 80% khách im lặng là đang cầm báo giá của mình đi ép giá bên cung cấp quen. Thay vì hỏi câu vô thưởng vô phạt như "Anh/chị xem file chưa ạ", em thử nhắn: "Em đoán tuần này anh bận ưu tiên dự án khác, liệu sáng thứ Ba tuần sau tụi mình có thể review nhanh 15 phút về các phương án tối ưu chi phí không anh?".\n\nLúc gửi proposal em có chốt trước một mốc thời gian cụ thể để hai bên cùng ngồi lại chưa, hay là chỉ gửi file qua email rồi đợi họ tự phản hồi?`
            };
        }

        if (text.includes('hoa hồng') || text.includes('kickback') || text.includes('tiêu cực') || text.includes('vòi') || text.includes('chiết khấu riêng') || text.includes('phần trăm')) {
            return {
                author: 'Peter Võ (Mentor B2B)',
                email: 'peter.vo@pvacademy.vn',
                isAdmin: true,
                adminPersona: 'peter',
                date: 'Vừa xong',
                isPrivate: false,
                content: `Cái bẫy lớn nhất ở đây là nếu em thỏa hiệp một lần, họ sẽ nắm đằng chuôi và ép em cả đời. Nguy hiểm hơn, nếu phòng Kiểm toán hay Ban Giám Đốc bên đó phát hiện, em sẽ bị đưa vào blacklist cả thị trường.\n\nKinh nghiệm của anh khi gặp PIC vòi vĩnh: Tuyệt đối không chi tiền túi hay giảm giá ngầm. Thay vào đó, hãy chuyển hóa bài toán "lợi ích cá nhân" sang "sự an toàn cho vị thế nội bộ của họ". Đề xuất gói đào tạo chuyển giao công nghệ có cấp chứng chỉ cho team họ đứng tên, hoặc cam kết SLA thưởng KPI nội bộ nếu dự án vượt tiến độ.\n\nEm đã thăm dò xem vị sếp này đang chịu áp lực thành tích gì lớn nhất với Ban Giám Đốc của họ chưa?`
            };
        }

        if (text.includes('kpi') || text.includes('pipeline') || text.includes('chỉ tiêu') || text.includes('doanh số') || text.includes('áp lực') || text.includes('target') || text.includes('gọi vốn')) {
            return {
                author: 'Peter Võ (Mentor B2B)',
                email: 'peter.vo@pvacademy.vn',
                isAdmin: true,
                adminPersona: 'peter',
                date: 'Vừa xong',
                isPrivate: false,
                content: `Áp lực chạy số thì ai từng làm BD cũng thấm thía đến mất ngủ. Nhưng càng áp lực thì càng không được lao đi rải cold email đại trà em ạ, vừa kiệt sức vừa nát tệp tiềm năng.\n\nChiêu thực chiến hiệu quả nhất lúc này: Rà lại toàn bộ danh sách deal "Lost" hoặc tạm dừng trong 6 tháng qua với lý do "chưa có ngân sách". Bước sang quý mới thường họ đã được duyệt lại budget hoặc có phát sinh nhu cầu mới. Tỷ lệ khơi lại deal cũ này luôn cao gấp 4 lần so với đi tìm khách hoàn toàn mới.\n\nHiện tại trong CRM hoặc file theo dõi của em đang có bao nhiêu deal "đóng băng" kiểu này?`
            };
        }

        if (text.includes('giá') || text.includes('đắt') || text.includes('đàm phán') || text.includes('giảm giá') || text.includes('ép giá') || text.includes('đối thủ')) {
            return {
                author: 'Peter Võ (Mentor B2B)',
                email: 'peter.vo@pvacademy.vn',
                isAdmin: true,
                adminPersona: 'peter',
                date: 'Vừa xong',
                isPrivate: false,
                content: `Khách vừa mở miệng chê đắt mà mình cuống cuồng xin sếp giảm giá ngay là tự biến mình thành "kẻ bán hàng chợ trời".\n\nNguyên tắc vàng của anh: Không bao giờ giảm giá mà không đòi lại một quyền lợi đối ứng (ví dụ: thanh toán trước 100%, hoặc thời hạn hợp đồng dài hơn, hoặc được phép làm case study PR). Đồng thời hãy hỏi thẳng một câu lật lại thế cờ: "Anh/chị đang so sánh giá này trên cùng một phạm vi bảo hành và cam kết SLA như bên em, hay chỉ là gói cơ bản của bên đối thủ ạ?".\n\nEm đã nắm rõ đối thủ chào những điều khoản nào trong hợp đồng của họ chưa?`
            };
        }

        if (text.includes('bảo vệ') || text.includes('lễ tân') || text.includes('tiếp cận') || text.includes('c-level') || text.includes('giám đốc') || text.includes('gatekeeper')) {
            return {
                author: 'Peter Võ (Mentor B2B)',
                email: 'peter.vo@pvacademy.vn',
                isAdmin: true,
                adminPersona: 'peter',
                date: 'Vừa xong',
                isPrivate: false,
                content: `Vượt qua "bức tường lửa" lễ tân và bảo vệ là bài kiểm tra độ nhạy của dân BD. Sai lầm phổ biến nhất là giới thiệu "Em là sales công ty A muốn gọi gặp sếp B để chào sản phẩm" — 100% ăn câu từ chối.\n\nHãy đổi vị thế sang một người mang giá trị: "Bên em vừa hoàn tất Báo cáo Xu hướng Ngành Quý này và được phân công gửi tận tay Giám đốc. Anh/chị cho em xin tên chính xác và email của sếp để bộ phận thư ký gửi sang đúng người nhé".\n\nEm đã tìm hiểu xem sếp bên đó hay xuất hiện ở những hội thảo ngành hoặc kênh LinkedIn nào chưa?`
            };
        }

        // 3. Story / Community sharing category
        if (cat === 'story') {
            const usePeter = Math.random() > 0.5;
            if (usePeter) {
                return {
                    author: 'Peter Võ (Mentor B2B)',
                    email: 'peter.vo@pvacademy.vn',
                    isAdmin: true,
                    adminPersona: 'peter',
                    date: 'Vừa xong',
                    isPrivate: false,
                    content: `Một câu chuyện rất đỗi chân thực và đáng quý. Làm BD mà chưa từng bị khách mắng, chưa từng bị ép giá hay mất deal vào phút 89 thì chưa thể tôi luyện thành một Deal Maker xuất sắc được.\n\nCái đáng giá nhất sau mỗi pha trầy vi tróc vảy này không phải là hoa hồng của một đơn hàng, mà là "bản lĩnh lì đòn" và sự thấu cảm tâm lý khách hàng mà không trường lớp nào dạy được. Sau trải nghiệm lần này, bài học đắt giá nhất em rút ra để trang bị cho những deal tiếp theo là gì?`
                };
            } else {
                return {
                    author: 'Cú BeeDee (Trợ Lý BD)',
                    email: 'bdtraining@bdbinhdanhocvu.com',
                    isAdmin: true,
                    adminPersona: 'beedee',
                    bonusPoints: 10,
                    date: 'Vừa xong',
                    isPrivate: false,
                    content: `Đọc câu chuyện của bạn mà Cú thấy đồng cảm sâu sắc! Nghề BD đúng là "làm dâu trăm họ", lúc chốt deal thì như người hùng, lúc đói số thì nuốt nước mắt một mình. Nhưng kiên trì gieo hạt thế này kiểu gì quả ngọt cũng tới.\n\nCú tặng nóng +10 BD-Points vào ví bạn uống trà sữa lấy lại năng lượng chiến tiếp nhé! Có anh em cộng đồng ở đây làm điểm tựa rồi, không sợ đơn độc đâu! 🔥`
                };
            }
        }

        // 4. Default Fallback for General BD topics
        return {
            author: 'Peter Võ (Mentor B2B)',
            email: 'peter.vo@pvacademy.vn',
            isAdmin: true,
            adminPersona: 'peter',
            date: 'Vừa xong',
            isPrivate: false,
            content: `Câu hỏi chạm đúng trăn trở của rất nhiều bạn khi bước vào giai đoạn tăng tốc B2B. Trong bán hàng doanh nghiệp, có 1 chân lý không bao giờ thay đổi: "Khách hàng không mua sản phẩm của em, họ mua sự an toàn cho chiếc ghế của họ".\n\nHãy tìm hiểu xem nỗi sợ lớn nhất và KPI cá nhân năm nay của người có quyền quyết định là gì. Khi giải quyết được nỗi sợ của họ, deal sẽ tự động chạy mượt mà. Hiện tại người em đang tiếp cận là người dùng cuối (End-user) hay người nắm ngân sách (Economic Buyer)?`
        };
    }

    // Schedule Admin auto-engagement with humanized delay (2-4 mins)
    function scheduleAdminEngagement(post) {
        if (!post || !post.id) return;
        const comment = generateAuthenticAdminComment(post);
        if (!comment) return;

        // Humanized delay: 120s - 240s. If test query is present, speed up to 5s.
        const isQuick = window.location.search.includes('quick_admin=true') || window.location.search.includes('test=true');
        const delayMs = isQuick ? 5000 : Math.floor(120000 + Math.random() * 120000);
        const scheduledAt = Date.now() + delayMs;

        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem('bd_scheduled_admin_replies') || '[]');
        } catch(e) { queue = []; }

        queue.push({
            postId: post.id,
            scheduledAt: scheduledAt,
            comment: comment,
            postTitle: post.title
        });

        localStorage.setItem('bd_scheduled_admin_replies', JSON.stringify(queue));
    }

    // Process scheduled replies ticker
    function processScheduledAdminReplies() {
        let queue = [];
        try {
            queue = JSON.parse(localStorage.getItem('bd_scheduled_admin_replies') || '[]');
        } catch(e) { return; }
        if (!queue || queue.length === 0) return;

        const now = Date.now();
        const remaining = [];
        let hasNewReplies = false;

        for (const item of queue) {
            if (now >= item.scheduledAt) {
                const allPosts = getPosts();
                const p = allPosts.find(x => x.id === item.postId);
                if (p) {
                    if (!p.comments) p.comments = [];
                    const alreadyExists = p.comments.some(c => c.author === item.comment.author && c.content === item.comment.content);
                    if (!alreadyExists) {
                        p.comments.push(item.comment);
                        savePosts(allPosts);
                        hasNewReplies = true;

                        // Notifications & Toasts
                        const isMentor = item.comment.author.includes('Peter Võ');
                        const notiText = isMentor
                            ? `👑 <b>Peter Võ (Mentor B2B)</b> đã gửi lời khuyên thực chiến tại bài viết: "<em>${(item.postTitle || p.title).substring(0, 30)}...</em>"`
                            : `🦉 <b>Cú BeeDee</b> đã tương tác và tặng bạn +10 BD-Points tại bài: "<em>${(item.postTitle || p.title).substring(0, 30)}...</em>"`;
                        addNotification(p.id, notiText);

                        triggerEmailToast(
                            localStorage.getItem('streak_email') || 'học viên',
                            `${item.comment.author} vừa phản hồi bài viết của bạn trên Cộng đồng BD!`
                        );

                        // Bonus points
                        if (item.comment.bonusPoints) {
                            const curBal = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
                            localStorage.setItem('b2b_points_balance', (curBal + item.comment.bonusPoints).toString());
                            if (window.updateNavbarUserHUD) window.updateNavbarUserHUD();
                            if (window.showPointToast) window.showPointToast(item.comment.bonusPoints, `Thưởng tương tác Cộng Đồng!`);
                        }
                    }
                }
            } else {
                remaining.push(item);
            }
        }

        localStorage.setItem('bd_scheduled_admin_replies', JSON.stringify(remaining));

        if (hasNewReplies) {
            if (postDetailContainer && !postDetailContainer.classList.contains('hidden')) {
                const currentOpenId = postDetailContainer.getAttribute('data-post-id');
                if (currentOpenId) showPostDetails(currentOpenId);
            } else {
                renderPosts();
            }
        }
    }

    // Process queued admin comments on startup and every 8 seconds
    processScheduledAdminReplies();
    setInterval(processScheduledAdminReplies, 8000);

    // Render Posts List
    function renderPosts() {
        const posts = getPosts();
        if (!postsContainer) return;
        postsContainer.innerHTML = '';

        // Filter and Search
        const filtered = posts.filter(post => {
            const matchesCat = currentCategory === 'all' || post.category === currentCategory;
            const matchesSearch = post.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                                  post.content.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            postsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light); background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color);">
                    📭 Không tìm thấy bài thảo luận nào phù hợp. Hãy là người đầu tiên đặt câu hỏi!
                </div>
            `;
            return;
        }

        filtered.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';
            
            const badgeClass = post.category === 'qna' ? 'badge-qna' : post.category === 'pic' ? 'badge-pic' : post.category === 'challenge' ? 'badge-challenge' : 'badge-story';
            const badgeLabel = post.category === 'qna' ? 'Hỏi Đáp' : post.category === 'pic' ? 'Tìm PIC' : post.category === 'challenge' ? 'Quyết Chiến' : 'Câu Chuyện';

            const verifiedBadgeHtml = post.email ? `<span class="verified-badge">✔ Verified BD</span>` : '';

            const bountyHtml = (post.bounty && post.bounty > 0) ? `<span class="post-bounty-badge">🎯 Thưởng ${post.bounty}⚡</span>` : '';

            let mediaHtml = `<div class="post-media-container-dynamic" id="media-container-${post.id}">`;
            if (post.mediaType === 'image' && post.mediaUrl && !post.mediaUrl.startsWith('data:') && !post.mediaUrl.startsWith('post-')) {
                mediaHtml += `
                    <div class="post-media-container" style="margin-top: 10px; border-radius: 8px; overflow: hidden; max-height: 250px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; background: #000;">
                        <img src="${post.mediaUrl}" style="max-width: 100%; max-height: 250px; object-fit: contain;">
                    </div>
                `;
            } else if (post.mediaType === 'video' && post.mediaUrl && !post.mediaUrl.startsWith('data:') && !post.mediaUrl.startsWith('post-')) {
                mediaHtml += `
                    <div class="post-media-container" style="margin-top: 10px; border-radius: 8px; overflow: hidden; max-height: 250px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; background: #000;">
                        <video src="${post.mediaUrl}" controls style="max-width: 100%; max-height: 250px; object-fit: contain;" onclick="event.stopPropagation();"></video>
                    </div>
                `;
            }
            mediaHtml += `</div>`;

            let userReactions = {};
            try {
                userReactions = JSON.parse(localStorage.getItem('bd_user_reactions') || '{}');
            } catch(e){}
            const activeReaction = userReactions[post.id];

            const emojis = [
                { type: 'love', char: '❤️' },
                { type: 'like', char: '👍' },
                { type: 'funny', char: '😂' },
                { type: 'support', char: '🤝' },
                { type: 'consider', char: '🤔' },
                { type: 'insight', char: '💡' }
            ];

            let reactionsHtml = `
                <div class="post-reactions-bar" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center;" onclick="event.stopPropagation();">
            `;
            
            emojis.forEach(emo => {
                const count = (post.reactions && post.reactions[emo.type]) || 0;
                const isActive = activeReaction === emo.type;
                reactionsHtml += `
                    <button class="reaction-btn ${isActive ? 'active' : ''}" data-type="${emo.type}" style="padding: 4px 8px; font-size: 0.8rem; border-radius: 20px; border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}; background: ${isActive ? 'rgba(162, 10, 10, 0.08)' : 'var(--card-bg)'}; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
                        <span>${emo.char}</span>
                        <span style="font-weight: bold;">${count}</span>
                    </button>
                `;
            });
            
            reactionsHtml += `
                <button class="reaction-btn share-post-btn" style="margin-left: auto; padding: 4px 10px; font-size: 0.8rem; border-radius: 20px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
                    <span>📤 Chia sẻ</span>
                </button>
            `;
            reactionsHtml += `</div>`;

            let challengeBoxHtml = '';
            if (post.isChallenge) {
                const challengeBeaten = localStorage.getItem(`challenge_beaten_${post.id}`) === 'true';
                if (challengeBeaten) {
                    challengeBoxHtml = `
                        <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px dashed #10b981; padding: 12px; border-radius: 12px; margin: 15px 0; text-align: center; font-size: 0.85rem; font-weight: bold; color: #10b981;">
                            🎉 ĐÃ CHIẾN THẮNG! Bạn đã vượt qua điểm số thách đấu này. (+50đ)
                        </div>
                    `;
                } else {
                    challengeBoxHtml = `
                        <div style="background: rgba(239, 68, 68, 0.05); border: 1.5px dashed #ef4444; padding: 16px; border-radius: 12px; margin: 15px 0; display: flex; flex-direction: column; gap: 10px; align-items: center; text-align: center;">
                            <div style="font-size: 0.8rem; font-weight: bold; color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">⚔️ ĐẤU TRƯỜNG PVP CHUYÊN GIA</div>
                            <div style="font-size: 0.85rem; color: var(--text-main); font-weight: bold;">Mục tiêu cần đạt: <strong style="color: #fbbf24; font-size: 1rem;">${post.challengeScore} điểm</strong></div>
                            <button onclick="event.stopPropagation(); acceptCommunityChallenge('${post.challengeGameId}', ${post.challengeScore}, '${post.author}', '${post.id}')" class="btn btn-primary" style="padding: 8px 24px; font-size: 0.82rem; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; background: #ef4444;">
                                ⚔️ Nhận Lời Quyết Chiến
                            </button>
                        </div>
                    `;
                }
            }

            const hasMentorReply = post.comments && post.comments.some(c => c.author && (c.author.includes('Peter Võ') || c.author.includes('Peter Vo')));
            const hasBeeDeeReply = post.comments && post.comments.some(c => c.author && (c.author.includes('Cú BeeDee') || c.author.includes('BeeDee')));
            let adminReplyBadge = '';
            if (hasMentorReply) {
                adminReplyBadge = `<span style="font-size: 0.72rem; color: #b45309; background: rgba(245, 158, 11, 0.15); padding: 2px 8px; border-radius: 12px; font-weight: 700; border: 1px solid #f59e0b; display: inline-flex; align-items: center; gap: 3px;">👑 Mentor đã phản hồi</span>`;
            } else if (hasBeeDeeReply) {
                adminReplyBadge = `<span style="font-size: 0.72rem; color: #059669; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 12px; font-weight: 700; border: 1px solid #10b981; display: inline-flex; align-items: center; gap: 3px;">🦉 Cú BeeDee đã tương tác</span>`;
            }

            card.innerHTML = `
                <div class="vote-box ${post.upvoted ? 'upvoted' : ''}" data-id="${post.id}">
                    <span class="vote-icon">▲</span>
                    <span class="vote-count">${post.upvotes}</span>
                </div>
                <div class="post-main-content" data-id="${post.id}">
                    <div class="post-header-row">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="post-badge ${badgeClass}">${badgeLabel}</span>
                            ${bountyHtml}
                            ${adminReplyBadge}
                        </div>
                        <span style="font-size: 0.8rem; color: var(--text-light);">${post.date}</span>
                    </div>
                    <h4 class="post-title">${post.title}</h4>
                    <p class="post-excerpt">${post.content.length > 160 ? post.content.substring(0, 160) + '...' : post.content}</p>
                    ${challengeBoxHtml}
                    ${mediaHtml}
                    ${reactionsHtml}
                        <span>Đăng bởi: <strong onclick="event.stopPropagation(); window.openDirectMessage('${post.author}')" style="cursor: pointer; color: var(--accent); text-decoration: underline;" title="Nhấp để Chat riêng với ${post.author}">${post.author} 💬</strong> ${verifiedBadgeHtml}</span>
                        <span>💬 ${post.comments.length} bình luận</span>
                    </div>
                </div>
            `;

            // Card Click to details
            card.querySelector('.post-main-content').addEventListener('click', (e) => {
                // Prevent click if we clicked reaction buttons
                if (e.target.closest('.reaction-btn')) return;
                showPostDetails(post.id);
            });

            // Upvote box click
            card.querySelector('.vote-box').addEventListener('click', (e) => {
                e.stopPropagation();
                handleUpvote(post.id);
            });

            // Reaction buttons click
            card.querySelectorAll('.reaction-btn[data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const type = btn.getAttribute('data-type');
                    handleReaction(post.id, type);
                });
            });

            // Share post click
            const shareBtn = card.querySelector('.share-post-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openPostShareMenu(post.id, post.title);
                });
            }

            postsContainer.appendChild(card);

            // Fetch and render IndexedDB media
            const mediaContainer = card.querySelector(`#media-container-${post.id}`);
            if (mediaContainer && post.mediaType && (post.mediaUrl === null || post.mediaUrl.startsWith('data:') || post.mediaUrl.startsWith('post-'))) {
                getPostMedia(post.id).then(mediaItems => {
                    if (mediaItems && mediaItems.length > 0) {
                        const photos = mediaItems.filter(m => m.type === 'image');
                        const videos = mediaItems.filter(m => m.type === 'video');
                        
                        let html = '';
                        if (photos.length > 0) {
                            const gridCols = photos.length === 1 ? '1fr' : photos.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)';
                            html += `<div style="display: grid; grid-template-columns: ${gridCols}; gap: 6px; margin-top: 10px;">`;
                            photos.forEach(p => {
                                html += `<img src="${p.data}" style="width: 100%; height: ${photos.length === 1 ? '200px' : '100px'}; object-fit: cover; border-radius: 8px; cursor: zoom-in;" onclick="window.openImageLightbox(event, '${p.data}')">`;
                            });
                            html += `</div>`;
                        }
                        if (videos.length > 0) {
                            videos.forEach(v => {
                                html += `
                                    <div style="margin-top: 10px; border-radius: 8px; overflow: hidden; max-height: 250px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; background: #000;">
                                        <video src="${v.data}" controls style="max-width: 100%; max-height: 250px; object-fit: contain;" onclick="event.stopPropagation();"></video>
                                    </div>
                                `;
                            });
                        }
                        mediaContainer.innerHTML = html;
                    }
                });
            }
        });
    }

    // Upvote Logic
    function handleUpvote(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            if (post.upvoted) {
                post.upvotes--;
                post.upvoted = false;
            } else {
                post.upvotes++;
                post.upvoted = true;
            }
            savePosts(posts);
            renderPosts();
            
            // If details view is open, sync details vote count
            const detailsVoteCount = document.getElementById('details-vote-count');
            const detailsVoteBox = document.getElementById('details-vote-box');
            if (detailsVoteCount && detailsVoteBox) {
                detailsVoteCount.textContent = post.upvotes;
                detailsVoteBox.classList.toggle('upvoted', post.upvoted);
            }
        }
    }

    function handleReaction(postId, type) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (!post.reactions) {
            post.reactions = { love: 0, like: 0, funny: 0, support: 0, consider: 0, insight: 0 };
        }

        let userReactions = {};
        try {
            userReactions = JSON.parse(localStorage.getItem('bd_user_reactions') || '{}');
        } catch(e){}

        const activeReaction = userReactions[postId];
        
        if (activeReaction === type) {
            post.reactions[type] = Math.max(0, (post.reactions[type] || 0) - 1);
            delete userReactions[postId];
        } else {
            if (activeReaction) {
                post.reactions[activeReaction] = Math.max(0, (post.reactions[activeReaction] || 0) - 1);
            }
            post.reactions[type] = (post.reactions[type] || 0) + 1;
            userReactions[postId] = type;
        }

        localStorage.setItem('bd_user_reactions', JSON.stringify(userReactions));
        savePosts(posts);
        renderPosts();
        
        if (postDetailContainer && !postDetailContainer.classList.contains('hidden')) {
            const detailId = postDetailContainer.getAttribute('data-post-id');
            if (detailId === postId) {
                renderPostDetailsReactions(post);
            }
        }

        // Natural engaging interaction: 35% chance a peer or Cú BeeDee reacts back within 8-15s
        if (activeReaction !== type && Math.random() < 0.35) {
            setTimeout(() => {
                const curPosts = getPosts();
                const p = curPosts.find(x => x.id === postId);
                if (p) {
                    if (!p.reactions) p.reactions = { love: 0, like: 0, funny: 0, support: 0, consider: 0, insight: 0 };
                    const peerTypes = ['insight', 'support', 'love'];
                    const picked = peerTypes[Math.floor(Math.random() * peerTypes.length)];
                    p.reactions[picked] = (p.reactions[picked] || 0) + 1;
                    savePosts(curPosts);
                    renderPosts();
                    if (postDetailContainer && !postDetailContainer.classList.contains('hidden')) {
                        const dId = postDetailContainer.getAttribute('data-post-id');
                        if (dId === postId) renderPostDetailsReactions(p);
                    }
                }
            }, Math.floor(8000 + Math.random() * 10000));
        }
    }

    function openPostShareMenu(postId, title) {
        const url = `${window.location.origin}${window.location.pathname}?post=${postId}`;
        if (window.openGlobalShareModal) {
            window.openGlobalShareModal(title, url);
        } else {
            navigator.clipboard.writeText(url);
            alert(`🔗 Đã sao chép liên kết bài đăng vào Clipboard!\n${url}`);
        }
    }

    function renderPostDetailsReactions(post) {
        const container = document.getElementById(`details-reactions-container-${post.id}`);
        if (!container) return;

        let userReactions = {};
        try {
            userReactions = JSON.parse(localStorage.getItem('bd_user_reactions') || '{}');
        } catch(e){}
        const activeReaction = userReactions[post.id];

        const emojis = [
            { type: 'love', char: '❤️' },
            { type: 'like', char: '👍' },
            { type: 'funny', char: '😂' },
            { type: 'support', char: '🤝' },
            { type: 'consider', char: '🤔' },
            { type: 'insight', char: '💡' }
        ];

        let html = `
            <div class="post-reactions-bar" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        `;
        
        emojis.forEach(emo => {
            const count = (post.reactions && post.reactions[emo.type]) || 0;
            const isActive = activeReaction === emo.type;
            html += `
                <button class="reaction-btn details-reaction-btn ${isActive ? 'active' : ''}" data-type="${emo.type}" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 20px; border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}; background: ${isActive ? 'rgba(162, 10, 10, 0.08)' : 'var(--card-bg)'}; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                    <span>${emo.char}</span>
                    <span style="font-weight: bold;">${count}</span>
                </button>
            `;
        });
        
        html += `
            <button class="reaction-btn details-share-post-btn" style="margin-left: auto; padding: 6px 14px; font-size: 0.85rem; border-radius: 20px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                <span>📤 Chia sẻ</span>
            </button>
        `;

        html += `</div>`;
        container.innerHTML = html;

        container.querySelectorAll('.details-reaction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = btn.getAttribute('data-type');
                handleReaction(post.id, type);
            });
        });

        const shareBtn = container.querySelector('.details-share-post-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openPostShareMenu(post.id, post.title);
            });
        }
    }

    // Bounty Quest Accept Handler
    window.handleAcceptBounty = function(postId, commentIndex, commentAuthor) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const comment = post.comments[commentIndex];
        if (!comment) return;

        post.bountyClaimed = true;
        post.bountyWinnerIndex = commentIndex;
        post.bountyWinnerName = commentAuthor;
        savePosts(posts);

        const bountyVal = post.bounty || 100;
        
        // If the winner is registered and has an email, sync it to the backend database
        if (comment.email) {
            fetch('/api/log-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'awardBounty',
                    email: comment.email,
                    points: bountyVal
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log('Bounty successfully awarded to helper via API:', data);
            })
            .catch(err => {
                console.error('Error forwarding bounty to API:', err);
            });

            // For testing: if the commenter is the current logged-in user in this browser, credit them locally
            const currentUserEmail = localStorage.getItem('streak_email');
            if (currentUserEmail && comment.email.toLowerCase() === currentUserEmail.toLowerCase()) {
                const balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
                const newBalance = balance + bountyVal;
                localStorage.setItem('b2b_points_balance', newBalance.toString());
                if (window.updateNavbarUserHUD) window.updateNavbarUserHUD();
                if (window.showPointToast) window.showPointToast(bountyVal, `Nhận Bounty ⚡ từ bài đăng!`);
            }
        }

        alert(`🏆 Đã chấp nhận thông tin PIC và thưởng ${bountyVal}⚡ cho ${commentAuthor}!`);
        showPostDetails(postId);
    };

    function maskContactInfo(text) {
        if (!text) return '';
        // Redact email addresses
        let masked = text.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, p1, p2) => {
            if (p1.length > 2) {
                return p1.substring(0, 2) + '***@' + p2;
            }
            return '***@' + p2;
        });
        // Redact phone numbers
        masked = masked.replace(/(0[35789]\d{8}|\+84[35789]\d{8})/g, (match) => {
            return match.substring(0, 3) + '*****' + match.substring(match.length - 2);
        });
        return masked;
    }

    // Detail view
    function showPostDetails(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        postsListContainer.classList.add('hidden');
        postDetailContainer.classList.remove('hidden');
        postDetailContainer.setAttribute('data-post-id', post.id);

        // Trigger action-based streak increase
        if (window.registerUserAction) {
            window.registerUserAction('library_read');
        }

        const badgeClass = post.category === 'qna' ? 'badge-qna' : post.category === 'pic' ? 'badge-pic' : 'badge-story';
        const badgeLabel = post.category === 'qna' ? 'Hỏi Đáp' : post.category === 'pic' ? 'Tìm PIC' : 'Câu Chuyện';
        const verifiedBadgeHtml = post.email ? `<span class="verified-badge">✔ Verified BD</span>` : '';
        const bountyBld = (post.bounty && post.bounty > 0) ? `<span class="post-bounty-badge">🎯 Thưởng ${post.bounty}⚡</span>` : '';

        // Check if the current user owns this post
        const currentUserEmail = localStorage.getItem('streak_email');
        const isPostOwner = post.email && currentUserEmail && post.email.toLowerCase() === currentUserEmail.toLowerCase();

        // Comments HTML list mapping
        const commentsListHtml = post.comments.map((c, index) => {
            const comVerified = c.email ? `<span class="verified-badge">✔ Verified BD</span>` : '';
            
            // Winner badge if bounty claimed
            const isWinner = post.bountyClaimed && post.bountyWinnerIndex === index;
            const winnerBadge = isWinner ? `<span class="verified-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981;">🏆 Hợp lệ & Đã Nhận ${post.bounty}⚡</span>` : '';

            // Accept button for owner
            let acceptBtnHtml = '';
            if (isPostOwner && post.bounty > 0 && !post.bountyClaimed) {
                acceptBtnHtml = `<button class="btn-accept-bounty" data-idx="${index}" data-author="${c.author}" style="padding: 6px 12px; font-weight: bold; border-radius: 6px; font-size: 0.75rem; border: none; cursor: pointer; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); transition: all 0.2s;">🏆 Nhận Contact & Tặng Thưởng</button>`;
            }

            // Security masking rules for PIC connections:
            // Check if viewer is comment author or post owner
            const isCommentAuthor = c.email && currentUserEmail && c.email.toLowerCase() === currentUserEmail.toLowerCase();
            const canViewFullContact = isPostOwner || isCommentAuthor;

            let displayContent = c.content;
            let secureBadgeHtml = '';

            if (c.isPrivate) {
                if (canViewFullContact) {
                    displayContent = c.content;
                    secureBadgeHtml = `<span class="verified-badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444;">🔒 Nội dung bảo mật (Chỉ bạn và chủ post thấy)</span>`;
                } else {
                    displayContent = `[🔒 Nội dung chứa thông tin PIC bảo mật. Chỉ chủ bài viết mới có quyền xem]`;
                }
            } else if (post.category === 'pic') {
                // If it is PIC request but not explicitly private, we still automatically mask phone/email for safety from guests
                if (!canViewFullContact) {
                    displayContent = maskContactInfo(c.content);
                }
            }

            const commentClass = (c.isPrivate && !canViewFullContact) ? 'style="font-style: italic; color: var(--text-light);"' : '';

            // Admin Persona detection & badge styling
            let adminBadgeHtml = '';
            let cardCustomClass = '';
            let avatarHtml = '';

            if (c.isAdmin || c.author.includes('Peter Võ') || c.author.includes('Peter Vo')) {
                cardCustomClass = 'admin-comment-card admin-comment-peter';
                adminBadgeHtml = `<span class="admin-badge-peter">👑 Mentor B2B</span>`;
                avatarHtml = `<img src="https://www.bdbinhdanhocvu.com/mascot_quests.jpg" style="width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #f59e0b; object-fit: cover; vertical-align: middle; margin-right: 6px;">`;
            } else if (c.isAdmin || c.author.includes('Cú BeeDee') || c.author.includes('BeeDee')) {
                cardCustomClass = 'admin-comment-card admin-comment-beedee';
                adminBadgeHtml = `<span class="admin-badge-beedee">🦉 Trợ Lý BD</span>`;
                avatarHtml = `<img src="bd_mascot.png" style="width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #10b981; object-fit: cover; vertical-align: middle; margin-right: 6px;">`;
            }

            return `
                <div class="comment-card ${cardCustomClass}" style="display: flex; flex-direction: column; gap: 6px; position: relative;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-light); margin-bottom: 4px;">
                        <span style="display: inline-flex; align-items: center; gap: 6px;">
                            ${avatarHtml}
                            <strong onclick="window.openDirectMessage('${c.author}')" style="cursor: pointer; color: var(--accent); text-decoration: underline;" title="Nhấp để Chat riêng với ${c.author}">${c.author} 💬</strong> ${adminBadgeHtml || comVerified} ${winnerBadge} ${secureBadgeHtml}
                        </span>
                        <span>${c.date || 'Gần đây'}</span>
                    </div>
                    <p ${commentClass} style="margin: 0; font-size: 0.95rem; color: var(--text-main); line-height: 1.6; white-space: pre-line; padding-right: 20px;">${displayContent}</p>
                    <div style="display: flex; justify-content: flex-end; margin-top: 5px;">
                        ${acceptBtnHtml}
                    </div>
                </div>
            `;
        }).join('');

        let mediaHtml = `<div class="post-media-container-dynamic" id="details-media-container-${post.id}">`;
        if (post.mediaType === 'image' && post.mediaUrl && !post.mediaUrl.startsWith('data:') && !post.mediaUrl.startsWith('post-')) {
            mediaHtml += `
                <div class="post-media-container" style="margin-top: 15px; border-radius: 12px; overflow: hidden; max-height: 400px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; background: #000;">
                    <img src="${post.mediaUrl}" style="max-width: 100%; max-height: 400px; object-fit: contain;">
                </div>
            `;
        } else if (post.mediaType === 'video' && post.mediaUrl && !post.mediaUrl.startsWith('data:') && !post.mediaUrl.startsWith('post-')) {
            mediaHtml += `
                <div class="post-media-container" style="margin-top: 15px; border-radius: 12px; overflow: hidden; max-height: 400px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; background: #000;">
                    <video src="${post.mediaUrl}" controls style="max-width: 100%; max-height: 400px; object-fit: contain;"></video>
                </div>
            `;
        }
        mediaHtml += `</div>`;

        // Dynamic Detail Fill
        document.getElementById('post-detail-content').innerHTML = `
            <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px;">
                <div class="vote-box ${post.upvoted ? 'upvoted' : ''}" id="details-vote-box" style="margin: 0;">
                    <span class="vote-icon">▲</span>
                    <span class="vote-count" id="details-vote-count">${post.upvotes}</span>
                </div>
                <div style="flex: 1;">
                    <div class="post-header-row" style="margin-bottom: 10px;">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="post-badge ${badgeClass}">${badgeLabel}</span>
                            ${bountyBld}
                        </div>
                        <span style="font-size: 0.85rem; color: var(--text-light);">${post.date}</span>
                    </div>
                    <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 15px;">${post.title}</h2>
                    <p style="font-size: 1.05rem; color: var(--text-main); line-height: 1.6; white-space: pre-line;">${post.content}</p>
                    ${mediaHtml}
                    <div id="details-reactions-container-${post.id}"></div>
                    <div style="margin-top: 20px; font-size: 0.85rem; color: var(--text-light);">
                        Đăng bởi: <strong onclick="window.openDirectMessage('${post.author}')" style="cursor: pointer; color: var(--accent); text-decoration: underline;" title="Nhấp để Chat riêng với ${post.author}">${post.author} 💬</strong> ${verifiedBadgeHtml}
                    </div>
                </div>
            </div>
            
            <div class="comments-section">
                <h4 style="font-weight: 800; border-bottom: 2px solid var(--primary); padding-bottom: 8px; margin-bottom: 15px; color: var(--text-main);">
                    💬 THẢO LUẬN (${post.comments.length})
                </h4>
                <div id="comments-list">
                    ${commentsListHtml || '<div style="text-align: center; padding: 20px; color: var(--text-light);">Chưa có thảo luận nào. Hãy gửi phản hồi của bạn dưới đây!</div>'}
                </div>

                <!-- Add Comment Form -->
                <form id="commentForm" style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); padding: 20px; border-radius: 12px;">
                    <h5 style="margin: 0; font-weight: 700; color: var(--text-main);">Gửi câu trả lời / Hỗ trợ:</h5>
                    <textarea id="comContent" rows="3" placeholder="Viết bình luận hoặc thông tin hỗ trợ..." required style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); font-family: inherit;"></textarea>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="comAnonymous" style="width: auto; cursor: pointer;">
                            <label for="comAnonymous" style="margin: 0; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--text-main);">🕵️ Bình luận ẩn danh (Bảo mật danh tính BD)</label>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="comPrivate" style="width: auto; cursor: pointer;">
                            <label for="comPrivate" style="margin: 0; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--text-main);">🔒 Chứa thông tin PIC bảo mật (Chỉ chủ bài viết mới được xem)</label>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" style="align-self: flex-end; padding: 8px 24px; border: none; font-weight: bold;">Gửi Bình Luận</button>
                </form>
            </div>
        `;

        renderPostDetailsReactions(post);

        // Fetch and render IndexedDB media for details view
        const detailsMediaContainer = document.getElementById(`details-media-container-${post.id}`);
        if (detailsMediaContainer && post.mediaType && (post.mediaUrl === null || post.mediaUrl.startsWith('data:') || post.mediaUrl.startsWith('post-'))) {
            getPostMedia(post.id).then(mediaItems => {
                if (mediaItems && mediaItems.length > 0) {
                    const photos = mediaItems.filter(m => m.type === 'image');
                    const videos = mediaItems.filter(m => m.type === 'video');
                    
                    let html = '';
                    if (photos.length > 0) {
                        const gridCols = photos.length === 1 ? '1fr' : photos.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)';
                        html += `<div style="display: grid; grid-template-columns: ${gridCols}; gap: 8px; margin-top: 15px;">`;
                        photos.forEach(p => {
                            html += `<img src="${p.data}" style="width: 100%; height: ${photos.length === 1 ? '350px' : '150px'}; object-fit: cover; border-radius: 12px; cursor: zoom-in;" onclick="window.openImageLightbox(event, '${p.data}')">`;
                        });
                        html += `</div>`;
                    }
                    if (videos.length > 0) {
                        videos.forEach(v => {
                            html += `
                                <div style="margin-top: 15px; border-radius: 12px; overflow: hidden; max-height: 400px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; background: #000;">
                                    <video src="${v.data}" controls style="max-width: 100%; max-height: 400px; object-fit: contain;"></video>
                                </div>
                            `;
                        });
                    }
                    detailsMediaContainer.innerHTML = html;
                }
            });
        }

        // Bind upvote in details
        document.getElementById('details-vote-box').addEventListener('click', () => {
            handleUpvote(post.id);
        });

        // Bind Accept Bounty button triggers
        const acceptButtons = document.querySelectorAll('.btn-accept-bounty');
        acceptButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const auth = btn.getAttribute('data-author');
                window.handleAcceptBounty(post.id, idx, auth);
            });
        });

        // Comment Submit Handler
        const commentForm = document.getElementById('commentForm');
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Auto detect from localStorage profile, fallback to guest if unregistered
            let authorName = localStorage.getItem('streak_name');
            let emailValue = localStorage.getItem('streak_email');
            
            if (!authorName) {
                authorName = 'Thành viên mới';
            }
            if (!emailValue) {
                emailValue = 'guest@b2bbd.com';
            }
            
            const content = document.getElementById('comContent').value;
            const comAnonymous = document.getElementById('comAnonymous').checked;
            let comPrivate = document.getElementById('comPrivate').checked;

            if (post.category === 'pic') {
                comPrivate = true;
            }

            if (comAnonymous) {
                authorName = '🕵️ BD_Ẩn_Danh_' + Math.floor(100 + Math.random() * 900);
                emailValue = '';
            }

            const newComment = {
                author: authorName,
                email: emailValue,
                content: content,
                isPrivate: comPrivate,
                date: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
            };

            // Save comment
            const allPosts = getPosts();
            const pIndex = allPosts.findIndex(p => p.id === postId);
            if (pIndex !== -1) {
                const targetPost = allPosts[pIndex];
                targetPost.comments.push(newComment);
                savePosts(allPosts);
                
                // Log email if provided
                if (emailValue) {
                    fetch('/api/log-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: emailValue, source: 'community-comment' })
                    }).catch(console.error);
                }

                // SIMULATE NOTIFICATION alerts & logs
                const myEmail = localStorage.getItem('streak_email');
                const myName = localStorage.getItem('streak_name');
                const isAuthorEmailMatch = myEmail && targetPost.email && targetPost.email.toLowerCase() === myEmail.toLowerCase();
                const isAuthorNameMatch = (myName && targetPost.author === myName) || (!myName && targetPost.author === 'Thành viên mới');

                if (isAuthorEmailMatch) {
                    // Send mock email alert to author (since they registered their email)
                    triggerEmailToast(
                        targetPost.email,
                        `Bạn có bình luận mới từ ${authorName} tại bài viết: "${targetPost.title.substring(0, 30)}..."`
                    );
                } else if (isAuthorNameMatch) {
                    // Unregistered post author -> display inside the bell icon
                    addNotification(
                        targetPost.id,
                        `<b>${authorName}</b> đã trả lời bài viết của bạn: "<em>${targetPost.title.substring(0, 25)}...</em>"`
                    );
                }

                showPostDetails(postId); // Refresh view
            }

            // Trigger action-based streak increase
            if (window.registerUserAction) {
                window.registerUserAction('forum_comment');
            }
            if (window.trackUserBehavior) {
                window.trackUserBehavior('community_comment', `Post: ${postId}`);
            }
        });
    }

    // Back to list button
    if (btnBackToList) {
        btnBackToList.addEventListener('click', () => {
            postDetailContainer.classList.add('hidden');
            postsListContainer.classList.remove('hidden');
            renderPosts();
        });
    }

    // Category Tabs click
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.getAttribute('data-category');
            
            // Automatically switch back to list view if detail is open
            postDetailContainer.classList.add('hidden');
            postsListContainer.classList.remove('hidden');

            renderPosts();
        });
    });

    // Search Input listener
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value;
            
            postDetailContainer.classList.add('hidden');
            postsListContainer.classList.remove('hidden');

            renderPosts();
        });
    }

    // Rich Social Media Composer Handle
    const btnAttachPhoto = document.getElementById('btnAttachPhoto');
    const btnAttachVideo = document.getElementById('btnAttachVideo');
    const mediaPhotoInput = document.getElementById('mediaPhotoInput');
    const mediaVideoInput = document.getElementById('mediaVideoInput');
    const composerMediaPreview = document.getElementById('composerMediaPreview');
    const composerCategory = document.getElementById('composerCategory');
    const composerBountyGroup = document.getElementById('composerBountyGroup');
    const composerAuthorDisplay = document.getElementById('composer-author-display');
    const composerGuestInputs = document.getElementById('composer-guest-inputs');

    // Show/hide Bounty group based on Category
    if (composerCategory && composerBountyGroup) {
        composerCategory.addEventListener('change', () => {
            if (composerCategory.value === 'pic') {
                composerBountyGroup.classList.remove('hidden');
            } else {
                composerBountyGroup.classList.add('hidden');
            }
        });
    }

    // Quick Emoji Insert listeners
    const composerContent = document.getElementById('composerContent');
    document.querySelectorAll('.btn-emoji-insert').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji');
            if (!composerContent) return;

            const startPos = composerContent.selectionStart;
            const endPos = composerContent.selectionEnd;
            const text = composerContent.value;
            
            composerContent.value = text.substring(0, startPos) + emoji + text.substring(endPos);
            
            composerContent.focus();
            composerContent.selectionStart = startPos + emoji.length;
            composerContent.selectionEnd = startPos + emoji.length;
        });
    });

    function updateMediaPreviewGrid() {
        let grid = document.getElementById('mediaPreviewGrid');
        let counter = document.getElementById('mediaUploadCounter');
        if (!grid || !counter) return;

        grid.innerHTML = '';
        
        const photosCount = attachedFiles.filter(f => f.type === 'image').length;
        const videosCount = attachedFiles.filter(f => f.type === 'video').length;
        counter.textContent = `Đã chọn: ${photosCount} ảnh (tối đa 10), ${videosCount} video (tối đa 1)`;

        if (attachedFiles.length > 0) {
            composerMediaPreview.classList.remove('hidden');
        } else {
            composerMediaPreview.classList.add('hidden');
        }

        attachedFiles.forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '70px';
            wrapper.style.height = '70px';
            wrapper.style.borderRadius = '8px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.border = '1px solid var(--border-color)';
            wrapper.style.background = '#000';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';

            if (item.type === 'image') {
                wrapper.innerHTML = `<img src="${item.previewUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else {
                wrapper.innerHTML = `<span style="font-size: 1.5rem;">🎥</span>`;
            }

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '&times;';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '2px';
            removeBtn.style.right = '2px';
            removeBtn.style.width = '16px';
            removeBtn.style.height = '16px';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.background = 'rgba(0,0,0,0.6)';
            removeBtn.style.color = '#fff';
            removeBtn.style.border = 'none';
            removeBtn.style.display = 'flex';
            removeBtn.style.alignItems = 'center';
            removeBtn.style.justifyContent = 'center';
            removeBtn.style.fontSize = '12px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.fontWeight = 'bold';

            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                URL.revokeObjectURL(item.previewUrl);
                attachedFiles.splice(index, 1);
                updateMediaPreviewGrid();
            });

            wrapper.appendChild(removeBtn);
            grid.appendChild(wrapper);
        });
    }

    // Attach Photo Trigger
    if (btnAttachPhoto && mediaPhotoInput) {
        btnAttachPhoto.addEventListener('click', () => {
            mediaPhotoInput.click();
        });
        mediaPhotoInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            const currentPhotosCount = attachedFiles.filter(f => f.type === 'image').length;
            if (currentPhotosCount + files.length > 10) {
                alert('⚠️ Bạn chỉ được đăng tối đa 10 hình ảnh!');
                return;
            }
            
            for (let file of files) {
                if (file.size > 1.5 * 1024 * 1024) {
                    alert(`⚠️ Ảnh "${file.name}" vượt quá dung lượng 1.5MB! Để hệ thống hoạt động ổn định lâu dài, vui lòng chọn ảnh nhẹ hơn.`);
                    continue;
                }
                const previewUrl = URL.createObjectURL(file);
                const base64 = await readFileAsBase64(file);
                attachedFiles.push({
                    type: 'image',
                    previewUrl,
                    base64
                });
            }
            updateMediaPreviewGrid();
        });
    }

    // Attach Video Trigger
    if (btnAttachVideo && mediaVideoInput) {
        btnAttachVideo.addEventListener('click', () => {
            mediaVideoInput.click();
        });
        mediaVideoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const currentVideosCount = attachedFiles.filter(f => f.type === 'video').length;
                if (currentVideosCount >= 1) {
                    alert('⚠️ Bạn chỉ được đăng tối đa 1 video mỗi bài đăng!');
                    return;
                }
                if (file.size > 10 * 1024 * 1024) {
                    alert('⚠️ Dung lượng video vượt quá 10MB! Vui lòng chọn video ngắn và nhẹ hơn để đảm bảo khả năng tải trang tốt nhất.');
                    return;
                }
                const previewUrl = URL.createObjectURL(file);
                const base64 = await readFileAsBase64(file);
                attachedFiles.push({
                    type: 'video',
                    previewUrl,
                    base64
                });
            }
            updateMediaPreviewGrid();
        });
    }

    // Open Composer Modal
    if (btnCreatePost) {
        btnCreatePost.addEventListener('click', () => {
            const proceedOpen = () => {
                const registeredName = localStorage.getItem('streak_name');
                composerAuthorDisplay.textContent = registeredName || 'Thành viên mới';
                
                // Update dynamic composer avatar
                const composerAvatarContainer = document.getElementById('composer-author-avatar-container');
                if (composerAvatarContainer) {
                    const customAvatar = localStorage.getItem('b2b_custom_avatar');
                    if (customAvatar) {
                        composerAvatarContainer.innerHTML = `<img src="${customAvatar}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--primary);">`;
                    } else {
                        composerAvatarContainer.innerHTML = `<div class="beedee-owl-mascot" style="font-size: 1.8rem; background: rgba(243, 168, 59, 0.1); width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid var(--primary);">🦉</div>`;
                    }
                }
                
                createPostModal.classList.add('active');
            };

            if (window.showSubtleProfileModal && !localStorage.getItem('profile_industry')) {
                window.showSubtleProfileModal({
                    title: '🦉 Kết nối đúng tệp đối tác',
                    subtitle: 'Chào bạn! Để Cú BeeDee phân loại và gợi ý các bài thảo luận/kết nối đối tác phù hợp nhất với lĩnh vực của bạn, vui lòng chọn ngành bạn đang làm nhé:',
                    options: [
                        'Công nghệ',
                        'Giáo dục/ Edtech',
                        'Marketing/Digital',
                        'Thương mại điện tử',
                        'Logistics',
                        'FMCG/ Retail',
                        'Tài chính/Bảo hiểm',
                        'HR Service/ HRtech',
                        'Khác'
                    ],
                    fieldName: 'industry',
                    callback: proceedOpen
                });
            } else {
                proceedOpen();
            }
        });
    }

    function closeModal() {
        if (createPostModal) {
            createPostModal.classList.remove('active');
            attachedFiles.forEach(f => {
                if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
            });
            attachedFiles = [];
            
            if (mediaPhotoInput) mediaPhotoInput.value = '';
            if (mediaVideoInput) mediaVideoInput.value = '';
            if (composerMediaPreview) {
                const grid = document.getElementById('mediaPreviewGrid');
                if (grid) grid.innerHTML = '';
                composerMediaPreview.classList.add('hidden');
            }
            const form = document.getElementById('socialComposerForm');
            if (form) form.reset();
            if (composerBountyGroup) composerBountyGroup.classList.add('hidden');
        }
    }
    window.closeModal = closeModal;

    // Social Composer Form Submit
    const socialComposerForm = document.getElementById('socialComposerForm');
    if (socialComposerForm) {
        socialComposerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const category = document.getElementById('composerCategory').value;
            const content = document.getElementById('composerContent').value;
            
            let authorName = localStorage.getItem('streak_name');
            let emailValue = localStorage.getItem('streak_email');

            if (!authorName) {
                authorName = 'Thành viên mới';
            }
            if (!emailValue) {
                emailValue = 'guest@b2bbd.com';
            }

            let title = content.split('\n')[0].trim() || 'Thảo luận mới';
            if (title.length > 80) {
                title = title.substring(0, 80) + '...';
            }

            let bountyValue = 0;
            if (category === 'pic') {
                bountyValue = parseInt(document.getElementById('composerBounty').value || '0', 10);
                if (bountyValue < 100) {
                    alert('⚠️ Theo quy định mới, yêu cầu kết nối PIC phải treo thưởng tối thiểu từ 100đ ⚡ trở lên!');
                    return;
                }
                const balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
                if (balance < bountyValue) {
                    alert(`⚠️ Số dư BD-Points ⚡ của bạn hiện tại (${balance}đ) không đủ để treo thưởng ${bountyValue}đ!`);
                    return;
                }
                const newBalance = balance - bountyValue;
                localStorage.setItem('b2b_points_balance', newBalance.toString());
                
                if (window.updateNavbarUserHUD) window.updateNavbarUserHUD();
                if (window.showPointToast) window.showPointToast(-bountyValue, `Đã khấu trừ treo thưởng Bounty!`);
            }

            let type = null;
            let firstUrl = null;
            const hasImages = attachedFiles.some(f => f.type === 'image');
            const hasVideos = attachedFiles.some(f => f.type === 'video');
            if (hasImages && hasVideos) {
                type = 'mixed';
                firstUrl = attachedFiles[0].base64;
            } else if (hasImages) {
                type = 'image';
                firstUrl = attachedFiles[0].base64;
            } else if (hasVideos) {
                type = 'video';
                firstUrl = attachedFiles[0].base64;
            }

            const newPost = {
                id: 'post-' + Date.now(),
                category: category,
                title: title,
                content: content,
                author: authorName || 'Thành viên mới',
                email: emailValue || '',
                bounty: bountyValue,
                bountyClaimed: false,
                mediaType: type,
                mediaUrl: firstUrl,
                date: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
                upvotes: 1,
                upvoted: true,
                comments: [],
                reactions: { love: 0, like: 0, funny: 0, support: 0, consider: 0, insight: 0 }
            };

            if (attachedFiles.length > 0) {
                const mediaToSave = attachedFiles.map(f => ({ type: f.type, data: f.base64 }));
                savePostMedia(newPost.id, mediaToSave);
            }

            const posts = getPosts();
            posts.unshift(newPost);
            savePosts(posts);

            // Schedule authentic Admin anti-AI response with humanized delay
            try {
                scheduleAdminEngagement(newPost);
            } catch(schedErr) {
                console.warn('Error scheduling admin engagement:', schedErr);
            }

            try {
                let seenIds = JSON.parse(localStorage.getItem('bd_seen_post_ids') || '[]');
                seenIds.push(newPost.id);
                localStorage.setItem('bd_seen_post_ids', JSON.stringify(seenIds));
            } catch (e) { console.error(e); }

            if (emailValue) {
                fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailValue, source: 'composer-create-post' })
                }).catch(console.error);
            }

            closeModal();
            renderPosts();

            if (window.registerUserAction) {
                window.registerUserAction('forum_post');
            }
            if (window.trackUserBehavior) {
                window.trackUserBehavior('community_post', category);
            }
        });
    }

    // --- Funny Nickname Generator ---
    function generateFunnyNickname() {
        const adjectives = ['Chiến thần', 'Chúa tể', 'Sát thủ', 'Kẻ bám đuổi', 'Đại sứ', 'Vua', 'Kẻ hủy diệt', 'Thợ săn', 'Chuyên gia'];
        const nouns = ['Săn lead', 'Chốt deal', 'Bị ghost', 'Pipeline', 'Cold call', 'Strategic', 'Trà sữa', 'KPI', 'Commission'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(100 + Math.random() * 900);
        return `${adj} ${noun} #${number}`;
    }

    // Ensure user has at least a funny nickname saved
    let initialRegName = localStorage.getItem('streak_name');
    let initialRegEmail = localStorage.getItem('streak_email');
    if (!initialRegName) {
        initialRegName = generateFunnyNickname();
        localStorage.setItem('streak_name', initialRegName);
    }

    // --- B2B Profile Card & Edit Profile Modal Logic ---
    const profileCardAvatar = document.getElementById('profile-card-avatar');
    const profileCardName = document.getElementById('profile-card-name');
    const profileCardStatus = document.getElementById('profile-card-status');
    const btnEditProfile = document.getElementById('btn-edit-profile');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const profileEditForm = document.getElementById('profileEditForm');
    const btnUploadAvatar = document.getElementById('btnUploadAvatar');
    const profileAvatarInput = document.getElementById('profileAvatarInput');
    const profileModalAvatarPreview = document.getElementById('profileModalAvatarPreview');
    const profileNameInput = document.getElementById('profileNameInput');
    const profileEmailInput = document.getElementById('profileEmailInput');

    function updateProfileCard() {
        const name = localStorage.getItem('streak_name') || 'Thành viên mới';
        const email = localStorage.getItem('streak_email');
        const customAvatar = localStorage.getItem('b2b_custom_avatar');

        if (profileCardName) profileCardName.textContent = name;
        
        if (profileCardStatus) {
            if (email) {
                profileCardStatus.textContent = 'Thành Viên B2B';
                profileCardStatus.style.background = 'rgba(16, 185, 129, 0.15)';
                profileCardStatus.style.color = '#10b981';
                profileCardStatus.style.border = '1px solid #10b981';
            } else {
                profileCardStatus.textContent = 'Khách Vãng Lai';
                profileCardStatus.style.background = 'rgba(148, 163, 184, 0.15)';
                profileCardStatus.style.color = '#94a3b8';
                profileCardStatus.style.border = '1px solid #94a3b8';
            }
        }

        if (profileCardAvatar) {
            profileCardAvatar.src = customAvatar || 'bd_mascot.png';
        }
        if (profileModalAvatarPreview) {
            profileModalAvatarPreview.src = customAvatar || 'bd_mascot.png';
        }
        
        // Update dynamic composer avatar
        const composerAvatarContainer = document.getElementById('composer-author-avatar-container');
        if (composerAvatarContainer) {
            if (customAvatar) {
                composerAvatarContainer.innerHTML = `<img src="${customAvatar}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--primary);">`;
            } else {
                composerAvatarContainer.innerHTML = `<div class="beedee-owl-mascot" style="font-size: 1.8rem; background: rgba(243, 168, 59, 0.1); width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid var(--primary);">🦉</div>`;
            }
        }
    }

    // Bind Edit Profile Button
    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', () => {
            const name = localStorage.getItem('streak_name') || '';
            const email = localStorage.getItem('streak_email') || '';
            
            if (profileNameInput) profileNameInput.value = name;
            if (profileEmailInput) profileEmailInput.value = email;
            
            updateProfileCard();
            if (editProfileModal) editProfileModal.classList.add('active');
        });
    }

    window.closeProfileModal = function() {
        if (editProfileModal) editProfileModal.classList.remove('active');
    };

    // Bind Avatar Upload Button
    if (btnUploadAvatar && profileAvatarInput) {
        btnUploadAvatar.addEventListener('click', () => {
            profileAvatarInput.click();
        });
    }

    if (profileAvatarInput) {
        profileAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Str = event.target.result;
                    localStorage.setItem('b2b_custom_avatar', base64Str);
                    updateProfileCard();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Profile Edit Form Submit
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = profileNameInput.value.trim();
            const newEmail = profileEmailInput.value.trim();

            if (newEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(newEmail)) {
                    alert('Vui lòng nhập địa chỉ email hợp lệ!');
                    return;
                }
            }

            const oldEmail = localStorage.getItem('streak_email');
            
            localStorage.setItem('streak_name', newName);
            if (newEmail) {
                localStorage.setItem('streak_email', newEmail);
                localStorage.setItem('streak_active', 'true');
                
                // If registering for the first time
                if (!oldEmail) {
                    const balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
                    localStorage.setItem('b2b_points_balance', (balance + 25).toString());
                    
                    if (window.updateNavbarUserHUD) window.updateNavbarUserHUD();
                    if (window.showPointToast) window.showPointToast(25, 'Profile kích hoạt thành công!');
                    
                    fetch('/api/log-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: newEmail, source: 'community-profile-register' })
                    }).catch(console.error);

                    alert(`🎉 Kích hoạt B2B Profile thành công! Tặng bạn 25đ ⚡.`);
                }
            } else {
                localStorage.removeItem('streak_email');
                localStorage.removeItem('streak_active');
            }

            updateProfileCard();
            closeProfileModal();
        });
    }

    // --- New Post Notification Check (Non-intrusive) ---
    function checkNewPostsNotifications() {
        const posts = getPosts();
        const currentUserEmail = localStorage.getItem('streak_email');
        const seenIdsStr = localStorage.getItem('bd_seen_post_ids');
        let seenIds = seenIdsStr ? JSON.parse(seenIdsStr) : [];
        
        // If it's the very first visit, mark all existing posts as seen to avoid flood
        if (!seenIdsStr) {
            seenIds = posts.map(p => p.id);
            localStorage.setItem('bd_seen_post_ids', JSON.stringify(seenIds));
            return;
        }

        let newNotiAdded = false;
        posts.forEach(post => {
            if (!seenIds.includes(post.id)) {
                // If not created by the current user, trigger notification
                const isMyPost = post.email && currentUserEmail && post.email.toLowerCase() === currentUserEmail.toLowerCase();
                if (!isMyPost) {
                    if (currentUserEmail) {
                        // User has registered email -> Send email notification toast
                        triggerEmailToast(
                            currentUserEmail,
                            `Chủ đề mới từ ${post.author}: "${post.title.substring(0, 30)}..."`
                        );
                    } else {
                        // Unregistered/guest user -> Display inside the bell icon
                        addNotification(post.id, `🔥 <b>${post.author}</b> vừa đăng chủ đề mới: <i>"${post.title}"</i>`);
                    }
                    newNotiAdded = true;
                }
                seenIds.push(post.id);
            }
        });

        if (newNotiAdded) {
            localStorage.setItem('bd_seen_post_ids', JSON.stringify(seenIds));
        }
    }

    // Initialize
    updateProfileCard();
    checkNewPostsNotifications();
    updateNotiBadge();
    renderPosts();

    // Auto-open post detail if post query parameter is present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const postParam = urlParams.get('post');
    if (postParam) {
        // Wait a small delay to make sure the posts list is rendered in the DOM
        setTimeout(() => {
            showPostDetails(postParam);
        }, 150);
    }

    // --- COMMUNITY CHALLENGE SYSTEM HELPER ---
    window.acceptCommunityChallenge = function(gameId, score, author, postId) {
        sessionStorage.setItem('pvp_active', 'true');
        sessionStorage.setItem('pvp_challenger', author);
        sessionStorage.setItem('pvp_mascot', 'Chuyên Gia BD');
        sessionStorage.setItem('pvp_score_to_beat', score.toString());
        sessionStorage.setItem('pvp_game_id', gameId);
        sessionStorage.setItem('pvp_post_id', postId);
        
        alert(`⚔️ NHẬN THÁCH ĐẤU TỪ CỘNG ĐỒNG!\n\nHệ thống sẽ đưa bạn tới Minigame "${gameId === 'puzzle-negotiation' ? 'Đàm phán B2B' : gameId === 'puzzle-kpi' ? 'KPI Master' : 'Luật Lao Động'}". Vượt qua mốc ${score} điểm của ${author} để nhận +50 BD-Points nhé!`);
        window.location.href = `index.html?challenge=true&challenger=${encodeURIComponent(author)}&mascot=Expert&score=${score}&gameId=${gameId}&postId=${postId}`;
    };

    // Inject styles for badge-challenge
    const style = document.createElement('style');
    style.innerHTML = `
        .badge-challenge {
            background: rgba(239, 68, 68, 0.15) !important;
            color: #ef4444 !important;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
        }
    `;
    document.head.appendChild(style);
});
