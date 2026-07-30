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
// B2B STREAK ACTION-BASED TRACKING SYSTEM
// ==========================================

function showStreakWelcomeBanner(status) {
    if (document.getElementById('streak-welcome-banner')) return;
    let message = '';
    if (status === 'pending') {
        message = '🦉 Chào chiến thần! Hôm nay bạn chưa ôn luyện. Hãy làm 1 hành động (chơi game, tìm PIC, viết email...) để duy trì chuỗi Streak nhé!';
    } else {
        message = '😢 Ôi không! Cú BeeDee buồn quá. Chuỗi ngày Streak của bạn đã bị đứt do hôm qua bạn bận. Hãy giải 1 thử thách để bắt đầu lại chuỗi ngày mới nhé!';
    }

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

function checkStreakOnLoad() {
    if (localStorage.getItem('streak_active') !== 'true') return;
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = localStorage.getItem('streak_last_active_date');
    if (!lastActive) return;

    const lastDate = new Date(lastActive);
    const todayDate = new Date(todayStr);
    lastDate.setHours(0,0,0,0);
    todayDate.setHours(0,0,0,0);

    const diffTime = todayDate - lastDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        showStreakWelcomeBanner('pending');
    } else if (diffDays > 1) {
        showStreakWelcomeBanner('broken');
    }
}

function showStreakPopup(streak, type) {
    if (document.getElementById('b2b-streak-popup')) return;

    let title = '';
    let message = '';

    if (type === 'first') {
        title = 'Streak Đã Kích Hoạt! 🔥';
        message = 'Chào mừng chiến thần! Chuỗi Streak B2B của bạn đã chính thức bắt đầu đạt mốc <b>1 ngày</b>! Hãy rèn luyện mỗi ngày để mở khóa kho quà tặng xịn nhé!';
    } else if (type === 'keep') {
        title = 'Giữ Vững Streak! 🦉🔥';
        message = `Xuất sắc chiến thần! Bạn đã duy trì chuỗi Streak liên tiếp <b>${streak} ngày</b>! Cú BeeDee cực kỳ tự hào về kỷ luật thép và tinh thần chiến đấu của bạn.`;
    } else if (type === 'restart') {
        title = 'Streak Mới Đã Bắt Đầu! 🌱';
        message = 'Cú BeeDee ôm chầm lấy bạn... Hôm qua bạn bận nên chuỗi bị đứt, nhưng hôm nay bạn đã quay lại ôn luyện cực kỳ xuất sắc! Bắt đầu lại chuỗi Streak <b>1 ngày</b> nào!';
    }

    const popupHtml = `
      <div id="b2b-streak-popup" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 99999; opacity: 0; transition: opacity 0.3s ease;">
        <div style="background: linear-gradient(135deg, #2d1f10 0%, #1e1208 100%); border: 2px solid #f3a83b; border-radius: 20px; max-width: 420px; width: 90%; padding: 30px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); position: relative; transform: scale(0.9); transition: transform 0.3s ease;">
          <div style="width: 90px; height: 90px; margin: 0 auto 15px auto; border-radius: 50%; border: 3px solid #f3a83b; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fffaf0;">
            <img src="/bd_mascot.png" alt="Cú BeeDee" style="width: 76px; height: 76px; display: block; object-fit: contain;" onerror="this.src='https://bd-tips.vercel.app/bd_mascot.png'" />
          </div>
          <h3 style="color: #f3a83b; margin: 10px 0; font-size: 1.4rem; font-weight: 800; font-family: sans-serif;">${title}</h3>
          <p style="color: #ecd9c6; font-size: 0.95rem; line-height: 1.6; margin: 15px 0 25px 0; font-family: sans-serif;">${message}</p>
          <div style="background: rgba(243, 168, 59, 0.15); border-radius: 12px; padding: 12px; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 8px;">
             <span style="font-size: 1.5rem;">🔥</span>
             <span style="color: #ffffff; font-size: 1.1rem; font-weight: bold; font-family: sans-serif;">${streak} Ngày Streak</span>
          </div>
          <button id="btn-streak-popup-close" style="background: linear-gradient(135deg, #f3a83b 0%, #d48317 100%); color: #ffffff; border: none; border-radius: 8px; padding: 12px 30px; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: transform 0.2s ease; width: 100%;">Tuyệt Vời!</button>
        </div>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = popupHtml;
    const popupEl = tempDiv.firstElementChild;
    document.body.appendChild(popupEl);

    // Trigger transition
    setTimeout(() => {
        popupEl.style.opacity = '1';
        popupEl.querySelector('div').style.transform = 'scale(1)';
    }, 50);

    const closeBtn = popupEl.querySelector('#btn-streak-popup-close');
    closeBtn.addEventListener('click', () => {
        popupEl.style.opacity = '0';
        popupEl.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => {
            popupEl.remove();
        }, 300);
    });
}

window.registerUserAction = function() {
    if (localStorage.getItem('streak_active') !== 'true') return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = localStorage.getItem('streak_last_active_date');
    let streak = parseInt(localStorage.getItem('streak_days') || '0', 10);

    if (!lastActive) {
        streak = 1;
        localStorage.setItem('streak_days', '1');
        localStorage.setItem('streak_last_active_date', todayStr);
        showStreakPopup(1, 'first');
    } else {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(todayStr);
        lastDate.setHours(0,0,0,0);
        todayDate.setHours(0,0,0,0);

        const diffTime = todayDate - lastDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak += 1;
            localStorage.setItem('streak_days', streak.toString());
            localStorage.setItem('streak_last_active_date', todayStr);
            showStreakPopup(streak, 'keep');
        } else if (diffDays > 1) {
            streak = 1;
            localStorage.setItem('streak_days', '1');
            localStorage.setItem('streak_last_active_date', todayStr);
            showStreakPopup(1, 'restart');
        } else if (diffDays === 0) {
            // Already did an action today, do nothing
        }
    }

    // Dismiss welcome banner if exists
    const welcomeBanner = document.getElementById('streak-welcome-banner');
    if (welcomeBanner) welcomeBanner.remove();

    // Call local update helpers if we are on index page
    if (typeof updateWelcomeBanner === 'function') updateWelcomeBanner(streak);
    if (typeof updateRewardShopUI === 'function') updateRewardShopUI(streak);
};

// Check streak status on every page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkStreakOnLoad);
} else {
    checkStreakOnLoad();
}
