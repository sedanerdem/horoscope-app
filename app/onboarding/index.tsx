import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { BURCLAR } from '../../constants/burclar';

export default function OnboardingScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleSelect = async (signId: string) => {
        try {
            await AsyncStorage.setItem('user_sign', signId);
            router.replace('/');
        } catch (e) {
            console.error("Failed to save sign", e);
        }
    };

    const getElementIcon = (element: string) => {
        switch (element) {
            case 'Ateş': return { name: 'flame', color: '#fca5a5' };
            case 'Su': return { name: 'water', color: '#93c5fd' };
            case 'Hava': return { name: 'cloud', color: '#e2e8f0' };
            case 'Toprak': return { name: 'leaf', color: '#86efac' };
            default: return { name: 'star', color: '#fff' };
        }
    };

    return (
        <LinearGradient
            colors={['#0f172a', '#1e1b4b', '#312e81']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Ionicons name="moon" size={48} color="#fcd34d" style={{ marginBottom: 16 }} />
                <Text style={styles.title}>Burcunu Seç</Text>
                <Text style={styles.subtitle}>Sana özel yorumlar için yıldızını belirle.</Text>
            </View>

            <Animated.View style={[styles.listContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <FlatList
                    data={BURCLAR}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => {
                        const { name, color } = getElementIcon(item.element);
                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => handleSelect(item.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                                    <Ionicons name={name as any} size={24} color={color} />
                                </View>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardDate}>{item.date}</Text>
                                <View style={styles.elementBadge}>
                                    <Text style={[styles.elementText, { color: color }]}>{item.element}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 250,
    },
    listContainer: {
        flex: 1,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardDate: {
        color: '#94a3b8',
        fontSize: 11,
        marginBottom: 12,
    },
    elementBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    elementText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    }
});
