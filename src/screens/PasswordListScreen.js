import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { PasswordRepository } from '../repositories/PasswordRepository';
import { unlockApp, ensureMasterKeyExists } from '../services/SecurityService';

import PasswordCreate from '../components/PasswordCreate';

export default function PasswordListScreen({ navigation }) {
    const [passwords, setPasswords] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateVisible, setIsCreateVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            checkAuth();
        }, [])
    );

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            // Ensure we have a key to unlock (creates one if missing, e.g. first time use)
            await ensureMasterKeyExists();

            // Force re-auth when entering this screen
            const success = await unlockApp();
            if (success) {
                setIsAuthenticated(true);
                loadPasswords();
            } else {
                // If auth fails, go back
                navigation.goBack();
            }
        } catch (error) {
            console.error('Auth failed:', error);
            navigation.goBack();
        }
    };

    const loadPasswords = async () => {
        try {
            const data = await PasswordRepository.getPasswords();
            setPasswords(data);
        } catch (error) {
            console.error('Failed to load passwords:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.center}>
                <Text>Authenticating...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
                <Text style={styles.title}>Passwords</Text>
                <Pressable
                    onPress={() => setIsCreateVisible(true)}
                    style={styles.addButton}
                >
                    <Text style={styles.addText}>+</Text>
                </Pressable>
            </View>

            <FlatList
                data={passwords}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
                        onPress={() => navigation.navigate('PasswordDetail', { passwordId: item.id })}
                    >
                        <View style={styles.iconPlaceholder}>
                            <Text style={styles.iconText}>
                                {item.service_name ? item.service_name[0].toUpperCase() : '?'}
                            </Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.serviceName}>{item.service_name}</Text>
                            <Text style={styles.username}>{item.username}</Text>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No passwords saved.</Text>
                    </View>
                }
            />

            <PasswordCreate
                visible={isCreateVisible}
                onClose={() => setIsCreateVisible(false)}
                onSuccess={loadPasswords}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backText: {
        ...typography.body,
        color: colors.primary,
    },
    title: {
        ...typography.h3,
        color: colors.text,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: {
        color: colors.surface,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: -2,
    },
    list: {
        padding: spacing.m,
        gap: spacing.m,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.m,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconText: {
        ...typography.h3,
        color: colors.text,
    },
    cardContent: {
        flex: 1,
    },
    serviceName: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.text,
    },
    username: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    empty: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
});
