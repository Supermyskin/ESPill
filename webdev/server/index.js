const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/vzemi-schedule', function (req, res) {

    let existingData = fs.readFileSync('./schedule.json', 'utf8');

    if (existingData !== "") {
        res.json(JSON.parse(existingData));
        return;
    }
    else {
        res.json([])
    }
});

app.post('/dobavi-schedule', function (req, res) {

    let newEntry = req.body;
    let scheduleList = [];

    let existingData = fs.readFileSync('./schedule.json', 'utf8');

    if (existingData !== "") {
        scheduleList = JSON.parse(existingData);
    }

    scheduleList.push(newEntry);

    let finalJsonString = JSON.stringify(scheduleList, null, 2);
    fs.writeFileSync('./schedule.json', finalJsonString);

    res.send("placeholder");
});



app.listen(3000);