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
    const header = document.querySelector('.header');

    if (!header) return;

    // Find the login link
    const loginLink = Array.from(header.querySelectorAll('a')).find(a => a.innerText.includes('Login'));

    if (userName) {
        if (loginLink) {
            loginLink.innerHTML = `<i class="fa-solid fa-user"></i> ${userName}`;
            loginLink.href = "../account/index.html";

            if (!document.getElementById('logout-btn')) {
                const logoutBtn = document.createElement('a');
                logoutBtn.id = 'logout-btn';
                logoutBtn.href = "#";
                logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
                logoutBtn.style.cursor = "pointer";
                logoutBtn.onclick = function () {
                    localStorage.removeItem('userID');
                    localStorage.removeItem('userName');
                    window.location.href = "../landing/index.html";
                };
                loginLink.parentNode.appendChild(logoutBtn);
            }
        }
    } else {
        // Ensure it shows Login if not logged in
        if (loginLink) {
            loginLink.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
            loginLink.href = "../login/index.html";
        }
    }
}

function getUserID() {
    return localStorage.getItem('userID');
}

function checkLogin() {
    if (!getUserID()) {
        window.location.href = "../login/index.html";
    }
}
