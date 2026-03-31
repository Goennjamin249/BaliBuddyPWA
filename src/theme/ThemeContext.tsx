import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { themes, ThemeMode } from "../theme/themes";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    systemColorScheme === "dark" ? "dark" : "light",
  );

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors =
    themeMode === "light"
      ? {
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
        }
      : {
          primary: "#FF9D6C",
          secondary: "#1E293B",
          background: "#0F172A",
          text: "#FFFFFF",
          textMuted: "#A1A1AA",
          highlight: "#FF9D6C",
          border: "rgba(255, 255, 255, 0.1)",
          card: "#1E293B",
          cardMuted: "rgba(255, 255, 255, 0.05)",
          surface: "#1E293B",
        };

  return (
    <ThemeContext.Provider
      value={{ themeMode, setThemeMode, toggleTheme, colors }}
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
