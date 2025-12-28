import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBYkvEnCgfoIowl26THJQeHwDF1_mZiCyU",
    authDomain: "horoscope-app-6dff4.firebaseapp.com",
    projectId: "horoscope-app-6dff4",
    storageBucket: "horoscope-app-6dff4.firebasestorage.app",
    messagingSenderId: "925556377774",
    appId: "1:925556377774:web:100d8b9a9c8222d6ba453f",
    measurementId: "G-S2CR73JEMJ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
