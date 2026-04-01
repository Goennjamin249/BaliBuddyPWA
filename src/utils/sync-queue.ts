/**
 * BaliBuddy Sync Queue
 * Offline-first optimistic updates with background sync
 * Ensures data consistency when connection is restored
 */

import * as kvStore from './kv-store';
import NetInfo from '@react-native-community/netinfo';

// Sync Queue Keys
const SYNC_QUEUE_KEY = '@balibuddy:sync_queue';
const LAST_SYNC_KEY = '@balibuddy:last_sync';

// Sync operation types
export type SyncOperationType = 
  | 'ADD_FAVORITE'
  | 'REMOVE_FAVORITE'
  | 'UPDATE_POI'
  | 'UPDATE_SETTINGS';

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncQueueState {
  operations: SyncOperation[];
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
}

// In-memory cache for instant access
let queueCache: SyncOperation[] | null = null;

/**
 * Initialize sync queue from storage
 */
export async function initSyncQueue(): Promise<void> {
  try {
    const stored = await kvStore.getJSON<SyncOperation[]>(SYNC_QUEUE_KEY);
    queueCache = stored ?? [];
    console.log(`[SyncQueue] Initialized with ${queueCache.length} pending operations`);
  } catch (error) {
    console.error('[SyncQueue] Failed to initialize:', error);
    queueCache = [];
  }
}

/**
 * Get all pending operations (synchronous after init)
 */
export function getPendingOperations(): SyncOperation[] {
  return queueCache ?? [];
}

/**
 * Add operation to sync queue
 */
export async function addToQueue(
  type: SyncOperationType,
  data: any,
  maxRetries: number = 3
): Promise<string> {
  const operation: SyncOperation = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries,
  };

  // Update in-memory cache immediately
  if (!queueCache) queueCache = [];
  queueCache.push(operation);

  // Persist to storage
  await saveQueue();

  console.log(`[SyncQueue] Added operation: ${operation.id} (${type})`);
  return operation.id;
}

/**
 * Remove operation from queue
 */
export async function removeFromQueue(operationId: string): Promise<void> {
  if (!queueCache) return;

  queueCache = queueCache.filter(op => op.id !== operationId);
  await saveQueue();

  console.log(`[SyncQueue] Removed operation: ${operationId}`);
}

/**
 * Update operation retry count
 */
export async function incrementRetry(operationId: string): Promise<boolean> {
  if (!queueCache) return false;

  const operation = queueCache.find(op => op.id === operationId);
  if (!operation) return false;

  operation.retryCount++;

  if (operation.retryCount >= operation.maxRetries) {
    console.warn(`[SyncQueue] Operation ${operationId} exceeded max retries, removing`);
    await removeFromQueue(operationId);
    return false;
  }

  await saveQueue();
  return true;
}

/**
 * Save queue to storage
 */
async function saveQueue(): Promise<void> {
  if (!queueCache) return;
  await kvStore.setJSON(SYNC_QUEUE_KEY, queueCache);
}

/**
 * Check if online
 */
async function isOnline(): Promise<boolean> {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true && netInfo.isInternetReachable === true;
  } catch {
    return false;
  }
}

/**
 * Process sync queue (call when connection is restored)
 */
export async function processQueue(): Promise<{ synced: number; failed: number }> {
  if (!queueCache || queueCache.length === 0) {
    return { synced: 0, failed: 0 };
  }

  const online = await isOnline();
  if (!online) {
    console.log('[SyncQueue] Offline, skipping sync');
    return { synced: 0, failed: 0 };
  }

  console.log(`[SyncQueue] Processing ${queueCache.length} operations...`);

  let synced = 0;
  let failed = 0;

  // Process operations in order
  for (const operation of [...queueCache]) {
    try {
      const success = await syncOperation(operation);
      
      if (success) {
        await removeFromQueue(operation.id);
        synced++;
      } else {
        const canRetry = await incrementRetry(operation.id);
        if (!canRetry) failed++;
      }
    } catch (error) {
      console.error(`[SyncQueue] Error syncing operation ${operation.id}:`, error);
      const canRetry = await incrementRetry(operation.id);
      if (!canRetry) failed++;
    }
  }

  // Update last sync timestamp
  await kvStore.set(LAST_SYNC_KEY, Date.now().toString());

  console.log(`[SyncQueue] Sync complete: ${synced} synced, ${failed} failed`);
  return { synced, failed };
}

/**
 * Sync individual operation
 */
async function syncOperation(operation: SyncOperation): Promise<boolean> {
  // In a real app, this would make API calls to sync data
  // For now, we'll simulate successful sync
  
  console.log(`[SyncQueue] Syncing: ${operation.type} (${operation.id})`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For demo purposes, always succeed
  // In production, implement actual API calls based on operation.type
  return true;
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTimestamp(): Promise<number | null> {
  try {
    const timestamp = await kvStore.get(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Clear sync queue (use with caution)
 */
export async function clearQueue(): Promise<void> {
  queueCache = [];
  await kvStore.remove(SYNC_QUEUE_KEY);
  console.log('[SyncQueue] Queue cleared');
}

/**
 * Get queue stats
 */
export function getQueueStats(): { pending: number; oldestTimestamp: number | null } {
  if (!queueCache || queueCache.length === 0) {
    return { pending: 0, oldestTimestamp: null };
  }

  const oldestTimestamp = Math.min(...queueCache.map(op => op.timestamp));
  return { pending: queueCache.length, oldestTimestamp };
}

// Initialize on import
initSyncQueue();