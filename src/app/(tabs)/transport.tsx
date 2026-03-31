import {
  AlertTriangle,
  Calendar,
  Car,
  Check,
  ChevronDown,
  Clock,
  DollarSign,
  Info,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import { Chip, ListLink, AnimatedView } from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";

// ==================== TYPES ====================
interface RideShare {
  id: string;
  type: "offer" | "request";
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  driver?: {
    name: string;
    rating: number;
    verified: boolean;
    phone: string;
  };
  description: string;
  postedAt: string;
}

interface TaxiEstimate {
  from: string;
  to: string;
  grabPrice: number;
  gojekPrice: number;
  bluebirdPrice: number;
  distance: string;
  duration: string;
}

interface TransportTip {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ==================== CONSTANTS ====================
const POPULAR_ROUTES: TaxiEstimate[] = [
  {
    from: "Flughafen DPS",
    to: "Seminyak",
    grabPrice: 85,
    gojekPrice: 75,
    bluebirdPrice: 120,
    distance: "12 km",
    duration: "25 min",
  },
  {
    from: "Flughafen DPS",
    to: "Canggu",
    grabPrice: 110,
    gojekPrice: 95,
    bluebirdPrice: 150,
    distance: "15 km",
    duration: "35 min",
  },
  {
    from: "Flughafen DPS",
    to: "Ubud",
    grabPrice: 200,
    gojekPrice: 180,
    bluebirdPrice: 300,
    distance: "35 km",
    duration: "60 min",
  },
  {
    from: "Flughafen DPS",
    to: "Nusa Dua",
    grabPrice: 130,
    gojekPrice: 115,
    bluebirdPrice: 180,
    distance: "20 km",
    duration: "40 min",
  },
  {
    from: "Seminyak",
    to: "Canggu",
    grabPrice: 45,
    gojekPrice: 40,
    bluebirdPrice: 70,
    distance: "6 km",
    duration: "15 min",
  },
  {
    from: "Seminyak",
    to: "Ubud",
    grabPrice: 150,
    gojekPrice: 135,
    bluebirdPrice: 220,
    distance: "28 km",
    duration: "50 min",
  },
  {
    from: "Canggu",
    to: "Ubud",
    grabPrice: 140,
    gojekPrice: 125,
    bluebirdPrice: 200,
    distance: "25 km",
    duration: "45 min",
  },
  {
    from: "Ubud",
    to: "Nusa Dua",
    grabPrice: 180,
    gojekPrice: 160,
    bluebirdPrice: 280,
    distance: "40 km",
    duration: "70 min",
  },
];

const SAMPLE_RIDE_SHARES: RideShare[] = [
  {
    id: "r1",
    type: "offer",
    from: "Seminyak",
    to: "Ubud",
    date: "2025-01-15",
    time: "09:00",
    seats: 3,
    pricePerSeat: 50,
    driver: {
      name: "Max (DE)",
      rating: 4.9,
      verified: true,
      phone: "+49 123 456789",
    },
    description:
      "Fahre morgens nach Ubud, 3 Plätze frei. AC Auto, Wasser inklusive.",
    postedAt: "2 Stunden her",
  },
  {
    id: "r2",
    type: "request",
    from: "Canggu",
    to: "Flughafen DPS",
    date: "2025-01-16",
    time: "14:00",
    seats: 2,
    pricePerSeat: 40,
    description: "Suche Mitfahrgelegenheit zum Flughafen. Flug um 17 Uhr.",
    postedAt: "4 Stunden her",
  },
  {
    id: "r3",
    type: "offer",
    from: "Ubud",
    to: "Nusa Dua",
    date: "2025-01-17",
    time: "10:00",
    seats: 2,
    pricePerSeat: 75,
    driver: {
      name: "Sarah (AT)",
      rating: 5.0,
      verified: true,
      phone: "+43 987 654321",
    },
    description: "Fahre zurück nach Nusa Dua, Stopps möglich.",
    postedAt: "1 Tag her",
  },
  {
    id: "r4",
    type: "offer",
    from: "Flughafen DPS",
    to: "Canggu",
    date: "2025-01-18",
    time: "08:00",
    seats: 4,
    pricePerSeat: 35,
    driver: {
      name: "Tom (CH)",
      rating: 4.7,
      verified: true,
      phone: "+41 555 123456",
    },
    description: "Abholung am Flughafen, fahre direkt nach Canggu.",
    postedAt: "2 Tage her",
  },
];

const TRANSPORT_TIPS: TransportTip[] = [
  {
    id: "t1",
    category: "Grab/Gojek",
    title: "App-Preise sind fix",
    description:
      "Anders als Taxis zeigen Grab/Gojek den Festpreis vor der Buchung. Keine Überraschungen!",
    icon: <Check size={18} color="#10B981" />,
  },
  {
    id: "t2",
    category: "Grab/Gojek",
    title: "Pickup Points",
    description:
      "An manchen Orten (Malls, Tempel) gibt es feste Abholpunkte. App zeigt diese an.",
    icon: <MapPin size={18} color="#3B82F6" />,
  },
  {
    id: "t3",
    category: "Taxi",
    title: "Nur Bluebird Meter",
    description:
      "Bluebird Group (hellblau) sind die einzigen vertrauenswürdigen Taxis mit Meter.",
    icon: <Car size={18} color="#10B981" />,
  },
  {
    id: "t4",
    category: "Taxi",
    title: "Bestellen per App",
    description:
      "MyBluebird App nutzen oder Hotel/Restaurant um Anruf bitten. Vermeidet Abzocke.",
    icon: <Phone size={18} color="#8B5CF6" />,
  },
  {
    id: "t5",
    category: "Scooter",
    title: "Parkgebühren",
    description:
      "An Stränden/Tempeln: 2k-10k IDR Parkgebühr ist normal. Quittung verlangen.",
    icon: <DollarSign size={18} color="#F59E0B" />,
  },
  {
    id: "t6",
    category: "Scooter",
    title: "Benzin",
    description:
      "Lokale verkaufen Benzin in Flaschen für ~15k IDR/Liter. Tankstellen günstiger.",
    icon: <TrendingUp size={18} color="#10B981" />,
  },
];

// ==================== MAIN COMPONENT ====================
export default function TransportScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"rideshare" | "taxi" | "tips">(
    "rideshare",
  );

  // Ride-Share State
  const [rideShares, setRideShares] = useState<RideShare[]>(SAMPLE_RIDE_SHARES);
  const [selectedType, setSelectedType] = useState<"all" | "offer" | "request">(
    "all",
  );
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Post Ride State
  const [postType, setPostType] = useState<"offer" | "request">("offer");
  const [postFrom, setPostFrom] = useState("");
  const [postTo, setPostTo] = useState("");
  const [postDate, setPostDate] = useState("");
  const [postTime, setPostTime] = useState("");
  const [postSeats, setPostSeats] = useState("2");
  const [postPrice, setPostPrice] = useState("");
  const [postDescription, setPostDescription] = useState("");

  // Taxi Calculator State
  const [selectedRoute, setSelectedRoute] = useState<TaxiEstimate | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);

  // Filter ride shares
  const filteredRideShares = rideShares.filter((ride) => {
    const matchesType = selectedType === "all" || ride.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Post new ride
  const handlePostRide = () => {
    if (!postFrom || !postTo || !postDate || !postTime || !postPrice) {
      Alert.alert("Fehler", "Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    const newRide: RideShare = {
      id: `new_${Date.now()}`,
      type: postType,
      from: postFrom,
      to: postTo,
      date: postDate,
      time: postTime,
      seats: parseInt(postSeats),
      pricePerSeat: parseInt(postPrice),
      driver:
        postType === "offer"
          ? { name: "Du", rating: 0, verified: false, phone: "" }
          : undefined,
      description: postDescription,
      postedAt: "Gerade eben",
    };

    setRideShares([newRide, ...rideShares]);
    setShowPostModal(false);

    // Reset form
    setPostFrom("");
    setPostTo("");
    setPostDate("");
    setPostTime("");
    setPostSeats("2");
    setPostPrice("");
    setPostDescription("");

    Alert.alert("Erfolg", "Dein Eintrag wurde gepostet!");
  };

  // Contact driver/rider
  const handleContact = (ride: RideShare) => {
    if (ride.driver?.phone) {
      Alert.alert(
        `Kontakt: ${ride.driver.name}`,
        `Telefon: ${ride.driver.phone}\n\nSende eine WhatsApp-Nachricht oder rufe an.`,
        [
          { text: "Abbrechen", style: "cancel" },
          {
            text: "WhatsApp",
            onPress: () =>
              Linking.openURL(
                `https://wa.me/${ride.driver?.phone?.replace(/[^0-9+]/g, "")}`,
              ),
          },
          {
            text: "Anrufen",
            onPress: () => Linking.openURL(`tel:${ride.driver?.phone}`),
          },
        ],
      );
    } else {
      Alert.alert(
        "Info",
        "Schreibe eine Nachricht über die App (demnächst verfügbar).",
      );
    }
  };

  // Render Ride-Share Tab
  const renderRideShareTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚗 Ride-Share Matchmaking</Text>

      <View style={styles.rideshareInfo}>
        <Info size={20} color="#3B82F6" />
        <Text style={styles.rideshareInfoText}>
          Teile dir ein Taxi mit anderen Reisenden und spare Geld! Oder finde
          Mitfahrgelegenheiten für längere Strecken.
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Route suchen..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Type Filter */}
      <View style={styles.typeFilter}>
        <TouchableOpacity
          style={[
            styles.typeChip,
            selectedType === "all" && styles.typeChipActive,
          ]}
          onPress={() => setSelectedType("all")}
        >
          <Text
            style={[
              styles.typeText,
              selectedType === "all" && styles.typeTextActive,
            ]}
          >
            Alle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeChip,
            selectedType === "offer" && styles.typeChipActive,
          ]}
          onPress={() => setSelectedType("offer")}
        >
          <Text
            style={[
              styles.typeText,
              selectedType === "offer" && styles.typeTextActive,
            ]}
          >
            🟢 Angebote
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeChip,
            selectedType === "request" && styles.typeChipActive,
          ]}
          onPress={() => setSelectedType("request")}
        >
          <Text
            style={[
              styles.typeText,
              selectedType === "request" && styles.typeTextActive,
            ]}
          >
            🔴 Gesuche
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Button */}
      <TouchableOpacity
        style={styles.postButton}
        onPress={() => setShowPostModal(true)}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.postButtonText}>Eintrag erstellen</Text>
      </TouchableOpacity>

      {/* Ride Shares List */}
      {filteredRideShares.map((ride) => (
        <View
          key={ride.id}
          style={[
            styles.rideCard,
            ride.type === "offer" ? styles.offerCard : styles.requestCard,
          ]}
        >
          <View style={styles.rideHeader}>
            <View style={styles.rideTypeBadge}>
              <Text style={styles.rideTypeText}>
                {ride.type === "offer" ? "🟢 ANGEBOT" : "🔴 GESUCH"}
              </Text>
            </View>
            <Text style={styles.ridePostedAt}>{ride.postedAt}</Text>
          </View>

          <View style={styles.rideRoute}>
            <View style={styles.rideLocation}>
              <MapPin size={18} color="#00B4D8" />
              <Text style={styles.rideLocationText}>{ride.from}</Text>
            </View>
            <View style={styles.rideArrow}>
              <Navigation size={16} color="#64748B" />
            </View>
            <View style={styles.rideLocation}>
              <MapPin size={18} color="#EF4444" />
              <Text style={styles.rideLocationText}>{ride.to}</Text>
            </View>
          </View>

          <View style={styles.rideDetails}>
            <View style={styles.rideDetailItem}>
              <Calendar size={16} color="#64748B" />
              <Text style={styles.rideDetailText}>
                {new Date(ride.date).toLocaleDateString("de-DE")}
              </Text>
            </View>
            <View style={styles.rideDetailItem}>
              <Clock size={16} color="#64748B" />
              <Text style={styles.rideDetailText}>{ride.time} Uhr</Text>
            </View>
            <View style={styles.rideDetailItem}>
              <Users size={16} color="#64748B" />
              <Text style={styles.rideDetailText}>{ride.seats} Plätze</Text>
            </View>
            <View style={styles.rideDetailItem}>
              <DollarSign size={16} color="#10B981" />
              <Text style={[styles.rideDetailText, styles.ridePrice]}>
                Rp {ride.pricePerSeat}k / Person
              </Text>
            </View>
          </View>

          {ride.description && (
            <Text style={styles.rideDescription}>{ride.description}</Text>
          )}

          {ride.driver && (
            <View style={styles.driverInfo}>
              <View style={styles.driverHeader}>
                <Users size={16} color="#64748B" />
                <Text style={styles.driverName}>{ride.driver.name}</Text>
                {ride.driver.verified && (
                  <View style={styles.verifiedBadge}>
                    <Check size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
              {ride.driver.rating > 0 && (
                <View style={styles.driverRating}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.driverRatingText}>
                    {ride.driver.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContact(ride)}
          >
            <MessageCircle size={16} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Kontaktieren</Text>
          </TouchableOpacity>
        </View>
      ))}

      {filteredRideShares.length === 0 && (
        <View style={styles.emptyState}>
          <Car size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>Keine Einträge gefunden</Text>
        </View>
      )}
    </View>
  );

  // Render Taxi Calculator Tab
  const renderTaxiTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚕 Taxi Preisrechner</Text>

      <View style={styles.taxiInfo}>
        <Info size={20} color="#3B82F6" />
        <Text style={styles.taxiInfoText}>
          Vergleiche Preise zwischen Grab, Gojek und Bluebird Taxi. Alle Preise
          in EUR für typische Routen.
        </Text>
      </View>

      {/* Route Selector */}
      <TouchableOpacity
        style={styles.routeSelector}
        onPress={() => setShowRouteModal(true)}
      >
        <View style={styles.routeSelectorContent}>
          {selectedRoute ? (
            <>
              <Text style={styles.routeSelectorFrom}>{selectedRoute.from}</Text>
              <Navigation size={16} color="#64748B" />
              <Text style={styles.routeSelectorTo}>{selectedRoute.to}</Text>
            </>
          ) : (
            <Text style={styles.routeSelectorPlaceholder}>
              Route auswählen...
            </Text>
          )}
        </View>
        <ChevronDown size={20} color="#64748B" />
      </TouchableOpacity>

      {/* Price Comparison */}
      {!!selectedRoute && (
        <View style={styles.priceComparison}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonTitle}>Preisvergleich</Text>
            <View style={styles.comparisonSubheader}>
              <Text style={styles.comparisonDistance}>
                {selectedRoute.distance}
              </Text>
              <Text style={styles.comparisonDuration}>
                • {selectedRoute.duration}
              </Text>
            </View>
          </View>

          <View style={styles.priceCards}>
            <View style={[styles.priceCard, styles.gojekCard]}>
              <View style={styles.priceCardHeader}>
                <Text style={styles.priceCardName}>Gojek</Text>
                <Text style={styles.priceCardBadge}>Günstigster</Text>
              </View>
              <Text style={styles.priceCardValue}>
                € {selectedRoute.gojekPrice}
              </Text>
              <Text style={styles.priceCardLocal}>
                ~Rp {(selectedRoute.gojekPrice * 16800).toLocaleString()}
              </Text>
            </View>

            <View style={[styles.priceCard, styles.grabCard]}>
              <View style={styles.priceCardHeader}>
                <Text style={styles.priceCardName}>Grab</Text>
              </View>
              <Text style={styles.priceCardValue}>
                € {selectedRoute.grabPrice}
              </Text>
              <Text style={styles.priceCardLocal}>
                ~Rp {(selectedRoute.grabPrice * 16800).toLocaleString()}
              </Text>
            </View>

            <View style={[styles.priceCard, styles.bluebirdCard]}>
              <View style={styles.priceCardHeader}>
                <Text style={styles.priceCardName}>Bluebird</Text>
                <Text style={styles.priceCardNote}>Meter</Text>
              </View>
              <Text style={styles.priceCardValue}>
                € {selectedRoute.bluebirdPrice}
              </Text>
              <Text style={styles.priceCardLocal}>
                ~Rp {(selectedRoute.bluebirdPrice * 16800).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.savingsInfo}>
            <TrendingUp size={16} color="#10B981" />
            <Text style={styles.savingsText}>
              Spare €{selectedRoute.bluebirdPrice - selectedRoute.gojekPrice}{" "}
              mit Gojek vs. Bluebird
            </Text>
          </View>
        </View>
      )}

      {/* Popular Routes */}
      <Text style={styles.subsectionTitle}>Beliebte Routen</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.popularRoutes}>
          {POPULAR_ROUTES.map((route, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.popularRouteChip,
                selectedRoute === route && styles.popularRouteChipActive,
              ]}
              onPress={() => {
                setSelectedRoute(route);
                setShowRouteModal(false);
              }}
            >
              <Text style={styles.popularRouteFrom}>{route.from}</Text>
              <Navigation size={12} color="#64748B" />
              <Text style={styles.popularRouteTo}>{route.to}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Taxi Tips */}
      <View style={styles.taxiTipsCard}>
        <Text style={styles.taxiTipsTitle}>💡 Taxi-Tipps</Text>
        {TRANSPORT_TIPS.filter((t) => t.category.includes("Taxi")).map(
          (tip) => (
            <View key={tip.id} style={styles.tipItem}>
              {tip.icon}
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ),
        )}
      </View>
    </View>
  );

  // Render Tips Tab
  const renderTipsTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📋 Transport-Tipps</Text>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tipsCategoryFilter}
      >
        {["Alle", "Grab/Gojek", "Taxi", "Scooter", "Allgemein"].map((cat) => (
          <TouchableOpacity key={cat} style={styles.tipsCategoryChip}>
            <Text style={styles.tipsCategoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tips List */}
      {TRANSPORT_TIPS.map((tip) => (
        <View key={tip.id} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipIconContainer}>{tip.icon}</View>
            <View style={styles.tipInfo}>
              <Text style={styles.tipCategory}>{tip.category}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
            </View>
          </View>
          <Text style={styles.tipDescription}>{tip.description}</Text>
        </View>
      ))}

      {/* Emergency Info */}
      <View style={styles.emergencyCard}>
        <AlertTriangle size={24} color="#EF4444" />
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Wichtige Nummern</Text>
          <Text style={styles.emergencyNumber}>🚑 Krankenwagen: 118</Text>
          <Text style={styles.emergencyNumber}>👮 Polizei: 110</Text>
          <Text style={styles.emergencyNumber}>🚒 Feuerwehr: 113</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header
          title={t("transport.title", "Transport")}
          showBackButton={false}
        />

        {/* Tabs */}
        <AnimatedView animation="fadeIn" delay={100}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "rideshare" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("rideshare")}
            >
              <Car
                size={20}
                color={activeTab === "rideshare" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "rideshare" && styles.tabTextActive,
                ]}
              >
                Ride-Share
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "taxi" && styles.tabActive]}
              onPress={() => setActiveTab("taxi")}
            >
              <DollarSign
                size={20}
                color={activeTab === "taxi" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "taxi" && styles.tabTextActive,
                ]}
              >
                Taxi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "tips" && styles.tabActive]}
              onPress={() => setActiveTab("tips")}
            >
              <Info
                size={20}
                color={activeTab === "tips" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "tips" && styles.tabTextActive,
                ]}
              >
                Tipps
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "ios" ? 140 : 120,
          }}
        >
          {activeTab === "rideshare" && renderRideShareTab()}
          {activeTab === "taxi" && renderTaxiTab()}
          {activeTab === "tips" && renderTipsTab()}
        </ScrollView>

        {/* Post Ride Modal */}
        <Modal
          visible={showPostModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPostModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Eintrag erstellen</Text>
                <TouchableOpacity onPress={() => setShowPostModal(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Type Selector */}
              <View style={styles.modalTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.modalTypeChip,
                    postType === "offer" && styles.modalTypeChipActive,
                  ]}
                  onPress={() => setPostType("offer")}
                >
                  <Text
                    style={[
                      styles.modalTypeText,
                      postType === "offer" && styles.modalTypeTextActive,
                    ]}
                  >
                    🟢 Angebot (Ich fahre)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalTypeChip,
                    postType === "request" && styles.modalTypeChipActive,
                  ]}
                  onPress={() => setPostType("request")}
                >
                  <Text
                    style={[
                      styles.modalTypeText,
                      postType === "request" && styles.modalTypeTextActive,
                    ]}
                  >
                    🔴 Gesuch (Ich suche)
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalLabel}>Von *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Startort..."
                  placeholderTextColor="#94A3B8"
                  value={postFrom}
                  onChangeText={setPostFrom}
                />

                <Text style={styles.modalLabel}>Nach *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Zielort..."
                  placeholderTextColor="#94A3B8"
                  value={postTo}
                  onChangeText={setPostTo}
                />

                <View style={styles.modalRow}>
                  <View style={styles.modalHalf}>
                    <Text style={styles.modalLabel}>Datum *</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94A3B8"
                      value={postDate}
                      onChangeText={setPostDate}
                    />
                  </View>
                  <View style={styles.modalHalf}>
                    <Text style={styles.modalLabel}>Uhrzeit *</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="HH:MM"
                      placeholderTextColor="#94A3B8"
                      value={postTime}
                      onChangeText={setPostTime}
                    />
                  </View>
                </View>

                <View style={styles.modalRow}>
                  <View style={styles.modalHalf}>
                    <Text style={styles.modalLabel}>Plätze</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="2"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={postSeats}
                      onChangeText={setPostSeats}
                    />
                  </View>
                  <View style={styles.modalHalf}>
                    <Text style={styles.modalLabel}>
                      Preis pro Platz (k IDR) *
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="50"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={postPrice}
                      onChangeText={setPostPrice}
                    />
                  </View>
                </View>

                <Text style={styles.modalLabel}>Beschreibung</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextarea]}
                  placeholder="Optionale Details..."
                  placeholderTextColor="#94A3B8"
                  value={postDescription}
                  onChangeText={setPostDescription}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handlePostRide}
                >
                  <Text style={styles.modalButtonText}>Veröffentlichen</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Route Selector Modal */}
        <Modal
          visible={showRouteModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRouteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Route auswählen</Text>
                <TouchableOpacity onPress={() => setShowRouteModal(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.routeList}>
                {POPULAR_ROUTES.map((route, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.routeListItem}
                    onPress={() => {
                      setSelectedRoute(route);
                      setShowRouteModal(false);
                    }}
                  >
                    <View style={styles.routeListItemContent}>
                      <Text style={styles.routeListItemFrom}>{route.from}</Text>
                      <Navigation size={14} color="#64748B" />
                      <Text style={styles.routeListItemTo}>{route.to}</Text>
                    </View>
                    <Text style={styles.routeListItemMeta}>
                      {route.distance} • {route.duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226,232,240,0.5)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  tabActive: { backgroundColor: "#00B4D8" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  tabTextActive: { color: "#FFFFFF" },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 12,
    marginTop: 16,
  },

  // Info Cards
  rideshareInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rideshareInfoText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
    lineHeight: 18,
  },
  taxiInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  taxiInfoText: { fontSize: 13, color: "#475569", flex: 1, lineHeight: 18 },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#0F172A" },

  // Type Filter
  typeFilter: { flexDirection: "row", gap: 8, marginBottom: 12 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  typeChipActive: { backgroundColor: "#00B4D8", borderColor: "#00B4D8" },
  typeText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  typeTextActive: { color: "#FFFFFF" },

  // Post Button
  postButton: {
    flexDirection: "row",
    backgroundColor: "#FF9D6C",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    elevation: 4,
  },
  postButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },

  // Ride Card
  rideCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  offerCard: { borderColor: "rgba(16,185,129,0.3)" },
  requestCard: { borderColor: "rgba(239,68,68,0.3)" },
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  rideTypeBadge: {
    backgroundColor: "rgba(0,180,216,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rideTypeText: { fontSize: 11, fontWeight: "700", color: "#00B4D8" },
  ridePostedAt: { fontSize: 11, color: "#94A3B8" },
  rideRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  rideLocation: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  rideLocationText: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  rideArrow: { padding: 4 },
  rideDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  rideDetailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  rideDetailText: { fontSize: 12, color: "#64748B" },
  ridePrice: { color: "#10B981", fontWeight: "600" },
  rideDescription: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 10,
  },
  driverInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  driverHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  driverName: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  verifiedBadge: {
    backgroundColor: "#10B981",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  driverRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  driverRatingText: { fontSize: 12, fontWeight: "600", color: "#F59E0B" },
  contactButton: {
    flexDirection: "row",
    backgroundColor: "#FF9D6C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.12)",
    elevation: 3,
  },
  contactButtonText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  // Empty State
  emptyState: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 14, color: "#64748B", marginTop: 8 },

  // Route Selector
  routeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  routeSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  routeSelectorFrom: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  routeSelectorTo: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  routeSelectorPlaceholder: { fontSize: 14, color: "#94A3B8" },

  // Price Comparison
  priceComparison: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  comparisonHeader: { marginBottom: 12 },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  comparisonSubheader: { flexDirection: "row", gap: 8 },
  comparisonDistance: { fontSize: 13, color: "#64748B" },
  comparisonDuration: { fontSize: 13, color: "#64748B" },
  priceCards: { gap: 10, marginBottom: 12 },
  priceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  gojekCard: { backgroundColor: "rgba(34,197,94,0.1)", borderColor: "#22C55E" },
  grabCard: { backgroundColor: "rgba(0,0,0,0.05)", borderColor: "#000000" },
  bluebirdCard: {
    backgroundColor: "rgba(59,130,246,0.1)",
    borderColor: "#3B82F6",
  },
  priceCardHeader: { flex: 1 },
  priceCardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  priceCardBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  priceCardBadgeText: { fontSize: 9, fontWeight: "700", color: "#FFFFFF" },
  priceCardNote: { fontSize: 11, color: "#64748B" },
  priceCardValue: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  priceCardLocal: { fontSize: 11, color: "#64748B" },
  savingsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,185,129,0.1)",
    padding: 10,
    borderRadius: 10,
  },
  savingsText: { fontSize: 13, color: "#475569", flex: 1 },

  // Popular Routes
  popularRoutes: { flexDirection: "row", gap: 8 },
  popularRouteChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  popularRouteChipActive: {
    backgroundColor: "#00B4D8",
    borderColor: "#00B4D8",
  },
  popularRouteFrom: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  popularRouteTo: { fontSize: 12, fontWeight: "600", color: "#0F172A" },

  // Taxi Tips
  taxiTipsCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    padding: 16,
  },
  taxiTipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  tipItem: { flexDirection: "row", gap: 10, marginBottom: 12 },
  tipContent: { flex: 1 },
  tipInfo: { flex: 1 },
  tipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  tipDescription: { fontSize: 12, color: "#475569", lineHeight: 16 },

  // Tips Tab
  tipsCategoryFilter: { marginBottom: 12 },
  tipsCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tipsCategoryText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  tipCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipHeader: { flexDirection: "row", gap: 10, marginBottom: 8 },
  tipIconContainer: {
    backgroundColor: "rgba(0,180,216,0.1)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  tipCategory: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  emergencyInfo: { flex: 1 },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  emergencyNumber: { fontSize: 13, color: "#475569", marginBottom: 2 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  modalTypeSelector: { flexDirection: "row", gap: 8, marginBottom: 16 },
  modalTypeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  modalTypeChipActive: { backgroundColor: "#10B981" },
  modalTypeText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  modalTypeTextActive: { color: "#FFFFFF" },
  modalScroll: { maxHeight: 400 },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  modalTextarea: { minHeight: 80, textAlignVertical: "top" },
  modalRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  modalHalf: { flex: 1 },
  modalButton: {
    backgroundColor: "#00B4D8",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },

  // Route List Modal
  routeList: { maxHeight: 300 },
  routeListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  routeListItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  routeListItemFrom: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  routeListItemTo: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  routeListItemMeta: { fontSize: 12, color: "#64748B" },
});
