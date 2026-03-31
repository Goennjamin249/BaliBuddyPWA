import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  CreditCard,
  Droplets,
  Globe,
  Hotel,
  Layers,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  Ship,
  Shirt,
  Users,
  Utensils,
  X,
  LocateFixed,
} from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedView, Chip } from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";
import Header from "../../components/Header";

// Mapbox Access Token - Vercel Environment Injection
// This variable MUST be prefixed with EXPO_PUBLIC_ to be exposed to client
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Safe token check - only set if token exists and is valid length
if (MAPBOX_TOKEN && MAPBOX_TOKEN.length > 20) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.warn(
    "Mapbox Token not found in build environment. Using CartoDB fallback.",
  );
}

// Check if we have a valid Mapbox token
const HAS_MAPBOX_TOKEN = MAPBOX_TOKEN && MAPBOX_TOKEN.length > 20;

// Map Styles - Mapbox (requires token) or CartoDB fallback (free, no token)
const MAP_STYLES = HAS_MAPBOX_TOKEN
  ? {
      light: "mapbox://styles/mapbox/streets-v12",
      dark: "mapbox://styles/mapbox/dark-v11",
    }
  : {
      light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      dark: "https://basemaps.cartocdn.com/gl/darkmatter-gl-style/style.json",
    };

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
  | "water"
  | "atm"
  | "laundry"
  | "scanner"
  | "accommodation"
  | "warung"
  | "supermarket"
  | "ferry"
  | "taxi"
  | "crowd"
  | "clinic"
  | "rabies"
  | "bar"
  | "surf"
  | "hospital";

interface FilterChip {
  id: string;
  label: string;
  icon: React.ReactElement<any>;
  active: boolean;
  color: string;
}

// ==================== CONSTANTS ====================
const BALI_CENTER: [number, number] = [115.1889, -8.4095];

// Mock POI Data for Bali
const MOCK_POIS: POI[] = [
  {
    id: "warung1",
    name: "Warung Nia",
    type: "warung",
    latitude: -8.6705,
    longitude: 115.2126,
    description: "Lokales balinesisches Essen",
  },
  {
    id: "warung2",
    name: "Warung Bu Mi",
    type: "warung",
    latitude: -8.5069,
    longitude: 115.2625,
    description: "Berühmte Nasi Goreng",
  },
  {
    id: "atm1",
    name: "BCA ATM Legian",
    type: "atm",
    latitude: -8.7205,
    longitude: 115.1729,
    description: "Sicherer Geldautomat",
  },
  {
    id: "water1",
    name: "Water Station Canggu",
    type: "water",
    latitude: -8.6481,
    longitude: 115.1384,
    description: "Kostenlose Wasser refill Station",
  },
  {
    id: "hospital1",
    name: "BIMC Hospital",
    type: "hospital",
    latitude: -8.7984,
    longitude: 115.2308,
    description: "Internationales Krankenhaus",
    phone: "+62 361 3000911",
  },
  {
    id: "surf1",
    name: "Kuta Beach",
    type: "surf",
    latitude: -8.7184,
    longitude: 115.1686,
    description: "Perfekt für Anfänger",
  },
];

// ==================== HELPER FUNCTIONS ====================
const getPOIType = (tags: any): POIType => {
  if (tags?.amenity === "drinking_water") return "water";
  if (tags?.amenity === "atm" || tags?.amenity === "bank") return "atm";
  if (tags?.amenity === "hospital" || tags?.amenity === "clinic")
    return "hospital";
  if (tags?.amenity === "pharmacy") return "clinic";
  if (tags?.amenity === "restaurant" || tags?.amenity === "cafe")
    return "warung";
  if (tags?.leisure === "beach_resort") return "surf";
  return "scanner";
};

const getPOIName = (tags: any): string => {
  if (tags?.name) return tags.name;
  if (tags?.amenity === "atm") return "ATM";
  if (tags?.amenity === "hospital") return "Hospital";
  return "POI";
};

const getDescription = (tags: any): string => {
  if (tags?.cuisine) return tags.cuisine;
  if (tags?.amenity === "atm") return "ATM";
  if (tags?.amenity === "hospital") return "Hospital";
  return "Point of Interest";
};

