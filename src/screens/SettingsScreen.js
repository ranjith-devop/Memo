import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoContext } from '../contexts/MemoContext';
import { Ionicons } from '@expo/vector-icons';
import { exportData } from '../services/BackupService';
import { isSecurityEnabled, initializeSecurity, disableSecurity, unlockApp } from '../services/SecurityService';
import { useFocusEffect } from '@react-navigation/native';

export default function SettingsScreen({ navigation }) {
    const { theme, themeName } = useMemoContext();
    const { colors, spacing, typography } = theme;
    const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);

    useFocusEffect(
        useCallback(() => {
            checkSecurityStatus();
        }, [])
    );

    const checkSecurityStatus = async () => {
        const enabled = await isSecurityEnabled();
        setIsAppLockEnabled(enabled);
    };

    const handleAppLockToggle = async (value) => {
        // Optimistic update to prevent double-tap
        setIsAppLockEnabled(value);

        if (value) {
            // Enable Security
            try {
                await initializeSecurity();
                Alert.alert('Success', 'App Lock enabled');
            } catch (error) {
                console.error('Failed to enable security:', error);
                setIsAppLockEnabled(false); // Revert on failure
                Alert.alert('Error', 'Failed to enable App Lock');
            }
        } else {
            // Disable Security - Require Auth
            try {
                const authenticated = await unlockApp();
                if (authenticated) {
                    await disableSecurity();
                    Alert.alert('Success', 'App Lock disabled');
                } else {
                    // Auth failed or cancelled
                    setIsAppLockEnabled(true); // Revert
                    // Optional: Alert if not cancelled by user
                }
            } catch (error) {
                console.error('Disable security failed:', error);
                setIsAppLockEnabled(true); // Revert
            }
        }
    };

    const handleExport = async () => {
        try {
            await exportData();
        } catch (error) {
            Alert.alert('Error', 'Failed to export data');
        }
    };

    const renderSettingItem = ({ icon, label, value, onPress, isSwitch, switchValue }) => (
        <Pressable style={styles.settingItem} onPress={isSwitch ? () => onPress(!switchValue) : onPress} disabled={isSwitch && false}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {isSwitch ? (
                    <Switch
                        value={switchValue}
                        onValueChange={onPress}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.surface}
                    />
                ) : (
                    <>
                        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </>
                )}
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.m }]}>
                <View style={[styles.section, { marginBottom: spacing.xl }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: spacing.s, marginLeft: spacing.s }]}>Appearance</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {renderSettingItem({
                            icon: 'moon',
                            label: 'Theme',
                            value: themeName.charAt(0).toUpperCase() + themeName.slice(1),
                            onPress: () => navigation.navigate('ThemeSelection')
                        })}
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: spacing.xl }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: spacing.s, marginLeft: spacing.s }]}>Security</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {renderSettingItem({
                            icon: 'lock-closed',
                            label: 'App Lock',
                            isSwitch: true,
                            switchValue: isAppLockEnabled,
                            onPress: handleAppLockToggle
                        })}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        {renderSettingItem({
                            icon: 'finger-print',
                            label: 'Biometrics',
                            value: 'Managed by OS',
                            onPress: () => Alert.alert('Info', 'Biometrics are managed by your device settings.')
                        })}
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: spacing.xl }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: spacing.s, marginLeft: spacing.s }]}>Data</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {renderSettingItem({
                            icon: 'cloud-upload',
                            label: 'Export Data',
                            value: 'JSON',
                            onPress: handleExport
                        })}
                    </View>
                </View>

                <View style={[styles.footer, { marginTop: spacing.xl, marginBottom: spacing.xxl }]}>
                    <Text style={[styles.version, { color: colors.textTertiary }]}>Memo App v1.0.0</Text>
                    <Text style={[styles.copyright, { color: colors.textTertiary, marginTop: spacing.xs }]}>Made by You</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        marginBottom: 8,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    content: {
        // padding handled inline
    },
    section: {
        // margin handled inline
    },
    sectionTitle: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginLeft: 56,
    },
    footer: {
        alignItems: 'center',
    },
    version: {
        fontSize: 12,
    },
    copyright: {
        fontSize: 12,
    },
});
