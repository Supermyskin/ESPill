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

async function renderChart() {
    const ctx = document.getElementById('adherenceChart').getContext('2d');

    let stats = [];
    try {
        const response = await fetch(`${API_URL}/vzemi-stats?userID=${userID}`);
        stats = await response.json();
    } catch (err) {
        console.error("Error fetching stats:", err);
    }

    const labels = [];
    const onTimeData = [];
    const lateData = [];
    const missedData = [];

    // Initialize data for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(dayLabel);
        onTimeData.push(0);
        lateData.push(0);
        missedData.push(0);
    }

    // Process stats into the daily buckets
    stats.forEach(stat => {
        const statDate = new Date(stat.timestamp);
        const diffDays = Math.floor((new Date() - statDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < 7) {
            const index = 6 - diffDays;
            if (stat.type === 'onTime') onTimeData[index]++;
            else if (stat.type === 'late') lateData[index]++;
            else if (stat.type === 'missed') missedData[index]++;
        }
    });

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
