import { getDB } from '../services/DBService';
import { v4 as uuidv4 } from 'uuid';

export const TodoRepository = {
    // --- Lists ---
    createList: async (title, themeColor, iconEmoji) => {
        const db = getDB();
        const id = uuidv4();
        try {
            await db.runAsync(
                `INSERT INTO todo_lists (id, title, theme_color, icon_emoji) VALUES (?, ?, ?, ?)`,
                [id, title, themeColor, iconEmoji]
            );
            return id;
        } catch (error) {
            console.error('Error creating todo list:', error);
            throw error;
        }
    },

    getLists: async () => {
        const db = getDB();
        try {
            // Get lists with task counts? For now just lists.
            return await db.getAllAsync(`SELECT * FROM todo_lists`);
        } catch (error) {
            console.error('Error fetching todo lists:', error);
            throw error;
        }
    },

    deleteList: async (id) => {
        const db = getDB();
        try {
            // Cascade delete should handle tasks if configured, but let's be safe
            await db.runAsync(`DELETE FROM todo_lists WHERE id = ?`, [id]);
        } catch (error) {
            console.error('Error deleting todo list:', error);
            throw error;
        }
    },

    // --- Tasks ---
    addTask: async (listId, title, priority = 1, dueDate = null) => {
        const db = getDB();
        const id = uuidv4();
        try {
            // Get current max order index
            const result = await db.getFirstAsync(
                `SELECT MAX(order_index) as maxOrder FROM todos WHERE list_id = ?`,
                [listId]
            );
            const nextOrder = (result?.maxOrder || 0) + 1;

            await db.runAsync(
                `INSERT INTO todos (id, list_id, title, is_completed, priority, due_date, order_index) VALUES (?, ?, ?, 0, ?, ?, ?)`,
                [id, listId, title, priority, dueDate, nextOrder]
            );
            return id;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    },

    getTasksByList: async (listId) => {
        const db = getDB();
        try {
            return await db.getAllAsync(
                `SELECT * FROM todos WHERE list_id = ? ORDER BY is_completed ASC, order_index ASC`,
                [listId]
            );
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    toggleTask: async (id, isCompleted) => {
        const db = getDB();
        try {
            await db.runAsync(
                `UPDATE todos SET is_completed = ? WHERE id = ?`,
                [isCompleted ? 1 : 0, id]
            );
        } catch (error) {
            console.error('Error toggling task:', error);
            throw error;
        }
    },

    updateTask: async (id, title, priority, dueDate) => {
        const db = getDB();
        try {
            await db.runAsync(
                `UPDATE todos SET title = ?, priority = ?, due_date = ? WHERE id = ?`,
                [title, priority, dueDate, id]
            );
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    deleteTask: async (id) => {
        const db = getDB();
        try {
            await db.runAsync(`DELETE FROM todos WHERE id = ?`, [id]);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
};
