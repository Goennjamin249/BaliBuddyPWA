import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import '../i18n';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
    </ThemeProvider>
  );
}
