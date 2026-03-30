import { useRouter } from "expo-router";
import {
  Calendar,
  Camera,
  Cloud,
  FileText,
  Package,
  Scale,
  Search,
  Sun,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalHeader from "../../components/GlobalHeader";

// Packing item interface
interface PackingItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
  packed: boolean;
}

// Calendar event interface
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "visa" | "holiday" | "custom";
  description: string;
}

// Law info interface
interface LawInfo {
  id: string;
  title: string;
  category: string;
  description: string;
  penalty?: string;
}

export default function SurvivalScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "packing" | "calendar" | "laws" | "tools"
  >("packing");
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize packing list based on weather
  useEffect(() => {
    const fetchWeatherAndInitPacking = async () => {
      try {
        // Fetch real weather data from Open-Meteo
        const weatherResponse = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-8.4095&longitude=115.1889&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Makassar&forecast_days=1",
        );
        const weatherData = await weatherResponse.json();

        let weatherCondition = "sunny";
        let temperature = 28;

        if (weatherData.daily) {
          const { weathercode, temperature_2m_max } = weatherData.daily;
          temperature = Math.round(temperature_2m_max[0] || 28);

          // Determine weather condition
          if (weathercode && [95, 96, 99].includes(weathercode[0])) {
            weatherCondition = "stormy";
          } else if (
            weathercode &&
            [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weathercode[0])
          ) {
            weatherCondition = "rainy";
          } else if (weathercode && [1, 2, 3].includes(weathercode[0])) {
            weatherCondition = "cloudy";
          }
        }

        setWeather({ temp: temperature, condition: weatherCondition });

        // Create weather-dependent packing list
        const baseItems: PackingItem[] = [
          {
            id: "1",
            name: t("survival.passport", "Reisepass"),
            category: t("survival.documents", "Dokumente"),
            essential: true,
            packed: false,
          },
          {
            id: "2",
            name: t("survival.visa", "Visum"),
            category: t("survival.documents", "Dokumente"),
            essential: true,
            packed: false,
          },
          {
            id: "3",
            name: t("survival.insurance", "Reiseversicherung"),
            category: t("survival.documents", "Dokumente"),
            essential: true,
            packed: false,
          },
          {
            id: "4",
            name: t("survival.sunscreen", "Sonnencreme"),
            category: t("survival.toiletries", "Körperpflege"),
            essential: true,
            packed: false,
          },
          {
            id: "5",
            name: t("survival.insectRepellent", "Mückenschutz"),
            category: t("survival.toiletries", "Körperpflege"),
            essential: true,
            packed: false,
          },
          {
            id: "6",
            name: t("survival.powerbank", "Powerbank"),
            category: t("survival.electronics", "Elektronik"),
            essential: true,
            packed: false,
          },
          {
            id: "7",
            name: t("survival.adapter", "Adapter"),
            category: t("survival.electronics", "Elektronik"),
            essential: true,
            packed: false,
          },
        ];

        // Add weather-specific items
        if (weatherCondition === "rainy" || weatherCondition === "stormy") {
          baseItems.push({
            id: "8",
            name: t("survival.rainJacket", "Regenjacke"),
            category: t("survival.clothing", "Kleidung"),
            essential: true,
            packed: false,
          });
          baseItems.push({
            id: "9",
            name: t("survival.umbrella", "Regenschirm"),
            category: t("survival.accessories", "Accessoires"),
            essential: false,
            packed: false,
          });
        }

        if (temperature > 30) {
          baseItems.push({
            id: "10",
            name: t("survival.hat", "Hut"),
            category: t("survival.accessories", "Accessoires"),
            essential: false,
            packed: false,
          });
          baseItems.push({
            id: "11",
            name: t("survival.sunglasses", "Sonnenbrille"),
            category: t("survival.accessories", "Accessoires"),
            essential: false,
            packed: false,
          });
        }

        setPackingItems(baseItems);
      } catch (error) {
        console.error("Error fetching weather:", error);
        // Fallback to default packing list
        const baseItems: PackingItem[] = [
          {
            id: "1",
            name: t("survival.passport", "Reisepass"),
            category: t("survival.documents", "Dokumente"),
            essential: true,
            packed: false,
          },
          {
            id: "2",
            name: t("survival.visa", "Visum"),
            category: t("survival.documents", "Dokumente"),
            essential: true,
            packed: false,
          },
          {
            id: "3",
            name: t("survival.insurance", "Reiseversicherung"),
            category: t("survival.documents", "Dokumente"),
            essential: true,
            packed: false,
          },
          {
            id: "4",
            name: t("survival.sunscreen", "Sonnencreme"),
            category: t("survival.toiletries", "Körperpflege"),
            essential: true,
            packed: false,
          },
          {
            id: "5",
            name: t("survival.insectRepellent", "Mückenschutz"),
            category: t("survival.toiletries", "Körperpflege"),
            essential: true,
            packed: false,
          },
          {
            id: "6",
            name: t("survival.powerbank", "Powerbank"),
            category: t("survival.electronics", "Elektronik"),
            essential: true,
            packed: false,
          },
          {
            id: "7",
            name: t("survival.adapter", "Adapter"),
            category: t("survival.electronics", "Elektronik"),
            essential: true,
            packed: false,
          },
        ];
        setPackingItems(baseItems);
        setWeather({ temp: 28, condition: "sunny" });
      }
    };

    fetchWeatherAndInitPacking();
  }, [t]);

  // Fetch calendar events
  useEffect(() => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        title: t("survival.visaExpiry", "Visum Ablauf"),
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: "visa",
        description: t("survival.visaExpiryDesc", "Visum läuft in 30 Tagen ab"),
      },
      {
        id: "2",
        title: t("survival.nyepi", "Nyepi - Tag der Stille"),
        date: new Date(2026, 2, 19),
        type: "holiday",
        description: t(
          "survival.nyepiDesc",
          "Hinduistischer Feiertag - Alles geschlossen",
        ),
      },
    ];
    setCalendarEvents(events);
  }, [t]);

  // Toggle packing item
  const togglePackingItem = (id: string) => {
    setPackingItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item,
      ),
    );
  };

  // Calculate packing progress
  const packedCount = packingItems.filter((item) => item.packed).length;
  const totalCount = packingItems.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  // Law categories
  const lawCategories = [
    { id: "traffic", title: t("survival.traffic", "Verkehr"), icon: "🚗" },
    { id: "drugs", title: t("survival.drugs", "Drogen"), icon: "⚠️" },
    { id: "alcohol", title: t("survival.alcohol", "Alkohol"), icon: "🍺" },
    { id: "dress", title: t("survival.dress", "Kleidung"), icon: "👔" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Global Header */}
      <GlobalHeader
        title={t("survival.title", "Survival Guide")}
        showBackButton={false}
        showSettings={true}
      />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "packing" && styles.tabActive]}
          onPress={() => setActiveTab("packing")}
        >
          <Package
            size={20}
            color={activeTab === "packing" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "packing" && styles.tabTextActive,
            ]}
          >
            {t("survival.packing", "Packliste")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "calendar" && styles.tabActive]}
          onPress={() => setActiveTab("calendar")}
        >
          <Calendar
            size={20}
            color={activeTab === "calendar" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "calendar" && styles.tabTextActive,
            ]}
          >
            {t("survival.calendar", "Kalender")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "laws" && styles.tabActive]}
          onPress={() => setActiveTab("laws")}
        >
          <Scale
            size={20}
            color={activeTab === "laws" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "laws" && styles.tabTextActive,
            ]}
          >
            {t("survival.laws", "Gesetze")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "tools" && styles.tabActive]}
          onPress={() => setActiveTab("tools")}
        >
          <Camera
            size={20}
            color={activeTab === "tools" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "tools" && styles.tabTextActive,
            ]}
          >
            {t("survival.tools", "Tools")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Packing List */}
        {activeTab === "packing" && (
          <View style={styles.section}>
            {/* Weather Info */}
            {weather && (
              <View style={styles.weatherCard}>
                {weather.condition === "sunny" ? (
                  <Sun size={24} color="#F59E0B" />
                ) : (
                  <Cloud size={24} color="#64748B" />
                )}
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Text style={styles.weatherCondition}>
                  {weather.condition === "sunny"
                    ? t("survival.sunny", "Sonnig")
                    : t("survival.cloudy", "Bewölkt")}
                </Text>
              </View>
            )}

            {/* Progress */}
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>
                {t("survival.packingProgress", "Fortschritt")}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {packedCount}/{totalCount} {t("survival.items", "Artikel")}
              </Text>
            </View>

            {/* Packing Items */}
            {packingItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.packingItem,
                  item.packed && styles.packingItemPacked,
                ]}
                onPress={() => togglePackingItem(item.id)}
              >
                <View style={styles.packingItemCheckbox}>
                  {item.packed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.packingItemInfo}>
                  <Text
                    style={[
                      styles.packingItemName,
                      item.packed && styles.packingItemNamePacked,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.packingItemCategory}>
                    {item.category}
                  </Text>
                </View>
                {item.essential && (
                  <View style={styles.essentialBadge}>
                    <Text style={styles.essentialText}>
                      {t("survival.essential", "Wichtig")}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Calendar */}
        {activeTab === "calendar" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("survival.upcomingEvents", "Anstehende Termine")}
            </Text>
            {calendarEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View
                    style={[
                      styles.eventTypeBadge,
                      {
                        backgroundColor:
                          event.type === "visa" ? "#EF4444" : "#F59E0B",
                      },
                    ]}
                  >
                    <Text style={styles.eventTypeText}>
                      {event.type === "visa" ? "📋" : "🎉"}
                    </Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {event.date.toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Laws */}
        {activeTab === "laws" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("survival.localLaws", "Lokale Gesetze")}
            </Text>
            {lawCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.lawCategoryCard}
              >
                <Text style={styles.lawCategoryIcon}>{category.icon}</Text>
                <Text style={styles.lawCategoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tools */}
        {activeTab === "tools" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("survival.usefulTools", "Nützliche Tools")}
            </Text>
            <View style={styles.toolsGrid}>
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => router.push("/scooter-check")}
              >
                <Camera size={32} color="#00B4D8" />
                <Text style={styles.toolTitle}>
                  {t("survival.scooterCheck", "Scooter Check")}
                </Text>
                <Text style={styles.toolDesc}>
                  {t("survival.scooterCheckDesc", "Foto vor der Fahrt")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => router.push("/ocr-scanner")}
              >
                <FileText size={32} color="#10B981" />
                <Text style={styles.toolTitle}>
                  {t("survival.ocrScanner", "OCR Scanner")}
                </Text>
                <Text style={styles.toolDesc}>
                  {t("survival.ocrScannerDesc", "Text erkennen")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => router.push("/dictionary")}
              >
                <Search size={32} color="#F59E0B" />
                <Text style={styles.toolTitle}>
                  {t("survival.dictionary", "Wörterbuch")}
                </Text>
                <Text style={styles.toolDesc}>
                  {t("survival.dictionaryDesc", "Übersetzung")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => router.push("/law-hub")}
              >
                <Scale size={32} color="#8B5CF6" />
                <Text style={styles.toolTitle}>
                  {t("survival.laws", "Gesetze")}
                </Text>
                <Text style={styles.toolDesc}>
                  {t("survival.lawDesc", "Rechtlicher Leitfaden")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF3C7",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  tabActive: {
    backgroundColor: "#FEF3C7",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#D97706",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  weatherCondition: {
    fontSize: 14,
    color: "#64748B",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
  },
  packingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  packingItemPacked: {
    backgroundColor: "#F0FDF4",
  },
  packingItemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkmark: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "700",
  },
  packingItemInfo: {
    flex: 1,
  },
  packingItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  packingItemNamePacked: {
    textDecorationLine: "line-through",
    color: "#64748B",
  },
  packingItemCategory: {
    fontSize: 12,
    color: "#64748B",
  },
  essentialBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  essentialText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTypeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventTypeText: {
    fontSize: 20,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 14,
    color: "#64748B",
  },
  eventDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  lawCategoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lawCategoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  lawCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  toolCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  toolDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
});
