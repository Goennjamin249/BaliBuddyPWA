import "maplibre-gl/dist/maplibre-gl.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlertTriangle,
  Banknote,
  Beer,
  CreditCard,
  Droplets,
  Hotel,
  Layers,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Settings,
  Utensils,
  X,
  LocateFixed,
} from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import { AnimatedView, Chip } from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";
import Header from "../../components/Header";
import SettingsModal from "../../components/SettingsModal";
import * as Haptics from "expo-haptics";
import NetInfo from "@react-native-community/netinfo";
import Map, { Marker } from "react-map-gl/maplibre";
import {
  savePOIs,
  getPOIs,
  getFavorites,
  toggleFavorite,
  addToFavorite,
  removeFromFavorites,
  isFavorite,
  type CachedPOI,
} from "../../utils/storage";

// OpenFreeMap style URL (token-free)
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// ==================== TYPES ====================
interface POI {
  id: string;
  name: string;
  type: POIType;
  latitude: number;
  longitude: number;
  description: string;
  distance?: number;
  phone?: string;
}

type POIType =
  | "hotel"
  | "bar"
  | "restaurant"
  | "atm"
  | "water"
  | "hospital"
  | "surf";

interface FilterChip {
  id: string;
  label: string;
  icon: React.ReactElement<any>;
  active: boolean;
  color: string;
}

// ==================== CONSTANTS ====================
const BALI_CENTER = {
  longitude: 115.1889,
  latitude: -8.4095,
};

// Mock POI Data for Bali
const MOCK_POIS: POI[] = [
  {
    id: "hotel1",
    name: "Bali Garden Hotel",
    type: "hotel",
    latitude: -8.6705,
    longitude: 115.2126,
    description: "Comfortable hotel in Denpasar",
  },
  {
    id: "bar1",
    name: "Sunset Bar Seminyak",
    type: "bar",
    latitude: -8.6889,
    longitude: 115.1615,
    description: "Beachfront cocktails",
  },
  {
    id: "restaurant1",
    name: "Warung Nia",
    type: "restaurant",
    latitude: -8.6481,
    longitude: 115.1384,
    description: "Local Balinese cuisine",
  },
  {
    id: "atm1",
    name: "BCA ATM Legian",
    type: "atm",
    latitude: -8.7205,
    longitude: 115.1729,
    description: "24/7 ATM",
  },
];

// POI Colors for markers
const POI_COLORS: Record<POIType, string> = {
  hotel: "#6366F1",
  bar: "#EC4899",
  restaurant: "#F97316",
  atm: "#10B981",
  water: "#00B4D8",
  hospital: "#EF4444",
  surf: "#3B82F6",
};

// ==================== HELPER FUNCTIONS ====================
const getPOIIcon = (type: POIType, size: number = 20, color?: string) => {
  const iconColor = color || POI_COLORS[type];

  switch (type) {
    case "hotel":
      return <Hotel size={size} color={iconColor} />;
    case "bar":
      return <Beer size={size} color={iconColor} />;
    case "restaurant":
      return <Utensils size={size} color={iconColor} />;
    case "atm":
      return <Banknote size={size} color={iconColor} />;
    case "water":
      return <Droplets size={size} color={iconColor} />;
    case "hospital":
      return <AlertTriangle size={size} color={iconColor} />;
    case "surf":
      return <Navigation size={size} color={iconColor} />;
    default:
      return <MapPin size={size} color={iconColor} />;
  }
};

const getPOIColor = (type: POIType): string => {
  return POI_COLORS[type] || "#6B7280";
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getPOIType = (tags: any): string => {
  if (tags?.tourism === "hotel" || tags?.tourism === "hostel") return "hotel";
  if (tags?.amenity === "bar" || tags?.amenity === "pub") return "bar";
  if (tags?.amenity === "restaurant" || tags?.amenity === "cafe")
    return "restaurant";
  if (tags?.amenity === "atm" || tags?.amenity === "bank") return "atm";
  return "restaurant";
};

// Race-Condition-Fetch: Try multiple mirrors simultaneously
const fetchNearbyPOIs = async (
  lat: number,
  lon: number,
  radiusMeters = 2000,
): Promise<POI[]> => {
  const radiusDegrees = radiusMeters / 111000;

  const bbox = {
    south: lat - radiusDegrees,
    west: lon - radiusDegrees,
    north: lat + radiusDegrees,
    east: lon + radiusDegrees,
  };

  const query = `
[out:json][timeout:25];
(
  node["tourism"~"hotel|hostel|guest_house"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["amenity"~"bar|pub|nightclub"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["amenity"~"restaurant|cafe|fast_food"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["amenity"~"atm|bank"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
);
out body 50;
  `.trim();

  const mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  const fetchPromises = mirrors.map(async (mirror) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return data.elements.map((el: any) => ({
        id: `osm-${el.id}`,
        name: el.tags?.name || getPOIType(el.tags),
        type: getPOIType(el.tags) as POIType,
        latitude: el.lat,
        longitude: el.lon,
        description: el.tags?.description || getPOIType(el.tags),
        phone: el.tags?.phone,
        distance: calculateDistance(lat, lon, el.lat, el.lon),
      }));
    } catch (error) {
      return null;
    }
  });

  try {
    const results = await Promise.allSettled(fetchPromises);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        console.log("[POI] ✓ Loaded from mirror");
        return result.value;
      }
    }

    console.warn("[POI] All mirrors failed, using cached data");
    throw new Error("All mirrors failed");
  } catch (error) {
    throw error;
  }
};

