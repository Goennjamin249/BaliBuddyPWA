import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Camera, Scan, AlertTriangle, CheckCircle, XCircle, Utensils, ArrowLeft } from 'lucide-react-native';

interface MenuItem {
  id: string;
  indonesian: string;
  german: string;
  english: string;
  price?: string;
  allergens: string[];
  description: string;
}

interface AllergenWarning {
  name: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

const commonAllergens: AllergenWarning[] = [
  { name: 'Erdnüsse', severity: 'high', description: 'Kann in vielen Gerichten versteckt sein' },
  { name: 'Soja', severity: 'medium', description: 'Oft in Soßen und Tofu' },
  { name: 'Meeresfrüchte', severity: 'high', description: 'Garnelen, Tintenfish häufig' },
  { name: 'Gluten', severity: 'medium', description: 'In Nudeln und Brot' },
  { name: 'Milchprodukte', severity: 'low', description: 'Seltener in indonesischer Küche' },
  { name: 'Sesam', severity: 'medium', description: 'In einigen Saucen' },
];

const sampleMenuTranslations: MenuItem[] = [
  {
    id: '1',
    indonesian: 'Nasi Goreng',
    german: 'Gebratener Reis',
    english: 'Fried Rice',
    price: '15.000-35.000',
    allergens: ['Ei', 'Soja'],
    description: 'Gebratener Reis mit Gemüse, Ei und Huhn/Garnelen',
  },
  {
    id: '2',
    indonesian: 'Mie Goreng',
    german: 'Gebratene Nudeln',
    english: 'Fried Noodles',
    price: '15.000-30.000',
    allergens: ['Gluten', 'Soja', 'Ei'],
    description: 'Gebratene Eiernudeln mit Gemüse',
  },
  {
    id: '3',
    indonesian: 'Sate Ayam',
    german: 'Hühnchen-Spieße',
    english: 'Chicken Satay',
    price: '20.000-35.000',
    allergens: ['Erdnüsse', 'Soja'],
    description: 'Gegrillte Hühnchenspieße mit Erdnusssauce',
  },
  {
    id: '4',
    indonesian: 'Gado-Gado',
    german: 'Gemüsesalat mit Erdnusssauce',
    english: 'Vegetable Salad',
    price: '15.000-25.000',
    allergens: ['Erdnüsse', 'Soja'],
    description: 'Gemischtes Gemüse mit Erdnusssoße',
  },
  {
    id: '5',
    indonesian: 'Bakso',
    german: 'Fleischbällchen-Suppe',
    english: 'Meatball Soup',
    price: '10.000-20.000',
    allergens: ['Gluten'],
    description: 'Fleischbällchen in klarer Brühe mit Nudeln',
  },
];

export default function FoodScanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [translatedItems, setTranslatedItems] = useState<MenuItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(['Erdnüsse', 'Meeresfrüchte']);
  
