import * as ImagePicker from "expo-image-picker";
import {
  AlertTriangle,
  Backpack,
  Bike,
  Book,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  Copy,
  CreditCard,
  DollarSign,
  Info,
  Languages,
  PartyPopper,
  Pill,
  Plane,
  Plus,
  Scale,
  Search,
  Shield,
  Smartphone,
  Square,
  Sun,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
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
import { createWorker } from "tesseract.js";

import Header from "../../components/Header";
import { Chip, ListLink, AnimatedView } from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";

// ==================== TYPES ====================
interface PackingItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  essential: boolean;
}

interface VisaInfo {
  type: string;
  duration: string;
  price: string;
  extension: string;
  penalty: string;
}

interface LawItem {
  id: string;
  category: string;
  title: string;
  description: string;
  penalty: string;
  icon: React.ReactNode;
}

interface OdalanEvent {
  id: string;
  name: string;
  date: string;
  description: string;
}

interface DictionaryEntry {
  id: string;
  indonesian: string;
  german: string;
  pronunciation: string;
  category: string;
}

// ==================== CONSTANTS ====================
const PACKING_CATEGORIES = [
  { id: "essentials", name: "Essentials", icon: Shield, color: "#EF4444" },
  { id: "clothing", name: "Kleidung", icon: Smartphone, color: "#3B82F6" },
  { id: "health", name: "Gesundheit", icon: Pill, color: "#10B981" },
  { id: "documents", name: "Dokumente", icon: Book, color: "#F59E0B" },
  { id: "beach", name: "Strand", icon: Sun, color: "#EC4899" },
];

const DEFAULT_PACKING_ITEMS: PackingItem[] = [
  {
    id: "p1",
    name: "Reisepass (6+ Monate gültig)",
    category: "essentials",
    checked: false,
    essential: true,
  },
  {
    id: "p2",
    name: "Visum (eVOA/VoA)",
    category: "essentials",
    checked: false,
    essential: true,
  },
  {
    id: "p3",
    name: "Flugtickets (Hin/Rück)",
    category: "essentials",
    checked: false,
    essential: true,
  },
  {
    id: "p4",
    name: "Reiseversicherung",
    category: "essentials",
    checked: false,
    essential: true,
  },
  {
    id: "p5",
    name: "Geld/Kreditkarten",
    category: "essentials",
    checked: false,
    essential: true,
  },
  {
    id: "p6",
    name: "Handy + Ladekabel",
    category: "essentials",
    checked: false,
    essential: true,
  },
  {
    id: "p7",
    name: "Leichte T-Shirts (5-7)",
    category: "clothing",
    checked: false,
    essential: false,
  },
  {
    id: "p8",
    name: "Shorts (3-4)",
    category: "clothing",
    checked: false,
    essential: false,
  },
  {
    id: "p9",
    name: "Lange Hose (Tempel!)",
    category: "clothing",
    checked: false,
    essential: true,
  },
  {
    id: "p10",
    name: "Sarong (Tempel)",
    category: "clothing",
    checked: false,
    essential: true,
  },
  {
    id: "p11",
    name: "Badekleidung (3x)",
    category: "clothing",
    checked: false,
    essential: false,
  },
  {
    id: "p12",
    name: "Sonnencreme (hoher LSF)",
    category: "health",
    checked: false,
    essential: true,
  },
  {
    id: "p13",
    name: "Insektenschutz (DEET)",
    category: "health",
    checked: false,
    essential: true,
  },
  {
    id: "p14",
    name: "Reiseapotheke",
    category: "health",
    checked: false,
    essential: true,
  },
  {
    id: "p15",
    name: "Führerschein (intl.)",
    category: "documents",
    checked: false,
    essential: true,
  },
  {
    id: "p16",
    name: "Dokumenten-Kopien",
    category: "documents",
    checked: false,
    essential: true,
  },
  {
    id: "p17",
    name: "Sonnenbrille",
    category: "beach",
    checked: false,
    essential: false,
  },
  {
    id: "p18",
    name: "Wasserschuhe",
    category: "beach",
    checked: false,
    essential: false,
  },
];

const VISA_INFO: VisaInfo[] = [
  {
    type: "eVOA",
    duration: "30 Tage",
    price: "500k IDR",
    extension: "1x 30 Tage",
    penalty: "1M IDR/Tag",
  },
  {
    type: "VoA",
    duration: "30 Tage",
    price: "500k IDR",
    extension: "1x 30 Tage",
    penalty: "1M IDR/Tag",
  },
  {
    type: "B211A",
    duration: "60 Tage",
    price: "~1.5M IDR",
    extension: "2x 60 Tage",
    penalty: "1M IDR/Tag",
  },
  {
    type: "Visa-Free",
    duration: "30 Tage",
    price: "Kostenlos",
    extension: "NICHT verlängerbar",
    penalty: "1M IDR/Tag",
  },
];

