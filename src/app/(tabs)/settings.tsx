import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Trash2,
  MoonStar,
  Sun,
  Globe,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../theme/ThemeContext";

// === V2 Design Tokens ===
const EMERALD_600 = "#059669";
const TEAL_700 = "#0F766E";
const BG = "#F2F2F7";
const WHITE = "#FFFFFF";
const GRAY_100 = "#F3F4F6";
const GRAY_200 = "#E5E7EB";
const GRAY_500 = "#6B7280";
const GRAY_600 = "#4B5563";
const GRAY_800 = "#1F2937";
const RED_500 = "#EF4444";
const BLUE_500 = "#3B82F6";
const BLUE_100 = "#DBEAFE";
const ORANGE_500 = "#F97316";
const ORANGE_100 = "#FFEDD5";
const GREEN_500 = "#10B981";
const GREEN_100 = "#D1FAE5";
const PURPLE_500 = "#8B5CF6";
const PURPLE_100 = "#EDE9FE";
const CYAN_500 = "#06B6D4";
const CYAN_100 = "#CFFAFE";

interface Stats {
  pois: number;
  groups: number;
  expenses: number;
  contacts: number;
  rates: number;
}

const LANGUAGES = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const [isOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("--:--");
  const [stats, setStats] = useState<Stats>({
    pois: 0,
    groups: 0,
    expenses: 0,
    contacts: 0,
    rates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLastSync(
      new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setStats({ pois: 156, groups: 12, expenses: 47, contacts: 23, rates: 5 });
    setLoading(false);
  }, []);

  const handleSync = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLastSync(
      new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setIsSyncing(false);
  };

  const handleClearData = () => {
    Alert.alert(
      t("settings.clear_data_title") || "Lokale Daten löschen",
      t("settings.clear_data_message") ||
        "Möchtest du wirklich alle lokalen Daten löschen?",
      [
        { text: t("common.cancel") || "Abbrechen", style: "cancel" },
        {
          text: t("common.delete") || "Löschen",
          style: "destructive",
          onPress: () => {
            setStats({
              pois: 0,
              groups: 0,
              expenses: 0,
              contacts: 0,
              rates: 0,
            });
          },
        },
      ],
    );
  };

  const handleLanguageChange = async (langCode: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await i18n.changeLanguage(langCode);
  };

  return (
    <View style={styles.root}>
      {/* V2 Gradient Header */}
      <LinearGradient colors={[EMERALD_600, TEAL_700]} style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>{t("settings.title")}</Text>
          <Text style={styles.headerSub}>Sync, Daten & App-Konfiguration</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {loading ? (
          <ActivityIndicator
            color={EMERALD_600}
            size="large"
            style={{ marginVertical: 40 }}
          />
        ) : (
          <>
            {/* Language Section */}
            <View style={styles.languageCard}>
              <View style={styles.languageHeader}>
                <Globe size={20} color={GRAY_600} />
                <Text style={styles.sectionTitle}>
                  {t("settings.language")}
                </Text>
              </View>
              <View style={styles.languageGrid}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageBtn,
                      i18n.language === lang.code && styles.languageBtnActive,
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageLabel,
                        i18n.language === lang.code &&
                          styles.languageLabelActive,
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sync-Status Card */}
            <View style={styles.syncCard}>
              <Text style={styles.sectionTitle}>Sync Status</Text>
              <View style={styles.syncRow}>
                <Text style={styles.syncLabel}>{t("settings.connection")}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: isOnline ? GREEN_100 : RED_500 },
                  ]}
                >
                  {isOnline ? (
                    <Wifi size={14} color={GREEN_500} />
                  ) : (
                    <WifiOff size={14} color="#FFF" />
                  )}
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isOnline ? GREEN_500 : "#FFF" },
                    ]}
                  >
                    {isOnline ? t("settings.online") : t("settings.offline")}
                  </Text>
                </View>
              </View>
              <View style={styles.syncRow}>
                <Text style={styles.syncLabel}>{t("settings.lastSync")}</Text>
                <Text style={styles.syncValue}>{lastSync}</Text>
              </View>
              <TouchableOpacity
                style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
                onPress={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <RefreshCw size={18} color="#FFF" />
                    <Text style={styles.syncBtnText}>{t("settings.sync")}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Daten-Übersicht Grid */}
            <View style={styles.gridCard}>
              <View style={styles.gridHeader}>
                <Database size={18} color={GRAY_600} />
                <Text style={styles.sectionTitle}>{t("settings.stats")}</Text>
              </View>
              <View style={styles.grid}>
                <View style={[styles.gridItem, { backgroundColor: BLUE_100 }]}>
                  <Text style={[styles.gridNum, { color: BLUE_500 }]}>
                    {stats.pois}
                  </Text>
                  <Text style={styles.gridLabel}>POIs</Text>
                </View>
                <View style={[styles.gridItem, { backgroundColor: GREEN_100 }]}>
                  <Text style={[styles.gridNum, { color: GREEN_500 }]}>
                    {stats.groups}
                  </Text>
                  <Text style={styles.gridLabel}>{t("settings.groups")}</Text>
                </View>
                <View
                  style={[styles.gridItem, { backgroundColor: ORANGE_100 }]}
                >
                  <Text style={[styles.gridNum, { color: ORANGE_500 }]}>
                    {stats.expenses}
                  </Text>
                  <Text style={styles.gridLabel}>{t("wallet.expenses")}</Text>
                </View>
                <View
                  style={[styles.gridItem, { backgroundColor: PURPLE_100 }]}
                >
                  <Text style={[styles.gridNum, { color: PURPLE_500 }]}>
                    {stats.contacts}
                  </Text>
                  <Text style={styles.gridLabel}>{t("settings.contacts")}</Text>
                </View>
                <View style={[styles.gridItem, { backgroundColor: CYAN_100 }]}>
                  <Text style={[styles.gridNum, { color: CYAN_500 }]}>
                    {stats.rates}
                  </Text>
                  <Text style={styles.gridLabel}>{t("settings.rates")}</Text>
                </View>
              </View>
            </View>

            {/* App-Einstellungen */}
            <View style={styles.menuCard}>
              <Text style={styles.sectionTitle}>
                {t("settings.appSettings")}
              </Text>

              <View style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  {themeMode === "dark" ? (
                    <MoonStar size={20} color={colors.textMuted} />
                  ) : (
                    <Sun size={20} color={colors.textMuted} />
                  )}
                  <Text style={[styles.menuText, { color: colors.text }]}>
                    {t("settings.darkMode")}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={(v) => setThemeMode(v ? "dark" : "light")}
                  trackColor={{ false: GRAY_200, true: EMERALD_600 }}
                  thumbColor="#FFF"
                />
              </View>

              <TouchableOpacity
                style={styles.dangerItem}
                onPress={handleClearData}
              >
                <View style={styles.menuLeft}>
                  <Trash2 size={20} color={RED_500} />
                  <Text style={[styles.menuText, { color: RED_500 }]}>
                    {t("settings.clearData")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: GRAY_800 },
  // Language Card
  languageCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  languageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  languageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GRAY_100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: "47%",
  },
  languageBtnActive: { backgroundColor: EMERALD_600 },
  languageFlag: { fontSize: 20 },
  languageLabel: { fontSize: 14, fontWeight: "600", color: GRAY_600 },
  languageLabelActive: { color: "#FFF" },
  // Sync Card
  syncCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  syncRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  syncLabel: { fontSize: 15, color: GRAY_600 },
  syncValue: { fontSize: 15, fontWeight: "600", color: GRAY_800 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: "700" },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: GREEN_500,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  syncBtnDisabled: { opacity: 0.6 },
  syncBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  // Grid
  gridCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  gridHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    width: "29%",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  gridNum: { fontSize: 22, fontWeight: "800" },
  gridLabel: {
    fontSize: 11,
    color: GRAY_500,
    marginTop: 3,
    textAlign: "center",
  },
  // Menu
  menuCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  dangerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuText: { fontSize: 16, color: GRAY_800 },
});
