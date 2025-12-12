import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { NoteRepository } from '../repositories/NoteRepository';
import { TodoRepository } from '../repositories/TodoRepository';
import { PasswordRepository } from '../repositories/PasswordRepository';

const TABS = [
    { id: 'note', label: 'Note' },
    { id: 'task', label: 'Task' },
    { id: 'password', label: 'Password' },
];

export default function CreateScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('note');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // For Note

    // Password specific state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    // Task specific state
    const [taskPriority, setTaskPriority] = useState(1);

    const handleSave = async () => {
        if (!title.trim()) return;
        setIsSaving(true);
        try {
            if (activeTab === 'note') {
                await NoteRepository.createNote(title, JSON.stringify({ text: content }), content);
            } else if (activeTab === 'task') {
                // For MVP, just create a default "Inbox" list if none exists, or ask user?
                // Let's check if we have lists, if not create "Inbox"
                const lists = await TodoRepository.getLists();
                let listId;
                if (lists.length === 0) {
                    listId = await TodoRepository.createList('Inbox', '#0EA5E9', '📥');
                } else {
                    listId = lists[0].id; // Default to first list
                }
                await TodoRepository.addTask(listId, title, taskPriority);
            } else if (activeTab === 'password') {
                // Title = Service Name
                // Content = Password (reused state for simplicity, or add new state)
                // We need username too.
                // For MVP, let's parse title as "Service" and content as "Password".
                // Or better, add specific inputs for Password mode.
                await PasswordRepository.createPassword(
                    title, // Service Name
                    username, // Username
                    password, // Password
                    '', // URL
                    '', // Notes
                    null // Category
                );
            }
            navigation.goBack();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <View style={styles.tabs}>
                    {TABS.map((tab) => (
                        <Pressable
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                <Pressable
                    onPress={handleSave}
                    style={[styles.headerButton, !title.trim() && { opacity: 0.5 }]}
                    disabled={!title.trim() || isSaving}
                >
                    <Text style={styles.saveText}>Save</Text>
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView style={styles.scroll}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder={activeTab === 'task' ? "What needs to be done?" : "Title"}
                        placeholderTextColor={colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />

                    {activeTab === 'note' && (
                        <TextInput
                            style={styles.bodyInput}
                            placeholder="Start typing..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            textAlignVertical="top"
                            value={content}
                            onChangeText={setContent}
                        />
                    )}

                    {activeTab === 'task' && (
                        <View style={styles.options}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.priorityRow}>
                                {[1, 2, 3].map((p) => (
                                    <Pressable
                                        key={p}
                                        style={[
                                            styles.priorityChip,
                                            taskPriority === p && styles.activePriority
                                        ]}
                                        onPress={() => setTaskPriority(p)}
                                    >
                                        <Text style={[
                                            styles.priorityText,
                                            taskPriority === p && styles.activePriorityText
                                        ]}>
                                            {p === 1 ? 'Low' : p === 2 ? 'Med' : 'High'}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {activeTab === 'password' && (
                        <View style={styles.options}>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Username"
                                placeholderTextColor={colors.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                            />
                            <TextInput
                                style={styles.inputField}
                                placeholder="Password"
                                placeholderTextColor={colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerButton: {
        padding: spacing.s,
    },
    cancelText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    saveText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 2,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: colors.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    tabText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.text,
    },
    content: {
        flex: 1,
    },
    scroll: {
        flex: 1,
        padding: spacing.m,
    },
    titleInput: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.m,
    },
    bodyInput: {
        ...typography.body,
        color: colors.text,
        minHeight: 200,
    },
    options: {
        marginTop: spacing.l,
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.s,
    },
    priorityRow: {
        flexDirection: 'row',
        gap: spacing.s,
    },
    priorityChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activePriority: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    priorityText: {
        ...typography.caption,
        color: colors.text,
    },
    activePriorityText: {
        color: colors.surface,
    },
    placeholder: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    placeholderText: {
        ...typography.body,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    inputField: {
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        color: colors.text,
        ...typography.body,
    },
});
