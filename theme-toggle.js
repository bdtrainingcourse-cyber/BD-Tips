// Global Theme Toggle Handler to prevent flashing on load
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        const interval = setInterval(() => {
            if (document.body) {
                document.body.classList.add('dark-theme');
                clearInterval(interval);
            }
        }, 1);
    } else {
        // Default is light theme
        document.documentElement.classList.remove('dark-theme');
    }
})();

const initThemeToggle = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        // Default is light theme
        document.body.classList.remove('dark-theme');
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        updateToggleButton(themeToggleBtn);

        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            if (isDark) {
                document.documentElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
            updateToggleButton(themeToggleBtn);
        });

        // Insert Global Share Button
        let shareBtn = document.getElementById('nav-share-btn');
        if (!shareBtn) {
            shareBtn = document.createElement('button');
            shareBtn.id = 'nav-share-btn';
            shareBtn.className = 'nav-share-btn';
            shareBtn.setAttribute('title', 'Chia sẻ tính năng/trang này');
            shareBtn.innerHTML = '📤';
            shareBtn.style.background = 'transparent';
            shareBtn.style.border = '1px solid rgba(255,255,255,0.15)';
            shareBtn.style.color = 'var(--text-main)';
            shareBtn.style.fontSize = '1.1rem';
            shareBtn.style.padding = '6px 10px';
            shareBtn.style.borderRadius = '50%';
            shareBtn.style.cursor = 'pointer';
            shareBtn.style.marginLeft = '12px';
            shareBtn.style.display = 'flex';
            shareBtn.style.alignItems = 'center';
            shareBtn.style.justifyContent = 'center';
            shareBtn.style.transition = 'all 0.3s ease';
            shareBtn.style.outline = 'none';

            shareBtn.addEventListener('click', () => {
                const title = document.title || 'BD Bình Dân Học Vụ';
                const url = window.location.href;
                window.openGlobalShareModal(title, url);
            });
            themeToggleBtn.parentNode.insertBefore(shareBtn, themeToggleBtn);
        }
    }

    // Auto Device Sync from URL Parameters (?sync_email=...)
    const urlParams = new URLSearchParams(window.location.search);
    const syncEmail = urlParams.get('sync_email');
    const syncName = urlParams.get('sync_name');
    const syncPoints = urlParams.get('sync_points');
    const syncAvatar = urlParams.get('sync_avatar');

    if (syncEmail) {
        localStorage.setItem('streak_active', 'true');
        localStorage.setItem('streak_email', syncEmail);
        if (syncName) localStorage.setItem('streak_name', syncName);
        if (syncPoints) localStorage.setItem('b2b_points_balance', syncPoints);
        if (syncAvatar) localStorage.setItem('b2b_custom_avatar', syncAvatar);
        
        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setTimeout(() => {
            window.showGlobalNotification(
                '🔄 Đồng Bộ Thiết Bị Thành Công',
                `Đã đồng bộ thành công tài khoản <strong>${syncName || syncEmail}</strong> và số điểm tích lũy ⚡ của bạn từ thiết bị khác!`
            );
            if (window.updateNavbarUserHUD) window.updateNavbarUserHUD();
            window.trackUserBehavior('device_sync_url', 'Sync via URL params');
        }, 800);
    }

    // IP-based Device Sync Auto-Detection
    const currentRegEmail = localStorage.getItem('streak_email');
    const syncDismissed = localStorage.getItem('bd_sync_dismissed');
    if (!currentRegEmail && syncDismissed !== 'true') {
        // Only run if not logged in and not dismissed before
        setTimeout(async () => {
            try {
                const res = await fetch('/api/detect-ip-user');
                const data = await res.json();
                if (data.found && data.user) {
                    window.showGlobalSyncPrompt(data.user);
                }
            } catch (e) {
                console.warn('IP detect sync error:', e);
            }
        }, 1500);
    }

    // Mobile Hamburger Menu Toggle
    const mobileMenuToggleBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenuToggleBtn && navMenu) {
        mobileMenuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('mobile-open');
            mobileMenuToggleBtn.innerHTML = isOpen ? '✕' : '☰';
        });

        // Close mobile drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('mobile-open') && !navMenu.contains(e.target) && !mobileMenuToggleBtn.contains(e.target)) {
                navMenu.classList.remove('mobile-open');
                mobileMenuToggleBtn.innerHTML = '☰';
            }
        });
    }

    // Dropdown Toggles for Mobile & Desktop Click
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parentDropdown = toggle.closest('.nav-dropdown');
            if (parentDropdown) {
                document.querySelectorAll('.nav-dropdown').forEach(d => {
                    if (d !== parentDropdown) d.classList.remove('open');
                });
                parentDropdown.classList.toggle('open');
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    });

    // Floating Back to Top Button Handler
    let backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.className = 'back-to-top-btn';
        backToTopBtn.title = 'Về đầu trang';
        backToTopBtn.innerHTML = '⬆️';
        document.body.appendChild(backToTopBtn);
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Floating Quests Badge (Interroller Banner) Handler
    if (window.location && window.location.pathname && !window.location.pathname.includes('quests.html') && !window.location.pathname.endsWith('/quests')) {
        let questsBadge = document.getElementById('floating-quests-badge');
        if (!questsBadge) {
            questsBadge = document.createElement('div');
            questsBadge.id = 'floating-quests-badge';
            questsBadge.className = 'floating-quests-badge';
            questsBadge.title = 'Nhiệm Vụ & Quà Tặng';
            questsBadge.innerHTML = `
                <div class="quests-badge-icon">🎯</div>
                <div class="quests-badge-tooltip">Nhiệm Vụ & Quà Tặng</div>
            `;
            document.body.appendChild(questsBadge);
            
            questsBadge.addEventListener('click', () => {
                window.location.href = 'quests.html';
            });
        }
    }
    
    // Initialize global notification bell icon in header navbar
    if (typeof initGlobalNotificationBell === 'function') {
        initGlobalNotificationBell();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}