const LAW_ITEMS: LawItem[] = [
  {
    id: "l1",
    category: "Drogen",
    title: "Drogenbesitz/-handel",
    description:
      "Extrem strenge Gesetze. Bereits geringe Mengen können zu lebenslanger Haft oder Todesstrafe führen.",
    penalty: "Todesstrafe/Lebenslang",
    icon: <AlertTriangle size={20} color="#EF4444" />,
  },
  {
    id: "l2",
    category: "Scooter",
    title: "Fahren ohne Helm",
    description:
      "Helmpflicht für Fahrer und Beifahrer. Regelmäßige Polizeikontrollen.",
    penalty: "500k IDR Strafe",
    icon: <Bike size={20} color="#F59E0B" />,
  },
  {
    id: "l3",
    category: "Scooter",
    title: "Ohne intl. Führerschein",
    description:
      "Internationaler Führerschein mit Motorrad-Klasse ist PFLICHT.",
    penalty: "500k-1M IDR Strafe",
    icon: <CreditCard size={20} color="#F59E0B" />,
  },
  {
    id: "l4",
    category: "Tempel",
    title: "Kleidungsvorschriften",
    description: "Schultern und Knie bedecken. Sarong ist Pflicht.",
    penalty: "Zutritt verweigert",
    icon: <BookOpen size={20} color="#8B5CF6" />,
  },
  {
    id: "l5",
    category: "Allgemein",
    title: "Touristen-Steuer",
    description: "150.000 IDR pro Person bei Einreise nach Bali.",
    penalty: "Muss gezahlt werden",
    icon: <DollarSign size={20} color="#10B981" />,
  },
  {
    id: "l6",
    category: "Allgemein",
    title: "Linke Hand Tabu",
    description:
      "Linke Hand gilt als unrein. Nicht zum Geben/Nehmen verwenden.",
    penalty: "Als unhöflich empfunden",
    icon: <Info size={20} color="#6B7280" />,
  },
];

const ODALAN_EVENTS: OdalanEvent[] = [
  {
    id: "o1",
    name: "🇮🇩 NYEPI (Tag der Stille)",
    date: "19. März 2026",
    description:
      "WICHTIGSTER FEIERTAG! 24h komplette Stille. Kein Verlassen des Hotels, kein WLAN, kein Licht, kein Verkehr. Flughafen geschlossen!",
  },
  {
    id: "o2",
    name: "Galungan",
    date: "21. April 2026",
    description:
      "Sieg des Dharma über Adharma. Straßen mit Penjor (Bambus-Stangen) geschmückt.",
  },
  {
    id: "o3",
    name: "Kuningan",
    date: "1. Mai 2026",
    description: "10 Tage nach Galungan. Ahnen kehren in den Himmel zurück.",
  },
  {
    id: "o4",
    name: "Tawur Kesanga",
    date: "18. März 2026",
    description:
      "Tag VOR Nyepi. Große Paraden mit Ogoh-Ogoh (Dämonen-Figuren).",
  },
  {
    id: "o5",
    name: "Purnama (Vollmond)",
    date: "Alle Vollmondtage",
    description: "Vollmond-Feiertag. Viele Balinesen besuchen Tempel.",
  },
];

