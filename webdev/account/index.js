const userID = localStorage.getItem('userID');
const userName = localStorage.getItem('userName');
const API_URL = 'https://appeals-ar44.onrender.com';

if (!userID) {
    window.location.href = "../login/index.html";
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('user-greeting').textContent = `Hello, ${userName || 'User'}!`;
    document.getElementById('user-id-display').textContent = `User ID: ${userID}`;

    fetchSchedule();
    renderChart();
});

async function fetchSchedule() {
    const container = document.getElementById('pills-container');
    try {
        const response = await fetch(`${API_URL}/vzemi-schedule?userID=${userID}`);
        const schedule = await response.json();

        if (!schedule || schedule.length === 0) {
            container.innerHTML = '<p>No pills scheduled for this week.</p>';
            return;
        }

        container.innerHTML = '';
        const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        schedule.sort((a, b) => (a.d * 1440 + a.h * 60 + a.m) - (b.d * 1440 + b.h * 60 + b.m));

        schedule.forEach(pill => {
            const boxes = [];
            if (pill.a && Array.isArray(pill.a)) {
                pill.a.forEach((amt, index) => {
                    if (amt > 0) {
                        boxes.push(index + 1);
                    }
                });
            }
            const boxesText = boxes.length > 1 ? `Boxes ${boxes.join(', ')}` : (boxes.length === 1 ? `Box ${boxes[0]}` : 'No boxes');

            const item = document.createElement('div');
            item.className = 'pill-item';
            item.innerHTML = `
                <div>
                    <div class="pill-time">${pill.h.toString().padStart(2, '0')}:${pill.m.toString().padStart(2, '0')}</div>
                    <div class="pill-day">${days[pill.d]}</div>
                </div>
                <div class="pill-boxes">${boxesText}</div>
            `;
            container.appendChild(item);
        });

    } catch (err) {
        console.error("Error fetching schedule:", err);
        container.innerHTML = '<p>Error loading schedule.</p>';
    }
}

function renderChart() {
    const ctx = document.getElementById('adherenceChart').getContext('2d');

    // Mock for adherence over the last 7 days
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const onTimeData = [3, 2, 4, 3, 3, 2, 1];
    const lateData = [0, 1, 0, 1, 0, 1, 2];
    const missedData = [0, 0, 0, 0, 1, 0, 1];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'On Time',
                    data: onTimeData,
                    backgroundColor: 'rgba(254, 177, 255, 0.7)',
                    borderColor: 'rgba(254, 177, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Late',
                    data: lateData,
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Missed',
                    data: missedData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', stepSize: 1 }
                }
            },
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            }
        }
    });
}