function updateToggleButton(btn) {
    const isDark = document.body.classList.contains('dark-theme');
    btn.innerHTML = isDark ? '☀️' : '🌙';
    btn.setAttribute('title', isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối');
}

// ==========================================
// B2B POINTS-BASED GAMIFICATION SYSTEM
// ==========================================

function getWeekCode(date = new Date()) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNum}`;
}

const QUEST_CONFIG = {
    // Daily Quests
    check_in: { points: 5, limit: 1, name: '☕ Cú Đêm Dậy Sớm Làm BD', period: 'daily' },
    game_complete: { points: 10, limit: 2, name: '🎮 Cãi Khách Hàng Để Chốt Deal', period: 'daily' },
    perfect_game: { points: 5, limit: 2, name: '⭐ Chốt Deal Xuất Sắc (Game 5/5)', period: 'daily' },
    pic_search: { points: 5, limit: 3, name: '🎤 Luyện Thuyết Trình & Pitching AI', period: 'daily' },
    ai_email: { points: 5, limit: 3, name: '✍️ Viết Thư Tình Cho Doanh Nghiệp', period: 'daily' },
    share_click: { points: 5, limit: 2, name: '📢 Rủ Đồng Bọn Cùng Xuống Hố', period: 'daily' },
    arcade_level_clear: { points: 15, limit: 2, name: '⚔️ Vượt Ải B2B Arcade Cấp 6+', period: 'daily' },

    // Weekly Quests
    labor_read: { points: 15, limit: 2, name: '⚖️ Đọc Luật Tránh Bị Bóc Lột', period: 'weekly' },
    salary_calc: { points: 15, limit: 2, name: '💸 Định Giá Bản Thân - Đòi Hoa Hồng', period: 'weekly' },
    library_read: { points: 15, limit: 3, name: '📖 Mọt Sách Thực Chiến Quyết Chí Giàu Sang', period: 'weekly' },
    forum_post: { points: 20, limit: 1, name: '💬 Đóng Góp Bí Kíp Tán Khách Hàng', period: 'weekly' },
    forum_comment: { points: 10, limit: 3, name: '💬 Chém Gió Có Khoa Học', period: 'weekly' },
    arcade_perfect_clear: { points: 25, limit: 1, name: '👑 Phá Đảo Cấp 12 B2B Arcade', period: 'weekly' }
};

const CAMPAIGNS_CONFIG = {
    campaign_outreach: {
        id: 'campaign_outreach',
        title: 'Tuyệt Kỹ "Mặt Dày" Inbox Khách Hàng Enterprise ✉️',
        desc: 'Tích cực tạo Pitching AI, soạn Cold Email và share để chinh phục Enterprise lead.',
        bonus: 50,
        requirements: {
            pic_search: 3,
            ai_email: 3,
            share_click: 1
        }
    },
    campaign_compliance: {
        id: 'campaign_compliance',
        title: 'Thợ Săn Tiền Thưởng Quyết Không Để Quỵt Hoa Hồng ⚖️',
        desc: 'Nghiên cứu kỹ luật lao động và định giá commission của bản thân.',
        bonus: 40,
        requirements: {
            labor_read: 2,
            salary_calc: 2
        }
    },
    campaign_thinker: {
        id: 'campaign_thinker',
        title: 'Trùm Lý Thuyết Thực Chiến Học Làm Sếp 📖',
        desc: 'Hấp thụ kiến thức Thư viện và đóng góp case-study chất lượng cho diễn đàn.',
        bonus: 45,
        requirements: {
            library_read: 3,
            forum_post: 1
        }
    },
    campaign_arcade_master: {
        id: 'campaign_arcade_master',
        title: 'Chiến Binh B2B Arcade Vô Song ⚔️',
        desc: 'Vượt qua các ải sương mù, ô chữ B2B và phân deal Sudoku để tích lũy points.',
        bonus: 60,
        requirements: {
            arcade_level_clear: 5,
            perfect_game: 2
        }
    }
};

window.QUEST_CONFIG = QUEST_CONFIG;
window.CAMPAIGNS_CONFIG = CAMPAIGNS_CONFIG;
window.getWeekCode = getWeekCode;

window.dismissQuestWelcomeBanner = function() {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`quest_banner_dismissed_${todayStr}`, 'true');
    const banner = document.getElementById('streak-welcome-banner');
    if (banner) banner.remove();
    window.location.href = 'quests.html';
};

window.closeQuestWelcomeBanner = function() {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`quest_banner_dismissed_${todayStr}`, 'true');
    const banner = document.getElementById('streak-welcome-banner');
    if (banner) banner.remove();
};

function showQuestWelcomeBanner() {
    if (document.getElementById('streak-welcome-banner')) return;
    const message = '🦉 Chào chiến thần! Hôm nay bạn chưa tích luỹ điểm nào đâu nhé. Mau làm 1 hành động thực chiến để tích BD-Points đổi quà ngay đi nào!';

    const bannerHtml = `
        <div id="streak-welcome-banner" style="position: fixed; bottom: 20px; right: 20px; background: rgba(30, 20, 10, 0.95); backdrop-filter: blur(10px); border: 1.5px solid #f3a83b; border-radius: 12px; padding: 15px; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: flex-start; gap: 12px; z-index: 9999; font-family: sans-serif; animation: slideInUp 0.5s ease;">
            <button onclick="window.closeQuestWelcomeBanner()" style="position: absolute; top: 5px; right: 8px; background: none; border: none; color: #f3a83b; font-size: 1.1rem; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            <img src="/bd_mascot.png" alt="Cú" style="width: 40px; height: 40px; object-fit: contain; flex-shrink: 0;" onerror="this.src='https://bd-tips.vercel.app/bd_mascot.png'" />
            <div style="flex: 1;">
                <p style="margin: 0; font-size: 0.8rem; line-height: 1.4; color: #ecd9c6; padding-right: 10px;">${message}</p>
                <button onclick="window.dismissQuestWelcomeBanner()" style="margin-top: 8px; background: transparent; border: 1px solid #f3a83b; color: #f3a83b; border-radius: 4px; padding: 3px 10px; font-size: 0.7rem; cursor: pointer; transition: all 0.2s;">Tôi đi làm ngay!</button>
            </div>
        </div>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bannerHtml;
    document.body.appendChild(tempDiv.firstElementChild);
}