const DICTIONARY_ENTRIES: DictionaryEntry[] = [
  {
    id: "d1",
    indonesian: "Selamat pagi",
    german: "Guten Morgen",
    pronunciation: "se-la-mat pa-gi",
    category: "Begrüßung",
  },
  {
    id: "d2",
    indonesian: "Selamat siang",
    german: "Guten Tag",
    pronunciation: "se-la-mat si-ang",
    category: "Begrüßung",
  },
  {
    id: "d3",
    indonesian: "Selamat malam",
    german: "Guten Abend",
    pronunciation: "se-la-mat ma-lam",
    category: "Begrüßung",
  },
  {
    id: "d4",
    indonesian: "Terima kasih",
    german: "Danke",
    pronunciation: "te-ri-ma ka-sih",
    category: "Höflichkeit",
  },
  {
    id: "d5",
    indonesian: "Sama-sama",
    german: "Bitte (Antwort)",
    pronunciation: "sa-ma sa-ma",
    category: "Höflichkeit",
  },
  {
    id: "d6",
    indonesian: "Maaf",
    german: "Entschuldigung",
    pronunciation: "ma-af",
    category: "Höflichkeit",
  },
  {
    id: "d7",
    indonesian: "Ya",
    german: "Ja",
    pronunciation: "ya",
    category: "Basis",
  },
  {
    id: "d8",
    indonesian: "Tidak",
    german: "Nein",
    pronunciation: "ti-dak",
    category: "Basis",
  },
  {
    id: "d9",
    indonesian: "Bisa",
    german: "Können",
    pronunciation: "bi-sa",
    category: "Basis",
  },
  {
    id: "d10",
    indonesian: "Mau",
    german: "Wollen",
    pronunciation: "ma-u",
    category: "Basis",
  },
  {
    id: "d11",
    indonesian: "Berapa?",
    german: "Wie viel?",
    pronunciation: "be-ra-pa",
    category: "Shopping",
  },
  {
    id: "d12",
    indonesian: "Terlalu mahal",
    german: "Zu teuer",
    pronunciation: "ter-la-lu ma-hal",
    category: "Shopping",
  },
  {
    id: "d13",
    indonesian: "Bisa kurang?",
    german: "Rabatt möglich?",
    pronunciation: "bi-sa ku-rang",
    category: "Shopping",
  },
  {
    id: "d14",
    indonesian: "Makan",
    german: "Essen",
    pronunciation: "ma-kan",
    category: "Essen",
  },
  {
    id: "d15",
    indonesian: "Minum",
    german: "Trinken",
    pronunciation: "mi-num",
    category: "Essen",
  },
  {
    id: "d16",
    indonesian: "Enak",
    german: "Lecker",
    pronunciation: "e-nak",
    category: "Essen",
  },
  {
    id: "d17",
    indonesian: "Pedas",
    german: "Scharf",
    pronunciation: "pe-das",
    category: "Essen",
  },
  {
    id: "d18",
    indonesian: "Tidak pedas",
    german: "Nicht scharf",
    pronunciation: "ti-dak pe-das",
    category: "Essen",
  },
  {
    id: "d19",
    indonesian: "Bill",
    german: "Rechnung",
    pronunciation: "bon",
    category: "Essen",
  },
  {
    id: "d20",
    indonesian: "Di mana?",
    german: "Wo ist?",
    pronunciation: "di ma-na",
    category: "Weg",
  },
  {
    id: "d21",
    indonesian: "Kiri",
    german: "Links",
    pronunciation: "ki-ri",
    category: "Weg",
  },
  {
    id: "d22",
    indonesian: "Kanan",
    german: "Rechts",
    pronunciation: "ka-nan",
    category: "Weg",
  },
  {
    id: "d23",
    indonesian: "Lurus",
    german: "Geradeaus",
    pronunciation: "lu-rus",
    category: "Weg",
  },
  {
    id: "d24",
    indonesian: "Tolong!",
    german: "Hilfe!",
    pronunciation: "to-long",
    category: "Notfall",
  },
  {
    id: "d25",
    indonesian: "Sakit",
    german: "Krank/Schmerz",
    pronunciation: "sa-kit",
    category: "Notfall",
  },
  {
    id: "d26",
    indonesian: "Rumah sakit",
    german: "Krankenhaus",
    pronunciation: "ru-mah sa-kit",
    category: "Notfall",
  },
];

