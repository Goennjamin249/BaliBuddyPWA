import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw,
  ShieldAlert,
  Activity,
  AlertCircle,
  CheckCircle,
  Cloud,
  Droplets,
  Globe,
  Navigation,
  Phone,
  Shield,
  ShieldCheck,
  Thermometer,
  Wind,
  Camera,
  Scan,
  XCircle,
  Book,
  Scale,
  ChevronRight,
  Copy,
  Search,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Q } from "@nozbe/watermelondb";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from 'expo-image-picker';

import db from "../../db/index";
import {
  getCachedRate,
  saveScannerResult,
  getScannerResult,
  saveScannerAllergens,
  getScannerAllergens,
  clearScannerResult,
} from "../../utils/storage";
import {
  searchDictionary,
  dictionaryCategories,
} from "../../services/dictionary";
import {
  lawCategories,
  lawEntries,
  getLawsByCategory,
  getSeverityColor,
  getSeverityLabel,
} from "../../services/lawHub";
import {
  fetchWeather as fetchWeatherService,
  DEFAULT_WEATHER,
  type WeatherData as WeatherDataType,
} from "../../services/weather";
import { fetchExchangeRate } from "../../services/currency";

// === V2 Design Tokens ===
const ROSE_600 = "#e11d48";
const PINK_700 = "#be123c";
const BG = "#F2F2F7";
const WHITE = "#FFFFFF";
const GRAY_100 = "#F3F4F6";
const GRAY_200 = "#E5E7EB";
const GRAY_500 = "#6B7280";
const GRAY_600 = "#4B5563";
const GRAY_800 = "#1F2937";
const GREEN_500 = "#10B981";
const YELLOW_500 = "#F59E0B";
const RED_500 = "#EF4444";
const BLUE_500 = "#3B82F6";
const ORANGE_500 = "#F97316";

// === TYPES ===
interface Price {
  amount: number;
  currency: "IDR" | "EUR";
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: Price;
  allergens: string[];
  isSafe: boolean;
  riskLevel: "low" | "medium" | "high";
}

interface AllergenInfo {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

interface VisaInfo {
  id: string;
  entryDate: number;
  durationDays: number;
  visaType: string;
}

interface VolcanoAlert {
  id: string;
  name: string;
  status: "normal" | "waspada" | "siaga" | "awas";
  level: number;
  lastEruption: string;
  distance: string;
}

interface Clinic {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "rabies";
  latitude: number;
  longitude: number;
  phone: string;
  address: string;
  verified: boolean;
  open24h: boolean;
}

interface SafeBar {
  id: string;
  name: string;
  address: string;
  verified: boolean;
  notes: string;
}

// === CONSTANTS ===
const EMERGENCY_NUMBERS = {
  ambulance: "118",
  police: "110",
  fire: "113",
  sar: "115",
};

const VOLCANO_ALERTS: VolcanoAlert[] = [
  {
    id: "v1",
    name: "Mount Agung",
    status: "waspada",
    level: 2,
    lastEruption: "2019",
    distance: "45 km von Denpasar",
  },
  {
    id: "v2",
    name: "Mount Batur",
    status: "normal",
    level: 1,
    lastEruption: "2000",
    distance: "60 km von Denpasar",
  },
  {
    id: "v3",
    name: "Mount Merapi",
    status: "siaga",
    level: 3,
    lastEruption: "2024",
    distance: "250 km (Java)",
  },
];

const RABIES_CLINICS: Clinic[] = [
  {
    id: "rb1",
    name: "BIMC Hospital Nusa Dua",
    type: "rabies",
    latitude: -8.7984,
    longitude: 115.2308,
    phone: "+62 361 3000911",
    address: "Jl. Bypass Ngurah Rai 100X, Nusa Dua",
    verified: true,
    open24h: true,
  },
  {
    id: "rb2",
    name: "Siloam Hospital Denpasar",
    type: "hospital",
    latitude: -8.6705,
    longitude: 115.2126,
    phone: "+62 361 449900",
    address: "Jl. Raya Puputan No.1, Denpasar",
    verified: true,
    open24h: true,
  },
  {
    id: "rb3",
    name: "Prima Medika Hospital",
    type: "hospital",
    latitude: -8.6589,
    longitude: 115.2239,
    phone: "+62 361 227777",
    address: "Jl. Pulau Serangan No.9X, Denpasar",
    verified: true,
    open24h: false,
  },
  {
    id: "rb4",
    name: "Bali International Medical Centre",
    type: "rabies",
    latitude: -8.6889,
    longitude: 115.1615,
    phone: "+62 361 761263",
    address: "Jl. Raya Seminyak, Seminyak",
    verified: true,
    open24h: true,
  },
];

const SAFE_BARS: SafeBar[] = [
  {
    id: "sb1",
    name: "La Favela",
    address: "Jl. Laksmana, Seminyak",
    verified: true,
    notes: "Premium Cocktail Bar, internationale Standards",
  },
  {
    id: "sb2",
    name: "Potato Head Beach Club",
    address: "Jl. Petitenget, Seminyak",
    verified: true,
    notes: "Resort Bar, eigene Produktion",
  },
  {
    id: "sb3",
    name: "Finns Beach Club",
    address: "Jl. Pantai Berawa, Canggu",
    verified: true,
    notes: "Großer Beach Club, importierte Getränke",
  },
  {
    id: "sb4",
    name: "Rock Bar Bali",
    address: "AYANA Resort, Jimbaran",
    verified: true,
    notes: "5-Sterne Resort Bar",
  },
  {
    id: "sb5",
    name: "Mrs Sippy",
    address: "Jl. Pantai Batu Mejan, Canggu",
    verified: true,
    notes: "Premium Beach Club",
  },
];

const TABS = [
  { id: "tools", label: "Tools", icon: ArrowRightLeft },
  { id: "emergency", label: "Notfall", icon: AlertTriangle },
  { id: "weather", label: "Wetter", icon: Cloud },
  { id: "health", label: "Gesundheit", icon: Thermometer },
  { id: "safety", label: "Sicherheit", icon: Shield },
  { id: "dictionary", label: "Wörterbuch", icon: Book },
  { id: "lawhub", label: "Gesetze", icon: Scale },
];

export default function SurvivalScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("tools");

