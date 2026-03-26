const brokerUrl = 'wss://c1d253884ce6464f85c084b6f8d77bbc.s1.eu.hivemq.cloud:8884/mqtt';

const options = {
    username: 'HackerCatcho',
    password: 'YxjyiPT!t_v5T_9'
};

const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
    document.getElementById('status').innerText = "Connected! Ready for data.";
    document.getElementById('status').style.color = "green";

    client.subscribe('esp32/subscribed');
    console.log("Subscribed to esp32/subscribed");
});

client.on('message', (topic, message) => {
    if (topic === 'esp32/water_sensor') {
        try {
            const data = JSON.parse(message.toString());
            console.log(data.water_level)
        } catch (e) {
            console.log("Could not read JSON data", message.toString());
        }
    }
});

function requestWaterData() {
    client.publish('esp32/receive', 'GET_WATER');
    console.log("Command 'GET_WATER' sent to esp32/receive");
}