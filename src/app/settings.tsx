import { useRouter } from "expo-router";
import { Globe, Moon, Sun } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUIStore } from "../stores/uiStore";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark, toggleTheme, language, setLanguage } = useUIStore();

  const toggleLanguage = () => {
    const newLang: "de" | "en" = language === "de" ? "en" : "de";
    setLanguage(newLang);
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            style={[styles.backButton, isDark && styles.backButtonDark]}
            onPress={() => router.back()}
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
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            {t("settings.title", "Einstellungen")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            {t("settings.appearance", "Erscheinungsbild")}
          </Text>

          <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View style={styles.settingInfo}>
              {isDark ? (
                <Moon size={20} color="#FFFFFF" />
              ) : (
                <Sun size={20} color="#0F172A" />
              )}
              <Text
                style={[styles.settingText, isDark && styles.settingTextDark]}
              >
                {isDark
                  ? t("settings.darkMode", "Dunkler Modus")
                  : t("settings.lightMode", "Heller Modus")}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#E2E8F0", true: "#334155" }}
              thumbColor={isDark ? "#00B4D8" : "#F59E0B"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            {t("settings.language", "Sprache")}
          </Text>

          <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View style={styles.settingInfo}>
              <Globe size={20} color={isDark ? "#FFFFFF" : "#0F172A"} />
              <Text
                style={[styles.settingText, isDark && styles.settingTextDark]}
              >
                {language === "de" ? "Deutsch" : "English"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.languageButton,
                isDark && styles.languageButtonDark,
              ]}
              onPress={toggleLanguage}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  isDark && styles.languageButtonTextDark,
                ]}
              >
                {language.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            {t("settings.app", "App")}
          </Text>

          <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <Text
              style={[styles.settingText, isDark && styles.settingTextDark]}
            >
              {t("settings.version", "Version")}
            </Text>
            <Text
              style={[styles.settingValue, isDark && styles.settingValueDark]}
            >
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeAreaDark: {
    backgroundColor: "#0F172A",
  },
  container: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerTitleDark: {
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    color: "#94A3B8",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  settingItemDark: {
    backgroundColor: "#1E293B",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
  },
  settingTextDark: {
    color: "#FFFFFF",
  },
  settingValue: {
    fontSize: 14,
    color: "#64748B",
  },
  settingValueDark: {
    color: "#94A3B8",
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  languageButtonDark: {
    backgroundColor: "#334155",
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  languageButtonTextDark: {
    color: "#FFFFFF",
  },
});
