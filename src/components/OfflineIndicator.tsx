import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';

interface OfflineIndicatorProps {
  onRetry?: () => void;
}

export function OfflineIndicator({ onRetry }: OfflineIndicatorProps) {
  const { isOffline, checkConnection } = useNetworkStatus();

  const handleRetry = async () => {
    const connected = await checkConnection();
    if (connected && onRetry) onRetry();
  };

  if (!isOffline) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={handleRetry}>
      <Ionicons name="cloud-offline" size={20} color="#FFF" />
      <Text style={styles.text}>Offline - Changes will sync when connected</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 8,
    gap: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
