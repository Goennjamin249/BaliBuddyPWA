import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Scan, AlertTriangle, Utensils, ArrowLeft, Camera } from 'lucide-react-native';
import AllergenSelector from '@/components/scanner/AllergenSelector';
import CameraSection from '@/components/scanner/CameraSection';
import MenuItemCard from '@/components/scanner/MenuItemCard';
import { useScanner } from '@/hooks/useScanner';
import { ScannerColors, ScannerBorderRadius } from '@/constants/scanner';

/**
 * FoodScanner screen component
 * Allows users to scan Indonesian menu items and get translations
 * with allergen warnings based on their preferences
 */
function FoodScanner() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const {
    isScanning,
    scannedText,
    translatedItems,
    isProcessing,
    selectedAllergens,
    startScanning,
    stopScanning,
    capturePhoto,
    toggleAllergen,
  } = useScanner();

  // Back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <ArrowLeft size={24} color={ScannerColors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t('scanner.title')}</Text>
            <Text style={styles.subtitle}>{t('scanner.subtitle')}</Text>
          </View>
        </View>

        {/* Allergen Settings */}
        <AllergenSelector 
          selectedAllergens={selectedAllergens}
          onToggleAllergen={toggleAllergen}
        />

        {/* Camera Section */}
        <View style={styles.cameraSection}>
          {isScanning ? (
            <CameraSection
              isScanning={isScanning}
              isProcessing={isProcessing}
              onCapturePhoto={capturePhoto}
              onStopScanning={stopScanning}
            />
          ) : (
            <View style={styles.startContainer}>
              <View style={styles.instructionCard}>
                <Scan size={48} color={ScannerColors.primary} />
                <Text style={styles.instructionTitle}>{t('scanner.scanMenu')}</Text>
                <Text style={styles.instructionText}>
                  {t('scanner.scanInstruction')}
                </Text>
                <View style={styles.instructionSteps}>
                  <Text style={styles.stepText}>1. {t('scanner.step1')}</Text>
                  <Text style={styles.stepText}>2. {t('scanner.step2')}</Text>
                  <Text style={styles.stepText}>3. {t('scanner.step3')}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.scanButton} 
                onPress={startScanning}
                accessibilityRole="button"
                accessibilityLabel={t('scanner.startScanning')}
              >
                <Camera size={24} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>{t('scanner.startScanning')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Scanned Text */}
        {scannedText && (
          <View style={styles.scannedSection}>
            <Text style={styles.sectionTitle}>📝 {t('scanner.recognizedText')}</Text>
            <View style={styles.scannedCard}>
              <Text style={styles.scannedText}>{scannedText}</Text>
            </View>
          </View>
        )}

        {/* Translated Items */}
        {translatedItems.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>🍽️ {t('scanner.translations')}</Text>
            {translatedItems.map((item) => (
              <MenuItemCard 
                key={item.id}
                item={item}
                selectedAllergens={selectedAllergens}
              />
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Utensils size={20} color={ScannerColors.primary} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>💡 {t('scanner.tips')}</Text>
            <Text style={styles.tipsText}>• {t('scanner.tip1')}</Text>
            <Text style={styles.tipsText}>• {t('scanner.tip2')}</Text>
            <Text style={styles.tipsText}>• {t('scanner.tip3')}</Text>
            <Text style={styles.tipsText}>• {t('scanner.tip4')}</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <AlertTriangle size={16} color={ScannerColors.warning} />
          <Text style={styles.disclaimerText}>
            ⚠️ {t('scanner.disclaimer')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ScannerColors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ScannerColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: ScannerColors.textSecondary,
  },
  cameraSection: {
    marginBottom: 20,
  },
  startContainer: {
    alignItems: 'center',
  },
  instructionCard: {
    backgroundColor: ScannerColors.card,
    borderRadius: ScannerBorderRadius.large,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ScannerColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: ScannerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  instructionSteps: {
    alignSelf: 'stretch',
  },
  stepText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ScannerColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: ScannerBorderRadius.medium,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scannedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ScannerColors.text,
    marginBottom: 12,
  },
  scannedCard: {
    backgroundColor: ScannerColors.card,
    borderRadius: ScannerBorderRadius.medium,
    padding: 16,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  scannedText: {
    fontSize: 16,
    color: ScannerColors.text,
    fontStyle: 'italic',
  },
  resultsSection: {
    marginBottom: 20,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: ScannerBorderRadius.large,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: ScannerColors.primary,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 18,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: ScannerBorderRadius.medium,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: ScannerColors.warning,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
});

export default memo(FoodScanner);