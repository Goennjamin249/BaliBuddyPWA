import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import de from './de.json';
import en from './en.json';

const resources = {
  de: { translation: de },
  en: { translation: en },
};

// Get device language
const getDeviceLanguage = (): string => {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const languageCode = locales[0].languageCode;
      if (languageCode && Object.keys(resources).includes(languageCode)) {
        return languageCode;
      }
    }
  } catch (error) {
    console.warn('Failed to get device language:', error);
  }
  return 'de'; // Default to German
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;