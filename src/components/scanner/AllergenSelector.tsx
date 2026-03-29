import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COMMON_ALLERGENS, ScannerColors, ScannerBorderRadius, AllergenWarning } from '@/constants/scanner';

interface AllergenSelectorProps {
  selectedAllergens: string[];
  onToggleAllergen: (allergen: string) => void;
}

/**
 * AllergenSelector component for selecting user allergies
 * Displays allergen chips with severity indicators
 */
function AllergenSelector({ selectedAllergens, onToggleAllergen }: AllergenSelectorProps) {
  const { t } = useTranslation();

  // Build allergen warnings with translations
  const allergenWarnings = useMemo<AllergenWarning[]>(() => 
    COMMON_ALLERGENS.map(allergen => ({
      ...allergen,
      name: t(`scanner.${allergen.translationKey}`),
      description: t(`scanner.${allergen.translationKey}Desc`),
    })),
    [t]
  );

  const handleToggle = useCallback((allergenName: string) => {
    onToggleAllergen(allergenName);
  }, [onToggleAllergen]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ {t('scanner.myAllergies')}</Text>
      <Text style={styles.subtitle}>{t('scanner.selectAllergies')}</Text>
      <View style={styles.chipContainer}>
        {allergenWarnings.map((allergen) => {
          const isSelected = selectedAllergens.includes(allergen.name);
          const isHighSeverity = allergen.severity === 'high';
          
          return (
            <TouchableOpacity
              key={allergen.translationKey}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                isHighSeverity && styles.chipHighSeverity,
              ]}
              onPress={() => handleToggle(allergen.name)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${allergen.name}, ${t(`scanner.severity.${allergen.severity}`)}`}
              accessibilityHint={allergen.description}
            >
              <Text style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
              ]}>
                {isSelected ? '✓ ' : ''}{allergen.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ScannerColors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: ScannerColors.textSecondary,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: ScannerBorderRadius.pill,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: ScannerColors.border,
  },
  chipSelected: {
    backgroundColor: ScannerColors.primary,
    borderColor: ScannerColors.primary,
  },
  chipHighSeverity: {
    borderColor: ScannerColors.danger,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});

export default memo(AllergenSelector);