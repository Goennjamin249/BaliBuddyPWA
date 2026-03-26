/**
 * Sync Hook for WatermelonDB
 * Provides sync management functionality for React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  syncWithStatusTracking, 
  triggerManualSync, 
  getSyncStatus, 
  initializeSync,
  clearSyncData,
  SyncStatus 
} from '@/db/sync';

interface UseSyncReturn {
  // Sync status
  status: SyncStatus;
  isSyncing: boolean;
  lastSyncAt: number | null;
  lastError: string | null;
  pendingChanges: number;
  
  // Sync actions
  sync: () => Promise<void>;
  clearData: () => Promise<void>;
  
  // Status helpers
  isOnline: boolean;
  syncAge: number | null; // milliseconds since last sync
  needsSync: boolean;
}

export function useSync(): UseSyncReturn {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncAt: null,
    lastError: null,
    pendingChanges: 0,
  });
  
  const [isOnline, setIsOnline] = useState(true);

  // Update sync status periodically
  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = getSyncStatus();
      setStatus(currentStatus);
    };

    // Update immediately
    updateStatus();

    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Monitor online status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Set initial status
      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Initialize sync on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeSync();
      } catch (error) {
        console.error('[useSync] Failed to initialize sync:', error);
      }
    };

    init();
  }, []);

  // Manual sync trigger
  const sync = useCallback(async () => {
    if (!isOnline) {
      console.log('[useSync] Cannot sync while offline');
      return;
    }

    try {
      const newStatus = await triggerManualSync();
      setStatus(newStatus);
    } catch (error) {
      console.error('[useSync] Manual sync failed:', error);
      setStatus(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [isOnline]);

  // Clear sync data
  const clearData = useCallback(async () => {
    try {
      await clearSyncData();
      const newStatus = getSyncStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('[useSync] Failed to clear sync data:', error);
    }
  }, []);

  // Calculate sync age
  const syncAge = status.lastSyncAt 
    ? Date.now() - status.lastSyncAt 
    : null;

  // Determine if sync is needed (older than 5 minutes)
  const needsSync = !status.lastSyncAt || (syncAge !== null && syncAge > 5 * 60 * 1000);

  return {
    // Status
    status,
    isSyncing: status.isSyncing,
    lastSyncAt: status.lastSyncAt,
    lastError: status.lastError,
    pendingChanges: status.pendingChanges,
    
    // Actions
    sync,
    clearData,
    
    // Helpers
    isOnline,
    syncAge,
    needsSync,
  };
}

export default useSync;