import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { PasswordRepository } from '../repositories/PasswordRepository';

export default function PasswordDetailScreen({ navigation, route }) {
    const { passwordId } = route.params;
    const [details, setDetails] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDetails();
    }, [passwordId]);

    const loadDetails = async () => {
        try {
            const data = await PasswordRepository.getPasswordById(passwordId);
            setDetails(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load password details');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text, label) => {
        Clipboard.setString(text);
        Alert.alert('Copied', `${label} copied to clipboard.`);
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Password',
            'Are you sure you want to delete this password?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PasswordRepository.deletePassword(passwordId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete password');
                        }
                    }
                }
            ]
        );
    };

    if (isLoading || !details) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
                <Text style={styles.title}>Details</Text>
                <Pressable onPress={handleDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
            </View>

            <View style={styles.content}>
                <View style={styles.field}>
                    <Text style={styles.label}>Service</Text>
                    <Text style={styles.value}>{details.service_name}</Text>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Username</Text>
                    <View style={styles.row}>
                        <Text style={styles.value}>{details.username}</Text>
                        <Pressable onPress={() => handleCopy(details.username, 'Username')}>
                            <Text style={styles.actionText}>Copy</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.row}>
                        <Text style={styles.value}>
                            {isVisible ? details.password : '••••••••••••'}
                        </Text>
                        <View style={styles.actions}>
                            <Pressable onPress={() => setIsVisible(!isVisible)} style={styles.actionBtn}>
                                <Text style={styles.actionText}>{isVisible ? 'Hide' : 'Show'}</Text>
                            </Pressable>
                            <Pressable onPress={() => handleCopy(details.password, 'Password')} style={styles.actionBtn}>
                                <Text style={styles.actionText}>Copy</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {details.url && (
                    <View style={styles.field}>
                        <Text style={styles.label}>URL</Text>
                        <Text style={styles.value}>{details.url}</Text>
                    </View>
                )}

                {details.notes && (
                    <View style={styles.field}>
                        <Text style={styles.label}>Notes</Text>
                        <Text style={styles.value}>{details.notes}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    deleteText: {
        ...typography.body,
        color: colors.error,
    },
    content: {
        padding: spacing.m,
    },
    field: {
        marginBottom: spacing.l,
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    value: {
        ...typography.body,
        color: colors.text,
        fontSize: 18,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    actionText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: 'bold',
    },
    actionBtn: {
        padding: spacing.xs,
    },
});
