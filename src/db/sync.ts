/**
 * WatermelonDB Sync Foundation for MongoDB
 * Provides sync logic structure for future backend integration
 */

import { synchronize } from '@nozbe/watermelondb/sync';
import database from './index';

// Sync configuration
const SYNC_CONFIG = {
  // Backend endpoints (to be implemented with MongoDB)
  pullChangesEndpoint: '/api/sync/pull',
  pushChangesEndpoint: '/api/sync/push',
  
  // Sync settings
  syncInterval: 5 * 60 * 1000, // 5 minutes
  batchSize: 100,
  
  // Conflict resolution strategy
  conflictResolution: 'last-write-wins' as const,
};

// Pull changes from remote server
async function pullChanges(lastPulledAt: number | null): Promise<any> {
  try {
    const response = await fetch(SYNC_CONFIG.pullChangesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastPulledAt: lastPulledAt || 0,
        batchSize: SYNC_CONFIG.batchSize,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pull changes failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      changes: data.changes || {},
      timestamp: data.timestamp || Date.now(),
    };
  } catch (error) {
    console.error('Pull changes error:', error);
    // Return empty changes for now (will be implemented with MongoDB)
    return {
      changes: {},
      timestamp: Date.now(),
    };
  }
}

// Push changes to remote server
async function pushChanges(changes: any): Promise<void> {
  try {
    const response = await fetch(SYNC_CONFIG.pushChangesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        changes,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Push changes failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Push changes error:', error);
    // For now, we'll silently fail push operations
    // In production, this should queue changes for retry
  }
}

// Main sync function
export async function syncWithBackend(): Promise<void> {
  try {
    console.log('[Sync] Starting sync with backend...');
    
    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt }) => {
        console.log('[Sync] Pulling changes since:', lastPulledAt);
        return await pullChanges(lastPulledAt);
      },
      pushChanges: async ({ changes }) => {
        console.log('[Sync] Pushing changes:', Object.keys(changes));
        await pushChanges(changes);
      },
      migrationsEnabledAtVersion: 1,
    });
    
    console.log('[Sync] Sync completed successfully');
  } catch (error) {
    console.error('[Sync] Sync failed:', error);
    throw error;
  }
}

// Sync status tracking
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: number | null;
  lastError: string | null;
  pendingChanges: number;
}

let syncStatus: SyncStatus = {
  isSyncing: false,
  lastSyncAt: null,
  lastError: null,
  pendingChanges: 0,
};

// Get current sync status
export function getSyncStatus(): SyncStatus {
  return { ...syncStatus };
}

// Update sync status
function updateSyncStatus(updates: Partial<SyncStatus>): void {
  syncStatus = { ...syncStatus, ...updates };
}

// Sync with status tracking
export async function syncWithStatusTracking(): Promise<SyncStatus> {
  if (syncStatus.isSyncing) {
    console.log('[Sync] Sync already in progress');
    return syncStatus;
  }

  updateSyncStatus({
    isSyncing: true,
    lastError: null,
  });

  try {
    await syncWithBackend();
    
    updateSyncStatus({
      isSyncing: false,
      lastSyncAt: Date.now(),
      lastError: null,
    });
  } catch (error) {
    updateSyncStatus({
      isSyncing: false,
      lastError: error instanceof Error ? error.message : 'Unknown sync error',
    });
  }

  return syncStatus;
}

// Initialize sync on app startup
export async function initializeSync(): Promise<void> {
  try {
    // Wait a bit for the app to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Perform initial sync
    await syncWithStatusTracking();
    
    // Set up periodic sync
    setInterval(async () => {
      try {
        await syncWithStatusTracking();
      } catch (error) {
        console.error('[Sync] Periodic sync failed:', error);
      }
    }, SYNC_CONFIG.syncInterval);
    
    console.log('[Sync] Sync initialized with interval:', SYNC_CONFIG.syncInterval);
  } catch (error) {
    console.error('[Sync] Failed to initialize sync:', error);
  }
}

// Manual sync trigger
export async function triggerManualSync(): Promise<SyncStatus> {
  console.log('[Sync] Manual sync triggered');
  return await syncWithStatusTracking();
}

// Clear sync data (for testing/reset)
export async function clearSyncData(): Promise<void> {
  try {
    // Reset sync status
    syncStatus = {
      isSyncing: false,
      lastSyncAt: null,
      lastError: null,
      pendingChanges: 0,
    };
    
    console.log('[Sync] Sync data cleared');
  } catch (error) {
    console.error('[Sync] Failed to clear sync data:', error);
  }
}

export default {
  syncWithBackend,
  syncWithStatusTracking,
  initializeSync,
  triggerManualSync,
  clearSyncData,
  getSyncStatus,
  SYNC_CONFIG,
};