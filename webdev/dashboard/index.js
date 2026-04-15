const userID = localStorage.getItem('userID');
if (!userID) {
    window.location.href = "../login/index.html";
}

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

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
let lastTriggeredPill = null;

const API_URL = 'https://appeals-ar44.onrender.com';

async function updateNextPill() {
    try {
        const response = await fetch(`${API_URL}/vzemi-schedule?userID=${userID}`);
        const schedule = await response.json();

        if (!schedule || schedule.length === 0) {
            nextPillTime.textContent = "No pills scheduled";
            nextPillInfo.textContent = "";
            return;
        }

        const now = new Date();
        let currentDay = (now.getDay() + 1) % 7;
        
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Check if any pill is scheduled for the current minute
        schedule.forEach(pill => {
            if (pill.d === currentDay && pill.h === currentHour && pill.m === currentMinute) {
                const pillId = `${pill.d}-${pill.h}-${pill.m}-${pill.b}`;
                if (lastTriggeredPill !== pillId) {
                    console.log(`Time for pill! Triggering warning state for pill ID: ${pillId}`);
                    enterWarningState();
                    lastTriggeredPill = pillId;
                }
            }
        });

        const nowMinutes = currentDay * 1440 + currentHour * 60 + currentMinute;

        let nextPill = null;
        let minDiff = Infinity;

        schedule.forEach(pill => {
            let pillMinutes = pill.d * 1440 + pill.h * 60 + pill.m;
            let diff = pillMinutes - nowMinutes;

            if (diff <= 0) {
                diff += 7 * 1440;
            }

            if (diff < minDiff) {
                minDiff = diff;
                nextPill = pill;
            }
        });

        if (nextPill) {
            const boxes = [];
            for (let i = 0; i < 6; i++) {
                if ((nextPill.b & (1 << i)) > 0) {
                    boxes.push(i + 1);
                }
            }
            const boxesText = boxes.length > 1 ? `Boxes ${boxes.join(', ')}` : `Box ${boxes[0]}`;

            nextPillTime.textContent = `${nextPill.h.toString().padStart(2, '0')}:${nextPill.m.toString().padStart(2, '0')}`;
            nextPillInfo.textContent = `${daysOfWeek[nextPill.d]} - ${boxesText}`;
        }
    } catch (err) {
        console.error("Failed to fetch schedule:", err);
        nextPillTime.textContent = "Error loading schedule";
    }
}

updateNextPill();
setInterval(updateNextPill, 10000);

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
    statusText.textContent = 'Connected! Nothing for now.';
    statusText.style.color = "rgb(253, 117, 255)";
});

client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);

    if (topic === 'esp32/has_taken_pill') {
        resetState();
    }
});

client.on('error', (err) => {
    console.error('Connection error: ', err);
    statusText.textContent = 'Connection error!';
    statusText.style.color = "red";
});
