/**
 * Settings Modal Component
 * AMOLED Black Design with Mode Toggle and Favorites
 */

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  X,
  Sun,
  Moon,
  MapPin,
  Trash2,
  Navigation,
  RefreshCw,
  CheckCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import {
  getFavorites,
  removeFromFavorites,
  saveRate,
  type CachedPOI,
} from "../utils/storage";
import { fetchWeather } from "../services/weather";
import { fetchExchangeRate } from "../services/currency";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onFlyToFavorite?: (lat: number, lon: number) => void;
}

export default function SettingsModal({
  visible,
  onClose,
  onFlyToFavorite,
}: SettingsModalProps) {
  const { colors, themeMode, setThemeMode } = useTheme();
  const [favorites, setFavorites] = useState<CachedPOI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Load favorites when modal opens
  useEffect(() => {
    if (visible) {
      loadFavorites();
    }
  }, [visible]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error("[Settings] Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (poiId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await removeFromFavorites(poiId);
      setFavorites((prev) => prev.filter((f) => f.id !== poiId));
    } catch (error) {
      console.error("[Settings] Failed to remove favorite:", error);
    }
  };

  const handleFlyToFavorite = (lat: number, lon: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFlyToFavorite?.(lat, lon);
    onClose();
  };

  const toggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  // Sync all live data
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus("idle");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Sync weather via serverless function
      await fetchWeather(false);

      // Sync exchange rate via centralized service
      const rate = await fetchExchangeRate();
      await saveRate({ eur: 1, idr: rate, timestamp: Date.now() });

      setSyncStatus("success");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("[Settings] Sync failed:", error);
      setSyncStatus("error");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSyncing(false);
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor:
                themeMode === "dark"
                  ? "rgba(0, 0, 0, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              ⚙️ Einstellungen
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Sync Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🔄 Daten synchronisieren
              </Text>
              <TouchableOpacity
                style={[
                  styles.syncButton,
                  {
                    backgroundColor:
                      syncStatus === "success"
                        ? "rgba(16, 185, 129, 0.2)"
                        : syncStatus === "error"
                          ? "rgba(239, 68, 68, 0.2)"
                          : "rgba(255, 255, 255, 0.1)",
                    borderColor:
                      syncStatus === "success"
                        ? "#10B981"
                        : syncStatus === "error"
                          ? "#EF4444"
                          : colors.border,
                  },
                ]}
                onPress={handleSync}
                disabled={isSyncing}
                activeOpacity={0.7}
              >
                {isSyncing ? (
                  <RefreshCw
                    size={20}
                    color={colors.text}
                    style={{ transform: [{ rotate: "45deg" }] }}
                  />
                ) : syncStatus === "success" ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : syncStatus === "error" ? (
                  <X size={20} color="#EF4444" />
                ) : (
                  <RefreshCw size={20} color={colors.text} />
                )}
                <Text
                  style={[
                    styles.syncButtonText,
                    {
                      color:
                        syncStatus === "success"
                          ? "#10B981"
                          : syncStatus === "error"
                            ? "#EF4444"
                            : colors.text,
                    },
                  ]}
                >
                  {isSyncing
                    ? "Synchronisiere..."
                    : syncStatus === "success"
                      ? "Erfolgreich!"
                      : syncStatus === "error"
                        ? "Fehler aufgetreten"
                        : "Jetzt synchronisieren"}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.syncHint, { color: colors.textMuted }]}>
                Aktualisiert Wetterdaten und Wechselkurse
              </Text>
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🎨 Darstellung
              </Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  {themeMode === "dark" ? (
                    <Moon size={20} color={colors.text} />
                  ) : (
                    <Sun size={20} color={colors.text} />
                  )}
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {themeMode === "dark" ? "Dunkelmodus" : "Hellmodus"}
                  </Text>
                </View>
                <Switch
                  value={themeMode === "dark"}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#E2E8F0", true: "#000000" }}
                  thumbColor={themeMode === "dark" ? "#FFFFFF" : "#F1F5F9"}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            </View>

            {/* Favorites Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                ❤️ Deine Favoriten
              </Text>

              {isLoading ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Lade Favoriten...
                </Text>
              ) : favorites.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Noch keine Favoriten gespeichert
                </Text>
              ) : (
                favorites.map((fav) => (
                  <View
                    key={fav.id}
                    style={[
                      styles.favoriteItem,
                      {
                        backgroundColor:
                          themeMode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.03)",
                      },
                    ]}
                  >
                    <View style={styles.favoriteInfo}>
                      <MapPin size={16} color={colors.primary} />
                      <View style={styles.favoriteDetails}>
                        <Text
                          style={[styles.favoriteName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {fav.name}
                        </Text>
                        <Text
                          style={[
                            styles.favoriteType,
                            { color: colors.textMuted },
                          ]}
                        >
                          {fav.type}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.favoriteActions}>
                      <TouchableOpacity
                        onPress={() =>
                          handleFlyToFavorite(fav.latitude, fav.longitude)
                        }
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Navigation size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveFavorite(fav.id)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  favoriteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  favoriteInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  favoriteDetails: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: "600",
  },
  favoriteType: {
    fontSize: 12,
    marginTop: 2,
  },
  favoriteActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  syncButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  syncHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});
