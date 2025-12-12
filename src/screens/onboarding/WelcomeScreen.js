import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

export default function WelcomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Your Mind.</Text>
                <Text style={styles.title}>Your Vault.</Text>
                <Text style={styles.subtitle}>
                    Capture thoughts, tasks, and secrets in a secure, offline-first space. No cloud. No tracking. Just you.
                </Text>
            </View>
            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
                    onPress={() => navigation.navigate('SecuritySetup')}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
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
        fontSize: 40,
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
    },
    buttonText: {
        ...typography.body,
        color: colors.surface,
        fontWeight: 'bold',
    },
});
