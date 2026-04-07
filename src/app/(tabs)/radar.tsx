import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Banknote,
  Beer,
  List,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Navigation,
  Utensils,
  X,
  Home,
  Shield,
  HeartPulse,
  Droplets,
  Star,
  Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { haversineDistance, formatDistance } from "../../lib/haversine";
import db from "../../db/index";
import { seedInitialPOIs } from "../../db/seeds";
import StandardChip from "../../components/ui/StandardChip";
import LeafletMap, {
  type LeafletPOI,
} from "../../components/LeafletMap";
import { useTheme } from "../../theme/ThemeContext";

// === V2 Design Tokens ===
const V2 = {
  colors: {
    primary: "#059669",
    secondary: "#0F766E",
    danger: "#e11d48",
    bg: "#F2F2F7",
    surface: "#FFFFFF",
    textMain: "#1F2937",
    textMuted: "#6B7280",
  },
  radii: { card: 24, sheet: 32, chip: 20 },
  shadow: Platform.select({
    web: {
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.80)",
    backdropFilter: "blur(20px)",
  },
  glassStrong: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(24px)",
  },
};

const EMERALD_600 = V2.colors.primary;
const TEAL_700 = V2.colors.secondary;
const BG = V2.colors.bg;
const WHITE = V2.colors.surface;
const GRAY_400 = "#9CA3AF";
const GRAY_500 = V2.colors.textMuted;
const GRAY_800 = V2.colors.textMain;
const DEFAULT_USER_LOCATION = { lat: -8.5069, lng: 115.2625 };

type Category =
  | "atm"
  | "warung"
  | "klinik"
  | "police"
  | "fuel"
  | "bar"
  | "hotel"
  | "restaurant"
  | "accommodation";

interface POI {
  id: string;
  name: string;
  category: Category;
  description: string;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
  tags: string[];
  distance?: number;
  verified?: boolean;
}

const CAT_STYLE: Record<
  Category,
  { bg: string; color: string; label: string; Icon: any; emoji: string }
> = {
  atm: {
    bg: "#DBEAFE",
    color: "#2563EB",
    label: "ATM",
    Icon: Banknote,
    emoji: "💳",
  },
  warung: {
    bg: "#FFEDD5",
    color: "#EA580C",
    label: "Waschsalon",
    Icon: Utensils,
    emoji: "🧺",
  },
  klinik: {
    bg: "#FEE2E2",
    color: "#DC2626",
    label: "Klinik",
    Icon: HeartPulse,
    emoji: "🏥",
  },
  police: {
    bg: "#E0E7FF",
    color: "#4F46E5",
    label: "Polizei",
    Icon: Shield,
    emoji: "👮",
  },
  fuel: {
    bg: "#FEF3C7",
    color: "#D97706",
    label: "Wasser",
    Icon: Droplets,
    emoji: "💧",
  },
  bar: {
    bg: "#FCE7F3",
    color: "#BE185D",
    label: "Safe Bar",
    Icon: Beer,
    emoji: "🍺",
  },
  hotel: {
    bg: "#E0F2FE",
    color: "#0284C7",
    label: "Hotel",
    Icon: MapPin,
    emoji: "🏨",
  },
  accommodation: {
    bg: "#F3E8FF",
    color: "#7E22CE",
    label: "Villa",
    Icon: Home,
    emoji: "🏡",
  },
  restaurant: {
    bg: "#FFEDD5",
    color: "#EA580C",
    label: "Rest.",
    Icon: Utensils,
    emoji: "🍽️",
  },
};

