import { FlashList } from "@shopify/flash-list";
import {
  Building,
  Camera,
  CreditCard,
  Droplets,
  MapPin,
  RefreshCw,
  Shirt,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalHeader from "../../components/GlobalHeader";

// POI Types
interface POI {
  id: string;
  name: string;
  type: "water" | "atm" | "laundry" | "scanner" | "accommodation";
  latitude: number;
  longitude: number;
  description: string;
  distance?: number;
  price?: string;
  rating?: number;
  address?: string;
  openingHours?: string;
  phone?: string;
}

// Filter chip interface
interface FilterChip {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

export default function SmartMapScreen() {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  // Filter chips configuration
  const filterChips: FilterChip[] = [
    {
      id: "all",
      label: t("smartMap.all", "Alle"),
      icon: <MapPin size={16} />,
      active: selectedFilter === "all",
    },
    {
      id: "water",
      label: t("smartMap.water", "Wasser"),
      icon: <Droplets size={16} />,
      active: selectedFilter === "water",
    },
    {
      id: "atm",
      label: t("smartMap.atm", "ATM"),
      icon: <CreditCard size={16} />,
      active: selectedFilter === "atm",
    },
    {
      id: "laundry",
      label: t("smartMap.laundry", "Wäscherei"),
      icon: <Shirt size={16} />,
      active: selectedFilter === "laundry",
    },
    {
      id: "scanner",
      label: t("smartMap.scanner", "Scanner"),
      icon: <Camera size={16} />,
      active: selectedFilter === "scanner",
    },
    {
      id: "accommodation",
      label: t("smartMap.accommodation", "Unterkunft"),
      icon: <Building size={16} />,
      active: selectedFilter === "accommodation",
    },
  ];

  // Get user location
  useEffect(() => {
    if (Platform.OS === "web" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
          // Default to Bali center
          setUserLocation({ latitude: -8.4095, longitude: 115.1889 });
        },
      );
    } else {
      // Default to Bali center
      setUserLocation({ latitude: -8.4095, longitude: 115.1889 });
    }
  }, []);

  // Fetch POIs from Overpass API
  const fetchPOIs = useCallback(async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      const radius = 1000; // 1km radius
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="drinking_water"](around:${radius},${userLocation.latitude},${userLocation.longitude});
          node["amenity"="atm"](around:${radius},${userLocation.latitude},${userLocation.longitude});
          node["shop"="laundry"](around:${radius},${userLocation.latitude},${userLocation.longitude});
        );
        out body;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });

      const data = await response.json();

      const poisData: POI[] = data.elements.map(
        (element: any, index: number) => ({
          id: `poi-${index}`,
          name: element.tags?.name || "Unbekannt",
          type: getPOIType(element.tags),
          latitude: element.lat,
          longitude: element.lon,
          description: getDescription(element.tags),
          address: getAddress(element.tags),
          openingHours: getOpeningHours(element.tags),
          phone: getPhone(element.tags),
          distance: userLocation
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                element.lat,
                element.lon,
              )
            : undefined,
        }),
      );

      setPois(poisData);
    } catch (error) {
      console.error("Error fetching POIs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  // Helper functions
  const getPOIType = (tags: any): POI["type"] => {
    if (tags?.amenity === "drinking_water") return "water";
    if (tags?.amenity === "atm") return "atm";
    if (tags?.shop === "laundry") return "laundry";
    return "water";
  };

  const getDescription = (tags: any): string => {
    if (tags?.amenity === "drinking_water") {
      return tags?.drinking_water === "yes" ? "Trinkwasser" : "Wasserstation";
    }
    if (tags?.amenity === "atm") {
      const operator = tags?.operator || tags?.brand || "Bank";
      return `ATM - ${operator}`;
    }
    if (tags?.shop === "laundry") {
      return tags?.name || "Wäscherei";
    }
    return tags?.description || "POI";
  };

  const getAddress = (tags: any): string | undefined => {
    if (tags?.["addr:street"]) {
      const street = tags["addr:street"];
      const number = tags["addr:housenumber"] || "";
      const city = tags["addr:city"] || "";
      return `${street} ${number}${city ? `, ${city}` : ""}`.trim();
    }
    return undefined;
  };

  const getOpeningHours = (tags: any): string | undefined => {
    return tags?.opening_hours;
  };

  const getPhone = (tags: any): string | undefined => {
    return tags?.phone || tags?.["contact:phone"];
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

  // Filter POIs
  const filteredPOIs =
    selectedFilter === "all"
      ? pois
      : pois.filter((poi) => poi.type === selectedFilter);

  // Get POI icon
  const getPOIIcon = (type: POI["type"]) => {
    switch (type) {
      case "water":
        return <Droplets size={20} color="#00B4D8" />;
      case "atm":
        return <CreditCard size={20} color="#F59E0B" />;
      case "laundry":
        return <Shirt size={20} color="#90BE6D" />;
      case "scanner":
        return <Camera size={20} color="#8B5CF6" />;
      case "accommodation":
        return <Building size={20} color="#FF6B6B" />;
      default:
        return <MapPin size={20} color="#6B7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Global Header */}
      <GlobalHeader
        title={t("smartMap.title", "Smart Map")}
        showBackButton={false}
        showSettings={true}
      />

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchPOIs}
        disabled={isLoading}
      >
        <RefreshCw size={20} color={isLoading ? "#94A3B8" : "#00B4D8"} />
        <Text
          style={[styles.refreshText, isLoading && styles.refreshTextDisabled]}
        >
          {t("common.refresh", "Aktualisieren")}
        </Text>
      </TouchableOpacity>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filterChips.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[styles.filterChip, chip.active && styles.filterChipActive]}
            onPress={() => setSelectedFilter(chip.id)}
          >
            {chip.icon}
            <Text
              style={[
                styles.filterChipText,
                chip.active && styles.filterChipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* POI List - Using FlashList for better performance */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t("smartMap.loading", "Lade POIs...")}
          </Text>
        </View>
      ) : filteredPOIs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPin size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>
            {t("smartMap.empty", "Keine POIs gefunden")}
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredPOIs}
          renderItem={({ item: poi }) => (
            <TouchableOpacity
              style={styles.poiCard}
              onPress={() => setSelectedPOI(poi)}
              accessibilityRole="button"
              accessibilityLabel={`${poi.name}, ${poi.description}`}
            >
              <View style={styles.poiIconContainer}>
                {getPOIIcon(poi.type)}
              </View>
              <View style={styles.poiInfo}>
                <Text style={styles.poiName}>{poi.name}</Text>
                <Text style={styles.poiDescription}>{poi.description}</Text>
                {poi.address && (
                  <Text style={styles.poiAddress}>📍 {poi.address}</Text>
                )}
                {poi.openingHours && (
                  <Text style={styles.poiHours}>🕐 {poi.openingHours}</Text>
                )}
                {poi.distance && (
                  <Text style={styles.poiDistance}>
                    {poi.distance.toFixed(2)} km entfernt
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.poiList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00B4D8",
  },
  refreshTextDisabled: {
    color: "#94A3B8",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#00B4D8",
    borderColor: "#00B4D8",
  },
  filterChipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  poiList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  poiCard: {
    flexDirection: "row",
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
  poiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  poiAddress: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  poiHours: {
    fontSize: 12,
    color: "#10B981",
    marginBottom: 2,
  },
  poiDistance: {
    fontSize: 12,
    color: "#00B4D8",
    fontWeight: "500",
  },
});
