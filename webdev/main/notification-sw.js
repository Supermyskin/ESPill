self.addEventListener('push', event => {
    let data = { title: 'ESPill', body: 'Time for your medication!' };
    try {
        data = event.data.json();
    } catch (e) {
        data.body = event.data.text() || data.body;
    }

    const options = {
        body: data.body,
        icon: '../main/icon.png',
        badge: '../main/icon.png',
        data: {
            url: '../dashboard/index.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
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
