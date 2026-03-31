/**
 * OCR Scanner Screen for BaliBuddy
 * Text recognition placeholder (tesseract.js removed for web compatibility)
 */

import { Camera, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalHeader from "../../components/GlobalHeader";

export default function OCRScannerScreen() {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang = i18n.language === "de" ? "de" : "en";

  // Handle image selection
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  // Process selected image
  const processImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to data URL for display
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Show info that OCR is not available
    Alert.alert(
      lang === "de" ? "OCR nicht verfügbar" : "OCR Not Available",
      lang === "de"
        ? "Texterkennung ist in dieser Version nicht verfügbar. Bitte verwende eine externe OCR-App."
        : "Text recognition is not available in this version. Please use an external OCR app.",
    );
  };;

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader
        title={t("survival.ocrScanner", "OCR Scanner")}
        showBackButton={true}
        showSettings={false}
      />

      <View style={styles.content}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={processImage}
          style={{ display: "none" }}
        />

        {/* Image Capture Section */}
        {!selectedImage ? (
          <View style={styles.captureSection}>
            <Camera size={64} color="#00B4D8" />
            <Text style={styles.captureTitle}>
              {lang === "de" ? "Foto aufnehmen" : "Take Photo"}
            </Text>
            <Text style={styles.captureSubtitle}>
              {lang === "de"
                ? "Fotografiere Text zum Erkennen (Demo)"
                : "Photograph text to recognize (Demo)"}
            </Text>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleImageSelect}
            >
              <Camera size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />
            <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
              <X size={20} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>
                {lang === "de" ? "Neues Foto" : "New Photo"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            {lang === "de" ? "ℹ️ Hinweis" : "ℹ️ Note"}
          </Text>
          <Text style={styles.infoText}>
            {lang === "de"
              ? "Die Texterkennung (OCR) wurde aus Performance-Gründen entfernt. Verwende stattdessen:"
              : "Text recognition (OCR) has been removed for performance reasons. Use instead:"}
          </Text>
          <Text style={styles.infoItem}>• Google Translate App</Text>
          <Text style={styles.infoItem}>• Microsoft Translator</Text>
          <Text style={styles.infoItem}>• iOS Live Text</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFCE8",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  captureSection: {
    alignItems: "center",
    paddingVertical: 60,
  },
  captureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
  },
  captureSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 32,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#00B4D8",
    justifyContent: "center",
    alignItems: "center",
  },
  imageSection: {
    marginBottom: 24,
  },
  selectedImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "cover",
  },
  resetButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: "#00B4D8",
    lineHeight: 24,
  },
});
