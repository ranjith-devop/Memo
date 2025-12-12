import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { NoteRepository } from '../repositories/NoteRepository';
import { TodoRepository } from '../repositories/TodoRepository';
import NoteList from '../components/NoteList';

export default function HomeScreen({ navigation }) {
    const [recentNotes, setRecentNotes] = useState([]);
    const [todoLists, setTodoLists] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [greeting, setGreeting] = useState('Good Morning,');

    const loadData = async () => {
        try {
            const notes = await NoteRepository.getNotes();
            setRecentNotes(notes.slice(0, 5)); // Top 5

            const lists = await TodoRepository.getLists();
            setTodoLists(lists);
        } catch (error) {
            console.error('Failed to load home data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const updateGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting('Good Morning,');
        else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon,');
        else if (hour >= 17 && hour < 21) setGreeting('Good Evening,');
        else setGreeting('Good Night,');
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
            updateGreeting();
            // Optional: Set an interval to update greeting if the app stays open across boundaries
            const interval = setInterval(updateGreeting, 60000); // Check every minute
            return () => clearInterval(interval);
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
                    <Text style={styles.subtitle}>Ready to capture?</Text>
                </View>
                <View style={styles.headerButtons}>
                    <Pressable onPress={() => navigation.navigate('Search')} style={styles.iconButton}>
                        <Text style={styles.iconText}>🔍</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
                        <Text style={styles.iconText}>⚙️</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <Pressable style={styles.actionButton} onPress={() => navigation.navigate('VoiceNote')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#FF6B6B' }]}>
                            <Ionicons name="mic" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.actionLabel}>Voice</Text>
                    </Pressable>
                    <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Mood')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#FFD93D' }]}>
                            <Ionicons name="happy" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.actionLabel}>Mood</Text>
                    </Pressable>
                    <Pressable style={styles.actionButton} onPress={() => navigation.navigate('ChecklistEditor', { listTitle: 'My Day' })}>
                        <View style={[styles.actionIcon, { backgroundColor: '#6BCB77' }]}>
                            <Ionicons name="checkbox" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.actionLabel}>Checklist</Text>
                    </Pressable>
                    <Pressable style={styles.actionButton} onPress={() => navigation.navigate('PhotoDetail', { uri: 'placeholder' })}>
                        {/* Placeholder for now, ideally opens camera or gallery picker first */}
                        <View style={[styles.actionIcon, { backgroundColor: '#4D96FF' }]}>
                            <Ionicons name="image" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.actionLabel}>Photo</Text>
                    </Pressable>
                </View>

                {/* Todo Lists Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Lists</Text>
                        <Pressable onPress={() => navigation.navigate('Create', { initialTab: 'task' })}>
                            <Text style={styles.seeAll}>+ New</Text>
                        </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {todoLists.map((list) => (
                            <Pressable
                                key={list.id}
                                style={[styles.listCard, { backgroundColor: list.theme_color || colors.surface }]}
                                onPress={() => navigation.navigate('TodoList', { listId: list.id, listTitle: list.title })}
                            >
                                <Text style={styles.listIcon}>{list.icon_emoji || '📝'}</Text>
                                <Text style={styles.listTitle}>{list.title}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Secure Vault Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Secure Vault</Text>
                    <Pressable
                        style={styles.vaultCard}
                        onPress={() => navigation.navigate('PasswordList')}
                    >
                        <View style={styles.vaultIconContainer}>
                            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.vaultContent}>
                            <Text style={styles.vaultTitle}>Passwords & Secrets</Text>
                            <Text style={styles.vaultSubtitle}>Biometric Protected</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    </Pressable>
                </View>

                {/* Recent Notes Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Notes</Text>
                        <Pressable onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </Pressable>
                    </View>
                    <NoteList
                        notes={recentNotes}
                        onNotePress={(id) => navigation.navigate('NoteEditor', { noteId: id })}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>

            {/* FAB */}
            <Pressable
                style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
                onPress={() => navigation.navigate('Create')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.m,
        marginBottom: spacing.s,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        ...typography.h1,
        color: colors.text,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: spacing.s,
    },
    iconButton: {
        padding: spacing.s,
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconText: {
        fontSize: 20,
    },
    scrollContent: {
        paddingBottom: 80, // Space for FAB
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginLeft: spacing.m,
        marginBottom: spacing.m,
    },
    horizontalScroll: {
        paddingLeft: spacing.m,
    },
    listCard: {
        width: 120,
        height: 100,
        borderRadius: 16,
        padding: spacing.m,
        marginRight: spacing.m,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    listIcon: {
        fontSize: 24,
    },
    listTitle: {
        ...typography.h3,
        fontSize: 16,
        color: '#FFF', // Assuming dark text on colored bg might be hard, defaulting to white for colored cards
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    addListCard: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0,
        elevation: 0,
    },
    addListIcon: {
        fontSize: 32,
        color: colors.textSecondary,
    },
    addListText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.m,
        marginBottom: spacing.xl,
    },
    actionButton: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    actionLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: spacing.m,
        marginBottom: spacing.m,
    },
    seeAll: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: 'bold',
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text,
        marginLeft: spacing.m,
    },
    vaultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.m,
        padding: spacing.m,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    vaultIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.m,
    },
    vaultContent: {
        flex: 1,
    },
    vaultTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: 2,
    },
    vaultSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: 100, // Adjusted for new tab bar height
        right: spacing.l,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabIcon: {
        fontSize: 32,
        color: colors.surface,
        marginTop: -2,
    },
});
