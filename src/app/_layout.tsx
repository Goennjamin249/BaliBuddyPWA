import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Stack } from "expo-router";
import React from "react";
import { StatusBar, View, useColorScheme, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import InstallPrompt from "../components/InstallPrompt";
import { ThemeProvider as CustomThemeProvider } from "../theme/ThemeContext";
import { registerServiceWorker } from "../utils/serviceWorker";
import "../global.css";
import "../i18n";

// Register Service Worker for offline support
if (typeof window !== "undefined") {
  registerServiceWorker();
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <View
            className="bg-background"
            style={{
              flex: 1,
            }}
          >
            <StatusBar
              barStyle={isDark ? "light-content" : "dark-content"}
              backgroundColor="transparent"
              translucent
            />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
            </Stack>

            <InstallPrompt />
            {typeof window !== "undefined" && <SpeedInsights />}
            {typeof window !== "undefined" && <Analytics />}
          </View>
        </ThemeProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
