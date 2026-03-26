import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react-native';

interface LanguageToggleProps {
  variant?: 'icon' | 'button';
}

export default function LanguageToggle({ variant = 'icon' }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de';
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language.toUpperCase();

  if (variant === 'button') {
    return (
      <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
        <Globe size={20} color="#00B4D8" />
        <Text style={styles.buttonText}>{currentLang}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.iconButton} onPress={toggleLanguage}>
      <Globe size={24} color="#00B4D8" />
      <View style={styles.langBadge}>
        <Text style={styles.langBadgeText}>{currentLang}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    position: 'relative',
    padding: 8,
  },
  langBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00B4D8',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  langBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  buttonText: {
    color: '#00B4D8',
    fontSize: 14,
    fontWeight: '600',
  },
});