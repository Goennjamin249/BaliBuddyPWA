/**
 * Law Hub Screen for BaliBuddy
 * Indonesian laws and regulations for tourists
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Scale, AlertTriangle, ChevronRight, Info } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import GlobalHeader from '../../components/GlobalHeader';
import { lawCategories, lawEntries, getLawsByCategory, getSeverityColor, getSeverityLabel } from '../../services/lawHub';

export default function LawHubScreen() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);

  const lang = i18n.language === 'de' ? 'de' : 'en';

  // Get selected law details
  const selectedLawDetails = selectedLaw 
    ? lawEntries.find(l => l.id === selectedLaw) 
    : null;

  // Get laws for selected category
  const categoryLaws = selectedCategory 
    ? getLawsByCategory(selectedCategory)
    : [];

  // Back navigation
  const handleBack = () => {
    if (selectedLaw) {
      setSelectedLaw(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  // Render category card
  const renderCategory = ({ item }: { item: typeof lawCategories[0] }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { borderLeftColor: item.color }]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{item.title[lang]}</Text>
        <Text style={styles.categoryCount}>
          {getLawsByCategory(item.id).length} {lang === 'de' ? 'Gesetze' : 'Laws'}
        </Text>
      </View>
      <ChevronRight size={20} color="#94A3B8" />
    </TouchableOpacity>
  );

  // Render law card
  const renderLaw = ({ item }: { item: typeof lawEntries[0] }) => (
    <TouchableOpacity
      style={styles.lawCard}
      onPress={() => setSelectedLaw(item.id)}
    >
      <View style={styles.lawHeader}>
        <View style={styles.lawTitleSection}>
          <Text style={styles.lawTitle}>{item.title[lang]}</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>
              {getSeverityLabel(item.severity, lang)}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#94A3B8" />
      </View>
      <Text style={styles.lawDescription} numberOfLines={2}>
        {item.description[lang]}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader 
        title={selectedLaw ? selectedLawDetails?.title[lang] || '' : selectedCategory ? lawCategories.find(c => c.id === selectedCategory)?.title[lang] || '' : t('survival.laws', 'Gesetze')} 
        showBackButton={selectedCategory !== null || selectedLaw !== null} 
        showSettings={false} 
      />

      <ScrollView style={styles.content}>
        {/* Category Overview */}
        {!selectedCategory && !selectedLaw && (
          <>
            <View style={styles.introSection}>
              <Scale size={32} color="#6366F1" />
              <Text style={styles.introTitle}>
                {lang === 'de' ? 'Rechtlicher Leitfaden für Bali' : 'Legal Guide for Bali'}
              </Text>
              <Text style={styles.introText}>
                {lang === 'de' 
                  ? 'Wichtige Gesetze und Vorschriften für Touristen in Indonesien' 
                  : 'Important laws and regulations for tourists in Indonesia'
                }
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              {lang === 'de' ? 'Kategorien' : 'Categories'}
            </Text>
            <FlashList
              data={lawCategories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategory}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}

        {/* Laws by Category */}
        {selectedCategory && !selectedLaw && (
          <>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryHeaderIcon}>
                {lawCategories.find(c => c.id === selectedCategory)?.icon}
              </Text>
              <Text style={styles.categoryHeaderTitle}>
                {lawCategories.find(c => c.id === selectedCategory)?.title[lang]}
              </Text>
            </View>

            {categoryLaws.length > 0 ? (
              <FlashList
                data={categoryLaws}
                keyExtractor={(item) => item.id}
                renderItem={renderLaw}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Info size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  {lang === 'de' ? 'Keine Gesetze in dieser Kategorie' : 'No laws in this category'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Law Details */}
        {selectedLaw && selectedLawDetails && (
          <View style={styles.detailSection}>
            {/* Severity Badge */}
            <View style={[styles.detailSeverity, { backgroundColor: getSeverityColor(selectedLawDetails.severity) + '20' }]}>
              <AlertTriangle size={20} color={getSeverityColor(selectedLawDetails.severity)} />
              <Text style={[styles.detailSeverityText, { color: getSeverityColor(selectedLawDetails.severity) }]}>
                {getSeverityLabel(selectedLawDetails.severity, lang)}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>
                {lang === 'de' ? 'Beschreibung' : 'Description'}
              </Text>
              <Text style={styles.detailText}>
                {selectedLawDetails.description[lang]}
              </Text>
            </View>

            {/* Penalty */}
            <View style={[styles.detailCard, styles.penaltyCard]}>
              <Text style={styles.detailLabel}>
                {lang === 'de' ? 'Strafe' : 'Penalty'}
              </Text>
              <Text style={[styles.detailText, styles.penaltyText]}>
                {selectedLawDetails.penalty[lang]}
              </Text>
            </View>

            {/* Tips */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>
                {lang === 'de' ? 'Tipps' : 'Tips'}
              </Text>
              {selectedLawDetails.tips[lang].map((tip, idx) => (
                <View key={idx} style={styles.tip}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                {lang === 'de'
                  ? '⚠️ Dies ist nur eine Orientierungshilfe. Gesetze können sich ändern. Im Zweifel offizielle Quellen konsultieren.'
                  : '⚠️ This is for guidance only. Laws can change. Consult official sources if in doubt.'
                }
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  categoryHeaderIcon: {
    fontSize: 32,
  },
  categoryHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  lawCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  lawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lawTitleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lawTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lawDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  detailSection: {
    paddingBottom: 24,
  },
  detailSeverity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailSeverityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 22,
  },
  penaltyCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  penaltyText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  tip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#10B981',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 22,
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
