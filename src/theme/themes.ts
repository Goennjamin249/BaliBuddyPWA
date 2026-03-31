import { vars } from "nativewind";

export const themes = {
  light: vars({
    "--color-primary": "#FF9D6C", // Bali Sunrise Orange
    "--color-secondary": "#FFFFFF",
    "--color-background": "#F4F4F5",
    "--color-text": "#000000",
    "--color-text-muted": "#71717A",
    "--color-highlight": "#BB4E75", // Bali Pink
    "--color-border": "rgba(0, 0, 0, 0.1)",
    "--color-card": "#FFFFFF",
    "--color-card-muted": "rgba(0, 0, 0, 0.05)",
    "--color-surface": "#FFFFFF",
  }),
  dark: vars({
    "--color-primary": "#FF9D6C",
    "--color-secondary": "#1E293B",
    "--color-background": "#0F172A", // Deep Slate
    "--color-text": "#FFFFFF",
    "--color-text-muted": "#A1A1AA",
    "--color-highlight": "#FF9D6C",
    "--color-border": "rgba(255, 255, 255, 0.1)",
    "--color-card": "#1E293B",
    "--color-card-muted": "rgba(255, 255, 255, 0.05)",
    "--color-surface": "#1E293B",
  }),
};

export type ThemeMode = "light" | "dark";
