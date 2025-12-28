require('dotenv').config();
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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
        title: 'Bugünü Kaçırma! 🌙',
        body: 'Henüz günlük yorumunu okumadın. Yıldızlar seni bekliyor...',
        data: { type: 'reminder' },
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
    console.log("🌙 Hatırlatma Kontrolü Başlıyor...");
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
        console.log("❌ Kullanıcı yok.");
        return;
    }

    // Get start of today (local time roughly, assuming server plays nice or we use UTC)
    // Effectively, we just check if updated_at is BEFORE today.
    // 'updated_at' is ISOString.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    console.log(`🔎 Tarih sınırı: ${todayISO} (Bundan eskiler uyarılacak)`);

    let sentCount = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();

        // If data.updated_at is missing, treat as old. 
        // If it exists, compare strings directly (ISO format allows string comparison)
        const lastSeen = data.updated_at || "2000-01-01T00:00:00.000Z";

        if (data.token && lastSeen < todayISO) {
            console.log(`🔔 Uyandırılıyor: ${data.device} (Son görülme: ${lastSeen})`);
            await sendPushNotification(data.token);
            sentCount++;
            await new Promise(r => setTimeout(r, 100));
        } else {
            // console.log(`👍 Zaten aktif: ${data.device}`);
        }
    }
    console.log(`✅ ${sentCount} kişiye hatırlatma gönderildi!`);
    process.exit(0);
}

main();
