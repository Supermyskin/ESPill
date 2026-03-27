const client = mqtt.connect('wss://507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud:8884/mqtt', {
    username: 'ESPill',
    password: '1Qazxsw23edcvfr4'
});

client.on('connect', () => {
    console.log('Connected to MQTT broker!');
});

function uploadToESP() {
    fetch('http://127.0.0.1:3000/vzemi-schedule')
        .then(response => response.json())
        .then(data => {
            console.log("Publishing data:", data);
            client.publish('esp32/recieve', JSON.stringify(data), { qos: 1 }, (error) => {
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