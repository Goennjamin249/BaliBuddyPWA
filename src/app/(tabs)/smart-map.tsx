import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlertTriangle,
  Banknote,
  Beer,
  List,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
  Utensils,
  X,
  Home,
  Shield,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";

// Lokale Utilities (V2 Standard)
import { openPhone, openWhatsApp, openRoute } from "../../lib/deeplinks";
import { haversineDistance, formatDistance } from "../../lib/haversine";
import db from "../../db/index"; // Dein SQLite/Dexie Pfad

// === V2 Design Tokens ===
const EMERALD_600 = "#059669";
const TEAL_700 = "#0F766E";
const BG = "#F2F2F7";
const WHITE = "#FFFFFF";

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
    label: "Warung",
    Icon: Utensils,
    emoji: "🍜",
  },
  klinik: {
    bg: "#FEE2E2",
    color: "#DC2626",
    label: "Klinik",
    Icon: AlertTriangle,
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
    label: "Benzin",
    Icon: MapPin,
    emoji: "⛽",
  },
  bar: {
    bg: "#FCE7F3",
    color: "#BE185D",
    label: "Bar",
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

export default function SmartMapScreen() {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [pois, setPois] = useState<POI[]>([]);
  const [userLocation, setUserLocation] = useState({
    lat: -8.5069,
    lng: 115.2625,
  }); // Default Ubud
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  // 1. Online Status & Location Fetching
  useEffect(() => {
    const sub = NetInfo.addEventListener((state) =>
      setIsOnline(state.isConnected ?? true),
    );
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      }
      loadData();
    })();
    return () => sub();
  }, []);

  // MOCK POIs als Fallback wenn DB leer
  const MOCK_POIS: POI[] = [
    { id: "m1", name: "BCA ATM Ubud", category: "atm", description: "BNI ATM", lat: -8.5069, lng: 115.2625, rating: 4.5, phone: "+6281234567890", tags: ["visa", "24h"] },
    { id: "m2", name: "Warung Babi Guling", category: "warung", description: "Babi Guling", lat: -8.5075, lng: 115.2630, rating: 4.8, phone: "+6281234567891", tags: ["lokal"] },
    { id: "m3", name: "Bali Clinic", category: "klinik", description: "Klinik", lat: -8.5055, lng: 115.2640, rating: 4.2, phone: "+6281234567892", tags: ["24h"] },
    { id: "m4", name: "No Mums Bar", category: "bar", description: "Cocktails", lat: -8.5090, lng: 115.2620, rating: 4.6, phone: "+6281234567893", tags: ["party"] },
    { id: "m5", name: "Ubud Hotel", category: "hotel", description: "Hotel", lat: -8.5100, lng: 115.2650, rating: 4.3, phone: "+6281234567894", tags: ["pool"] },
    { id: "m6", name: "Polizeistation", category: "police", description: "Polizei", lat: -8.5080, lng: 115.2610, rating: 4.0, phone: "+6281234567895", tags: [] },
    { id: "m7", name: "Tankstelle", category: "fuel", description: "Pertamax", lat: -8.5060, lng: 115.2640, rating: 4.1, phone: "", tags: [] },
    { id: "m8", name: "Villa Seminyak", category: "accommodation", description: "Private Villa", lat: -8.5110, lng: 115.2660, rating: 4.7, phone: "+6281234567896", tags: ["pool"] },
    { id: "m9", name: "Restaurant Merah Putih", category: "restaurant", description: "Fine Dining", lat: -8.5040, lng: 115.2600, rating: 4.9, phone: "+6281234567897", tags: ["fine"] },
  ];

  // 2. Daten aus SQLite laden & Distanzen berechnen
  const loadData = async () => {
    setLoading(true);
    try {
      // Lade Daten aus den einzelnen Tabellen
      const dbPois: POI[] = [];
      
      try {
        // ATMs
        const atms = await db.collections.get('atms').query().fetch();
        atms.forEach((p: any) => dbPois.push({
          id: p.id,
          name: p.bankName || p._raw?.bank_name || 'ATM',
          category: 'atm',
          description: p.address || p._raw?.address || '',
          lat: p.latitude || p._raw?.latitude || 0,
          lng: p.longitude || p._raw?.longitude || 0,
          rating: p.rating || p._raw?.rating || 0,
          phone: '',
          tags: p.operatingHours ? [p.operatingHours] : [],
        }));

        // Clinics
        const clinics = await db.collections.get('clinics').query().fetch();
        clinics.forEach((p: any) => dbPois.push({
          id: p.id,
          name: p.name || p._raw?.name || 'Klinik',
          category: 'klinik',
          description: p.address || p._raw?.address || '',
          lat: p.latitude || p._raw?.latitude || 0,
          lng: p.longitude || p._raw?.longitude || 0,
          rating: 4.0,
          phone: p.phone || p._raw?.phone || '',
          tags: [p.emergency24h ? '24h' : ''],
        }));

        // Safe Bars
        const bars = await db.collections.get('safe_bars').query().fetch();
        bars.forEach((p: any) => dbPois.push({
          id: p.id,
          name: p.name || p._raw?.name || 'Bar',
          category: 'bar',
          description: p.address || p._raw?.address || '',
          lat: p.latitude || p._raw?.latitude || 0,
          lng: p.longitude || p._raw?.longitude || 0,
          rating: p.rating || p._raw?.rating || 0,
          phone: '',
          tags: p.isVerified ? ['verified'] : [],
        }));

        // Laundries
        const laundries = await db.collections.get('laundries').query().fetch();
        laundries.forEach((p: any) => dbPois.push({
          id: p.id,
          name: p.name || p._raw?.name || 'Waschsalon',
          category: 'warung',
          description: p.address || p._raw?.address || '',
          lat: p.latitude || p._raw?.latitude || 0,
          lng: p.longitude || p._raw?.longitude || 0,
          rating: p.rating || p._raw?.rating || 0,
          phone: '',
          tags: [],
        }));

        // Water Stations
        const water = await db.collections.get('water_stations').query().fetch();
        water.forEach((p: any) => dbPois.push({
          id: p.id,
          name: p.name || p._raw?.name || 'Wasserstation',
          category: 'fuel',
          description: p.address || p._raw?.address || '',
          lat: p.latitude || p._raw?.latitude || 0,
          lng: p.longitude || p._raw?.longitude || 0,
          rating: p.rating || p._raw?.rating || 0,
          phone: '',
          tags: [p.waterType || ''],
        }));

      } catch (_dbError) {
        // Falls Tabellen noch nicht existieren
      }

      // Fallback auf MOCK_POIS wenn DB leer
      const poisToUse = dbPois.length > 0 ? dbPois : MOCK_POIS;
      const enriched = poisToUse
        .map((p: POI) => ({
          ...p,
          distance: haversineDistance(
            userLocation.lat,
            userLocation.lng,
            p.lat,
            p.lng,
          ),
        }))
        .sort((a: POI, b: POI) => (a.distance || 0) - (b.distance || 0));
      setPois(enriched);
    } catch (e) {
      console.error("DB Load Error", e);
      // Fallback auf MOCK_POIS bei Fehler
      const enriched = MOCK_POIS
        .map((p: POI) => ({
          ...p,
          distance: haversineDistance(
            userLocation.lat,
            userLocation.lng,
            p.lat,
            p.lng,
          ),
        }))
        .sort((a: POI, b: POI) => (a.distance || 0) - (b.distance || 0));
      setPois(enriched);
    } finally {
      setLoading(false);
    }
  };

  const filteredPOIs = useMemo(() => {
    return activeFilter === "all"
      ? pois
      : pois.filter((p) => p.category === activeFilter);
  }, [pois, activeFilter]);

  // 3. Karte zu POI bewegen
  const focusOnPOI = (poi: POI) => {
    setSelectedPOI(poi);
    mapRef.current?.animateToRegion(
      {
        latitude: poi.lat,
        longitude: poi.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.root}>
        {/* V2 Header Gradient */}
        <LinearGradient colors={[EMERALD_600, TEAL_700]} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>{t("radar.title")}</Text>
              <Text style={styles.headerSub}>
                {isOnline ? "Online" : "Offline"} • {filteredPOIs.length}{" "}
                {t("radar.places")}
              </Text>
            </View>
            <View style={styles.viewToggleRow}>
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                style={[
                  styles.toggleBtn,
                  viewMode === "list" && styles.toggleBtnActive,
                ]}
              >
                <List
                  size={16}
                  color={viewMode === "list" ? EMERALD_600 : "#FFF"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("map")}
                style={[
                  styles.toggleBtn,
                  viewMode === "map" && styles.toggleBtnActive,
                ]}
              >
                <MapIcon
                  size={16}
                  color={viewMode === "map" ? EMERALD_600 : "#FFF"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            <TouchableOpacity
              onPress={() => setActiveFilter("all")}
              style={[styles.chip, activeFilter === "all" && styles.chipActive]}
            >
              <Text
                style={
                  activeFilter === "all"
                    ? styles.chipTextActive
                    : styles.chipText
                }
              >
                Alle
              </Text>
            </TouchableOpacity>
            {Object.keys(CAT_STYLE).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveFilter(cat as Category)}
                style={[styles.chip, activeFilter === cat && styles.chipActive]}
              >
                <Text
                  style={
                    activeFilter === cat
                      ? styles.chipTextActive
                      : styles.chipText
                  }
                >
                  {CAT_STYLE[cat as Category].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content: Map or List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={EMERALD_600} size="large" />
          </View>
        ) : viewMode === "map" ? (
          <View style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation
            >
              {filteredPOIs.map((poi) => (
                <Marker
                  key={poi.id}
                  coordinate={{ latitude: poi.lat, longitude: poi.lng }}
                  onPress={() => setSelectedPOI(poi)}
                >
                  <View
                    style={[
                      styles.customMarker,
                      {
                        backgroundColor:
                          CAT_STYLE[poi.category]?.color || EMERALD_600,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {CAT_STYLE[poi.category]?.emoji || "📍"}
                    </Text>
                  </View>
                </Marker>
              ))}
            </MapView>
            {/* Horizontaler Slider auf der Karte */}
            <View style={styles.mapSlider}>
              <FlatList
                horizontal
                data={filteredPOIs}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.miniCard}
                    onPress={() => focusOnPOI(item)}
                  >
                    <Text style={styles.miniCardName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.miniCardDist}>
                      {formatDistance(item.distance || 0)}
                    </Text>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredPOIs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedPOI(item)}
              >
                <View style={styles.cardInner}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: CAT_STYLE[item.category]?.bg },
                    ]}
                  >
                    {React.createElement(
                      CAT_STYLE[item.category]?.Icon || MapPin,
                      { size: 20, color: CAT_STYLE[item.category]?.color },
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.desc}>{item.description}</Text>
                  </View>
                  <Text style={styles.distLabel}>
                    {formatDistance(item.distance || 0)}
                  </Text>
                </View>
                <View style={styles.actionBar}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openRoute(item.lat, item.lng, item.name)}
                  >
                    <Navigation size={14} color={EMERALD_600} />
                    <Text style={styles.actionText}>{t("radar.route")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openWhatsApp(item.phone)}
                  >
                    <MessageCircle size={14} color={EMERALD_600} />
                    <Text style={styles.actionText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* POI Detail Sheet */}
        {selectedPOI && (
          <View style={styles.sheetContainer}>
            <View style={styles.sheet}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sheetTitle}>{selectedPOI.name}</Text>
                <TouchableOpacity onPress={() => setSelectedPOI(null)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.sheetDesc}>{selectedPOI.description}</Text>
              <TouchableOpacity
                style={styles.mainActionBtn}
                onPress={() =>
                  openRoute(selectedPOI.lat, selectedPOI.lng, selectedPOI.name)
                }
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                  Google Maps Route
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  root: { flex: 1 },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  headerSub: { fontSize: 12, color: "#FFF", opacity: 0.8 },
  viewToggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 2,
  },
  toggleBtn: { padding: 8, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: "#FFF" },
  filterContainer: { paddingVertical: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: EMERALD_600 },
  chipText: { color: "#4B5563", fontWeight: "600" },
  chipTextActive: { color: "#FFF" },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardInner: { flexDirection: "row", padding: 16, alignItems: "center" },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15, fontWeight: "bold", color: "#1F2937" },
  desc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  distLabel: { fontSize: 13, fontWeight: "bold", color: EMERALD_600 },
  actionBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    padding: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  actionText: { fontSize: 12, fontWeight: "600", color: EMERALD_600 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  customMarker: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFF",
    elevation: 4,
  },
  mapSlider: { position: "absolute", bottom: 20, left: 0, right: 0 },
  miniCard: {
    backgroundColor: WHITE,
    marginHorizontal: 8,
    padding: 15,
    borderRadius: 16,
    width: 200,
    elevation: 5,
  },
  miniCardName: { fontWeight: "bold", fontSize: 14 },
  miniCardDist: { color: EMERALD_600, fontSize: 12, fontWeight: "bold" },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: WHITE,
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sheetTitle: { fontSize: 20, fontWeight: "bold" },
  sheetDesc: { color: "#666", marginVertical: 10 },
  mainActionBtn: {
    backgroundColor: EMERALD_600,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
});
