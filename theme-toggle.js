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

const QUEST_CONFIG = {
    check_in: { points: 5, limit: 1, name: '☕ Chào Ngày Mới' },
    game_complete: { points: 10, limit: 2, name: '🎮 Thực Chiến B2B Challenge' },
    perfect_game: { points: 5, limit: 2, name: '⭐ Chốt Deal Xuất Sắc' },
    pic_search: { points: 3, limit: 3, name: '🔍 Săn Đầu Mối (PIC Finder)' },
    ai_email: { points: 3, limit: 3, name: '✍️ Soạn Cold Email AI' },
    labor_read: { points: 2, limit: 3, name: '⚖️ Phòng Vệ Pháp Lý' },
    salary_calc: { points: 2, limit: 3, name: '💸 Định Giá Hoa Hồng BD' },
    library_read: { points: 2, limit: 3, name: '📖 Nâng Cấp Tư Duy' },
    forum_post: { points: 8, limit: 1, name: '💬 Mở Khóa Case-Study' },
    forum_comment: { points: 3, limit: 3, name: '💬 Đồng Kiến Tạo Giải Pháp' },
    share_click: { points: 5, limit: 2, name: '📢 Đồng Hành Cùng Đồng Nghiệp' }
};

const CAMPAIGN_CONFIG = {
    id: 'campaign_outreach',
    title: 'Chiến Thần Cold Outreach ✉️',
    desc: 'Tối ưu hóa phễu tiếp cận khách hàng Enterprise.',
    bonus: 50,
    requirements: {
        pic_search: 3,
        ai_email: 3,
        share_click: 1
    }
};

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

function showCampaignCompletePopup() {
    if (document.getElementById('b2b-campaign-popup')) return;

    const popupHtml = `
      <div id="b2b-campaign-popup" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 99999; opacity: 0; transition: opacity 0.3s ease;">
        <div style="background: linear-gradient(135deg, #102d1f 0%, #081e13 100%); border: 2px solid #34d399; border-radius: 20px; max-width: 420px; width: 90%; padding: 30px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); position: relative; transform: scale(0.9); transition: transform 0.3s ease;">
          <div style="width: 90px; height: 90px; margin: 0 auto 15px auto; border-radius: 50%; border: 3px solid #34d399; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fffaf0;">
            <img src="/bd_mascot.png" alt="Cú BeeDee" style="width: 76px; height: 76px; display: block; object-fit: contain;" onerror="this.src='https://bd-tips.vercel.app/bd_mascot.png'" />
          </div>
          <h3 style="color: #34d399; margin: 10px 0; font-size: 1.4rem; font-weight: 800; font-family: sans-serif;">Chiến Dịch Hoàn Thành! 🏆</h3>
          <p style="color: #ecd9c6; font-size: 0.95rem; line-height: 1.6; margin: 15px 0 25px 0; font-family: sans-serif;">Chúc mừng chiến thần! Bạn đã xuất sắc hoàn thành mọi thử thách của chiến dịch <b>"Chiến Thần Cold Outreach" ✉️</b>! Cú BeeDee rất khâm phục tài năng outreach của bạn.</p>
          <div style="background: rgba(52, 211, 153, 0.15); border-radius: 12px; padding: 12px; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 8px;">
             <span style="font-size: 1.5rem;">🔥</span>
             <span style="color: #ffffff; font-size: 1.1rem; font-weight: bold; font-family: sans-serif;">+50 Bonus BD-Points</span>
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
    if (localStorage.getItem('b2b_campaign_completed_outreach') === 'true') return;
    
    const campaignProgressKey = 'b2b_campaign_progress_outreach';
    let campProgress = {};
    try {
        campProgress = JSON.parse(localStorage.getItem(campaignProgressKey) || '{}');
    } catch(e) {}
    
    if (!campProgress.pic_search) campProgress.pic_search = 0;
    if (!campProgress.ai_email) campProgress.ai_email = 0;
    if (!campProgress.share_click) campProgress.share_click = 0;
    
    if (CAMPAIGN_CONFIG.requirements[actionType]) {
        let current = campProgress[actionType] || 0;
        let req = CAMPAIGN_CONFIG.requirements[actionType];
        if (current < req) {
            campProgress[actionType] = Math.min(req, current + count);
            localStorage.setItem(campaignProgressKey, JSON.stringify(campProgress));
            
            let allDone = true;
            for (let key in CAMPAIGN_CONFIG.requirements) {
                if ((campProgress[key] || 0) < CAMPAIGN_CONFIG.requirements[key]) {
                    allDone = false;
                }
            }
            
            if (allDone) {
                localStorage.setItem('b2b_campaign_completed_outreach', 'true');
                let balance = parseInt(localStorage.getItem('b2b_points_balance') || '0', 10);
                balance += CAMPAIGN_CONFIG.bonus;
                localStorage.setItem('b2b_points_balance', balance.toString());
                showCampaignCompletePopup();
            }
        }
    }
}

function updateUIElements() {
    if (typeof renderQuestBoard === 'function') renderQuestBoard();
    if (typeof renderCampaignBoard === 'function') renderCampaignBoard();
    
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
    
    const progressKey = `b2b_quest_progress_${todayStr}`;
    let progress = {};
    try {
        progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
    } catch(e) {}
    
    const config = QUEST_CONFIG[actionType];
    if (!config) return;
    
    let currentCount = progress[actionType] || 0;
    
    let checkInAwarded = false;
    if (!progress['check_in']) {
        progress['check_in'] = 1;
        balance += QUEST_CONFIG['check_in'].points;
        checkInAwarded = true;
    }

    if (currentCount >= config.limit) {
        if (checkInAwarded) {
            localStorage.setItem('b2b_points_balance', balance.toString());
            localStorage.setItem(progressKey, JSON.stringify(progress));
            showPointToast(QUEST_CONFIG['check_in'].points, '☕ Chào Ngày Mới (Điểm danh)');
            updateUIElements();
        }
        return;
    }
    
    progress[actionType] = currentCount + 1;
    let addedPoints = config.points;
    
    if (actionType === 'game_complete' && metadata.perfect) {
        let perfectCount = progress['perfect_game'] || 0;
        if (perfectCount < QUEST_CONFIG['perfect_game'].limit) {
            progress['perfect_game'] = perfectCount + 1;
            addedPoints += QUEST_CONFIG['perfect_game'].points;
        }
    }
    
    balance += addedPoints;
    
    localStorage.setItem('b2b_points_balance', balance.toString());
    localStorage.setItem(progressKey, JSON.stringify(progress));
    
    const welcomeBanner = document.getElementById('streak-welcome-banner');
    if (welcomeBanner) welcomeBanner.remove();

    if (checkInAwarded) {
        showPointToast(QUEST_CONFIG['check_in'].points + addedPoints, `${config.name} & Chào Ngày Mới!`);
    } else {
        showPointToast(addedPoints, config.name);
    }
    
    updateCampaignProgress(actionType, 1);
    updateUIElements();
};

// Check quest status on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkQuestsOnLoad);
} else {
    checkQuestsOnLoad();
}