function checkQuestsOnLoad() {
    if (localStorage.getItem('streak_active') !== 'true') return;
    const todayStr = new Date().toISOString().split('T')[0];
    const progressKey = `b2b_quest_progress_${todayStr}`;
    let progress = {};
    try {
        progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
    } catch(e) {}

    const dismissedToday = localStorage.getItem(`quest_banner_dismissed_${todayStr}`) === 'true';
    if (!progress['check_in'] && !dismissedToday) {
        showQuestWelcomeBanner();
    }
}

function showPointToast(points, activityName) {
    let container = document.getElementById('b2b-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'b2b-toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '100000';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.background = 'linear-gradient(135deg, #2d1f10 0%, #1e1208 100%)';
    toast.style.border = '1px solid #f3a83b';
    toast.style.borderRadius = '8px';
    toast.style.padding = '12px 20px';
    toast.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.fontFamily = 'sans-serif';
    toast.style.transform = 'translateY(50px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    toast.innerHTML = `
        <span style="font-size: 1.3rem;">🪙</span>
        <div>
            <div style="color: #ffffff; font-size: 0.8rem; font-weight: bold;">+${points} BD-Points!</div>
            <div style="color: #ecd9c6; font-size: 0.7rem; margin-top: 2px;">Đã làm: ${activityName}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3500);
}

