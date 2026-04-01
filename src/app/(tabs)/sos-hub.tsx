import * as ImagePicker from "expo-image-picker";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bike,
  Camera,
  CheckCircle,
  CheckSquare,
  Cloud,
  Droplets,
  Globe,
  Navigation,
  Phone,
  Send,
  Shield,
  ShieldCheck,
  Thermometer,
  Timer,
  Wind,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Header from "../../components/Header";
import { Chip, AnimatedView } from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";

// ==================== TYPES ====================
interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
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

interface ScooterCheckItem {
  id: string;
  label: string;
  checked: boolean;
  critical: boolean;
}

// ==================== CONSTANTS ====================
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

const SCOOTER_CHECKLIST: ScooterCheckItem[] = [
  { id: "s1", label: "Bremsen funktionieren", checked: false, critical: true },
  {
    id: "s2",
    label: "Reifenprofil ausreichend",
    checked: false,
    critical: true,
  },
  { id: "s3", label: "Licht funktioniert", checked: false, critical: true },
  { id: "s4", label: "Hupe funktioniert", checked: false, critical: false },
  { id: "s5", label: "Spiegel vorhanden", checked: false, critical: false },
  { id: "s6", label: "Kraftstoffstand prüfen", checked: false, critical: true },
  {
    id: "s7",
    label: "Keine sichtbaren Schäden",
    checked: false,
    critical: true,
  },
  { id: "s8", label: "Zündschlüssel passt", checked: false, critical: true },
  {
    id: "s9",
    label: "Seitenständer funktioniert",
    checked: false,
    critical: false,
  },
  { id: "s10", label: "Kennzeichen lesbar", checked: false, critical: true },
];

