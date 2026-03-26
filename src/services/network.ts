import { useState, useEffect, useCallback } from 'react';

// Network status types
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
}

// Network service for detecting online/offline status
class NetworkService {
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeListeners();
    }
  }

  private initializeListeners() {
    // Initial status
    this.currentStatus = {
      isConnected: navigator.onLine,
      isInternetReachable: navigator.onLine,
      type: 'unknown',
    };

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline() {
    this.updateStatus({
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
    });
  }

  private handleOffline() {
    this.updateStatus({
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
    });
  }

  private updateStatus(status: NetworkStatus) {
    this.currentStatus = status;
    this.listeners.forEach(listener => listener(status));
  }

  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  isOnline(): boolean {
    return this.currentStatus.isConnected && this.currentStatus.isInternetReachable;
  }

  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Test actual internet connectivity
  async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const networkService = new NetworkService();

// React hook for network status
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(networkService.getStatus());

  useEffect(() => {
    const unsubscribe = networkService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const checkConnectivity = useCallback(async () => {
    const isReachable = await networkService.testConnectivity();
    return isReachable;
  }, []);

  return {
    ...status,
    isOnline: status.isConnected && status.isInternetReachable,
    checkConnectivity,
  };
}

export default networkService;
