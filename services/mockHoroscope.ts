// Simulate an API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface HoroscopeData {
    sign: string;
    date: string;
    general: string;
    love: string;
    career: string;
    health: string;
}

export const getDailyHoroscope = async (signId: string): Promise<HoroscopeData> => {
    await delay(1500); // Fake network loading

    return {
        sign: signId,
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        general: "Bugün enerjiniz oldukça yüksek. Çevrenizdeki insanlarla iletişimizde pozitif bir hava yakalayacaksınız. Yeni başlangıçlar için harika bir gün.",
        love: "Aşk hayatınızda beklenmedik sürprizler olabilir. Partnerinizle (veya adayınızla) derin bir konuşma yapmak için doğru zaman.",
        career: "İş yerinde detaylara dikkat etmeniz gereken bir gün. Yaratıcılığınızı kullanarak sorunları çözebilirsiniz.",
        health: "Bol su içmeyi ve kısa yürüyüşler yapmayı ihmal etmeyin. Enerjinizi dengeli kullanın."
    };
};
