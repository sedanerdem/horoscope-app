require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("🔍 Erişilebilir modeller aranıyor...");

    try {
        // For listing models, we don't need to select a model first. 
        // But the SDK doesn't expose listModels directly on the main class in all versions.
        // We'll try a simple generation with a fallback model to see specific error or success.

        // There isn't a direct helper in the high-level SDK for listing models easily without querying the API endpoint directly 
        // or using the model manager if exposed. 
        // Instead, let's try the most basic 'gemini-1.5-flash-latest' which is often an alias.

        const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro", "text-bison-001"];

        for (const name of modelNames) {
            process.stdout.write(`Testing ${name}... `);
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent("Test");
                console.log("✅ ÇALIŞIYOR!");
                return; // Found one!
            } catch (e) {
                console.log("❌ " + e.message.split('[')[0].trim()); // Just the short error
            }
        }

    } catch (error) {
        console.error("Genel Hata:", error);
    }
}

listModels();
