// B2B BD Community Forum Logic

document.addEventListener('DOMContentLoaded', () => {
    let currentCategory = 'all';
    let currentSearch = '';

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

    // Default preloaded posts if localstorage is empty
    const defaultPosts = [
        {
            id: 'post-1',
            category: 'pic',
            title: 'Cần xin contact PIC bộ phận Procurement (Thu mua) tại PNJ chi nhánh Miền Nam',
            content: 'Chào các bác, em bên giải pháp bao bì cao cấp đang muốn tiếp cận phòng Thu mua của PNJ để chào thầu. Bác nào đã từng làm việc bên này hoặc có email/số điện thoại sếp Procurement cho em xin kết nối với ạ. Em xin hậu tạ ly cafe!',
            author: 'BD_HaoNguyen',
            email: 'hao.nguyen@packagingsolutions.com',
            date: 'July 16, 2026',
            upvotes: 14,
            upvoted: false,
            comments: [
                {
                    author: 'Bob Growth',
                    email: 'bob.growth@gmail.com',
                    content: 'Bên PNJ bạn liên hệ chị Mai phòng Thu mua nhé. Email là mai.nt@pnj.com.vn. Hồi trước mình có chào giải pháp in ấn bên đó.',
                    date: 'July 16, 2026'
                },
                {
                    author: 'BD_HaoNguyen',
                    email: 'hao.nguyen@packagingsolutions.com',
                    content: 'Tuyệt vời quá bác Bob ơi, để em gửi email chào sân ngay. Cảm ơn bác nhiều!',
                    date: 'July 16, 2026'
                }
            ]
        },
        {
            id: 'post-2',
            category: 'qna',
            title: 'Sếp giao chỉ tiêu Pipeline X5 trong 2 tháng tới, bắt đầu từ đâu đây các bác?',
            content: 'Tình hình là công ty SaaS vừa gọi vốn xong, sếp tổng yêu cầu đội BD phải nhân 5 lần lượng cơ hội (Pipeline) trong phễu để chuẩn bị cho chiến dịch quý tới. Em đang hơi ngợp không biết nên tập trung vào Cold outreach diện rộng hay nhờ quan hệ giới thiệu (Referral). Xin lời khuyên thực chiến từ các cao nhân!',
            author: 'SaasWarrior',
            email: '',
            date: 'July 15, 2026',
            upvotes: 28,
            upvoted: false,
            comments: [
                {
                    author: 'Peter Vo',
                    email: 'peter.vo@pvacademy.vn',
                    content: 'Pipeline X5 trong 2 tháng thì Cold Outreach diện rộng không đủ chuyển đổi kịp đâu em. Hãy tập trung 70% lực lượng vào: 1. Khai thác lại tệp Churn/Lost cũ. 2. Nhờ KH hiện tại giới thiệu (Referral) tặng incentive. 3. Tổ chức webinar mini chia sẻ insight. Chúc em chiến thắng!',
                    date: 'July 15, 2026'
                },
                {
                    author: 'SaasWarrior',
                    email: '',
                    content: 'Lời khuyên của thầy Peter chất quá, em sẽ lên plan triển khai hướng Referral trước!',
                    date: 'July 15, 2026'
                }
            ]
        },
        {
            id: 'post-3',
            category: 'story',
            title: 'Pha \'lật kèo\' ngoạn mục từ bị Blacklist sang chốt hợp đồng $80k sau 3 tháng kiên trì',
            content: 'Chia sẻ với các bác câu chuyện xương máu vừa rồi của em. Gặp khách hàng doanh nghiệp sản xuất, lúc đầu chào giải pháp quản lý ERP thì bị sếp bên đó gạt phắt đi, thậm chí bảo lễ tân chặn số em vì phiền. Thay vì bỏ cuộc, em chuyển sang viết bản tin tổng hợp xu hướng chuyển đổi số sản xuất gửi hàng tuần cho trợ lý sếp đọc...',
            author: 'ChuaTeChotDeal',
            email: 'dealmaster@salesforce.com',
            date: 'July 14, 2026',
            upvotes: 42,
            upvoted: false,
            comments: [
                {
                    author: 'An Nguyen',
                    email: 'an.nguyen@esoft.com',
                    content: 'Quá nể sự kiên trì của bác. Đúng là BD thực chiến phải có tư duy bền bỉ như vậy!',
                    date: 'July 14, 2026'
                }
            ]
        }
    ];

    // Load posts from localStorage or initialize with defaults
    function getPosts() {
        const posts = localStorage.getItem('bd_community_posts');
        if (!posts) {
            localStorage.setItem('bd_community_posts', JSON.stringify(defaultPosts));
            return defaultPosts;
        }
        return JSON.parse(posts);
    }

    function savePosts(posts) {
        localStorage.setItem('bd_community_posts', JSON.stringify(posts));
    }

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
            
            const badgeClass = post.category === 'qna' ? 'badge-qna' : post.category === 'pic' ? 'badge-pic' : 'badge-story';
            const badgeLabel = post.category === 'qna' ? 'Hỏi Đáp' : post.category === 'pic' ? 'Tìm PIC' : 'Câu Chuyện';

            const verifiedBadgeHtml = post.email ? `<span class="verified-badge">✔ Verified BD</span>` : '';

            card.innerHTML = `
                <div class="vote-box ${post.upvoted ? 'upvoted' : ''}" data-id="${post.id}">
                    <span class="vote-icon">▲</span>
                    <span class="vote-count">${post.upvotes}</span>
                </div>
                <div class="post-main-content" data-id="${post.id}">
                    <div class="post-header-row">
                        <span class="post-badge ${badgeClass}">${badgeLabel}</span>
                        <span style="font-size: 0.8rem; color: var(--text-light);">${post.date}</span>
                    </div>
                    <h4 class="post-title">${post.title}</h4>
                    <p class="post-excerpt">${post.content.length > 160 ? post.content.substring(0, 160) + '...' : post.content}</p>
                    <div class="post-footer-row">
                        <span>Đăng bởi: <strong>${post.author}</strong> ${verifiedBadgeHtml}</span>
                        <span>💬 ${post.comments.length} bình luận</span>
                    </div>
                </div>
            `;

            // Card Click to details
            card.querySelector('.post-main-content').addEventListener('click', () => {
                showPostDetails(post.id);
            });

            // Upvote box click
            card.querySelector('.vote-box').addEventListener('click', (e) => {
                e.stopPropagation();
                handleUpvote(post.id);
            });

            postsContainer.appendChild(card);
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

    // Detail view
    function showPostDetails(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        postsListContainer.classList.add('hidden');
        postDetailContainer.classList.remove('hidden');

        // Trigger action-based streak increase
        if (window.registerUserAction) {
            window.registerUserAction('library_read');
        }

        const badgeClass = post.category === 'qna' ? 'badge-qna' : post.category === 'pic' ? 'badge-pic' : 'badge-story';
        const badgeLabel = post.category === 'qna' ? 'Hỏi Đáp' : post.category === 'pic' ? 'Tìm PIC' : 'Câu Chuyện';
        const verifiedBadgeHtml = post.email ? `<span class="verified-badge">✔ Verified BD</span>` : '';

        // Dynamic Detail Fill
        document.getElementById('post-detail-content').innerHTML = `
            <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px;">
                <div class="vote-box ${post.upvoted ? 'upvoted' : ''}" id="details-vote-box" style="margin: 0;">
                    <span class="vote-icon">▲</span>
                    <span class="vote-count" id="details-vote-count">${post.upvotes}</span>
                </div>
                <div style="flex: 1;">
                    <div class="post-header-row" style="margin-bottom: 10px;">
                        <span class="post-badge ${badgeClass}">${badgeLabel}</span>
                        <span style="font-size: 0.85rem; color: var(--text-light);">${post.date}</span>
                    </div>
                    <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 15px;">${post.title}</h2>
                    <p style="font-size: 1.05rem; color: var(--text-main); line-height: 1.6; white-space: pre-line;">${post.content}</p>
                    <div style="margin-top: 20px; font-size: 0.85rem; color: var(--text-light);">
                        Đăng bởi: <strong>${post.author}</strong> ${verifiedBadgeHtml}
                    </div>
                </div>
            </div>
            
            <div class="comments-section">
                <h4 style="font-weight: 800; border-bottom: 2px solid var(--primary); padding-bottom: 8px; margin-bottom: 15px; color: var(--text-main);">
                    💬 THẢO LUẬN (${post.comments.length})
                </h4>
                <div id="comments-list">
                    ${post.comments.map(c => {
                        const comVerified = c.email ? `<span class="verified-badge">✔ Verified BD</span>` : '';
                        return `
                            <div class="comment-card">
                                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-light); margin-bottom: 4px;">
                                    <span><strong>${c.author}</strong> ${comVerified}</span>
                                    <span>${c.date || 'Gần đây'}</span>
                                </div>
                                <p style="margin: 0; font-size: 0.95rem; color: var(--text-main); line-height: 1.5; white-space: pre-line;">${c.content}</p>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Add Comment Form -->
                <form id="commentForm" style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); padding: 20px; border-radius: 12px;">
                    <h5 style="margin: 0; font-weight: 700; color: var(--text-main);">Gửi câu trả lời / Hỗ trợ:</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <input type="text" id="comAuthor" placeholder="Biệt danh (ví dụ: BD_SaaS)" required style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
                        <input type="email" id="comEmail" placeholder="Email B2B (để nhận badge Verified)" style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
                    </div>
                    <textarea id="comContent" rows="3" placeholder="Viết bình luận hoặc thông tin hỗ trợ..." required style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); font-family: inherit;"></textarea>
                    <button type="submit" class="btn btn-primary" style="align-self: flex-end; padding: 8px 24px; border: none; font-weight: bold;">Gửi Bình Luận</button>
                </form>
            </div>
        `;

        // Bind upvote in details
        document.getElementById('details-vote-box').addEventListener('click', () => {
            handleUpvote(post.id);
        });

        // Comment Submit Handler
        const commentForm = document.getElementById('commentForm');
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const comAuthor = document.getElementById('comAuthor').value;
            const comEmail = document.getElementById('comEmail').value;
            const comContent = document.getElementById('comContent').value;

            const newComment = {
                author: comAuthor,
                email: comEmail,
                content: comContent,
                date: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
            };

            // Save comment
            const allPosts = getPosts();
            const pIndex = allPosts.findIndex(p => p.id === postId);
            if (pIndex !== -1) {
                allPosts[pIndex].comments.push(newComment);
                savePosts(allPosts);
                
                // Log email if provided
                if (comEmail) {
                    fetch('/api/log-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: comEmail, source: 'community-comment' })
                    }).catch(console.error);
                }

                showPostDetails(postId); // Refresh view
            }

            // Trigger action-based streak increase
            if (window.registerUserAction) {
                window.registerUserAction('forum_comment');
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

    // Create Post Modal Handle
    if (btnCreatePost) {
        btnCreatePost.addEventListener('click', () => {
            createPostModal.classList.add('active');
        });
    }

    window.closeModal = function() {
        if (createPostModal) createPostModal.classList.remove('active');
    };

    if (createPostForm) {
        createPostForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('postCat').value;
            const title = document.getElementById('postTitle').value;
            const author = document.getElementById('postAuthor').value;
            const email = document.getElementById('postEmail').value;
            const content = document.getElementById('postContent').value;

            const newPost = {
                id: 'post-' + Date.now(),
                category: category,
                title: title,
                content: content,
                author: author,
                email: email,
                date: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
                upvotes: 1,
                upvoted: true, // Auto upvote by creator
                comments: []
            };

            const posts = getPosts();
            posts.unshift(newPost);
            savePosts(posts);

            // Log email if provided
            if (email) {
                fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, source: 'community-create-post' })
                }).catch(console.error);
            }

            closeModal();
            createPostForm.reset();
            renderPosts();

            // Trigger action-based streak increase
            if (window.registerUserAction) {
                window.registerUserAction('forum_post');
            }
        });
    }

    // Initialize
    renderPosts();
});
