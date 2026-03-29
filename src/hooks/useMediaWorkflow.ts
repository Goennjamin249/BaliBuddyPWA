/**
 * Media Workflow Hook
 * 
 * Provides a reusable workflow for picking, processing, and displaying images
 * using expo-image-picker and expo-image-manipulator.
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface MediaAsset {
  uri: string;
  width: number;
  height: number;
  type: 'image' | 'video';
  fileSize?: number;
  fileName?: string | null;
}

export interface MediaWorkflowOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowsMultipleSelection?: boolean;
  mediaTypes?: ImagePicker.MediaTypeOptions;
}

export interface UseMediaWorkflowReturn {
  // State
  selectedMedia: MediaAsset | null;
  selectedMediaList: MediaAsset[];
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  pickImage: () => Promise<MediaAsset | null>;
  pickMultipleImages: () => Promise<MediaAsset[]>;
  pickVideo: () => Promise<MediaAsset | null>;
  capturePhoto: () => Promise<MediaAsset | null>;
  processImage: (uri: string, operations?: ImageManipulator.Action[]) => Promise<string>;
  clearSelection: () => void;
  clearError: () => void;
}

/**
 * Custom hook for media workflow
 * Handles image picking, processing, and display
 */
export function useMediaWorkflow(options: MediaWorkflowOptions = {}): UseMediaWorkflowReturn {
  const {
    allowsEditing = true,
    aspect = [4, 3],
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    allowsMultipleSelection = false,
    mediaTypes = ImagePicker.MediaTypeOptions.Images,
  } = options;

  // State
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const [selectedMediaList, setSelectedMediaList] = useState<MediaAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request camera permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Kamera-Berechtigung erforderlich');
        return false;
      }
      return true;
    } catch (err) {
      setError('Fehler beim Anfordern der Berechtigung');
      return false;
    }
  }, []);

  /**
   * Pick a single image from library
   */
  const pickImage = useCallback(async (): Promise<MediaAsset | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing,
        aspect,
        quality,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mediaAsset: MediaAsset = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type === 'video' ? 'video' : 'image',
          fileSize: asset.fileSize,
          fileName: asset.fileName,
        };
        
        setSelectedMedia(mediaAsset);
        return mediaAsset;
      }
      return null;
    } catch (err) {
      setError('Fehler beim Auswählen des Bildes');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [mediaTypes, allowsEditing, aspect, quality]);

  /**
   * Pick multiple images from library
   */
  const pickMultipleImages = useCallback(async (): Promise<MediaAsset[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: false,
        quality,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const mediaAssets: MediaAsset[] = result.assets.map((asset) => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type === 'video' ? 'video' : 'image',
          fileSize: asset.fileSize,
          fileName: asset.fileName,
        }));
        
        setSelectedMediaList(mediaAssets);
        return mediaAssets;
      }
      return [];
    } catch (err) {
      setError('Fehler beim Auswählen der Bilder');
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [mediaTypes, quality]);

  /**
   * Pick a video from library
   */
  const pickVideo = useCallback(async (): Promise<MediaAsset | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mediaAsset: MediaAsset = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: 'video',
          fileSize: asset.fileSize,
          fileName: asset.fileName,
        };
        
        setSelectedMedia(mediaAsset);
        return mediaAsset;
      }
      return null;
    } catch (err) {
      setError('Fehler beim Auswählen des Videos');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Capture photo using camera
   */
  const capturePhoto = useCallback(async (): Promise<MediaAsset | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mediaAsset: MediaAsset = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: 'image',
          fileSize: asset.fileSize,
          fileName: asset.fileName,
        };
        
        setSelectedMedia(mediaAsset);
        return mediaAsset;
      }
      return null;
    } catch (err) {
      setError('Fehler beim Aufnehmen des Fotos');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [requestPermissions, allowsEditing, aspect, quality]);

  /**
   * Process image with manipulations (resize, crop, etc.)
   */
  const processImage = useCallback(async (
    uri: string,
    operations: ImageManipulator.Action[] = []
  ): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Default operations: resize if too large
      const defaultOperations: ImageManipulator.Action[] = [
        { resize: { width: maxWidth, height: maxHeight } },
      ];

      const actions = operations.length > 0 ? operations : defaultOperations;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (err) {
      setError('Fehler beim Verarbeiten des Bildes');
      return uri; // Return original URI on error
    } finally {
      setIsProcessing(false);
    }
  }, [maxWidth, maxHeight, quality]);

  /**
   * Clear selected media
   */
  const clearSelection = useCallback(() => {
    setSelectedMedia(null);
    setSelectedMediaList([]);
    setError(null);
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    selectedMedia,
    selectedMediaList,
    isProcessing,
    error,
    
    // Actions
    pickImage,
    pickMultipleImages,
    pickVideo,
    capturePhoto,
    processImage,
    clearSelection,
    clearError,
  };
}

export default useMediaWorkflow;