# 💊 ESPill

**ESPill** is a smart, fully connected medication management ecosystem designed to bring the traditional pillbox into the 21st century. 

By combining reliable IoT hardware with a beautifully designed web platform, ESPill makes tracking and dispensing medication seamless, stress-free, and precise. No more guessing if you took your medicine—ESPill handles the schedule for you.

---

## ✨ Features

* **Sleek Web Dashboard:** A beautiful, responsive user interface featuring a custom dark-mode aesthetic with frosted glass elements.
* **Dynamic Scheduling Algorithm:** Uses a custom bitmasking algorithm to efficiently save and decode complex schedules for 6 different pill compartments.
* **Real-Time IoT Communication:** Beams schedules instantly to the physical hardware using the lightning-fast MQTT protocol (via HiveMQ).
* **Local Data Storage:** Lightweight Node.js backend that dynamically reads and writes user schedules to a local JSON database.

---

## 🛠️ Tech Stack

**Frontend:**
* HTML5 / CSS3 (Flexbox, Glassmorphism UI)
* Vanilla JavaScript (Fetch API, DOM Manipulation)
* FontAwesome (Icons)

**Backend & Hardware:**
* Node.js / Express.js
* Local JSON Storage (`schedule.json`)
* MQTT Protocol (HiveMQ)
* ESP32 Microcontroller 
