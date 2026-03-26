import { Database } from '@nozbe/watermelondb';
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

export default database;