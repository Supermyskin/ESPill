require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 3000;

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    publicVapidKey,
    privateVapidKey
);

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    streak: { type: Number, default: 0 }
});

const scheduleSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    d: { type: Number, required: true },
    h: { type: Number, required: true },
    m: { type: Number, required: true },
    a: { type: [Number], default: [0, 0, 0, 0, 0, 0] }
});

const statSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    type: { type: String, enum: ['onTime', 'late', 'missed'], required: true },
    timestamp: { type: Date, default: Date.now }
});

const subscriptionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    subscription: { type: Object, required: true }
});

const User = mongoose.model('User', userSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);
const Stat = mongoose.model('Stat', statSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

app.use(cors());
app.use(express.json());

// Push Notification Routes
app.post('/subscribe', async (req, res) => {
    try {
        const { userId, subscription } = req.body;
        if (!userId || !subscription) {
            return res.status(400).json({ message: "userId and subscription are required" });
        }

        // Save subscription, update if exists
        await Subscription.findOneAndUpdate(
            { userId, 'subscription.endpoint': subscription.endpoint },
            { userId, subscription },
            { upsert: true }
        );

        res.status(201).json({ message: "Subscribed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/send-push', async (req, res) => {
    try {
        const { userId, title, body } = req.body;
        const subscriptions = await Subscription.find({ userId });

        if (subscriptions.length === 0) {
            return res.status(404).json({ message: "No subscriptions found for user" });
        }

        const payload = JSON.stringify({ title, body });

        const sendPromises = subscriptions.map(sub =>
            webpush.sendNotification(sub.subscription, payload)
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Remove expired subscriptions
                        return Subscription.deleteOne({ _id: sub._id });
                    }
                    console.error("Error sending push:", err);
                })
        );

        await Promise.all(sendPromises);
        res.json({ message: "Notifications sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/update-stats', async (req, res) => {
    try {
        const { userID, type, count } = req.body;
        if (!userID || !type) {
            return res.status(400).json({ message: "UserID and type are required" });
        }

        const pillCount = Math.max(1, Number(count) || 1);

        const newStat = new Stat({ userID, type });
        await newStat.save();

        // Any non-on-time dose breaks the streak.
        if (type === 'onTime') {
            await User.findOneAndUpdate({ userId: userID }, { $inc: { streak: 1 } });
        } else if (type === 'late' || type === 'missed') {
            await User.findOneAndUpdate({ userId: userID }, { $set: { streak: 0 } });
        }

        res.json({ message: "Stat updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/vzemi-user', async (req, res) => {
    try {
        const userId = req.query.userID;
        if (!userId) {
            return res.status(400).json({ message: "UserID is required" });
        }
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            name: user.name,
            email: user.email,
            streak: user.streak || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/vzemi-stats', async (req, res) => {
    try {
        const userId = req.query.userID;
        if (!userId) {
            return res.status(400).json({ message: "UserID is required" });
        }

        // Get stats for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stats = await Stat.find({
            userID: userId,
            timestamp: { $gte: sevenDaysAgo }
        });

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const newUser = new User({
            userId,
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.json({ message: "Registration successful", userId, name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", userId: user.userId, name: user.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/vzemi-schedule', async (req, res) => {
    try {
        const userId = req.query.userID;
        if (!userId) {
            return res.status(400).json({ message: "UserID is required" });
        }

        const userSchedule = await Schedule.find({ userID: userId }).sort({ d: 1, h: 1, m: 1 });

        const formattedSchedule = userSchedule.map(item => {
            // Ensure 'a' array has exactly 6 elements
            let amounts = [0, 0, 0, 0, 0, 0];
            if (Array.isArray(item.a)) {
                for (let i = 0; i < 6; i++) {
                    amounts[i] = Math.max(0, Number(item.a[i]) || 0);
                }
            }
            return {
                d: item.d,
                h: item.h,
                m: item.m,
                a: amounts
            };
        });

        res.json(formattedSchedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/dobavi-schedule', async (req, res) => {
    try {
        const { userID, ...newEntry } = req.body;

        if (!userID) {
            return res.status(400).json({ message: "UserID is required" });
        }

        const scheduleEntry = new Schedule({
            userID,
            ...newEntry
        });

        await scheduleEntry.save();

        res.json({ message: "Item added successfully", newEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.delete('/izbrishi-schedule', async (req, res) => {
    try {
        const { userID, ...itemToDelete } = req.body;

        if (!userID) {
            return res.status(400).json({ message: "UserID is required" });
        }

        const result = await Schedule.findOneAndDelete({
            userID,
            d: itemToDelete.d,
            h: itemToDelete.h,
            m: itemToDelete.m,
            a: itemToDelete.a
        });

        if (result) {
            res.json({ message: "Item deleted successfully", deletedItem: itemToDelete });
        } else {
            res.status(404).json({ message: "Item not found or no changes made" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.delete('/iztrii-vsichko-schedule', async (req, res) => {
    try {
        const userId = req.query.userID;
        if (!userId) {
            return res.status(400).json({ message: "UserID is required" });
        }

        const result = await Schedule.deleteMany({ userID: userId });

        res.json({ message: "Schedule cleared successfully", deletedCount: result.deletedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
