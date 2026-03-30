import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

interface OptimizedImageProps {
  source: { uri: string } | number;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image component using expo-image
 * Provides lazy loading, caching, and placeholder support
 */
function OptimizedImage({
  source,
  alt = '',
  width = 300,
  height = 200,
  className = '',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Error state
  if (hasError) {
    return (
      <View style={[styles.errorContainer, { width, height }]}>
        <Text style={styles.errorText}>Bild konnte nicht geladen werden</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={source}
        style={styles.image}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        placeholder={require('../../assets/images/icon.png')}
        contentFit="cover"
        transition={300}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#00B4D8" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    padding: 16,
  },
});

export default memo(OptimizedImage);