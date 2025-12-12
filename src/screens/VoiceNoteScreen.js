import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import VoiceRecorder from '../components/VoiceRecorder';
import { NoteRepository } from '../repositories/NoteRepository';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceNoteScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [audioUri, setAudioUri] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleRecordingComplete = (uri) => {
        setAudioUri(uri);
    };

    const handleSave = async () => {
        if (!audioUri) {
            Alert.alert('No Recording', 'Please record a voice note first.');
            return;
        }

        setIsSaving(true);
        try {
            const noteTitle = title.trim() || 'Voice Note ' + new Date().toLocaleTimeString();
            await NoteRepository.createNote(
                noteTitle,
                JSON.stringify({ audio: audioUri }),
                'Voice Note' // Plain text fallback
            );
            navigation.goBack();
        } catch (error) {
            console.error('Failed to save voice note:', error);
            Alert.alert('Error', 'Failed to save voice note.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>New Voice Note</Text>
                <Pressable
                    onPress={handleSave}
                    style={[styles.saveButton, (!audioUri || isSaving) && { opacity: 0.5 }]}
                    disabled={!audioUri || isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color={colors.surface} />
                    ) : (
                        <Text style={styles.saveText}>Save</Text>
                    )}
                </Pressable>
            </View>

            <View style={styles.content}>
                <TextInput
                    style={styles.titleInput}
                    placeholder="Title (optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.recorderContainer}>
                    <VoiceRecorder onRecordingComplete={handleRecordingComplete} />

                    {audioUri && (
                        <View style={styles.audioPreview}>
                            <Ionicons name="musical-note" size={32} color={colors.primary} />
                            <Text style={styles.audioText}>Audio Recorded</Text>
                        </View>
                    )}
                </View>
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
    closeButton: {
        padding: spacing.s,
    },
    title: {
        ...typography.h3,
        color: colors.text,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderRadius: 20,
    },
    saveText: {
        ...typography.button,
        color: colors.surface,
    },
    content: {
        flex: 1,
        padding: spacing.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleInput: {
        ...typography.h2,
        color: colors.text,
        width: '100%',
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    recorderContainer: {
        alignItems: 'center',
        gap: spacing.l,
    },
    audioPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.m,
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 12,
        marginTop: spacing.m,
    },
    audioText: {
        ...typography.body,
        color: colors.text,
    },
});
