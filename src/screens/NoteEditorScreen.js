import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { NoteRepository } from '../repositories/NoteRepository';
import { useFocusEffect } from '@react-navigation/native';
import { pickImage, takePhoto } from '../services/MediaService';
import { Image } from 'react-native';

export default function NoteEditorScreen({ navigation, route }) {
    const { noteId } = route.params || {};
    const [note, setNote] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadNote = async () => {
            if (!noteId) return;
            try {
                const data = await NoteRepository.getNoteById(noteId);
                if (data) {
                    setNote(data);
                    setTitle(data.title);
                    // Parse content_json if needed, for now assuming simple text structure or plain text
                    // In CreateScreen we saved as { text: content }
                    try {
                        const json = JSON.parse(data.content_json);
                        setContent(json.text || '');
                        setImages(json.images || []);
                    } catch (e) {
                        setContent(data.plain_text || '');
                    }
                }
            } catch (error) {
                console.error('Failed to load note:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadNote();
    }, [noteId]);

    // Auto-save effect
    useEffect(() => {
        if (!noteId || isLoading) return;

        const save = async () => {
            setIsSaving(true);
            try {
                await NoteRepository.updateNote(
                    noteId,
                    title,
                    JSON.stringify({ text: content, images: images }),
                    content
                );
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        };

        const timeoutId = setTimeout(save, 1000); // Debounce 1s
        return () => clearTimeout(timeoutId);
    }, [title, content, images, noteId, isLoading]);

    const handleAttach = async () => {
        try {
            const uri = await pickImage();
            if (uri) {
                setImages([...images, uri]);
            }
        } catch (error) {
            console.error('Failed to attach image:', error);
        }
    };

    if (isLoading && noteId) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
                <Text style={styles.statusText}>
                    {isSaving ? 'Saving...' : 'Saved'}
                </Text>
            </View>

            <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
            />

            <View style={styles.toolbar}>
                <Pressable onPress={handleAttach} style={styles.toolButton}>
                    <Text style={styles.toolText}>📷</Text>
                </Pressable>
            </View>

            <TextInput
                style={styles.contentInput}
                placeholder="Start typing..."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
            />

            <View style={styles.imageGrid}>
                {images.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.image} />
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
    },
    backButton: {
        padding: spacing.s,
    },
    backText: {
        ...typography.body,
        color: colors.primary,
    },
    statusText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    titleInput: {
        ...typography.h2,
        color: colors.text,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
    },
    contentInput: {
        ...typography.body,
        color: colors.text,
        flex: 1,
        padding: spacing.m,
        lineHeight: 24,
    },
    toolbar: {
        flexDirection: 'row',
        padding: spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    toolButton: {
        padding: spacing.s,
        marginRight: spacing.s,
    },
    toolText: {
        fontSize: 20,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.m,
        gap: spacing.s,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
});
