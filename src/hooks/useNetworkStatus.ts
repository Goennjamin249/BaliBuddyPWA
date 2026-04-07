import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
  isOffline: boolean;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    type: 'unknown',
    isOffline: false,
  });

  useEffect(() => {
    // ✅ Web / Browser Implementierung
    if (Platform.OS === 'web') {
      const updateOnlineStatus = () => {
        const isOnline = navigator.onLine;
        setNetworkStatus({
          isConnected: isOnline,
          isInternetReachable: isOnline,
          type: 'web',
          isOffline: !isOnline,
        });
      };

      updateOnlineStatus();
      
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }

    // ✅ Native Implementierung
    // Dynamisch importieren damit es auf Web nicht crasht
    import('@react-native-community/netinfo').then((netinfo) => {
      const unsubscribe = netinfo.addEventListener((state: any) => {
        setNetworkStatus({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          isOffline: !state.isConnected || state.isInternetReachable === false,
        });
      });

      return unsubscribe;
    });
  }, []);

  const checkConnection = useCallback(async () => {
    if (Platform.OS === 'web') {
      return navigator.onLine;
    }
    
    try {
      const netinfo = await import('@react-native-community/netinfo');
      const state = await netinfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch {
      return true;
    }
  }, []);

  return { ...networkStatus, checkConnection };
}
