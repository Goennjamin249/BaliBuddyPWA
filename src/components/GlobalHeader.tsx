import { useRouter } from "expo-router";
import { Globe, Moon, Settings, Sun } from "lucide-react-native";
import React, { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
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
  const { theme, isDark, toggleTheme, language, setLanguage } = useUIStore();

  // Sync with system color scheme
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    // Update isDark when theme is 'system'
    if (theme === "system" && systemColorScheme) {
      // isDark is managed by store
    }
  }, [theme, systemColorScheme]);

  // Toggle language
  const toggleLanguage = () => {
    const newLang: "de" | "en" = language === "de" ? "en" : "de";
    setLanguage(newLang);
  };

  // Go back
  const handleBack = () => {
    router.back();
  };

  // Open settings
  const handleSettings = () => {
    // TODO: Open settings modal
    console.log("Open settings");
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={[styles.backButton, isDark && styles.backButtonDark]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={t("common.back", "Zurück")}
            >
              <Text
                style={[
                  styles.backButtonText,
                  isDark && styles.backButtonTextDark,
                ]}
              >
                ←
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {title && (
            <Text style={[styles.title, isDark && styles.titleDark]}>
              {title}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Language Switcher */}
          <TouchableOpacity
            style={[styles.iconButton, isDark && styles.iconButtonDark]}
            onPress={toggleLanguage}
            accessibilityRole="button"
            accessibilityLabel={t("common.switchLanguage", "Sprache wechseln")}
          >
            <Globe size={20} color={isDark ? "#FFFFFF" : "#0F172A"} />
            <Text style={[styles.langText, isDark && styles.langTextDark]}>
              {language.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            style={[styles.iconButton, isDark && styles.iconButtonDark]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={
              isDark
                ? t("common.lightMode", "Heller Modus")
                : t("common.darkMode", "Dunkler Modus")
            }
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
              style={[styles.iconButton, isDark && styles.iconButtonDark]}
              onPress={handleSettings}
              accessibilityRole="button"
              accessibilityLabel={t("common.settings", "Einstellungen")}
            >
              <Settings size={20} color={isDark ? "#FFFFFF" : "#0F172A"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
  },
  safeAreaDark: {
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerDark: {
    backgroundColor: "#1E293B",
    borderBottomColor: "#334155",
  },
  leftSection: {
    width: 60,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonDark: {
    backgroundColor: "#334155",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
  },
  backButtonTextDark: {
    color: "#FFFFFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  titleDark: {
    color: "#FFFFFF",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  iconButtonDark: {
    backgroundColor: "#334155",
  },
  langText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0F172A",
  },
  langTextDark: {
    color: "#FFFFFF",
  },
});

export default memo(GlobalHeader);
