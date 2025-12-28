require('dotenv').config();
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Configuration
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
        title: 'Günaydın! ☀️',
        body: 'Bugünkü burç yorumun hazır. Yıldızlar senin için ne diyor?',
        data: { type: 'morning' },
    };

    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    } catch (e) {
        console.error(`Error sending to ${expoPushToken}:`, e);
    }
}

async function main() {
    console.log("☀️ Sabah Bildirimleri Başlıyor...");
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
        console.log("❌ Kullanıcı yok.");
        return;
    }

    console.log(`📢 ${snapshot.size} kişiye gönderiliyor...`);

    let sentCount = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.token) {
            await sendPushNotification(data.token);
            sentCount++;
            // Rate limit prevention (simple delay)
            await new Promise(r => setTimeout(r, 100));
        }
    }
    console.log(`✅ ${sentCount} kişiye günaydın denildi!`);
    process.exit(0);
}

main();
