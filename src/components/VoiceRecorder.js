import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { colors, spacing, typography } from '../theme';
import * as FileSystem from 'expo-file-system/legacy';
import { v4 as uuidv4 } from 'uuid';

export default function VoiceRecorder({ onRecordingComplete }) {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    async function startRecording() {
        try {
            if (permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);

        // Move to media dir
        const filename = `${uuidv4()}.m4a`;
        const newPath = FileSystem.documentDirectory + 'media/' + filename;

        try {
            await FileSystem.copyAsync({ from: uri, to: newPath });
            if (onRecordingComplete) {
                onRecordingComplete(newPath);
            }
        } catch (error) {
            console.error('Failed to save audio:', error);
        }
    }

    return (
        <View style={styles.container}>
            <Pressable
                style={[styles.button, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Text style={styles.text}>{isRecording ? 'Stop Recording' : 'Record Voice Note'}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.s,
    },
    button: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: 20,
        alignItems: 'center',
    },
    recordingButton: {
        backgroundColor: colors.error,
    },
    text: {
        color: colors.surface,
        fontWeight: 'bold',
    },
});
