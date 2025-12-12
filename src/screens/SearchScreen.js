import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { NoteRepository } from '../repositories/NoteRepository';
import NoteList from '../components/NoteList';
import { useFocusEffect } from '@react-navigation/native';

export default function SearchScreen({ navigation }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const data = await NoteRepository.searchNotes(query);
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search notes..."
                    placeholderTextColor={colors.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                />
            </View>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <NoteList
                    notes={results}
                    onNotePress={(id) => navigation.navigate('NoteEditor', { noteId: id })}
                />
            )}
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
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: spacing.m,
    },
    backText: {
        ...typography.body,
        color: colors.primary,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 8,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        color: colors.text,
        ...typography.body,
    },
    loading: {
        padding: spacing.xl,
    },
});
