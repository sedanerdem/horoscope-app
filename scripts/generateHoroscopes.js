require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Firebase Configuration (Copied to avoid ESM issues in simple script)
const firebaseConfig = {
    apiKey: "AIzaSyBYkvEnCgfoIowl26THJQeHwDF1_mZiCyU",
    authDomain: "horoscope-app-6dff4.firebaseapp.com",
    projectId: "horoscope-app-6dff4",
    storageBucket: "horoscope-app-6dff4.firebasestorage.app",
    messagingSenderId: "925556377774",
    appId: "1:925556377774:web:100d8b9a9c8222d6ba453f",
    measurementId: "G-S2CR73JEMJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const ZODIAC_SIGNS = [
    { id: 'koc', name: 'Koç' },
    { id: 'boga', name: 'Boğa' },
    { id: 'ikizler', name: 'İkizler' },
    { id: 'yengec', name: 'Yengeç' },
    { id: 'aslan', name: 'Aslan' },
    { id: 'basak', name: 'Başak' },
    { id: 'terazi', name: 'Terazi' },
    { id: 'akrep', name: 'Akrep' },
    { id: 'yay', name: 'Yay' },
    { id: 'oglak', name: 'Oğlak' },
    { id: 'kova', name: 'Kova' },
    { id: 'balik', name: 'Balık' },
];

async function generateHoroscope(signName, retries = 3) {
    const prompt = `
    Sen profesyonel bir astrologsun. ${signName} burcu için bugünün günlük burç yorumunu hazırla.
    
    Çıktı SADECE aşağıdaki JSON formatında olmalı, başka hiçbir metin (markdown, tırnak vb.) ekleme:
    {
      "general": "Genel yorum cümlesi (en az 2 cümle)",
      "love": "Aşk hayatı yorumu",
      "career": "Kariyer ve iş yorumu",
      "health": "Sağlık ve zindelik yorumu"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Temizlik (Markdown ```json ... ``` kısımlarını temizle)
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        if ((error.status === 429 || error.message.includes('429')) && retries > 0) {
            console.log(`⚠️ Hız sınırı (429) aşıldı. 10 saniye soğuma bekleniyor... (Kalan deneme: ${retries})`);
            await new Promise(r => setTimeout(r, 10000));
            return generateHoroscope(signName, retries - 1);
        }
        console.error(`Error generating for ${signName}:`, error);
        return null;
    }
}

async function main() {
    console.log("🌟 Günlük Burç Üretimi Başlıyor (Gemini AI)...");

    const today = new Date().toISOString().split('T')[0];
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    for (const sign of ZODIAC_SIGNS) {
        console.log(`⏳ ${sign.name} yorumlanıyor...`);
        const content = await generateHoroscope(sign.name);

        if (content) {
            const docId = `${today}-${sign.id}`;
            await setDoc(doc(db, "horoscopes", docId), {
                sign: sign.id,
                date: dateStr,
                ...content,
                created_at: new Date().toISOString()
            });
            console.log(`✅ ${sign.name} kaydedildi!`);
        } else {
            console.log(`❌ ${sign.name} başarısız oldu.`);
        }

        // Tier 1 olduğu için bekleme süresini kısalttık
        console.log("🚀 Hızlı mod: 1 saniye bekleniyor...");
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("🏁 Tüm burçlar tamamlandı!");
    process.exit(0);
}

main();
