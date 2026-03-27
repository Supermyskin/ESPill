document.addEventListener('DOMContentLoaded', function () {

    fetch('http://127.0.0.1:3000/vzemi-schedule')
        .then(response => response.json())
        .then(data => {

            let instructions = document.getElementById('instructions');

            if (data.length === 0) {

                instructions.innerHTML = `
                    Your pill schedule is currently <span style="color: rgb(254, 177, 255);">empty! </span><br><br>
                    Head over to the <a href="../schedule/index.html" style="color: rgb(254, 177, 255);">Schedule</a> tab to set up your first reminder.
                `;

            } else {
                instructions.innerHTML = `You currently have set-up your reminders get so go to the <a href="../dashboard/index.html" style="color: rgb(254, 177, 255);">Dashboard</a>.`;
            }

        })
        .catch(error => {
            console.log("problem:", error);
            document.getElementById('instructions').innerText = "Error loading schedule data.";
        });
});