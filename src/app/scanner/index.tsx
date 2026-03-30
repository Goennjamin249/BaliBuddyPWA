import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  Camera,
  Scan,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Utensils,
  ArrowLeft,
  Shield,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Types
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  allergens: string[];
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AllergenInfo {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

// Constants
const COLORS = {
  primary: '#00B4D8',
  success: '#90BE6D',
  warning: '#FF6B6B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
} as const;

const RISK_COLORS = {
  low: COLORS.success,
  medium: COLORS.warning,
  high: '#EF4444',
} as const;

const DEFAULT_ALLERGENS: AllergenInfo[] = [
  { id: 'gluten', name: 'Gluten', icon: '🌾', selected: false },
  { id: 'dairy', name: 'Milchprodukte', icon: '🥛', selected: false },
  { id: 'nuts', name: 'Nüsse', icon: '🥜', selected: false },
  { id: 'shellfish', name: 'Meeresfrüchte', icon: '🦐', selected: false },
  { id: 'eggs', name: 'Eier', icon: '🥚', selected: false },
  { id: 'soy', name: 'Soja', icon: '🫘', selected: false },
];

// Sub-components
interface AllergenSelectorProps {
  allergens: AllergenInfo[];
  onToggle: (id: string) => void;
}

const AllergenSelector: React.FC<AllergenSelectorProps> = React.memo(({ allergens, onToggle }) => (
  <View className="mb-6">
    <Text className="text-lg font-semibold text-gray-800 mb-3">
      Deine Allergien
    </Text>
    <View className="flex-row flex-wrap gap-2">
      {allergens.map((allergen) => (
        <TouchableOpacity
          key={allergen.id}
          onPress={() => onToggle(allergen.id)}
          className={`flex-row items-center px-4 py-2 rounded-full border ${
            allergen.selected
              ? 'bg-primary-100 border-primary-500'
              : 'bg-white border-gray-200'
          }`}
          accessibilityLabel={`${allergen.name} ${allergen.selected ? 'ausgewählt' : 'nicht ausgewählt'}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allergen.selected }}
        >
          <Text className="mr-2">{allergen.icon}</Text>
          <Text
            className={`text-sm ${
              allergen.selected ? 'text-primary-700 font-medium' : 'text-gray-600'
            }`}
          >
            {allergen.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
));

AllergenSelector.displayName = 'AllergenSelector';

interface CameraSectionProps {
  hasPermission: boolean | null;
  isScanning: boolean;
  onScan: () => void;
  onRequestPermission: () => void;
}

const CameraSection: React.FC<CameraSectionProps> = React.memo(
  ({ hasPermission, isScanning, onScan, onRequestPermission }) => {
    const { t } = useTranslation();

    if (hasPermission === null) {
      return (
        <View className="h-64 bg-gray-100 rounded-2xl items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="mt-4 text-gray-500">Kamera wird geladen...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View className="h-64 bg-gray-100 rounded-2xl items-center justify-center p-6">
          <Camera size={48} color={COLORS.textMuted} />
          <Text className="mt-4 text-gray-600 text-center">
            Kamera-Zugriff erforderlich
          </Text>
          <TouchableOpacity
            onPress={onRequestPermission}
            className="mt-4 bg-primary-500 px-6 py-3 rounded-xl"
            accessibilityLabel="Kamera-Zugriff erlauben"
          >
            <Text className="text-white font-semibold">Zugriff erlauben</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="h-64 bg-gray-900 rounded-2xl overflow-hidden relative">
        <CameraView className="flex-1" facing="back">
          <View className="flex-1 items-center justify-center">
            <View className="w-48 h-48 border-2 border-white/50 rounded-2xl" />
          </View>
        </CameraView>
        <TouchableOpacity
          onPress={onScan}
          disabled={isScanning}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full flex-row items-center"
          accessibilityLabel="Speisekarte scannen"
        >
          {isScanning ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Scan size={20} color={COLORS.primary} />
              <Text className="ml-2 text-primary-600 font-semibold">
                {t('scanner.scan', 'Scannen')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }
);

CameraSection.displayName = 'CameraSection';

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(({ item }) => (
  <View
    className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
    accessibilityLabel={`${item.name}, ${item.price}, ${item.isSafe ? 'sicher' : 'Vorsicht'}`}
  >
    <View className="flex-row justify-between items-start">
      <View className="flex-1 mr-3">
        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>
      </View>
      <View className="items-end">
        <Text className="text-lg font-bold text-primary-600">{item.price}</Text>
        <View
          className="flex-row items-center mt-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: `${RISK_COLORS[item.riskLevel]}20` }}
        >
          {item.isSafe ? (
            <CheckCircle size={16} color={RISK_COLORS[item.riskLevel]} />
          ) : (
            <AlertTriangle size={16} color={RISK_COLORS[item.riskLevel]} />
          )}
          <Text
            className="ml-1 text-xs font-medium"
            style={{ color: RISK_COLORS[item.riskLevel] }}
          >
            {item.isSafe ? 'Sicher' : 'Vorsicht'}
          </Text>
        </View>
      </View>
    </View>
    {item.allergens.length > 0 && (
      <View className="flex-row flex-wrap mt-3 gap-1">
        {item.allergens.map((allergen, index) => (
          <View key={index} className="bg-red-50 px-2 py-1 rounded-md">
            <Text className="text-xs text-red-600">{allergen}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
));

MenuItemCard.displayName = 'MenuItemCard';

// Main Component
export default function ScannerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [allergens, setAllergens] = useState<AllergenInfo[]>(DEFAULT_ALLERGENS);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<MenuItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Handlers
  const handleToggleAllergen = useCallback((id: string) => {
    setAllergens((prev) =>
      prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a))
    );
  }, []);

  const handleScan = useCallback(async () => {
    setIsScanning(true);

    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock scanned menu items
    const mockItems: MenuItem[] = [
      {
        id: '1',
        name: 'Nasi Goreng',
        description: 'Gebratener Reis mit Gemüse und Ei',
        price: '45.000 IDR',
        allergens: ['Eier', 'Soja'],
        isSafe: true,
        riskLevel: 'low',
      },
      {
        id: '2',
        name: 'Mie Goreng',
        description: 'Gebratene Nudeln mit Garnelen',
        price: '50.000 IDR',
        allergens: ['Meeresfrüchte', 'Gluten'],
        isSafe: false,
        riskLevel: 'high',
      },
      {
        id: '3',
        name: 'Gado-Gado',
        description: 'Gemüsesalat mit Erdnusssauce',
        price: '35.000 IDR',
        allergens: ['Nüsse'],
        isSafe: false,
        riskLevel: 'medium',
      },
    ];

    setScannedItems(mockItems);
    setShowResults(true);
    setIsScanning(false);
  }, []);

  const handleReset = useCallback(() => {
    setShowResults(false);
    setScannedItems([]);
  }, []);

  // Render
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
          accessibilityLabel="Zurück"
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          {t('scanner.title', 'Speisekarten-Scanner')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {!showResults ? (
          <>
            {/* Allergen Selection */}
            <AllergenSelector allergens={allergens} onToggle={handleToggleAllergen} />

            {/* Camera Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
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
            <View className="bg-blue-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start">
                <Shield size={24} color={COLORS.primary} />
                <View className="flex-1 ml-3">
                  <Text className="text-blue-800 font-medium mb-1">
                    Wie funktioniert der Scanner?
                  </Text>
                  <Text className="text-blue-600 text-sm">
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
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Scan-Ergebnisse
              </Text>
              <TouchableOpacity
                onPress={handleReset}
                className="bg-gray-100 px-4 py-2 rounded-full"
                accessibilityLabel="Erneut scannen"
              >
                <Text className="text-gray-600 font-medium">Erneut scannen</Text>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-800">
                    {scannedItems.length}
                  </Text>
                  <Text className="text-gray-500 text-sm">Gerichte</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {scannedItems.filter((i) => i.isSafe).length}
                  </Text>
                  <Text className="text-gray-500 text-sm">Sicher</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-red-600">
                    {scannedItems.filter((i) => !i.isSafe).length}
                  </Text>
                  <Text className="text-gray-500 text-sm">Vorsicht</Text>
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