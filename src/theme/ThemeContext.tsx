import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useUIStore } from "../stores/uiStore";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textMuted: string;
    highlight: string;
    border: string;
    card: string;
    cardMuted: string;
    surface: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme color definitions
const LIGHT_COLORS = {
  primary: "#FF9D6C",
  secondary: "#FFFFFF",
  background: "#F4F4F5",
  text: "#000000",
  textMuted: "#71717A",
  highlight: "#BB4E75",
  border: "rgba(0, 0, 0, 0.1)",
  card: "#FFFFFF",
  cardMuted: "rgba(0, 0, 0, 0.05)",
  surface: "#FFFFFF",
};

const DARK_COLORS = {
  primary: "#FF9D6C",
  secondary: "#000000",
  background: "#000000",
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  highlight: "#FF9D6C",
  border: "rgba(255, 255, 255, 0.1)",
  card: "rgba(0, 0, 0, 0.7)",
  cardMuted: "rgba(255, 255, 255, 0.05)",
  surface: "rgba(0, 0, 0, 0.7)",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { theme, isDark, setTheme, toggleTheme } = useUIStore();

  // Sync with system theme changes when theme is "system"
  useEffect(() => {
    if (theme === "system") {
      // isDark is already updated in uiStore via setTheme("system")
    }
  }, [theme, systemColorScheme]);

  // Determine effective theme mode
  const effectiveThemeMode: "light" | "dark" = isDark ? "dark" : "light";

  // Memoize colors to prevent unnecessary re-renders
  const colors = useMemo(
    () => (isDark ? DARK_COLORS : LIGHT_COLORS),
    [isDark]
  );

  return (
    <ThemeContext.Provider
      value={{
        themeMode: theme,
        setThemeMode: setTheme,
        toggleTheme,
        isDark,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
