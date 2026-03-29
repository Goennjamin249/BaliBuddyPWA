import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react-native';
import { ScannerColors, ScannerBorderRadius } from '@/constants/scanner';

export interface MenuItem {
  id: string;
  indonesian: string;
  german: string;
  english: string;
  price?: string;
  allergens: string[];
  description: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  selectedAllergens: string[];
}

/**
 * MenuItemCard component for displaying translated menu items
 * Shows allergen warnings based on user's selected allergens
 */
function MenuItemCard({ item, selectedAllergens }: MenuItemCardProps) {
  const { t } = useTranslation();

  // Calculate allergen warnings
  const allergenWarnings = useMemo(() => 
    item.allergens.filter(allergen => 
      selectedAllergens.some(selected => 
        allergen.toLowerCase().includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes(allergen.toLowerCase())
      )
    ),
    [item.allergens, selectedAllergens]
  );

  const hasWarnings = allergenWarnings.length > 0;

  return (
    <View 
      style={[styles.card, hasWarnings && styles.cardWarning]}
      accessibilityRole="summary"
      accessibilityLabel={`${item.indonesian}, ${item.german}, ${item.english}${hasWarnings ? `, ${t('scanner.allergenWarning')}` : ''}`}
    >
      {/* Header with name and warning badge */}
      <View style={styles.header}>
        <Text style={styles.name}>{item.indonesian}</Text>
        {hasWarnings && (
          <View 
            style={styles.warningBadge}
            accessibilityRole="alert"
            accessibilityLabel={t('scanner.allergen')}
          >
            <AlertTriangle size={14} color={ScannerColors.danger} />
            <Text style={styles.warningBadgeText}>{t('scanner.allergen')}!</Text>
          </View>
        )}
      </View>

      {/* Translations */}
      <View style={styles.translationContainer}>
        <Text style={styles.germanText}>🇩🇪 {item.german}</Text>
        <Text style={styles.englishText}>🇬🇧 {item.english}</Text>
      </View>

      {/* Price */}
      {item.price && (
        <Text style={styles.priceText}>💰 Rp {item.price}</Text>
      )}

      {/* Description */}
      <Text style={styles.descriptionText}>{item.description}</Text>

      {/* Allergens */}
      {item.allergens.length > 0 && (
        <View style={styles.allergensContainer}>
          <Text style={styles.allergensLabel}>{t('scanner.contains')}:</Text>
          <View style={styles.allergensList}>
            {item.allergens.map((allergen, index) => {
              const isWarning = allergenWarnings.includes(allergen);
              return (
                <View 
                  key={`${item.id}-allergen-${index}`}
                  style={[styles.allergenTag, isWarning && styles.allergenTagDanger]}
                >
                  <Text style={[styles.allergenTagText, isWarning && styles.allergenTagTextDanger]}>
                    {isWarning ? '⚠️ ' : ''}{allergen}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ScannerColors.card,
    borderRadius: ScannerBorderRadius.large,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: ScannerColors.danger,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ScannerColors.text,
    flex: 1,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ScannerBorderRadius.medium,
  },
  warningBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: ScannerColors.danger,
  },
  translationContainer: {
    marginBottom: 8,
  },
  germanText: {
    fontSize: 16,
    fontWeight: '600',
    color: ScannerColors.primary,
    marginBottom: 2,
  },
  englishText: {
    fontSize: 14,
    color: ScannerColors.textSecondary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: ScannerColors.success,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: ScannerColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  allergensContainer: {
    marginTop: 8,
  },
  allergensLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ScannerColors.textSecondary,
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
    borderRadius: ScannerBorderRadius.small,
    backgroundColor: '#F3F4F6',
  },
  allergenTagDanger: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: ScannerColors.danger,
  },
  allergenTagText: {
    fontSize: 11,
    color: '#374151',
  },
  allergenTagTextDanger: {
    color: ScannerColors.danger,
    fontWeight: '600',
  },
});

export default memo(MenuItemCard);