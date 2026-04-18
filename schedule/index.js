if (typeof checkLogin === 'function') {
    checkLogin();
}

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
            // Sort by day, hour, minute
            const processedData = data.sort((a, b) => {
                if (a.d !== b.d) return a.d - b.d;
                if (a.h !== b.h) return a.h - b.h;
                return a.m - b.m;
            }).map(item => {
                // Convert array 'a' to bitmask 'b' for the ESP32
                let bitmask = 0;
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
    const userID = localStorage.getItem('userID');
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
        })
        .catch(error => {
            console.error("Error clearing schedule:", error);
            alert("Error clearing schedule from server.");
        });
}