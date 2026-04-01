document.querySelectorAll('.box-btn').forEach(button => {
    button.addEventListener('click', function () {
        this.classList.toggle('selected');
    });
});

const daysWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function addToJSON(i) {

    let hourText = document.getElementById('hour-input').value;
    let minuteText = document.getElementById('minute-input').value;

    let hourNumber = parseInt(hourText, 10);
    let minuteNumber = parseInt(minuteText, 10);

    let boxBitmask = 0;
    let allBoxes = document.querySelectorAll('.box-btn');

    for (let i = 0; i < allBoxes.length; i++) {
        let currentBox = allBoxes[i];

        if (currentBox.classList.contains('selected')) {
            let boxNumber = parseInt(currentBox.getAttribute('data-box'), 10);

            if (boxNumber === 1) boxBitmask = boxBitmask + 1;
            if (boxNumber === 2) boxBitmask = boxBitmask + 2;
            if (boxNumber === 3) boxBitmask = boxBitmask + 4;
            if (boxNumber === 4) boxBitmask = boxBitmask + 8;
            if (boxNumber === 5) boxBitmask = boxBitmask + 16;
            if (boxNumber === 6) boxBitmask = boxBitmask + 32;
        }
    }

    if (isNaN(hourNumber) || isNaN(minuteNumber) || boxBitmask === 0) {
        alert("Please enter a time and pick at least one box.");
        return;
    }

    if (hourNumber > 23 || hourNumber < 0 || minuteNumber > 59 || minuteNumber < 0) {
        alert("Please enter a valid time");
        return;
    }

    let newEntry = {
        "d": i,
        "h": hourNumber,
        "m": minuteNumber,
        "b": boxBitmask
    };

    fetch('http://127.0.0.1:3000/dobavi-schedule', {
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
    let pageWeekday = document.getElementById('weekday')

    fetch('http://127.0.0.1:3000/vzemi-schedule')
        .then(response => response.json())
        .then(data => {

            let scheduleListDiv = document.getElementById('schedule-list');
            let scheduleItem = "";

            for (let i = 0; i < data.length; i++) {
                let item = data[i];

                if (item.d === parseInt(pageWeekday.getAttribute('weekday-num'), 10)) {

                    let boxesHtml = "";
                    let b = item.b;

                    if ((b & 1) > 0) boxesHtml += `<span class="box-badge">1</span>`;
                    if ((b & 2) > 0) boxesHtml += `<span class="box-badge">2</span>`;
                    if ((b & 4) > 0) boxesHtml += `<span class="box-badge">3</span>`;
                    if ((b & 8) > 0) boxesHtml += `<span class="box-badge">4</span>`;
                    if ((b & 16) > 0) boxesHtml += `<span class="box-badge">5</span>`;
                    if ((b & 32) > 0) boxesHtml += `<span class="box-badge">6</span>`;

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
                            <button class="delete-btn" data-day="${item.d}" data-hour="${item.h}" data-minute="${item.m}" data-boxes="${item.b}">
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
                    const boxes = this.getAttribute('data-boxes');
                    deleteScheduleItem(day, hour, minute, boxes);
                });
            });
        })
        .catch(error => {
            console.log("problem:", error);
        });
});

function deleteScheduleItem(day, hour, minute, boxes) {
    const itemToDelete = {
        d: parseInt(day, 10),
        h: parseInt(hour, 10),
        m: parseInt(minute, 10),
        b: parseInt(boxes, 10)
    };

    fetch('http://127.0.0.1:3000/izbrishi-schedule', {
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
            // Reload the schedule list after successful deletion
            location.reload();
        })
        .catch(error => {
            console.error('Error deleting schedule item:', error);
            alert('Failed to delete schedule item.');
        });
}