  // === Währungsrechner States ===
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState(17200);
  const [reversed, setReversed] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);

  // === Visa States ===
  const [visaInfo, setVisaInfo] = useState<VisaInfo | null>(null);
  const [visaLoading, setVisaLoading] = useState(false);

  // === Weather States ===
  const [weather, setWeather] = useState<WeatherDataType | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // === Scanner States ===
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  const [scannerAllergens, setScannerAllergens] = useState<AllergenInfo[]>([
    { id: "gluten", name: "Gluten", icon: "🌾", selected: false },
    { id: "dairy", name: "Milch", icon: "🥛", selected: false },
    { id: "nuts", name: "Nüsse", icon: "🥜", selected: false },
    { id: "shellfish", name: "Meeresfr.", icon: "🦐", selected: false },
    { id: "eggs", name: "Eier", icon: "🥚", selected: false },
    { id: "soy", name: "Soja", icon: "🫘", selected: false },
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<MenuItem[]>([]);
  const [showScannerResults, setShowScannerResults] = useState(false);
  const [imageSource, setImageSource] = useState<'camera' | 'gallery'>('camera');

  // === Dictionary States ===
  const [dictSearch, setDictSearch] = useState("");
  const [dictCategory, setDictCategory] = useState("Alle");
  const [dictCopiedId, setDictCopiedId] = useState<string | null>(null);

  // === Law Hub States ===
  const [lawCategory, setLawCategory] = useState<string | null>(null);
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);

  // === Daten laden ===
  const loadRate = useCallback(async () => {
    setRateLoading(true);
    try {
      const rate = await fetchExchangeRate();
      setRate(rate);
    } catch {
      const cached = await getCachedRate();
      if (cached) setRate(Number(cached));
    } finally {
      setRateLoading(false);
    }
  }, []);

  const loadVisaInfo = useCallback(async () => {
    setVisaLoading(true);
    try {
      const settingsCollection = db.collections.get("settings");
      const entryDateSetting = await settingsCollection
        .query(Q.where("key", "visa_entry_date"))
        .fetch();
      const durationSetting = await settingsCollection
        .query(Q.where("key", "visa_duration_days"))
        .fetch();
      const typeSetting = await settingsCollection
        .query(Q.where("key", "visa_type"))
        .fetch();

      const entryDate = entryDateSetting[0]
        ? Number(
            (entryDateSetting[0] as any).value ||
              (entryDateSetting[0] as any)._raw?.value ||
              0,
          )
        : Date.now();
      const durationDays = durationSetting[0]
        ? Number(
            (durationSetting[0] as any).value ||
              (durationSetting[0] as any)._raw?.value ||
              30,
          )
        : 30;
      const visaType = typeSetting[0]
        ? (typeSetting[0] as any).value ||
          (typeSetting[0] as any)._raw?.value ||
          "eVOA"
        : "eVOA";

      setVisaInfo({ id: "visa", entryDate, durationDays, visaType });
    } catch (e) {
      console.error("Load visa info error:", e);
      setVisaInfo({
        id: "visa",
        entryDate: Date.now(),
        durationDays: 30,
        visaType: "eVOA",
      });
    } finally {
      setVisaLoading(false);
    }
  }, []);

  // === Weather Functions (via centralized service with caching) ===
  const fetchWeather = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) setLoadingWeather(true);
    try {
      const data = await fetchWeatherService(false);
      setWeather(data);
    } catch {
      setWeather(DEFAULT_WEATHER);
    } finally {
      if (showLoading) setLoadingWeather(false);
    }
  }, []);

  // === Load saved scanner data on mount ===
  useEffect(() => {
    loadRate();
    loadVisaInfo();
    fetchWeather(true);
    const refreshInterval = setInterval(
      () => fetchWeather(false),
      60 * 60 * 1000,
    );
    return () => clearInterval(refreshInterval);
  }, [loadRate, loadVisaInfo, fetchWeather]);

  // === Load saved scanner results and allergens ===
  useEffect(() => {
    const loadScannerData = async () => {
      const savedResult = await getScannerResult();
      const savedAllergens = await getScannerAllergens();

      if (savedResult) {
        // Normalize saved scanner items to current MenuItem shape (convert price string -> Price)
        const normalized = (savedResult.items || []).map((it: any) => {
          let priceObj: Price = { amount: 0, currency: "IDR" };
          if (typeof it.price === "string") {
            const p = it.price.replace(/\s/g, "");
            if (p.startsWith("Rp") || p.toUpperCase().includes("IDR")) {
              const num = Number(p.replace(/[^0-9.-]/g, "")) || 0;
              priceObj = { amount: num, currency: "IDR" };
            } else if (p.startsWith("€") || p.toUpperCase().includes("EUR")) {
              const num = Number(p.replace(/[^0-9.-]/g, "")) || 0;
              priceObj = { amount: num, currency: "EUR" };
            } else {
              const num = Number(p.replace(/[^0-9.-]/g, "")) || 0;
              priceObj = { amount: num, currency: "IDR" };
            }
          } else if (it.price && typeof it.price === "object") {
            priceObj = {
              amount: Number(it.price.amount) || 0,
              currency: it.price.currency === "EUR" ? "EUR" : "IDR",
            };
          }

          return {
            id: it.id || String(Math.random()),
            name: it.name || "",
            description: it.description || "",
            price: priceObj,
            allergens: it.allergens || [],
            isSafe: Boolean(it.isSafe),
            riskLevel: it.riskLevel || "low",
          } as MenuItem;
        });

        setScannedItems(normalized);
        setShowScannerResults(true);
      }

      if (savedAllergens.length > 0) {
        setScannerAllergens((prev) =>
          prev.map((a) => ({
            ...a,
            selected: savedAllergens.includes(a.id),
          })),
        );
      }
    };
    loadScannerData();
  }, []);

  // === Berechnungen ===
  const converted = useMemo(() => {
    const num = parseFloat(amount.replace(",", ".")) || 0;
    return reversed ? num / rate : num * rate;
  }, [amount, rate, reversed]);

  const visaDays = useMemo(() => {
    if (!visaInfo) return null;
    const expiry = new Date(
      visaInfo.entryDate + visaInfo.durationDays * 86400000,
    );
    return Math.ceil((expiry.getTime() - new Date().getTime()) / 86400000);
  }, [visaInfo]);

  const visaStatusColor = useMemo(() => {
    if (visaDays === null) return GRAY_500;
    if (visaDays < 0) return RED_500;
    if (visaDays < 7) return RED_500;
    if (visaDays < 14) return YELLOW_500;
    return GREEN_500;
  }, [visaDays]);

  const visaStatusText = useMemo(() => {
    if (visaDays === null) return "Unbekannt";
    if (visaDays < 0) return "Überzogen!";
    if (visaDays < 7) return "Kritisch!";
    if (visaDays < 14) return "Bald fällig";
    return "Gültig";
  }, [visaDays]);

  const visaExpiryDate = useMemo(() => {
    if (!visaInfo) return "--";
    const expiry = new Date(
      visaInfo.entryDate + visaInfo.durationDays * 86400000,
    );
    return expiry.toLocaleDateString("de-DE");
  }, [visaInfo]);

  // === Helper Functions ===
  const callEmergency = (type: string) => {
    const number = EMERGENCY_NUMBERS[type as keyof typeof EMERGENCY_NUMBERS];
    if (number) Linking.openURL(`tel:${number}`);
  };

  const callClinic = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openInMaps = (lat: number, lon: number, name: string) => {
    const url =
      Platform.OS === "web"
        ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`
        : `geo:${lat},${lon}?q=${encodeURIComponent(name)}`;
    Linking.openURL(url);
  };

  const getVolcanoColor = (status: string): string => {
    switch (status) {
      case "normal":
        return "#10B981";
      case "waspada":
        return "#F59E0B";
      case "siaga":
        return "#F97316";
      case "awas":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getVolcanoStatusText = (status: string): string => {
    switch (status) {
      case "normal":
        return "Normal (Level I)";
      case "waspada":
        return "Wachsam (Level II)";
      case "siaga":
        return "Bereit (Level III)";
      case "awas":
        return "Gefahr (Level IV)";
      default:
        return status;
    }
  };

  const handleUpdateVisa = async () => {
    Alert.prompt(
      "Visa-Info aktualisieren",
      "Einreisedatum (Timestamp in ms):",
      async (value) => {
        if (value) {
          const entryDate = Number(value);
          try {
            await db.write(async () => {
              const collection = db.collections.get("settings");
              const existing = await collection
                .query(Q.where("key", "visa_entry_date"))
                .fetch();
              if (existing.length > 0) {
                await existing[0].update((record: any) => {
                  record.value = String(entryDate);
                });
              } else {
                await collection.create((record: any) => {
                  record.key = "visa_entry_date";
                  record.value = String(entryDate);
                });
              }
            });
            await loadVisaInfo();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {
            console.error("Update visa error:", e);
          }
        }
      },
      "plain-text",
      String(visaInfo?.entryDate || Date.now()),
    );
  };

  const formatIDR = useCallback((n: number) => `Rp${Math.round(n).toLocaleString("de-DE")}`, []);
  const formatEUR = useCallback((n: number) => `€${n.toFixed(2)}`, []);

  const formatPrice = useCallback((price: Price): string => {
    if (price.currency === "IDR") {
      return formatIDR(price.amount);
    }
    return formatEUR(price.amount);
  }, [formatIDR, formatEUR]);

  // === Scanner Functions ===
  const handleToggleAllergen = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScannerAllergens((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, selected: !a.selected } : a,
      );
      // Save allergens immediately when toggled
      saveScannerAllergens(updated.filter((a) => a.selected).map((a) => a.id));
      return updated;
    });
  }, []);

   const handleScan = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsScanning(true);

    try {
      // Get camera reference and capture image
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: false
        });

        // Extract selected user allergens
        const userAllergenIds = scannerAllergens
          .filter((a) => a.selected)
          .map((a) => a.id);

        // Dynamisch import Tesseract nur bei Bedarf (spart Ladezeit)
        const Tesseract = (await import('tesseract.js')).default;
        
        // OCR Ausführung
        const ocrResult = await Tesseract.recognize(
          photo.uri,
          'deu+ind+eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Fortschritt: ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );

        // Allergen Erkennung Logik
        const detectedText = ocrResult.data.text.toLowerCase();
        const foundItems: MenuItem[] = [];

        // Allergen Datenbank
        const ALLERGENS: Record<string, { keywords: string[], name: string }> = {
          gluten: { keywords: ["weizen", "gerste", "roggen", "gluten", "nudeln", "pasta", "mie", "brot", "mehl"], name: "Gluten" },
          dairy: { keywords: ["milch", "käse", "butter", "sahne", "casein", "laktose"], name: "Milch" },
          nuts: { keywords: ["nüsse", "erdnuss", "mandel", "cashew", "kacang", "peanut"], name: "Nüsse" },
          shellfish: { keywords: ["garnelen", "krebs", "muscheln", "udang", "seafood", "shrimp"], name: "Meeresfrüchte" },
          eggs: { keywords: ["ei", "eier", "telur", "egg"], name: "Eier" },
          soy: { keywords: ["soja", "tofu", "tempeh", "kedelai", "soy"], name: "Soja" }
        };

        // Indische Gerichte Datenbank
        const INDONESIAN_DISHES: Record<string, { allergens: string[], price: number, description: string }> = {
          "nasi goreng": { allergens: ["eggs", "soy"], price: 45000, description: "Gebratener Reis" },
          "mie goreng": { allergens: ["gluten", "shellfish", "soy"], price: 50000, description: "Gebratene Nudeln" },
          "gado gado": { allergens: ["nuts"], price: 35000, description: "Gemüsesalat mit Erdnusssauce" },
          "satay": { allergens: ["nuts", "soy"], price: 40000, description: "Fleischspieße" },
          "rendang": { allergens: ["soy"], price: 55000, description: "Geschmortes Rindfleisch" },
          "bakso": { allergens: ["gluten"], price: 30000, description: "Fleischbällchen Suppe" },
          "martabak": { allergens: ["gluten", "eggs", "dairy"], price: 25000, description: "Gefüllter Pfannkuchen" }
        };

        // Erkannte Gerichte finden
        Object.entries(INDONESIAN_DISHES).forEach(([dishName, dishData]) => {
          if (detectedText.includes(dishName)) {
            const matchingAllergens = dishData.allergens
              .filter(a => userAllergenIds.includes(a))
              .map(id => ALLERGENS[id].name);

            let riskLevel: "low" | "medium" | "high" = "low";
            let isSafe = true;

            if (matchingAllergens.length > 0) {
              isSafe = false;
              riskLevel = matchingAllergens.length >= 2 ? "high" : "medium";
            }

            foundItems.push({
              id: `dish-${Date.now()}-${Math.random()}`,
              name: dishName.charAt(0).toUpperCase() + dishName.slice(1),
              description: dishData.description,
              price: { amount: dishData.price, currency: "IDR" },
              allergens: matchingAllergens,
              isSafe,
              riskLevel
            });
          }
        });

        // Direkte Allergen Erkennung
        Object.entries(ALLERGENS).forEach(([allergenId, allergenData]) => {
          if (userAllergenIds.includes(allergenId)) {
            for (const keyword of allergenData.keywords) {
              if (detectedText.includes(keyword) && !foundItems.some(i => i.allergens.includes(allergenData.name))) {
                foundItems.push({
                  id: `allergen-${Date.now()}-${Math.random()}`,
                  name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
                  description: "⚠️ Allergen direkt erkannt",
                  price: { amount: 0, currency: "IDR" },
                  allergens: [allergenData.name],
                  isSafe: false,
                  riskLevel: "high"
                });
                break;
              }
            }
          }
        });

        // Fallback falls nichts erkannt wurde
        const finalItems = foundItems.length > 0 ? foundItems : [
          {
            id: "fallback",
            name: "Scan abgeschlossen",
            description: "Keine bekannten Gerichte erkannt. Überprüfe das Bild nochmal.",
            price: { amount: 0, currency: "IDR" },
            allergens: [],
            isSafe: true,
            riskLevel: "low"
          }
        ];

        setScannedItems(finalItems);
        setShowScannerResults(true);
        
        // Speichere Ergebnisse
        const selectedAllergenIds = scannerAllergens.filter((a) => a.selected).map((a) => a.id);
        const storageItems = finalItems.map((it) => ({
          ...it,
          price: formatPrice(it.price),
        }));
        
        await saveScannerResult({
          timestamp: Date.now(),
          items: storageItems,
          selectedAllergens: selectedAllergenIds,
          rawText: ocrResult.data.text
        });

      }
    } catch (error) {
      console.error('Scanner Fehler:', error);
      Alert.alert('Fehler', 'Beim Scannen ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsScanning(false);
    }
  }, [scannerAllergens, formatPrice, cameraRef]);

  const handleResetScanner = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowScannerResults(false);
    setScannedItems([]);
    await clearScannerResult();
  }, []);

  const RISK_COLORS = {
    low: "#90BE6D",
    medium: "#F59E0B",
    high: "#EF4444",
  } as const;

  // === Camera View Renderer ===
  const renderCameraView = () => {
    if (cameraPermission === null) {
      return (
        <View
          style={[styles.scannerCameraContainer, { backgroundColor: GRAY_100 }]}
        >
          <ActivityIndicator size="large" color={ROSE_600} />
          <Text style={[styles.scannerCameraText, { color: GRAY_500 }]}>
            Kamera wird geladen...
          </Text>
        </View>
      );
    }

    if (cameraPermission?.granted !== true) {
      return (
        <View
          style={[styles.scannerCameraContainer, { backgroundColor: GRAY_100 }]}
        >
          <Camera size={48} color={GRAY_500} />
          <Text style={[styles.scannerCameraText, { color: GRAY_500 }]}>
            Kamera-Zugriff erforderlich
          </Text>
          <TouchableOpacity
            onPress={requestCameraPermission}
            style={[
              styles.scannerPermissionButton,
              { backgroundColor: ROSE_600 },
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.scannerPermissionButtonText}>
              Zugriff erlauben
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.scannerCameraWrapper}>
        <CameraView ref={cameraRef} style={styles.scannerCamera} facing="back">
          <View style={styles.scannerCameraOverlay}>
            <View style={styles.scannerScanFrame}>
              <View style={styles.scannerCornerTopLeft} />
              <View style={styles.scannerCornerTopRight} />
              <View style={styles.scannerCornerBottomLeft} />
              <View style={styles.scannerCornerBottomRight} />
            </View>
            <Text style={styles.scannerScanGuideText}>
              Speisekarte hier positionieren
            </Text>
          </View>
        </CameraView>

        {/* Dual Action Buttons */}
        <View style={styles.scannerActionButtons}>
          <TouchableOpacity
            onPress={handleScanFromGallery}
            disabled={isScanning}
            style={[
              styles.scannerGalleryButton,
              isScanning && styles.scannerScanButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Image size={20} color={ROSE_600} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleScan}
            disabled={isScanning}
            style={[
              styles.scannerScanButton,
              isScanning && styles.scannerScanButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={ROSE_600} />
            ) : (
              <>
                <Scan size={20} color={ROSE_600} />
                <Text style={styles.scannerScanButtonText}>Scannen</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // === RENDER SECTIONS ===
  const renderToolsSection = () => (
    <>
      {/* WÄHRUNGSRECHNER */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <ArrowRightLeft size={18} color={ROSE_600} />
          <Text style={styles.cardTitle}>Währungsrechner</Text>
          {rateLoading && <ActivityIndicator size="small" color={ROSE_600} />}
        </View>
        <View style={styles.converterSection}>
          <View style={styles.converterRow}>
            <View style={styles.converterInput}>
              <Text style={styles.converterLabel}>
                {reversed ? "IDR" : "EUR"}
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.converterInputText}
                placeholder="0"
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setReversed(!reversed);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.reverseBtn}
            >
              <ArrowRightLeft size={20} color={ROSE_600} />
            </TouchableOpacity>
            <View style={styles.converterInput}>
              <Text style={styles.converterLabel}>
                {reversed ? "EUR" : "IDR"}
              </Text>
              <Text style={styles.converterResultText}>
                {reversed ? formatEUR(converted) : formatIDR(converted)}
              </Text>
            </View>
          </View>
          <View style={styles.rateInfo}>
            <Text style={styles.rateInfoText}>
              1 EUR = {rate.toLocaleString("de-DE")} IDR
            </Text>
            <TouchableOpacity onPress={loadRate}>
              <RefreshCw size={14} color={GRAY_500} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* VISA-COUNTDOWN */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Calendar size={18} color={ROSE_600} />
          <Text style={styles.cardTitle}>Visa-Status</Text>
          <TouchableOpacity onPress={handleUpdateVisa}>
            <Text style={styles.editText}>Bearbeiten</Text>
          </TouchableOpacity>
        </View>
        {visaLoading ? (
          <View style={styles.visaLoading}>
            <ActivityIndicator size="small" color={ROSE_600} />
          </View>
        ) : (
          <View style={styles.visaContent}>
            <View style={styles.visaMainRow}>
              <View style={styles.visaDaysContainer}>
                <Text style={[styles.visaDaysText, { color: visaStatusColor }]}>
                  {visaDays !== null ? visaDays : "--"}
                </Text>
                <Text style={styles.visaDaysLabel}>Tage verbleibend</Text>
              </View>
              <View style={styles.visaStatusBadge}>
                <Text
                  style={[styles.visaStatusText, { color: visaStatusColor }]}
                >
                  {visaStatusText}
                </Text>
              </View>
            </View>
            <View style={styles.visaDetails}>
              <View style={styles.visaDetailRow}>
                <Clock size={14} color={GRAY_500} />
                <Text style={styles.visaDetailText}>
                  Typ: {visaInfo?.visaType || "eVOA"}
                </Text>
              </View>
              <View style={styles.visaDetailRow}>
                <Calendar size={14} color={GRAY_500} />
                <Text style={styles.visaDetailText}>
                  Ablauf: {visaExpiryDate}
                </Text>
              </View>
              <View style={styles.visaDetailRow}>
                <Info size={14} color={GRAY_500} />
                <Text style={styles.visaDetailText}>
                  Dauer: {visaInfo?.durationDays || 30} Tage
                </Text>
              </View>
            </View>
            {visaDays !== null && visaDays < 7 && (
              <View style={styles.visaWarning}>
                <AlertTriangle size={16} color={RED_500} />
                <Text style={styles.visaWarningText}>
                  {visaDays < 0
                    ? "Visa überzogen! Sofort verlängern oder ausreisen!"
                    : "Visa läuft bald ab! Verlängerung prüfen!"}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* SPEISEKARTEN-SCANNER */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Camera size={18} color={ROSE_600} />
          <Text style={styles.cardTitle}>Speisekarten-Scanner</Text>
        </View>

        {!showScannerResults ? (
          <>
            {/* Allergen Selection */}
            <View style={styles.scannerAllergenSection}>
              <Text style={styles.scannerSectionTitle}>Deine Allergien</Text>
              <View style={styles.scannerAllergenChips}>
                {scannerAllergens.map((allergen) => (
                  <TouchableOpacity
                    key={allergen.id}
                    onPress={() => handleToggleAllergen(allergen.id)}
                    style={[
                      styles.scannerAllergenChip,
                      allergen.selected
                        ? { backgroundColor: ROSE_600, borderColor: ROSE_600 }
                        : { backgroundColor: WHITE, borderColor: GRAY_200 },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.scannerAllergenIcon}>
                      {allergen.icon}
                    </Text>
                    <Text
                      style={[
                        styles.scannerAllergenText,
                        allergen.selected
                          ? { color: "#FFFFFF", fontWeight: "600" }
                          : { color: GRAY_500 },
                      ]}
                    >
                      {allergen.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Camera Section */}
            <View style={styles.scannerCameraSection}>
              <Text style={styles.scannerSectionTitle}>
                Speisekarte scannen
              </Text>
              {renderCameraView()}
            </View>

            {/* Info Card */}
            <View
              style={[styles.scannerInfoCard, { backgroundColor: GRAY_100 }]}
            >
              <View style={styles.scannerInfoCardContent}>
                <Shield size={24} color={ROSE_600} />
                <View style={styles.scannerInfoCardText}>
                  <Text style={styles.scannerInfoCardTitle}>
                    Wie funktioniert der Scanner?
                  </Text>
                  <Text style={styles.scannerInfoCardDescription}>
                    Fotografiere eine Speisekarte und der Scanner erkennt
                    automatisch Allergene und warnt dich vor potenziell
                    gefährlichen Gerichten.
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Results Header */}
            <View style={styles.scannerResultsHeader}>
              <Text style={styles.scannerResultsTitle}>Scan-Ergebnisse</Text>
              <TouchableOpacity
                onPress={handleResetScanner}
                style={[
                  styles.scannerResetButton,
                  { backgroundColor: GRAY_100 },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.scannerResetButtonText, { color: GRAY_500 }]}
                >
                  Erneut scannen
                </Text>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View
              style={[styles.scannerSummaryCard, { backgroundColor: WHITE }]}
            >
              <View style={styles.scannerSummaryStats}>
                <View style={styles.scannerSummaryStat}>
                  <Text
                    style={[
                      styles.scannerSummaryStatValue,
                      { color: GRAY_800 },
                    ]}
                  >
                    {scannedItems.length}
                  </Text>
                  <Text
                    style={[
                      styles.scannerSummaryStatLabel,
                      { color: GRAY_500 },
                    ]}
                  >
                    Gerichte
                  </Text>
                </View>
                <View
                  style={[
                    styles.scannerSummaryStatDivider,
                    { backgroundColor: GRAY_200 },
                  ]}
                />
                <View style={styles.scannerSummaryStat}>
                  <Text
                    style={[
                      styles.scannerSummaryStatValue,
                      { color: "#90BE6D" },
                    ]}
                  >
                    {scannedItems.filter((i) => i.isSafe).length}
                  </Text>
                  <Text
                    style={[
                      styles.scannerSummaryStatLabel,
                      { color: GRAY_500 },
                    ]}
                  >
                    Sicher
                  </Text>
                </View>
                <View
                  style={[
                    styles.scannerSummaryStatDivider,
                    { backgroundColor: GRAY_200 },
                  ]}
                />
                <View style={styles.scannerSummaryStat}>
                  <Text
                    style={[
                      styles.scannerSummaryStatValue,
                      { color: "#EF4444" },
                    ]}
                  >
                    {scannedItems.filter((i) => !i.isSafe).length}
                  </Text>
                  <Text
                    style={[
                      styles.scannerSummaryStatLabel,
                      { color: GRAY_500 },
                    ]}
                  >
                    Vorsicht
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            {scannedItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.scannerMenuItemCard,
                  { backgroundColor: WHITE, borderColor: GRAY_200 },
                ]}
              >
                <View style={styles.scannerMenuItemHeader}>
                  <View style={styles.scannerMenuItemInfo}>
                    <Text
                      style={[styles.scannerMenuItemName, { color: GRAY_800 }]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.scannerMenuItemDescription,
                        { color: GRAY_500 },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <View style={styles.scannerMenuItemMeta}>
                    <Text style={styles.scannerMenuItemPrice}>
                      {formatPrice(item.price)}
                    </Text>
                    <View
                      style={[
                        styles.scannerSafetyBadge,
                        { backgroundColor: `${RISK_COLORS[item.riskLevel]}20` },
                      ]}
                    >
                      {item.isSafe ? (
                        <CheckCircle
                          size={16}
                          color={RISK_COLORS[item.riskLevel]}
                        />
                      ) : (
                        <AlertTriangle
                          size={16}
                          color={RISK_COLORS[item.riskLevel]}
                        />
                      )}
                      <Text
                        style={[
                          styles.scannerSafetyBadgeText,
                          { color: RISK_COLORS[item.riskLevel] },
                        ]}
                      >
                        {item.isSafe ? "Sicher" : "Vorsicht"}
                      </Text>
                    </View>
                  </View>
                </View>
                {item.allergens.length > 0 && (
                  <View style={styles.scannerAllergenTags}>
                    {item.allergens.map((allergen, index) => (
                      <View key={index} style={styles.scannerAllergenTag}>
                        <Text style={styles.scannerAllergenTagText}>
                          {allergen}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </View>
    </>
  );

  const renderEmergencySection = () => (
    <>
      {/* Notfallnummern - V2 Premium Cards */}
      <View style={styles.bentoGrid}>
        <TouchableOpacity
          style={[styles.bentoTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("ambulance");
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.bentoIconContainer, { backgroundColor: RED_500 }]}>
            <Activity size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>Krankenwagen</Text>
          <Text style={[styles.bentoNumber, { color: RED_500 }]}>{EMERGENCY_NUMBERS.ambulance}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bentoTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("police");
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.bentoIconContainer, { backgroundColor: BLUE_500 }]}>
            <Shield size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>Polizei</Text>
          <Text style={[styles.bentoNumber, { color: BLUE_500 }]}>{EMERGENCY_NUMBERS.police}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bentoTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("fire");
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.bentoIconContainer, { backgroundColor: ORANGE_500 }]}>
            <AlertTriangle size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>Feuerwehr</Text>
          <Text style={[styles.bentoNumber, { color: ORANGE_500 }]}>{EMERGENCY_NUMBERS.fire}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bentoTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("sar");
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.bentoIconContainer, { backgroundColor: GREEN_500 }]}>
            <Navigation size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>SAR</Text>
          <Text style={[styles.bentoNumber, { color: GREEN_500 }]}>{EMERGENCY_NUMBERS.sar}</Text>
        </TouchableOpacity>
      </View>

      {/* Volcano Alerts */}
      <View style={styles.volcanoCard}>
        <View style={styles.volcanoHeader}>
          <AlertTriangle size={24} color={ORANGE_500} />
          <Text style={styles.volcanoTitle}>
            Vulkan Alarm (MAGMA Indonesia)
          </Text>
        </View>
        {VOLCANO_ALERTS.map((volcano) => (
          <View key={volcano.id} style={styles.volcanoItem}>
            <View style={styles.volcanoInfo}>
              <Text style={styles.volcanoName}>{volcano.name}</Text>
              <Text style={styles.volcanoDistance}>{volcano.distance}</Text>
            </View>
            <View
              style={[
                styles.volcanoStatus,
                { backgroundColor: getVolcanoColor(volcano.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.volcanoStatusText,
                  { color: getVolcanoColor(volcano.status) },
                ]}
              >
                {getVolcanoStatusText(volcano.status)}
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.magmaButton}
          onPress={() => Linking.openURL("https://magma.esdm.go.id/")}
        >
          <Globe size={18} color="#FFFFFF" />
          <Text style={styles.magmaButtonText}>MAGMA Indonesia Website</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderWeatherSection = () => (
    <>
      {loadingWeather ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ROSE_600} />
          <Text style={styles.loadingText}>Lade Wetterdaten...</Text>
        </View>
      ) : weather ? (
        <>
          <View style={styles.weatherCard}>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherIcon}>{weather.icon}</Text>
              <View style={styles.weatherTemp}>
                <Text style={styles.temperature}>
                  {Math.round(weather.temperature)}°C
                </Text>
                <Text style={styles.condition}>{weather.condition}</Text>
              </View>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Thermometer size={20} color={RED_500} />
                <Text style={styles.weatherDetailLabel}>Gefühlt</Text>
                <Text style={styles.weatherDetailValue}>
                  {Math.round(weather.feelsLike)}°C
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Droplets size={20} color={BLUE_500} />
                <Text style={styles.weatherDetailLabel}>Luftfeuchtigkeit</Text>
                <Text style={styles.weatherDetailValue}>
                  {weather.humidity}%
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Wind size={20} color={GREEN_500} />
                <Text style={styles.weatherDetailLabel}>Wind</Text>
                <Text style={styles.weatherDetailValue}>
                  {weather.windSpeed} km/h
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.weatherAlerts}>
            <Text style={styles.alertTitle}>⚠️ Wetterwarnungen</Text>
            <View style={styles.alertItem}>
              <AlertCircle size={20} color={YELLOW_500} />
              <Text style={styles.alertText}>
                Monsunzeit (Nov-Mär): Starke Regenfälle möglich
              </Text>
            </View>
            <View style={styles.alertItem}>
              <AlertCircle size={20} color={YELLOW_500} />
              <Text style={styles.alertText}>
                UV-Index sehr hoch - Sonnenschutz empfohlen
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Cloud size={48} color={GRAY_500} />
          <Text style={styles.errorText}>Wetterdaten nicht verfügbar</Text>
        </View>
      )}
    </>
  );

  const renderHealthSection = () => (
    <>
      {/* Bali Belly */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🤢 Bali Belly SOS</Text>
        <Text style={styles.infoText}>
          Durchfallerkrankung durch verunreinigtes Wasser oder Essen. Sehr
          häufig bei Touristen in Bali.
        </Text>
      </View>
      <View style={styles.symptomsCard}>
        <Text style={styles.symptomsTitle}>🦠 Symptome</Text>
        <View style={styles.symptomList}>
          <Text style={styles.symptom}>• Durchfall (wässrig)</Text>
          <Text style={styles.symptom}>• Bauchkrämpfe</Text>
          <Text style={styles.symptom}>• Übelkeit & Erbrechen</Text>
          <Text style={styles.symptom}>• Fieber</Text>
          <Text style={styles.symptom}>• Dehydrierung</Text>
        </View>
      </View>
      <View style={styles.treatmentCard}>
        <Text style={styles.treatmentTitle}>✅ Erste Hilfe</Text>
        <View style={styles.treatmentList}>
          <Text style={styles.treatment}>
            💧 Viel Wasser trinken (nur Flaschenwasser!)
          </Text>
          <Text style={styles.treatment}>
            🧂 Elektrolyte einnehmen (Oralit)
          </Text>
          <Text style={styles.treatment}>🍚 Leichte Kost (Reis, Bananen)</Text>
          <Text style={styles.treatment}>
            💊 Loperamid (Imodium) bei Bedarf
          </Text>
          <Text style={styles.treatment}>
            🚫 Kein Alkohol, kein Kaffee, keine Milch
          </Text>
        </View>
      </View>

      {/* Rabies */}
      <View style={styles.warningCard}>
        <AlertTriangle size={32} color={RED_500} />
        <Text style={styles.warningTitle}>
          ACHTUNG: Bali ist Tollwut-Gebiet!
        </Text>
        <Text style={styles.warningText}>
          Affenbisse sind KEIN Kavaliersdelikt. Tollwut ist zu 100% tödlich wenn
          unbehandelt!
        </Text>
      </View>
      <View style={styles.firstAidCard}>
        <Text style={styles.firstAidTitle}>🚑 Erste Hilfe nach Biss</Text>
        <View style={styles.stepList}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Wunde sofort 15 Min. mit Seife und Wasser auswaschen
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Mit Desinfektionsmittel behandeln (Jod, Alkohol)
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              NICHT verbinden - Wunde offen lassen
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              SOFORT zur Klinik für Impfung (innerhalb 24h!)
            </Text>
          </View>
        </View>
      </View>

      {/* Kliniken */}
      <View style={styles.clinicsCard}>
        <Text style={styles.clinicsTitle}>🏥 Tollwut-Impfung verfügbar</Text>
        {RABIES_CLINICS.filter((c) => c.verified).map((clinic) => (
          <View key={clinic.id} style={styles.rabiesClinicItem}>
            <View style={styles.rabiesClinicInfo}>
              <ShieldCheck size={20} color={GREEN_500} />
              <Text style={styles.rabiesClinicName}>{clinic.name}</Text>
            </View>
            <Text style={styles.rabiesClinicPhone}>{clinic.phone}</Text>
            <View style={styles.rabiesClinicActions}>
              <TouchableOpacity
                style={styles.callButtonSmall}
                onPress={() => callClinic(clinic.phone)}
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Anrufen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapsButtonSmall}
                onPress={() =>
                  openInMaps(clinic.latitude, clinic.longitude, clinic.name)
                }
              >
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.mapsButtonText}>Route</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.emergencyCallButton}
        onPress={() => callEmergency("ambulance")}
      >
        <Activity size={24} color="#FFFFFF" />
        <Text style={styles.emergencyCallText}>🚑 NOTRUF 118</Text>
      </TouchableOpacity>
    </>
  );

  const renderSafetySection = () => (
    <>
      {/* Methanol Warnung */}
      <View style={styles.methanolWarningCard}>
        <AlertTriangle size={40} color={RED_500} />
        <Text style={styles.methanolWarningTitle}>LEBENSGEFAHR!</Text>
        <Text style={styles.methanolWarningText}>
          Gefälschter Alkohol mit Methanol führt zu Erblindung und Tod!
        </Text>
      </View>

      <View style={styles.symptomsCard}>
        <Text style={styles.methanolSymptomsTitle}>⚠️ Vergiftungssymptome</Text>
        <View style={styles.methanolSymptomList}>
          <Text style={styles.methanolSymptom}>
            🤢 Starke Übelkeit & Erbrechen
          </Text>
          <Text style={styles.methanolSymptom}>
            🤕 Kopfschmerzen & Schwindel
          </Text>
          <Text style={styles.methanolSymptom}>
            👁️ Verschwommene Sicht / Erblindung
          </Text>
          <Text style={styles.methanolSymptom}>
            😵 Verwirrtheit & Bewusstlosigkeit
          </Text>
          <Text style={styles.methanolSymptom}>
            💀 Atemstillstand (tödlich)
          </Text>
        </View>
      </View>

      <View style={styles.safeBarsCard}>
        <Text style={styles.safeBarsTitle}>✅ Verifizierte Sichere Bars</Text>
        {SAFE_BARS.map((bar) => (
          <View key={bar.id} style={styles.safeBarItem}>
            <View style={styles.safeBarInfo}>
              <CheckCircle size={20} color={GREEN_500} />
              <Text style={styles.safeBarName}>{bar.name}</Text>
            </View>
            <Text style={styles.safeBarAddress}>{bar.address}</Text>
            <Text style={styles.safeBarNotes}>{bar.notes}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>🛡️ Schutzmaßnahmen</Text>
        <Text style={styles.tipsText}>
          • Nur in etablierten Bars/Restaurants trinken{"\n"}• Finger weg von zu
          billigem Alkohol{"\n"}• Originalverpackte Flaschen bevorzugen{"\n"}•
          Bei Verdacht: NICHT trinken!{"\n"}• Niemals "selbstgebrannten" Alkohol
          probieren
        </Text>
      </View>

      <TouchableOpacity
        style={styles.emergencyCallButton}
        onPress={() => callEmergency("ambulance")}
      >
        <Activity size={24} color="#FFFFFF" />
        <Text style={styles.emergencyCallText}>
          🚑 Bei Vergiftung: SOFORT 118!
        </Text>
      </TouchableOpacity>
    </>
  );

  // === Dictionary Functions ===
  const dictResults = useMemo(
    () => searchDictionary(dictSearch, dictCategory),
    [dictSearch, dictCategory],
  );

  const copyDictEntry = async (text: string, id: string) => {
    try {
      // Platform-safe clipboard access
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else if (Platform.OS === "web" && typeof window !== "undefined") {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setDictCopiedId(id);
      setTimeout(() => setDictCopiedId(null), 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  // === Law Hub Functions ===
  const categoryLaws = useMemo(
    () => (lawCategory ? getLawsByCategory(lawCategory) : []),
    [lawCategory],
  );
  const selectedLawDetails = useMemo(
    () => (selectedLaw ? lawEntries.find((l) => l.id === selectedLaw) : null),
    [selectedLaw],
  );

  const handleLawBack = () => {
    if (selectedLaw) {
      setSelectedLaw(null);
    } else if (lawCategory) {
      setLawCategory(null);
    }
  };

  // === RENDER DICTIONARY SECTION ===
  const renderDictionarySection = () => (
    <>
      {/* Search Bar */}
      <View style={styles.dictSearchBar}>
        <Search size={20} color={GRAY_500} />
        <TextInput
          style={styles.dictSearchInput}
          placeholder="Suchen..."
          placeholderTextColor={GRAY_500}
          value={dictSearch}
          onChangeText={setDictSearch}
        />
        {dictSearch.length > 0 && (
          <TouchableOpacity onPress={() => setDictSearch("")}>
            <XCircle size={20} color={GRAY_500} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dictCategoriesScroll}
        contentContainerStyle={styles.dictCategoriesContent}
      >
        {dictionaryCategories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.dictCategoryChip,
              dictCategory === category && {
                backgroundColor: ROSE_600,
                borderColor: ROSE_600,
              },
            ]}
            onPress={() => setDictCategory(category)}
          >
            <Text
              style={[
                styles.dictCategoryChipText,
                dictCategory === category && { color: WHITE },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <Text style={styles.dictResultsCount}>{dictResults.length} Einträge</Text>

      {/* Dictionary Entries */}
      {dictResults.length > 0 ? (
        dictResults.map((entry) => (
          <View key={entry.id} style={styles.dictEntryCard}>
            <View style={styles.dictEntryHeader}>
              <View style={styles.dictEntryMain}>
                <Text style={styles.dictEntryIndonesian}>
                  {entry.indonesian}
                </Text>
                <Text style={styles.dictEntryPronunciation}>
                  {entry.pronunciation}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dictCopyButton}
                onPress={() => copyDictEntry(entry.indonesian, entry.id)}
              >
                {dictCopiedId === entry.id ? (
                  <CheckCircle size={16} color={GREEN_500} />
                ) : (
                  <Copy size={16} color={GRAY_500} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.dictEntryTranslation}>
              <Text style={styles.dictEntryGerman}>{entry.german}</Text>
              <Text style={styles.dictEntryEnglish}>{entry.english}</Text>
            </View>
            <Text style={styles.dictCategoryBadge}>{entry.category}</Text>
            {entry.examples.length > 0 && (
              <View style={styles.dictExamplesSection}>
                <Text style={styles.dictExamplesTitle}>Beispiele:</Text>
                {entry.examples.map((example, idx) => (
                  <View key={idx} style={styles.dictExample}>
                    <Text style={styles.dictExampleIndonesian}>
                      {example.indonesian}
                    </Text>
                    <Text style={styles.dictExampleGerman}>
                      {example.german}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.dictEmptyState}>
          <Book size={48} color={GRAY_500} />
          <Text style={styles.dictEmptyText}>Keine Einträge gefunden</Text>
        </View>
      )}
    </>
  );

  // === RENDER LAW HUB SECTION ===
  const renderLawHubSection = () => {
    // Law Detail View
    if (selectedLaw && selectedLawDetails) {
      return (
        <>
          <TouchableOpacity
            style={styles.lawBackButton}
            onPress={handleLawBack}
          >
            <ChevronRight
              size={20}
              color={ROSE_600}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
            <Text style={styles.lawBackText}>Zurück</Text>
          </TouchableOpacity>

          <View
            style={[
              styles.lawSeverityBadge,
              {
                backgroundColor:
                  getSeverityColor(selectedLawDetails.severity) + "20",
              },
            ]}
          >
            <AlertTriangle
              size={20}
              color={getSeverityColor(selectedLawDetails.severity)}
            />
            <Text
              style={[
                styles.lawSeverityText,
                { color: getSeverityColor(selectedLawDetails.severity) },
              ]}
            >
              {getSeverityLabel(selectedLawDetails.severity, "de")}
            </Text>
          </View>

          <View style={styles.lawDetailCard}>
            <Text style={styles.lawDetailLabel}>Beschreibung</Text>
            <Text style={styles.lawDetailText}>
              {selectedLawDetails.description.de}
            </Text>
          </View>

          <View style={[styles.lawDetailCard, styles.lawPenaltyCard]}>
            <Text style={styles.lawDetailLabel}>Strafe</Text>
            <Text style={[styles.lawDetailText, styles.lawPenaltyText]}>
              {selectedLawDetails.penalty.de}
            </Text>
          </View>

          <View style={styles.lawDetailCard}>
            <Text style={styles.lawDetailLabel}>Tipps</Text>
            {selectedLawDetails.tips.de.map((tip, idx) => (
              <View key={idx} style={styles.lawTip}>
                <Text style={styles.lawTipBullet}>•</Text>
                <Text style={styles.lawTipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.lawDisclaimer}>
            <Text style={styles.lawDisclaimerText}>
              ⚠️ Dies ist nur eine Orientierungshilfe. Gesetze können sich
              ändern. Im Zweifel offizielle Quellen konsultieren.
            </Text>
          </View>
        </>
      );
    }

    // Category Laws List View
    if (lawCategory) {
      const cat = lawCategories.find((c) => c.id === lawCategory);
      return (
        <>
          <TouchableOpacity
            style={styles.lawBackButton}
            onPress={handleLawBack}
          >
            <ChevronRight
              size={20}
              color={ROSE_600}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
            <Text style={styles.lawBackText}>Zurück</Text>
          </TouchableOpacity>

          <View style={styles.lawCategoryHeader}>
            <Text style={styles.lawCategoryHeaderIcon}>{cat?.icon}</Text>
            <Text style={styles.lawCategoryHeaderTitle}>{cat?.title.de}</Text>
          </View>

          {categoryLaws.length > 0 ? (
            categoryLaws.map((law) => (
              <TouchableOpacity
                key={law.id}
                style={styles.lawCard}
                onPress={() => setSelectedLaw(law.id)}
              >
                <View style={styles.lawHeader}>
                  <View style={styles.lawTitleSection}>
                    <Text style={styles.lawTitle} numberOfLines={1}>
                      {law.title.de}
                    </Text>
                    <View
                      style={[
                        styles.lawSeverityBadge,
                        { backgroundColor: getSeverityColor(law.severity) },
                      ]}
                    >
                      <Text style={styles.lawSeverityBadgeText}>
                        {getSeverityLabel(law.severity, "de")}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={GRAY_500} />
                </View>
                <Text style={styles.lawDescription} numberOfLines={2}>
                  {law.description.de}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.dictEmptyState}>
              <Info size={48} color={GRAY_500} />
              <Text style={styles.dictEmptyText}>
                Keine Gesetze in dieser Kategorie
              </Text>
            </View>
          )}
        </>
      );
    }

    // Category Overview
    return (
      <>
        <View style={styles.lawIntroSection}>
          <Scale size={32} color={ROSE_600} />
          <Text style={styles.lawIntroTitle}>
            Rechtlicher Leitfaden für Bali
          </Text>
          <Text style={styles.lawIntroText}>
            Wichtige Gesetze und Vorschriften für Touristen in Indonesien
          </Text>
        </View>

        <Text style={styles.dictSectionTitle}>Kategorien</Text>
        {lawCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.lawCategoryCard, { borderLeftColor: cat.color }]}
            onPress={() => setLawCategory(cat.id)}
          >
            <Text style={styles.lawCategoryIcon}>{cat.icon}</Text>
            <View style={styles.lawCategoryInfo}>
              <Text style={styles.lawCategoryTitle}>{cat.title.de}</Text>
              <Text style={styles.lawCategoryCount}>
                {getLawsByCategory(cat.id).length} Gesetze
              </Text>
            </View>
            <ChevronRight size={20} color={GRAY_500} />
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderSection = () => {
    switch (activeTab) {
      case "tools":
        return renderToolsSection();
      case "emergency":
        return renderEmergencySection();
      case "weather":
        return renderWeatherSection();
      case "health":
        return renderHealthSection();
      case "safety":
        return renderSafetySection();
      case "dictionary":
        return renderDictionarySection();
      case "lawhub":
        return renderLawHubSection();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.root}>
        {/* HEADER */}
        <LinearGradient colors={[ROSE_600, PINK_700]} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>
                {t("survival.title") || "Survival Kit"}
              </Text>
              <Text style={styles.headerSub}>Bali Safety & Tools</Text>
            </View>
            <ShieldAlert size={30} color="white" />
          </View>
        </LinearGradient>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <tab.icon
                size={18}
                color={activeTab === tab.id ? "#FFFFFF" : GRAY_600}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderSection()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: WHITE },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    zIndex: 999,
  },
  tabsContent: { gap: 8, flexGrow: 0 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: GRAY_200,
    gap: 6,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
    elevation: 2,
    width: 95,
    minWidth: 95,
    maxWidth: 95,
    flexShrink: 0,
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: ROSE_600, borderColor: ROSE_600 },
  tabText: { fontSize: 13, fontWeight: "600", color: GRAY_600 },
  tabTextActive: { color: WHITE },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: GRAY_800, flex: 1 },
  editText: { fontSize: 13, color: ROSE_600, fontWeight: "600" },
  converterSection: { gap: 12 },
  converterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  converterInput: { flex: 1, alignItems: "center" },
  converterLabel: { fontSize: 12, color: GRAY_500, marginBottom: 4 },
  converterInputText: {
    fontSize: 24,
    fontWeight: "800",
    color: GRAY_800,
    textAlign: "center",
  },
  converterResultText: {
    fontSize: 24,
    fontWeight: "800",
    color: GREEN_500,
    textAlign: "center",
  },
  reverseBtn: {
    padding: 10,
    backgroundColor: GRAY_100,
    borderRadius: 50,
    marginHorizontal: 12,
  },
  rateInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
  },
  rateInfoText: { fontSize: 13, color: GRAY_500 },
  visaLoading: { alignItems: "center", paddingVertical: 20 },
  visaContent: { gap: 16 },
  visaMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  visaDaysContainer: { alignItems: "center" },
  visaDaysText: { fontSize: 56, fontWeight: "900" },
  visaDaysLabel: { fontSize: 14, color: GRAY_500, fontWeight: "600" },
  visaStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_100,
  },
  visaStatusText: { fontSize: 14, fontWeight: "700" },
  visaDetails: { gap: 8 },
  visaDetailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  visaDetailText: { fontSize: 14, color: GRAY_600 },
  visaWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    padding: 12,
    borderRadius: 12,
  },
  visaWarningText: { fontSize: 13, color: RED_500, fontWeight: "600", flex: 1 },
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  bentoTile: {
    width: "47%",
    height: 60,
    borderRadius: 14,
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 4,
    padding: 10,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
    elevation: 4,
    flexShrink: 0,
    backgroundColor: "rgba(255, 255, 255, 0.80)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.40)",
  },
  bentoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bentoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: GRAY_800,
  },
  bentoNumber: { fontSize: 16, fontWeight: "800", color: WHITE },
  volcanoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  volcanoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  volcanoTitle: { fontSize: 16, fontWeight: "700", color: GRAY_800 },
  volcanoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  volcanoInfo: { flex: 1 },
  volcanoName: { fontSize: 14, fontWeight: "600", color: GRAY_800 },
  volcanoDistance: { fontSize: 12, color: GRAY_500 },
  volcanoStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  volcanoStatusText: { fontSize: 11, fontWeight: "700" },
  magmaButton: {
    flexDirection: "row",
    backgroundColor: ORANGE_500,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  magmaButtonText: { fontSize: 14, fontWeight: "700", color: WHITE },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: { fontSize: 15, color: GRAY_500, marginTop: 12 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: { fontSize: 15, color: GRAY_500, marginTop: 12 },
  weatherCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  weatherIcon: { fontSize: 48 },
  weatherTemp: { flex: 1 },
  temperature: { fontSize: 42, fontWeight: "800", color: GRAY_800 },
  condition: { fontSize: 16, color: GRAY_500 },
  weatherDetails: { flexDirection: "row", justifyContent: "space-around" },
  weatherDetail: { alignItems: "center", gap: 4 },
  weatherDetailLabel: { fontSize: 12, color: GRAY_500 },
  weatherDetailValue: { fontSize: 14, fontWeight: "700", color: GRAY_800 },
  weatherAlerts: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 8,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  alertText: { fontSize: 13, color: GRAY_500, flex: 1 },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 6,
  },
  infoText: { fontSize: 13, color: GRAY_500, lineHeight: 18 },
  symptomsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  symptomsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 8,
  },
  symptomList: { gap: 4 },
  symptom: { fontSize: 13, color: GRAY_600 },
  treatmentCard: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  treatmentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 8,
  },
  treatmentList: { gap: 4 },
  treatment: { fontSize: 13, color: GRAY_600 },
  warningCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: RED_500,
    marginTop: 8,
    textAlign: "center",
  },
  warningText: {
    fontSize: 13,
    color: GRAY_500,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  firstAidCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  firstAidTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 12,
  },
  stepList: { gap: 10 },
  step: { flexDirection: "row", gap: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: RED_500,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: { fontSize: 13, fontWeight: "700", color: WHITE },
  stepText: { fontSize: 13, color: GRAY_600, flex: 1, lineHeight: 18 },
  clinicsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  clinicsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 12,
  },
  rabiesClinicItem: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GRAY_200,
  },
  rabiesClinicInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  rabiesClinicName: { fontSize: 14, fontWeight: "600", color: GRAY_800 },
  rabiesClinicPhone: {
    fontSize: 13,
    color: GREEN_500,
    fontWeight: "600",
    marginBottom: 8,
  },
  rabiesClinicActions: { flexDirection: "row", gap: 8 },
  callButtonSmall: {
    flexDirection: "row",
    backgroundColor: GREEN_500,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  callButtonText: { fontSize: 12, fontWeight: "600", color: WHITE },
  mapsButtonSmall: {
    flexDirection: "row",
    backgroundColor: "#00B4D8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  mapsButtonText: { fontSize: 12, fontWeight: "600", color: WHITE },
  emergencyCallButton: {
    flexDirection: "row",
    backgroundColor: RED_500,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emergencyCallText: { fontSize: 16, fontWeight: "800", color: WHITE },
  methanolWarningCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  methanolWarningTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: RED_500,
    marginTop: 8,
    textAlign: "center",
  },
  methanolWarningText: {
    fontSize: 13,
    color: GRAY_500,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  methanolSymptomsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 8,
  },
  methanolSymptomList: { gap: 6 },
  methanolSymptom: { fontSize: 13, color: GRAY_600 },
  safeBarsCard: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  safeBarsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 10,
  },
  safeBarItem: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  safeBarInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  safeBarName: { fontSize: 14, fontWeight: "600", color: GRAY_800 },
  safeBarAddress: { fontSize: 12, color: GRAY_500, marginBottom: 2 },
  safeBarNotes: { fontSize: 11, color: GREEN_500 },
  tipsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 6,
  },
  tipsText: { fontSize: 13, color: GRAY_600, lineHeight: 20 },
  // === Scanner Styles ===
  scannerAllergenSection: { marginBottom: 20 },
  scannerSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: GRAY_800,
    marginBottom: 12,
  },
  scannerAllergenChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  scannerAllergenChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  scannerAllergenIcon: { fontSize: 16 },
  scannerAllergenText: { fontSize: 13 },
  scannerCameraSection: { marginBottom: 20 },
  scannerCameraContainer: {
    height: 280,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerCameraText: { fontSize: 14, marginTop: 12, textAlign: "center" },
  scannerPermissionButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  scannerPermissionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scannerCameraWrapper: {
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  scannerCamera: { flex: 1 },
  scannerCameraOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerScanFrame: { width: 220, height: 220, position: "relative" },
  scannerCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#FFFFFF",
    borderTopLeftRadius: 12,
  },
  scannerCornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#FFFFFF",
    borderTopRightRadius: 12,
  },
  scannerCornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#FFFFFF",
    borderBottomLeftRadius: 12,
  },
  scannerCornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#FFFFFF",
    borderBottomRightRadius: 12,
  },
  scannerScanGuideText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scannerScanButton: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  scannerScanButtonDisabled: { opacity: 0.7 },
  scannerScanButtonText: { color: ROSE_600, fontSize: 14, fontWeight: "600" },
  scannerInfoCard: { borderRadius: 20, padding: 16, marginBottom: 20 },
  scannerInfoCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  scannerInfoCardText: { flex: 1 },
  scannerInfoCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: GRAY_800,
    marginBottom: 4,
  },
  scannerInfoCardDescription: { fontSize: 13, color: GRAY_500, lineHeight: 18 },
  scannerResultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  scannerResultsTitle: { fontSize: 18, fontWeight: "700", color: GRAY_800 },
  scannerResetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scannerResetButtonText: { fontSize: 13, fontWeight: "600" },
  scannerSummaryCard: { borderRadius: 20, padding: 16, marginBottom: 16 },
  scannerSummaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  scannerSummaryStat: { alignItems: "center" },
  scannerSummaryStatDivider: { width: 1, height: 40 },
  scannerSummaryStatValue: { fontSize: 28, fontWeight: "800" },
  scannerSummaryStatLabel: { fontSize: 12, marginTop: 4 },
  scannerMenuItemCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  scannerMenuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scannerMenuItemInfo: { flex: 1, marginRight: 12 },
  scannerMenuItemMeta: { alignItems: "flex-end" },
  scannerMenuItemName: { fontSize: 16, fontWeight: "600" },
  scannerMenuItemDescription: { fontSize: 13, marginTop: 4 },
  scannerMenuItemPrice: { fontSize: 16, fontWeight: "700" },
  scannerSafetyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
    gap: 4,
  },
  scannerSafetyBadgeText: { fontSize: 11, fontWeight: "600" },
  scannerAllergenTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  scannerAllergenTag: {
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scannerAllergenTagText: { fontSize: 11, color: "#EF4444", fontWeight: "600" },
  // === Dictionary Styles ===
  dictSearchBar: {
    zIndex: 10,
    position: 'relative',
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  dictSearchInput: {
    flex: 1,
    fontSize: 16,
    color: GRAY_800,
    paddingVertical: 12,
  },
  dictCategoriesScroll: { marginBottom: 12 },
  dictCategoriesContent: { gap: 8 },
  dictCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: GRAY_200,
  },
  dictCategoryChipText: { fontSize: 14, color: GRAY_500, fontWeight: "600" },
  dictResultsCount: { fontSize: 14, color: GRAY_500, marginBottom: 8 },
  dictEntryCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dictEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  dictEntryMain: { flex: 1 },
  dictEntryIndonesian: {
    fontSize: 18,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 4,
  },
  dictEntryPronunciation: {
    fontSize: 14,
    color: GRAY_500,
    fontStyle: "italic",
  },
  dictCopyButton: { padding: 4 },
  dictEntryTranslation: { marginBottom: 8 },
  dictEntryGerman: {
    fontSize: 16,
    color: GREEN_500,
    fontWeight: "600",
    marginBottom: 2,
  },
  dictEntryEnglish: { fontSize: 14, color: GRAY_500 },
  dictCategoryBadge: {
    fontSize: 12,
    color: GRAY_500,
    backgroundColor: GRAY_100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  dictExamplesSection: {
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
    paddingTop: 12,
  },
  dictExamplesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: GRAY_500,
    marginBottom: 8,
  },
  dictExample: { marginBottom: 8 },
  dictExampleIndonesian: { fontSize: 14, color: GRAY_800, marginBottom: 2 },
  dictExampleGerman: { fontSize: 14, color: GRAY_500 },
  dictEmptyState: { alignItems: "center", paddingVertical: 60 },
  dictEmptyText: { fontSize: 16, color: GRAY_500, marginTop: 12 },
  dictSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: GRAY_800,
    marginBottom: 12,
  },
  // === Law Hub Styles ===
  lawIntroSection: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
  },
  lawIntroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: GRAY_800,
    marginTop: 12,
    marginBottom: 8,
  },
  lawIntroText: {
    fontSize: 14,
    color: GRAY_500,
    textAlign: "center",
    lineHeight: 20,
  },
  lawCategoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  lawCategoryIcon: { fontSize: 32, marginRight: 12 },
  lawCategoryInfo: { flex: 1 },
  lawCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: GRAY_800,
    marginBottom: 4,
  },
  lawCategoryCount: { fontSize: 12, color: GRAY_500 },
  lawCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  lawCategoryHeaderIcon: { fontSize: 32 },
  lawCategoryHeaderTitle: { fontSize: 20, fontWeight: "700", color: GRAY_800 },
  lawCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  lawHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  lawTitleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lawTitle: { fontSize: 16, fontWeight: "600", color: GRAY_800, flex: 1 },
  lawSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lawSeverityBadgeText: { fontSize: 10, fontWeight: "700", color: WHITE },
  lawDescription: { fontSize: 14, color: GRAY_500, lineHeight: 20 },
  lawBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  lawBackText: { fontSize: 14, color: ROSE_600, fontWeight: "600" },
  lawSeverityText: { fontSize: 14, fontWeight: "700" },
  lawDetailCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lawDetailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: GRAY_500,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  lawDetailText: { fontSize: 14, color: GRAY_800, lineHeight: 22 },
  lawPenaltyCard: {
    backgroundColor: "rgba(239,68,68,0.05)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  lawPenaltyText: { color: RED_500, fontWeight: "600" },
  lawTip: { flexDirection: "row", gap: 8, marginBottom: 8 },
  lawTipBullet: { fontSize: 14, color: GREEN_500 },
  lawTipText: { flex: 1, fontSize: 14, color: GRAY_800, lineHeight: 22 },
  lawDisclaimer: {
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  lawDisclaimerText: {
    fontSize: 12,
    color: "rgba(146,64,14,1)",
    lineHeight: 18,
    fontStyle: "italic",
  },
});
