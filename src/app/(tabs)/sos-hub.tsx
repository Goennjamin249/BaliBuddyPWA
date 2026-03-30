import {
  AlertTriangle,
  Cloud,
  MapPin,
  Mountain,
  Phone,
  Shield,
  Stethoscope,
  Timer,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalHeader from "../../components/GlobalHeader";
import healthGuidesData from "../../data/healthGuides.json";

// Alert interface
interface Alert {
  id: string;
  type: "weather" | "volcano" | "health" | "safety";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  timestamp: Date;
}

// Emergency contact interface
interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  icon: React.ReactNode;
}

export default function SOSHubScreen() {
  const { t, i18n } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sosTimer, setSosTimer] = useState<number | null>(null);
  const [isSosActive, setIsSosActive] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<
    "baliBelly" | "rabies" | "methanol" | null
  >(null);

  // Emergency contacts
  const emergencyContacts: EmergencyContact[] = [
    {
      id: "police",
      name: t("sos.police", "Polizei"),
      number: "110",
      description: t("sos.policeDesc", "Notruf Polizei"),
      icon: <Shield size={24} color="#3B82F6" />,
    },
    {
      id: "ambulance",
      name: t("sos.ambulance", "Krankenwagen"),
      number: "118",
      description: t("sos.ambulanceDesc", "Notruf Krankenwagen"),
      icon: <Stethoscope size={24} color="#EF4444" />,
    },
    {
      id: "fire",
      name: t("sos.fire", "Feuerwehr"),
      number: "113",
      description: t("sos.fireDesc", "Notruf Feuerwehr"),
      icon: <AlertTriangle size={24} color="#F97316" />,
    },
    {
      id: "tourist",
      name: t("sos.tourist", "Touristenpolizei"),
      number: "0361-224111",
      description: t("sos.touristDesc", "Touristenpolizei Bali"),
      icon: <Shield size={24} color="#10B981" />,
    },
  ];

  // Fetch alerts from real APIs
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const alertsData: Alert[] = [];

      // Fetch weather alerts from Open-Meteo
      try {
        const weatherResponse = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-8.4095&longitude=115.1889&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Makassar&forecast_days=3",
        );
        const weatherData = await weatherResponse.json();

        // Check for severe weather conditions
        if (weatherData.daily) {
          const { precipitation_sum, weathercode } = weatherData.daily;

          // Heavy rain alert (precipitation > 20mm)
          if (
            precipitation_sum &&
            precipitation_sum.some((val: number) => val > 20)
          ) {
            alertsData.push({
              id: "weather-rain",
              type: "weather",
              title: t("sos.heavyRain", "Starkregen Warnung"),
              description: t(
                "sos.heavyRainDesc",
                "Erwartete Starkregenfälle in den nächsten 3 Tagen",
              ),
              severity: "medium",
              timestamp: new Date(),
            });
          }

          // Thunderstorm alert (weathercode 95, 96, 99)
          if (
            weathercode &&
            weathercode.some((code: number) => [95, 96, 99].includes(code))
          ) {
            alertsData.push({
              id: "weather-storm",
              type: "weather",
              title: t("sos.thunderstorm", "Gewitter Warnung"),
              description: t(
                "sos.thunderstormDesc",
                "Gewitter in den nächsten Tagen erwartet",
              ),
              severity: "high",
              timestamp: new Date(),
            });
          }
        }
      } catch (weatherError) {
        console.error("Weather API error:", weatherError);
      }

      // Simulate volcano alert (MAGMA RSS would be used in production)
      // For now, we simulate based on random chance
      const randomAlert = Math.random();
      if (randomAlert > 0.7) {
        alertsData.push({
          id: "volcano-agung",
          type: "volcano",
          title: t("sos.volcanoAlert", "Vulkan Aktivität"),
          description: t(
            "sos.volcanoAlertDesc",
            "Erhöhte Aktivität am Mount Agung",
          ),
          severity: "low",
          timestamp: new Date(),
        });
      }

      // Add default safety reminder if no alerts
      if (alertsData.length === 0) {
        alertsData.push({
          id: "safety-reminder",
          type: "safety",
          title: t("sos.safetyReminder", "Sicherheitshinweis"),
          description: t(
            "sos.safetyReminderDesc",
            "Keine aktuellen Warnungen. Genießen Sie Ihren Aufenthalt!",
          ),
          severity: "low",
          timestamp: new Date(),
        });
      }

      setAlerts(alertsData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Fallback to mock data on error
      setAlerts([
        {
          id: "fallback",
          type: "safety",
          title: t("sos.dataUnavailable", "Daten nicht verfügbar"),
          description: t(
            "sos.dataUnavailableDesc",
            "Warnungen konnten nicht geladen werden",
          ),
          severity: "low",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // SOS Timer functions
  const startSosTimer = () => {
    setIsSosActive(true);
    setSosTimer(30); // 30 seconds countdown

    const interval = setInterval(() => {
      setSosTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setIsSosActive(false);
          // Trigger SOS action
          handleSosTrigger();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSosTimer = () => {
    setIsSosActive(false);
    setSosTimer(null);
  };

  const handleSosTrigger = () => {
    // Get current location and send SMS
    if (Platform.OS === "web" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const message = `SOS! Ich brauche Hilfe! Meine Position: ${latitude}, ${longitude}`;
          const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
          Linking.openURL(smsUrl);
        },
        (error) => {
          console.error("Location error:", error);
          const message = "SOS! Ich brauche Hilfe!";
          const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
          Linking.openURL(smsUrl);
        },
      );
    }
  };

  // Call emergency number
  const callEmergency = (number: string) => {
    const telUrl = `tel:${number}`;
    Linking.openURL(telUrl);
  };

  // Get severity color
  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  // Get alert icon
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "weather":
        return <Cloud size={20} color="#3B82F6" />;
      case "volcano":
        return <Mountain size={20} color="#F97316" />;
      case "health":
        return <Stethoscope size={20} color="#EF4444" />;
      case "safety":
        return <Shield size={20} color="#10B981" />;
      default:
        return <AlertTriangle size={20} color="#6B7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Global Header */}
      <GlobalHeader
        title={t("sos.title", "SOS Hub")}
        showBackButton={false}
        showSettings={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SOS Timer */}
        <View style={styles.sosSection}>
          <Text style={styles.sectionTitle}>
            {t("sos.sosTimer", "SOS Timer")}
          </Text>
          <View style={styles.sosCard}>
            {isSosActive ? (
              <View style={styles.sosActiveContainer}>
                <Timer size={48} color="#EF4444" />
                <Text style={styles.sosTimerText}>{sosTimer}s</Text>
                <Text style={styles.sosTimerLabel}>
                  {t("sos.sendingSms", "SMS wird gesendet...")}
                </Text>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelSosTimer}
                >
                  <Text style={styles.cancelButtonText}>
                    {t("sos.cancel", "Abbrechen")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.sosButton}
                onPress={startSosTimer}
              >
                <AlertTriangle size={32} color="#FFFFFF" />
                <Text style={styles.sosButtonText}>
                  {t("sos.startSos", "SOS starten")}
                </Text>
                <Text style={styles.sosButtonHint}>
                  {t("sos.sosHint", "30s Timer für Notfall-SMS")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>
            {t("sos.emergencyContacts", "Notfallkontakte")}
          </Text>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => callEmergency(contact.number)}
            >
              <View style={styles.contactIconContainer}>{contact.icon}</View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDescription}>
                  {contact.description}
                </Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <Phone size={20} color="#10B981" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Alerts */}
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>
            {t("sos.alerts", "Warnungen")}
          </Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {t("sos.loading", "Lade Warnungen...")}
              </Text>
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Shield size={48} color="#10B981" />
              <Text style={styles.emptyText}>
                {t("sos.noAlerts", "Keine Warnungen")}
              </Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  {getAlertIcon(alert.type)}
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(alert.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDescription}>{alert.description}</Text>
                <Text style={styles.alertTimestamp}>
                  {alert.timestamp.toLocaleTimeString("de-DE")}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>
            {t("sos.quickActions", "Schnellaktionen")}
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <MapPin size={24} color="#00B4D8" />
              <Text style={styles.quickActionText}>
                {t("sos.shareLocation", "Position teilen")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Stethoscope size={24} color="#EF4444" />
              <Text style={styles.quickActionText}>
                {t("sos.firstAid", "Erste Hilfe")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Guides */}
        <View style={styles.healthGuidesSection}>
          <Text style={styles.sectionTitle}>
            {t("sos.healthGuides", "Gesundheitsratgeber")}
          </Text>

          {selectedGuide ? (
            <View style={styles.guideDetail}>
              <TouchableOpacity
                style={styles.backButtonDetail}
                onPress={() => setSelectedGuide(null)}
              >
                <Text style={styles.backButtonTextDetail}>
                  ← {t("common.back", "Zurück")}
                </Text>
              </TouchableOpacity>

              <Text style={styles.guideTitle}>
                {
                  (healthGuidesData as any)[selectedGuide].title[
                    i18n.language === "de" ? "de" : "en"
                  ]
                }
              </Text>
              <Text style={styles.guideDescription}>
                {
                  (healthGuidesData as any)[selectedGuide].description[
                    i18n.language === "de" ? "de" : "en"
                  ]
                }
              </Text>

              {/* Symptoms */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>
                  ⚠️ {t("sos.symptoms", "Symptome")}
                </Text>
                {(healthGuidesData as any)[selectedGuide].symptoms.map(
                  (s: any, idx: number) => (
                    <Text key={idx} style={styles.guideItem}>
                      • {s[i18n.language === "de" ? "de" : "en"]}
                    </Text>
                  ),
                )}
              </View>

              {/* Treatment */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>
                  💊 {t("sos.treatment", "Behandlung")}
                </Text>
                {(healthGuidesData as any)[selectedGuide].treatment.map(
                  (s: any, idx: number) => (
                    <Text key={idx} style={styles.guideItem}>
                      • {s[i18n.language === "de" ? "de" : "en"]}
                    </Text>
                  ),
                )}
              </View>

              {/* Prevention */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>
                  🛡️ {t("sos.prevention", "Vorbeugung")}
                </Text>
                {(healthGuidesData as any)[selectedGuide].prevention.map(
                  (s: any, idx: number) => (
                    <Text key={idx} style={styles.guideItem}>
                      • {s[i18n.language === "de" ? "de" : "en"]}
                    </Text>
                  ),
                )}
              </View>

              {/* Emergency Contacts */}
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>
                  📞 {t("sos.emergencyContacts", "Notfallkontakte")}
                </Text>
                {(healthGuidesData as any)[selectedGuide].emergencyContacts.map(
                  (c: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.emergencyContactCard}
                      onPress={() => Linking.openURL(`tel:${c.phone}`)}
                    >
                      <Text style={styles.contactName}>{c.name}</Text>
                      <Text style={styles.contactPhone}>{c.phone}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* Important Note */}
              {(healthGuidesData as any)[selectedGuide].importantNote && (
                <View style={styles.importantNote}>
                  <Text style={styles.importantNoteText}>
                    ⚠️{" "}
                    {
                      (healthGuidesData as any)[selectedGuide].importantNote[
                        i18n.language === "de" ? "de" : "en"
                      ]
                    }
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.healthGuidesGrid}>
              <TouchableOpacity
                style={styles.healthGuideCard}
                onPress={() => setSelectedGuide("baliBelly")}
              >
                <Text style={styles.healthGuideIcon}>🤢</Text>
                <Text style={styles.healthGuideTitle}>
                  {t("sos.baliBelly", "Bali Belly")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.healthGuideCard}
                onPress={() => setSelectedGuide("rabies")}
              >
                <Text style={styles.healthGuideIcon}>🐕</Text>
                <Text style={styles.healthGuideTitle}>
                  {t("sos.rabies", "Tollwut")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.healthGuideCard}
                onPress={() => setSelectedGuide("methanol")}
              >
                <Text style={styles.healthGuideIcon}>🍺</Text>
                <Text style={styles.healthGuideTitle}>
                  {t("sos.methanol", "Methanol")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF2F2",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  sosSection: {
    marginBottom: 24,
  },
  sosCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sosButton: {
    backgroundColor: "#EF4444",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
  },
  sosButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
  },
  sosButtonHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  sosActiveContainer: {
    alignItems: "center",
  },
  sosTimerText: {
    fontSize: 48,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 12,
  },
  sosTimerLabel: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#6B7280",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contactsSection: {
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactDescription: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  alertsSection: {
    marginBottom: 24,
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
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  alertTimestamp: {
    fontSize: 12,
    color: "#94A3B8",
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 8,
    textAlign: "center",
  },
  healthGuidesSection: {
    marginBottom: 24,
  },
  healthGuidesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  healthGuideCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  healthGuideIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  healthGuideTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
  guideDetail: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  backButtonDetail: {
    marginBottom: 16,
  },
  backButtonTextDetail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00B4D8",
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  guideDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 20,
  },
  guideSection: {
    marginBottom: 16,
  },
  guideSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  guideItem: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 4,
  },
  emergencyContactCard: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  contactPhone: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginTop: 4,
  },
  importantNote: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  importantNoteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    lineHeight: 20,
  },
});
