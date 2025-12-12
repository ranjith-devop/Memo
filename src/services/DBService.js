import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

let db;

export const initDB = async () => {
  try {
    console.log('Initializing DB...');
    db = await SQLite.openDatabaseAsync('memo_v2.db');
    console.log('DB Opened:', db);
    await createTables();
    console.log('DB Initialized');
  } catch (error) {
    console.error('initDB Error:', error);
  }
};

const createTables = async () => {
  if (!db) return;
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content_json TEXT,
        plain_text TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        is_pinned INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS todo_lists (
        id TEXT PRIMARY KEY,
        title TEXT,
        theme_color TEXT,
        icon_emoji TEXT
      );

      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        list_id TEXT,
        title TEXT,
        is_completed INTEGER DEFAULT 0,
        due_date INTEGER,
        priority INTEGER,
        order_index INTEGER,
        FOREIGN KEY (list_id) REFERENCES todo_lists (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        title TEXT,
        trigger_type TEXT,
        trigger_value TEXT,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY,
        service_name TEXT,
        username TEXT,
        password_enc TEXT,
        iv TEXT,
        url TEXT,
        notes_enc TEXT,
        category_id TEXT
      );

      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        entity_id TEXT,
        type TEXT,
        file_path TEXT,
        file_hash TEXT,
        size_bytes INTEGER,
        duration_ms INTEGER
      );

      -- Drop FTS table and triggers to ensure clean state (fixing previous schema error)
      DROP TRIGGER IF EXISTS notes_ai;
      DROP TRIGGER IF EXISTS notes_ad;
      DROP TRIGGER IF EXISTS notes_au;
      DROP TABLE IF EXISTS notes_fts;

      -- Full Text Search (External Content)
      -- We use the internal rowid of 'notes' table because FTS5 requires an integer rowid.
      CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(title, plain_text, content='notes');

      -- Triggers for FTS (Using rowid)
      CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
        INSERT INTO notes_fts(rowid, title, plain_text) VALUES (new.rowid, new.title, new.plain_text);
      END;

      CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
        INSERT INTO notes_fts(notes_fts, rowid, title, plain_text) VALUES('delete', old.rowid, old.title, old.plain_text);
      END;

      CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
        INSERT INTO notes_fts(notes_fts, rowid, title, plain_text) VALUES('delete', old.rowid, old.title, old.plain_text);
        INSERT INTO notes_fts(rowid, title, plain_text) VALUES (new.rowid, new.title, new.plain_text);
      END;
      
      -- Rebuild index to ensure consistency
      INSERT INTO notes_fts(notes_fts) VALUES('rebuild');
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

export const getDB = () => {
  if (!db) {
    console.warn('getDB called before DB initialized');
  }
  return db;
};
