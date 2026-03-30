import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InstallPrompt from "../components/InstallPrompt";
import "../global.css"; // NativeWind v5 CSS with @theme
import "../i18n";
import { initSentry } from "../lib/sentry";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Initialize Sentry for error tracking
  useEffect(() => {
    initSentry();
  }, []);

  // Register Service Worker - Web only
  useEffect(() => {
    // Using web-specific check without Platform.OS
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration.scope);

            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New version available
                    console.log("New version available!");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  const isDark = colorScheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            // Explicit light/dark mode styling
            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
          },
        }}
      >
        {/* Main App Entry - Redirects to Tabs */}
        <Stack.Screen name="index" />

        {/* 5-Tab Consolidated Navigation */}
        <Stack.Screen name="(tabs)" />

        {/* Feature Screens */}
        <Stack.Screen name="scanner/index" />
        <Stack.Screen name="scooter-check/index" />
        <Stack.Screen name="ocr-scanner/index" />
        <Stack.Screen name="dictionary/index" />
        <Stack.Screen name="law-hub/index" />
      </Stack>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Vercel Speed Insights - Web only */}
      {typeof window !== "undefined" && <SpeedInsights />}

      {/* Vercel Analytics - Web only */}
      {typeof window !== "undefined" && <Analytics />}
    </ThemeProvider>
  );
}
