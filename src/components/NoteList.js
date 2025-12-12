import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useMemoContext } from '../contexts/MemoContext';
import { NoteRepository } from '../repositories/NoteRepository';

// Simple date formatting function to avoid external dependencies
const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
};

export default function NoteList({ notes, onNotePress, refreshing, onRefresh, scrollEnabled = true }) {
    const { theme } = useMemoContext();
    const { colors, spacing, typography } = theme;

    const handleLongPress = (note) => {
        Alert.alert(
            'Note Options',
            'Choose an action',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Edit',
                    onPress: () => onNotePress(note.id)
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await NoteRepository.deleteNote(note.id);
                            if (onRefresh) onRefresh();
                        } catch (error) {
                            console.error('Failed to delete note:', error);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = (item) => (
        <Pressable
            key={item.id}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.9 }
            ]}
            onPress={() => onNotePress(item.id)}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={500}
        >
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {item.title || 'Untitled'}
            </Text>
            <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.plain_text || 'No content'}
            </Text>
            <Text style={[styles.date, { color: colors.textTertiary }]}>
                {formatTimeAgo(item.updated_at)}
            </Text>
        </Pressable>
    );

    if (!scrollEnabled) {
        return (
            <View style={[styles.list, { padding: spacing.m, gap: spacing.m }]}>
                {notes.length === 0 ? (
                    <View style={[styles.empty, { padding: spacing.xl }]}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notes yet.</Text>
                    </View>
                ) : (
                    notes.map(renderItem)
                )}
            </View>
        );
    }

    return (
        <FlatList
            data={notes}
            renderItem={({ item }) => renderItem(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { padding: spacing.m, gap: spacing.m }]}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={[styles.empty, { padding: spacing.xl }]}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notes yet.</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    list: {
        // padding and gap handled inline for theme access
    },
    card: {
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    preview: {
        fontSize: 12,
        marginBottom: 8,
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
    },
    empty: {
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
