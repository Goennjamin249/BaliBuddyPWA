import {
  Clock,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Ship,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalHeader from "../../components/GlobalHeader";

// Ferry interface
interface Ferry {
  id: string;
  name: string;
  route: string;
  departure: string;
  arrival: string;
  status: "on-time" | "delayed" | "boarding" | "departed";
  price: number;
  capacity: number;
  booked: number;
}

// Ride share interface
interface RideShare {
  id: string;
  from: string;
  to: string;
  date: Date;
  time: string;
  passengers: number;
  maxPassengers: number;
  price: number;
  driver: string;
  contact: string;
}

export default function TransportScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"ferry" | "rideshare">("ferry");
  const [ferries, setFerries] = useState<Ferry[]>([]);
  const [rideShares, setRideShares] = useState<RideShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch ferries (Demo data - real API would require maritime data provider)
  const fetchFerries = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call with realistic Bali ferry schedules
      // In production, this would connect to a maritime API like MarineTraffic or local ferry operators
      const mockFerries: Ferry[] = [
        {
          id: "1",
          name: "Bali Express",
          route: "Bali → Gili Trawangan",
          departure: "08:00",
          arrival: "10:30",
          status: "on-time",
          price: 450000,
          capacity: 150,
          booked: 120,
        },
        {
          id: "2",
          name: "Blue Water Jet",
          route: "Bali → Nusa Lembongan",
          departure: "09:30",
          arrival: "10:00",
          status: "boarding",
          price: 350000,
          capacity: 100,
          booked: 95,
        },
        {
          id: "3",
          name: "Island Hopper",
          route: "Bali → Nusa Penida",
          departure: "10:00",
          arrival: "11:00",
          status: "delayed",
          price: 300000,
          capacity: 80,
          booked: 60,
        },
        {
          id: "4",
          name: "Fast Boat Bali",
          route: "Bali → Gili Air",
          departure: "11:00",
          arrival: "13:00",
          status: "on-time",
          price: 500000,
          capacity: 120,
          booked: 85,
        },
        {
          id: "5",
          name: "Paradise Cruise",
          route: "Bali → Lombok",
          departure: "14:00",
          arrival: "17:00",
          status: "on-time",
          price: 600000,
          capacity: 200,
          booked: 150,
        },
      ];
      setFerries(mockFerries);
    } catch (error) {
      console.error("Error fetching ferries:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch ride shares
  const fetchRideShares = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      const mockRideShares: RideShare[] = [
        {
          id: "1",
          from: "Kuta",
          to: "Ubud",
          date: new Date(),
          time: "14:00",
          passengers: 2,
          maxPassengers: 4,
          price: 150000,
          driver: "Made",
          contact: "+62 812 3456 7890",
        },
        {
          id: "2",
          from: "Seminyak",
          to: "Canggu",
          date: new Date(),
          time: "16:30",
          passengers: 1,
          maxPassengers: 3,
          price: 75000,
          driver: "Wayan",
          contact: "+62 813 4567 8901",
        },
      ];
      setRideShares(mockRideShares);
    } catch (error) {
      console.error("Error fetching ride shares:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "ferry") {
      fetchFerries();
    } else {
      fetchRideShares();
    }
  }, [activeTab, fetchFerries, fetchRideShares]);

  // Get status color
  const getStatusColor = (status: Ferry["status"]) => {
    switch (status) {
      case "on-time":
        return "#10B981";
      case "delayed":
        return "#F59E0B";
      case "boarding":
        return "#3B82F6";
      case "departed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  // Get status text
  const getStatusText = (status: Ferry["status"]) => {
    switch (status) {
      case "on-time":
        return t("transport.onTime", "Pünktlich");
      case "delayed":
        return t("transport.delayed", "Verspätet");
      case "boarding":
        return t("transport.boarding", "Einsteigen");
      case "departed":
        return t("transport.departed", "Abgefahren");
      default:
        return status;
    }
  };

  // Call driver
  const callDriver = (contact: string) => {
    const telUrl = `tel:${contact}`;
    Linking.openURL(telUrl);
  };

  // Open directions
  const openDirections = (from: string, to: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Global Header */}
      <GlobalHeader
        title={t("transport.title", "Transport")}
        showBackButton={false}
        showSettings={true}
      />

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() =>
          activeTab === "ferry" ? fetchFerries() : fetchRideShares()
        }
        disabled={isLoading}
      >
        <RefreshCw size={20} color={isLoading ? "#94A3B8" : "#00B4D8"} />
        <Text
          style={[styles.refreshText, isLoading && styles.refreshTextDisabled]}
        >
          {t("common.refresh", "Aktualisieren")}
        </Text>
      </TouchableOpacity>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ferry" && styles.tabActive]}
          onPress={() => setActiveTab("ferry")}
        >
          <Ship
            size={20}
            color={activeTab === "ferry" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "ferry" && styles.tabTextActive,
            ]}
          >
            {t("transport.ferry", "Fähre")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rideshare" && styles.tabActive]}
          onPress={() => setActiveTab("rideshare")}
        >
          <Users
            size={20}
            color={activeTab === "rideshare" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "rideshare" && styles.tabTextActive,
            ]}
          >
            {t("transport.rideshare", "Mitfahrgelegenheit")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Ferry Tracker */}
        {activeTab === "ferry" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("transport.ferryTracker", "Fähren Tracker")}
            </Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  {t("transport.loading", "Lade Fähren...")}
                </Text>
              </View>
            ) : ferries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ship size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  {t("transport.noFerries", "Keine Fähren gefunden")}
                </Text>
              </View>
            ) : (
              ferries.map((ferry) => (
                <View key={ferry.id} style={styles.ferryCard}>
                  <View style={styles.ferryHeader}>
                    <Text style={styles.ferryName}>{ferry.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(ferry.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(ferry.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ferryRoute}>{ferry.route}</Text>
                  <View style={styles.ferryDetails}>
                    <View style={styles.ferryDetail}>
                      <Clock size={16} color="#64748B" />
                      <Text style={styles.ferryDetailText}>
                        {ferry.departure} → {ferry.arrival}
                      </Text>
                    </View>
                    <View style={styles.ferryDetail}>
                      <Users size={16} color="#64748B" />
                      <Text style={styles.ferryDetailText}>
                        {ferry.booked}/{ferry.capacity}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.ferryFooter}>
                    <Text style={styles.ferryPrice}>
                      Rp {ferry.price.toLocaleString("de-DE")}
                    </Text>
                    <TouchableOpacity style={styles.bookButton}>
                      <Text style={styles.bookButtonText}>
                        {t("transport.book", "Buchen")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Ride Share */}
        {activeTab === "rideshare" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("transport.rideshare", "Mitfahrgelegenheit")}
            </Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  {t("transport.loadingRides", "Lade Fahrten...")}
                </Text>
              </View>
            ) : rideShares.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Users size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  {t("transport.noRides", "Keine Fahrten gefunden")}
                </Text>
              </View>
            ) : (
              rideShares.map((ride) => (
                <View key={ride.id} style={styles.rideCard}>
                  <View style={styles.rideHeader}>
                    <View style={styles.rideRoute}>
                      <MapPin size={16} color="#00B4D8" />
                      <Text style={styles.rideFrom}>{ride.from}</Text>
                      <Navigation size={16} color="#64748B" />
                      <Text style={styles.rideTo}>{ride.to}</Text>
                    </View>
                  </View>
                  <View style={styles.rideDetails}>
                    <View style={styles.rideDetail}>
                      <Clock size={16} color="#64748B" />
                      <Text style={styles.rideDetailText}>
                        {ride.date.toLocaleDateString("de-DE")} {ride.time}
                      </Text>
                    </View>
                    <View style={styles.rideDetail}>
                      <Users size={16} color="#64748B" />
                      <Text style={styles.rideDetailText}>
                        {ride.passengers}/{ride.maxPassengers}{" "}
                        {t("transport.passengers", "Passagiere")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rideFooter}>
                    <View style={styles.rideDriver}>
                      <Text style={styles.driverName}>{ride.driver}</Text>
                      <TouchableOpacity
                        onPress={() => callDriver(ride.contact)}
                      >
                        <Phone size={20} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.ridePrice}>
                      Rp {ride.price.toLocaleString("de-DE")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => openDirections(ride.from, ride.to)}
                  >
                    <Navigation size={16} color="#FFFFFF" />
                    <Text style={styles.directionsButtonText}>
                      {t("transport.directions", "Route")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F2FE",
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
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
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
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: "#E0F2FE",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#00B4D8",
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  ferryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ferryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ferryName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ferryRoute: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  ferryDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  ferryDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ferryDetailText: {
    fontSize: 14,
    color: "#64748B",
  },
  ferryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ferryPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  bookButton: {
    backgroundColor: "#00B4D8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  rideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rideHeader: {
    marginBottom: 12,
  },
  rideRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rideFrom: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  rideTo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  rideDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  rideDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rideDetailText: {
    fontSize: 14,
    color: "#64748B",
  },
  rideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rideDriver: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  ridePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00B4D8",
    paddingVertical: 12,
    borderRadius: 8,
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
