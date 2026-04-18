document.addEventListener('DOMContentLoaded', function () {
    updateHeader();
    setupMobileMenu();
});

function setupMobileMenu() {
    const toggle = document.getElementById('header-toggle');
    const header = document.querySelector('.header');
    if (toggle && header) {
        toggle.addEventListener('click', () => {
            header.classList.toggle('active');
            const icon = toggle.querySelector('i');
            if (header.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }
}

function updateHeader() {
    const userName = localStorage.getItem('userName');
    const accountLink = document.getElementById('header-account-link');

    if (!accountLink) return;

    if (userName) {
        accountLink.innerHTML = `<i class="fa-solid fa-user"></i> ${userName}`;
        accountLink.href = (window.location.pathname.includes('/schedule/weekdays/')) ? "../../account/index.html" : "../account/index.html";
        
        // Handle paths correctly based on directory depth
        const isDeep = window.location.pathname.includes('/schedule/weekdays/');
        const landingPath = isDeep ? "../../landing/index.html" : "../landing/index.html";

        if (!document.getElementById('logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'logout-btn';
            logoutBtn.href = "#";
            logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
            logoutBtn.style.cursor = "pointer";
            logoutBtn.onclick = function (e) {
                e.preventDefault();
                localStorage.removeItem('userID');
                localStorage.removeItem('userName');
                window.location.href = landingPath;
            };
            accountLink.parentNode.appendChild(logoutBtn);
        }
    } else {
        accountLink.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
        // Handle paths correctly
        const isDeep = window.location.pathname.includes('/schedule/weekdays/');
        accountLink.href = isDeep ? "../../../login/index.html" : "../login/index.html";
        
        const existingLogout = document.getElementById('logout-btn');
        if (existingLogout) {
            existingLogout.remove();
        }
    }
}

function getUserID() {
    return localStorage.getItem('userID');
}

function checkLogin() {
    if (!getUserID()) {
        const isDeep = window.location.pathname.includes('/schedule/weekdays/');
        const loginPath = isDeep ? "../../login/index.html" : "../login/index.html";
        window.location.href = loginPath;
    }
}

// Notification logic
const NOTIF_API_URL = 'https://appeals-ar44.onrender.com';

async function checkPillSchedule() {
    const userID = localStorage.getItem('userID');
    if (!userID || !("Notification" in window) || Notification.permission !== "granted") return;

    try {
        const response = await fetch(`${NOTIF_API_URL}/vzemi-schedule?userID=${userID}`);
        const schedule = await response.json();

        if (!schedule || schedule.length === 0) return;

        const now = new Date();
        const currentDay = (now.getDay() + 1) % 7;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        schedule.forEach(pill => {
            if (pill.d === currentDay && pill.h === currentHour && pill.m === currentMinute) {
                const pillId = `notif-${pill.d}-${pill.h}-${pill.m}`;
                if (localStorage.getItem('lastNotifiedPill') !== pillId) {
                    new Notification("ESPill Reminder", { 
                        body: "It's time to take your pill!",
                        icon: window.location.pathname.includes('/weekdays/') ? "../../dashboard/icon.png" : (window.location.pathname.includes('/main/') || window.location.pathname.includes('/dashboard/') || window.location.pathname.includes('/account/') || window.location.pathname.includes('/schedule/') ? "../dashboard/icon.png" : "./dashboard/icon.png")
                    });
                    localStorage.setItem('lastNotifiedPill', pillId);
                }
            } else {
                // Clear old notification ID if time passed
                const oldPillId = `notif-${pill.d}-${pill.h}-${pill.m}`;
                if (localStorage.getItem('lastNotifiedPill') === oldPillId && (pill.h !== currentHour || pill.m !== currentMinute)) {
                    // We don't necessarily need to clear it, but let's keep it clean
                }
            }
        });
    } catch (err) {
        console.error("Failed to check schedule for notifications:", err);
    }
}

if (localStorage.getItem('userID')) {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
    setInterval(checkPillSchedule, 60000);
    checkPillSchedule();
}
