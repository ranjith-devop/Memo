import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { scheduleReminder } from '../services/ReminderService';

export default function TaskItem({ task, onToggle, onDelete }) {
    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [styles.checkbox, pressed && { opacity: 0.7 }]}
                onPress={() => onToggle(task.id, !task.is_completed)}
            >
                {!!task.is_completed && <View style={styles.checked} />}
            </Pressable>

            <View style={styles.content}>
                <Text style={[
                    styles.title,
                    task.is_completed && styles.completedTitle
                ]}>
                    {task.title}
                </Text>
            </View>

            <View style={[
                styles.priority,
                { backgroundColor: getPriorityColor(task.priority) }
            ]} />

            <Pressable onPress={() => handleSetReminder(task)} style={styles.reminderButton}>
                <Text style={styles.reminderIcon}>🔔</Text>
            </Pressable>
        </View>
    );
}

const handleSetReminder = async (task) => {
    Alert.alert(
        'Set Reminder',
        'Remind me in:',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: '1 Minute',
                onPress: async () => {
                    await scheduleReminder(task.title, 'Task Reminder', 60);
                    Alert.alert('Success', 'Reminder set for 1 minute');
                }
            },
            {
                text: '1 Hour',
                onPress: async () => {
                    await scheduleReminder(task.title, 'Task Reminder', 3600);
                    Alert.alert('Success', 'Reminder set for 1 hour');
                }
            }
        ]
    );
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 3: return colors.error; // High
        case 2: return colors.warning; // Med
        default: return colors.success; // Low
    }
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.s,
        borderWidth: 1,
        borderColor: colors.border,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.m,
    },
    checked: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
    },
    title: {
        ...typography.body,
        color: colors.text,
    },
    completedTitle: {
        color: colors.textTertiary,
        textDecorationLine: 'line-through',
    },
    priority: {
        width: 4,
        height: '100%',
        borderRadius: 2,
        marginLeft: spacing.s,
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    reminderButton: {
        padding: spacing.s,
        marginLeft: spacing.s,
    },
    reminderIcon: {
        fontSize: 16,
        opacity: 0.5,
    },
});
