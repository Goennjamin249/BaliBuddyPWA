/**
 * MediaPicker Component
 * 
 * Demonstrates the use of expo-image-picker, expo-image-manipulator,
 * and expo-camera with NativeWind v5 styling.
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera, Image as ImageIcon, Video, X, RefreshCw } from 'lucide-react-native';
import { useMediaWorkflow, MediaAsset } from '../hooks/useMediaWorkflow';

interface MediaPickerProps {
  onMediaSelected?: (media: MediaAsset) => void;
  onMultipleMediaSelected?: (mediaList: MediaAsset[]) => void;
  allowMultiple?: boolean;
  allowVideo?: boolean;
  showPreview?: boolean;
}

function MediaPickerComponent({
  onMediaSelected,
  onMultipleMediaSelected,
  allowMultiple = false,
  allowVideo = false,
  showPreview = true,
}: MediaPickerProps) {
  const {
    selectedMedia,
    selectedMediaList,
    isProcessing,
    error,
    pickImage,
    pickMultipleImages,
    pickVideo,
    capturePhoto,
    processImage,
    clearSelection,
    clearError,
  } = useMediaWorkflow({
    allowsEditing: !allowMultiple,
    aspect: [4, 3],
    quality: 0.8,
  });

  const handlePickImage = async () => {
    if (allowMultiple) {
      const mediaList = await pickMultipleImages();
      if (mediaList.length > 0 && onMultipleMediaSelected) {
        onMultipleMediaSelected(mediaList);
      }
    } else {
      const media = await pickImage();
      if (media && onMediaSelected) {
        // Process image before callback
        const processedUri = await processImage(media.uri);
        onMediaSelected({ ...media, uri: processedUri });
      }
    }
  };

  const handlePickVideo = async () => {
    const media = await pickVideo();
    if (media && onMediaSelected) {
      onMediaSelected(media);
    }
  };

  const handleCapturePhoto = async () => {
    const media = await capturePhoto();
    if (media && onMediaSelected) {
      // Process image before callback
      const processedUri = await processImage(media.uri);
      onMediaSelected({ ...media, uri: processedUri });
    }
  };

  return (
    <View className="p-4">
      {/* Error Display */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-center">
          <Text className="text-red-700 flex-1">{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <X size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          className="flex-1 bg-blue-500 py-4 px-6 rounded-2xl flex-row items-center justify-center gap-2"
          onPress={handlePickImage}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ImageIcon size={20} color="#FFFFFF" />
          )}
          <Text className="text-white font-semibold">
            {allowMultiple ? 'Bilder wählen' : 'Bild wählen'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 py-4 px-6 rounded-2xl flex-row items-center justify-center gap-2"
          onPress={handleCapturePhoto}
          disabled={isProcessing}
        >
          <Camera size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold">Kamera</Text>
        </TouchableOpacity>

        {allowVideo && (
          <TouchableOpacity
            className="bg-purple-500 py-4 px-6 rounded-2xl flex-row items-center justify-center gap-2"
            onPress={handlePickVideo}
            disabled={isProcessing}
          >
            <Video size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold">Video</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Media Preview */}
      {showPreview && selectedMedia && (
        <View className="bg-white rounded-2xl p-4 shadow-lg">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Ausgewähltes Medium</Text>
            <TouchableOpacity onPress={clearSelection}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Image
            source={{ uri: selectedMedia.uri }}
            className="w-full h-48 rounded-xl"
            resizeMode="cover"
          />
          
          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-gray-500">
              {selectedMedia.width} x {selectedMedia.height}
            </Text>
            {selectedMedia.fileSize && (
              <Text className="text-sm text-gray-500">
                {(selectedMedia.fileSize / 1024 / 1024).toFixed(2)} MB
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Multiple Media Preview */}
      {showPreview && selectedMediaList.length > 0 && (
        <View className="bg-white rounded-2xl p-4 shadow-lg">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">
              {selectedMediaList.length} Bilder ausgewählt
            </Text>
            <TouchableOpacity onPress={clearSelection}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap gap-2">
            {selectedMediaList.map((media, index) => (
              <Image
                key={index}
                source={{ uri: media.uri }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-2xl">
          <View className="bg-white p-6 rounded-2xl items-center">
            <ActivityIndicator size="large" color="#00B4D8" />
            <Text className="mt-3 text-gray-700">Verarbeite...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export const MediaPicker = memo(MediaPickerComponent);
export default MediaPicker;