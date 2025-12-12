import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { NoteRepository } from '../repositories/NoteRepository';
import { Ionicons } from '@expo/vector-icons';

const MOODS = [
    { emoji: '😊', label: 'Happy', color: '#FFD700' },
    { emoji: '😐', label: 'Neutral', color: '#A9A9A9' },
    { emoji: '😔', label: 'Sad', color: '#4682B4' },
    { emoji: '😠', label: 'Angry', color: '#FF6347' },
    { emoji: '😴', label: 'Tired', color: '#9370DB' },
    { emoji: '🤩', label: 'Excited', color: '#FF69B4' },
];

export default function MoodScreen({ navigation }) {
    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!selectedMood) {
            Alert.alert('Select Mood', 'Please select how you are feeling.');
            return;
        }

        setIsSaving(true);
        try {
            const title = `Mood: ${selectedMood.emoji} ${selectedMood.label}`;
            await NoteRepository.createNote(
                title,
                JSON.stringify({ mood: selectedMood, note }),
                note || selectedMood.label
            );
            navigation.goBack();
        } catch (error) {
            console.error('Failed to save mood:', error);
            Alert.alert('Error', 'Failed to save mood entry.');
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
                <Text style={styles.title}>How are you?</Text>
                <Pressable
                    onPress={handleSave}
                    style={[styles.saveButton, (!selectedMood || isSaving) && { opacity: 0.5 }]}
                    disabled={!selectedMood || isSaving}
                >
                    <Text style={styles.saveText}>Save</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.moodGrid}>
                    {MOODS.map((mood) => (
                        <Pressable
                            key={mood.label}
                            style={[
                                styles.moodItem,
                                selectedMood?.label === mood.label && styles.selectedMood,
                                { borderColor: selectedMood?.label === mood.label ? mood.color : 'transparent' }
                            ]}
                            onPress={() => setSelectedMood(mood)}
                        >
                            <Text style={styles.emoji}>{mood.emoji}</Text>
                            <Text style={[
                                styles.moodLabel,
                                selectedMood?.label === mood.label && { color: mood.color }
                            ]}>{mood.label}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.noteContainer}>
                    <Text style={styles.label}>Add a note (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Why do you feel this way?"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        value={note}
                        onChangeText={setNote}
                    />
                </View>
            </ScrollView>
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
        padding: spacing.m,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.m,
        marginBottom: spacing.xl,
    },
    moodItem: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    selectedMood: {
        backgroundColor: colors.surface,
    },
    emoji: {
        fontSize: 40,
        marginBottom: spacing.s,
    },
    moodLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    noteContainer: {
        gap: spacing.s,
    },
    label: {
        ...typography.body,
        color: colors.textSecondary,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.m,
        color: colors.text,
        ...typography.body,
        minHeight: 120,
        textAlignVertical: 'top',
    },
});
