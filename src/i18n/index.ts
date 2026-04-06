import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import de from './de.json';
import en from './en.json';
import fr from './fr.json';
import es from './es.json';

/**
 * Supported application languages
 * Following iOS locale standards
 */
export const SUPPORTED_LANGUAGES = ['de', 'en', 'fr', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Default fallback language for the application
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'de';

/**
 * Type-safe i18n resources definition
 */
const resources = {
  de: { translation: de },
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
} as const satisfies Record<SupportedLanguage, { translation: unknown }>;

/**
 * Gets the device's preferred language with proper fallback handling
 * Follows Expo Localization best practices for cross-platform consistency
 * 
 * @returns Valid supported language code
 */
const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = Localization.getLocales();
    
    if (!locales || locales.length === 0) {
      return DEFAULT_LANGUAGE;
    }

    // Iterate through all device locales in priority order
    for (const locale of locales) {
      const languageCode = locale.languageCode?.toLowerCase();
      
      if (languageCode && 
          SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
        return languageCode as SupportedLanguage;
      }
    }
  } catch (error) {
    console.warn('[i18n] Failed to detect device language, using default:', error);
  }

  return DEFAULT_LANGUAGE;
};

/**
 * Initialize i18next with React Native / Expo optimizations
 * Configured for iOS PWA native feeling
 */
// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next)
  .init({
    // @ts-expect-error - resources type compatibility
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    
    interpolation: {
      escapeValue: false, // React already escapes values
      skipOnVariables: false,
      prefix: '{{',
      suffix: '}}',
      formatSeparator: ',',
    },

    react: {
      useSuspense: false, // Disable Suspense for React Native compatibility
      bindI18n: 'languageChanged',
      transSupportBasicHtmlNodes: true,
      transWrapTextNodes: false,
      reuseTranslations: true,
    },

    debug: __DEV__, // Enable debug logging only in development
    load: 'languageOnly', // Ignore region codes (de-DE → de)
    lowerCaseLng: true,
    cleanCode: true,
    initImmediate: false,
    keySeparator: '.',
    nsSeparator: ':',
    partialBundledLanguages: false,
    saveMissing: __DEV__,
    missingKeyHandler: __DEV__
      ? (lngs: string[], ns: string, key: string) => console.warn(`[i18n] Missing translation: ${key} (${lngs.join(',')})`)
      : undefined,
    preload: SUPPORTED_LANGUAGES,
    returnEmptyString: false,
    returnNull: false,
    returnObjects: true,
  });

// Type augmentation for fully type-safe translations
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: typeof resources.de;
  }
}

export default i18n;