if (typeof checkLogin === 'function') {
    checkLogin();
}

const API_URL = 'https://appeals-ar44.onrender.com';

const client = mqtt.connect('wss://507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud:8884/mqtt', {
    username: 'ESPill',
    password: '1Qazxsw23edcvfr4'
});

const userID = localStorage.getItem('userID');
const dayCards = [...document.querySelectorAll('.day-card')];

client.on('connect', () => {
    console.log('Connected to MQTT broker!');
});

function formatTime(hour, minute) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function buildDaySummary(entries) {
    if (!entries.length) {
        return 'No pills set';
    }

    const times = entries
        .sort((a, b) => {
            if (a.h !== b.h) return a.h - b.h;
            return a.m - b.m;
        })
        .slice(0, 3)
        .map(item => formatTime(item.h, item.m));

    const suffix = entries.length > 3 ? ` +${entries.length - 3} more` : '';
    return `${times.join(' • ')}${suffix}`;
}

function renderDaySummaries(schedule) {
    dayCards.forEach(card => {
        const day = Number(card.dataset.day);
        const summary = card.querySelector('.day-summary');
        const dayEntries = schedule.filter(item => item.d === day);
        summary.textContent = buildDaySummary(dayEntries);
        card.classList.toggle('has-pills', dayEntries.length > 0);
    });
}

async function loadSchedulePreview() {
    if (!userID) {
        dayCards.forEach(card => {
            card.querySelector('.day-summary').textContent = 'Login required';
        });
        return;
    }

    try {
        const response = await fetch(`${API_URL}/vzemi-schedule?userID=${userID}`);
        const schedule = await response.json();
        renderDaySummaries(Array.isArray(schedule) ? schedule : []);
    } catch (error) {
        console.error("Error loading schedule preview:", error);
        dayCards.forEach(card => {
            card.querySelector('.day-summary').textContent = 'Unable to load';
        });
    }
}

loadSchedulePreview();

function uploadToESP() {
    if (!userID) {
        alert("Please login first.");
        window.location.href = "../login/index.html";
        return;
    }

    fetch(`${API_URL}/vzemi-schedule?userID=${userID}`)
        .then(response => response.json())
        .then(data => {
            // Sort by day, hour, minute
            const processedData = data.sort((a, b) => {
                if (a.d !== b.d) return a.d - b.d;
                if (a.h !== b.h) return a.h - b.h;
                return a.m - b.m;
            }).map(item => {
                // Keep the original box amounts and also send the bitmask for compatibility.
                let bitmask = 0;
                const amounts = Array.isArray(item.a) ? item.a.map(value => Math.max(0, Number(value) || 0)) : [0, 0, 0, 0, 0, 0];
                if (item.a && Array.isArray(item.a)) {
                    item.a.forEach((amt, index) => {
                        if (amt > 0) {
                            bitmask |= (1 << index);
                        }
                    });
                }
                return {
                    d: item.d,
                    h: item.h,
                    m: item.m,
                    a: amounts,
                    b: bitmask
                };
            });

            console.log("Publishing data:", processedData);
            client.publish('esp32/receive', JSON.stringify(processedData), { qos: 0 }, (error) => {
                if (error) {
                    alert("Error sending schedule to ESP32.");
                } else {
                    alert("Schedule sent to ESP32 successfully.");
                }
            });
        })
        .catch(error => {
            alert("Error getting schedule from server.");
        });
}

function clearSchedule() {
    if (!userID) {
        alert("Please login first.");
        window.location.href = "../login/index.html";
        return;
    }

    if (!confirm("Are you sure you want to clear your entire schedule? This cannot be undone.")) {
        return;
    }

    fetch(`${API_URL}/iztrii-vsichko-schedule?userID=${userID}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            alert("Schedule cleared successfully.");
            renderDaySummaries([]);
        })
        .catch(error => {
            console.error("Error clearing schedule:", error);
            alert("Error clearing schedule from server.");
        });
}
