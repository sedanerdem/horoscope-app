import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as Device from 'expo-device';

export interface HoroscopeData {
    sign: string;
    date: string;
    general: string;
    love: string;
    career: string;
    health: string;
}

export const getDailyHoroscope = async (signId: string): Promise<HoroscopeData | null> => {
    try {
        // Generate today's ID, e.g., "2024-05-21"
        const today = new Date().toISOString().split('T')[0];
        const docId = `${today}-${signId}`; // Format: YYYY-MM-DD-sign

        const docRef = doc(db, "horoscopes", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as HoroscopeData;
        } else {
            console.log("No horoscope found for today!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching horoscope:", error);
        return null;
    }
};

export const saveUserToken = async (sign: string, token: string) => {
    try {
        if (!token) return;

        // Use token as the document ID to prevent duplicates
        await setDoc(doc(db, "users", token), {
            sign: sign,
            token: token,
            device: Device.modelName || "unknown",
            updated_at: new Date().toISOString()
        });
        console.log("User token saved to Firestore");
    } catch (e) {
        console.error("Error saving user token:", e);
    }
};
