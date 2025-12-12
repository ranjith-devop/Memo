import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { PasswordRepository } from '../repositories/PasswordRepository';

export default function PasswordCreate({ visible, onClose, onSuccess }) {
    const [serviceName, setServiceName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!serviceName.trim() || !password.trim()) {
            Alert.alert('Required', 'Please enter a service name and password.');
            return;
        }

        setIsSaving(true);
        try {
            await PasswordRepository.createPassword(
                serviceName,
                username,
                password,
                '', // URL
                '', // Notes
                null // Category
            );
            // Reset form
            setServiceName('');
            setUsername('');
            setPassword('');
            onSuccess();
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to save password.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>New Password</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </Pressable>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Service Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Netflix, Google"
                            placeholderTextColor={colors.textSecondary}
                            value={serviceName}
                            onChangeText={setServiceName}
                            autoFocus
                        />

                        <Text style={styles.label}>Username / Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="username@example.com"
                            placeholderTextColor={colors.textSecondary}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Required"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry // Optional: maybe add show/hide toggle later
                        />

                        <Pressable
                            style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color={colors.surface} />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Password</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.m,
        minHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    title: {
        ...typography.h2,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.s,
    },
    closeText: {
        fontSize: 24,
        color: colors.textSecondary,
    },
    form: {
        gap: spacing.m,
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: -spacing.s,
    },
    input: {
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 12,
        color: colors.text,
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: spacing.m,
    },
    saveButtonText: {
        ...typography.button,
        color: colors.surface,
    },
});
