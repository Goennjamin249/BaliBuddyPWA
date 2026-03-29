import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCameraPermissions } from 'expo-camera';
import { Platform, Alert } from 'react-native';
import { MenuItem } from '@/components/scanner/MenuItemCard';
import { 
  COMMON_ALLERGENS, 
  DEFAULT_SELECTED_ALLERGENS, 
  ScannerTiming,
  AllergenWarning 
} from '@/constants/scanner';

interface UseScannerReturn {
  // State
  isScanning: boolean;
  scannedText: string;
  translatedItems: MenuItem[];
  isProcessing: boolean;
  cameraError: string | null;
  selectedAllergens: string[];
  capturedImage: string | null;
  permission: ReturnType<typeof useCameraPermissions>[0];
  
  // Sample data
  sampleMenuTranslations: MenuItem[];
  commonAllergens: AllergenWarning[];
  
  // Actions
  requestPermission: ReturnType<typeof useCameraPermissions>[1];
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  capturePhoto: (photoUri: string) => void;
  simulateScan: () => void;
  toggleAllergen: (allergen: string) => void;
  clearResults: () => void;
}

/**
 * Custom hook for scanner state management and logic
 * Encapsulates all scanner-related functionality
 */
export function useScanner(): UseScannerReturn {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  
  // State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [translatedItems, setTranslatedItems] = useState<MenuItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(() => 
    DEFAULT_SELECTED_ALLERGENS.map(key => t(`scanner.${key}`))
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Build common allergens with translations
  const commonAllergens = useMemo<AllergenWarning[]>(() => 
    COMMON_ALLERGENS.map(allergen => ({
      ...allergen,
      name: t(`scanner.${allergen.translationKey}`),
      description: t(`scanner.${allergen.translationKey}Desc`),
    })),
    [t]
  );

  // Sample menu translations
  const sampleMenuTranslations = useMemo<MenuItem[]>(() => [
    {
      id: '1',
      indonesian: 'Nasi Goreng',
      german: t('scanner.nasiGorengGerman'),
      english: t('scanner.nasiGorengEnglish'),
      price: '15.000-35.000',
      allergens: [t('scanner.egg'), t('scanner.soy')],
      description: t('scanner.nasiGorengDesc'),
    },
    {
      id: '2',
      indonesian: 'Mie Goreng',
      german: t('scanner.mieGorengGerman'),
      english: t('scanner.mieGorengEnglish'),
      price: '15.000-30.000',
      allergens: [t('scanner.gluten'), t('scanner.soy'), t('scanner.egg')],
      description: t('scanner.mieGorengDesc'),
    },
    {
      id: '3',
      indonesian: 'Sate Ayam',
      german: t('scanner.sateAyamGerman'),
      english: t('scanner.sateAyamEnglish'),
      price: '20.000-35.000',
      allergens: [t('scanner.peanuts'), t('scanner.soy')],
      description: t('scanner.sateAyamDesc'),
    },
    {
      id: '4',
      indonesian: 'Gado-Gado',
      german: t('scanner.gadoGadoGerman'),
      english: t('scanner.gadoGadoEnglish'),
      price: '15.000-25.000',
      allergens: [t('scanner.peanuts'), t('scanner.soy')],
      description: t('scanner.gadoGadoDesc'),
    },
    {
      id: '5',
      indonesian: 'Bakso',
      german: t('scanner.baksoGerman'),
      english: t('scanner.baksoEnglish'),
      price: '10.000-20.000',
      allergens: [t('scanner.gluten')],
      description: t('scanner.baksoDesc'),
    },
  ], [t]);

  // Simulate OCR scan
  const simulateScan = useCallback(() => {
    setIsProcessing(true);
    
    // Simulate OCR processing delay
    const timeoutId = setTimeout(() => {
      // Randomly select some menu items as "scanned"
      const randomItems = [...sampleMenuTranslations]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      setScannedText(randomItems.map(item => item.indonesian).join(', '));
      setTranslatedItems(randomItems);
      setIsProcessing(false);
      setIsScanning(false);
    }, ScannerTiming.ocrProcessing);

    return () => clearTimeout(timeoutId);
  }, [sampleMenuTranslations]);

  // Start scanning
  const startScanning = useCallback(async () => {
    // Check camera permission on native platforms
    if (Platform.OS !== 'web') {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          setCameraError(t('scanner.cameraPermissionDenied'));
          Alert.alert(
            t('scanner.cameraPermissionTitle'),
            t('scanner.cameraPermissionMessage'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.settings'), onPress: () => {/* Open settings */} },
            ]
          );
          return;
        }
      }
    }
    
    setIsScanning(true);
    setScannedText('');
    setTranslatedItems([]);
    setCameraError(null);
    setCapturedImage(null);
    
    // On web, simulate the scanning process
    if (Platform.OS === 'web') {
      simulateScan();
    }
  }, [permission, requestPermission, t, simulateScan]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setIsProcessing(false);
  }, []);

  // Handle captured photo
  const capturePhoto = useCallback((photoUri: string) => {
    setCapturedImage(photoUri);
    setIsProcessing(true);
    
    // Simulate OCR processing
    const timeoutId = setTimeout(() => {
      const simulatedOCRResult = [...sampleMenuTranslations]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      setScannedText(simulatedOCRResult.map(item => item.indonesian).join(', '));
      setTranslatedItems(simulatedOCRResult);
      setIsProcessing(false);
    }, ScannerTiming.ocrProcessing);

    return () => clearTimeout(timeoutId);
  }, [sampleMenuTranslations]);

  // Toggle allergen selection
  const toggleAllergen = useCallback((allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setScannedText('');
    setTranslatedItems([]);
    setCapturedImage(null);
    setCameraError(null);
  }, []);

  return {
    // State
    isScanning,
    scannedText,
    translatedItems,
    isProcessing,
    cameraError,
    selectedAllergens,
    capturedImage,
    permission,
    
    // Sample data
    sampleMenuTranslations,
    commonAllergens,
    
    // Actions
    requestPermission,
    startScanning,
    stopScanning,
    capturePhoto,
    simulateScan,
    toggleAllergen,
    clearResults,
  };
}