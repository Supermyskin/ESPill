const API_URL = 'https://appeals-ar44.onrender.com';

const daysWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function addToJSON(i) {

    let hourText = document.getElementById('hour-input').value;
    let minuteText = document.getElementById('minute-input').value;

    let hourNumber = parseInt(hourText, 10);
    let minuteNumber = parseInt(minuteText, 10);

    let a = [];
    let hasPills = false;
    let tooManyPills = false;
    for (let b = 1; b <= 6; b++) {
        let val = parseInt(document.getElementById(`pill-input-${b}`).value, 10) || 0;
        if (val > 255) tooManyPills = true;
        a.push(val);
        if (val > 0) hasPills = true;
    }

    if (tooManyPills) {
        alert("Maximum 255 pills allowed per box.");
        return;
    }

    if (isNaN(hourNumber) || isNaN(minuteNumber) || !hasPills) {
        alert("Please enter a time and at least one pill in any box.");
        return;
    }

    if (hourNumber > 23 || hourNumber < 0 || minuteNumber > 59 || minuteNumber < 0) {
        alert("Please enter a valid time");
        return;
    }

    const userID = localStorage.getItem('userID');
    if (!userID) {
        alert("Please login to add schedule items.");
        window.location.href = "../../login/index.html";
        return;
    }

    let newEntry = {
        "userID": userID,
        "d": i,
        "h": hourNumber,
        "m": minuteNumber,
        "a": a
    };

    fetch(`${API_URL}/dobavi-schedule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
    })
        .then(response => {
            if (response.ok) {
                location.reload();
            } else {
                alert("Failed to add schedule item.");
            }
        })
        .catch(error => {
            console.log("problem:", error);
        });

};

document.addEventListener('DOMContentLoaded', function () {
    if (typeof checkLogin === 'function') {
        checkLogin();
    } else {
        const tempUserID = localStorage.getItem('userID');
        if (!tempUserID) {
            window.location.href = "../../login/index.html";
            return;
        }
    }

    const userID = localStorage.getItem('userID');
    let pageWeekday = document.getElementById('weekday')

    fetch(`${API_URL}/vzemi-schedule?userID=${userID}`)
        .then(response => response.json())
        .then(data => {

            let scheduleListDiv = document.getElementById('schedule-list');
            let scheduleItem = "";

            for (let i = 0; i < data.length; i++) {
                let item = data[i];

                if (item.d === parseInt(pageWeekday.getAttribute('weekday-num'), 10)) {

                    let boxesHtml = "";
                    if (item.a && Array.isArray(item.a)) {
                        item.a.forEach((amt, index) => {
                            if (amt > 0) {
                                boxesHtml += `
                                    <span class="box-badge">
                                        <i class="fa-solid fa-box-archive"></i>
                                        <span>Box ${index + 1}</span>
                                        <span class="pill-count">${amt} <i class="fa-solid fa-pills" style="font-size: 0.6rem; color: white;"></i></span>
                                    </span>`;
                            }
                        });
                    }

                    let hourString = item.h.toString().padStart(2, '0');
                    let minuteString = item.m.toString().padStart(2, '0');

                    let dayWord = daysWeek[item.d];

                    scheduleItem += `
                        <div class="schedule-item">
                            <div class="time-info">
                                <span class="time">${hourString}:${minuteString}</span>
                                <span class="day">${dayWord}</span>
                            </div>
                            <div class="selected-boxes">
                                ${boxesHtml}
                            </div>
                            <button class="delete-btn" 
                                data-day="${item.d}" 
                                data-hour="${item.h}" 
                                data-minute="${item.m}" 
                                data-a='${JSON.stringify(item.a)}'>
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }

            scheduleListDiv.innerHTML = scheduleItem;

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const day = this.getAttribute('data-day');
                    const hour = this.getAttribute('data-hour');
                    const minute = this.getAttribute('data-minute');
                    const a = JSON.parse(this.getAttribute('data-a'));
                    deleteScheduleItem(day, hour, minute, a);
                });
            });
        })
        .catch(error => {
            console.log("problem:", error);
        });
});

function deleteScheduleItem(day, hour, minute, a) {
    const userID = localStorage.getItem('userID');
    const itemToDelete = {
        userID: userID,
        d: parseInt(day, 10),
        h: parseInt(hour, 10),
        m: parseInt(minute, 10),
        a: a
    };

    fetch(`${API_URL}/izbrishi-schedule`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemToDelete)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Item deleted:', data);
            location.reload();
        })
        .catch(error => {
            console.error('Error deleting schedule item:', error);
            alert('Failed to delete schedule item.');
        });
}