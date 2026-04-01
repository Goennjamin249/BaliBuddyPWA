/**
 * BaliBuddy Cached Image Component
 * Uses expo-image for high-performance image caching
 * Supports prefetching and offline-first image loading
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, ImageContentFit, ImageSource } from 'expo-image';
import { useTheme } from '../theme/ThemeContext';

interface CachedImageProps {
  source: ImageSource | string;
  style?: any;
  contentFit?: ImageContentFit;
  placeholder?: string;
  blurhash?: string;
  transition?: number;
  priority?: 'low' | 'normal' | 'high';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  showLoadingIndicator?: boolean;
}

// In-memory cache for prefetch results
const prefetchCache = new Set<string>();

/**
 * CachedImage component with expo-image
 */
export function CachedImage({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  blurhash,
  transition = 200,
  priority = 'normal',
  onLoad,
  onError,
  showLoadingIndicator = true,
}: CachedImageProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize source to ImageSource
  const imageSource: ImageSource = typeof source === 'string' 
    ? { uri: source } 
    : source;

  // Handle load complete
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Handle error
  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error instanceof Error ? error : new Error('Image load failed'));
  };

  // Prefetch image on mount if not cached
  useEffect(() => {
    const uri = imageSource.uri;
    if (uri && !prefetchCache.has(uri)) {
      prefetchImage(uri).catch(console.warn);
    }
  }, [imageSource.uri]);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[styles.image, style]}
        contentFit={contentFit}
        placeholder={placeholder || blurhash}
        transition={transition}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="memory-disk"
        recyclingKey={imageSource.uri}
      />
      
      {/* Loading indicator */}
      {isLoading && showLoadingIndicator && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

/**
 * Prefetch images in background
 */
export async function prefetchImage(uri: string): Promise<void> {
  if (prefetchCache.has(uri)) return;

  try {
    await Image.prefetch(uri);
    prefetchCache.add(uri);
    console.log(`[CachedImage] Prefetched: ${uri}`);
  } catch (error) {
    console.warn(`[CachedImage] Prefetch failed: ${uri}`, error);
  }
}

/**
 * Prefetch multiple images
 */
export async function prefetchImages(uris: string[]): Promise<void> {
  const uncachedUris = uris.filter(uri => !prefetchCache.has(uri));
  
  if (uncachedUris.length === 0) return;

  try {
    await Promise.allSettled(
      uncachedUris.map(uri => Image.prefetch(uri))
    );
    uncachedUris.forEach(uri => prefetchCache.add(uri));
    console.log(`[CachedImage] Prefetched ${uncachedUris.length} images`);
  } catch (error) {
    console.warn('[CachedImage] Batch prefetch failed:', error);
  }
}

/**
 * Clear image cache (memory and disk)
 */
export async function clearImageCache(): Promise<void> {
  try {
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    prefetchCache.clear();
    console.log('[CachedImage] Cache cleared');
  } catch (error) {
    console.warn('[CachedImage] Failed to clear cache:', error);
  }
}

/**
 * Get cache size info
 */
export async function getCacheSize(): Promise<{ memory: number; disk: number }> {
  try {
    // Note: expo-image doesn't expose cache size directly
    // This is a placeholder for future implementation
    return { memory: 0, disk: 0 };
  } catch {
    return { memory: 0, disk: 0 };
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default CachedImage;