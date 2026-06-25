document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const articlesContainer = document.getElementById('articles-container');
    const searchInput = document.getElementById('library-search');
    const categoryTabsContainer = document.getElementById('category-tabs');
    
    // Modal Elements
    const readerModal = document.getElementById('reader-modal');
    const modalCloseBtn = document.getElementById('reader-close-btn');
    const btnReaderClose = document.getElementById('btn-reader-close');
    const readerCategory = document.getElementById('reader-category');
    const readerDate = document.getElementById('reader-date');
    const readerTitle = document.getElementById('reader-title');
    const readerAuthor = document.getElementById('reader-author');
    const readerContentBody = document.getElementById('reader-content-body');
    const readerLinkedinLink = document.getElementById('reader-linkedin-link');

    // State
    let articles = [];
    let activeCategory = 'All';
    let searchQuery = '';

    // Fetch articles from library_data.json
    async function loadArticles() {
        try {
            const response = await fetch('library_data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch library data');
            }
            const data = await response.json();
            articles = data.articles || [];
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
        
        // Tables
        const lines = html.split('\n');
        let inTable = false;
        let tableRows = [];
        let headerParsed = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('|') && line.endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                    headerParsed = false;
                }
                
                // Skip separator lines e.g. |---|---|
                if (line.match(/^\|[\s:-|]+$/)) {
                    continue;
                }
                
                const cells = line.split('|').slice(1, -1).map(c => c.trim());
                if (!headerParsed) {
                    const ths = cells.map(c => `<th>${c}</th>`).join('');
                    tableRows.push(`<tr>${ths}</tr>`);
                    headerParsed = true;
                } else {
                    const tds = cells.map(c => `<td>${c}</td>`).join('');
                    tableRows.push(`<tr>${tds}</tr>`);
                }
                lines[i] = ''; // clear line
            } else {
                if (inTable) {
                    inTable = false;
                    const tableHtml = `<table>${tableRows.join('')}</table>`;
                    // Replace the previous line position with the table
                    lines[i - 1] = tableHtml;
                }
            }
        }
        
        html = lines.filter(l => l !== '').join('\n');

        // Lists
        html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
        // Wrap <li> elements in <ul>
        // Match consecutive <li> blocks and wrap them
        html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`);

        // Paragraphs (split by double newlines)
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
        readerCategory.textContent = article.category;
        readerDate.textContent = article.date;
        readerTitle.textContent = article.title;
        readerAuthor.textContent = article.author;
        readerContentBody.innerHTML = renderMarkdown(article.content);
        readerLinkedinLink.href = article.linkedinUrl || '#';
        
        readerModal.classList.remove('hidden');
    }

    function closeReader() {
        readerModal.classList.add('hidden');
    }

    // Render cards to container
    function renderArticles() {
        articlesContainer.innerHTML = '';
        
        const filtered = articles.filter(a => {
            const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
            const matchesSearch = a.title.toLowerCase().includes(searchQuery) || 
                                  a.description.toLowerCase().includes(searchQuery) ||
                                  a.content.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            articlesContainer.innerHTML = `<div class="glass-panel" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Không tìm thấy bài viết nào phù hợp với bộ lọc của bạn.</div>`;
            return;
        }

        filtered.forEach(article => {
            const card = document.createElement('div');
            card.className = 'glass-panel article-card';
            
            card.innerHTML = `
                <div class="card-meta">
                    <span class="category-badge">${article.category}</span>
                    <span class="article-date-text">${article.date}</span>
                </div>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-desc">${article.description}</p>
                <div class="card-footer">
                    <span class="author-name-text">Tác giả: <strong>${article.author}</strong></span>
                    <span class="read-more-link">Đọc tiếp &rarr;</span>
                </div>
            `;
            
            card.addEventListener('click', () => openReader(article));
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !readerModal.classList.contains('hidden')) {
            closeReader();
        }
    });

    // Initialize Page
    loadArticles();
});
