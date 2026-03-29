/**
 * GlassCard Component
 * 
 * Demonstrates glassmorphism effects using expo-blur with NativeWind v5.
 * Provides a frosted glass appearance for headers, modals, and cards.
 */

import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from '../lib/nativeWindInterop';

interface GlassCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  className?: string;
}

function GlassCardComponent({
  children,
  title,
  subtitle,
  intensity = 50,
  tint = 'light',
  className = '',
}: GlassCardProps) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      className={`rounded-3xl overflow-hidden ${className}`}
    >
      <View className="p-6">
        {/* Header */}
        {(title || subtitle) && (
          <View className="mb-4">
            {title && (
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Content */}
        {children}
      </View>
    </BlurView>
  );
}

export const GlassCard = memo(GlassCardComponent);
export default GlassCard;