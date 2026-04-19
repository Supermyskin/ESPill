const API_URL = 'https://appeals-ar44.onrender.com';

document.addEventListener('DOMContentLoaded', function () {
    // Redirect if already logged in
    if (localStorage.getItem('userID')) {
        window.location.href = '../account/index.html';
        return;
    }

    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
...

            const email = document.getElementById('email_input').value;
            const password = document.getElementById('password').value;

            fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.userId) {
                    localStorage.setItem('userID', data.userId);
                    localStorage.setItem('userName', data.name);
                    alert('Login successful!');
                    window.location.href = '../account/index.html';
                } else {
                    alert(data.message || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during login.');
            });
        });
    }
});
