import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, XCircle } from 'lucide-react-native';
import { ScannerColors, ScannerBorderRadius, ScannerDimensions, CameraSettings } from '@/constants/scanner';

interface CameraSectionProps {
  isScanning: boolean;
  isProcessing: boolean;
  onCapturePhoto: (photoUri: string) => void;
  onStopScanning: () => void;
}

/**
 * CameraSection component for camera view and scanning controls
 * Handles both native camera and web simulation
 */
function CameraSection({ 
  isScanning, 
  isProcessing, 
  onCapturePhoto, 
  onStopScanning 
}: CameraSectionProps) {
  const { t } = useTranslation();

  const handleCapturePhoto = useCallback(async () => {
    // Simulate photo capture for now
    // In a real implementation, this would use the camera
    const simulatedPhotoUri = `photo_${Date.now()}.jpg`;
    onCapturePhoto(simulatedPhotoUri);
  }, [onCapturePhoto]);

  if (!isScanning) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View 
          style={styles.webPlaceholder}
          accessibilityRole="image"
          accessibilityLabel={t('scanner.cameraSimulated')}
        >
          <Camera size={64} color={ScannerColors.primary} />
          <Text style={styles.webPlaceholderText}>
            {t('scanner.cameraSimulated')}
          </Text>
          <Text style={styles.webPlaceholderHint}>
            {t('scanner.cameraHint')}
          </Text>
        </View>
      ) : (
        <View style={styles.nativeCameraContainer}>
          <View style={styles.cameraOverlay}>
            <View 
              style={styles.scanFrame}
              accessibilityRole="text"
              accessibilityLabel={t('scanner.alignMenu')}
            >
              <Text style={styles.scanFrameText}>{t('scanner.alignMenu')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <View 
          style={styles.processingOverlay}
          accessibilityRole="progressbar"
          accessibilityLabel={t('scanner.processingText')}
        >
          <ActivityIndicator size="large" color={ScannerColors.primary} />
          <Text style={styles.processingText}>{t('scanner.processingText')}</Text>
        </View>
      )}

      {/* Camera controls */}
      <View style={styles.controls}>
        {Platform.OS !== 'web' && (
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={handleCapturePhoto}
            disabled={isProcessing}
            accessibilityRole="button"
            accessibilityLabel={t('scanner.capture')}
            accessibilityState={{ disabled: isProcessing }}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.stopButton} 
          onPress={onStopScanning}
          accessibilityRole="button"
          accessibilityLabel={t('scanner.stop')}
        >
          <XCircle size={20} color="#FFFFFF" />
          <Text style={styles.stopButtonText}>{t('scanner.stop')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  webPlaceholder: {
    width: '100%',
    height: ScannerDimensions.cameraHeightWeb,
    backgroundColor: '#1F2937',
    borderRadius: ScannerBorderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  webPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  webPlaceholderHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  nativeCameraContainer: {
    width: '100%',
    height: ScannerDimensions.cameraHeight,
    borderRadius: ScannerBorderRadius.large,
    overflow: 'hidden',
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: ScannerDimensions.scanFrameWidth,
    height: ScannerDimensions.scanFrameHeight,
    borderWidth: 2,
    borderColor: ScannerColors.primary,
    borderRadius: ScannerBorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
  },
  scanFrameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ScannerDimensions.cameraHeightWeb,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: ScannerBorderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  captureButton: {
    width: ScannerDimensions.captureButtonSize,
    height: ScannerDimensions.captureButtonSize,
    borderRadius: ScannerBorderRadius.circle,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonInner: {
    width: ScannerDimensions.captureButtonInnerSize,
    height: ScannerDimensions.captureButtonInnerSize,
    borderRadius: ScannerBorderRadius.circle,
    backgroundColor: '#FFFFFF',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ScannerColors.danger,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: ScannerBorderRadius.medium,
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(CameraSection);