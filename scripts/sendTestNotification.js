require('dotenv').config();
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Polyfill fetch for older Node versions if needed, but Node 18+ has it.
// usage: node scripts/sendTestNotification.js

const firebaseConfig = {
    apiKey: "AIzaSyBYkvEnCgfoIowl26THJQeHwDF1_mZiCyU",
    authDomain: "horoscope-app-6dff4.firebaseapp.com",
    projectId: "horoscope-app-6dff4",
    storageBucket: "horoscope-app-6dff4.firebasestorage.app",
    messagingSenderId: "925556377774",
    appId: "1:925556377774:web:100d8b9a9c8222d6ba453f",
    measurementId: "G-S2CR73JEMJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sendPushNotification(expoPushToken) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Deneme Bildirimi! 🔔',
        body: 'Bu bir test bildirimidir. Burç yorumun hazır!',
        data: { someData: 'goes here' },
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        const data = await response.json();
        console.log(`Sent to ${expoPushToken}:`, data);
    } catch (e) {
        console.error(`Error sending to ${expoPushToken}:`, e);
    }
}

async function main() {
    console.log("🔔 Kullanıcılar getiriliyor...");
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
        console.log("❌ Hiç kullanıcı bulunamadı. Önce uygulamayı açıp izin verin.");
        return;
    }

    console.log(`📢 ${snapshot.size} kullanıcı bulundu. Bildirim gönderiliyor...`);

    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.token) {
            console.log(`➡️ Gönderiliyor: ${data.token} (${data.device})`);
            await sendPushNotification(data.token);
        }
    }
}

main();
