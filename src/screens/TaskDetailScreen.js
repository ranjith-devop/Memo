import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { TodoRepository } from '../repositories/TodoRepository';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TaskDetailScreen({ navigation, route }) {
    const { task } = route.params;
    const [title, setTitle] = useState(task.title);
    const [priority, setPriority] = useState(task.priority || 1);
    const [dueDate, setDueDate] = useState(task.due_date ? new Date(task.due_date) : null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;
        try {
            await TodoRepository.updateTask(
                task.id,
                title,
                priority,
                dueDate ? dueDate.toISOString() : null
            );
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to update task');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Task',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await TodoRepository.deleteTask(task.id);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete task');
                        }
                    }
                }
            ]
        );
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeText}>Cancel</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Task Details</Text>
                <Pressable onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveText}>Save</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <TextInput
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Task Title"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityRow}>
                        {[1, 2, 3].map((p) => (
                            <Pressable
                                key={p}
                                style={[
                                    styles.priorityChip,
                                    priority === p && styles.activePriority
                                ]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={[
                                    styles.priorityText,
                                    priority === p && styles.activePriorityText
                                ]}>
                                    {p === 1 ? 'Low' : p === 2 ? 'Medium' : 'High'}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Due Date</Text>
                    <Pressable
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={24} color={colors.text} />
                        <Text style={styles.dateText}>
                            {dueDate ? dueDate.toLocaleDateString() : 'Set Due Date'}
                        </Text>
                        {dueDate && (
                            <Pressable onPress={() => setDueDate(null)} style={styles.clearDate}>
                                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                            </Pressable>
                        )}
                    </Pressable>
                    {showDatePicker && (
                        <DateTimePicker
                            value={dueDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>

                <Pressable onPress={handleDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Delete Task</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    closeText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.text,
    },
    saveText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: spacing.m,
    },
    section: {
        marginBottom: spacing.xl,
    },
    titleInput: {
        ...typography.h2,
        color: colors.text,
        minHeight: 60,
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.s,
    },
    priorityRow: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    priorityChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    activePriority: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    priorityText: {
        ...typography.body,
        color: colors.text,
    },
    activePriorityText: {
        color: colors.surface,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.m,
        borderRadius: 12,
        gap: spacing.m,
    },
    dateText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
    },
    clearDate: {
        padding: 4,
    },
    deleteButton: {
        alignItems: 'center',
        padding: spacing.m,
        marginTop: spacing.xl,
    },
    deleteText: {
        ...typography.body,
        color: colors.error,
    },
});