export default function RadarScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // States
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [pois, setPois] = useState<POI[]>([]);
  const [userLocation, setUserLocation] = useState(DEFAULT_USER_LOCATION);
  const [locationAccuracy, setLocationAccuracy] = useState<number>(65);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    DEFAULT_USER_LOCATION.lat,
    DEFAULT_USER_LOCATION.lng,
  ]);

  // 2. Datenbank-Lader (WatermelonDB)
  const loadData = useCallback(
    async (currentLoc: { lat: number; lng: number }) => {
      setLoading(true);
      try {
        // Seed POIs if database is empty
        await seedInitialPOIs();

        const dbPois: POI[] = [];

        const fetchFromTable = async (
          tableName: string,
          category: Category,
        ) => {
          try {
            const collection = db.collections.get(tableName);
            const results = await collection.query().fetch();
            results.forEach((record: any) => {
              // const raw = record._raw;
              dbPois.push({
                id: record.id,
                name: record.name || record.bank_name || record.title || "Ort",
                category: category,
                description: record.address || record.desc || record.notes || "",
                lat: parseFloat(record.latitude || record.lat || 0),
                lng: parseFloat(record.longitude || record.lng || 0),
                rating: record.rating ? parseFloat(record.rating) : 4.0,
                phone: record.phone || "",
                tags: record.tags ? String(record.tags).split(",") : [],
                verified: record.is_verified === 1 || record.verified === true,
              });
            });
          } catch {

          }
        };

        await Promise.all([
          fetchFromTable("atms", "atm"),
          fetchFromTable("clinics", "klinik"),
          fetchFromTable("safe_bars", "bar"),
          fetchFromTable("laundries", "warung"),
          fetchFromTable("water_stations", "fuel"),
        ]);

        const enriched = dbPois
          .map((p) => ({
            ...p,
            distance: haversineDistance(
              currentLoc.lat,
              currentLoc.lng,
              p.lat,
              p.lng,
            ),
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setPois(enriched);
      } catch (error) {
        console.error("Radar Global Load Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 1. Initialisierung: Low Power GPS Modus
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const netSub = NetInfo.addEventListener((state) => {
      if (isMounted) setIsOnline(state.isConnected ?? true);
    });

    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) return;
      
      if (status === "granted") {
        try {
          // Erst einmal genaue Position holen
          const initialLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!isMounted) return;

          const newLoc = {
            lat: initialLoc.coords.latitude,
            lng: initialLoc.coords.longitude,
          };

          setUserLocation(newLoc);
          setLocationAccuracy(initialLoc.coords.accuracy ?? 65);
          setMapCenter([newLoc.lat, newLoc.lng]);
          loadData(newLoc);

          // Low Power Modus: 15 Sekunden Interval, 10m Mindestabstand
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 15000,
              distanceInterval: 10,
            },
            (loc) => {
              if (isMounted) {
                setUserLocation({
                  lat: loc.coords.latitude,
                  lng: loc.coords.longitude,
                });
                setLocationAccuracy(loc.coords.accuracy ?? 65);
              }
            },
          );
        } catch {
          if (isMounted) loadData(DEFAULT_USER_LOCATION);
        }
      } else {
        if (isMounted) loadData(DEFAULT_USER_LOCATION);
      }
    })();

    return () => {
      isMounted = false;
      abortController.abort();
      netSub();
      locationSubscription?.remove();
    };
  }, [loadData]);

  const filteredPOIs = useMemo(() => {
    return activeFilter === "all"
      ? pois
      : pois.filter((p) => p.category === activeFilter);
  }, [pois, activeFilter]);

  const handleTabChange = useCallback((mode: "list" | "map") => {
    setViewMode(mode);
  }, []);

  const handleFilterChange = useCallback((filter: Category | "all") => {
    setActiveFilter(filter);
  }, []);

  const focusOnPOI = useCallback((poi: POI) => {
    setSelectedPOI(poi);
    setMapCenter([poi.lat, poi.lng]);
  }, []);

  const handleWhatsApp = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, "").replace(/^\+/, "");
    const url = `whatsapp://send?phone=${cleaned}`;
    Linking.openURL(url).catch(() => {
      // Fallback für Web
      if (Platform.OS === "web") {
        window.open(`https://wa.me/${cleaned}`, "_blank");
      }
    });
  }, []);

  const handleMapsRoute = useCallback(
    (lat: number, lng: number, name: string) => {
      // Google Maps für alle Plattformen (iOS, Android, Web)
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        Linking.openURL(url).catch(() => {
          // Fallback: Versuche Google Maps App
          Linking.openURL(
            `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
          );
        });
      }
    },
    [],
  );

  const handlePhoneCall = useCallback((phone: string) => {
    const cleaned = phone.replace(/[\s\-()]/g, "");
    Linking.openURL(`tel:${cleaned}`);
  }, []);

  // Konvertiere POIs für LeafletMap
  const leafletPOIs: LeafletPOI[] = useMemo(
    () =>
      filteredPOIs.map((p) => ({
        ...p,
        emoji: CAT_STYLE[p.category]?.emoji || "📍",
      })),
    [filteredPOIs],
  );

  // POI Klick Handler für LeafletMap
  const handlePOIClick = useCallback(
    (poi: LeafletPOI) => {
      setSelectedPOI(poi as POI);
      setMapCenter([poi.lat, poi.lng]);
    },
    [],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#1A1A2E" : BG }}
      edges={["top"]}
    >
      <View style={{ flex: 1 }}>
        {/* Header - V2 Premium Gradient */}
        <LinearGradient
          colors={[EMERALD_600, TEAL_700]}
          style={{
            padding: 22,
            paddingBottom: 26,
            borderBottomLeftRadius: V2.radii.sheet,
            borderBottomRightRadius: V2.radii.sheet,
            ...V2.shadow,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "900",
                  color: WHITE,
                  letterSpacing: -0.5,
                }}
              >
                {t("radar.title") || "Smart Radar"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: WHITE,
                  opacity: 0.9,
                  marginTop: 4,
                  fontWeight: "600",
                }}
              >
                {isOnline
                  ? t("radar.online") || "Live"
                  : t("radar.offline") || "Offline-Modus"}{" "}
                • {filteredPOIs.length}{" "}
                {t("radar.places_active") || "Orte aktiv"}
              </Text>
            </View>
            {/* V2 Glass Toggle Buttons - Touch-Targets ≥ 44px */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: 14,
                padding: 3,
              }}
            >
              <TouchableOpacity
                onPress={() => handleTabChange("list")}
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 12,
                  backgroundColor: viewMode === "list" ? WHITE : "transparent",
                  ...V2.shadow,
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <List
                  size={20}
                  color={viewMode === "list" ? EMERALD_600 : WHITE}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabChange("map")}
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 12,
                  backgroundColor: viewMode === "map" ? WHITE : "transparent",
                  ...V2.shadow,
                }}
                hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
                activeOpacity={0.7}
              >
                <MapIcon
                  size={20}
                  color={viewMode === "map" ? EMERALD_600 : WHITE}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View className="py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            bounces={false}
          >
            <StandardChip
              label={t("radar.all") || "Alle"}
              active={activeFilter === "all"}
              onPress={() => handleFilterChange("all")}
            />
            {(Object.keys(CAT_STYLE) as Category[]).map((cat) => (
              <StandardChip
                key={cat}
                label={CAT_STYLE[cat].label}
                emoji={CAT_STYLE[cat].emoji}
                active={activeFilter === cat}
                onPress={() => handleFilterChange(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Content Render */}
        <View style={{ flex: 1 }}>
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator color={EMERALD_600} size="large" />
              <Text style={{ marginTop: 10, color: GRAY_500 }}>
                {t("radar.loading") || "Lade Kartendaten..."}
              </Text>
            </View>
          ) : viewMode === "map" ? (
            <View style={{ flex: 1 }}>
              {Platform.OS === "web" ? (
                <LeafletMap
                  center={mapCenter}
                  zoom={15}
                  userLocation={userLocation}
                  locationAccuracy={locationAccuracy}
                  pois={leafletPOIs}
                  onPOIClick={handlePOIClick}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#E0F2FE",
                  }}
                >
                  <MapIcon size={48} color={EMERALD_600} />
                  <Text
                    style={{
                      marginTop: 12,
                      fontSize: 16,
                      fontWeight: "700",
                      color: GRAY_800,
                    }}
                  >
                    Kartenansicht
                  </Text>
                </View>
              )}

              {/* Slider - V2 Bento Glass Cards mit Snap */}
              <View
                style={{ position: "absolute", bottom: 25, left: 0, right: 0 }}
              >
                <FlatList
                  horizontal
                  data={filteredPOIs}
                  keyExtractor={(item) => `slider-${item.id}`}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={280}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  bounces={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        marginHorizontal: 6,
                        padding: 14,
                        borderRadius: V2.radii.card,
                        width: 270,
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        ...V2.shadow,
                        alignItems: "center",
                      }}
                      onPress={() => focusOnPOI(item)}
                      activeOpacity={0.7}
                      // Touch-Target ≥ 44px
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: CAT_STYLE[item.category]?.bg,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {CAT_STYLE[item.category]?.emoji}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={{
                            fontWeight: "800",
                            fontSize: 15,
                            color: GRAY_800,
                          }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: EMERALD_600,
                            fontSize: 13,
                            fontWeight: "900",
                            marginTop: 2,
                          }}
                        >
                          {formatDistance(item.distance || 0)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          ) : (
            <FlatList
              data={filteredPOIs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              bounces={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.80)",
                    borderRadius: V2.radii.card,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    ...V2.shadow,
                  }}
                  onPress={() => focusOnPOI(item)}
                  activeOpacity={0.7}
                  // Touch-Target ≥ 44px
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      padding: 18,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: CAT_STYLE[item.category]?.bg,
                      }}
                    >
                      {React.createElement(
                        CAT_STYLE[item.category]?.Icon || MapPin,
                        { size: 22, color: CAT_STYLE[item.category]?.color },
                      )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: GRAY_800,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{ fontSize: 13, color: GRAY_500, marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "900",
                          color: EMERALD_600,
                        }}
                      >
                        {formatDistance(item.distance || 0)}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 3,
                          marginTop: 4,
                        }}
                      >
                        <Star size={10} color="#F59E0B" fill="#F59E0B" />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: GRAY_800,
                          }}
                        >
                          {item.rating}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* POI Sheet */}
        {selectedPOI && (
          <View
            style={
               {
                 position: "absolute",
                 bottom: 0,
                 left: 0,
                 right: 0,
                 zIndex: 1000,
                  paddingBottom: 150,
                 borderTopLeftRadius: V2.radii.sheet,
                 borderTopRightRadius: V2.radii.sheet,
                 padding: 28,
                 backgroundColor:
                  Platform.OS === "web" ? "rgba(255,255,255,0.85)" : "#FFFFFF",
                ...(Platform.OS === "web"
                  ? {
                      borderTop: "1px solid rgba(255,255,255,0.6)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: "0 -8px 24px rgba(0,0,0,0.08)",
                    }
                  : {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: -4 },
                      shadowOpacity: 0.12,
                      shadowRadius: 12,
                      elevation: 16,
                    }),
              } as any
            }
          >
            {/* Sheet Handle */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "rgba(0,0,0,0.15)",
                borderRadius: 2,
                marginTop: 0,
                marginBottom: 16,
                marginHorizontal: "auto",
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: GRAY_800,
                  flex: 1,
                }}
              >
                {selectedPOI.name}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedPOI(null)}
                style={{ padding: 4 }}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Category Badge */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <View
                style={{
                  backgroundColor: CAT_STYLE[selectedPOI.category]?.bg,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700" }}>
                  {CAT_STYLE[selectedPOI.category]?.emoji}{" "}
                  {CAT_STYLE[selectedPOI.category]?.label}
                </Text>
              </View>
              {selectedPOI.verified && (
                <View
                  style={{
                    backgroundColor: "#D1FAE5",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: EMERALD_600,
                    }}
                  >
                    ✓ Verifiziert
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text
              style={{
                fontSize: 16,
                color: GRAY_400,
                lineHeight: 22,
                fontWeight: "500",
                marginBottom: 15,
              }}
            >
              {selectedPOI.description}
            </Text>

            {/* Distance */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <MapPin size={16} color={EMERALD_600} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: EMERALD_600,
                }}
              >
                {formatDistance(selectedPOI.distance || 0)}
              </Text>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: EMERALD_600,
                  padding: 18,
                  borderRadius: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  ...V2.shadow,
                }}
                onPress={() =>
                  handleMapsRoute(
                    selectedPOI.lat,
                    selectedPOI.lng,
                    selectedPOI.name,
                  )
                }
              >
                <Navigation size={20} color="white" />
                <Text style={{ color: WHITE, fontWeight: "800", fontSize: 16 }}>
                  {t("radar.start_route") || "Route starten"}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {selectedPOI.phone ? (
                  <TouchableOpacity
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      backgroundColor: "#F0FDF4",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#DCFCE7",
                    }}
                    onPress={() => handleWhatsApp(selectedPOI.phone)}
                  >
                    <MessageCircle size={22} color={EMERALD_600} />
                  </TouchableOpacity>
                ) : null}
                {selectedPOI.phone ? (
                  <TouchableOpacity
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      backgroundColor: "#F0FDF4",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#DCFCE7",
                    }}
                    onPress={() => handlePhoneCall(selectedPOI.phone)}
                  >
                    <Phone size={20} color={EMERALD_600} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
