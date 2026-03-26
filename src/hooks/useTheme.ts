/**
 * Enhanced Theme Hook with User Toggle Support
 * Supports Light, Dark, and System (default) themes
 */

import { useState, useEffect, useCallback } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  colors: typeof Colors.light;
}

const THEME_STORAGE_KEY = 'balibuddy_theme_mode';

export function useTheme() {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // Calculate effective theme based on mode and system preference
  const effectiveTheme = themeMode === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : themeMode;
  
  const colors = Colors[effectiveTheme];
  
  // Load saved theme mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode);
      }
    }
  }, []);
  
  // Save theme mode to localStorage when it changes
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  }, []);
  
  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    const newMode = effectiveTheme === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }, [effectiveTheme, setThemeMode]);
  
  // Reset to system preference
  const resetToSystem = useCallback(() => {
    setThemeMode('system');
  }, [setThemeMode]);
  
  return {
    // Current state
    mode: themeMode,
    effectiveTheme,
    colors,
    isDark: effectiveTheme === 'dark',
    isSystem: themeMode === 'system',
    
    // Actions
    setThemeMode,
    toggleTheme,
    resetToSystem,
    
    // Convenience setters
    setLight: () => setThemeMode('light'),
    setDark: () => setThemeMode('dark'),
    setSystem: () => setThemeMode('system'),
  };
}

export default useTheme;