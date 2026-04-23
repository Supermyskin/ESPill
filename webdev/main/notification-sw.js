require('dotenv').config();
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const apiKey = process.env.API_FIREBASE;

const firebaseConfig = {
    apiKey: process.env.API_FIREBASE,
    authDomain: "espill-bef28.firebaseapp.com",
    projectId: "espill-bef28",
    storageBucket: "espill-bef28.firebasestorage.app",
    messagingSenderId: "214168500400",
    appId: "1:214168500400:web:25c8019640837761ed6375",
    measurementId: "G-GYNR6GQ7ZC"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[notification-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title || 'ESPill';
    const notificationOptions = {
        body: payload.notification.body || 'Time for your medication!',
        icon: '../main/icon.png',
        badge: '../main/icon.png',
        data: {
            url: '../dashboard/index.html'
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil((async () => {
        const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

        for (const client of allClients) {
            if ('focus' in client) {
                await client.focus();
                return;
            }
        }

        if (clients.openWindow) {
            await clients.openWindow('../dashboard/index.html');
        }
    })());
});
