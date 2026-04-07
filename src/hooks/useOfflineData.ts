import { useCallback, useEffect, useState } from 'react';
import database from '../db';
// Q imported for potential future query building

interface PendingSync {
  id: string;
  tableName: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  createdAt: number;
  retryCount: number;
}

export function useOfflineData() {
  const [pendingSync, setPendingSync] = useState<PendingSync[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    loadPendingSync();
  }, []);

  const loadPendingSync = async () => {
    try {
      const collection = database.get('pending_sync');
      const items = await collection.query().fetch();
      setPendingSync(items as unknown as PendingSync[]);
  } catch {
    console.error('Error loading pending sync:');
  }
  };

  const queueForSync = useCallback(async (
    tableName: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ) => {
    try {
      const collection = database.get('pending_sync');
      await database.write(async () => {
        await collection.create((record: any) => {
          record.table_name = tableName;
          record.operation = operation;
          record.data = JSON.stringify(data);
          record.created_at = Date.now();
          record.retry_count = 0;
        });
      });
      await loadPendingSync();
  } catch {
    console.error('Error queueing for sync:');
  }
  }, []);

  const syncPendingItems = useCallback(async (syncFunction: Function) => {
    if (isSyncing || pendingSync.length === 0) return;
    setIsSyncing(true);
    const synced: string[] = [];
    const failed: string[] = [];

    for (const item of pendingSync) {
      try {
        await syncFunction(item);
        synced.push(item.id);
        const collection = database.get('pending_sync');
        const record = await collection.find(item.id);
        await database.write(async () => {
          await record.destroyPermanently();
        });
      } catch {
        failed.push(item.id);
        const collection = database.get('pending_sync');
        const record = await collection.find(item.id);
        await database.write(async () => {
          await record.update((r: any) => { r.retry_count += 1; });
        });
      }
    }

    setLastSyncTime(Date.now());
    await loadPendingSync();
    setIsSyncing(false);
    return { synced, failed };
  }, [isSyncing, pendingSync]);

  return { pendingSync, isSyncing, lastSyncTime, queueForSync, syncPendingItems, pendingCount: pendingSync.length };
}
