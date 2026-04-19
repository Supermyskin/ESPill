# 💊 ESPill

**ESPill** is a smart, fully connected medication management ecosystem designed to bring the traditional pillbox into the 21st century. It now offers a personalized and gamified experience with robust data management and seamless integration.

By combining reliable IoT hardware with a beautifully designed web platform, ESPill makes tracking and dispensing medication seamless, stress-free, and precise. No more guessing if you took your medicine—ESPill handles the schedule for you, now enhanced with personal accounts, progress tracking, and customizability.

---

## 🚀 Live Demo

The web interface is live and can be accessed here:
**[https://supermyskin.github.io/ESPill/](https://supermyskin.github.io/ESPill/)**

---

## ✨ Features

*   **Personalized Account System:** Secure user accounts personalize the experience, track individual progress, and manage settings.
*   **Gamified Experience:** Engage with your medication schedule through streaks, comprehensive tracking, and insightful statistics.
*   **Sleek Web Dashboard:** A beautiful, responsive user interface featuring a custom dark-mode aesthetic with frosted glass elements, now with an **adapted mobile UI**.
*   **Dynamic Scheduling Algorithm:** Uses a custom bitmasking algorithm to efficiently save and decode complex schedules for 6 different pill compartments.
*   **Real-Time IoT Communication:** Beams schedules instantly to the physical hardware using the lightning-fast MQTT protocol (via HiveMQ).
*   **Push Notifications:** Stay on track with timely reminders and updates directly to your device.
*   **Enhanced User Customizability:** Tailor your experience with more options and settings to suit your preferences.
*   **MongoDB Integration:** Robust and scalable data storage for user accounts, schedules, and progress tracking.

---

## 🛠️ Tech Stack

**Frontend:**
*   HTML5 / CSS3 (Flexbox, Glassmorphism UI)
*   Vanilla JavaScript (Fetch API, DOM Manipulation)
*   FontAwesome (Icons)
*   **GitHub Pages** for hosting the static web interface.

**Backend & Data:**
*   Node.js / Express.js (for API and server-side logic)
*   **MongoDB** (for persistent data storage)
*   MQTT Protocol (HiveMQ)
*   ESP32 Microcontroller
*   **Render** for hosting the backend services.

---

## 📂 Project Structure

-   `.github/workflows/deploy.yml`: GitHub Actions workflow for automated deployment.
-   `Embedded/`: Contains Arduino/ESP32 code for the hardware.
    -   `mqtt/`: MQTT communication and sensor logic for the ESP32.
        -   `Box.cpp`, `Box.h`: Logic for the pill dispenser mechanism.
        -   `ClockStuff.ino`: Timekeeping and synchronization.
        -   `FillSchedule.ino`: Schedule filling logic.
        -   `HeaderFile.h`, `Types.h`: Common definitions.
        -   `mqtt.ino`: Main MQTT communication.
        -   `UltraSonic.ino`: Ultrasonic sensor logic.
-   `webdev/`: Contains the web application source code.
    -   `index.html`: Main entry point for the web application.
    -   `about/`: About page with project information.
    -   `account/`: User account management (login, register, profile).
    -   `dashboard/`: User dashboard for monitoring and control.
    -   `landing/`: Landing page for unauthenticated users.
    -   `login/`: Login page.
    -   `main/`: Core application logic, including authentication, connectivity, and push notifications.
        -   `auth.js`: Authentication logic.
        -   `connectivity.js`: Connectivity management.
        -   `index.html`, `index.js`: Main application page and script.
        -   `notification-sw.js`: Service worker for push notifications.
        -   `responsive.css`, `style.css`: Styling files.
    -   `register/`: Registration page.
    -   `schedule/`: Medication scheduling interface.
        -   `weekdays/`: Individual weekday schedule pages.
    -   `server/`: Backend Node.js/Express.js server.
        -   `index.js`: Main server application.
        -   `package.json`, `package-lock.json`: Node.js dependency management.
        -   `node_modules/`: Node.js dependencies.