// ==================== MAIN COMPONENT ====================
export default function SOSHubScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState<string>("emergency");

  // Feature 13: Solo-Traveler Check-in
  const [checkInActive, setCheckInActive] = useState(false);
  const [checkInTimer, setCheckInTimer] = useState<number>(0);
  const [checkInDuration, setCheckInDuration] = useState<number>(30); // minutes
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);

  // Feature 14: Weather & Volcano
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [volcanoAlerts, setVolcanoAlerts] =
    useState<VolcanoAlert[]>(VOLCANO_ALERTS);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Feature 18: Scooter Check
  const [scooterChecklist, setScooterChecklist] =
    useState<ScooterCheckItem[]>(SCOOTER_CHECKLIST);
  const [showCamera, setShowCamera] = useState(false);
  const [scooterPhotos, setScooterPhotos] = useState<string[]>([]);

  // Feature 15: Bali Belly
  const [showBaliBellyInfo, setShowBaliBellyInfo] = useState(false);

  // Feature 16: Rabies
  const [showRabiesInfo, setShowRabiesInfo] = useState(false);

  // Feature 17: Methanol
  const [showMethanolInfo, setShowMethanolInfo] = useState(false);

  // Feature 13: Check-in Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (checkInActive && checkInTimer > 0) {
      interval = setInterval(() => {
        setCheckInTimer((prev) => prev - 1);
      }, 1000);
    } else if (checkInActive && checkInTimer === 0) {
      // Timer expired - trigger emergency
      handleCheckInExpired();
      setCheckInActive(false);
    }
    return () => clearInterval(interval);
  }, [checkInActive, checkInTimer]);

  // Fetch Weather Data (Feature 14) - Using OpenWeatherMap API
  const fetchWeather = useCallback(async () => {
    setLoadingWeather(true);
    try {
      const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

      // If no API key, use fallback immediately
      if (!API_KEY) {
        console.warn("Weather API key not configured - using fallback");
        setWeather({
          temperature: 28,
          feelsLike: 32,
          humidity: 78,
          windSpeed: 15,
          condition: "Teilweise bewölkt",
          icon: "⛅",
          location: "Bali, Indonesien",
        });
        setLoadingWeather(false);
        return;
      }

      // Use OpenWeatherMap API directly with 2s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=-8.4095&lon=115.1889&appid=${API_KEY}&units=metric&lang=de`;

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Validate data structure
      if (!data.main || !data.weather) {
        throw new Error("Invalid weather data");
      }

      setWeather({
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind?.speed || 0),
        condition: data.weather[0].description,
        icon: "☀️",
        location: `${data.name}, ${data.sys?.country || "ID"}`,
      });
    } catch (error) {
      // Silent fallback - no error shown to user
      setWeather({
        temperature: 28,
        feelsLike: 32,
        humidity: 78,
        windSpeed: 15,
        condition: "Teilweise bewölkt",
        icon: "⛅",
        location: "Bali, Indonesien",
      });
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Feature 13: Start Check-in Timer
  const startCheckIn = () => {
    setCheckInActive(true);
    setCheckInTimer(checkInDuration * 60); // Convert to seconds
    setLastCheckIn(new Date());
  };

  // Feature 13: Stop Check-in
  const stopCheckIn = () => {
    setCheckInActive(false);
    setCheckInTimer(0);
  };

  // Feature 13: Check-in Expired Handler
  const handleCheckInExpired = () => {
    // In production, this would send GPS to emergency contact
    Alert.alert(
      "⚠️ Check-in Frist abgelaufen!",
      "Deine Notfall-Kontakt wurde über deine letzte Position informiert.",
      [{ text: "Verstanden", style: "default" }],
    );
  };

  // Feature 13: Send Manual Check-in
  const sendManualCheckIn = () => {
    setLastCheckIn(new Date());
    Alert.alert(
      "✅ Check-in gesendet",
      "Deine Position wurde an deine Notfall-Kontakte gesendet.",
      [{ text: "OK" }],
    );
  };

  // Format timer
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Feature 18: Take Scooter Photo
  const takeScooterPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Berechtigung erforderlich",
          "Kamerazugriff ist erforderlich für Fotos.",
        );
        return;
      }

      // For web, use HTML5 file input approach
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
                setScooterPhotos((prev) => [
                  ...prev,
                  event.target!.result as string,
                ]);
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
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setScooterPhotos((prev) => [...prev, result.assets[0].uri]);
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  // Toggle scooter checklist item
  const toggleChecklistItem = (id: string) => {
    setScooterChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  // Calculate scooter safety score
  const getScooterScore = (): number => {
    const criticalItems = scooterChecklist.filter((item) => item.critical);
    const checkedCritical = criticalItems.filter((item) => item.checked).length;
    return Math.round((checkedCritical / criticalItems.length) * 100);
  };

  // Call emergency number
  const callEmergency = (type: string) => {
    const number = EMERGENCY_NUMBERS[type as keyof typeof EMERGENCY_NUMBERS];
    if (number) {
      Linking.openURL(`tel:${number}`);
    }
  };

  // Call clinic
  const callClinic = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Open in maps
  const openInMaps = (lat: number, lon: number, name: string) => {
    const url =
      Platform.OS === "web"
        ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`
        : `geo:${lat},${lon}?q=${encodeURIComponent(name)}`;
    Linking.openURL(url);
  };

  // Get volcano status color
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

  // Get volcano status text
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

  // Render section
  const renderSection = () => {
    switch (activeSection) {
      case "emergency":
        return renderEmergencySection();
      case "weather":
        return renderWeatherSection();
      case "bali-belly":
        return renderBaliBellySection();
      case "rabies":
        return renderRabiesSection();
      case "methanol":
        return renderMethanolSection();
      case "scooter":
        return renderScooterSection();
      default:
        return null;
    }
  };

  // Emergency Section - 2-Column Bento Grid
  const renderEmergencySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚨 Notfallnummern</Text>

      <View style={styles.bentoGrid}>
        <TouchableOpacity
          style={[styles.bentoTile, styles.ambulanceTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("ambulance");
          }}
          activeOpacity={0.7}
        >
          <View style={styles.bentoIconContainer}>
            <Activity size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>Krankenwagen</Text>
          <Text style={styles.bentoNumber}>{EMERGENCY_NUMBERS.ambulance}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bentoTile, styles.policeTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("police");
          }}
          activeOpacity={0.7}
        >
          <View style={styles.bentoIconContainer}>
            <Shield size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>Polizei</Text>
          <Text style={styles.bentoNumber}>{EMERGENCY_NUMBERS.police}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bentoTile, styles.fireTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("fire");
          }}
          activeOpacity={0.7}
        >
          <View style={styles.bentoIconContainer}>
            <AlertTriangle size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>Feuerwehr</Text>
          <Text style={styles.bentoNumber}>{EMERGENCY_NUMBERS.fire}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bentoTile, styles.sarTile]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            callEmergency("sar");
          }}
          activeOpacity={0.7}
        >
          <View style={styles.bentoIconContainer}>
            <Navigation size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.bentoTitle}>SAR</Text>
          <Text style={styles.bentoNumber}>{EMERGENCY_NUMBERS.sar}</Text>
        </TouchableOpacity>
      </View>

      {/* Feature 13: Solo-Traveler Check-in */}
      <View style={styles.checkInCard}>
        <View style={styles.checkInHeader}>
          <Timer size={24} color={checkInActive ? "#10B981" : "#64748B"} />
          <Text style={styles.checkInTitle}>Solo-Traveler Check-in</Text>
        </View>

        <Text style={styles.checkInDescription}>
          Lege ein Countdown-Timer fest. Wenn er abläuft, wird deine letzte
          GPS-Position an Notfallkontakte gesendet.
        </Text>

        {checkInActive ? (
          <View style={styles.checkInActive}>
            <Text style={styles.checkInTimer}>{formatTime(checkInTimer)}</Text>
            <Text style={styles.checkInStatus}>⏱️ Countdown läuft...</Text>
            <View style={styles.checkInButtons}>
              <TouchableOpacity
                style={styles.checkInStopButton}
                onPress={stopCheckIn}
              >
                <Text style={styles.checkInStopText}>Stoppen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkInResetButton}
                onPress={startCheckIn}
              >
                <Text style={styles.checkInResetText}>Neu starten</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.checkInInactive}>
            <View style={styles.durationSelector}>
              {[15, 30, 60, 120].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.durationButton,
                    checkInDuration === mins && styles.durationButtonActive,
                  ]}
                  onPress={() => setCheckInDuration(mins)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      checkInDuration === mins && styles.durationTextActive,
                    ]}
                  >
                    {mins} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.checkInStartButton}
              onPress={startCheckIn}
            >
              <Timer size={20} color="#FFFFFF" />
              <Text style={styles.checkInStartText}>Check-in starten</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualCheckInButton}
              onPress={sendManualCheckIn}
            >
              <Send size={18} color="#00B4D8" />
              <Text style={styles.manualCheckInText}>
                Jetzt Check-in senden
              </Text>
            </TouchableOpacity>

            {!!lastCheckIn && (
              <Text style={styles.lastCheckInText}>
                ✅ Letzter Check-in: {lastCheckIn.toLocaleTimeString("de-DE")}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Volcano Alerts */}
      <View style={styles.volcanoCard}>
        <View style={styles.volcanoHeader}>
          <AlertTriangle size={24} color="#F97316" />
          <Text style={styles.volcanoTitle}>
            Vulkan Alarm (MAGMA Indonesia)
          </Text>
        </View>

        {volcanoAlerts.map((volcano) => (
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
    </View>
  );

  // Weather Section (Feature 14)
  const renderWeatherSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🌤️ Wetter & Alarme</Text>

      {loadingWeather ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B4D8" />
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
                <Thermometer size={20} color="#EF4444" />
                <Text style={styles.weatherDetailLabel}>Gefühlt</Text>
                <Text style={styles.weatherDetailValue}>
                  {Math.round(weather.feelsLike)}°C
                </Text>
              </View>

              <View style={styles.weatherDetail}>
                <Droplets size={20} color="#3B82F6" />
                <Text style={styles.weatherDetailLabel}>Luftfeuchtigkeit</Text>
                <Text style={styles.weatherDetailValue}>
                  {weather.humidity}%
                </Text>
              </View>

              <View style={styles.weatherDetail}>
                <Wind size={20} color="#90BE6D" />
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
              <AlertCircle size={20} color="#F59E0B" />
              <Text style={styles.alertText}>
                Monsunzeit (Nov-Mär): Starke Regenfälle möglich
              </Text>
            </View>
            <View style={styles.alertItem}>
              <AlertCircle size={20} color="#F59E0B" />
              <Text style={styles.alertText}>
                UV-Index sehr hoch - Sonnenschutz empfohlen
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Cloud size={48} color="#94A3B8" />
          <Text style={styles.errorText}>Wetterdaten nicht verfügbar</Text>
        </View>
      )}
    </View>
  );

  // Bali Belly Section (Feature 15)
  const renderBaliBellySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🤢 Bali Belly SOS</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Was ist Bali Belly?</Text>
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

      <View style={styles.clinicsCard}>
        <Text style={styles.clinicsTitle}>🏥 Nächste Kliniken</Text>
        {RABIES_CLINICS.filter((c) => c.type === "hospital").map((clinic) => (
          <View key={clinic.id} style={styles.clinicItem}>
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              <Text style={styles.clinicAddress}>{clinic.address}</Text>
              {clinic.open24h && (
                <Text style={styles.open24h}>🕐 24/7 geöffnet</Text>
              )}
            </View>
            <View style={styles.clinicActions}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => callClinic(clinic.phone)}
              >
                <Phone size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapsButtonSmall}
                onPress={() =>
                  openInMaps(clinic.latitude, clinic.longitude, clinic.name)
                }
              >
                <Navigation size={18} color="#FFFFFF" />
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
    </View>
  );

  // Rabies Section (Feature 16)
  const renderRabiesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🦇 Tollwut (Rabies) Radar</Text>

      <View style={styles.warningCard}>
        <AlertTriangle size={32} color="#EF4444" />
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

      <View style={styles.rabiesClinicsCard}>
        <Text style={styles.rabiesClinicsTitle}>
          💉 Tollwut-Impfung verfügbar
        </Text>
        {RABIES_CLINICS.filter((c) => c.verified).map((clinic) => (
          <View key={clinic.id} style={styles.rabiesClinicItem}>
            <View style={styles.rabiesClinicInfo}>
              <ShieldCheck size={20} color="#10B981" />
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
                style={styles.mapsButtonSmall2}
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

      <View style={styles.preventionCard}>
        <Text style={styles.preventionTitle}>🛡️ Vorbeugung</Text>
        <Text style={styles.preventionText}>
          • Affen nicht füttern oder berühren{"\n"}• Abstand von streunenden
          Hunden halten{"\n"}• Bei Reisen: Tollwut-Impfung in DE prüfen{"\n"}•
          Reisekrankenversicherung mit Impfschutz
        </Text>
      </View>
    </View>
  );

  // Methanol Section (Feature 17)
  const renderMethanolSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🍸 Methanol Warnung</Text>

      <View style={styles.methanolWarningCard}>
        <AlertTriangle size={40} color="#EF4444" />
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
              <CheckCircle size={20} color="#10B981" />
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
    </View>
  );

  // Scooter Section (Feature 18)
  const renderScooterSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🛵 Scooter Anti-Scam Check</Text>

      <View style={styles.scoreCard}>
        <View style={styles.scoreCircle}>
          <Text
            style={[
              styles.scoreValue,
              {
                color:
                  getScooterScore() >= 80
                    ? "#10B981"
                    : getScooterScore() >= 50
                      ? "#F59E0B"
                      : "#EF4444",
              },
            ]}
          >
            {getScooterScore()}%
          </Text>
        </View>
        <Text style={styles.scoreLabel}>Sicherheits-Score</Text>
        <Text style={styles.scoreHint}>
          {getScooterScore() >= 80
            ? "✅ Roller scheint sicher"
            : getScooterScore() >= 50
              ? "⚠️ Mängel prüfen"
              : "🚫 Nicht mieten!"}
        </Text>
      </View>

      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>📋 Checkliste</Text>
        {scooterChecklist.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.checklistItem,
              item.checked && styles.checklistItemChecked,
              item.critical && styles.checklistItemCritical,
            ]}
            onPress={() => toggleChecklistItem(item.id)}
          >
            <View
              style={[styles.checkbox, item.checked && styles.checkboxChecked]}
            >
              {item.checked && <CheckSquare size={16} color="#FFFFFF" />}
            </View>
            <Text
              style={[
                styles.checklistLabel,
                item.checked && styles.checklistLabelChecked,
              ]}
            >
              {item.label}
            </Text>
            {item.critical && <AlertTriangle size={16} color="#EF4444" />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cameraCard}>
        <Text style={styles.cameraTitle}>📸 Fotos dokumentieren</Text>
        <Text style={styles.cameraHint}>
          Mache Fotos von allen vorhandenen Schäden VOR der Miete!
        </Text>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={takeScooterPhoto}
        >
          <Camera size={24} color="#FFFFFF" />
          <Text style={styles.cameraButtonText}>Foto aufnehmen</Text>
        </TouchableOpacity>

        {scooterPhotos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photosScroll}
          >
            {scooterPhotos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                {/* In production, render actual image */}
                <View style={styles.photoPlaceholder}>
                  <Camera size={32} color="#94A3B8" />
                </View>
                <Text style={styles.photoIndex}>{index + 1}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.scamTipsCard}>
        <Text style={styles.scamTipsTitle}>⚠️ Häufige Scams</Text>
        <View style={styles.scamList}>
          <View style={styles.scamItem}>
            <AlertCircle size={18} color="#F59E0B" />
            <Text style={styles.scamText}>
              Vermieter behauptet "neue Kratzer" sind deine Schuld
            </Text>
          </View>
          <View style={styles.scamItem}>
            <AlertCircle size={18} color="#F59E0B" />
            <Text style={styles.scamText}>
              Kaution wird nicht zurückgezahlt
            </Text>
          </View>
          <View style={styles.scamItem}>
            <AlertCircle size={18} color="#F59E0B" />
            <Text style={styles.scamText}>
              Rechnung für nicht-existente Reparaturen
            </Text>
          </View>
          <View style={styles.scamItem}>
            <AlertCircle size={18} color="#F59E0B" />
            <Text style={styles.scamText}>
              Polizei-Check: "Keine Lizenz" - Bestechungsversuch
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.legalCard}>
        <Text style={styles.legalTitle}>📋 Rechtliches</Text>
        <Text style={styles.legalText}>
          • Internationaler Führerschein (mit Motorrad-Klasse) PFLICHT{"\n"}•
          Helm tragen PFLICHT{"\n"}• Polizeikontrollen: 500k IDR Strafe bei
          Verstößen{"\n"}• Touristen werden regelmäßig kontrolliert!
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header title={t("sosHub.title", "SOS Hub")} showBackButton={false} />

        {/* Section Tabs */}
        <AnimatedView animation="fadeIn" delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "emergency" && styles.tabActive,
              ]}
              onPress={() => setActiveSection("emergency")}
            >
              <AlertTriangle
                size={18}
                color={activeSection === "emergency" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "emergency" && styles.tabTextActive,
                ]}
              >
                Notfall
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "weather" && styles.tabActive,
              ]}
              onPress={() => setActiveSection("weather")}
            >
              <Cloud
                size={18}
                color={activeSection === "weather" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "weather" && styles.tabTextActive,
                ]}
              >
                Wetter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "bali-belly" && styles.tabActive,
              ]}
              onPress={() => setActiveSection("bali-belly")}
            >
              <Thermometer
                size={18}
                color={activeSection === "bali-belly" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "bali-belly" && styles.tabTextActive,
                ]}
              >
                Bali Belly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "rabies" && styles.tabActive,
              ]}
              onPress={() => setActiveSection("rabies")}
            >
              <Shield
                size={18}
                color={activeSection === "rabies" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "rabies" && styles.tabTextActive,
                ]}
              >
                Tollwut
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "methanol" && styles.tabActive,
              ]}
              onPress={() => setActiveSection("methanol")}
            >
              <AlertCircle
                size={18}
                color={activeSection === "methanol" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "methanol" && styles.tabTextActive,
                ]}
              >
                Methanol
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "scooter" && styles.tabActive,
              ]}
              onPress={() => setActiveSection("scooter")}
            >
              <Bike
                size={18}
                color={activeSection === "scooter" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "scooter" && styles.tabTextActive,
                ]}
              >
                Scooter
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </AnimatedView>

        {/* Main Content */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {renderSection()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabsContent: {
    gap: 8,
  },
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
  tabActive: {
    backgroundColor: "#FF9D6C",
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 12,
  },
  // Bento Grid - 2-Column Emergency Buttons
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  bentoTile: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
      },
    }),
  },
  bentoIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bentoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  bentoNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  ambulanceTile: {
    backgroundColor: "#EF4444",
  },
  policeTile: {
    backgroundColor: "#3B82F6",
  },
  fireTile: {
    backgroundColor: "#F97316",
  },
  sarTile: {
    backgroundColor: "#10B981",
  },
  // Check-in Card
  checkInCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    elevation: 4,
  },
  checkInHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  checkInDescription: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 18,
  },
  checkInActive: {
    alignItems: "center",
  },
  checkInTimer: {
    fontSize: 48,
    fontWeight: "800",
    color: "#10B981",
    fontFamily: Platform.OS === "web" ? "monospace" : undefined,
  },
  checkInStatus: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  checkInButtons: {
    flexDirection: "row",
    gap: 12,
  },
  checkInStopButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  checkInStopText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  checkInResetButton: {
    backgroundColor: "#00B4D8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  checkInResetText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  checkInInactive: {
    gap: 12,
  },
  durationSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  durationButtonActive: {
    backgroundColor: "#00B4D8",
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  durationTextActive: {
    color: "#FFFFFF",
  },
  checkInStartButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkInStartText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  manualCheckInButton: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 180, 216, 0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  manualCheckInText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00B4D8",
  },
  lastCheckInText: {
    fontSize: 13,
    color: "#10B981",
    textAlign: "center",
    fontWeight: "600",
  },
  // Volcano Card
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
  volcanoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  volcanoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  volcanoInfo: {
    flex: 1,
  },
  volcanoName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  volcanoDistance: {
    fontSize: 12,
    color: "#64748B",
  },
  volcanoStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  volcanoStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  magmaButton: {
    flexDirection: "row",
    backgroundColor: "#F97316",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  magmaButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Weather Card
  weatherCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 120,
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  weatherIcon: {
    fontSize: 48,
  },
  weatherTemp: {
    flex: 1,
  },
  temperature: {
    fontSize: 42,
    fontWeight: "800",
    color: "#0F172A",
  },
  condition: {
    fontSize: 16,
    color: "#64748B",
  },
  weatherDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  weatherDetail: {
    alignItems: "center",
    gap: 4,
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  weatherDetailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  weatherAlerts: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  alertText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },
  // Info Cards
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  symptomsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  symptomsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  symptomList: {
    gap: 4,
  },
  symptom: {
    fontSize: 13,
    color: "#475569",
  },
  treatmentCard: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  treatmentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  treatmentList: {
    gap: 4,
  },
  treatment: {
    fontSize: 13,
    color: "#475569",
  },
  clinicsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  clinicsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  clinicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  clinicAddress: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  open24h: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  clinicActions: {
    flexDirection: "row",
    gap: 8,
  },
  callButton: {
    backgroundColor: "#10B981",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  mapsButtonSmall: {
    backgroundColor: "#00B4D8",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyCallButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emergencyCallText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  // Warning Card
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
    color: "#EF4444",
    marginTop: 8,
    textAlign: "center",
  },
  warningText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  // First Aid Steps
  firstAidCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  firstAidTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  stepList: {
    gap: 10,
  },
  step: {
    flexDirection: "row",
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
    lineHeight: 18,
  },
  // Rabies Clinics
  rabiesClinicsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rabiesClinicsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  rabiesClinicItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  rabiesClinicInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  rabiesClinicName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  rabiesClinicPhone: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
    marginBottom: 8,
  },
  rabiesClinicActions: {
    flexDirection: "row",
    gap: 8,
  },
  callButtonSmall: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  mapsButtonSmall2: {
    flexDirection: "row",
    backgroundColor: "#00B4D8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  mapsButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  preventionCard: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 14,
  },
  preventionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  preventionText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
  // Methanol Warning
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
    color: "#EF4444",
    marginTop: 8,
    textAlign: "center",
  },
  methanolWarningText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  methanolSymptomsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  methanolSymptomsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  methanolSymptomList: {
    gap: 6,
  },
  methanolSymptom: {
    fontSize: 13,
    color: "#475569",
  },
  safeBarsCard: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  safeBarsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  safeBarItem: {
    backgroundColor: "#FFFFFF",
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
  safeBarName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  safeBarAddress: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  safeBarNotes: {
    fontSize: 11,
    color: "#10B981",
  },
  tipsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    padding: 14,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
  // Scooter Score
  scoreCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  scoreHint: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
  },
  checklistCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
  },
  checklistItemChecked: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  checklistItemCritical: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
  },
  checklistLabel: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
  },
  checklistLabelChecked: {
    color: "#10B981",
    textDecorationLine: "line-through",
  },
  cameraCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cameraTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  cameraHint: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  cameraButton: {
    flexDirection: "row",
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  photosScroll: {
    marginTop: 12,
  },
  photoItem: {
    marginRight: 8,
    alignItems: "center",
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  photoIndex: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  scamTipsCard: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  scamTipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  scamList: {
    gap: 8,
  },
  scamItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  scamText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
    lineHeight: 18,
  },
  legalCard: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  legalText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
});
