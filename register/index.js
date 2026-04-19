const API_URL = 'https://appeals-ar44.onrender.com';

document.addEventListener('DOMContentLoaded', function () {
    // Redirect if already logged in
    if (localStorage.getItem('userID')) {
        window.location.href = '../account/index.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
...

            const name = document.getElementById('name_input').value;
            const email = document.getElementById('email_input').value;
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirm_password').value;

            if (password !== confirm) {
                alert('Passwords do not match!');
                return;
            }

            fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.userId) {
                    alert('Registration successful! Redirecting to login...');
                    window.location.href = '../login/index.html';
                } else {
                    alert(data.message || 'Registration failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during registration.');
            });
        });
    }
});
