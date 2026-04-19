document.addEventListener('DOMContentLoaded', function () {
    updateHeader();
    setupMobileMenu();
    initNotifications();
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
    const userID = localStorage.getItem('userID');
    const accountLink = document.getElementById('header-account-link');

    if (!accountLink) return;

    if (userID) {
        const displayName = userName || 'Account';
        accountLink.innerHTML = `<i class="fa-solid fa-user"></i> ${displayName}`;
        
        const isDeep = window.location.pathname.includes('/schedule/weekdays/');
        accountLink.href = isDeep ? "../../account/index.html" : "../account/index.html";

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

const NOTIF_API_URL = 'https://appeals-ar44.onrender.com';
const NOTIFICATION_STORAGE_KEY = 'espillLastNotificationKey';
const NOTIFICATION_PERMISSION_KEY = 'espillNotificationPrompted';
const NOTIFICATION_LOOKBACK_MINUTES = 2;

const firebaseConfig = {
  apiKey: "AIzaSyBTPE3WdzmEs78QYPDBfIeiFUWsld5s2Hg",
  authDomain: "espill-bef28.firebaseapp.com",
  projectId: "espill-bef28",
  storageBucket: "espill-bef28.firebasestorage.app",
  messagingSenderId: "214168500400",
  appId: "1:214168500400:web:25c8019640837761ed6375",
  measurementId: "G-GYNR6GQ7ZC"
};

// Initialize Firebase if the SDK is loaded
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}

async function subscribeToPush(registration) {
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK not loaded. Push notifications will not work.");
        return;
    }

    try {
        const messaging = firebase.messaging();
        const currentToken = await messaging.getToken({
            vapidKey: 'BGtzX8MTC2a4HVTHoXnI3mqAB3Wrvd85YOK4cRegRACgfh_vJ1EYWAX8KtVyBDnGcbO4aC3qov_AbcAOUAdvm2w',
            serviceWorkerRegistration: registration
        });

        if (currentToken) {
            const userID = getUserID();
            if (!userID) return;

            await fetch(`${NOTIF_API_URL}/subscribe`, {
                method: 'POST',
                body: JSON.stringify({ userId: userID, token: currentToken }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("FCM subscription successful");
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (error) {
        console.error("Failed to subscribe to FCM notifications:", error);
    }
}

let notificationServiceWorker = null;

function isDeepRoute() {
    return window.location.pathname.includes('/schedule/weekdays/');
}

function getDashboardIconPath() {
    if (window.location.pathname.includes('/weekdays/')) {
        return "../../dashboard/icon.png";
    }

    if (
        window.location.pathname.includes('/main/') ||
        window.location.pathname.includes('/dashboard/') ||
        window.location.pathname.includes('/account/') ||
        window.location.pathname.includes('/schedule/')
    ) {
        return "../dashboard/icon.png";
    }

    return "./dashboard/icon.png";
}

function getNotificationServiceWorkerPath() {
    return isDeepRoute() ? "../../main/notification-sw.js" : "../main/notification-sw.js";
}

async function registerNotificationServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register(getNotificationServiceWorkerPath());
        notificationServiceWorker = registration;
        return registration;
    } catch (error) {
        console.error("Failed to register notification service worker:", error);
        return null;
    }
}

async function requestNotificationPermission() {
    if (!("Notification" in window) || Notification.permission !== "default") {
        return Notification.permission;
    }

    try {
        const permission = await Notification.requestPermission();
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');

        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            await subscribeToPush(registration);
        }

        return permission;
    } catch (error) {
        console.error("Failed to request notification permission:", error);
        return Notification.permission;
    }
}

function bindNotificationPermissionPrompt() {
    if (!("Notification" in window) || Notification.permission !== "default") {
        return;
    }

    if (localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true') {
        return;
    }

    const prompt = () => {
        requestNotificationPermission();
        window.removeEventListener('click', prompt);
        window.removeEventListener('touchstart', prompt);
        window.removeEventListener('keydown', prompt);
    };

    window.addEventListener('click', prompt, { once: true });
    window.addEventListener('touchstart', prompt, { once: true });
    window.addEventListener('keydown', prompt, { once: true });
}

async function showAppNotification(title, options = {}) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return false;
    }

    const notificationOptions = {
        icon: getDashboardIconPath(),
        badge: getDashboardIconPath(),
        tag: options.tag || title,
        renotify: true,
        ...options
    };

    try {
        const registration = notificationServiceWorker || await navigator.serviceWorker?.getRegistration();
        if (registration && typeof registration.showNotification === 'function') {
            await registration.showNotification(title, notificationOptions);
            return true;
        }

        new Notification(title, notificationOptions);
        return true;
    } catch (error) {
        console.error("Failed to show notification:", error);
        return false;
    }
}

function buildNotificationKey(pill, now) {
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return `${dateKey}-${pill.d}-${pill.h}-${pill.m}-${JSON.stringify(pill.a || [])}`;
}

function getMinutesFromWeekStart(date) {
    const day = (date.getDay() + 1) % 7;
    return day * 1440 + date.getHours() * 60 + date.getMinutes();
}

function isNotificationDue(pill, now) {
    const nowMinutes = getMinutesFromWeekStart(now);
    const pillMinutes = pill.d * 1440 + pill.h * 60 + pill.m;
    const diff = nowMinutes - pillMinutes;

    return diff >= 0 && diff <= NOTIFICATION_LOOKBACK_MINUTES;
}

function shouldUseScheduleNotifications() {
    return !window.location.pathname.includes('/dashboard/');
}

async function initNotifications() {
    bindNotificationPermissionPrompt();
    await registerNotificationServiceWorker();
}

async function checkPillSchedule() {
    const userID = localStorage.getItem('userID');
    if (!userID || !("Notification" in window) || Notification.permission !== "granted") return;

    try {
        const response = await fetch(`${NOTIF_API_URL}/vzemi-schedule?userID=${userID}`);
        const schedule = await response.json();

        if (!schedule || schedule.length === 0) return;

        const now = new Date();
        schedule.forEach(pill => {
            if (isNotificationDue(pill, now)) {
                const notificationKey = buildNotificationKey(pill, now);
                if (localStorage.getItem(NOTIFICATION_STORAGE_KEY) !== notificationKey) {
                    showAppNotification("ESPill Reminder", {
                        body: "It's time to take your pill!",
                        tag: `pill-reminder-${notificationKey}`
                    });
                    localStorage.setItem(NOTIFICATION_STORAGE_KEY, notificationKey);
                }
            }
        });
    } catch (err) {
        console.error("Failed to check schedule for notifications:", err);
    }
}

window.showAppNotification = showAppNotification;

if (localStorage.getItem('userID') && shouldUseScheduleNotifications()) {
    setInterval(checkPillSchedule, 60000);
    checkPillSchedule();
}
