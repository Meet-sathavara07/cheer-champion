// SW Version: 2025-09-16-01
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
const firebaseConfig = {
  apiKey: "AIzaSyCKhlRNqvOK4sHPHFoJOat8P45dRKVKa7c",
  authDomain: "cheerchampion-de837.firebaseapp.com",
  projectId: "cheerchampion-de837",
  storageBucket: "cheerchampion-de837.firebasestorage.app",
  messagingSenderId: "1092820170244",
  appId: "1:1092820170244:web:db49a8cdd752d484546751",
  measurementId: "G-5B55B25ZN0"
};

firebase.initializeApp(firebaseConfig);

// Force immediate activation upon update
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};
  // Avoid duplicate notifications: when a `notification` is present in the payload,
  // FCM will display it. We don't call showNotification here to prevent duplicates.
  // Keep this handler for logging/diagnostics only.
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // FCM puts your data into event.notification?.data for webpush notifications
  const rawData = (event.notification && event.notification.data) || {};
  // If the notification was shown by FCM directly, custom data is under FCM_MSG.data
  const fcmData = (rawData && rawData.FCM_MSG && rawData.FCM_MSG.data) || rawData;
  const baseUrl = fcmData.base_url || 'https://cheerchampion.com/';
  const unsubscribeUrl = fcmData.unsubscribe_url || (baseUrl + 'unsubscribe');

  event.waitUntil(
    (async () => {
      const matchedClient = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientsArr) => clientsArr.find((c) => c.url.startsWith(baseUrl)));

      // If Unsubscribe action: navigate existing tab (if any) to unsubscribe URL
      if (event.action === 'unsubscribe') {
        if (matchedClient) {
          try { await matchedClient.navigate(unsubscribeUrl); } catch (e) { }
          return matchedClient.focus();
        }
        return self.clients.openWindow(unsubscribeUrl);
      }

      // Default click (body): always open the base URL explicitly
      return self.clients.openWindow(baseUrl);
    })()
  );
});