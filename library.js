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
    let glossary = [];
    let currentSelectedEbook = null;
    let activeCategory = 'Ebooks';
    let activeGlossaryFilter = 'All';
    let searchQuery = '';
    let searchTrackTimeout;

    // Immediate verification of session on library load
    const currentStoredEmail = localStorage.getItem('streak_email');
    if (currentStoredEmail) {
        fetch(`/api/log-email?action=checkEmail&email=${encodeURIComponent(currentStoredEmail)}`)
            .then(res => res.json())
            .then(data => {
                if (data.exists === false) {
                    // User was deleted from Google Sheets! Clean all storage
                    localStorage.removeItem('streak_email');
                    localStorage.removeItem('streak_name');
                    localStorage.removeItem('streak_user_id');
                    localStorage.removeItem('streak_active');
                    localStorage.removeItem('b2b_user_verified');
                    localStorage.removeItem('b2b_points_balance');
                    localStorage.removeItem('b2b_has_downloaded_before');
                    localStorage.removeItem('b2b_daily_downloads');
                    localStorage.removeItem('profile_experience');
                    localStorage.removeItem('profile_industry');
                    localStorage.removeItem('profile_skill');
                    if (window.updateNavbarUserHUD) {
                        window.updateNavbarUserHUD();
                    }
                } else if (data.exists && data.user) {
                    if (data.user.verified) {
                        localStorage.setItem('b2b_user_verified', 'true');
                    } else {
                        localStorage.removeItem('b2b_user_verified');
                    }
                    if (data.user.points !== undefined) {
                        localStorage.setItem('b2b_points_balance', data.user.points.toString());
                    }
                    if (window.updateNavbarUserHUD) {
                        window.updateNavbarUserHUD();
                    }
                }
            })
            .catch(e => console.warn('Library check user error:', e));
    } else {
        // If not logged in, ensure stale download blocker flags are cleared
        localStorage.removeItem('b2b_has_downloaded_before');
    }

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
        const current = getTodayDownloads();
        const key = `b2b_dl_count_${getTodayKey()}`;
        localStorage.setItem(key, (current + 1).toString());
    }

    function getTodayBonusCredits() {
        const key = `b2b_bonus_dl_${getTodayKey()}`;
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    function addBonusCredit() {
        const current = getTodayBonusCredits();
        const key = `b2b_bonus_dl_${getTodayKey()}`;
        localStorage.setItem(key, (current + 1).toString());
    }

    // --- Live Ebook Download Counter Helpers ---
    function getEbookDownloadCount(ebook) {
        const storageKey = `b2b_ebook_cnt_${ebook.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = parseInt(saved, 10);
            if (parsed <= 250) {
                return parsed;
            }
        }
        return ebook.downloads || 180;
    }

    function incrementEbookDownloadCount(ebookId) {
        const storageKey = `b2b_ebook_cnt_${ebookId}`;
        const ebookObj = ebooks.find(e => e.id === ebookId);
        const current = ebookObj ? getEbookDownloadCount(ebookObj) : 180;
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
            let response = await fetch('/library_data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch library data');
            }
            let data = await response.json();
            if (!data.glossary || data.glossary.length === 0) {
                try {
                    const fallbackRes = await fetch('https://raw.githubusercontent.com/bdtrainingcourse-cyber/BD-Tips/main/library_data.json');
                    if (fallbackRes.ok) {
                        data = await fallbackRes.json();
                    }
                } catch(e) { console.error('Fallback fetch error:', e); }
            }
            articles = data.articles || [];
            ebooks = data.ebooks || [];
            renderArticles();
            handleEbookDeepLink();
        } catch (error) {
            console.error('Error loading library:', error);
            articlesContainer.innerHTML = `<div class="glass-panel" style="grid-column: 1/-1; text-align: center; color: #ef4444;">Không thể tải dữ liệu thư viện. Vui lòng thử lại sau.</div>`;
        }
    }

    // Live LinkedIn Sync Button Logic
    const syncBtn = document.getElementById('sync-linkedin-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            syncBtn.disabled = true;
            syncBtn.innerHTML = `⏳ Đang quét bài mới...`;
            try {
                const res = await fetch('/api/sync-newsletter');
                if (res.ok) {
                    const data = await res.json();
                    if (data.articles && data.articles.length > 0) {
                        let newCount = 0;
                        data.articles.forEach(fetchedArt => {
                            if (!articles.some(a => a.linkedinUrl === fetchedArt.linkedinUrl || a.title === fetchedArt.title)) {
                                articles.unshift(fetchedArt);
                                newCount++;
                            }
                        });
                        if (newCount > 0) {
                            alert(`✅ Đã đồng bộ thành công ${newCount} bài viết mới nhất từ LinkedIn Newsletter!`);
                            activeCategory = 'Articles';
                            document.querySelectorAll('.tab-btn').forEach(b => {
                                b.classList.toggle('active', b.getAttribute('data-category') === 'Articles');
                            });
                            renderArticles();
                        } else {
                            alert(`ℹ️ Bài viết mới nhất trên LinkedIn Newsletter đã được cập nhật đầy đủ trong Thư viện!`);
                        }
                    } else {
                        alert(`ℹ️ Tất cả bài viết mới nhất trên LinkedIn Newsletter đã được cập nhật!`);
                    }
                } else {
                    alert(`ℹ️ Tất cả bài viết mới nhất trên LinkedIn Newsletter đã được cập nhật!`);
                }
            } catch(e) {
                console.error('Sync error:', e);
                alert(`ℹ️ Tất cả bài viết mới nhất đã được cập nhật thành công!`);
            } finally {
                syncBtn.disabled = false;
                syncBtn.innerHTML = `🔄 Cập Nhật Bài Mới Từ LinkedIn`;
            }
        });
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

    // Social Share Handler for Individual Ebooks
    function shareEbook(platform, ebook) {
        const origin = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'https://www.bdbinhdanhocvu.com'
            : window.location.origin;
        const currentOrigin = window.location.origin;

        // Direct clean page URL with ebook param for browsing
        const directUrl = `${currentOrigin}/library?ebook=${encodeURIComponent(ebook.id)}`;

        // Social crawler URL with dynamic OpenGraph meta tags
        const socialShareUrl = `${origin}/api/share-ebook?id=${encodeURIComponent(ebook.id)}`;

        const title = ebook.title;
        const text = `Tôi vừa đọc cuốn cẩm nang "${title}" của Peter Vo trên B2B BD Tips Portal! Kiến thức Business Development thực chiến rất sắc bén.`;

        if (platform === 'linkedin') {
            const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(socialShareUrl)}`;
            window.open(url, '_blank', 'width=600,height=600');
        } else if (platform === 'facebook') {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialShareUrl)}`;
            window.open(url, '_blank', 'width=600,height=600');
        } else if (platform === 'tiktok') {
            const copyContent = `${text}\n📖 Đọc & tải cẩm nang tại: ${directUrl}`;
            navigator.clipboard.writeText(copyContent);
            showToast('🎵 Đã sao chép nội dung chia sẻ TikTok vào Clipboard! Hãy dán vào bài đăng TikTok của bạn.');
            setTimeout(() => {
                window.open('https://www.tiktok.com', '_blank');
            }, 1200);
        } else if (platform === 'copy') {
            const copyContent = `${title} - ${directUrl}`;
            navigator.clipboard.writeText(copyContent);
            showToast(`🔗 Đã sao chép liên kết cẩm nang "${title}"!`);
        }
    }

    // Deep link handler for direct ebook sharing (?ebook=id or #ebook-id)
    function handleEbookDeepLink() {
        const urlParams = new URLSearchParams(window.location.search);
        let targetId = urlParams.get('ebook');
        if (!targetId && window.location.hash) {
            targetId = window.location.hash.replace(/^#ebook-card-|^#ebook-|^#/, '');
        }

        if (!targetId) return;

        const targetEbook = ebooks.find(e => e.id === targetId || e.id === `ebook-${targetId}`);
        if (!targetEbook) return;

        // Ensure active category is Ebooks
        if (activeCategory !== 'Ebooks' && activeCategory !== 'All') {
            activeCategory = 'Ebooks';
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-category') === 'Ebooks');
            });
            renderArticles();
        }

        setTimeout(() => {
            const targetEl = document.getElementById(`ebook-card-${targetEbook.id}`);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.classList.remove('ebook-card-highlighted');
                void targetEl.offsetWidth; // trigger reflow
                targetEl.classList.add('ebook-card-highlighted');
                showToast(`📖 Bạn đang xem cẩm nang: "${targetEbook.title}"`);
            }
        }, 350);
    }

    // Render cards to container
    function renderArticles() {
        articlesContainer.innerHTML = '';
        
        if (activeCategory === 'Glossary') {
            const filteredGlossary = glossary.filter(g => {
                const query = searchQuery.toLowerCase();
                const matchesSearch = !query || 
                                      g.term.toLowerCase().includes(query) || 
                                      g.vietnamese.toLowerCase().includes(query) || 
                                      g.definition.toLowerCase().includes(query) ||
                                      g.context.toLowerCase().includes(query);
                const matchesSubCat = activeGlossaryFilter === 'All' || g.category === activeGlossaryFilter;
                return matchesSearch && matchesSubCat;
            });

            // Top Sub-filter Bar for Glossary
            const filterBar = document.createElement('div');
            filterBar.style.gridColumn = '1 / -1';
            filterBar.style.display = 'flex';
            filterBar.style.gap = '10px';
            filterBar.style.flexWrap = 'wrap';
            filterBar.style.marginBottom = '20px';
            filterBar.style.justifyContent = 'center';

            const filters = [
                { id: 'All', label: 'Tất cả thuật ngữ (100+)' },
                { id: 'Internal', label: '🏢 Nội Bộ Team BD' },
                { id: 'Client', label: '🤝 Làm Việc Với Khách Hàng' },
                { id: 'Metrics', label: '📊 Chỉ Số Tài Chính & KPI' },
                { id: 'Slang', label: '🔥 Tiếng Lóng BD/Sales' }
            ];

            filters.forEach(f => {
                const fBtn = document.createElement('button');
                fBtn.className = `btn ${activeGlossaryFilter === f.id ? 'btn-primary' : 'btn-secondary'}`;
                fBtn.style.padding = '8px 18px';
                fBtn.style.borderRadius = '20px';
                fBtn.style.fontSize = '0.88rem';
                fBtn.textContent = f.label;
                fBtn.addEventListener('click', () => {
                    activeGlossaryFilter = f.id;
                    renderArticles();
                });
                filterBar.appendChild(fBtn);
            });
            articlesContainer.appendChild(filterBar);

            if (filteredGlossary.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'glass-panel';
                emptyMsg.style.gridColumn = '1 / -1';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.style.color = 'var(--text-muted)';
                emptyMsg.style.padding = '30px';
                emptyMsg.textContent = 'Không tìm thấy thuật ngữ phù hợp với từ khóa tìm kiếm.';
                articlesContainer.appendChild(emptyMsg);
                return;
            }

            filteredGlossary.forEach(item => {
                const card = document.createElement('div');
                card.className = 'glass-panel article-card';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'space-between';
                card.style.borderLeft = '4px solid var(--primary)';
                card.style.transition = 'all 0.3s ease';

                const formulaHtml = item.formula ? `
                    <div class="glossary-section formula-section">
                        <div class="glossary-section-title formula-title">
                            <span>📐</span> Công thức tính (Formula):
                        </div>
                        <div class="formula-code">${item.formula}</div>
                        ${item.formulaExample ? `<div class="formula-example">🧮 <strong>Ví dụ tính toán:</strong> ${item.formulaExample}</div>` : ''}
                    </div>
                ` : '';

                card.innerHTML = `
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px;">
                            <span class="category-badge" style="background: rgba(162, 10, 10, 0.15); border: 1px solid var(--primary); color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">${item.categoryLabel}</span>
                            <span style="font-size: 0.75rem; color: var(--accent-glow); background: rgba(243, 168, 59, 0.1); border: 1px solid rgba(243, 168, 59, 0.3); padding: 2px 8px; border-radius: 12px;">#${item.tag}</span>
                        </div>
                        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">${item.term}</h3>
                        <div style="font-size: 0.92rem; font-weight: 700; color: #f3a83b; margin-bottom: 12px;">${item.vietnamese}</div>
                        
                        <div class="glossary-section definition-section">
                            <div class="glossary-section-title">📌 Định nghĩa thực chiến:</div>
                            <div class="glossary-section-content">${item.definition}</div>
                        </div>

                        ${formulaHtml}

                        <div class="glossary-section context-section">
                            <div class="glossary-section-title context-title">💡 Bối cảnh ứng dụng thực tế:</div>
                            <div class="glossary-section-content context-content">"${item.context}"</div>
                        </div>
                    </div>

                    <button class="btn btn-secondary btn-copy-term" style="width: 100%; font-size: 0.85rem; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <span>📋</span> Sao Chép Định Nghĩa & Trích Dẫn
                    </button>
                `;

                const copyBtn = card.querySelector('.btn-copy-term');
                copyBtn.addEventListener('click', () => {
                    let copyText = `📘 Thuật ngữ B2B BD: ${item.term} (${item.vietnamese})\n📌 Định nghĩa: ${item.definition}`;
                    if (item.formula) {
                        copyText += `\n📐 Công thức: ${item.formula}`;
                    }
                    if (item.formulaExample) {
                        copyText += `\n🧮 Ví dụ tính toán: ${item.formulaExample}`;
                    }
                    copyText += `\n💡 Bối cảnh sử dụng: ${item.context}\n(Nguồn: B2B BD Tips Portal - Peter Vo)`;
                    navigator.clipboard.writeText(copyText);
                    showToast(`📋 Đã sao chép thuật ngữ "${item.term}" vào Clipboard!`);
                });

                articlesContainer.appendChild(card);
            });
            return;
        }
        
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
                card.id = `ebook-card-${ebook.id}`;
                card.setAttribute('data-ebook-id', ebook.id);
                card.className = 'glass-panel article-card ebook-card';
                card.style.cursor = 'pointer';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'space-between';
                card.style.transition = 'all 0.3s ease';
                const liveCount = getEbookDownloadCount(ebook);
                const isHot = ebook.badge === 'Hot Best-seller';
                const isShouldKnow = ebook.badge === 'Should know';
                let badgeStyle = '';
                let badgePrefix = '';
                if (isHot) {
                    badgeStyle = 'background: linear-gradient(135deg, #a20a0a 0%, #f3a83b 100%); color: #ffffff; font-weight: 800; border: 1px solid #f3a83b; box-shadow: 0 4px 12px rgba(243, 168, 59, 0.4);';
                    badgePrefix = '🔥 ';
                } else if (isShouldKnow) {
                    badgeStyle = 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; font-weight: 800; border: 1px solid #fbbf24; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.45);';
                    badgePrefix = '⭐ ';
                }

                const coverHtml = ebook.coverImage ? `
                    <div class="ebook-cover-frame">
                        <img src="${ebook.coverImage}" data-src="${ebook.coverImage}" alt="${ebook.title}" class="ebook-cover-img" loading="lazy" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/bdtrainingcourse-cyber/BD-Tips/main/' + this.getAttribute('data-src');">
                        <span class="ebook-cover-badge-overlay" style="${badgeStyle}">${badgePrefix}${ebook.badge || 'PDF Ebook'}</span>
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
                        <!-- Social Share Bar with Brand SVG Icons -->
                        <div class="ebook-share-bar">
                            <span class="ebook-share-label">Chia sẻ:</span>
                            <div class="ebook-share-actions">
                                <button class="ebook-share-btn share-linkedin" title="Chia sẻ qua LinkedIn" aria-label="Chia sẻ qua LinkedIn">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66Z"/>
                                    </svg>
                                </button>
                                <button class="ebook-share-btn share-facebook" title="Chia sẻ qua Facebook" aria-label="Chia sẻ qua Facebook">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </button>
                                <button class="ebook-share-btn share-tiktok" title="Chia sẻ qua TikTok" aria-label="Chia sẻ qua TikTok">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                                    </svg>
                                </button>
                                <button class="ebook-share-btn share-copy" title="Sao chép link cẩm nang" aria-label="Sao chép link cẩm nang">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                    </svg>
                                </button>
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
                if (window.registerUserAction) {
                    window.registerUserAction('library_read');
                }
                if (window.trackUserBehavior) {
                    window.trackUserBehavior('article_read', article.title);
                }
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
        
        // Debounce search input tracking log to avoid flooding the API
        clearTimeout(searchTrackTimeout);
        searchTrackTimeout = setTimeout(() => {
            if (searchQuery && window.trackUserBehavior) {
                window.trackUserBehavior('search_query', searchQuery);
            }
        }, 1000);
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
        
        const currentEmail = localStorage.getItem('streak_email');
        const isVerifiedLocal = localStorage.getItem('b2b_user_verified') === 'true';

        // 1. User đã đăng ký VÀ email đã xác thực -> Kiểm tra hạn mức tải trực tiếp về máy
        if (currentEmail && isVerifiedLocal) {
            const ebookCredits = parseInt(localStorage.getItem('b2b_unlocked_ebook_credits') || '0', 10);
            const streakUnlocked = ebookCredits > 0 || localStorage.getItem('b2b_streak_unlocked_ebook') === 'true';
            
            if (!streakUnlocked) {
                // Check Daily Download Limit (1 per day default + bonus credits)
                const todayDl = getTodayDownloads();
                const allowedDl = 1 + getTodayBonusCredits();

                if (todayDl >= allowedDl) {
                    // Daily limit reached -> Open retention modal
                    limitModal.classList.remove('hidden');
                    return;
                }
            }

            triggerDownload(ebook);
            return;
        }

        // 2. User mới HOẶC User đã đăng ký nhưng chưa xác thực email -> Mở popup đăng ký nhận Ebook qua email
        downloadEbookTitle.textContent = ebook.title;

        const modalTitleEl = document.querySelector('#download-modal .modal-title');
        const modalNoticeEl = document.getElementById('download-modal-notice');
        const submitBtn = downloadForm ? downloadForm.querySelector('button[type="submit"]') : null;

        regEmail.readOnly = false;
        if (currentEmail) {
            // User đã có email lưu trong máy nhưng chưa xác thực
            regEmail.value = currentEmail;
            regFirstName.value = localStorage.getItem('streak_name') || '';
            if (modalTitleEl) modalTitleEl.textContent = "Nhận Ebook & Kích Hoạt Tài Khoản";
            if (modalNoticeEl) modalNoticeEl.innerHTML = `💡 Nhập email nhận Ebook để Cú BeeDee gửi trọn bộ file PDF đính kèm trực tiếp qua hòm thư của bạn kèm link kích hoạt (+15đ ⚡).`;
            if (submitBtn) submitBtn.textContent = "📨 Gửi Ebook Đến Email Của Tôi ➔";
        } else {
            // User mới lần đầu
            regEmail.value = '';
            regFirstName.value = '';
            if (modalTitleEl) modalTitleEl.textContent = "Đăng Ký Nhận Ebook Qua Email";
            if (modalNoticeEl) modalNoticeEl.innerHTML = `💡 Ebook sẽ được gửi tự động qua email của bạn kèm file PDF đính kèm và link kích hoạt tài khoản (+15đ ⚡).`;
            if (submitBtn) submitBtn.textContent = "📨 Gửi Ebook Đến Email & Xác Thực ➔";
        }

        downloadModal.classList.remove('hidden');
    }

    function triggerDownload(ebook) {
        // Consuming ebook credit if they have any
        const ebookCredits = parseInt(localStorage.getItem('b2b_unlocked_ebook_credits') || '0', 10);
        if (ebookCredits > 0) {
            const newCredits = ebookCredits - 1;
            localStorage.setItem('b2b_unlocked_ebook_credits', newCredits.toString());
            if (newCredits <= 0) {
                localStorage.removeItem('b2b_streak_unlocked_ebook');
            }
        }

        // Record download count
        incrementTodayDownloads();
        incrementEbookDownloadCount(ebook.id);
        
        // Save flag to identify returning downloaders
        localStorage.setItem('b2b_has_downloaded_before', 'true');

        // Trigger action-based streak increase
        if (window.registerUserAction) {
            window.registerUserAction('library_read');
        }

        if (window.trackUserBehavior) {
            window.trackUserBehavior('ebook_download', ebook.title);
        }

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
        const submitBtn = downloadForm ? downloadForm.querySelector('button[type="submit"]') : null;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '📨 Gửi Ebook Đến Email Của Tôi ➔';
        }
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
        const rawExp = regExperience.value ? regExperience.value.trim() : '';
        const parsedExp = parseInt(rawExp, 10);
        const experience = !isNaN(parsedExp) ? parsedExp : (rawExp || 'Không chia sẻ');
        
        if (!firstName || !email) {
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        const ebookTitle = currentSelectedEbook ? currentSelectedEbook.title : 'Cẩm nang B2B BD';
        const downloadLink = currentSelectedEbook ? (window.location.origin + '/' + encodeURIComponent(currentSelectedEbook.fileUrl)) : window.location.href;

        const submitBtn = downloadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Đang gửi Ebook qua email...';
        }

        // Sync lead and send ebook verification email via backend
        fetch('/api/log-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'sendEbookVerificationEmail',
                name: firstName,
                email: email,
                tool: 'ebook-download',
                experience: experience,
                ebookTitle: ebookTitle,
                fileUrl: currentSelectedEbook ? currentSelectedEbook.fileUrl : 'ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf',
                downloadLink: downloadLink
            })
        })
        .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok && !data.success) {
                throw new Error(data.error || `Lỗi máy chủ (${res.status})`);
            }
            return data;
        })
        .then(data => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '📨 Gửi Ebook Đến Email Của Tôi ➔';
            }
            if (data.error) {
                if (data.error === 'email_already_used') {
                    alert('Email này đã được dùng để tải Ebook trước đây. Bạn cần tham gia Mini Game hoặc Cộng đồng BD để tích điểm mở khóa Ebook mới!');
                    closeDownloadModal();
                    
                    // Customize and show limit modal
                    const limitModalTitle = document.querySelector('#limit-modal .modal-title');
                    const limitModalDesc = document.querySelector('#limit-modal p');
                    if (limitModalTitle) {
                        limitModalTitle.textContent = "Cần Tích Điểm Để Mở Khóa Ebook Mới";
                    }
                    if (limitModalDesc) {
                        limitModalDesc.textContent = "Email này đã nhận Ebook chào mừng. Để tải Ebook tiếp theo, vui lòng tham gia Mini Game hoặc Cộng Đồng BD để tích lũy điểm mở khóa nhé!";
                    }
                    limitModal.classList.remove('hidden');
                    return;
                } else {
                    alert(data.error);
                    return;
                }
            }

            const uid = data.userId || (data.user && data.user.id) || 'UID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
            const userName = firstName || (data.user && data.user.name) || 'Học viên';
            const userPoints = (data.user && data.user.points) || data.points || 25;
            const isVerified = data.verified || (data.user && data.user.verified) || data.allowDirectDownload;

            localStorage.setItem('streak_email', email);
            localStorage.setItem('streak_name', userName);
            localStorage.setItem('streak_user_id', uid);
            localStorage.setItem('b2b_points_balance', userPoints.toString());

            const registrationData = {
                firstName: userName,
                email,
                experience: experience,
                registeredAt: new Date().toISOString()
            };
            localStorage.setItem('b2b_user_registration', JSON.stringify(registrationData));

            if (isVerified) {
                // User is already verified: allow direct browser download immediately
                localStorage.setItem('b2b_user_verified', 'true');
                localStorage.setItem('b2b_has_downloaded_before', 'true');
                try {
                    if (window.updateNavbarUserHUD) {
                        window.updateNavbarUserHUD();
                    }
                } catch (hudErr) {
                    console.warn('[HUD_WARN]', hudErr);
                }
                closeDownloadModal();
                if (currentSelectedEbook) {
                    triggerDownload(currentSelectedEbook);
                }
                showToast(`🎉 Tài khoản đã xác thực! Đang tải cuốn "${ebookTitle}" về máy.`);
            } else {
                // User is unverified or new: do NOT direct download, send via email
                localStorage.setItem('b2b_user_verified', 'false');
                try {
                    if (window.updateNavbarUserHUD) {
                        window.updateNavbarUserHUD();
                    }
                } catch (hudErr) {
                    console.warn('[HUD_WARN]', hudErr);
                }
                if (window.trackUserBehavior) {
                    window.trackUserBehavior('ebook_sent_to_email', `Ebook: ${ebookTitle} | Email: ${email}`);
                }
                closeDownloadModal();

                // Show clear instruction modal
                if (window.showGlobalNotification) {
                    window.showGlobalNotification(
                        '✉️ Ebook Đã Được Gửi Đến Email Của Bạn!',
                        `Cú BeeDee vừa gửi trọn bộ cuốn <strong>${ebookTitle}</strong> (kèm file PDF đính kèm) đến địa chỉ email <strong>${email}</strong>.<br><br>👉 <strong>Bước tiếp theo:</strong> Bạn hãy mở hòm thư email (hoặc mục <em>Spam / Thư rác</em>) để xem/tải trực tiếp file PDF về máy ngay nhé!`
                    );
                } else {
                    alert(`✉️ Cú BeeDee đã gửi trọn bộ cuốn "${ebookTitle}" đến email ${email}!\n\n👉 Bạn hãy mở hòm thư để tải và xem Ebook ngay nhé!`);
                }
            }
        })
        .catch(err => {
            console.error('[EBOOK_SUBMIT_ERROR]', err);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '📨 Gửi Ebook Đến Email Của Tôi ➔';
            }
            alert(`Có trục trặc khi kết nối: ${err.message || 'Lỗi mạng'}. Vui lòng thử lại sau giây lát!`);
        });
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
    // loadPersonalizedSidebar(); // Disabled in favor of static light-themed Luyện Pitching AI banner

    // --- Personalization suggestions panel ---
    async function loadPersonalizedSidebar() {
        const email = localStorage.getItem('streak_email');
        const url = `/api/get-personalized-content${email ? '?email=' + encodeURIComponent(email) : ''}`;
        try {
            const res = await fetch(url);
            if (res.ok) {
                const recs = await res.json();
                renderPersonalizedBox(recs);
            }
        } catch (e) {
            console.warn('Personalization load failed:', e);
        }
    }

    function renderPersonalizedBox(recs) {
        const sidebar = document.querySelector('.sidebar-column');
        if (!sidebar) return;

        // Remove existing personalized box if any
        const existing = document.getElementById('personalized-sidebar-box');
        if (existing) existing.remove();

        const box = document.createElement('div');
        box.id = 'personalized-sidebar-box';
        box.className = 'glass-panel';
        box.style.padding = '25px';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.gap = '15px';
        box.style.width = '100%';
        box.style.boxSizing = 'border-box';
        box.style.border = '1px solid var(--primary-glow)';
        box.style.background = 'linear-gradient(135deg, rgba(243, 168, 59, 0.06) 0%, rgba(30, 41, 59, 0.95) 100%)';
        box.style.boxShadow = '0 10px 30px rgba(243, 168, 59, 0.1)';

        const interestLabel = recs.interest === 'default' ? 'Đề xuất hôm nay' : 
            recs.interest === 'compliance' ? '💡 Chuyên ngành: Pháp lý & Lương thưởng' :
            recs.interest === 'pitching' ? '🎤 Chuyên ngành: Luyện pitching & Sales' :
            recs.interest === 'outreach' ? '✍️ Chuyên ngành: Cold Outreach' : '🔍 Chuyên ngành: Tìm kiếm leads';

        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 class="sidebar-title" style="margin: 0; color: #f3a83b; font-size: 1.15rem; font-weight: 800;">🎯 Dành Riêng Cho Bạn</h3>
                <span style="font-size: 0.72rem; background: rgba(243,168,59,0.15); color: #f3a83b; padding: 2px 8px; border-radius: 20px; font-weight: 700;">AI Suggest</span>
            </div>
            
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                ${interestLabel}
            </div>

            <!-- Ebook recommendation -->
            <div id="rec-ebook-card" style="display: flex; gap: 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
                <img src="${recs.ebook.coverImage || 'ebook-covers/cover-mindset-bd.png'}" style="width: 50px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);" />
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 4px 0; font-size: 0.85rem; font-weight: 800; color: var(--text-main); line-height: 1.3;">${recs.ebook.title}</h4>
                    <p style="margin: 0; font-size: 0.74rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">${recs.ebook.desc}</p>
                </div>
            </div>

            <!-- Tool recommendation -->
            <a href="${recs.tool.link}" style="text-decoration: none; color: inherit; display: flex; align-items: center; justify-content: space-between; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 12px; border-radius: 12px; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(99, 102, 241, 0.15)'" onmouseout="this.style.background='rgba(99, 102, 241, 0.08)'">
                <div>
                    <span style="font-size: 0.7rem; font-weight: 700; color: #a5b4fc; text-transform: uppercase; display: block; margin-bottom: 2px;">⚡ TIỆN ÍCH KHUYÊN DÙNG:</span>
                    <strong style="font-size: 0.88rem; color: #e0e7ff;">${recs.tool.name}</strong>
                </div>
                <span style="font-size: 1.2rem; color: #a5b4fc;">➔</span>
            </a>

            <!-- Article recommendation -->
            <a href="${recs.article.link}" target="_blank" style="text-decoration: none; color: inherit; display: block; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='rgba(0,0,0,0.15)'">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 2px;">📖 BÀI VIẾT NÊN ĐỌC:</span>
                <strong style="font-size: 0.85rem; color: var(--text-main); display: block; line-height: 1.3;">${recs.article.title}</strong>
            </a>
        `;

        // Prepend to sidebar
        sidebar.insertBefore(box, sidebar.firstChild);

        // Bind ebook click to download flow
        box.querySelector('#rec-ebook-card').addEventListener('click', () => {
            if (ebooks && ebooks.length > 0) {
                const ebookObj = ebooks.find(e => e.id === recs.ebook.id);
                if (ebookObj) {
                    handleEbookDownload(ebookObj);
                }
            }
        });
    }

    // Handle browser navigation back/forward with ebook query/hash
    window.addEventListener('popstate', handleEbookDeepLink);
});
