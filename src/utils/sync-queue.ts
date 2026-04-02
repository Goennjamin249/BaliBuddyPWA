/**
 * BaliBuddy Sync Queue
 * Offline-first optimistic updates with background sync
 * Ensures data consistency when connection is restored
 */

import * as kvStore from './kv-store';
import NetInfo from '@react-native-community/netinfo';
import { SyncService } from '../services/api';

// Sync Queue Keys
const SYNC_QUEUE_KEY = '@balibuddy:sync_queue';
const LAST_SYNC_KEY = '@balibuddy:last_sync';

// Sync operation types mapped to collection names
export type SyncOperationType = 
  | 'ADD_FAVORITE'
  | 'REMOVE_FAVORITE'
  | 'UPDATE_POI'
  | 'UPDATE_SETTINGS'
  | 'CREATE_RECORD'
  | 'UPDATE_RECORD'
  | 'DELETE_RECORD';

export interface SyncOperationData {
  collection?: string;
  id?: string;
  [key: string]: unknown;
}

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  data: SyncOperationData;
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
  data: SyncOperationData,
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
 * Map operation type to collection name
 */
function getCollectionForOperation(type: SyncOperationType, data: SyncOperationData): string {
  switch (type) {
    case 'ADD_FAVORITE':
    case 'REMOVE_FAVORITE':
      return 'favorites';
    case 'UPDATE_POI':
      return 'pois';
    case 'UPDATE_SETTINGS':
      return 'settings';
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    default:
      return data?.collection || 'records';
  }
}

/**
 * Map operation type to change type for sync push
 */
function getChangeType(type: SyncOperationType): 'created' | 'updated' | 'deleted' {
  switch (type) {
    case 'ADD_FAVORITE':
    case 'CREATE_RECORD':
      return 'created';
    case 'UPDATE_POI':
    case 'UPDATE_SETTINGS':
    case 'UPDATE_RECORD':
      return 'updated';
    case 'REMOVE_FAVORITE':
    case 'DELETE_RECORD':
      return 'deleted';
    default:
      return 'updated';
  }
}

/**
 * Sync individual operation with real API
 */
async function syncOperation(operation: SyncOperation): Promise<boolean> {
  console.log(`[SyncQueue] Syncing: ${operation.type} (${operation.id})`);
  
  try {
    const collection = getCollectionForOperation(operation.type, operation.data);
    const changeType = getChangeType(operation.type);
    
    const result = await SyncService.push(collection, [{
      type: changeType,
      id: operation.id,
      data: operation.data,
    }]);
    
    if (result.success) {
      console.log(`[SyncQueue] Successfully synced: ${operation.id}`);
      return true;
    }
    
    console.error(`[SyncQueue] Sync failed for ${operation.id}:`, result.errors);
    return false;
  } catch (error) {
    console.error(`[SyncQueue] Sync error for ${operation.id}:`, error);
    return false;
  }
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