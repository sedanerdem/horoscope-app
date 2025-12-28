import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import { getDailyHoroscope, HoroscopeData, saveUserToken } from '../services/horoscopeService';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export default function HomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userSign, setUserSign] = useState<string | null>(null);
    const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const sign = await AsyncStorage.getItem('user_sign');
            if (sign) {
                setUserSign(sign);
                const data = await getDailyHoroscope(sign);
                setHoroscope(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Register for notifications
        registerForPushNotificationsAsync().then(token => {
            if (token && userSign) {
                saveUserToken(userSign, token);
            }
        });
    }, [userSign]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleChangeSign = async () => {
        await AsyncStorage.removeItem('user_sign');
        router.replace('/onboarding');
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Yıldızlar inceleniyor...</Text>
            </View>
        );
    }

    if (!userSign) {
        return <Redirect href="/onboarding" />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
            <View style={styles.header}>
                <Text style={styles.date}>{horoscope?.date || "Bugün"}</Text>
                <Text style={styles.title}>{userSign.toUpperCase()}</Text>
                <TouchableOpacity onPress={handleChangeSign} style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>Burcu Değiştir</Text>
                </TouchableOpacity>
            </View>

            {horoscope ? (
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>✨ Genel Bakış</Text>
                        <Text style={styles.cardText}>{horoscope.general}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>❤️ Aşk</Text>
                        <Text style={styles.cardText}>{horoscope.love}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>💼 Kariyer</Text>
                        <Text style={styles.cardText}>{horoscope.career}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🧘 Sağlık</Text>
                        <Text style={styles.cardText}>{horoscope.health}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz bugüne ait yorum bulunamadı.</Text>
                    <Text style={styles.emptySubText}>Yıldızlar şu an hesaplanıyor, lütfen daha sonra tekrar kontrol et.</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
    },
    loadingText: {
        color: 'white',
        marginTop: 16,
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    date: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    title: {
        color: 'white',
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 16,
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    changeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    changeButtonText: {
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '600',
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardTitle: {
        color: '#818cf8',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    cardText: {
        color: '#e2e8f0',
        fontSize: 16,
        lineHeight: 24,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubText: {
        color: '#94a3b8',
        marginTop: 8,
        textAlign: 'center',
    }
});
