import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { TodoRepository } from '../repositories/TodoRepository';
import TaskItem from '../components/TaskItem';

export default function TodoListScreen({ navigation, route }) {
    const { listId, listTitle } = route.params || {};
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, [listId]);

    const loadTasks = async () => {
        if (!listId) return;
        try {
            const data = await TodoRepository.getTasksByList(listId);
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            await TodoRepository.addTask(listId, newTaskTitle);
            setNewTaskTitle('');
            loadTasks();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const handleToggleTask = async (taskId, isCompleted) => {
        try {
            await TodoRepository.toggleTask(taskId, isCompleted);
            // Optimistic update
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, is_completed: isCompleted ? 1 : 0 } : t
            ));
        } catch (error) {
            console.error('Failed to toggle task:', error);
            loadTasks(); // Revert on error
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
                <Text style={styles.title}>{listTitle || 'Todo List'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={tasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        onToggle={handleToggleTask}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a task..."
                    placeholderTextColor={colors.textSecondary}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    onSubmitEditing={handleAddTask}
                />
                <Pressable onPress={handleAddTask} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </Pressable>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backText: {
        ...typography.body,
        color: colors.primary,
    },
    title: {
        ...typography.h3,
        color: colors.text,
    },
    list: {
        padding: spacing.m,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        marginRight: spacing.s,
        color: colors.text,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: colors.surface,
        fontSize: 24,
        fontWeight: 'bold',
    },
});
