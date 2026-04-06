import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import i18n from "../i18n";

// Theme Type
export type Theme = "light" | "dark" | "system";

// UI State Interface
interface UIState {
  // Theme
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Language
  language: "de" | "en";
  setLanguage: (lang: "de" | "en") => void;

  // Loading States
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Global Error
  error: string | null;
  setError: (error: string | null) => void;

  // PWA Install Prompt
  showInstallPrompt: boolean;
  setShowInstallPrompt: (show: boolean) => void;
  deferredPrompt: any | null;
  setDeferredPrompt: (prompt: any | null) => void;
}

// Helper: Get system dark mode preference
const getSystemDarkMode = (): boolean => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

// Helper: Calculate isDark from theme
const calculateIsDark = (theme: Theme): boolean => {
  if (theme === "system") return getSystemDarkMode();
  return theme === "dark";
};

// Create UI Store with persist middleware
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: "system",
      isDark: calculateIsDark("system"), // Initialize with correct value
      setTheme: (theme) => {
        set({ theme, isDark: calculateIsDark(theme) });
      },
      toggleTheme: () => {
        const current = get().theme;
        const newTheme: Theme = current === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },

      // Language
      language: "de",
      setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language);
      },

      // Loading States
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),

      // Global Error
      error: null,
      setError: (error) => set({ error }),

      // PWA Install Prompt (not persisted)
      showInstallPrompt: false,
      setShowInstallPrompt: (showInstallPrompt) => set({ showInstallPrompt }),
      deferredPrompt: null,
      setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
    }),
    {
      name: "balibuddy-ui-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist theme and language, not transient states
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
      onRehydrateStorage: (state) => {
        return (state) => {
          if (state) {
            state.setTheme(state.theme);
          }
        };
      },
    }
  )
);

// Initialize theme from system preference on mount
let _cleanupThemeListener: (() => void) | null = null;

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleThemeChange = () => {
    const store = useUIStore.getState();
    if (store.theme === "system") {
      store.setTheme("system");
    }
  };

  mediaQuery.addEventListener("change", handleThemeChange);

  // Store cleanup function for potential re-registration
  _cleanupThemeListener = () => {
    mediaQuery.removeEventListener("change", handleThemeChange);
  };
}

// Export cleanup for manual invocation if needed
export const cleanupThemeListener = _cleanupThemeListener;

export default useUIStore;