import { getDB } from '../services/DBService';
import { v4 as uuidv4 } from 'uuid';
import { encryptData, decryptData } from '../services/EncryptionService';
import { getMasterKey } from '../services/SecurityService';

export const PasswordRepository = {
    createPassword: async (serviceName, username, password, url, notes, categoryId) => {
        const db = getDB();
        const id = uuidv4();
        const masterKey = getMasterKey();

        if (!masterKey) {
            throw new Error('Vault is locked. Cannot encrypt password.');
        }

        try {
            // Encrypt sensitive fields
            const encryptedPassword = encryptData(password, masterKey);
            const encryptedNotes = notes ? encryptData(notes, masterKey) : null;

            // We store IV inside the encrypted JSON string in our implementation of encryptData
            // So we can just store the result in password_enc and notes_enc
            // The schema has 'iv' column, but our encryptData returns JSON {iv, content}
            // We can either split it or store it all in password_enc. 
            // Let's stick to the schema: password_enc, iv.
            // Wait, our encryptData returns a JSON string. 
            // Let's parse it to fit the schema if we want separate columns, 
            // OR just store the whole JSON in password_enc and ignore 'iv' column for now 
            // (or store it redundantly).
            // Schema: password_enc TEXT, iv TEXT.
            // Let's split it for cleaner DB structure if possible, but encryptData returns a string.
            // Let's just store the JSON string in password_enc and leave iv null for now, 
            // or update schema later. Simpler to store the JSON string.

            await db.runAsync(
                `INSERT INTO passwords (id, service_name, username, password_enc, url, notes_enc, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, serviceName, username, encryptedPassword, url, encryptedNotes, categoryId]
            );
            return id;
        } catch (error) {
            console.error('Error creating password:', error);
            throw error;
        }
    },

    getPasswords: async () => {
        const db = getDB();
        try {
            // Return list without decrypting passwords (for list view)
            // Only decrypt username if needed, but we decided username is plain text in schema?
            // Schema says: username TEXT. So it's plain text.
            return await db.getAllAsync(`SELECT id, service_name, username, url, category_id FROM passwords`);
        } catch (error) {
            console.error('Error fetching passwords:', error);
            throw error;
        }
    },

    getPasswordById: async (id) => {
        const db = getDB();
        const masterKey = getMasterKey();

        if (!masterKey) {
            throw new Error('Vault is locked. Cannot decrypt password.');
        }

        try {
            const row = await db.getFirstAsync(`SELECT * FROM passwords WHERE id = ?`, [id]);
            if (!row) return null;

            // Decrypt
            const password = decryptData(row.password_enc, masterKey);
            const notes = row.notes_enc ? decryptData(row.notes_enc, masterKey) : '';

            return {
                ...row,
                password,
                notes
            };
        } catch (error) {
            console.error('Error fetching password details:', error);
            throw error;
        }
    },

    deletePassword: async (id) => {
        const db = getDB();
        try {
            await db.runAsync(`DELETE FROM passwords WHERE id = ?`, [id]);
        } catch (error) {
            console.error('Error deleting password:', error);
            throw error;
        }
    }
};
