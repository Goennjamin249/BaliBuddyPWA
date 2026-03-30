/**
 * Scooter Check Component for BaliBuddy
 * Pre-rental inspection checklist with photo documentation
 */

import { FlashList } from "@shopify/flash-list";
import { AlertTriangle, Camera, Check, Save } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalHeader from "../../components/GlobalHeader";
import { useScooterInspections } from "../../hooks/useWatermelonDB";

// Checklist item interface
interface ChecklistItem {
  id: string;
  label: { de: string; en: string };
  checked: boolean;
  hasDamage: boolean;
  photo?: string;
}

// Initial checklist items
const initialChecklist: ChecklistItem[] = [
  {
    id: "1",
    label: { de: "Kratzer am Tank", en: "Scratches on tank" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "2",
    label: { de: "Kratzer an Verkleidung", en: "Scratches on fairing" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "3",
    label: { de: "Risse im Sitz", en: "Tears in seat" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "4",
    label: { de: "Beschädigte Spiegel", en: "Damaged mirrors" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "5",
    label: { de: "Funktionierende Blinker", en: "Working indicators" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "6",
    label: { de: "Funktionierende Bremse", en: "Working brakes" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "7",
    label: { de: "Reifenprofil ausreichend", en: "Sufficient tire tread" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "8",
    label: { de: "Kennzeichen lesbar", en: "License plate readable" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "9",
    label: { de: "Kraftstoffanzeige funktioniert", en: "Fuel gauge working" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "10",
    label: { de: "Helm vorhanden", en: "Helmet included" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "11",
    label: { de: "Regenjacke vorhanden", en: "Rain jacket included" },
    checked: false,
    hasDamage: false,
  },
  {
    id: "12",
    label: { de: "Werkzeug dabei", en: "Toolkit included" },
    checked: false,
    hasDamage: false,
  },
];

export default function ScooterCheckScreen() {
  const { t, i18n } = useTranslation();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [photos, setPhotos] = useState<string[]>([]);
  const [rentalCompany, setRentalCompany] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [notes, setNotes] = useState("");
  const { addInspection } = useScooterInspections();

  // Toggle checklist item
  const toggleItem = (id: string, hasDamage: boolean) => {
    setChecklist((items) =>
      items.map((item) =>
        item.id === id ? { ...item, checked: true, hasDamage } : item,
      ),
    );
  };

  // Reset checklist
  const resetChecklist = () => {
    setChecklist(initialChecklist);
    setPhotos([]);
    setRentalCompany("");
    setLicensePlate("");
    setNotes("");
  };

  // Save inspection
  const saveInspection = async () => {
    const uncheckedItems = checklist.filter((item) => !item.checked);
    const damagedItems = checklist.filter((item) => item.hasDamage);

    if (uncheckedItems.length > 0) {
      alert(
        i18n.language === "de"
          ? `Bitte alle Punkte prüfen! ${uncheckedItems.length} offen.`
          : `Please check all items! ${uncheckedItems.length} remaining.`,
      );
      return;
    }

    await addInspection({
      rentalCompany: rentalCompany || "Unknown",
      scooterModel: "Scooter",
      licensePlate: licensePlate || "Unknown",
      checklistData: JSON.stringify(checklist),
      photoEvidence: JSON.stringify(photos),
      inspectionDate: Date.now(),
      notes: `${notes} | Damaged: ${damagedItems.length} items`,
    });

    alert(
      i18n.language === "de" ? "Inspektion gespeichert!" : "Inspection saved!",
    );

    resetChecklist();
  };

  // Calculate stats
  const checkedCount = checklist.filter((i) => i.checked).length;
  const damagedCount = checklist.filter((i) => i.hasDamage).length;
  const progress = (checkedCount / checklist.length) * 100;

  const lang = i18n.language === "de" ? "de" : "en";

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader
        title={t("survival.scooterCheck", "Scooter Check")}
        showBackButton={true}
        showSettings={false}
      />

      <ScrollView style={styles.content}>
        {/* Rental Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "de" ? "Vermietung" : "Rental Info"}
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {i18n.language === "de" ? "Vermieter" : "Rental Company"}
            </Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>
                {rentalCompany || i18n.language === "de"
                  ? "Nicht angegeben"
                  : "Not specified"}
              </Text>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {i18n.language === "de" ? "Kennzeichen" : "License Plate"}
            </Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>
                {licensePlate || i18n.language === "de"
                  ? "Nicht angegeben"
                  : "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {i18n.language === "de" ? "Fortschritt" : "Progress"}
            </Text>
            <Text style={styles.progressText}>
              {checkedCount}/{checklist.length}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          {damagedCount > 0 && (
            <View style={styles.damageWarning}>
              <AlertTriangle size={16} color="#EF4444" />
              <Text style={styles.damageText}>
                {damagedCount} {i18n.language === "de" ? "Schäden" : "damages"}
              </Text>
            </View>
          )}
        </View>

        {/* Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "de" ? "Checkliste" : "Checklist"}
          </Text>
          <FlashList
            data={checklist}
            estimatedItemSize={60}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.checklistItem}>
                <View style={styles.checklistInfo}>
                  <Text style={styles.checklistLabel}>{item.label[lang]}</Text>
                </View>
                <View style={styles.checklistActions}>
                  {!item.checked ? (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.okButton]}
                        onPress={() => toggleItem(item.id, false)}
                      >
                        <Check size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.damageButton]}
                        onPress={() => toggleItem(item.id, true)}
                      >
                        <AlertTriangle size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View
                      style={[
                        styles.checkedBadge,
                        item.hasDamage && styles.damageBadge,
                      ]}
                    >
                      {item.hasDamage ? (
                        <AlertTriangle size={16} color="#FFFFFF" />
                      ) : (
                        <Check size={16} color="#FFFFFF" />
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "de" ? "Fotos" : "Photos"}
          </Text>
          <View style={styles.photoGrid}>
            <TouchableOpacity style={styles.photoPlaceholder}>
              <Camera size={32} color="#94A3B8" />
              <Text style={styles.photoPlaceholderText}>
                {i18n.language === "de" ? "Foto hinzufügen" : "Add photo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveInspection}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {i18n.language === "de" ? "Speichern" : "Save"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFF4",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputText: {
    fontSize: 16,
    color: "#0F172A",
  },
  progressSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  progressText: {
    fontSize: 14,
    color: "#64748B",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  damageWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 8,
  },
  damageText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  checklistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  checklistInfo: {
    flex: 1,
  },
  checklistLabel: {
    fontSize: 14,
    color: "#0F172A",
  },
  checklistActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  okButton: {
    backgroundColor: "#10B981",
  },
  damageButton: {
    backgroundColor: "#F59E0B",
  },
  checkedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  damageBadge: {
    backgroundColor: "#F59E0B",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
