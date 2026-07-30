// Global Theme Toggle Handler to prevent flashing on load
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark-theme');
    } else {
        // Default is dark theme
        document.documentElement.classList.add('dark-theme');
    }
})();

const initThemeToggle = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        // Default is dark theme
        document.body.classList.add('dark-theme');
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
    pic_search: { points: 3, limit: 3, name: '🔍 Thám Tử Tư Đi Săn Trùm Cuối', period: 'daily' },
    ai_email: { points: 3, limit: 3, name: '✍️ Viết Thư Tình Cho Doanh Nghiệp', period: 'daily' },
    share_click: { points: 5, limit: 2, name: '📢 Rủ Đồng Bọn Cùng Xuống Hố', period: 'daily' },

    // Weekly Quests
    labor_read: { points: 15, limit: 2, name: '⚖️ Đọc Luật Tránh Bị Bóc Lột', period: 'weekly' },
    salary_calc: { points: 15, limit: 2, name: '💸 Định Giá Bản Thân - Đòi Hoa Hồng', period: 'weekly' },
    library_read: { points: 15, limit: 3, name: '📖 Mọt Sách Thực Chiến Quyết Chí Giàu Sang', period: 'weekly' },
    forum_post: { points: 20, limit: 1, name: '💬 Đóng Góp Bí Kíp Tán Khách Hàng', period: 'weekly' },
    forum_comment: { points: 10, limit: 3, name: '💬 Chém Gió Có Khoa Học', period: 'weekly' }
};

const CAMPAIGNS_CONFIG = {
    campaign_outreach: {
        id: 'campaign_outreach',
        title: 'Tuyệt Kỹ "Mặt Dày" Inbox Khách Hàng Enterprise ✉️',
        desc: 'Tích cực PIC search, soạn Cold Email và share để chinh phục Enterprise lead.',
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
    }
};

window.QUEST_CONFIG = QUEST_CONFIG;
window.CAMPAIGNS_CONFIG = CAMPAIGNS_CONFIG;
window.getWeekCode = getWeekCode;

function showQuestWelcomeBanner() {
    if (document.getElementById('streak-welcome-banner')) return;
    const message = '🦉 Chào chiến thần! Hôm nay bạn chưa tích luỹ điểm nào đâu nhé. Mau làm 1 hành động thực chiến để tích BD-Points đổi quà ngay đi nào!';

    const bannerHtml = `
        <div id="streak-welcome-banner" style="position: fixed; bottom: 20px; right: 20px; background: rgba(30, 20, 10, 0.95); backdrop-filter: blur(10px); border: 1.5px solid #f3a83b; border-radius: 12px; padding: 15px; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: flex-start; gap: 12px; z-index: 9999; font-family: sans-serif; animation: slideInUp 0.5s ease;">
            <img src="/bd_mascot.png" alt="Cú" style="width: 40px; height: 40px; object-fit: contain; flex-shrink: 0;" onerror="this.src='https://bd-tips.vercel.app/bd_mascot.png'" />
            <div style="flex: 1;">
                <p style="margin: 0; font-size: 0.8rem; line-height: 1.4; color: #ecd9c6;">${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 8px; background: transparent; border: 1px solid #f3a83b; color: #f3a83b; border-radius: 4px; padding: 3px 10px; font-size: 0.7rem; cursor: pointer;">Tôi đi làm ngay!</button>
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

    if (!progress['check_in']) {
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
    hud.style.cssText = 'display: flex; align-items: center; gap: 8px; background: rgba(243, 168, 59, 0.1); border: 1px solid var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; color: var(--text-main); margin-right: 10px; margin-left: 10px; order: -1; align-self: center;';
    
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
        checkInAwarded = true;
    }

    if (currentCount >= config.limit) {
        if (checkInAwarded) {
            localStorage.setItem('b2b_points_balance', balance.toString());
            showPointToast(QUEST_CONFIG['check_in'].points, '☕ Cú Đêm Dậy Sớm Làm BD');
            updateUIElements();
        }
        return;
    }
    
    progress[actionType] = currentCount + 1;
    let addedPoints = config.points;
    
    if (actionType === 'game_complete' && metadata.perfect) {
        // perfect game is daily
        let perfectCount = dailyProgress['perfect_game'] || 0;
        if (perfectCount < QUEST_CONFIG['perfect_game'].limit) {
            dailyProgress['perfect_game'] = perfectCount + 1;
            localStorage.setItem(dailyProgressKey, JSON.stringify(dailyProgress));
            addedPoints += QUEST_CONFIG['perfect_game'].points;
        }
    }
    
    balance += addedPoints;
    
    localStorage.setItem('b2b_points_balance', balance.toString());
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
