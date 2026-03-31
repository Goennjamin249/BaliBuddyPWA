import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Image, ImageErrorEventData, ImageSource } from 'expo-image';
import { useUIStore } from '../stores/uiStore';
import { RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

// ============================================================================
// TYPES
// ============================================================================

interface OptimizedImageProps {
  /** Image source - URI string or local asset (require) */
  source: ImageSource | string | number;
  /** Alternative text for accessibility */
  alt?: string;
  /** Fixed width (px) - overrides aspectRatio if set */
  width?: number;
  /** Fixed height (px) - overrides aspectRatio if set */
  height?: number;
  /** Aspect ratio (width/height) - used if width/height not set */
  aspectRatio?: number;
  /** Additional Tailwind/NativeWind classes */
  className?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: ImageErrorEventData) => void;
  /** Custom placeholder image source */
  placeholder?: ImageSource | number;
  /** Whether to show retry button on error (default: true) */
  allowRetry?: boolean;
  /** Whether to show loading indicator (default: true) */
  showLoader?: boolean;
  /** Image content fit mode (default: 'cover') */
  contentFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Border radius in px (default: 12) */
  borderRadius?: number;
  /** Fallback image source when main image fails */
  fallbackSource?: ImageSource | string | number;
}

// ============================================================================
// COMPONENT
// ============================================================================


function OptimizedImage({
  source,
  alt = '',
  width,
  height,
  aspectRatio = 4 / 3,
  className = '',
  onLoad,
  onError,
  placeholder,
  allowRetry = true,
  showLoader = true,
  contentFit = 'cover',
  borderRadius = 12,
  fallbackSource,
}: OptimizedImageProps) {
  const { t } = useTranslation();
  const { isDark } = useUIStore();
  const { width: screenWidth } = useWindowDimensions();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSource, setCurrentSource] = useState(source);

  // Calculate dimensions
  const computedWidth = width ?? screenWidth - 32; // Default: screen width minus padding
  const computedHeight = height ?? computedWidth / aspectRatio;

  // Resolve image source (handle string URIs)
  const resolvedSource: ImageSource | number = typeof currentSource === 'string'
    ? { uri: currentSource }
    : currentSource;

  // Handlers
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(
    (event: ImageErrorEventData) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(event);

      // Try fallback source if available and not already using it
      if (fallbackSource && currentSource !== fallbackSource) {
        setCurrentSource(fallbackSource);
        setHasError(false);
        setIsLoading(true);
      }
    },
    [onError, fallbackSource, currentSource],
  );

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setIsLoading(true);
    setHasError(false);
    setCurrentSource(source); // Reset to original source
  }, [source]);

  // Error State with Retry
  if (hasError && !fallbackSource) {
    return (
      <View
        style={[
          styles.errorContainer,
          { width: computedWidth, height: computedHeight, borderRadius },
        ]}
        className={`${isDark ? 'bg-slate-800 ' : ''}${className ?? ''}`}
        accessibilityRole="image"
        accessibilityLabel={t('image.error', 'Bild konnte nicht geladen werden')}
      >
        <Text
          style={[styles.errorText, isDark && styles.errorTextDark]}
          className="text-center"
        >
          {t('image.loadError', 'Bild konnte nicht geladen werden')}
        </Text>

        {allowRetry && (
          <TouchableOpacity
            style={[styles.retryButton, isDark && styles.retryButtonDark]}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel={t('image.retry', 'Erneut versuchen')}
            accessibilityHint={t('image.retryHint', 'Bild erneut laden')}
          >
            <RefreshCw size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text
              style={[styles.retryText, isDark && styles.retryTextDark]}
            >
              {t('image.retry', 'Erneut versuchen')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: computedWidth, height: computedHeight, borderRadius },
      ]}
      className={className ?? ''}
      accessibilityRole="image"
      accessibilityLabel={alt || t('image.defaultAlt', 'Bild')}
    >
      <Image
        source={resolvedSource}
        style={[styles.image, { borderRadius }]}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        placeholder={placeholder}
        contentFit={contentFit}
        transition={300}
        cachePolicy="memory-disk"
        recyclingKey={`${typeof currentSource === 'string' ? currentSource : 'local'}-${retryCount}`}
      />

      {/* Loading Overlay */}
      {isLoading && showLoader && (
        <View
          style={[
            styles.loadingOverlay,
            { borderRadius },
            isDark && styles.loadingOverlayDark,
          ]}
          accessibilityRole="progressbar"
          accessibilityLabel={t('image.loading', 'Bild wird geladen')}
        >
          <ActivityIndicator size="small" color={isDark ? '#60A5FA' : '#00B4D8'} />
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
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
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
  },
  loadingOverlayDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  errorTextDark: {
    color: '#94A3B8',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  retryButtonDark: {
    backgroundColor: '#334155',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  retryTextDark: {
    color: '#94A3B8',
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export default memo(OptimizedImage);