function showCampaignCompletePopup(campaignTitle, bonusPoints) {
    if (document.getElementById('b2b-campaign-popup')) return;

    const popupHtml = `
      <div id="b2b-campaign-popup" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 99999; opacity: 0; transition: opacity 0.3s ease;">
        <div style="background: linear-gradient(135deg, #102d1f 0%, #081e13 100%); border: 2px solid #34d399; border-radius: 20px; max-width: 440px; width: 90%; padding: 30px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); position: relative; transform: scale(0.9); transition: transform 0.3s ease;">
          <div style="width: 90px; height: 90px; margin: 0 auto 15px auto; border-radius: 50%; border: 3px solid #34d399; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fffaf0;">
            <img src="/bd_mascot.png" alt="Cú BeeDee" style="width: 76px; height: 76px; display: block; object-fit: contain;" onerror="this.src='https://bd-tips.vercel.app/bd_mascot.png'" />
          </div>
          <h3 style="color: #34d399; margin: 10px 0; font-size: 1.25rem; font-weight: 800; font-family: sans-serif;">Chiến Dịch Hoàn Thành! 🏆</h3>
          <p style="color: #ecd9c6; font-size: 0.95rem; line-height: 1.6; margin: 15px 0 25px 0; font-family: sans-serif;">Chúc mừng chiến thần! Bạn đã xuất sắc hoàn thành mọi thử thách của chiến dịch:<br><b style="color: #34d399;">"${campaignTitle}"</b>! Cú BeeDee rất khâm phục tài năng thực chiến của bạn.</p>
          <div style="background: rgba(52, 211, 153, 0.15); border-radius: 12px; padding: 12px; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 8px;">
             <span style="font-size: 1.5rem;">🔥</span>
             <span style="color: #ffffff; font-size: 1.1rem; font-weight: bold; font-family: sans-serif;">+${bonusPoints} Bonus BD-Points</span>
          </div>
          <button id="btn-campaign-popup-close" style="background: linear-gradient(135deg, #34d399 0%, #059669 100%); color: #ffffff; border: none; border-radius: 8px; padding: 12px 30px; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: transform 0.2s ease; width: 100%;">Tuyệt Vời!</button>
        </div>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = popupHtml;
    const popupEl = tempDiv.firstElementChild;
    document.body.appendChild(popupEl);

    setTimeout(() => {
        popupEl.style.opacity = '1';
        popupEl.querySelector('div').style.transform = 'scale(1)';
    }, 50);

    const closeBtn = popupEl.querySelector('#btn-campaign-popup-close');
    closeBtn.addEventListener('click', () => {
        popupEl.style.opacity = '0';
        popupEl.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => {
            popupEl.remove();
        }, 300);
    });
}

function updateCampaignProgress(actionType, count) {
    for (let campId in CAMPAIGNS_CONFIG) {
        if (localStorage.getItem(`b2b_campaign_completed_${campId}`) === 'true') continue;
        
        const campaign = CAMPAIGNS_CONFIG[campId];
        if (!campaign.requirements[actionType]) continue;
        
        const campaignProgressKey = `b2b_campaign_progress_${campId}`;
        let campProgress = {};
        try {
            campProgress = JSON.parse(localStorage.getItem(campaignProgressKey) || '{}');
        } catch(e) {}
        
        // Initialize keys
        for (let reqKey in campaign.requirements) {
            if (campProgress[reqKey] === undefined) campProgress[reqKey] = 0;
        }
        
        let current = campProgress[actionType] || 0;
        let req = campaign.requirements[actionType];
        if (current < req) {
            campProgress[actionType] = Math.min(req, current + count);
            localStorage.setItem(campaignProgressKey, JSON.stringify(campProgress));
            
            let allDone = true;
            for (let key in campaign.requirements) {
                if ((campProgress[key] || 0) < campaign.requirements[key]) {
                    allDone = false;
                }
            }
            
            if (allDone) {
                localStorage.setItem(`b2b_campaign_completed_${campId}`, 'true');
                let balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
                balance += campaign.bonus;
                localStorage.setItem('b2b_points_balance', balance.toString());
                
                // Ghi log giao dịch hoàn thành chiến dịch
                if (typeof window.logPointsTransaction === 'function') {
                    window.logPointsTransaction(`🏆 Hoàn thành chiến dịch: ${campaign.title}`, campaign.bonus);
                }
                
                showCampaignCompletePopup(campaign.title, campaign.bonus);
            }
        }
    }
}

function injectNavbarUserHUD() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    
    if (document.getElementById('navbar-user-hud')) return;
    
    const hud = document.createElement('div');
    hud.id = 'navbar-user-hud';
    hud.className = 'hidden';
    hud.style.cssText = 'display: flex; align-items: center; gap: 8px; background: rgba(243, 168, 59, 0.1); border: 1px solid var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; color: var(--text-main); margin-right: 10px; margin-left: 10px; align-self: center;';
    
    hud.innerHTML = `
        <span style="font-size: 1rem; line-height: 1;">🦉</span>
        <span id="navbar-user-name" style="max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">...</span>: 
        <span id="navbar-user-points" style="color: var(--primary); margin-left: 2px;">0</span>đ
    `;
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        navMenu.insertBefore(hud, themeToggle);
    } else {
        navMenu.appendChild(hud);
    }
    
    updateNavbarUserHUD();
}

function updateNavbarUserHUD() {
    const hud = document.getElementById('navbar-user-hud');
    if (!hud) {
        injectNavbarUserHUD();
        return;
    }
    
    const active = localStorage.getItem('streak_active') === 'true';
    if (active) {
        hud.classList.remove('hidden');
        hud.style.display = 'flex';
        const name = localStorage.getItem('streak_name') || 'Chiến thần';
        const points = localStorage.getItem('b2b_points_balance') || '0';
        
        const nameEl = document.getElementById('navbar-user-name');
        const pointsEl = document.getElementById('navbar-user-points');
        if (nameEl) nameEl.textContent = name;
        if (pointsEl) pointsEl.textContent = points;
    } else {
        hud.classList.add('hidden');
        hud.style.display = 'none';
    }
}

function updateUIElements() {
    if (typeof window.renderQuestBoard === 'function') window.renderQuestBoard();
    if (typeof window.renderCampaignBoard === 'function') window.renderCampaignBoard();
    updateNavbarUserHUD();
    
    const balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
    if (typeof updateWelcomeBanner === 'function') {
        updateWelcomeBanner(balance);
    }
    if (typeof updateRewardShopUI === 'function') {
        updateRewardShopUI(balance);
    }
}

// Hàm ghi chép Lịch sử Điểm tích lũy & Đồng bộ Sheets thời gian thực
window.logPointsTransaction = function(action, change) {
    if (localStorage.getItem('streak_active') !== 'true') return;
    const today = new Date();
    
    // Định dạng ngày giờ Việt Nam
    const dateStr = today.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + 
                    today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
    
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('b2b_points_history') || '[]');
    } catch(e) {}
    
    // Thêm giao dịch mới lên đầu danh sách
    history.unshift({
        date: dateStr,
        action: action,
        change: change,
        balance: balance
    });
    
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('b2b_points_history', JSON.stringify(history));
    
    // Phát event thông báo để giao diện render cập nhật
    window.dispatchEvent(new Event('points_history_updated'));
    
    // Đồng bộ điểm tích lũy lên Google Sheets
    const email = localStorage.getItem('streak_email');
    if (email && email.includes('@')) {
        fetch('/api/log-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updatePoints', email: email, points: balance })
        }).catch(err => console.error('Gửi đồng bộ điểm lên Google Sheets thất bại:', err));
    }
};

window.registerUserAction = function(actionType, metadata = {}) {
    if (localStorage.getItem('streak_active') !== 'true') return;

    const todayStr = new Date().toISOString().split('T')[0];
    let balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
    
    const config = QUEST_CONFIG[actionType];
    if (!config) return;
    
    const isWeekly = config.period === 'weekly';
    const progressKey = isWeekly ? `b2b_quest_progress_weekly_${getWeekCode()}` : `b2b_quest_progress_${todayStr}`;
    
    let progress = {};
    try {
        progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
    } catch(e) {}
    
    let currentCount = progress[actionType] || 0;
    
    // Check in is always checked daily
    const dailyProgressKey = `b2b_quest_progress_${todayStr}`;
    let dailyProgress = {};
    try {
        dailyProgress = JSON.parse(localStorage.getItem(dailyProgressKey) || '{}');
    } catch(e) {}
    
    let checkInAwarded = false;
    if (!dailyProgress['check_in']) {
        dailyProgress['check_in'] = 1;
        localStorage.setItem(dailyProgressKey, JSON.stringify(dailyProgress));
        balance += QUEST_CONFIG['check_in'].points;
        localStorage.setItem('b2b_points_balance', balance.toString());
        window.logPointsTransaction("☕ Cú Đêm Dậy Sớm (Điểm danh hàng ngày)", QUEST_CONFIG['check_in'].points);
        balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
        checkInAwarded = true;
    }

    if (currentCount >= config.limit) {
        if (checkInAwarded) {
            updateUIElements();
        }
        return;
    }
    
    progress[actionType] = currentCount + 1;
    let addedPoints = config.points;
    
    // Cộng điểm nhiệm vụ chính và ghi log
    balance += addedPoints;
    localStorage.setItem('b2b_points_balance', balance.toString());
    window.logPointsTransaction(`Nhiệm vụ: ${config.name}`, addedPoints);
    balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
    
    if (actionType === 'game_complete' && metadata.perfect) {
        // perfect game is daily
        let perfectCount = dailyProgress['perfect_game'] || 0;
        if (perfectCount < QUEST_CONFIG['perfect_game'].limit) {
            dailyProgress['perfect_game'] = perfectCount + 1;
            localStorage.setItem(dailyProgressKey, JSON.stringify(dailyProgress));
            
            balance += QUEST_CONFIG['perfect_game'].points;
            localStorage.setItem('b2b_points_balance', balance.toString());
            window.logPointsTransaction("🏆 Đạt điểm tuyệt đối trong game", QUEST_CONFIG['perfect_game'].points);
            balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
            addedPoints += QUEST_CONFIG['perfect_game'].points;
        }
    }
    
    localStorage.setItem(progressKey, JSON.stringify(progress));
    
    const welcomeBanner = document.getElementById('streak-welcome-banner');
    if (welcomeBanner) welcomeBanner.remove();

    if (checkInAwarded) {
        showPointToast(QUEST_CONFIG['check_in'].points + addedPoints, `${config.name} & Cú Đêm Dậy Sớm!`);
    } else {
        showPointToast(addedPoints, config.name);
    }
    
    updateCampaignProgress(actionType, 1);
    updateUIElements();
};

window.updateNavbarUserHUD = updateNavbarUserHUD;
window.injectNavbarUserHUD = injectNavbarUserHUD;

// Check quest status on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkQuestsOnLoad);
} else {
    checkQuestsOnLoad();
}

// ==========================================
// CÚ BEEDEE EMAIL REMINDER REGISTRATION & SYNC LOGIC
// ==========================================
const DISPOSABLE_EMAIL_DOMAINS = [
    'mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com', 
    '10minutemail.com', 'sharklasers.com', 'dispostable.com', 'getairmail.com', 
    'burnermail.io', 'trashmail.com', 'maildrop.cc', 'temp-mail.org', 
    'fakeinbox.com', 'throwawaymail.com', 'mailnesia.com', 'mailcatch.com'
];

function isDisposableEmail(email) {
    if (!email) return false;
    const domain = email.split('@')[1];
    if (!domain) return false;
    return DISPOSABLE_EMAIL_DOMAINS.includes(domain.toLowerCase().trim());
}

function handleEmailReminderRegistration(nameInputId, emailInputId, submitBtnId, successMsgId) {
    const nameInput = document.getElementById(nameInputId);
    const emailInput = document.getElementById(emailInputId);
    const submitBtn = document.getElementById(submitBtnId);
    const successMsg = document.getElementById(successMsgId);

    if (!submitBtn || !nameInput || !emailInput) return;

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) {
            alert('Vui lòng nhập đầy đủ Họ tên và Email!');
            return;
        }

        // Validate email format
        if (!email.includes('@')) {
            alert('Email không hợp lệ!');
            return;
        }

        // Check for disposable email
        if (isDisposableEmail(email)) {
            alert('Vui lòng sử dụng email cá nhân hoặc công việc thật (tránh dùng email rác/tạm thời như mailinator, yopmail...) để Cú BeeDee gửi nhắc nhở nhé!');
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang xử lý... ⏳';

        try {
            // Step 1: Check if email already exists in sheets
            const checkUrl = `/api/log-email?action=checkEmail&email=${encodeURIComponent(email)}`;
            const checkRes = await fetch(checkUrl);
            const checkData = await checkRes.json();

            if (checkRes.status === 400 || checkData.error) {
                alert(checkData.error || 'Email không hợp lệ!');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            if (checkData.exists && checkData.user) {
                const user = checkData.user;
                
                if (!user.verified) {
                    window.showGlobalNotification(
                        '✉️ Tài Khoản Chưa Xác Thực',
                        `Tài khoản với email <strong>${email}</strong> đã đăng ký nhưng <strong>chưa được xác thực email</strong>.<br><br>Vui lòng mở hộp thư email của bạn (kiểm tra cả mục Thư rác/Spam) và click vào liên kết xác thực để kích hoạt tài khoản.`
                    );
                    
                    // Clear local storage if there was a stale unverified login session
                    localStorage.removeItem('streak_active');
                    localStorage.removeItem('streak_email');
                    localStorage.removeItem('streak_name');
                    localStorage.removeItem('b2b_points_balance');
                    localStorage.removeItem('b2b_user_verified');
                    updateNavbarUserHUD();
                    
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return;
                }
                
                // Show notification modal preventing double logins
                window.showGlobalNotification(
                    '⚠️ Đã Đăng Ký Tài Khoản',
                    `Email <strong>${email}</strong> này đã được đăng ký và hoạt động.<br><br>Hệ thống B2B Portal đã tự động đồng bộ tài khoản và số điểm tích lũy của bạn lên thiết bị này!`
                );
                
                // Under-the-hood sync
                localStorage.setItem('streak_active', 'true');
                localStorage.setItem('streak_name', user.name || name);
                localStorage.setItem('streak_email', email);
                localStorage.setItem('b2b_points_balance', (user.points || 0).toString());
                localStorage.setItem('b2b_user_verified', 'true');
                if (user.avatar) localStorage.setItem('b2b_custom_avatar', user.avatar);
                updateNavbarUserHUD();
                
                // Clear inputs
                nameInput.value = '';
                emailInput.value = '';
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            } else {
                // Sync user to sheets first to ensure it's not a spam request
                const syncRes = await fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'syncUser',
                        name: name,
                        email: email,
                        points: 25
                    })
                });

                const syncData = await syncRes.json();
                if (syncRes.status === 400 || syncData.error) {
                    alert(syncData.error || 'Đăng ký thất bại!');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return;
                }

                // New user: grant 25 points and register locally after successful backend verification
                const startPoints = 25;
                localStorage.setItem('streak_active', 'true');
                localStorage.setItem('streak_name', name);
                localStorage.setItem('streak_email', email);
                localStorage.setItem('b2b_points_balance', startPoints.toString());
                
                // Clear inputs
                nameInput.value = '';
                emailInput.value = '';

                // Log points transaction locally & sync
                window.logPointsTransaction("🦉 Kích hoạt Nhắc nhở Cú BeeDee (Đăng ký mới)", startPoints);

                // Show HUD and success message
                updateNavbarUserHUD();
                if (successMsg) {
                    successMsg.textContent = `🎉 Đăng ký thành công! Cú BeeDee đã mở tài khoản tích lũy 25 BD-Points cho bạn.`;
                    successMsg.classList.remove('hidden');
                    successMsg.style.display = 'block';
                }
                showPointToast(startPoints, "Kích hoạt Nhắc nhở Cú BeeDee!");
            }

            // Hide success message after 7 seconds
            setTimeout(() => {
                if (successMsg) {
                    successMsg.classList.add('hidden');
                    successMsg.style.display = 'none';
                }
            }, 7000);

        } catch (err) {
            console.error('Đăng ký nhắc nhở email thất bại:', err);
            alert('Có lỗi xảy ra trong quá trình kết nối với máy chủ. Vui lòng thử lại!');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

function initEmailRegistrations() {
    // Challenge trigger box (Homepage)
    handleEmailReminderRegistration(
        'challenge-trigger-name',
        'challenge-trigger-email',
        'btn-challenge-trigger-submit',
        'challenge-trigger-success-msg'
    );

    // Sidebar trigger box (Community page)
    handleEmailReminderRegistration(
        'sidebar-trigger-name',
        'sidebar-trigger-email',
        'btn-sidebar-trigger-submit',
        'sidebar-trigger-success-msg'
    );
}

async function checkEmailVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyEmail = urlParams.get('verify_email');
    if (verifyEmail) {
        try {
            const res = await fetch(`/api/log-email?action=verifyUser&email=${encodeURIComponent(verifyEmail)}`);
            const data = await res.json();
            if (data.success) {
                // Update local storage
                localStorage.setItem('streak_active', 'true');
                localStorage.setItem('streak_email', verifyEmail);
                localStorage.setItem('b2b_points_balance', data.points.toString());
                localStorage.setItem('b2b_user_verified', 'true');
                
                // Show notification modal
                window.showGlobalNotification(
                    '🎉 Xác Thực Thành Công!',
                    `Cảm ơn bạn đã xác nhận tham gia! Email <strong>${verifyEmail}</strong> của bạn đã được kích hoạt chính thức.<br><br>Cú BeeDee vừa cộng thêm <strong>15đ ⚡</strong> vào tài khoản tích lũy của bạn.`
                );
                
                // Trigger points toast
                if (window.showPointToast) {
                    window.showPointToast(15, "Xác thực Email thành công!");
                }
                
                // Update HUD
                if (window.updateNavbarUserHUD) {
                    window.updateNavbarUserHUD();
                }
            }
        } catch (e) {
            console.error('Lỗi xác thực email:', e);
        } finally {
            // Remove verify_email query param from URL without reloading
            urlParams.delete('verify_email');
            const newQuery = urlParams.toString();
            const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '') + window.location.hash;
            window.history.replaceState(null, null, newUrl);
        }
    }
}

// Bind to window load / DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initEmailRegistrations();
        initGlobalComponents();
        checkEmailVerification();
    });
} else {
    initEmailRegistrations();
    initGlobalComponents();
    checkEmailVerification();
}

// Global behaviors, UI modals injection, and tracking helpers definition
function initGlobalComponents() {
    // Inject Custom Share & Sync Modals Styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .global-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .global-modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        .global-modal-box {
            background: rgba(30, 41, 59, 0.95);
            border: 1.5px solid rgba(243, 168, 59, 0.25);
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 480px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transform: scale(0.9) translateY(20px);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            color: #f8fafc;
            font-family: 'Be Vietnam Pro', sans-serif;
        }
        .global-modal-overlay.active .global-modal-box {
            transform: scale(1) translateY(0);
        }
        .global-sync-banner {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(30, 41, 59, 0.95);
            border: 1.5px solid #f3a83b;
            border-radius: 16px;
            padding: 20px;
            width: 350px;
            max-width: calc(100vw - 60px);
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
            z-index: 9999;
            transform: translateY(120px) scale(0.9);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            color: #f8fafc;
            font-family: 'Be Vietnam Pro', sans-serif;
        }
        .global-sync-banner.active {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        .global-share-btn-item {
            padding: 12px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .global-share-btn-item:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
    `;
    document.head.appendChild(styleEl);

    // Initial page view behavior log and email verification check on load
    const currentEmail = localStorage.getItem('streak_email');
    if (currentEmail) {
        window.trackUserBehavior('page_view', window.location.pathname);

        // Verification validation check on load
        const isVerifiedLocal = localStorage.getItem('b2b_user_verified') === 'true';
        if (!isVerifiedLocal) {
            setTimeout(async () => {
                try {
                    const checkUrl = `/api/log-email?action=checkEmail&email=${encodeURIComponent(currentEmail)}`;
                    const res = await fetch(checkUrl);
                    const data = await res.json();
                    if (data.exists && data.user) {
                        if (data.user.verified) {
                            localStorage.setItem('b2b_user_verified', 'true');
                        } else {
                            // Show verification reminder popup modal
                            window.showGlobalNotification(
                                '✉️ Xác Thực Tài Khoản',
                                `Tài khoản với email <strong>${currentEmail}</strong> của bạn chưa được xác thực.<br><br>Vui lòng kiểm tra hộp thư email (hoặc mục Thư rác/Spam) và click vào liên kết xác thực để kích hoạt tài khoản và tích lũy điểm thưởng.`
                            );
                        }
                    }
                } catch (e) {
                    console.warn('Verification check failed:', e);
                }
            }, 2500); // 2.5 seconds delay on load
        }
    }
}

