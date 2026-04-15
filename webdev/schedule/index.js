const API_URL = 'https://appeals-ar44.onrender.com';

const client = mqtt.connect('wss://507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud:8884/mqtt', {
    username: 'ESPill',
    password: '1Qazxsw23edcvfr4'
});

client.on('connect', () => {
    console.log('Connected to MQTT broker!');
});

function uploadToESP() {
    const userID = localStorage.getItem('userID');
    if (!userID) {
        alert("Please login first.");
        window.location.href = "../login/index.html";
        return;
    }

    fetch(`${API_URL}/vzemi-schedule?userID=${userID}`)
        .then(response => response.json())
        .then(data => {
            console.log("Publishing data:", data);
            client.publish('esp32/receive', JSON.stringify(data), { qos: 0 }, (error) => {
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