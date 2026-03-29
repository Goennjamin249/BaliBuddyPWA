/**
 * SymbolButton Component
 * 
 * Demonstrates the use of expo-symbols with NativeWind v5.
 * Uses SF Symbols on iOS and Material Symbols on Android/Web.
 */

import React, { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { SymbolView } from '../lib/nativeWindInterop';

interface SymbolButtonProps {
  name: string;
  label?: string;
  onPress?: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  variant?: 'filled' | 'outlined' | 'ghost';
  disabled?: boolean;
}

function SymbolButtonComponent({
  name,
  label,
  onPress,
  size = 24,
  color = '#00B4D8',
  backgroundColor,
  variant = 'ghost',
  disabled = false,
}: SymbolButtonProps) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: backgroundColor || color,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: color,
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'filled':
        return '#FFFFFF';
      case 'outlined':
      case 'ghost':
      default:
        return color;
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl ${
        disabled ? 'opacity-50' : ''
      }`}
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <SymbolView
        name={name}
        size={size}
        className={variant === 'filled' ? 'text-white' : ''}
        style={{ tintColor: variant === 'filled' ? '#FFFFFF' : color }}
      />
      {label && (
        <Text
          className="font-semibold text-base"
          style={{ color: getTextColor() }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export const SymbolButton = memo(SymbolButtonComponent);
export default SymbolButton;