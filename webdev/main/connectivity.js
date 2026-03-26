const client = mqtt.connect('wss://507f68c94c1b48c6b9a345e8a073e5cd.s1.eu.hivemq.cloud:8884/mqtt', {
    username: 'ESPill',
    password: '1Qazxsw23edcvfr4'
});

client.on('connect', () => {
    client.subscribe('esp32/has_taken_pill');

    document.getElementById('status').innerHTML = 'Connected! <span style="color: white; weight: 100;">Ready for data.</span>';
    document.getElementById('status').style.color = "rgb(253, 117, 255)";

});

client.on('message', (topic, message) => {
    if (topic === 'esp32/has_taken_pill') {
        try {
            const data = JSON.parse(message.toString());
            console.log(data.pill_taken)
        } catch (e) {
            console.log("JSON data error: ", message.toString());
        }
    }
});