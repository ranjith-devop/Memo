import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { TodoRepository } from '../repositories/TodoRepository';
import { Ionicons } from '@expo/vector-icons';

export default function ChecklistEditorScreen({ navigation, route }) {
    const { listId } = route.params || {};
    const [listTitle, setListTitle] = useState('');
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentListId, setCurrentListId] = useState(listId);

    useEffect(() => {
        if (currentListId) {
            loadList();
        } else {
            setIsLoading(false);
        }
    }, [currentListId]);

    const loadList = async () => {
        try {
            // For MVP, we might need a way to get list details if we passed an ID
            // But TodoRepository.getLists returns all. Let's assume we can fetch tasks.
            const fetchedTasks = await TodoRepository.getTasksByList(currentListId);
            setTasks(fetchedTasks);

            // Ideally we should fetch the list title too. 
            // For now, if it's a new list, title is empty.
            // If existing, we might need to pass title in params or fetch it.
            if (route.params?.listTitle) {
                setListTitle(route.params.listTitle);
            }
        } catch (error) {
            console.error('Failed to load list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveList = async () => {
        if (!listTitle.trim()) return;
        try {
            if (!currentListId) {
                const id = await TodoRepository.createList(listTitle, colors.primary, '📝');
                setCurrentListId(id);
                return id;
            }
            // Update list title logic if repository supports it
            return currentListId;
        } catch (error) {
            console.error('Failed to save list:', error);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;

        try {
            let targetListId = currentListId;
            if (!targetListId) {
                targetListId = await handleSaveList();
                if (!targetListId) return; // Save failed or no title
            }

            await TodoRepository.addTask(targetListId, newTaskTitle);
            setNewTaskTitle('');
            loadList(); // Refresh tasks
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        try {
            await TodoRepository.toggleTask(taskId, !currentStatus);
            // Optimistic update or reload
            setTasks(tasks.map(t =>
                t.id === taskId ? { ...t, is_completed: !currentStatus } : t
            ));
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await TodoRepository.deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Done</Text>
                </Pressable>
                <TextInput
                    style={styles.titleInput}
                    placeholder="List Title"
                    placeholderTextColor={colors.textSecondary}
                    value={listTitle}
                    onChangeText={setListTitle}
                    onBlur={handleSaveList}
                />
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.taskItem}>
                        <Pressable
                            onPress={() => handleToggleTask(item.id, item.is_completed)}
                            style={styles.checkbox}
                        >
                            {item.is_completed && (
                                <Ionicons name="checkmark" size={18} color={colors.surface} />
                            )}
                        </Pressable>
                        <Text style={[
                            styles.taskText,
                            item.is_completed && styles.completedText
                        ]}>
                            {item.title}
                        </Text>
                        <Pressable onPress={() => handleDeleteTask(item.id)} style={styles.deleteButton}>
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                )}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.taskInput}
                    placeholder="Add a task..."
                    placeholderTextColor={colors.textSecondary}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    onSubmitEditing={handleAddTask}
                />
                <Pressable onPress={handleAddTask} style={styles.addButton}>
                    <Ionicons name="arrow-up" size={24} color={colors.surface} />
                </Pressable>
            </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: spacing.m,
    },
    backText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: 'bold',
    },
    titleInput: {
        ...typography.h3,
        color: colors.text,
        flex: 1,
    },
    list: {
        padding: spacing.m,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.s,
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
        backgroundColor: 'transparent',
    },
    taskText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
    deleteButton: {
        padding: spacing.s,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
    taskInput: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.m,
        borderRadius: 20,
        color: colors.text,
        marginRight: spacing.m,
        ...typography.body,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
