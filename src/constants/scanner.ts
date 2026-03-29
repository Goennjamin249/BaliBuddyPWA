/**
 * Scanner-specific constants for the Food Scanner feature
 */

// Scanner colors following the project's tropical theme
export const ScannerColors = {
  primary: '#00B4D8',      // Tropical teal
  success: '#90BE6D',      // Rice-paddy green
  warning: '#F59E0B',      // Amber warning
  danger: '#FF6B6B',       // Coral sunset (alerts)
  text: '#1F2937',         // Dark gray text
  textSecondary: '#6B7280', // Muted text
  background: '#F9FAFB',   // Light background
  card: '#FFFFFF',         // Card background
  border: '#E5E7EB',       // Border color
} as const;

// Allergen severity levels
export type AllergenSeverity = 'high' | 'medium' | 'low';

// Allergen warning interface
export interface AllergenWarning {
  name: string;
  severity: AllergenSeverity;
  description: string;
  translationKey: string;
}

// Common allergens configuration
export const COMMON_ALLERGENS: Omit<AllergenWarning, 'name' | 'description'>[] = [
  { severity: 'high', translationKey: 'peanuts' },
  { severity: 'medium', translationKey: 'soy' },
  { severity: 'high', translationKey: 'seafood' },
  { severity: 'medium', translationKey: 'gluten' },
  { severity: 'low', translationKey: 'dairy' },
  { severity: 'medium', translationKey: 'sesame' },
];

// Default selected allergens (translation keys)
export const DEFAULT_SELECTED_ALLERGENS = ['peanuts', 'seafood'];

// Scanner timing constants (in milliseconds)
export const ScannerTiming = {
  ocrProcessing: 2000,
  scanDelay: 500,
} as const;

// Camera settings
export const CameraSettings = {
  photoQuality: 0.8,
  facing: 'back' as const,
} as const;

// UI dimensions
export const ScannerDimensions = {
  scanFrameWidth: 250,
  scanFrameHeight: 150,
  cameraHeight: 300,
  cameraHeightWeb: 200,
  captureButtonSize: 70,
  captureButtonInnerSize: 54,
} as const;

// Border radius values
export const ScannerBorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  pill: 20,
  circle: 35,
} as const;