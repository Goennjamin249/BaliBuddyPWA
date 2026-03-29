import { Database, Q } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import schema from './schema';
import migrations from './migrations';

// Create LokiJS adapter for web (IndexedDB)
const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

// Create database instance
const database = new Database({
  adapter,
  modelClasses: [
    // Models will be imported here as they are created
  ],
});

// Optimized batch write helper for performance
export async function batchWrite(operations: Array<() => Promise<any>>): Promise<void> {
  await database.write(async () => {
    const records = await Promise.all(operations.map(op => op()));
    await database.batch(...records);
  });
}

// Optimized query helper with caching
export async function cachedQuery<T>(
  tableName: string,
  query?: (collection: any) => any
): Promise<T[]> {
  const collection = database.get(tableName);
  if (query) {
    return (await query(collection).fetch()) as T[];
  }
  return (await collection.query().fetch()) as T[];
}

// Batch insert helper for bulk operations
export async function batchInsert<T>(
  tableName: string,
  items: Partial<T>[]
): Promise<void> {
  const collection = database.get(tableName);
  await database.write(async () => {
    const operations = items.map(item => 
      collection.prepareCreate(record => {
        Object.assign(record, item);
      })
    );
    await database.batch(...operations);
  });
}

// Batch update helper
export async function batchUpdate<T>(
  records: any[],
  updates: Partial<T>
): Promise<void> {
  await database.write(async () => {
    const operations = records.map(record =>
      record.prepareUpdate(() => {
        Object.assign(record, updates);
      })
    );
    await database.batch(...operations);
  });
}

export default database;
export { Q };
