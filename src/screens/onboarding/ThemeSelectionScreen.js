import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

const THEMES = [
    { id: 'dawn', name: 'Dawn', color: '#F9FAFB' },
    { id: 'dusk', name: 'Dusk', color: '#1F2937' },
    { id: 'midnight', name: 'Midnight', color: '#000000' },
];

export default function ThemeSelectionScreen({ navigation }) {
    const [selected, setSelected] = useState('dawn');

    const handleFinish = () => {
        // TODO: Save theme preference
        // For now, just navigate to Main
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Choose your vibe.</Text>
                <View style={styles.grid}>
                    {THEMES.map((theme) => (
                        <Pressable
                            key={theme.id}
                            style={[
                                styles.card,
                                { backgroundColor: theme.color },
                                selected === theme.id && styles.selectedCard
                            ]}
                            onPress={() => setSelected(theme.id)}
                        >
                            <Text style={[
                                styles.cardText,
                                theme.id !== 'dawn' && { color: '#FFF' }
                            ]}>{theme.name}</Text>
                            {selected === theme.id && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>
            </View>
            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
                    onPress={handleFinish}
                >
                    <Text style={styles.buttonText}>Finish Setup</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.l,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        color: colors.text,
        marginBottom: spacing.xl,
    },
    grid: {
        gap: spacing.m,
    },
    card: {
        padding: spacing.l,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 80,
    },
    selectedCard: {
        borderColor: colors.primary,
    },
    cardText: {
        ...typography.h2,
        fontSize: 20,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    footer: {
        padding: spacing.l,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        ...typography.body,
        color: colors.surface,
        fontWeight: 'bold',
    },
});
