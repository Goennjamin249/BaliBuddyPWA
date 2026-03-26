import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../services/network';

interface OfflineBannerProps {
  position?: 'top' | 'bottom';
}

export default function OfflineBanner({ position = 'top' }: OfflineBannerProps) {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <View style={[styles.banner, position === 'bottom' && styles.bannerBottom]}>
      <WifiOff size={16} color="#FFFFFF" />
      <Text style={styles.text}>
        Offline-Modus - Zeige zwischengespeicherte Daten
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 1000,
  },
  bannerBottom: {
    top: 'auto',
    bottom: 0,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});