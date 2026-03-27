const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

const scheduleFilePath = path.join(__dirname, 'schedule.json');

app.use(cors());
app.use(express.json());

app.get('/vzemi-schedule', function (req, res) {

    let existingData = fs.readFileSync(scheduleFilePath, 'utf8');

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

    let existingData = fs.readFileSync(scheduleFilePath, 'utf8');

    if (existingData !== "") {
        scheduleList = JSON.parse(existingData);
    }

    scheduleList.push(newEntry);

    let finalJsonString = JSON.stringify(scheduleList, null, 2);
    fs.writeFileSync(scheduleFilePath, finalJsonString);

    res.json({ message: "Item added successfully", newEntry: newEntry });
});

app.delete('/izbrishi-schedule', function (req, res) {

    let itemToDelete = req.body;

    let existingData = fs.readFileSync(scheduleFilePath, 'utf8');
    let scheduleList = [];

    if (existingData !== "") {
        scheduleList = JSON.parse(existingData);
    }

    const initialLength = scheduleList.length;

    scheduleList = scheduleList.filter(item => 
        !(item.d === itemToDelete.d && 
          item.h === itemToDelete.h && 
          item.m === itemToDelete.m && 
          item.b === itemToDelete.b)
    );

    if (scheduleList.length < initialLength) {
        let finalJsonString = JSON.stringify(scheduleList, null, 2);
        fs.writeFileSync(scheduleFilePath, finalJsonString);
        res.json({ message: "Item deleted successfully", deletedItem: itemToDelete });
    } else {
        res.status(404).json({ message: "Item not found or no changes made" });
    }
});

app.listen(3000);