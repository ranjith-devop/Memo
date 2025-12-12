import { getDB } from '../services/DBService';
import { v4 as uuidv4 } from 'uuid';

export const NoteRepository = {
    createNote: async (title, contentJson, plainText) => {
        const db = getDB();
        const id = uuidv4();
        const now = Date.now();

        try {
            await db.runAsync(
                `INSERT INTO notes (id, title, content_json, plain_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
                [id, title, contentJson, plainText, now, now]
            );
            return id;
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    },

    getNotes: async () => {
        const db = getDB();
        try {
            return await db.getAllAsync(
                `SELECT * FROM notes WHERE is_archived = 0 ORDER BY updated_at DESC`
            );
        } catch (error) {
            console.error('Error fetching notes:', error);
            throw error;
        }
    },

    getNoteById: async (id) => {
        const db = getDB();
        try {
            return await db.getFirstAsync(
                `SELECT * FROM notes WHERE id = ?`,
                [id]
            );
        } catch (error) {
            console.error('Error fetching note:', error);
            throw error;
        }
    },

    updateNote: async (id, title, contentJson, plainText) => {
        const db = getDB();
        const now = Date.now();
        try {
            await db.runAsync(
                `UPDATE notes SET title = ?, content_json = ?, plain_text = ?, updated_at = ? WHERE id = ?`,
                [title, contentJson, plainText, now, id]
            );
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    },

    deleteNote: async (id) => {
        const db = getDB();
        try {
            // Soft delete (archive) or hard delete?
            // PRD mentions "Trash", but for now let's do hard delete or archive.
            // Let's implement Archive as "Soft Delete" for now, or just hard delete if user confirms.
            // The schema has is_archived.
            await db.runAsync(
                `UPDATE notes SET is_archived = 1, updated_at = ? WHERE id = ?`,
                [Date.now(), id]
            );
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    },

    searchNotes: async (query) => {
        const db = getDB();
        try {
            // Use FTS
            return await db.getAllAsync(
                `SELECT notes.* FROM notes 
                 JOIN notes_fts ON notes.rowid = notes_fts.rowid 
                 WHERE notes_fts MATCH ? 
                 ORDER BY notes_fts.rank`,
                [query]
            );
        } catch (error) {
            console.error('Error searching notes:', error);
            throw error;
        }
    }
};
