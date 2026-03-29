/**
 * Media Demo Page
 * 
 * Demonstrates all new Expo modules and NativeWind v5 features:
 * - MediaPicker (expo-image-picker, expo-image-manipulator, expo-camera)
 * - GlassCard (expo-blur)
 * - SymbolButton (expo-symbols)
 * - MeshGradient (expo-mesh-gradient)
 * - LinearGradient (expo-linear-gradient)
 */

import React, { useState, memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera, Image, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

// Import new components
import MediaPicker from '../../components/MediaPicker';
import GlassCard from '../../components/GlassCard';
import SymbolButton from '../../components/SymbolButton';
import { LinearGradient, MeshGradient } from '../../lib/nativeWindInterop';

// Import media workflow hook
import { useMediaWorkflow, MediaAsset } from '../../hooks/useMediaWorkflow';

function MediaDemoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  const handleMediaSelected = (media: MediaAsset) => {
    setSelectedMedia(media);
    console.log('Media selected:', media);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Glass Effect */}
      <GlassCard 
        title="📱 Media Demo" 
        subtitle="Expo SDK 55 + NativeWind v5"
        intensity={80}
        tint="light"
        className="mx-4 mt-4"
      >
        <Text className="text-gray-600 text-sm">
          Demonstriert neue Module: Camera, Image Picker, Blur, Symbols, Gradient
        </Text>
      </GlassCard>

      <ScrollView className="flex-1 px-4 mt-4">
        {/* Section 1: Symbol Buttons */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            🎨 Native Symbols
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <SymbolButton
              name="camera.fill"
              label="Kamera"
              variant="filled"
              onPress={() => console.log('Camera pressed')}
            />
            <SymbolButton
              name="photo.on.rectangle"
              label="Galerie"
              variant="outlined"
              onPress={() => console.log('Gallery pressed')}
            />
            <SymbolButton
              name="heart.fill"
              label="Favorit"
              variant="ghost"
              color="#FF6B6B"
              onPress={() => console.log('Favorite pressed')}
            />
          </View>
        </View>

        {/* Section 2: Gradient Backgrounds */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            🌈 Gradient Backgrounds
          </Text>
          
          {/* Linear Gradient */}
          <LinearGradient
            colors={['#00B4D8', '#90BE6D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6 mb-4"
          >
            <Text className="text-white text-lg font-bold">
              Linear Gradient
            </Text>
            <Text className="text-white/80 text-sm mt-2">
              Tropical Teal → Rice Paddy Green
            </Text>
          </LinearGradient>

          {/* Mesh Gradient */}
          <MeshGradient
            colors={['#00B4D8', '#90BE6D', '#FF6B6B', '#F59E0B']}
            points={[
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
            ]}
            className="rounded-2xl h-32 mb-4"
          >
            <View className="flex-1 items-center justify-center">
              <Text className="text-white text-lg font-bold">
                Mesh Gradient
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Dynamic multi-color background
              </Text>
            </View>
          </MeshGradient>
        </View>

        {/* Section 3: Media Picker */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            📸 Media Picker
          </Text>
          <GlassCard intensity={30} tint="light">
            <MediaPicker
              onMediaSelected={handleMediaSelected}
              allowMultiple={false}
              allowVideo={false}
              showPreview={true}
            />
          </GlassCard>
        </View>

        {/* Section 4: Selected Media Display */}
        {selectedMedia && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              ✅ Ausgewähltes Medium
            </Text>
            <GlassCard 
              title="Verarbeitetes Bild" 
              subtitle="Automatisch zugeschnitten und komprimiert"
              intensity={40}
              tint="dark"
            >
              <View className="bg-gray-100 rounded-xl p-4 mt-2">
                <Text className="text-sm text-gray-600">
                  URI: {selectedMedia.uri.substring(0, 50)}...
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Größe: {selectedMedia.width} x {selectedMedia.height}
                </Text>
                {selectedMedia.fileSize && (
                  <Text className="text-sm text-gray-600 mt-1">
                    Dateigröße: {(selectedMedia.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Text>
                )}
              </View>
            </GlassCard>
          </View>
        )}

        {/* Section 5: Glassmorphism Examples */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            ✨ Glassmorphism
          </Text>
          
          <GlassCard 
            title="Leichte Transparenz" 
            subtitle="intensity: 30"
            intensity={30}
            tint="light"
            className="mb-4"
          >
            <Text className="text-gray-600 text-sm">
              Diese Karte hat eine leichte Glasmorphism-Effekt mit sanftem Unschärfe.
            </Text>
          </GlassCard>

          <GlassCard 
            title="Starke Transparenz" 
            subtitle="intensity: 80"
            intensity={80}
            tint="dark"
            className="mb-4"
          >
            <Text className="text-gray-300 text-sm">
              Diese Karte hat einen stärkeren Glasmorphism-Effekt mit dunklerem Tint.
            </Text>
          </GlassCard>
        </View>

        {/* Section 6: Navigation Back */}
        <View className="mb-8">
          <SymbolButton
            name="chevron.left"
            label="Zurück zur Startseite"
            variant="filled"
            onPress={handleBack}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MediaDemoScreen);