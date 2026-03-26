import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import '../i18n';
import InstallPrompt from '../components/InstallPrompt';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Register Service Worker
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    console.log('New version available!');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="currency/index" />
        <Stack.Screen name="phrasebook/index" />
        <Stack.Screen name="map/index" />
        <Stack.Screen name="visa/index" />
        <Stack.Screen name="bargaining/index" />
        <Stack.Screen name="itinerary/index" />
        <Stack.Screen name="packing/index" />
        <Stack.Screen name="ferries/index" />
        <Stack.Screen name="scanner/index" />
        <Stack.Screen name="fare/index" />
        <Stack.Screen name="bars/index" />
        <Stack.Screen name="calendar/index" />
        <Stack.Screen name="crowd/index" />
        <Stack.Screen name="expenses/index" />
        <Stack.Screen name="rideshare/index" />
        <Stack.Screen name="safety/index" />
        <Stack.Screen name="laws/index" />
        <Stack.Screen name="weather/index" />
        <Stack.Screen name="radar/index" />
      </Stack>
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* Vercel Speed Insights - Web only */}
      {Platform.OS === 'web' && <SpeedInsights />}
    </ThemeProvider>
  );
}
