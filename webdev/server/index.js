const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

const scheduleFilePath = path.join(__dirname, 'schedule.json');
const usersFilePath = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

const readJSONFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch (err) {
        return {};
    }
};

const writeJSONFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};


app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const users = readJSONFile(usersFilePath);

    if (users[email]) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    users[email] = {
        id: userId,
        name: name,
        password: hashedPassword
    };

    writeJSONFile(usersFilePath, users);

    const schedules = readJSONFile(scheduleFilePath);
    schedules[userId] = [];
    writeJSONFile(scheduleFilePath, schedules);

    res.json({ message: "Registration successful", userId, name });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = readJSONFile(usersFilePath);

    const user = users[email];
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", userId: user.id, name: user.name });
});


app.get('/vzemi-schedule', function (req, res) {
    const userId = req.query.userID;
    if (!userId) {
        return res.status(400).json({ message: "UserID is required" });
    }

    const schedules = readJSONFile(scheduleFilePath);
    const userSchedule = schedules[userId] || [];

    res.json(userSchedule);
});

app.post('/dobavi-schedule', function (req, res) {
    const { userID, ...newEntry } = req.body;

    if (!userID) {
        return res.status(400).json({ message: "UserID is required" });
    }

    const schedules = readJSONFile(scheduleFilePath);
    if (!schedules[userID]) {
        schedules[userID] = [];
    }

    schedules[userID].push(newEntry);
    writeJSONFile(scheduleFilePath, schedules);

    res.json({ message: "Item added successfully", newEntry });
});

app.delete('/izbrishi-schedule', function (req, res) {
    const { userID, ...itemToDelete } = req.body;

    if (!userID) {
        return res.status(400).json({ message: "UserID is required" });
    }

    const schedules = readJSONFile(scheduleFilePath);
    let userSchedule = schedules[userID] || [];

    const initialLength = userSchedule.length;

    userSchedule = userSchedule.filter(item =>
        !(item.d === itemToDelete.d &&
            item.h === itemToDelete.h &&
            item.m === itemToDelete.m &&
            item.b === itemToDelete.b)
    );

    if (userSchedule.length < initialLength) {
        schedules[userID] = userSchedule;
        writeJSONFile(scheduleFilePath, schedules);
        res.json({ message: "Item deleted successfully", deletedItem: itemToDelete });
    } else {
        res.status(404).json({ message: "Item not found or no changes made" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
