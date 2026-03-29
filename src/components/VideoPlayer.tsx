/**
 * VideoPlayer Component
 * 
 * Demonstrates the use of expo-video with NativeWind v5.
 * Provides a modern video player with controls.
 */

import React, { memo, useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react-native';

interface VideoPlayerProps {
  source: { uri: string } | number;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  className?: string;
}

function VideoPlayerComponent({
  source,
  poster,
  autoplay = false,
  loop = false,
  muted = false,
  showControls = true,
  className = '',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControlsOverlay, setShowControlsOverlay] = useState(showControls);

  const player = useVideoPlayer(source, (player) => {
    player.loop = loop;
    player.muted = muted;
    if (autoplay) {
      player.play();
    }
  });

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, player]);

  const toggleMute = useCallback(() => {
    player.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted, player]);

  const handleFullscreen = useCallback(() => {
    // Fullscreen logic would go here
    console.log('Fullscreen pressed');
  }, []);

  return (
    <View className={`relative rounded-2xl overflow-hidden bg-black ${className}`}>
      <VideoView
        style={styles.video}
        player={player}
      />

      {/* Custom Controls Overlay */}
      {showControlsOverlay && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
          <View className="flex-row items-center justify-between">
            {/* Play/Pause Button */}
            <TouchableOpacity
              className="bg-white/20 p-3 rounded-full"
              onPress={togglePlay}
            >
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              className="bg-white/20 p-3 rounded-full"
              onPress={toggleMute}
            >
              {isMuted ? (
                <VolumeX size={24} color="#FFFFFF" />
              ) : (
                <Volume2 size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Fullscreen Button */}
            <TouchableOpacity
              className="bg-white/20 p-3 rounded-full"
              onPress={handleFullscreen}
            >
              <Maximize size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 200,
  },
});

export const VideoPlayer = memo(VideoPlayerComponent);
export default VideoPlayer;