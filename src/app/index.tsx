import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { DollarSign, MessageCircle, AlertTriangle, Map, Calendar, Shield, Users, Package, Ship, Camera, Navigation, ChevronRight } from 'lucide-react-native';

// TypeScript Interfaces
type AppRoute = '/currency' | '/phrasebook' | '/emergency' | '/map' | '/radar' | '/weather' | '/visa' | '/bargaining' | '/scooter' | '/itinerary' | '/packing' | '/ferries' | '/scanner' | '/fare' | '/laws' | '/calendar' | '/expenses' | '/rideshare' | '/safety' | '/bars' | '/crowd';

interface QuickAction {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: React.ReactNode;
  route: AppRoute;
  gradient: string;
}

interface Feature {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  route: AppRoute;
  color: string;
}

interface QuickActionCardProps {
  action: QuickAction;
  onPress: () => void;
}

interface FeatureCardProps {
  feature: Feature;
  onPress: () => void;
}

// Premium Glassmorphism Quick Action Card
const QuickActionCard = memo<QuickActionCardProps>(({ action, onPress }) => {
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(action.titleKey)}
      accessibilityHint={t(action.subtitleKey)}
      activeOpacity={0.8}
    >
      {/* Gradient Background */}
      <View style={[styles.gradientBackground, { backgroundColor: action.gradient }]} />
      
      {/* Glassmorphism Overlay */}
      <View style={styles.glassOverlay}>
        <View style={styles.quickActionIconContainer}>
          {action.icon}
        </View>
        <Text style={styles.quickActionTitle}>{t(action.titleKey)}</Text>
        <Text style={styles.quickActionSubtitle}>{t(action.subtitleKey)}</Text>
        <View style={styles.quickActionArrow}>
          <ChevronRight size={16} color="rgba(255,255,255,0.8)" />
        </View>
      </View>
    </TouchableOpacity>
  );
});

QuickActionCard.displayName = 'QuickActionCard';

