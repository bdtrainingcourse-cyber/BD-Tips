document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const articlesContainer = document.getElementById('articles-container');
    const searchInput = document.getElementById('library-search');
    const categoryTabsContainer = document.getElementById('category-tabs');
    
    // Reader Modal Elements
    const readerModal = document.getElementById('reader-modal');
    const modalCloseBtn = document.getElementById('reader-close-btn');
    const btnReaderClose = document.getElementById('btn-reader-close');
    const readerCategory = document.getElementById('reader-category');
    const readerDate = document.getElementById('reader-date');
    const readerTitle = document.getElementById('reader-title');
    const readerAuthor = document.getElementById('reader-author');
    const readerContentBody = document.getElementById('reader-content-body');
    const readerLinkedinLink = document.getElementById('reader-linkedin-link');

    // Download Modal Elements
    const downloadModal = document.getElementById('download-modal');
    const downloadCloseBtn = document.getElementById('download-close-btn');
    const downloadEbookTitle = document.getElementById('download-ebook-title');
    const downloadForm = document.getElementById('download-form');
    const regFirstName = document.getElementById('reg-first-name');
    const regEmail = document.getElementById('reg-email');
    const regExperience = document.getElementById('reg-experience');

    // Limit / Retention Modal Elements
    const limitModal = document.getElementById('limit-modal');
    const limitCloseBtn = document.getElementById('limit-close-btn');
    const btnLimitClose = document.getElementById('btn-limit-close');
    const btnUnlockGame = document.getElementById('btn-unlock-game');
    const btnUnlockCommunity = document.getElementById('btn-unlock-community');

    // State
    let articles = [];
    let ebooks = [];
    let currentSelectedEbook = null;
    let activeCategory = 'Ebooks';
    let searchQuery = '';

    // --- Daily Download Limit & Retention Helpers ---
    function getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    function getTodayDownloads() {
        const key = `b2b_dl_count_${getTodayKey()}`;
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    function incrementTodayDownloads() {
        const key = `b2b_dl_count_${getTodayKey()}`;
        const current = getTodayDownloads();
        localStorage.setItem(key, (current + 1).toString());
    }

    function getTodayBonusCredits() {
        const key = `b2b_bonus_credits_${getTodayKey()}`;
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    function addBonusCredit() {
        const key = `b2b_bonus_credits_${getTodayKey()}`;
        const current = getTodayBonusCredits();
        localStorage.setItem(key, (current + 1).toString());
    }

    // --- Live Ebook Download Counter Helpers ---
    function getEbookDownloadCount(ebook) {
        const storageKey = `b2b_ebook_cnt_${ebook.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            return parseInt(saved, 10);
        }
        return ebook.downloads || 1200;
    }

    function incrementEbookDownloadCount(ebookId) {
        const storageKey = `b2b_ebook_cnt_${ebookId}`;
        const ebookObj = ebooks.find(e => e.id === ebookId);
        const current = ebookObj ? getEbookDownloadCount(ebookObj) : 1200;
        const updated = current + 1;
        localStorage.setItem(storageKey, updated.toString());
        
        // Update UI element real-time if visible
        const counterEl = document.getElementById(`dl-counter-${ebookId}`);
        if (counterEl) {
            counterEl.textContent = `🔥 ${updated.toLocaleString('vi-VN')} Lượt Tải`;
            counterEl.style.transform = 'scale(1.2)';
            counterEl.style.color = '#f3a83b';
            setTimeout(() => {
                counterEl.style.transform = 'scale(1)';
                counterEl.style.color = 'var(--text-muted)';
            }, 600);
        }
    }

    // Fetch articles and ebooks from library_data.json
    async function loadArticles() {
        try {
            const response = await fetch('/library_data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch library data');
            }
            const data = await response.json();
            articles = data.articles || [];
            ebooks = data.ebooks || [];
            renderArticles();
        } catch (error) {
            console.error('Error loading library:', error);
            articlesContainer.innerHTML = `<div class="glass-panel" style="grid-column: 1/-1; text-align: center; color: #ef4444;">Không thể tải dữ liệu thư viện. Vui lòng thử lại sau.</div>`;
        }
    }

    // Helper to render markdown-like content to HTML
    function renderMarkdown(content) {
        if (!content) return '';
        
        let html = content;
        
        // Escape HTML
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Lists
        html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`);

        // Paragraphs
        html = html.split(/\n\n+/).map(p => {
            if (p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<table') || p.trim().startsWith('<ul>')) {
                return p;
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('');

        return html;
    }

    // Open reading modal
    function openReader(article) {
        readerCategory.textContent = article.category || 'BD Article';
        readerDate.textContent = article.date;
        readerTitle.textContent = article.title;
        readerAuthor.textContent = article.author;
        readerContentBody.innerHTML = renderMarkdown(article.content);
        
        const newsletterUrl = "https://www.linkedin.com/newsletters/bd-b2b-b%C3%ACnh-d%C3%A2n-h%E1%BB%8Dc-v%E1%BB%A5-7254739965526360064/";
        readerLinkedinLink.href = article.linkedinUrl || newsletterUrl;
        readerLinkedinLink.textContent = "Đọc Trên LinkedIn Newsletter ➔";
        
        readerModal.classList.remove('hidden');
    }

    function closeReader() {
        readerModal.classList.add('hidden');
    }

    // Social Share Handler
    function shareEbook(platform, ebook) {
        const shareUrl = window.location.href;
        const title = ebook.title;
        const text = `Tôi vừa đọc cuốn cẩm nang "${title}" của Peter Vo trên B2B BD Tips Portal! Kiến thức Business Development thực chiến rất sắc bén.`;

        if (platform === 'linkedin') {
            const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            window.open(url, '_blank', 'width=600,height=600');
        } else if (platform === 'facebook') {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
            window.open(url, '_blank', 'width=600,height=600');
        } else if (platform === 'tiktok') {
            navigator.clipboard.writeText(`${text}\n🔗 Link: ${shareUrl}`);
            showToast('🎵 Đã sao chép nội dung chia sẻ TikTok vào Clipboard! Hãy dán vào bài đăng TikTok của bạn.');
            setTimeout(() => {
                window.open('https://www.tiktok.com', '_blank');
            }, 1200);
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(`${title} - ${shareUrl}`);
            showToast('🔗 Đã sao chép liên kết chia sẻ!');
        }
    }

    // Render cards to container
    function renderArticles() {
        articlesContainer.innerHTML = '';
        
        if (activeCategory === 'Ebooks' || activeCategory === 'All') {
            const filteredEbooks = ebooks.filter(e => {
                const matchesSearch = e.title.toLowerCase().includes(searchQuery) || 
                                      e.description.toLowerCase().includes(searchQuery);
                return matchesSearch;
            });

            if (filteredEbooks.length === 0) {
                articlesContainer.innerHTML = `<div class="glass-panel" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Không tìm thấy ebook nào phù hợp.</div>`;
                return;
            }

            filteredEbooks.forEach(ebook => {
                const card = document.createElement('div');
                card.className = 'glass-panel article-card ebook-card';
                card.style.cursor = 'pointer';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'space-between';
                card.style.transition = 'all 0.3s ease';
                
                const liveCount = getEbookDownloadCount(ebook);
                const coverHtml = ebook.coverImage ? `
                    <div class="ebook-cover-frame">
                        <img src="${ebook.coverImage}" alt="${ebook.title}" class="ebook-cover-img" loading="lazy">
                        <span class="ebook-cover-badge-overlay">${ebook.badge || 'PDF Ebook'}</span>
                    </div>
                ` : `<div style="font-size: 2.2rem; margin-bottom: 10px;">${ebook.icon || '📚'}</div>`;

                card.innerHTML = `
                    <div>
                        ${coverHtml}
                        <div class="card-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span class="category-badge" style="background: rgba(162, 10, 10, 0.15); border: 1px solid var(--primary); color: var(--primary); padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">PDF Ebook</span>
                            <span id="dl-counter-${ebook.id}" class="article-date-text" style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); transition: all 0.3s ease;">🔥 ${liveCount.toLocaleString('vi-VN')} Lượt Tải</span>
                        </div>
                        <h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 8px; color: var(--text-main); font-weight: 700;">${ebook.title}</h3>
                        <p class="card-desc" style="font-size: 0.9rem; color: var(--text-light); line-height: 1.5; margin-bottom: 15px;">${ebook.description}</p>
                    </div>
                    
                    <div>
                        <!-- Social Share Bar -->
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 6px 12px; margin-bottom: 12px;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Chia sẻ:</span>
                            <div style="display: flex; gap: 8px;">
                                <button class="share-btn share-linkedin" title="Chia sẻ qua LinkedIn" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">💼</button>
                                <button class="share-btn share-facebook" title="Chia sẻ qua Facebook" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">📘</button>
                                <button class="share-btn share-tiktok" title="Chia sẻ qua TikTok" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">🎵</button>
                                <button class="share-btn share-copy" title="Sao chép link" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">🔗</button>
                            </div>
                        </div>

                        <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px;">
                            <span class="author-name-text" style="font-size: 0.85rem; color: var(--text-light);">Tác giả: <strong style="color: var(--primary);">${ebook.author}</strong></span>
                            <button class="btn btn-primary download-trigger-btn" style="padding: 8px 18px; font-size: 0.85rem; font-weight:700; border-radius: 20px;">Tải Ebook PDF &darr;</button>
                        </div>
                    </div>
                `;
                
                // Attach Social Share Event Listeners
                card.querySelector('.share-linkedin').addEventListener('click', (e) => { e.stopPropagation(); shareEbook('linkedin', ebook); });
                card.querySelector('.share-facebook').addEventListener('click', (e) => { e.stopPropagation(); shareEbook('facebook', ebook); });
                card.querySelector('.share-tiktok').addEventListener('click', (e) => { e.stopPropagation(); shareEbook('tiktok', ebook); });
                card.querySelector('.share-copy').addEventListener('click', (e) => { e.stopPropagation(); shareEbook('copy', ebook); });

                const downloadBtn = card.querySelector('.download-trigger-btn');
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleEbookDownload(ebook);
                });
                
                card.addEventListener('click', () => handleEbookDownload(ebook));
                articlesContainer.appendChild(card);
            });
            return;
        }
        
        // Articles Category
        const newsletterUrl = "https://www.linkedin.com/newsletters/bd-b2b-b%C3%ACnh-d%C3%A2n-h%E1%BB%8Dc-v%E1%BB%A5-7254739965526360064/";
        const filtered = articles.filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(searchQuery) || 
                                  a.description.toLowerCase().includes(searchQuery);
            return matchesSearch;
        });

        if (filtered.length === 0) {
            articlesContainer.innerHTML = `<div class="glass-panel" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Không tìm thấy bài viết nào.</div>`;
            return;
        }

        // Prominent LinkedIn Newsletter Banner Card
        const bannerCard = document.createElement('div');
        bannerCard.className = 'glass-panel article-card';
        bannerCard.style.gridColumn = '1 / -1';
        bannerCard.style.background = 'linear-gradient(135deg, rgba(10, 102, 194, 0.15) 0%, rgba(162, 10, 10, 0.1) 100%)';
        bannerCard.style.border = '1px solid #0a66c2';
        bannerCard.style.padding = '25px';
        bannerCard.style.marginBottom = '15px';
        bannerCard.style.borderRadius = '16px';
        
        bannerCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <span style="background: #0a66c2; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">Official LinkedIn Newsletter</span>
                    <h2 style="margin: 10px 0 6px 0; font-size: 1.35rem; font-weight: 800; color: var(--text-main);">BD B2B - Bình Dân Học Vụ Newsletter</h2>
                    <p style="margin: 0; color: var(--text-light); font-size: 0.95rem;">Đăng ký theo dõi bản tin chuyên sâu hàng tuần của Peter Vo trực tiếp trên mạng xã hội LinkedIn.</p>
                </div>
                <a href="${newsletterUrl}" target="_blank" rel="noopener noreferrer" class="btn" style="background: #0a66c2; color: #ffffff; padding: 12px 24px; font-weight: 700; border-radius: 25px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">Theo Dõi Trực Tiếp Trên LinkedIn &rarr;</a>
            </div>
        `;
        articlesContainer.appendChild(bannerCard);

        filtered.forEach(article => {
            const card = document.createElement('div');
            card.className = 'glass-panel article-card';
            card.style.cursor = 'pointer';
            
            card.innerHTML = `
                <div class="card-meta">
                    <span class="category-badge" style="background: rgba(10, 102, 194, 0.15); border: 1px solid #0a66c2; color: #0a66c2;">BD Article</span>
                    <span class="article-date-text">${article.date}</span>
                </div>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-desc">${article.description}</p>
                <div class="card-footer">
                    <span class="author-name-text">Tác giả: <strong>${article.author}</strong></span>
                    <a href="${article.linkedinUrl || newsletterUrl}" target="_blank" rel="noopener noreferrer" class="read-more-link" style="color: #0a66c2; font-weight: 700;">Đọc trên LinkedIn &rarr;</a>
                </div>
            `;
            
            card.addEventListener('click', () => {
                window.open(article.linkedinUrl || newsletterUrl, '_blank');
            });
            articlesContainer.appendChild(card);
        });
    }

    // --- Event Listeners ---
    
    // Category Tabs click
    categoryTabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        
        categoryTabsContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        
        activeCategory = btn.getAttribute('data-category');
        renderArticles();
    });

    // Search bar input
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase().trim();
        renderArticles();
    });

    // Modal close events
    modalCloseBtn.addEventListener('click', closeReader);
    btnReaderClose.addEventListener('click', closeReader);
    readerModal.addEventListener('click', (e) => {
        if (e.target === readerModal) closeReader();
    });

    // --- Ebook Download Flow & Daily Limit ---
    
    function handleEbookDownload(ebook) {
        currentSelectedEbook = ebook;
        
        // Check Daily Download Limit (1 per day default + bonus credits)
        const todayDl = getTodayDownloads();
        const allowedDl = 1 + getTodayBonusCredits();

        if (todayDl >= allowedDl) {
            // Daily limit reached -> Open retention modal to invite playing mini game or community!
            limitModal.classList.remove('hidden');
            return;
        }

        const registered = localStorage.getItem('b2b_user_registration');
        if (registered) {
            triggerDownload(ebook);
        } else {
            downloadEbookTitle.textContent = ebook.title;
            downloadModal.classList.remove('hidden');
        }
    }

    function triggerDownload(ebook) {
        // Record download count
        incrementTodayDownloads();
        incrementEbookDownloadCount(ebook.id);

        const link = document.createElement('a');
        link.href = ebook.fileUrl;
        link.download = ebook.fileUrl.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`Đang bắt đầu tải xuống: ${ebook.title}`);
    }

    function showToast(message) {
        let toast = document.getElementById('library-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'library-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '30px';
            toast.style.right = '30px';
            toast.style.background = '#a20a0a';
            toast.style.color = '#ffffff';
            toast.style.padding = '14px 28px';
            toast.style.borderRadius = '10px';
            toast.style.boxShadow = '0 10px 30px rgba(162, 10, 10, 0.3)';
            toast.style.zIndex = '1100';
            toast.style.fontWeight = '600';
            toast.style.fontSize = '0.95rem';
            toast.style.fontFamily = "'Be Vietnam Pro', sans-serif";
            toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.offsetHeight;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
        }, 3500);
    }

    function closeDownloadModal() {
        downloadModal.classList.add('hidden');
        downloadForm.reset();
    }

    function closeLimitModal() {
        limitModal.classList.add('hidden');
    }

    // Retention unlock button listeners
    btnUnlockGame.addEventListener('click', () => {
        addBonusCredit();
        showToast('🎮 Đã thưởng +1 lượt tải Ebook nhờ thử sức Mini Game!');
        closeLimitModal();
    });

    btnUnlockCommunity.addEventListener('click', () => {
        addBonusCredit();
        showToast('💬 Đã thưởng +1 lượt tải Ebook khi tham gia Cộng Đồng!');
        closeLimitModal();
    });

    limitCloseBtn.addEventListener('click', closeLimitModal);
    btnLimitClose.addEventListener('click', closeLimitModal);
    limitModal.addEventListener('click', (e) => {
        if (e.target === limitModal) closeLimitModal();
    });

    // Download registration form submission
    downloadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstName = regFirstName.value.trim();
        const email = regEmail.value.trim();
        const experience = regExperience.value.trim();
        
        if (!firstName || !email || !experience) {
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        const expNum = parseInt(experience, 10);
        if (isNaN(expNum) || expNum < 0) {
            alert('Số năm kinh nghiệm không hợp lệ.');
            return;
        }

        // Save profile locally
        const registrationData = {
            firstName,
            email,
            experience: expNum,
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('b2b_user_registration', JSON.stringify(registrationData));

        // Sync lead name, email & metadata to Google Sheets backend endpoint
        fetch('/api/log-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: firstName,
                email: email,
                tool: 'ebook-download',
                experience: expNum
            })
        }).catch(console.error);
        
        closeDownloadModal();
        
        if (currentSelectedEbook) {
            triggerDownload(currentSelectedEbook);
        }
    });

    // Close download modal listeners
    downloadCloseBtn.addEventListener('click', closeDownloadModal);
    downloadModal.addEventListener('click', (e) => {
        if (e.target === downloadModal) closeDownloadModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!readerModal.classList.contains('hidden')) closeReader();
            if (!downloadModal.classList.contains('hidden')) closeDownloadModal();
            if (!limitModal.classList.contains('hidden')) closeLimitModal();
        }
    });

    // Initialize Page
    loadArticles();
});
