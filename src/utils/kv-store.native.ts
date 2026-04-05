/**
 * BaliBuddy KV-Store - Native Implementation
 * Uses expo-sqlite for JSI-backed synchronous storage
 */

import * as SQLite from 'expo-sqlite';

// Database instance - lazy initialized
let db: SQLite.SQLiteDatabase | null = null;

// Initialize database with kv-store table
async function initDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('balibuddy-kv.db');
  
  // Create kv-store table if not exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER))
    );
    CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store(key);
  `);
  
  return db;
}

export async function get(key: string): Promise<string | null> {
  const database = await initDB();
  const result = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM kv_store WHERE key = ?',
    [key]
  );
  return result?.value ?? null;
}

export async function set(key: string, value: string): Promise<void> {
  const database = await initDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO kv_store (key, value, updated_at) VALUES (?, ?, CAST(strftime('%s', 'now') * 1000 AS INTEGER))`,
    [key, value]
  );
}

export async function remove(key: string): Promise<void> {
  const database = await initDB();
  await database.runAsync('DELETE FROM kv_store WHERE key = ?', [key]);
}

export async function clearAll(): Promise<void> {
  const database = await initDB();
  await database.execAsync('DELETE FROM kv_store');
}

export async function getMultiple(keys: string[]): Promise<Map<string, string | null>> {
  const database = await initDB();
  const result = new Map<string, string | null>();
  
  if (keys.length === 0) return result;
  
  const placeholders = keys.map(() => '?').join(',');
  const rows = await database.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM kv_store WHERE key IN (${placeholders})`,
    keys
  );
  
  keys.forEach(key => result.set(key, null));
  rows.forEach(row => result.set(row.key, row.value));
  
  return result;
}

export async function setMultiple(entries: [string, string][]): Promise<void> {
  const database = await initDB();
  
  await database.withTransactionAsync(async () => {
    for (const [key, value] of entries) {
      await database.runAsync(
        `INSERT OR REPLACE INTO kv_store (key, value, updated_at) VALUES (?, ?, CAST(strftime('%s', 'now') * 1000 AS INTEGER))`,
        [key, value]
      );
    }
  });
}

export async function getKeysWithPrefix(prefix: string): Promise<string[]> {
  const database = await initDB();
  const rows = await database.getAllAsync<{ key: string }>(
    'SELECT key FROM kv_store WHERE key LIKE ?',
    [`${prefix}%`]
  );
  return rows.map(row => row.key);
}

export async function getTimestamp(key: string): Promise<number | null> {
  const database = await initDB();
  const result = await database.getFirstAsync<{ updated_at: number }>(
    'SELECT updated_at FROM kv_store WHERE key = ?',
    [key]
  );
  return result?.updated_at ?? null;
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const value = await get(key);
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn(`[KV-Store] Failed to parse JSON for key: ${key}`);
    return null;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await set(key, JSON.stringify(value));
}