// Premium Feature Card
const FeatureCard = memo<FeatureCardProps>(({ feature, onPress }) => {
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(feature.titleKey)}
      activeOpacity={0.7}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
        {feature.icon}
      </View>
      <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
    </TouchableOpacity>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const quickActions: QuickAction[] = [
    { 
      id: 'currency', 
      titleKey: 'currency.title', 
      subtitleKey: 'currency.subtitle', 
      icon: <DollarSign size={28} color="#FFFFFF" />, 
      route: '/currency', 
      gradient: '#00B4D8' 
    },
    { 
      id: 'phrasebook', 
      titleKey: 'phrasebook.title', 
      subtitleKey: 'phrasebook.subtitle', 
      icon: <MessageCircle size={28} color="#FFFFFF" />, 
      route: '/phrasebook', 
      gradient: '#90BE6D' 
    },
    { 
      id: 'emergency', 
      titleKey: 'emergency.title', 
      subtitleKey: 'emergency.subtitle', 
      icon: <AlertTriangle size={28} color="#FFFFFF" />, 
      route: '/emergency', 
      gradient: '#FF6B6B' 
    },
    { 
      id: 'map', 
      titleKey: 'map.title', 
      subtitleKey: 'map.subtitle', 
      icon: <Map size={28} color="#FFFFFF" />, 
      route: '/map', 
      gradient: '#00B4D8' 
    },
    { 
      id: 'radar', 
      titleKey: 'radar.title', 
      subtitleKey: 'radar.subtitle', 
      icon: <Navigation size={28} color="#FFFFFF" />, 
      route: '/radar', 
      gradient: '#10B981' 
    },
    { 
      id: 'weather', 
      titleKey: 'weather.title', 
      subtitleKey: 'weather.subtitle', 
      icon: <Calendar size={28} color="#FFFFFF" />, 
      route: '/weather', 
      gradient: '#F59E0B' 
    },
  ];

  const features: Feature[] = [
    { id: 'visa', titleKey: 'visa.title', icon: <Calendar size={22} color="#F59E0B" />, route: '/visa', color: '#F59E0B' },
    { id: 'bargaining', titleKey: 'bargaining.title', icon: <DollarSign size={22} color="#90BE6D" />, route: '/bargaining', color: '#90BE6D' },
    { id: 'scooter', titleKey: 'scooter.title', icon: <Shield size={22} color="#00B4D8" />, route: '/scooter', color: '#00B4D8' },
    { id: 'itinerary', titleKey: 'itinerary.title', icon: <Users size={22} color="#90BE6D" />, route: '/itinerary', color: '#90BE6D' },
    { id: 'packing', titleKey: 'packing.title', icon: <Package size={22} color="#F59E0B" />, route: '/packing', color: '#F59E0B' },
    { id: 'ferries', titleKey: 'ferries.title', icon: <Ship size={22} color="#00B4D8" />, route: '/ferries', color: '#00B4D8' },
    { id: 'scanner', titleKey: 'scanner.title', icon: <Camera size={22} color="#90BE6D" />, route: '/scanner', color: '#90BE6D' },
    { id: 'fare', titleKey: 'fare.title', icon: <Navigation size={22} color="#F59E0B" />, route: '/fare', color: '#F59E0B' },
    { id: 'laws', titleKey: 'laws.title', icon: <AlertTriangle size={22} color="#DC2626" />, route: '/laws', color: '#DC2626' },
    { id: 'calendar', titleKey: 'calendar.title', icon: <Calendar size={22} color="#90BE6D" />, route: '/calendar', color: '#90BE6D' },
    { id: 'expenses', titleKey: 'expenses.title', icon: <DollarSign size={22} color="#F59E0B" />, route: '/expenses', color: '#F59E0B' },
    { id: 'rideshare', titleKey: 'rideshare.title', icon: <Users size={22} color="#00B4D8" />, route: '/rideshare', color: '#00B4D8' },
    { id: 'safety', titleKey: 'safety.title', icon: <Shield size={22} color="#10B981" />, route: '/safety', color: '#10B981' },
    { id: 'bars', titleKey: 'bars.title', icon: <AlertTriangle size={22} color="#F59E0B" />, route: '/bars', color: '#F59E0B' },
    { id: 'crowd', titleKey: 'crowd.title', icon: <Users size={22} color="#8B5CF6" />, route: '/crowd', color: '#8B5CF6' },
  ];

  const handleQuickActionPress = useCallback((route: AppRoute) => {
    try {
      router.push(route);
    } catch (error) {
      console.error(`Navigation error to ${route}:`, error);
    }
  }, [router]);

  const handleFeaturePress = useCallback((route: AppRoute) => {
    try {
      router.push(route);
    } catch (error) {
      console.error(`Navigation error to ${route}:`, error);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{t('home.welcome')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🌴</Text>
          </View>
        </View>

        {/* Quick Actions - Premium Bento Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ {t('home.quickAccess')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                action={action}
                onPress={() => handleQuickActionPress(action.route)}
              />
            ))}
          </View>
        </View>

        {/* Features - Premium Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 {t('home.featured')}</Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onPress={() => handleFeaturePress(feature.route)}
              />
            ))}
          </View>
        </View>

        {/* Emergency Banner - Premium Glassmorphism */}
        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={() => router.push('/emergency')}
          accessibilityRole="button"
          accessibilityLabel={t('emergency.title')}
          accessibilityHint={t('emergency.subtitle')}
          activeOpacity={0.9}
        >
          <View style={styles.emergencyGradient} />
          <View style={styles.emergencyContent}>
            <View style={styles.emergencyIconContainer}>
              <AlertTriangle size={28} color="#FFFFFF" />
            </View>
            <View style={styles.emergencyTextContainer}>
              <Text style={styles.emergencyTitle}>🚨 {t('home.emergency')}?</Text>
              <Text style={styles.emergencySubtitle}>{t('emergency.subtitle')}</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate-50 - Premium Light Background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for bottom navigation
  },
  
  // Premium Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A', // Slate-900
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B', // Slate-500
    fontWeight: '500',
  },
  headerBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerBadgeText: {
    fontSize: 28,
  },

  // Section Styling
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B4D8',
  },

  // Quick Actions - Premium Bento Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    width: '47%',
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  quickActionArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Features - Premium Cards
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155', // Slate-700
    textAlign: 'center',
    lineHeight: 14,
  },

  // Emergency Banner - Premium Glassmorphism
  emergencyBanner: {
    height: 88,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  emergencyGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B6B',
  },
  emergencyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emergencySubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});