// ==================== MAIN COMPONENT ====================
export default function SmartMapScreen() {
  const { t } = useTranslation();
  const { colors, themeMode } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [selectedPOIFavorite, setSelectedPOIFavorite] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: BALI_CENTER.longitude,
    latitude: BALI_CENTER.latitude,
    zoom: 13,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Filter chips
  const filterChips: FilterChip[] = [
    {
      id: "all",
      label: t("smartMap.all", "Alle"),
      icon: <MapPin {...({ size: 16 } as LucideProps)} />,
      active: !showFavoritesOnly && selectedFilter === "all",
      color: "#00B4D8",
    },
    {
      id: "favorites",
      label: "❤️ Favoriten",
      icon: <MapPin {...({ size: 16 } as LucideProps)} />,
      active: showFavoritesOnly,
      color: "#EF4444",
    },
    {
      id: "hotel",
      label: t("smartMap.hotel", "Hotel"),
      icon: <Hotel {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "hotel",
      color: "#6366F1",
    },
    {
      id: "bar",
      label: t("smartMap.bar", "Bar"),
      icon: <Beer {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "bar",
      color: "#EC4899",
    },
    {
      id: "restaurant",
      label: t("smartMap.restaurant", "Food"),
      icon: <Utensils {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "restaurant",
      color: "#F97316",
    },
    {
      id: "atm",
      label: t("smartMap.atm", "ATM"),
      icon: <CreditCard {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "atm",
      color: "#10B981",
    },
  ];

  // Online/Offline detection
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleOnline = () => {
        setIsOnline(true);
      };
      const handleOffline = () => {
        setIsOnline(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      };

      setIsOnline(navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? state.isInternetReachable ?? false;
      setIsOnline(connected);
      if (!connected) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? state.isInternetReachable ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await getFavorites();
      setFavorites(favs.map((f) => f.id));
    };
    loadFavorites();
  }, []);

  // Get user location
  useEffect(() => {
    if (Platform.OS === "web" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(loc);
          setViewState((prev) => ({
            ...prev,
            latitude: loc.latitude,
            longitude: loc.longitude,
          }));
        },
        () => {
          setUserLocation({
            latitude: BALI_CENTER.latitude,
            longitude: BALI_CENTER.longitude,
          });
        },
      );
    } else {
      setUserLocation({
        latitude: BALI_CENTER.latitude,
        longitude: BALI_CENTER.longitude,
      });
    }
  }, []);

  // Fetch nearby POIs with caching (OFFLINE-FIRST)
  useEffect(() => {
    if (!userLocation) return;

    const loadPOIs = async () => {
      setIsLoading(true);
      try {
        const cached = await getPOIs();
        if (cached.data && cached.data.length > 0) {
          setPois(cached.data as POI[]);
          console.log("[POI] Loaded from cache:", cached.data.length, "items");
        }

        if (isOnline) {
          try {
            const nearbyPOIs = await fetchNearbyPOIs(
              userLocation.latitude,
              userLocation.longitude,
              2000,
            );

            await savePOIs(
              nearbyPOIs,
              userLocation.latitude,
              userLocation.longitude,
            );

            setPois(nearbyPOIs);
            console.log("[POI] Fresh data loaded:", nearbyPOIs.length, "items");
          } catch (apiError) {
            console.warn(
              "[POI] API failed (rate limit/timeout), using cached/mock data:",
              apiError,
            );
            const cached = await getPOIs();
            if (cached.data && cached.data.length > 0) {
              setPois(cached.data as POI[]);
            } else {
              setPois(MOCK_POIS);
            }
          }
        }
      } catch (error) {
        console.warn("[POI] Load failed, using mock data:", error);
        setPois(MOCK_POIS);
      } finally {
        setIsLoading(false);
      }
    };

    loadPOIs();
  }, [userLocation, isOnline]);

  // Filter POIs
  const filteredPOIs = useMemo(() => {
    if (!pois || pois.length === 0) return [];

    if (showFavoritesOnly) {
      return pois.filter((poi) => favorites.includes(poi.id));
    }

    if (selectedFilter !== "all") {
      return pois.filter((poi) => poi.type === selectedFilter);
    }

    return pois;
  }, [pois, selectedFilter, showFavoritesOnly, favorites]);

  // Fly to user location
  const flyToUser = useCallback(() => {
    if (!userLocation) return;
    setViewState((prev) => ({
      ...prev,
      longitude: userLocation.longitude,
      latitude: userLocation.latitude,
      zoom: 15,
    }));
  }, [userLocation]);

  // Open in maps - wrapped in try-catch for robustness
  const openInMaps = useCallback(
    async (lat: number, lon: number, name: string) => {
      try {
        const url =
          Platform.OS === "web"
            ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
            : `geo:${lat},${lon}?q=${encodeURIComponent(name)}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.warn(
            "Linking.openURL not available for url, but app is still functional.",
          );
        }
      } catch (error) {
        console.warn(
          "Failed to open maps, but app is still functional:",
          error,
        );
      }
    },
    [],
  );

  // Call number - wrapped in try-catch for robustness
  const callNumber = useCallback(async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(
          "Linking.openURL not available for url, but app is still functional.",
        );
      }
    } catch (error) {
      console.warn(
        "Failed to call number, but app is still functional:",
        error,
      );
    }
  }, []);

  // Format distance
  const formatDistance = (km?: number): string => {
    if (!km) return "";
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ backgroundColor: colors.background }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <Header
          title={t("smartMap.title", "Smart Map")}
          showBackButton={false}
          rightComponents={[
            <TouchableOpacity
              key="refresh"
              style={[styles.headerButton, { backgroundColor: colors.card }]}
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  console.warn(
                    "Haptics not available, but app is still functional.",
                  );
                }
                if (userLocation) {
                  setIsLoading(true);
                  const nearbyPOIs = await fetchNearbyPOIs(
                    userLocation.latitude,
                    userLocation.longitude,
                    2000,
                  );
                  setPois(nearbyPOIs);
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <RefreshCw
                size={18}
                color={isLoading ? colors.textMuted : colors.text}
              />
            </TouchableOpacity>,
            <TouchableOpacity
              key="settings"
              style={[styles.headerButton, { backgroundColor: colors.card }]}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.7}
            >
              <Settings size={18} color={colors.text} />
            </TouchableOpacity>,
          ]}
        />

        {/* Settings Modal */}
        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          onFlyToFavorite={(lat, lon) => {
            setViewState((prev) => ({
              ...prev,
              longitude: lon,
              latitude: lat,
              zoom: 15,
            }));
          }}
        />

        {/* Offline Status Badge */}
        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>📴 Offline</Text>
          </View>
        )}

        {/* Filter Chips */}
        <AnimatedView animation="fadeIn" delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filterChips.map((chip) => (
              <Chip
                key={chip.id}
                label={chip.label}
                active={chip.active}
                icon={
                  React.isValidElement(chip.icon)
                    ? React.cloneElement(
                        chip.icon as React.ReactElement<LucideProps>,
                        {
                          size: 16,
                          color: chip.active ? "#FFFFFF" : colors.text,
                        },
                      )
                    : chip.icon
                }
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {
                    console.warn(
                      "Haptics not available, but app is still functional.",
                    );
                  }
                  if (chip.id === "favorites") {
                    setShowFavoritesOnly(true);
                    setSelectedFilter("all");
                  } else {
                    setShowFavoritesOnly(false);
                    setSelectedFilter(chip.id);
                  }
                }}
              />
            ))}
          </ScrollView>
        </AnimatedView>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <View style={styles.mapContainer}>
            {/* Loading State */}
            {isLoading && (
              <View style={styles.mapSkeleton}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[styles.skeletonText, { color: colors.textMuted }]}
                >
                  Loading Map...
                </Text>
              </View>
            )}

            {/* Declarative Map */}
            <View
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <Map
                initialViewState={{
                  longitude: BALI_CENTER.longitude,
                  latitude: BALI_CENTER.latitude,
                  zoom: 13,
                }}
                onMove={(evt) => setViewState(evt.viewState)}
                style={{ width: "100%", height: "100%" }}
                mapStyle={OPENFREEMAP_STYLE}
                attributionControl={false}
                onError={(error) => console.error("Map error:", error)}
                onLoad={() => console.log("Map loaded successfully")}
              >
                {/* POI Markers */}
                {filteredPOIs.map((poi) => (
                  <Marker
                    key={poi.id}
                    longitude={poi.longitude}
                    latitude={poi.latitude}
                    anchor="center"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) {
                        console.warn(
                          "Haptics not available, but app is still functional.",
                        );
                      }
                      setSelectedPOI(poi);
                    }}
                  >
                    <View
                      style={[
                        styles.markerContainer,
                        { backgroundColor: getPOIColor(poi.type) },
                      ]}
                    >
                      {getPOIIcon(poi.type, 16, "#FFFFFF")}
                    </View>
                  </Marker>
                ))}

                {/* User Location Marker */}
                {userLocation && (
                  <Marker
                    longitude={userLocation.longitude}
                    latitude={userLocation.latitude}
                    anchor="center"
                  >
                    <View style={styles.userMarker}>
                      <View style={styles.userMarkerInner} />
                    </View>
                  </Marker>
                )}
              </Map>
            </View>

            {/* Floating Recenter Button */}
            <TouchableOpacity
              style={styles.recenterButton}
              onPress={flyToUser}
              activeOpacity={0.7}
            >
              <LocateFixed size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* POI Detail Bottom Sheet */}
          {selectedPOI && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {selectedPOI.name}
                  </Text>
                  <View style={styles.modalHeaderActions}>
                    {/* Favorite Toggle */}
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        } catch (e) {
                          console.warn(
                            "Haptics not available, but app is still functional.",
                          );
                        }
                        const isFav = favorites.includes(selectedPOI.id);
                        if (isFav) {
                          await removeFromFavorites(selectedPOI.id);
                          setFavorites(
                            favorites.filter((id) => id !== selectedPOI.id),
                          );
                        } else {
                          await addToFavorite(selectedPOI as CachedPOI);
                          setFavorites([...favorites, selectedPOI.id]);
                        }
                        setSelectedPOIFavorite(!isFav);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.favoriteButton}>
                        {favorites.includes(selectedPOI.id) ? "❤️" : "🤍"}
                      </Text>
                    </TouchableOpacity>
                    {/* Close Button */}
                    <TouchableOpacity
                      onPress={() => setSelectedPOI(null)}
                      activeOpacity={0.7}
                    >
                      <X size={24} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.poiInfoRow}>
                    {getPOIIcon(selectedPOI.type, 24)}
                    <Text style={[styles.poiType, { color: colors.textMuted }]}>
                      {selectedPOI.type} •{" "}
                      {formatDistance(selectedPOI.distance)}
                    </Text>
                  </View>

                  <Text
                    style={[styles.poiDescription, { color: colors.textMuted }]}
                  >
                    {selectedPOI.description}
                  </Text>

                  {selectedPOI.phone && (
                    <TouchableOpacity
                      style={styles.modalRow}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        } catch (e) {
                          console.warn(
                            "Haptics not available, but app is still functional.",
                          );
                        }
                        callNumber(selectedPOI.phone!);
                      }}
                      activeOpacity={0.7}
                    >
                      <Phone size={16} color="#10B981" />
                      <Text style={[styles.modalText, styles.modalLink]}>
                        {selectedPOI.phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[
                        styles.mapsButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        } catch (e) {
                          console.warn(
                            "Haptics not available, but app is still functional.",
                          );
                        }
                        openInMaps(
                          selectedPOI.latitude,
                          selectedPOI.longitude,
                          selectedPOI.name,
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Navigation size={18} color="#FFFFFF" />
                      <Text style={styles.mapsButtonText}>Route</Text>
                    </TouchableOpacity>
                    {selectedPOI.phone && (
                      <TouchableOpacity
                        style={[
                          styles.callButton,
                          { backgroundColor: "#10B981" },
                        ]}
                        onPress={() => {
                          try {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                          } catch (e) {
                            console.warn(
                              "Haptics not available, but app is still functional.",
                            );
                          }
                          callNumber(selectedPOI.phone!);
                        }}
                        activeOpacity={0.7}
                      >
                        <Phone size={18} color="#FFFFFF" />
                        <Text style={styles.callButtonText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterContent: {
    gap: 8,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    minHeight: 500,
    width: "100%",
  },
  mapSkeleton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    gap: 12,
    zIndex: 10,
  },
  skeletonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  fallbackMessage: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  fallbackSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  offlineBadge: {
    position: "absolute",
    top: 70,
    left: 16,
    backgroundColor: "rgba(239,68,68,0.9)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    zIndex: 9999,
  },
  offlineText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 3,
    borderColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  recenterButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF9D6C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  favoriteButton: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalBody: {
    gap: 12,
  },
  poiInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  poiType: {
    fontSize: 14,
    fontWeight: "500",
  },
  poiDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#475569",
  },
  modalLink: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  mapsButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapsButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