  // Simulate camera on web
  const simulateScan = useCallback(() => {
    setIsProcessing(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      // Randomly select some menu items as "scanned"
      const randomItems = sampleMenuTranslations
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      setScannedText(randomItems.map(item => item.indonesian).join(', '));
      setTranslatedItems(randomItems);
      setIsProcessing(false);
      setIsScanning(false);
    }, 2000);
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setScannedText('');
    setTranslatedItems([]);
    setCameraError(null);
    
    // On web, simulate the scanning process
    if (Platform.OS === 'web') {
      simulateScan();
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const getAllergenWarnings = (item: MenuItem) => {
    return item.allergens.filter(allergen => 
      selectedAllergens.some(selected => 
        allergen.toLowerCase().includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes(allergen.toLowerCase())
      )
    );
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t('scanner.title', 'Essens-Scanner')}</Text>
            <Text style={styles.subtitle}>{t('scanner.subtitle', 'Menü-Übersetzer')}</Text>
          </View>
        </View>

        {/* Allergen Settings */}
        <View style={styles.allergenSection}>
          <Text style={styles.sectionTitle}>⚠️ Meine Allergien</Text>
          <Text style={styles.allergenSubtitle}>Wähle deine Allergien aus:</Text>
          <View style={styles.allergenList}>
            {commonAllergens.map((allergen) => (
              <TouchableOpacity
                key={allergen.name}
                style={[
                  styles.allergenChip,
                  selectedAllergens.includes(allergen.name) && styles.allergenChipActive,
                  allergen.severity === 'high' && styles.allergenChipDanger,
                ]}
                onPress={() => toggleAllergen(allergen.name)}
              >
                <Text style={[
                  styles.allergenChipText,
                  selectedAllergens.includes(allergen.name) && styles.allergenChipTextActive,
                ]}>
                  {selectedAllergens.includes(allergen.name) ? '✓ ' : ''}{allergen.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Camera Section */}
        <View style={styles.cameraSection}>
          {isScanning ? (
            <View style={styles.scanningContainer}>
              <View style={styles.cameraPlaceholder}>
                <Camera size={64} color="#00B4D8" />
                <Text style={styles.cameraText}>
                  {Platform.OS === 'web' 
                    ? 'Kamera wird simuliert...' 
                    : 'Kamera aktiv...'}
                </Text>
                <Text style={styles.cameraHint}>
                  Halte die Kamera auf das Menü
                </Text>
              </View>
              
              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator size="large" color="#00B4D8" />
                  <Text style={styles.processingText}>Text wird erkannt...</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.stopButton} onPress={stopScanning}>
                <XCircle size={20} color="#FFFFFF" />
                <Text style={styles.stopButtonText}>Stoppen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.startContainer}>
              <View style={styles.instructionCard}>
                <Scan size={48} color="#00B4D8" />
                <Text style={styles.instructionTitle}>Menü scannen</Text>
                <Text style={styles.instructionText}>
                  Halte die Kamera auf ein Warung-Menü und die App übersetzt automatisch.
                </Text>
                <View style={styles.instructionSteps}>
                  <Text style={styles.stepText}>1. Kamera auf Menü richten</Text>
                  <Text style={styles.stepText}>2. Warten bis Text erkannt wird</Text>
                  <Text style={styles.stepText}>3. Übersetzung & Allergene prüfen</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
                <Camera size={24} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scannen starten</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Scanned Text */}
        {scannedText && (
          <View style={styles.scannedSection}>
            <Text style={styles.sectionTitle}>📝 Erkannter Text</Text>
            <View style={styles.scannedCard}>
              <Text style={styles.scannedText}>{scannedText}</Text>
            </View>
          </View>
        )}

        {/* Translated Items */}
        {translatedItems.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>🍽️ Übersetzungen</Text>
            {translatedItems.map((item) => {
              const warnings = getAllergenWarnings(item);
              const hasWarnings = warnings.length > 0;
              
              return (
                <View key={item.id} style={[
                  styles.menuItemCard,
                  hasWarnings && styles.menuItemCardWarning,
                ]}>
                  <View style={styles.menuItemHeader}>
                    <Text style={styles.menuItemName}>{item.indonesian}</Text>
                    {hasWarnings && (
                      <View style={styles.warningBadge}>
                        <AlertTriangle size={14} color="#FF6B6B" />
                        <Text style={styles.warningBadgeText}>Allergen!</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.menuItemTranslation}>
                    <Text style={styles.germanText}>🇩🇪 {item.german}</Text>
                    <Text style={styles.englishText}>🇬🇧 {item.english}</Text>
                  </View>
                  
                  {item.price && (
                    <Text style={styles.priceText}>💰 Rp {item.price}</Text>
                  )}
                  
                  <Text style={styles.descriptionText}>{item.description}</Text>
                  
                  {/* Allergen Warnings */}
                  {item.allergens.length > 0 && (
                    <View style={styles.allergensContainer}>
                      <Text style={styles.allergensLabel}>Enthält:</Text>
                      <View style={styles.allergensList}>
                        {item.allergens.map((allergen, index) => (
                          <View 
                            key={index} 
                            style={[
                              styles.allergenTag,
                              warnings.includes(allergen) && styles.allergenTagDanger,
                            ]}
                          >
                            <Text style={[
                              styles.allergenTagText,
                              warnings.includes(allergen) && styles.allergenTagTextDanger,
                            ]}>
                              {warnings.includes(allergen) ? '⚠️ ' : ''}{allergen}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Utensils size={20} color="#00B4D8" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>💡 Tipps</Text>
            <Text style={styles.tipsText}>• Bei Allergien IMMER nachfragen</Text>
            <Text style={styles.tipsText}>• "Tanpa" = ohne (z.B. Tanpa Kacang = ohne Erdnüsse)</Text>
            <Text style={styles.tipsText}>• Street Food ist oft sicherer als Restaurants</Text>
            <Text style={styles.tipsText}>• Immer Wasser zum Trinken bestellen</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <AlertTriangle size={16} color="#F59E0B" />
          <Text style={styles.disclaimerText}>
            ⚠️ Die Erkennung ist nicht 100% genau. Bitte bestätige allergenrelevante Informationen immer beim Personal.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  allergenSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  allergenSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  allergenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  allergenChipActive: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  allergenChipDanger: {
    borderColor: '#FF6B6B',
  },
  allergenChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  allergenChipTextActive: {
    color: '#FFFFFF',
  },
  cameraSection: {
    marginBottom: 20,
  },
  scanningContainer: {
    alignItems: 'center',
  },
  cameraPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  cameraHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 12,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startContainer: {
    alignItems: 'center',
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#00B4D8',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scannedSection: {
    marginBottom: 20,
  },
  scannedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scannedText: {
    fontSize: 16,
    color: '#1F2937',
    fontStyle: 'italic',
  },
  resultsSection: {
    marginBottom: 20,
  },
  menuItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  menuItemTranslation: {
    marginBottom: 8,
  },
  germanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B4D8',
    marginBottom: 2,
  },
  englishText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#90BE6D',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  allergensContainer: {
    marginTop: 8,
  },
  allergensLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  allergensList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergenTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  allergenTagDanger: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  allergenTagText: {
    fontSize: 11,
    color: '#374151',
  },
  allergenTagTextDanger: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00B4D8',
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
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
});