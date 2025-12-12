import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { takePhoto, pickImage } from '../services/MediaService';
import { NoteRepository } from '../repositories/NoteRepository';

export default function QuickCaptureScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePhoto = async (mode) => {
        setIsLoading(true);
        try {
            const uri = mode === 'camera' ? await takePhoto() : await pickImage();
            if (uri) {
                // Create a new note with this image
                const noteId = await NoteRepository.createNote(
                    '', // No title yet
                    JSON.stringify({ text: '', images: [uri] }),
                    '' // No plain text
                );
                navigation.replace('NoteEditor', { noteId });
            }
        } catch (error) {
            console.error('Capture failed:', error);
            Alert.alert('Error', 'Failed to capture image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Quick Capture</Text>
                <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeText}>Close</Text>
                </Pressable>
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <>
                        <Pressable style={styles.card} onPress={() => handlePhoto('camera')}>
                            <Text style={styles.icon}>📷</Text>
                            <Text style={styles.label}>Take Photo</Text>
                        </Pressable>

                        <Pressable style={styles.card} onPress={() => handlePhoto('gallery')}>
                            <Text style={styles.icon}>🖼️</Text>
                            <Text style={styles.label}>Choose Image</Text>
                        </Pressable>

                        <Pressable style={styles.card} onPress={() => navigation.replace('Create', { initialTab: 'note' })}>
                            <Text style={styles.icon}>📝</Text>
                            <Text style={styles.label}>New Note</Text>
                        </Pressable>
                    </>
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
    },
    title: {
        ...typography.h2,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.s,
    },
    closeText: {
        ...typography.body,
        color: colors.primary,
    },
    content: {
        flex: 1,
        padding: spacing.m,
        gap: spacing.m,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    icon: {
        fontSize: 48,
        marginBottom: spacing.s,
    },
    label: {
        ...typography.h3,
        color: colors.text,
    },
});
