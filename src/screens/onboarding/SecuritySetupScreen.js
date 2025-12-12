import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { initializeSecurity, unlockApp, setOnboarded } from '../../services/SecurityService';

export default function SecuritySetupScreen({ navigation }) {
    const handleEnableLock = async () => {
        try {
            const key = await initializeSecurity();
            const success = await unlockApp(key);
            if (success) {
                await setOnboarded();
                navigation.navigate('ThemeSelection');
            } else {
                Alert.alert('Authentication Failed', 'Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not set up security: ' + error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Lock It Down.</Text>
                <Text style={styles.subtitle}>
                    Your data is encrypted on this device. Set up a secure lock to ensure you are the only one who can access it.
                </Text>
            </View>
            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
                    onPress={handleEnableLock}
                >
                    <Text style={styles.buttonText}>Enable App Lock</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.7 }]}
                    onPress={() => {
                        // Skip logic (not recommended, but allowed for MVP testing if hardware missing)
                        // For strict requirements, we might force it, but let's allow skip for now
                        // with a warning.
                        Alert.alert(
                            'Are you sure?',
                            'Without App Lock, your data is not encrypted at rest.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Skip',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await setOnboarded();
                                        navigation.navigate('ThemeSelection');
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <Text style={styles.skipText}>Skip for now (Not Recommended)</Text>
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
    },
    subtitle: {
        ...typography.body,
        marginTop: spacing.l,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    footer: {
        padding: spacing.l,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    buttonText: {
        ...typography.body,
        color: colors.surface,
        fontWeight: 'bold',
    },
    skipButton: {
        alignItems: 'center',
        padding: spacing.s,
    },
    skipText: {
        ...typography.caption,
        color: colors.error,
    },
});
