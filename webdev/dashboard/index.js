const client = mqtt.connect('wss://507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud:8884/mqtt', {
    username: 'ESPill',
    password: '1Qazxsw23edcvfr4'
});

const statusText = document.getElementById('status-text');
const alertMessage = document.getElementById('alert-message');
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer');
const body = document.body;
const nextPillTime = document.getElementById('next-pill-time');
const nextPillInfo = document.getElementById('next-pill-info');

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function updateNextPill() {
    try {
        const response = await fetch('http://localhost:3000/vzemi-schedule');
        const schedule = await response.json();

        if (!schedule || schedule.length === 0) {
            nextPillTime.textContent = "No pills scheduled";
            nextPillInfo.textContent = "";
            return;
        }

        const now = new Date();
        const currentDay = now.getDay(); // 0-6
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Convert everything to "minutes from start of week" for comparison
        const nowMinutes = currentDay * 1440 + currentHour * 60 + currentMinute;

        let nextPill = null;
        let minDiff = Infinity;

        schedule.forEach(pill => {
            let pillMinutes = pill.d * 1440 + pill.h * 60 + pill.m;
            let diff = pillMinutes - nowMinutes;

            // If it's earlier in the week, it's for next week
            if (diff <= 0) {
                diff += 7 * 1440;
            }

            if (diff < minDiff) {
                minDiff = diff;
                nextPill = pill;
            }
        });

        if (nextPill) {
            nextPillTime.textContent = `${nextPill.h.toString().padStart(2, '0')}:${nextPill.m.toString().padStart(2, '0')}`;
            nextPillInfo.textContent = `${daysOfWeek[nextPill.d]} - Box ${nextPill.b}`;
        }
    } catch (err) {
        console.error("Failed to fetch schedule:", err);
        nextPillTime.textContent = "Error loading schedule";
    }
}

// Initial fetch and refresh every minute
updateNextPill();
setInterval(updateNextPill, 60000);

let pillTimer = null;
let secondsRemaining = 300;

function startTimer() {
    clearInterval(pillTimer);
    secondsRemaining = 300;
    updateTimerDisplay();

    pillTimer = setInterval(() => {
        secondsRemaining--;
        updateTimerDisplay();

        if (secondsRemaining <= 0) {
            clearInterval(pillTimer);
            enterAlertState();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function enterWarningState() {
    body.classList.remove('alert');
    body.classList.add('warning');
    alertMessage.classList.remove('hidden');
    timerContainer.classList.remove('hidden');
    statusText.textContent = 'Action Required: Take your pill';
    startTimer();
}

function enterAlertState() {
    body.classList.remove('warning');
    body.classList.add('alert');
    statusText.textContent = 'URGENT: PILL OVERDUE!';
}

function resetState() {
    clearInterval(pillTimer);
    body.classList.remove('warning', 'alert');
    alertMessage.classList.add('hidden');
    timerContainer.classList.add('hidden');
    statusText.textContent = 'System Ready: All pills taken';
}

client.on('connect', () => {
    console.log('Connected to MQTT');
    client.subscribe('esp32/has_taken_pill');
    client.subscribe('esp32/hasnt_taken_pill');
    statusText.textContent = 'Connected! Nothing for now.';
    statusText.style.color = "rgb(253, 117, 255)";
});

client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);

    if (topic === 'esp32/hasnt_taken_pill') {
        enterWarningState();
    } else if (topic === 'esp32/has_taken_pill') {
        resetState();
    }
});

client.on('error', (err) => {
    console.error('Connection error: ', err);
    statusText.textContent = 'Connection error!';
    statusText.style.color = "red";
});
