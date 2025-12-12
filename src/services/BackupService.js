import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { NoteRepository } from '../repositories/NoteRepository';
import { TodoRepository } from '../repositories/TodoRepository';
import { PasswordRepository } from '../repositories/PasswordRepository';

export const exportData = async () => {
    try {
        const notes = await NoteRepository.getNotes();
        const lists = await TodoRepository.getLists();
        // For passwords, we might want to export encrypted blobs or ask for master key to decrypt?
        // For safety, let's export encrypted blobs only.
        const passwords = await PasswordRepository.getPasswords();

        // We need to fetch tasks for each list
        const listsWithTasks = await Promise.all(lists.map(async (list) => {
            const tasks = await TodoRepository.getTasksByList(list.id);
            return { ...list, tasks };
        }));

        const backupData = {
            version: 1,
            timestamp: new Date().toISOString(),
            notes,
            todoLists: listsWithTasks,
            passwords, // Encrypted
        };

        const fileUri = FileSystem.documentDirectory + 'memo_backup.json';
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            console.log('Sharing not available');
        }
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
};