// Global client behavior tracker
window.trackUserBehavior = function(action, detail) {
    const email = localStorage.getItem('streak_email');
    if (!email) return; // Only track registered users
    
    // Check if on community page to match its categories or general categories
    let category = 'general';
    if (window.location.pathname.includes('labor-law')) category = 'labor-law';
    else if (window.location.pathname.includes('salary')) category = 'salary';
    else if (window.location.pathname.includes('pitching')) category = 'pitching';
    else if (window.location.pathname.includes('email-assistant')) category = 'email-assistant';
    else if (window.location.pathname.includes('library')) category = 'library';
    else if (window.location.pathname.includes('community')) category = 'community';
    else if (window.location.pathname.includes('kpi-estimation')) category = 'kpi-estimation';

    fetch('/api/track-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            action,
            category,
            detail: detail || ''
        })
    }).catch(err => console.warn('Behavior tracking failed:', err));
};

// Global notifications handler
window.showGlobalNotification = function(title, message) {
    let overlay = document.getElementById('global-notification-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-notification-modal';
        overlay.className = 'global-modal-overlay';
        overlay.innerHTML = `
            <div class="global-modal-box">
                <h3 id="global-noti-title" style="margin-top: 0; font-size: 1.25rem; font-weight: 800; color: #f59e0b; display: flex; align-items: center; gap: 8px;"></h3>
                <p id="global-noti-msg" style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; margin-bottom: 22px;"></p>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="global-noti-close-btn" style="background: linear-gradient(135deg, #f3a83b 0%, #f59e0b 100%); border: none; color: #fff; padding: 8px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: transform 0.2s ease;">Đồng Ý & Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        overlay.querySelector('#global-noti-close-btn').addEventListener('click', () => {
            overlay.classList.remove('active');
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    }

    overlay.querySelector('#global-noti-title').innerHTML = title;
    overlay.querySelector('#global-noti-msg').innerHTML = message;
    
    // Animate active
    overlay.offsetHeight; 
    overlay.classList.add('active');
};

// Global Sync prompt (IP WiFi mapping)
window.showGlobalSyncPrompt = function(user) {
    let banner = document.getElementById('global-sync-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'global-sync-banner';
        banner.className = 'global-sync-banner';
        banner.innerHTML = `
            <div style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 15px;">
                <span style="font-size: 1.8rem;">🦉</span>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-weight: 800; color: #f59e0b;">Đồng bộ đa thiết bị?</h4>
                    <p style="margin: 0; font-size: 0.8rem; color: #cbd5e1; line-height: 1.4;">
                        Cú BeeDee phát hiện tài khoản <strong>${user.name}</strong> hoạt động gần đây cùng mạng Wi-Fi của bạn. Đồng bộ ngay?
                    </p>
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="btn-sync-dismiss" style="background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">Bỏ qua</button>
                <button id="btn-sync-confirm" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: #fff; padding: 6px 16px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(16,185,129,0.25);">Đồng ý</button>
            </div>
        `;
        document.body.appendChild(banner);

        banner.querySelector('#btn-sync-dismiss').addEventListener('click', () => {
            banner.classList.remove('active');
            localStorage.setItem('bd_sync_dismissed', 'true');
        });

        banner.querySelector('#btn-sync-confirm').addEventListener('click', () => {
            localStorage.setItem('streak_active', 'true');
            localStorage.setItem('streak_name', user.name);
            localStorage.setItem('streak_email', user.email);
            localStorage.setItem('b2b_points_balance', user.points.toString());
            if (user.avatar) localStorage.setItem('b2b_custom_avatar', user.avatar);
            
            banner.classList.remove('active');
            
            window.showGlobalNotification(
                '🔄 Đồng Bộ Thành Công',
                `Đã tự động kết nối và đồng bộ tài khoản **${user.name}** thành công! Website sẽ tự động tải lại sau 1.5 giây.`
            );
            
            window.trackUserBehavior('device_sync_ip', 'Sync via IP match');

            setTimeout(() => {
                window.location.reload();
            }, 1800);
        });
    }

    // Animate active
    banner.offsetHeight;
    banner.classList.add('active');
};

// Global Share Modal (LinkedIn, Facebook, Threads, TikTok copy & QR code)
window.openGlobalShareModal = function(title, url) {
    let overlay = document.getElementById('global-share-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-share-modal';
        overlay.className = 'global-modal-overlay';
        overlay.innerHTML = `
            <div class="global-modal-box" style="max-width: 480px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; margin-bottom: 20px;">
                    <h3 style="font-size: 1.2rem; font-weight: 800; color: #f59e0b; margin: 0; display: flex; align-items: center; gap: 8px;">
                        📢 Chia sẻ tính năng B2B BD
                    </h3>
                    <button id="global-share-close-btn" style="background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                
                <p id="global-share-desc" style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 18px; line-height: 1.4;"></p>

                <!-- Social Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <a id="share-global-linkedin" target="_blank" class="global-share-btn-item" style="background: #0a66c2; color: #fff;">
                        💼 LinkedIn
                    </a>
                    <a id="share-global-facebook" target="_blank" class="global-share-btn-item" style="background: #1877f2; color: #fff;">
                        📘 Facebook
                    </a>
                    <a id="share-global-threads" target="_blank" class="global-share-btn-item" style="background: #000; color: #fff; border: 1px solid #334155;">
                        🧵 Threads
                    </a>
                    <button id="share-global-tiktok" class="global-share-btn-item" style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #0f172a;">
                        🎵 TikTok
                    </button>
                </div>

                <!-- Copy Input Area -->
                <div style="background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px; margin-bottom: 20px;">
                    <div style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Sao chép liên kết:</div>
                    <div style="display: flex; gap: 8px;">
                        <input id="share-global-url-input" readonly type="text" style="flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #cbd5e1; font-size: 0.8rem; outline: none;" />
                        <button id="share-global-copy-btn" style="background: linear-gradient(135deg, #f3a83b 0%, #f59e0b 100%); border: none; color: #fff; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; cursor: pointer;">Chép</button>
                    </div>
                </div>

                <!-- QR Sync Sync Area -->
                <div style="display: flex; gap: 15px; align-items: center; background: rgba(243, 168, 59, 0.04); padding: 15px; border-radius: 12px; border: 1px dashed rgba(243, 168, 59, 0.3);">
                    <img id="share-global-qrcode" src="" style="width: 100px; height: 100px; background: #fff; padding: 6px; border-radius: 8px;" alt="QR Code" />
                    <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">Đồng bộ di động cực nhanh 📱</div>
                        <p style="margin: 0; font-size: 0.72rem; color: #cbd5e1; line-height: 1.45;">
                            Quét mã QR bằng Điện thoại để đồng bộ nhanh tài khoản & điểm tích lũy ⚡ sang Mobile Browser của bạn!
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#global-share-close-btn').addEventListener('click', () => overlay.classList.remove('active'));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    }

    const shareTitle = `Cẩm nang BD B2B thực chiến: ${title}`;
    const shareDescText = `Tôi vừa tìm được tính năng **"${title}"** cực kỳ hữu ích và thực tế cho dân Business Development B2B.`;
    const shareUrl = url;

    overlay.querySelector('#global-share-desc').innerHTML = `Chia sẻ tính năng <strong>${title}</strong> này trên mạng xã hội hoặc quét QR để đồng bộ sang điện thoại:`;
    overlay.querySelector('#share-global-url-input').value = shareUrl;
    
    // Encode url for params
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`${shareTitle} - Tra cứu & tự động hóa ngay tại đây: `);

    // Share endpoints
    overlay.querySelector('#share-global-linkedin').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    overlay.querySelector('#share-global-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    overlay.querySelector('#share-global-threads').href = `https://threads.net/intent/post?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;

    // TikTok custom sharing copy
    const tiktokBtn = overlay.querySelector('#share-global-tiktok');
    const newTiktokBtn = tiktokBtn.cloneNode(true);
    tiktokBtn.parentNode.replaceChild(newTiktokBtn, tiktokBtn);
    newTiktokBtn.addEventListener('click', () => {
        const textToCopy = `Thực chiến B2B BD: ${title}!\nTrải nghiệm bộ công cụ tại: ${shareUrl}`;
        navigator.clipboard.writeText(textToCopy);
        
        // Award points
        if (window.registerUserAction) {
            window.registerUserAction('share_click');
        }
        
        alert('🎵 Đã sao chép nội dung và link chia sẻ TikTok vào Clipboard! Đang mở TikTok...');
        setTimeout(() => {
            window.open('https://www.tiktok.com', '_blank');
        }, 1000);
    });

    // Copy action
    const copyBtn = overlay.querySelector('#share-global-copy-btn');
    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
    newCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shareUrl);
        newCopyBtn.textContent = 'Chép Xong';
        newCopyBtn.style.background = '#10b981';
        
        // Award points
        if (window.registerUserAction) {
            window.registerUserAction('share_click');
        }

        setTimeout(() => {
            newCopyBtn.textContent = 'Chép';
            newCopyBtn.style.background = '';
        }, 2000);
    });

    // QR Code generation (Free API)
    // To sync, we add the current user's profile metadata to the QR url parameters so they sync automatically when scanned!
    const syncParamEmail = localStorage.getItem('streak_email') || '';
    const syncParamName = localStorage.getItem('streak_name') || '';
    const syncParamPoints = localStorage.getItem('b2b_points_balance') || '25';
    const syncParamAvatar = localStorage.getItem('b2b_custom_avatar') || '';
    
    let qrSyncUrl = shareUrl;
    if (syncParamEmail) {
        const urlObj = new URL(shareUrl);
        urlObj.searchParams.set('sync_email', syncParamEmail);
        urlObj.searchParams.set('sync_name', syncParamName);
        urlObj.searchParams.set('sync_points', syncParamPoints);
        if (syncParamAvatar) urlObj.searchParams.set('sync_avatar', syncParamAvatar);
        qrSyncUrl = urlObj.toString();
    }
    
    overlay.querySelector('#share-global-qrcode').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrSyncUrl)}`;

    // Track share click behavior
    window.trackUserBehavior('share_open', title);

    overlay.classList.add('active');
};

function initGlobalNotificationBell() {
    // If the bell container is already present statically, do not duplicate it
    if (document.getElementById('notification-bell-container')) return;

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    // Create bell container structure
    const bellContainer = document.createElement('div');
    bellContainer.className = 'nav-notification-bell';
    bellContainer.id = 'notification-bell-container';
    bellContainer.style.cssText = 'position: relative; display: inline-flex; align-items: center; margin-right: 15px;';
    bellContainer.innerHTML = `
        <button id="btn-noti-bell" class="theme-toggle-btn" aria-label="Notifications" style="font-size: 1.15rem; position: relative; background: none; border: none; cursor: pointer; padding: 4px 8px; margin-left: 0;">
            🔔<span id="noti-badge" class="noti-badge hidden">0</span>
        </button>
        <div class="noti-dropdown hidden" id="noti-dropdown">
            <div class="noti-dropdown-header">
                <span>Thông báo</span>
                <button id="btn-clear-noti" style="background: none; border: none; color: var(--primary); font-size: 0.75rem; cursor: pointer; font-weight: 700;">Đã đọc tất cả</button>
            </div>
            <div class="noti-dropdown-list" id="noti-list">
                <div class="noti-empty">Không có thông báo mới.</div>
            </div>
        </div>
    `;

    // Insert before theme toggle button
    themeToggleBtn.parentNode.insertBefore(bellContainer, themeToggleBtn);

    // Setup global listeners
    const btnNotiBell = document.getElementById('btn-noti-bell');
    const notiDropdown = document.getElementById('noti-dropdown');
    const notiBadge = document.getElementById('noti-badge');
    const notiList = document.getElementById('noti-list');
    const btnClearNoti = document.getElementById('btn-clear-noti');

    if (btnNotiBell && notiDropdown) {
        btnNotiBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notiDropdown.classList.toggle('hidden');
            renderGlobalNotifications();
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
            const notis = getGlobalNotifications();
            notis.forEach(n => n.unread = false);
            saveGlobalNotifications(notis);
            updateGlobalNotiBadge();
            renderGlobalNotifications();
        });
    }

    function getGlobalNotifications() {
        const notis = localStorage.getItem('bd_notifications');
        return notis ? JSON.parse(notis) : [];
    }

    function saveGlobalNotifications(notis) {
        localStorage.setItem('bd_notifications', JSON.stringify(notis));
    }

    function updateGlobalNotiBadge() {
        if (!notiBadge) return;
        const notis = getGlobalNotifications();
        const unreadCount = notis.filter(n => n.unread).length;
        if (unreadCount > 0) {
            notiBadge.textContent = unreadCount;
            notiBadge.classList.remove('hidden');
        } else {
            notiBadge.classList.add('hidden');
        }
    }

    function renderGlobalNotifications() {
        if (!notiList) return;
        const notis = getGlobalNotifications();
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
                const allNotis = getGlobalNotifications();
                const current = allNotis.find(n => n.id === notiId);
                if (current) current.unread = false;
                saveGlobalNotifications(allNotis);
                updateGlobalNotiBadge();

                // Open post details
                notiDropdown.classList.add('hidden');
                
                // Redirect/open details page
                window.location.href = `community.html?post=${postId}`;
            });
        });
    }

    // Initial badge update
    updateGlobalNotiBadge();
}

// Trigger build: 2026-08-13T15:10:00Z

