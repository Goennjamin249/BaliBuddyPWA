import '@/global.css';
import { Platform } from 'react-native';

/**
 * BaliBuddy Color Palette - Tropical Theme
 * Aligned with CSS variables in global.css
 * 
 * NOTE: Light Mode ONLY per project rules (no dark mode in MVP)
 */
export const Colors = {
  // Primary - Tropical Teal
  primary: '#00B4D8',
  primaryLight: '#4DD0E1',
  primaryDark: '#0097A7',

  // Success - Rice Paddy Green
  success: '#90BE6D',
  successLight: '#AED581',
  successDark: '#7CB342',

  // Warning - Sunset Amber
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',

  // Danger - Coral
  danger: '#FF6B6B',
  dangerLight: '#FF8A8A',
  dangerDark: '#E53935',

  // Neutrals
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
} as const;

/**
 * Type-safe color key access
 */
export type ColorKey = keyof typeof Colors;

/**
 * Font families by platform
 * Aligned with CSS variables in global.css
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-sans)',
    serif: 'serif',
    rounded: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'system-ui',
    mono: 'monospace',
  },
});

/**
 * Semantic spacing scale (in pixels)
 * Aligned with CSS variables in global.css:
 * - xs: 4px (button padding, tight gaps)
 * - sm: 8px (default gaps, small padding)
 * - md: 16px (card padding, standard gaps)
 * - lg: 24px (section spacing)
 * - xl: 32px (large sections)
 * - 2xl: 48px (major sections)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

/**
 * Type-safe spacing key access
 */
export type SpacingKey = keyof typeof Spacing;

/**
 * Bottom tab bar inset for safe area
 * iOS: 50px (home indicator)
 * Android: 80px (navigation bar)
 * Web: 0px (no native tab bar)
 */
export const BottomTabInset = Platform.select({
  ios: 50,
  android: 80,
  web: 0,
  default: 0,
});

/**
 * Maximum content width for centered layouts
 * Prevents content from stretching too wide on large screens
 */
export const MaxContentWidth = 800;

/**
 * Border radius scale (in pixels)
 * Aligned with CSS variables in global.css
 */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/**
 * Type-safe border radius key access
 */
export type BorderRadiusKey = keyof typeof BorderRadius;
