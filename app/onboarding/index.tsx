import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BURCLAR } from '../../constants/burclar';

export default function OnboardingScreen() {
    const router = useRouter();

    const handleSelect = async (signId: string) => {
        try {
            await AsyncStorage.setItem('user_sign', signId);
            router.replace('/');
        } catch (e) {
            console.error("Failed to save sign", e);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Burcunu Seç</Text>
                <Text style={styles.subtitle}>Günlük yorumlarını almak için burcunu belirle.</Text>
            </View>

            <FlatList
                data={BURCLAR}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleSelect(item.id)}
                    >
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>✨</Text>
                        </View>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardDate}>{item.date}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        paddingTop: 64,
        paddingHorizontal: 16,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 24,
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    cardDate: {
        color: '#64748b',
        fontSize: 12,
        textAlign: 'center',
    },
});