// ==================== MAIN COMPONENT ====================
export default function SurvivalScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "packing" | "visa" | "laws" | "odalan" | "scanner" | "dictionary"
  >("packing");

  // Packing List State
  const [packingItems, setPackingItems] = useState<PackingItem[]>(
    DEFAULT_PACKING_ITEMS,
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("essentials");
  const [newItemEssential, setNewItemEssential] = useState(false);

  // Visa Tracker State
  const [arrivalDate, setArrivalDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [visaType, setVisaType] = useState<string>("eVOA");

  // OCR Scanner State
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState(false);

  // Dictionary State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDictCategory, setSelectedDictCategory] =
    useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Laws State
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);
  const [selectedLawCategory, setSelectedLawCategory] = useState<string>("all");

  // Calculate visa days
  const calculateVisaDays = () => {
    const arrival = new Date(arrivalDate);
    const today = new Date();
    let duration = 30;
    if (visaType === "B211A") duration = 60;

    const daysPassed = Math.floor(
      (today.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysRemaining = duration - daysPassed;
    const expiryDate = new Date(arrival);
    expiryDate.setDate(expiryDate.getDate() + duration);

    return {
      daysPassed,
      daysRemaining,
      expiryDate: expiryDate.toLocaleDateString("de-DE"),
      isOverstaying: daysRemaining < 0,
      penalty: Math.max(0, -daysRemaining) * 1000000,
    };
  };

  const visaDays = calculateVisaDays();

  // Toggle packing item
  const togglePackingItem = (id: string) => {
    setPackingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  // Add packing item
  const addPackingItem = () => {
    if (newItemName.trim()) {
      setPackingItems((prev) => [
        ...prev,
        {
          id: `custom_${Date.now()}`,
          name: newItemName.trim(),
          category: newItemCategory,
          checked: false,
          essential: newItemEssential,
        },
      ]);
      setNewItemName("");
      setShowAddItemModal(false);
    }
  };

  // Delete packing item
  const deletePackingItem = (id: string) => {
    setPackingItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Packing progress
  const packingProgress = () => {
    const total = packingItems.length;
    const checked = packingItems.filter((item) => item.checked).length;
    return Math.round((checked / total) * 100);
  };

  // OCR Photo
  const takePhotoForOCR = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Berechtigung erforderlich",
          "Kamerazugriff ist erforderlich.",
        );
        return;
      }

      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment";
        input.onchange = (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setOcrImage(event.target.result as string);
                performOCR(event.target.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled && result.assets[0]) {
          setOcrImage(result.assets[0].uri);
          performOCR(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  // Perform OCR
  const performOCR = async (imageUri: string) => {
    setOcrLoading(true);
    setOcrText("");
    try {
      const worker = await createWorker("eng+ind");
      const ret = await worker.recognize(imageUri);
      setOcrText(ret.data.text);
      await worker.terminate();
    } catch (error) {
      console.error("OCR error:", error);
      Alert.alert("OCR Fehler", "Texterkennung fehlgeschlagen.");
    } finally {
      setOcrLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, id: string) => {
    if (Platform.OS === "web") navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter dictionary
  const filteredDictionary = DICTIONARY_ENTRIES.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.indonesian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.german.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedDictCategory === "all" || entry.category === selectedDictCategory;
    return matchesSearch && matchesCategory;
  });

  const dictionaryCategories = [
    "all",
    ...new Set(DICTIONARY_ENTRIES.map((e) => e.category)),
  ];

  // Filter packing items
  const filteredPackingItems =
    selectedCategory === "all"
      ? packingItems
      : packingItems.filter((item) => item.category === selectedCategory);

  // Filter laws
  const lawCategories = ["all", ...new Set(LAW_ITEMS.map((l) => l.category))];
  const filteredLaws =
    selectedLawCategory === "all"
      ? LAW_ITEMS
      : LAW_ITEMS.filter((l) => l.category === selectedLawCategory);

  // ==================== RENDER FUNCTIONS ====================

  const renderPackingTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎒 Packing List</Text>

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Fortschritt</Text>
          <Text style={styles.progressValue}>{packingProgress()}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${packingProgress()}%` }]}
          />
        </View>
      </View>

      {/* Weather Tips */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <Cloud size={20} color="#3B82F6" />
          <Text style={styles.weatherTitle}>Wetter-Tipps</Text>
        </View>
        <Text style={styles.weatherTip}>
          ☀️ Tropisch: 30-35°C, hohe Luftfeuchtigkeit
        </Text>
        <Text style={styles.weatherTip}>
          💧 Regenzeit (Nov-Mär): Regenschutz
        </Text>
        <Text style={styles.weatherTip}>
          🔥 UV-Index hoch: Sonnencreme PFLICHT
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === "all" && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === "all" && styles.categoryChipTextActive,
            ]}
          >
            Alle
          </Text>
        </TouchableOpacity>
        {PACKING_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <cat.icon
              size={16}
              color={selectedCategory === cat.id ? "#FFFFFF" : "#64748B"}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Item */}
      <TouchableOpacity
        style={styles.addItemButton}
        onPress={() => setShowAddItemModal(true)}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addItemButtonText}>Item hinzufügen</Text>
      </TouchableOpacity>

      {/* Items List */}
      {filteredPackingItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.packingItem,
            item.checked && styles.packingItemChecked,
            item.essential && styles.packingItemEssential,
          ]}
          onPress={() => togglePackingItem(item.id)}
        >
          <View style={styles.packingItemLeft}>
            {item.checked ? (
              <CheckSquare size={22} color="#10B981" />
            ) : (
              <Square size={22} color="#CBD5E1" />
            )}
            <Text
              style={[
                styles.packingItemName,
                item.checked && styles.packingItemNameChecked,
              ]}
            >
              {item.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteItemButton}
            onPress={() => deletePackingItem(item.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Essential Reminder */}
      {packingItems.filter((i) => i.essential && !i.checked).length > 0 && (
        <View style={styles.essentialReminder}>
          <AlertTriangle size={18} color="#F59E0B" />
          <Text style={styles.essentialReminderText}>
            {packingItems.filter((i) => i.essential && !i.checked).length}{" "}
            essentielle Items noch offen!
          </Text>
        </View>
      )}
    </View>
  );

  const renderVisaTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🛂 Visa Tracker</Text>

      {/* Status Card */}
      <View
        style={[
          styles.visaStatusCard,
          visaDays.isOverstaying ? styles.overstayCard : styles.validCard,
        ]}
      >
        <View style={styles.visaStatusHeader}>
          {visaDays.isOverstaying ? (
            <AlertTriangle size={32} color="#EF4444" />
          ) : (
            <CheckSquare size={32} color="#10B981" />
          )}
          <View style={styles.visaStatusInfo}>
            <Text style={styles.visaStatusTitle}>
              {visaDays.isOverstaying ? "⚠️ ÜBERZOGEN!" : "✅ Gültig"}
            </Text>
            <Text style={styles.visaStatusSubtitle}>
              {visaDays.isOverstaying
                ? `${Math.abs(visaDays.daysRemaining)} Tage überzogen`
                : `${visaDays.daysRemaining} Tage verbleibend`}
            </Text>
          </View>
        </View>
        {visaDays.isOverstaying && (
          <View style={styles.penaltyBox}>
            <DollarSign size={20} color="#EF4444" />
            <Text style={styles.penaltyText}>
              Strafe: Rp {visaDays.penalty.toLocaleString("de-DE")} IDR
            </Text>
          </View>
        )}
      </View>

      {/* Input */}
      <View style={styles.visaInputCard}>
        <Text style={styles.inputLabel}>Ankunftsdatum</Text>
        <TextInput
          style={styles.dateInput}
          value={arrivalDate}
          onChangeText={setArrivalDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
        />

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Visum-Typ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.visaTypeSelector}>
            {["eVOA", "VoA", "B211A", "Visa-Free"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.visaTypeChip,
                  visaType === type && styles.visaTypeChipActive,
                ]}
                onPress={() => setVisaType(type)}
              >
                <Text
                  style={[
                    styles.visaTypeText,
                    visaType === type && styles.visaTypeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Visa Info */}
      <Text style={styles.subsectionTitle}>Visum-Optionen</Text>
      {VISA_INFO.map((visa, index) => (
        <View key={index} style={styles.visaInfoCard}>
          <Text style={styles.visaInfoType}>{visa.type}</Text>
          <View style={styles.visaInfoGrid}>
            <View style={styles.visaInfoItem}>
              <Clock size={16} color="#64748B" />
              <Text style={styles.visaInfoLabel}>Dauer:</Text>
              <Text style={styles.visaInfoValue}>{visa.duration}</Text>
            </View>
            <View style={styles.visaInfoItem}>
              <DollarSign size={16} color="#10B981" />
              <Text style={styles.visaInfoLabel}>Preis:</Text>
              <Text style={styles.visaInfoValue}>{visa.price}</Text>
            </View>
            <View style={styles.visaInfoItem}>
              <Calendar size={16} color="#8B5CF6" />
              <Text style={styles.visaInfoLabel}>Verlängerung:</Text>
              <Text style={styles.visaInfoValue}>{visa.extension}</Text>
            </View>
            <View style={styles.visaInfoItem}>
              <AlertTriangle size={16} color="#EF4444" />
              <Text style={styles.visaInfoLabel}>Strafe:</Text>
              <Text style={[styles.visaInfoValue, styles.penaltyValue]}>
                {visa.penalty}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLawsTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚖️ Gesetze & Etikette</Text>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedLawCategory === "all" && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedLawCategory("all")}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedLawCategory === "all" && styles.categoryChipTextActive,
            ]}
          >
            Alle
          </Text>
        </TouchableOpacity>
        {lawCategories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedLawCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedLawCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedLawCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Warning Card */}
      <View style={styles.warningCard}>
        <AlertTriangle size={32} color="#EF4444" />
        <Text style={styles.warningTitle}>ACHTUNG!</Text>
        <Text style={styles.warningText}>
          Indonesien hat extrem strenge Gesetze. Unwissenheit schützt vor Strafe
          nicht!
        </Text>
      </View>

      {/* Laws List */}
      {filteredLaws.map((law) => (
        <View key={law.id} style={styles.lawCard}>
          <TouchableOpacity
            style={styles.lawHeader}
            onPress={() =>
              setExpandedLaw(expandedLaw === law.id ? null : law.id)
            }
          >
            <View style={styles.lawTitleRow}>
              {law.icon}
              <Text style={styles.lawTitle}>{law.title}</Text>
            </View>
            {expandedLaw === law.id ? (
              <ChevronUp size={20} color="#64748B" />
            ) : (
              <ChevronDown size={20} color="#64748B" />
            )}
          </TouchableOpacity>

          {expandedLaw === law.id && (
            <View style={styles.lawDetails}>
              <Text style={styles.lawCategory}>{law.category}</Text>
              <Text style={styles.lawDescription}>{law.description}</Text>
              <View style={styles.penaltyRow}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={styles.lawPenalty}>Strafe: {law.penalty}</Text>
              </View>
            </View>
          )}
        </View>
      ))}

      {/* Tourist Tax Info */}
      <View style={styles.touristTaxCard}>
        <Info size={20} color="#3B82F6" />
        <Text style={styles.touristTaxTitle}>Touristen-Steuer</Text>
        <Text style={styles.touristTaxText}>
          Seit 2024: 150.000 IDR pro Person bei Einreise nach Bali. Online im
          Voraus zahlen unter: lovebali.baliprov.go.id
        </Text>
      </View>
    </View>
  );

  const renderOdalanTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📅 Odalan Kalender</Text>

      {/* Nyepi Warning */}
      <View style={styles.nyepiCard}>
        <View style={styles.nyepiHeader}>
          <PartyPopper size={32} color="#EF4444" />
          <Text style={styles.nyepiTitle}>NYEPI 2026</Text>
        </View>
        <Text style={styles.nyepiDate}>19. März 2026</Text>
        <View style={styles.nyepiRules}>
          <Text style={styles.nyepiRule}>🚫 Hotel nicht verlassen</Text>
          <Text style={styles.nyepiRule}>📱 Kein WLAN/Internet</Text>
          <Text style={styles.nyepiRule}>💡 Kein Licht</Text>
          <Text style={styles.nyepiRule}>✈️ Flughafen geschlossen</Text>
          <Text style={styles.nyepiRule}>🏖️ Strände geschlossen</Text>
        </View>
        <Text style={styles.nyepiHint}>
          Tipp: Mindestens 2 Tage vorher/nachher einplanen!
        </Text>
      </View>

      {/* Events List */}
      <Text style={styles.subsectionTitle}>Weitere Feiertage</Text>
      {ODALAN_EVENTS.filter((e) => !e.name.includes("NYEPI")).map((event) => (
        <View key={event.id} style={styles.odalanCard}>
          <Text style={styles.odalanName}>{event.name}</Text>
          <Text style={styles.odalanDate}>{event.date}</Text>
          <Text style={styles.odalanDescription}>{event.description}</Text>
        </View>
      ))}

      {/* 210-Day Cycle Info */}
      <View style={styles.cycleInfoCard}>
        <Calendar size={20} color="#8B5CF6" />
        <Text style={styles.cycleInfoTitle}>Balinesischer Kalender</Text>
        <Text style={styles.cycleInfoText}>
          Der balinesische Hindu-Kalender (Pawukon) hat 210 Tage. Feiertage
          verschieben sich jährlich im Gregorianischen Kalender.
        </Text>
      </View>
    </View>
  );

  const renderScannerTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📸 Food Scanner (OCR)</Text>

      <View style={styles.scannerInfo}>
        <Info size={20} color="#3B82F6" />
        <Text style={styles.scannerInfoText}>
          Fotografiere Speisekarten für automatische Texterkennung. Unterstützt
          Englisch und Indonesisch.
        </Text>
      </View>

      {/* Camera Button */}
      <TouchableOpacity style={styles.cameraButton} onPress={takePhotoForOCR}>
        <Camera size={32} color="#FFFFFF" />
        <Text style={styles.cameraButtonText}>Foto aufnehmen</Text>
      </TouchableOpacity>

      {/* Loading */}
      {!!ocrLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B4D8" />
          <Text style={styles.loadingText}>Erkenne Text...</Text>
        </View>
      )}

      {/* OCR Result */}
      {!!ocrText && !ocrLoading && (
        <View style={styles.ocrResult}>
          <Text style={styles.ocrTitle}>Erkannter Text:</Text>
          <View style={styles.ocrTextBox}>
            <Text style={styles.ocrText}>{ocrText}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setOcrText("");
              setOcrImage(null);
            }}
          >
            <X size={18} color="#FFFFFF" />
            <Text style={styles.clearButtonText}>Neuer Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview */}
      {!!ocrImage && (
        <View style={styles.imagePreview}>
          <Text style={styles.imagePreviewTitle}>Vorschau:</Text>
          {/* In production, render actual image */}
          <View style={styles.imagePlaceholder}>
            <Camera size={48} color="#94A3B8" />
          </View>
        </View>
      )}

      {/* Common Food Words */}
      <View style={styles.commonWordsCard}>
        <Text style={styles.commonWordsTitle}>Häufige Wörter</Text>
        <View style={styles.wordsGrid}>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Nasi</Text>
            <Text style={styles.wordGer}>Reis</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Mie</Text>
            <Text style={styles.wordGer}>Nudeln</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Ayam</Text>
            <Text style={styles.wordGer}>Huhn</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Ikan</Text>
            <Text style={styles.wordGer}>Fisch</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Sapi</Text>
            <Text style={styles.wordGer}>Rind</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Babi</Text>
            <Text style={styles.wordGer}>Schwein</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Goreng</Text>
            <Text style={styles.wordGer}>Gebraten</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Bakar</Text>
            <Text style={styles.wordGer}>Gegrillt</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Pedas</Text>
            <Text style={styles.wordGer}>Scharf</Text>
          </View>
          <View style={styles.wordItem}>
            <Text style={styles.wordInd}>Enak</Text>
            <Text style={styles.wordGer}>Lecker</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDictionaryTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📖 Offline Dictionary</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Suchen..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedDictCategory === "all" && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedDictCategory("all")}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedDictCategory === "all" && styles.categoryChipTextActive,
            ]}
          >
            Alle
          </Text>
        </TouchableOpacity>
        {dictionaryCategories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedDictCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedDictCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedDictCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Entries List */}
      {filteredDictionary.map((entry) => (
        <View key={entry.id} style={styles.dictEntry}>
          <View style={styles.dictEntryHeader}>
            <Text style={styles.dictIndonesian}>{entry.indonesian}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(entry.indonesian, entry.id)}
            >
              {copiedId === entry.id ? (
                <Check size={18} color="#10B981" />
              ) : (
                <Copy size={18} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.dictPronunciation}>{entry.pronunciation}</Text>
          <Text style={styles.dictGerman}>{entry.german}</Text>
          <View style={styles.dictCategoryBadge}>
            <Text style={styles.dictCategoryText}>{entry.category}</Text>
          </View>
        </View>
      ))}

      {filteredDictionary.length === 0 && (
        <View style={styles.emptyState}>
          <Languages size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>Keine Einträge gefunden</Text>
        </View>
      )}
    </View>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ backgroundColor: colors.background }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header
          title={t("survival.title", "Survival Guide")}
          showBackButton={false}
        />

        {/* Tabs - Premium iOS Style */}
        <AnimatedView animation="fadeIn" delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === "packing" && styles.tabActive]}
              onPress={() => setActiveTab("packing")}
            >
              <Backpack
                size={18}
                color={activeTab === "packing" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "packing" && styles.tabTextActive,
                ]}
              >
                Packing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "visa" && styles.tabActive]}
              onPress={() => setActiveTab("visa")}
            >
              <Plane
                size={18}
                color={activeTab === "visa" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "visa" && styles.tabTextActive,
                ]}
              >
                Visa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "laws" && styles.tabActive]}
              onPress={() => setActiveTab("laws")}
            >
              <Scale
                size={18}
                color={activeTab === "laws" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "laws" && styles.tabTextActive,
                ]}
              >
                Gesetze
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "odalan" && styles.tabActive]}
              onPress={() => setActiveTab("odalan")}
            >
              <Calendar
                size={18}
                color={activeTab === "odalan" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "odalan" && styles.tabTextActive,
                ]}
              >
                Feiertage
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "scanner" && styles.tabActive]}
              onPress={() => setActiveTab("scanner")}
            >
              <Camera
                size={18}
                color={activeTab === "scanner" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "scanner" && styles.tabTextActive,
                ]}
              >
                Scanner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "dictionary" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("dictionary")}
            >
              <Languages
                size={18}
                color={activeTab === "dictionary" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "dictionary" && styles.tabTextActive,
                ]}
              >
                Dict
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </AnimatedView>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {activeTab === "packing" && renderPackingTab()}
          {activeTab === "visa" && renderVisaTab()}
          {activeTab === "laws" && renderLawsTab()}
          {activeTab === "odalan" && renderOdalanTab()}
          {activeTab === "scanner" && renderScannerTab()}
          {activeTab === "dictionary" && renderDictionaryTab()}
        </ScrollView>

        {/* Add Item Modal */}
        <Modal
          visible={showAddItemModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddItemModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Neues Item</Text>
                <TouchableOpacity onPress={() => setShowAddItemModal(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Name..."
                placeholderTextColor="#94A3B8"
                value={newItemName}
                onChangeText={setNewItemName}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.modalCategorySelector}
              >
                {PACKING_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalCategoryChip,
                      newItemCategory === cat.id &&
                        styles.modalCategoryChipActive,
                    ]}
                    onPress={() => setNewItemCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.modalCategoryText,
                        newItemCategory === cat.id &&
                          styles.modalCategoryTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.essentialCheckbox}
                onPress={() => setNewItemEssential(!newItemEssential)}
              >
                {newItemEssential ? (
                  <CheckSquare size={20} color="#00B4D8" />
                ) : (
                  <Square size={20} color="#CBD5E1" />
                )}
                <Text style={styles.essentialCheckboxText}>
                  Essentielles Item
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={addPackingItem}
              >
                <Text style={styles.modalButtonText}>Hinzufügen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabsContent: { gap: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
    elevation: 2,
  },
  tabActive: { backgroundColor: "#FF9D6C", borderColor: "transparent" },
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

  // Progress
  progressCard: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: "#64748B" },
  progressValue: { fontSize: 24, fontWeight: "800", color: "#00B4D8" },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#00B4D8", borderRadius: 4 },

  // Weather
  weatherCard: {
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 120,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  weatherTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  weatherTip: { fontSize: 13, color: "#475569", marginBottom: 4 },

  // Category Filter
  categoryFilter: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
    alignSelf: "flex-start",
  },
  categoryChipActive: { backgroundColor: "#00B4D8", borderColor: "#00B4D8" },
  categoryChipText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  categoryChipTextActive: { color: "#FFFFFF" },

  // Add Item Button
  addItemButton: {
    flexDirection: "row",
    backgroundColor: "#00B4D8",
    paddingHorizontal: 20,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  addItemButtonText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  // Packing Item
  packingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  packingItemChecked: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderColor: "rgba(16,185,129,0.3)",
  },
  packingItemEssential: { borderColor: "rgba(245,158,11,0.5)", borderWidth: 2 },
  packingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  packingItemName: { fontSize: 14, color: "#475569", flex: 1 },
  packingItemNameChecked: {
    color: "#10B981",
    textDecorationLine: "line-through",
  },
  deleteItemButton: { padding: 4 },

  // Essential Reminder
  essentialReminder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  essentialReminderText: {
    fontSize: 13,
    color: "#B45309",
    fontWeight: "600",
    flex: 1,
  },

  // Visa Status
  visaStatusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  validCard: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderColor: "#10B981",
  },
  overstayCard: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "#EF4444",
  },
  visaStatusHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  visaStatusInfo: { flex: 1 },
  visaStatusTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  visaStatusSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  penaltyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  penaltyText: { fontSize: 14, fontWeight: "700", color: "#EF4444", flex: 1 },

  // Visa Input
  visaInputCard: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#475569" },
  dateInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  visaTypeSelector: { flexDirection: "row", gap: 8 },
  visaTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  visaTypeChipActive: { backgroundColor: "#00B4D8" },
  visaTypeText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  visaTypeTextActive: { color: "#FFFFFF" },

  // Visa Info
  visaInfoCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  visaInfoType: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  visaInfoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  visaInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "48%",
  },
  visaInfoLabel: { fontSize: 11, color: "#64748B" },
  visaInfoValue: { fontSize: 12, fontWeight: "600", color: "#0F172A" },
  penaltyValue: { color: "#EF4444" },

  // Warning
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  warningTitle: { fontSize: 16, fontWeight: "800", color: "#EF4444", flex: 1 },
  warningText: { fontSize: 13, color: "#64748B", flex: 2, lineHeight: 18 },

  // Law
  lawCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  lawHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  lawTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lawTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  lawDetails: { padding: 12, paddingTop: 0 },
  lawCategory: { fontSize: 11, color: "#64748B", marginBottom: 6 },
  lawDescription: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 8,
  },
  penaltyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  lawPenalty: { fontSize: 13, fontWeight: "600", color: "#EF4444" },

  // Tourist Tax
  touristTaxCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  touristTaxTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  touristTaxText: { fontSize: 13, color: "#475569", lineHeight: 18, flex: 1 },

  // Nyepi
  nyepiCard: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  nyepiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  nyepiTitle: { fontSize: 18, fontWeight: "800", color: "#EF4444" },
  nyepiDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  nyepiRules: { gap: 6, marginBottom: 10 },
  nyepiRule: { fontSize: 13, color: "#475569" },
  nyepiHint: { fontSize: 12, color: "#B45309", fontStyle: "italic" },

  // Odalan
  odalanCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  odalanName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  odalanDate: {
    fontSize: 12,
    color: "#00B4D8",
    fontWeight: "600",
    marginBottom: 4,
  },
  odalanDescription: { fontSize: 13, color: "#475569", lineHeight: 18 },

  // Cycle Info
  cycleInfoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(139,92,246,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  cycleInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  cycleInfoText: { fontSize: 13, color: "#475569", lineHeight: 18, flex: 1 },

  // Scanner
  scannerInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  scannerInfoText: { fontSize: 13, color: "#475569", flex: 1, lineHeight: 18 },
  cameraButton: {
    flexDirection: "row",
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  cameraButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  loadingContainer: { alignItems: "center", padding: 20 },
  loadingText: { fontSize: 14, color: "#64748B", marginTop: 8 },
  ocrResult: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  ocrTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  ocrTextBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  ocrText: { fontSize: 13, color: "#0F172A", lineHeight: 18 },
  clearButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  clearButtonText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
  imagePreview: { marginBottom: 12 },
  imagePreviewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Common Words
  commonWordsCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 12,
  },
  commonWordsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  wordsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wordItem: {
    width: "31%",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  wordInd: {
    fontSize: 13,
    fontWeight: "700",
    color: "#00B4D8",
    marginBottom: 2,
  },
  wordGer: { fontSize: 11, color: "#64748B" },

  // Dictionary
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
  dictEntry: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  dictEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dictIndonesian: { fontSize: 16, fontWeight: "700", color: "#00B4D8" },
  dictPronunciation: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    marginBottom: 4,
  },
  dictGerman: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  dictCategoryBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  dictCategoryText: { fontSize: 10, color: "#64748B", fontWeight: "600" },
  emptyState: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 14, color: "#64748B", marginTop: 8 },

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
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
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
  modalCategorySelector: { marginBottom: 12 },
  modalCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  modalCategoryChipActive: { backgroundColor: "#00B4D8" },
  modalCategoryText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  modalCategoryTextActive: { color: "#FFFFFF" },
  essentialCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  essentialCheckboxText: { fontSize: 14, color: "#475569" },
  modalButton: {
    backgroundColor: "#00B4D8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