const getPOIColor = (type: POIType): string => {
  switch (type) {
    case "water":
      return "#00B4D8";
    case "atm":
      return "#10B981";
    case "hospital":
      return "#EF4444";
    case "warung":
      return "#F59E0B";
    case "surf":
      return "#3B82F6";
    default:
      return "#6B7280";
  }
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

// ==================== MAIN COMPONENT ====================
export default function SmartMapScreen() {
  const { t } = useTranslation();
  const { colors, themeMode } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [mapStyle, setMapStyle] = useState<"light" | "dark">(
    themeMode === "dark" ? "dark" : "light",
  );
  const [isMapLoading, setIsMapLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Filter chips configuration
  const filterChips: FilterChip[] = [
    {
      id: "all",
      label: t("smartMap.all", "Alle"),
      icon: <MapPin {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "all",
      color: "#00B4D8",
    },
    {
      id: "warung",
      label: t("smartMap.warung", "Warung"),
      icon: <Utensils {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "warung",
      color: "#F59E0B",
    },
    {
      id: "water",
      label: t("smartMap.water", "Wasser"),
      icon: <Droplets {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "water",
      color: "#00B4D8",
    },
    {
      id: "atm",
      label: t("smartMap.atm", "ATM"),
      icon: <CreditCard {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "atm",
      color: "#10B981",
    },
    {
      id: "hospital",
      label: t("smartMap.hospital", "Klinik"),
      icon: <AlertTriangle {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "hospital",
      color: "#EF4444",
    },
    {
      id: "surf",
      label: t("smartMap.surf", "Surf"),
      icon: <Navigation {...({ size: 16 } as LucideProps)} />,
      active: selectedFilter === "surf",
      color: "#3B82F6",
    },
  ];

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
        },
        () => {
          setUserLocation({
            latitude: BALI_CENTER[1],
            longitude: BALI_CENTER[0],
          });
        },
      );
    } else {
      setUserLocation({
        latitude: BALI_CENTER[1],
        longitude: BALI_CENTER[0],
      });
    }
  }, []);

  // Filter POIs
  const filteredPOIs = useMemo(() => {
    if (!pois || pois.length === 0) return [];
    if (selectedFilter === "all") return pois;
    return pois.filter((poi) => poi.type === selectedFilter);
  }, [pois, selectedFilter]);

  // Sync map style with theme
  useEffect(() => {
    const newStyle = themeMode === "dark" ? "dark" : "light";
    setMapStyle(newStyle);
    if (mapInstance.current) {
      mapInstance.current.setStyle(MAP_STYLES[newStyle]);
    }
  }, [themeMode]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const initMap = () => {
      if (!mapContainer.current) {
        setTimeout(initMap, 100);
        return;
      }

      // CRITICAL: Do not attempt to render map if token is undefined/invalid
      // This prevents "Circular Structure" and token errors
      if (HAS_MAPBOX_TOKEN && !mapboxgl.accessToken) {
        console.error("Mapbox access token not set. Map cannot initialize.");
        setIsMapLoading(false);
        return;
      }

      try {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: MAP_STYLES[mapStyle],
          center: userLocation
            ? [userLocation.longitude, userLocation.latitude]
            : BALI_CENTER,
          zoom: 12,
          attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.on("load", () => {
          mapInstance.current = map;
          setIsMapLoading(false);

          // Add GeoJSON source with clustering
          map.addSource("pois", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: filteredPOIs.map((poi) => ({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [poi.longitude, poi.latitude],
                },
                properties: {
                  ...poi,
                  markerColor: getPOIColor(poi.type),
                },
              })),
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          // Cluster circles layer
          map.addLayer({
            id: "clusters",
            type: "circle",
            source: "pois",
            filter: ["has", "point_count"],
            paint: {
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#00B4D8",
                10,
                "#F59E0B",
                30,
                "#EF4444",
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                15,
                10,
                20,
                30,
                25,
              ],
            },
          });

          // Cluster count labels
          map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "pois",
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 12,
            },
            paint: {
              "text-color": "#FFFFFF",
            },
          });

          // Individual POI markers
          map.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "pois",
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": ["get", "markerColor"],
              "circle-radius": 8,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#FFFFFF",
            },
          });

          // Click handler for clusters
          map.on("click", "clusters", (e) => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ["clusters"],
            });
            const clusterId = (features[0].properties as any).cluster_id;
            const source = map.getSource("pois") as mapboxgl.GeoJSONSource;

            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err || !zoom) return;
              map.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom,
                duration: 500,
              });
            });
          });

          // Click handler for POIs
          map.on("click", "unclustered-point", (e) => {
            const properties = (e.features?.[0] as any)?.properties;
            if (properties) {
              setSelectedPOI(properties);
            }
          });

          // Change cursor on hover
          map.on("mouseenter", "clusters", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "clusters", () => {
            map.getCanvas().style.cursor = "";
          });

          // Add user location marker
          if (userLocation) {
            const userMarkerEl = document.createElement("div");
            userMarkerEl.className = "user-location-marker";
            userMarkerEl.style.cssText = `
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #00B4D8;
              border: 3px solid #FFFFFF;
              box-shadow: 0 0 0 0 rgba(0, 180, 216, 0.7);
              animation: pulse 2s infinite;
            `;

            markerRef.current = new mapboxgl.Marker(userMarkerEl)
              .setLngLat([userLocation.longitude, userLocation.latitude])
              .addTo(map);
          }
        });

        map.on("error", (e) => {
          console.error("Mapbox error:", e.error?.message || "Map error");
        });

        return () => {
          if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
          }
          if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
          }
        };
      } catch (error) {
        console.error("Failed to initialize Mapbox:", error);
      }
    };

    const timeoutId = setTimeout(initMap, 300);
    return () => clearTimeout(timeoutId);
  }, [mapStyle]);

  // Update POI markers when data changes
  useEffect(() => {
    if (!mapInstance.current || !mapInstance.current.getSource("pois")) return;

    const source = mapInstance.current.getSource(
      "pois",
    ) as mapboxgl.GeoJSONSource;
    source.setData({
      type: "FeatureCollection",
      features: filteredPOIs.map((poi) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [poi.longitude, poi.latitude],
        },
        properties: {
          ...poi,
          markerColor: getPOIColor(poi.type),
        },
      })),
    });
  }, [filteredPOIs]);

  // Fetch POIs from Overpass API
  const fetchPOIs = useCallback(async () => {
    if (!userLocation) return;

    const bboxSize = 0.01;
    const bbox = {
      south: userLocation.latitude - bboxSize,
      west: userLocation.longitude - bboxSize,
      north: userLocation.latitude + bboxSize,
      east: userLocation.longitude + bboxSize,
    };

    setIsLoading(true);
    try {
      const query = `
[out:json][timeout:25];
(
  node["amenity"~"restaurant|cafe|fast_food"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["amenity"~"atm|bank"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["amenity"~"hospital|clinic|pharmacy"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["amenity"="drinking_water"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["leisure"="beach_resort"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
);
out body 50;
      `.trim();

      const overpassMirrors = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
      ];

      let response: Response | null = null;

      for (const mirrorUrl of overpassMirrors) {
        try {
          response = await fetch(mirrorUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              break;
            } else {
              response = null;
              continue;
            }
          } else {
            response = null;
          }
        } catch {
          response = null;
          continue;
        }
      }

      if (!response || !response.ok) {
        setPois(MOCK_POIS);
        setIsLoading(false);
        return;
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        setPois(MOCK_POIS);
        setIsLoading(false);
        return;
      }

      const poisData: POI[] = data.elements.map((element: any) => ({
        id: `poi-${element.id}`,
        name: element.tags?.name || getPOIName(element.tags),
        type: getPOIType(element.tags),
        latitude: element.lat,
        longitude: element.lon,
        description: getDescription(element.tags),
        phone: element.tags?.phone,
      }));

      setPois([...MOCK_POIS, ...poisData]);
    } catch {
      setPois(MOCK_POIS);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  // Initial data fetch
  useEffect(() => {
    if (userLocation) {
      fetchPOIs();
    }
  }, [userLocation, fetchPOIs]);

  // Fly to user location
  const flyToUser = useCallback(() => {
    if (!mapInstance.current || !userLocation) return;
    mapInstance.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 15,
      duration: 1500,
      essential: true,
    });
  }, [userLocation]);

  // Open in maps
  const openInMaps = useCallback((lat: number, lon: number, name: string) => {
    const url =
      Platform.OS === "web"
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
        : `geo:${lat},${lon}?q=${encodeURIComponent(name)}`;
    Linking.openURL(url);
  }, []);

  // Call number
  const callNumber = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  // Get POI icon
  const getPOIIcon = (type: POIType) => {
    switch (type) {
      case "water":
        return (
          <Droplets {...({ size: 20, color: "#00B4D8" } as LucideProps)} />
        );
      case "atm":
        return (
          <CreditCard {...({ size: 20, color: "#10B981" } as LucideProps)} />
        );
      case "hospital":
        return (
          <AlertTriangle {...({ size: 20, color: "#EF4444" } as LucideProps)} />
        );
      case "warung":
        return (
          <Utensils {...({ size: 20, color: "#F59E0B" } as LucideProps)} />
        );
      case "surf":
        return (
          <Navigation {...({ size: 20, color: "#3B82F6" } as LucideProps)} />
        );
      default:
        return <MapPin {...({ size: 20, color: "#6B7280" } as LucideProps)} />;
    }
  };

  // Render POI card
  const renderPOICard = ({ item: poi }: { item: POI }) => (
    <TouchableOpacity
      style={styles.poiCard}
      onPress={() => setSelectedPOI(poi)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.poiIconContainer,
          { backgroundColor: `${getPOIColor(poi.type)}15` },
        ]}
      >
        {getPOIIcon(poi.type)}
      </View>
      <View style={styles.poiInfo}>
        <Text style={styles.poiName}>{poi.name}</Text>
        <Text style={styles.poiDescription}>{poi.description}</Text>
        {poi.distance !== undefined && (
          <Text style={styles.poiDistance}>
            📍 {poi.distance.toFixed(2)} km entfernt
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

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
              onPress={fetchPOIs}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <RefreshCw
                size={18}
                color={isLoading ? colors.textMuted : colors.text}
              />
            </TouchableOpacity>,
            <TouchableOpacity
              key="layers"
              style={[styles.headerButton, { backgroundColor: colors.card }]}
              onPress={() =>
                setMapStyle((prev) => (prev === "light" ? "dark" : "light"))
              }
              activeOpacity={0.7}
            >
              <Layers size={18} color={colors.text} />
            </TouchableOpacity>,
          ]}
        />

        {/* Floating Search Bar */}
        <AnimatedView animation="fadeIn" delay={100}>
          <View style={styles.searchContainer}>
            <Search size={18} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search Bali...</Text>
          </View>
        </AnimatedView>

        {/* Filter Chips */}
        <AnimatedView animation="fadeIn" delay={200}>
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
                onPress={() => setSelectedFilter(chip.id)}
              />
            ))}
          </ScrollView>
        </AnimatedView>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <View style={styles.mapContainer}>
            {/* Skeleton Loading State */}
            {isMapLoading && (
              <View style={styles.mapSkeleton}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[styles.skeletonText, { color: colors.textMuted }]}
                >
                  Loading Map...
                </Text>
              </View>
            )}
            <div
              ref={mapContainer}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                opacity: isMapLoading ? 0 : 1,
              }}
            />
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
                  <Text style={styles.modalTitle}>{selectedPOI.name}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedPOI(null)}
                    activeOpacity={0.7}
                  >
                    <X size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalDescription}>
                    {selectedPOI.description}
                  </Text>

                  {selectedPOI.phone && (
                    <TouchableOpacity
                      style={styles.modalRow}
                      onPress={() => callNumber(selectedPOI.phone!)}
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
                      style={styles.mapsButton}
                      onPress={() =>
                        openInMaps(
                          selectedPOI.latitude,
                          selectedPOI.longitude,
                          selectedPOI.name,
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Navigation size={18} color="#FFFFFF" />
                      <Text style={styles.mapsButtonText}>Route</Text>
                    </TouchableOpacity>
                    {selectedPOI.phone && (
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => callNumber(selectedPOI.phone!)}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#94A3B8",
    flex: 1,
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
  },
  skeletonText: {
    fontSize: 14,
    fontWeight: "500",
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
    shadowRadius: 8,
    elevation: 8,
  },
  poiCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  poiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  poiInfo: {
    flex: 1,
    justifyContent: "center",
  },
  poiName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
  },
  poiDistance: {
    fontSize: 12,
    color: "#00B4D8",
    fontWeight: "600",
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalBody: {
    gap: 12,
  },
  modalDescription: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 8,
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
    backgroundColor: "#FF9D6C",
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mapsButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

// Add pulse animation CSS for web
if (Platform.OS === "web" && typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 180, 216, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 15px rgba(0, 180, 216, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 180, 216, 0);
      }
    }
  `;
  document.head.appendChild(style);
}
