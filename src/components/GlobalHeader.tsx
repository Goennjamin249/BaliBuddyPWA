import { useRouter } from "expo-router";
import { ArrowLeft, Globe, Moon, Settings, Sun } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUIStore } from "../stores/uiStore";

interface GlobalHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSettings?: boolean;
}

/**
 * Global Header Component
 * Provides Dark/Light Mode Toggle and Language Switcher
 */
function GlobalHeader({
  title,
  showBackButton = false,
  showSettings = true,
}: GlobalHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Connect to Zustand store
  const { isDark, toggleTheme, language, setLanguage } = useUIStore();

  // Toggle language with explicit type
  const toggleLanguage = useCallback((): void => {
    const newLang: "de" | "en" = language === "de" ? "en" : "de";
    setLanguage(newLang);
  }, [language, setLanguage]);

  // Navigate back with error handling
  const handleBack = useCallback((): void => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback: navigate to home if no history
        router.replace("/");
      }
    } catch (error) {
      console.error("Navigation error in handleBack:", error);
      // Fallback navigation
      router.replace("/");
    }
  }, [router]);

  // Navigate to settings
  const handleSettings = useCallback((): void => {
    router.push("/settings");
  }, [router]);

  // Toggle theme with accessibility announcement
  const handleToggleTheme = useCallback((): void => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
    >
      <View
        className={`flex-row items-center justify-between px-4 py-3 border-b ${
          isDark
            ? "bg-surface-dark border-border-dark"
            : "bg-surface border-border"
        }`}
      >
        {/* Left Section */}
        <View className="w-15 items-start">
          {showBackButton && (
            <TouchableOpacity
              className={`w-10 h-10 rounded-full justify-center items-center ${
                isDark ? "bg-surface-muted" : "bg-background-muted"
              }`}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={t("common.back", "Zurück")}
              accessibilityHint={t(
                "common.backHint",
                "Zurück zum vorherigen Bildschirm navigieren",
              )}
            >
              <ArrowLeft size={20} color={isDark ? "#FFFFFF" : "#0F172A"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section */}
        <View className="flex-1 items-center">
          {title && (
            <Text
              className={`text-lg font-bold max-w-full ${
                isDark ? "text-white" : "text-text-primary"
              }`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View className="flex-row items-center gap-2">
          {/* Language Switcher */}
          <TouchableOpacity
            className={`w-10 h-10 rounded-full justify-center items-center flex-row gap-1 ${
              isDark ? "bg-surface-muted" : "bg-background-muted"
            }`}
            onPress={toggleLanguage}
            accessibilityRole="button"
            accessibilityLabel={t("common.switchLanguage", "Sprache wechseln")}
            accessibilityHint={t(
              "common.switchLanguageHint",
              `Aktuelle Sprache: ${language.toUpperCase()}. Tippen zum Wechseln.`,
            )}
          >
            <Globe size={20} color={isDark ? "#FFFFFF" : "#0F172A"} />
            <Text
              className={`text-xs font-semibold ${
                isDark ? "text-white" : "text-text-primary"
              }`}
            >
              {language.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            className={`w-10 h-10 rounded-full justify-center items-center ${
              isDark ? "bg-surface-muted" : "bg-background-muted"
            }`}
            onPress={handleToggleTheme}
            accessibilityRole="button"
            accessibilityLabel={
              isDark
                ? t("common.lightMode", "Heller Modus")
                : t("common.darkMode", "Dunkler Modus")
            }
            accessibilityHint={t(
              "common.themeToggleHint",
              "Zwischen hellem und dunklem Modus wechseln",
            )}
          >
            {isDark ? (
              <Sun size={20} color="#F59E0B" />
            ) : (
              <Moon size={20} color="#0F172A" />
            )}
          </TouchableOpacity>

          {/* Settings Button */}
          {showSettings && (
            <TouchableOpacity
              className={`w-10 h-10 rounded-full justify-center items-center ${
                isDark ? "bg-surface-muted" : "bg-background-muted"
              }`}
              onPress={handleSettings}
              accessibilityRole="button"
              accessibilityLabel={t("common.settings", "Einstellungen")}
              accessibilityHint={t(
                "common.settingsHint",
                "App-Einstellungen öffnen",
              )}
            >
              <Settings size={20} color={isDark ? "#FFFFFF" : "#0F172A"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(GlobalHeader);
