import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function PlaceholderScreen({ title = 'Coming Soon' }) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🚧</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>This feature is under development.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.m,
    },
    title: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.s,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
