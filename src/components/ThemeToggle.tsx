/**
 * Glassmorphism Theme Toggle Component
 * Allows users to switch between Light, Dark, and System themes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/hooks/useTheme';

interface ThemeOptionProps {
  mode: ThemeMode;
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function ThemeOption({ mode, icon, label, isSelected, onPress }: ThemeOptionProps) {
  const { colors, isDark } = useTheme();
  
  const getIconColor = () => {
    if (isSelected) return '#FFFFFF';
    return isDark ? '#FFFFFF' : '#64748B';
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: isSelected 
            ? (isDark ? 'rgba(0, 180, 216, 0.2)' : 'rgba(0, 180, 216, 0.1)')
            : 'transparent',
          borderColor: isSelected 
            ? '#00B4D8' 
            : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        {
          backgroundColor: isSelected 
            ? '#00B4D8' 
            : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
        }
      ]}>
        {mode === 'light' && <Sun size={20} color={getIconColor()} />}
        {mode === 'dark' && <Moon size={20} color={getIconColor()} />}
        {mode === 'system' && <Monitor size={20} color={getIconColor()} />}
      </View>
      <Text style={[
        styles.optionLabel,
        { color: isSelected ? '#00B4D8' : (isDark ? '#FFFFFF' : '#0F172A') }
      ]}>
        {label}
      </Text>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: '#00B4D8' }]}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function ThemeToggle() {
  const { mode, setThemeMode, isDark, effectiveTheme } = useTheme();
  
  const themeOptions: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun />, label: 'Hell' },
    { mode: 'dark', icon: <Moon />, label: 'Dunkel' },
    { mode: 'system', icon: <Monitor />, label: 'System' },
  ];
  
  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark 
          ? 'rgba(30, 41, 59, 0.8)' 
          : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
      }
    ]}>
      {/* Glassmorphism background blur effect */}
      <View style={[
        styles.glassBackground,
        {
          backgroundColor: isDark 
            ? 'rgba(15, 23, 42, 0.6)' 
            : 'rgba(248, 250, 252, 0.8)',
        }
      ]} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#0F172A' }
        ]}>
          🎨 Design-Modus
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#94A3B8' : '#64748B' }
        ]}>
          Wähle dein bevorzugtes Theme
        </Text>
      </View>
      
      {/* Theme Options */}
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <ThemeOption
            key={option.mode}
            mode={option.mode}
            icon={option.icon}
            label={option.label}
            isSelected={mode === option.mode}
            onPress={() => setThemeMode(option.mode)}
          />
        ))}
      </View>
      
      {/* Current Status */}
      <View style={[
        styles.statusContainer,
        {
          backgroundColor: isDark 
            ? 'rgba(0, 180, 216, 0.1)' 
            : 'rgba(0, 180, 216, 0.05)',
          borderColor: isDark 
            ? 'rgba(0, 180, 216, 0.3)' 
            : 'rgba(0, 180, 216, 0.2)',
        }
      ]}>
        <Text style={[
          styles.statusText,
          { color: isDark ? '#00B4D8' : '#0E7490' }
        ]}>
          Aktiv: {mode === 'system' ? `System (${effectiveTheme === 'dark' ? 'Dunkel' : 'Hell'})` : (mode === 'dark' ? 'Dunkel' : 'Hell')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    margin: 16,
    borderWidth: 1,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ThemeToggle;