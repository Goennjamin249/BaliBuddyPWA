import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import {
  Camera,
  Scan,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Utensils,
  ArrowLeft,
  Shield,
  X,
} from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";

import { useTheme } from "../../theme/ThemeContext";

// Types
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
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

// Constants
const RISK_COLORS = {
  low: "#90BE6D",
  medium: "#F59E0B",
  high: "#EF4444",
} as const;

const DEFAULT_ALLERGENS: AllergenInfo[] = [
  { id: "gluten", name: "Gluten", icon: "🌾", selected: false },
  { id: "dairy", name: "Milch", icon: "🥛", selected: false },
  { id: "nuts", name: "Nüsse", icon: "🥜", selected: false },
  { id: "shellfish", name: "Meeresfr.", icon: "🦐", selected: false },
  { id: "eggs", name: "Eier", icon: "🥚", selected: false },
  { id: "soy", name: "Soja", icon: "🫘", selected: false },
];

// Sub-components
interface AllergenSelectorProps {
  allergens: AllergenInfo[];
  onToggle: (id: string) => void;
}

const AllergenSelector: React.FC<AllergenSelectorProps> = React.memo(
  ({ allergens, onToggle }) => {
    const { colors } = useTheme();

    return (
      <View style={styles.allergenSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Deine Allergien
        </Text>
        <View style={styles.allergenChips}>
          {allergens.map((allergen) => (
            <TouchableOpacity
              key={allergen.id}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggle(allergen.id);
              }}
              style={[
                styles.allergenChip,
                allergen.selected
                  ? {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    }
                  : {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
              ]}
              accessibilityLabel={`${allergen.name} ${allergen.selected ? "ausgewählt" : "nicht ausgewählt"}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: allergen.selected }}
              activeOpacity={0.7}
            >
              <Text style={styles.allergenIcon}>{allergen.icon}</Text>
              <Text
                style={[
                  styles.allergenText,
                  allergen.selected
                    ? { color: "#FFFFFF", fontWeight: "600" }
                    : { color: colors.textMuted },
                ]}
              >
                {allergen.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  },
);

AllergenSelector.displayName = "AllergenSelector";

interface CameraSectionProps {
  hasPermission: boolean | null;
  isScanning: boolean;
  onScan: () => void;
  onRequestPermission: () => void;
}

const CameraSection: React.FC<CameraSectionProps> = React.memo(
  ({ hasPermission, isScanning, onScan, onRequestPermission }) => {
    const { colors } = useTheme();

    if (hasPermission === null) {
      return (
        <View
          style={[
            styles.cameraContainer,
            { backgroundColor: colors.cardMuted },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.cameraLoadingText, { color: colors.textMuted }]}>
            Kamera wird geladen...
          </Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View
          style={[
            styles.cameraContainer,
            { backgroundColor: colors.cardMuted },
          ]}
        >
          <Camera size={48} color={colors.textMuted} />
          <Text
            style={[styles.cameraPermissionText, { color: colors.textMuted }]}
          >
            Kamera-Zugriff erforderlich
          </Text>
          <TouchableOpacity
            onPress={onRequestPermission}
            style={[
              styles.permissionButton,
              { backgroundColor: colors.primary },
            ]}
            accessibilityLabel="Kamera-Zugriff erlauben"
            activeOpacity={0.7}
          >
            <Text style={styles.permissionButtonText}>Zugriff erlauben</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraWrapper}>
        <CameraView style={styles.camera} facing="back">
          <View style={styles.cameraOverlay}>
            {/* Glass-morphic scan frame */}
            <View style={styles.scanFrame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
            <Text style={styles.scanGuideText}>
              Speisekarte hier positionieren
            </Text>
          </View>
        </CameraView>

        {/* Glass-morphic scan button */}
        <TouchableOpacity
          onPress={onScan}
          disabled={isScanning}
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          accessibilityLabel="Speisekarte scannen"
          activeOpacity={0.7}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Scan size={20} color={colors.primary} />
              <Text style={styles.scanButtonText}>Scannen</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

CameraSection.displayName = "CameraSection";

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(({ item }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.menuItemCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      accessibilityLabel={`${item.name}, ${item.price}, ${item.isSafe ? "sicher" : "Vorsicht"}`}
    >
      <View style={styles.menuItemHeader}>
        <View style={styles.menuItemInfo}>
          <Text style={[styles.menuItemName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.menuItemDescription, { color: colors.textMuted }]}
          >
            {item.description}
          </Text>
        </View>
        <View style={styles.menuItemMeta}>
          <Text style={[styles.menuItemPrice, { color: colors.primary }]}>
            {item.price}
          </Text>
          <View
            style={[
              styles.safetyBadge,
              { backgroundColor: `${RISK_COLORS[item.riskLevel]}20` },
            ]}
          >
            {item.isSafe ? (
              <CheckCircle size={16} color={RISK_COLORS[item.riskLevel]} />
            ) : (
              <AlertTriangle size={16} color={RISK_COLORS[item.riskLevel]} />
            )}
            <Text
              style={[
                styles.safetyBadgeText,
                { color: RISK_COLORS[item.riskLevel] },
              ]}
            >
              {item.isSafe ? "Sicher" : "Vorsicht"}
            </Text>
          </View>
        </View>
      </View>
      {item.allergens.length > 0 && (
        <View style={styles.allergenTags}>
          {item.allergens.map((allergen, index) => (
            <View key={index} style={styles.allergenTag}>
              <Text style={styles.allergenTagText}>{allergen}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

MenuItemCard.displayName = "MenuItemCard";

// Main Component
export default function ScannerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [allergens, setAllergens] = useState<AllergenInfo[]>(DEFAULT_ALLERGENS);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<MenuItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Handlers
  const handleToggleAllergen = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAllergens((prev) =>
      prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)),
    );
  }, []);

  const handleScan = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsScanning(true);

    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock scanned menu items
    const mockItems: MenuItem[] = [
      {
        id: "1",
        name: "Nasi Goreng",
        description: "Gebratener Reis mit Gemüse und Ei",
        price: "45.000 IDR",
        allergens: ["Eier", "Soja"],
        isSafe: true,
        riskLevel: "low",
      },
      {
        id: "2",
        name: "Mie Goreng",
        description: "Gebratene Nudeln mit Garnelen",
        price: "50.000 IDR",
        allergens: ["Meeresfrüchte", "Gluten"],
        isSafe: false,
        riskLevel: "high",
      },
      {
        id: "3",
        name: "Gado-Gado",
        description: "Gemüsesalat mit Erdnusssauce",
        price: "35.000 IDR",
        allergens: ["Nüsse"],
        isSafe: false,
        riskLevel: "medium",
      },
    ];

    setScannedItems(mockItems);
    setShowResults(true);
    setIsScanning(false);
  }, []);

  const handleReset = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowResults(false);
    setScannedItems([]);
  }, []);

  // Render
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          accessibilityLabel="Zurück"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("scanner.title", "Speisekarten-Scanner")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!showResults ? (
          <>
            {/* Allergen Selection */}
            <AllergenSelector
              allergens={allergens}
              onToggle={handleToggleAllergen}
            />

            {/* Camera Section */}
            <View style={styles.cameraSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Speisekarte scannen
              </Text>
              <CameraSection
                hasPermission={permission?.granted ?? null}
                isScanning={isScanning}
                onScan={handleScan}
                onRequestPermission={requestPermission}
              />
            </View>

            {/* Info Card */}
            <View
              style={[styles.infoCard, { backgroundColor: colors.cardMuted }]}
            >
              <View style={styles.infoCardContent}>
                <Shield size={24} color={colors.primary} />
                <View style={styles.infoCardText}>
                  <Text style={[styles.infoCardTitle, { color: colors.text }]}>
                    Wie funktioniert der Scanner?
                  </Text>
                  <Text
                    style={[
                      styles.infoCardDescription,
                      { color: colors.textMuted },
                    ]}
                  >
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
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>
                Scan-Ergebnisse
              </Text>
              <TouchableOpacity
                onPress={handleReset}
                style={[
                  styles.resetButton,
                  { backgroundColor: colors.cardMuted },
                ]}
                accessibilityLabel="Erneut scannen"
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.resetButtonText, { color: colors.textMuted }]}
                >
                  Erneut scannen
                </Text>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View
              style={[styles.summaryCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text
                    style={[styles.summaryStatValue, { color: colors.text }]}
                  >
                    {scannedItems.length}
                  </Text>
                  <Text
                    style={[
                      styles.summaryStatLabel,
                      { color: colors.textMuted },
                    ]}
                  >
                    Gerichte
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryStatDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatValueSuccess}>
                    {scannedItems.filter((i) => i.isSafe).length}
                  </Text>
                  <Text
                    style={[
                      styles.summaryStatLabel,
                      { color: colors.textMuted },
                    ]}
                  >
                    Sicher
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryStatDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatValueWarning}>
                    {scannedItems.filter((i) => !i.isSafe).length}
                  </Text>
                  <Text
                    style={[
                      styles.summaryStatLabel,
                      { color: colors.textMuted },
                    ]}
                  >
                    Vorsicht
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            {scannedItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 140,
  },
  allergenSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  allergenChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergenChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  allergenIcon: {
    fontSize: 16,
  },
  allergenText: {
    fontSize: 13,
  },
  cameraSection: {
    marginBottom: 20,
  },
  cameraContainer: {
    height: 280,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraLoadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  cameraPermissionText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  permissionButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cameraWrapper: {
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 220,
    height: 220,
    position: "relative",
  },
  cornerTopLeft: {
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
  cornerTopRight: {
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
  cornerBottomLeft: {
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
  cornerBottomRight: {
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
  scanGuideText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanButton: {
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
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: "#00B4D8",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  infoCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryStatDivider: {
    width: 1,
    height: 40,
  },
  summaryStatValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  summaryStatValueSuccess: {
    fontSize: 28,
    fontWeight: "800",
    color: "#90BE6D",
  },
  summaryStatValueWarning: {
    fontSize: 28,
    fontWeight: "800",
    color: "#EF4444",
  },
  summaryStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  menuItemCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemMeta: {
    alignItems: "flex-end",
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  safetyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
    gap: 4,
  },
  safetyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  allergenTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  allergenTag: {
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  allergenTagText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
  },
});
