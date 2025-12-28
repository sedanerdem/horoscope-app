import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getDailyHoroscope, HoroscopeData, saveUserToken } from '../services/horoscopeService';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export default function HomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userSign, setUserSign] = useState<string | null>(null);
    const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Animation Value (Opacity)
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Slide Up Animation
    const slideAnim = useRef(new Animated.Value(50)).current;

    const fetchData = async () => {
        try {
            const sign = await AsyncStorage.getItem('user_sign');
            if (sign) {
                setUserSign(sign);
                const data = await getDailyHoroscope(sign);
                setHoroscope(data);

                // Trigger Animation when data loads
                if (data) {
                    Animated.parallel([
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(slideAnim, {
                            toValue: 0,
                            duration: 800,
                            useNativeDriver: true,
                        })
                    ]).start();
                }
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
        // Reset animations for effect
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        fetchData();
    }, []);

    const handleChangeSign = async () => {
        await AsyncStorage.removeItem('user_sign');
        router.replace('/onboarding');
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#1e1b4b', '#1e293b']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#818cf8" />
                <Text style={styles.loadingText}>Yıldızlar hizalanıyor...</Text>
            </LinearGradient>
        );
    }

    if (!userSign) {
        return <Redirect href="/onboarding" />;
    }

    return (
        <LinearGradient
            colors={['#0f172a', '#1e1b4b', '#312e81']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Sticky/Fixed Header */}
            <View style={styles.fixedHeader}>
                <Text style={styles.date}>{horoscope?.date || "Bugün"}</Text>
                <Text style={styles.title}>{userSign.toUpperCase()}</Text>

                <TouchableOpacity onPress={handleChangeSign} style={styles.changeButton}>
                    <Ionicons name="swap-horizontal" size={16} color="#cbd5e1" style={{ marginRight: 6 }} />
                    <Text style={styles.changeButtonText}>Burcu Değiştir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                {horoscope ? (
                    <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="sparkles" size={24} color="#fcd34d" />
                                <Text style={styles.cardTitle}>Genel Bakış</Text>
                            </View>
                            <Text style={styles.cardText}>{horoscope.general}</Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="heart" size={24} color="#f472b6" />
                                <Text style={styles.cardTitle}>Aşk</Text>
                            </View>
                            <Text style={styles.cardText}>{horoscope.love}</Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="briefcase" size={24} color="#60a5fa" />
                                <Text style={styles.cardTitle}>Kariyer</Text>
                            </View>
                            <Text style={styles.cardText}>{horoscope.career}</Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="fitness" size={24} color="#4ade80" />
                                <Text style={styles.cardTitle}>Sağlık</Text>
                            </View>
                            <Text style={styles.cardText}>{horoscope.health}</Text>
                        </View>

                    </Animated.View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="planet" size={64} color="rgba(255,255,255,0.2)" />
                        <Text style={styles.emptyText}>Henüz bugüne ait yorum bulunamadı.</Text>
                        <Text style={styles.emptySubText}>Yıldızlar şu an hesaplanıyor, lütfen daha sonra tekrar kontrol et.</Text>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#818cf8',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500'
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 10,
        paddingBottom: 40,
    },
    fixedHeader: {
        paddingTop: 70,
        paddingBottom: 20,
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: 'transparent',
    },
    date: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
        opacity: 0.8
    },
    title: {
        color: 'white',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 20,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    changeButtonText: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '600',
    },
    cardsContainer: {
        gap: 20,
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.6)', // Glassmorphism
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    cardTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardText: {
        color: '#e2e8f0',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '400',
        opacity: 0.95
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        gap: 20
    },
    emptyText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center'
    },
    emptySubText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 250
    }
});
