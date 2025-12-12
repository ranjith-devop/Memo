import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { unlockApp } from '../services/SecurityService';

export default function LockScreen({ onUnlock }) {
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        // Try to unlock automatically on mount
        handleUnlock();
    }, []);

    const handleUnlock = async () => {
        if (isAuthenticating) return;
        setIsAuthenticating(true);
        try {
            const success = await unlockApp();
            if (success) {
                onUnlock();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Memo Locked</Text>
            <Text style={styles.subtitle}>Authentication Required</Text>

            <Pressable
                style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
                onPress={handleUnlock}
            >
                <Text style={styles.buttonText}>Unlock</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it covers everything
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        color: colors.text,
        marginBottom: spacing.s,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.m,
        borderRadius: 12,
    },
    buttonText: {
        ...typography.body,
        color: colors.surface,
        fontWeight: 'bold',
    },
});
