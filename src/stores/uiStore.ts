import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Theme Type
export type Theme = 'light' | 'dark' | 'system';

// UI State Interface
interface UIState {
  // Theme
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Language
  language: 'de' | 'en';
  setLanguage: (lang: 'de' | 'en') => void;

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

// Create UI Store with persistence
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      isDark: false,
      setTheme: (theme) => {
        set({ theme });
        // Update isDark based on theme
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          set({ isDark });
        } else {
          set({ isDark: theme === 'dark' });
        }
      },
      toggleTheme: () => {
        const current = get().theme;
        const newTheme: Theme = current === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      // Language
      language: 'de',
      setLanguage: (language) => {
        set({ language });
        // Update i18n language
        import('../i18n').then(({ default: i18n }) => {
          i18n.changeLanguage(language);
        });
      },

      // Loading States
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),

      // Global Error
      error: null,
      setError: (error) => set({ error }),

      // PWA Install Prompt
      showInstallPrompt: false,
      setShowInstallPrompt: (showInstallPrompt) => set({ showInstallPrompt }),
      deferredPrompt: null,
      setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
    }),
    {
      name: 'balibuddy-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        showInstallPrompt: state.showInstallPrompt,
      }),
    }
  )
);

// Initialize theme from system preference on mount
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleThemeChange = () => {
    const store = useUIStore.getState();
    if (store.theme === 'system') {
      store.setTheme('system'); // This will update isDark
    }
  };

  mediaQuery.addEventListener('change', handleThemeChange);
}

export default useUIStore;
