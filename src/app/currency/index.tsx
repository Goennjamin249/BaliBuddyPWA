import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DollarSign, ArrowLeft, Home, RefreshCw, TrendingUp, TrendingDown, Calculator } from 'lucide-react-native';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const currencies: CurrencyData[] = [
  { code: 'IDR', name: 'Indonesische Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'Britisches Pfund', symbol: '£', flag: '🇬🇧' },
  { code: 'AUD', name: 'Australischer Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapur Dollar', symbol: 'S$', flag: '🇸🇬' },
];

// Bali 2026 Reference Prices
const BALI_REFERENCE_PRICES = {
  'Wasser (1L)': 5000,
  'Kaffee': 35000,
  'Mittagessen': 75000,
  'Abendessen': 150000,
  'Scooter (Tag)': 100000,
  'Taxi (10km)': 100000,
  'Hotel (Nacht)': 500000,
  'Massage': 150000,
};

export default function CurrencyScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('1000000');
  const [fromCurrency, setFromCurrency] = useState<string>('IDR');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Fetch live exchange rates
  const fetchExchangeRates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using ExchangeRate-API (free tier)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();
      
      if (data.rates) {
        setExchangeRates(data.rates);
        setLastUpdate(new Date());
        setIsOffline(false);
        
        // Cache to localStorage for offline use
        if (typeof window !== 'undefined') {
          localStorage.setItem('cachedRates', JSON.stringify({
            timestamp: Date.now(),
            base: fromCurrency,
            rates: data.rates,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Load from cache if available
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cachedRates');
        if (cached) {
          const { rates, timestamp } = JSON.parse(cached);
          setExchangeRates(rates);
          setLastUpdate(new Date(timestamp));
          setIsOffline(true);
        } else {
          // Fallback rates if no cache
          setExchangeRates({
            IDR: 1,
            EUR: 0.000058,
            USD: 0.000063,
            GBP: 0.000050,
            AUD: 0.000096,
            SGD: 0.000085,
          });
          setIsOffline(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [fromCurrency]);

  // Fetch rates on mount and when fromCurrency changes
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  // Calculate conversion
  const calculateConversion = useCallback((value: string, from: string, to: string): string => {
    const numValue = parseFloat(value) || 0;
    if (!exchangeRates[to] || !exchangeRates[from]) return '0';
    
    // Convert to base currency (USD) first, then to target
    const inUSD = numValue / exchangeRates[from];
    const result = inUSD * exchangeRates[to];
    
    return result.toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }, [exchangeRates]);

  // Calculate rate change indicator
  const getRateChange = useCallback((currency: string): 'up' | 'down' | 'stable' => {
    // Simulate rate change for demo
    const random = Math.random();
    if (random > 0.6) return 'up';
    if (random < 0.4) return 'down';
    return 'stable';
  }, []);

  const convertedAmount = calculateConversion(amount, fromCurrency, toCurrency);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>💱 Währungsrechner</Text>
            <Text style={styles.subtitle}>Live-Kurse für Bali</Text>
          </View>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Home size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Status Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>📴 Offline-Modus (gecachezte Kurse)</Text>
          </View>
        )}

        {/* Main Converter Card */}
        <View style={styles.converterCard}>
          <View style={styles.converterHeader}>
            <Calculator size={24} color="#00B4D8" />
            <Text style={styles.converterTitle}>💰 Konvertierung</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchExchangeRates}
              disabled={isLoading}
            >
              <RefreshCw size={20} color={isLoading ? "#9CA3AF" : "#00B4D8"} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Betrag ({fromCurrency})</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="Betrag eingeben"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          {/* Currency Selector */}
          <View style={styles.currencySelector}>
            <Text style={styles.selectorLabel}>Von:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyChip,
                    fromCurrency === currency.code && styles.currencyChipActive
                  ]}
                  onPress={() => setFromCurrency(currency.code)}
                >
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={[
                    styles.currencyCode,
                    fromCurrency === currency.code && styles.currencyCodeActive
                  ]}>
                    {currency.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.currencySelector}>
            <Text style={styles.selectorLabel}>Nach:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyChip,
                    toCurrency === currency.code && styles.currencyChipActive
                  ]}
                  onPress={() => setToCurrency(currency.code)}
                >
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={[
                    styles.currencyCode,
                    toCurrency === currency.code && styles.currencyCodeActive
                  ]}>
                    {currency.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Result */}
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>Ergebnis:</Text>
            <View style={styles.resultContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#00B4D8" />
              ) : (
                <>
                  <Text style={styles.resultAmount}>{convertedAmount}</Text>
                  <Text style={styles.resultCurrency}>{toCurrency}</Text>
                </>
              )}
            </View>
            {lastUpdate && (
              <Text style={styles.lastUpdate}>
                Letzte Aktualisierung: {lastUpdate.toLocaleTimeString('de-DE')}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Conversion Buttons */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>⚡ Schnellkonvertierung</Text>
          <View style={styles.quickButtons}>
            {['100000', '500000', '1000000', '5000000'].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickButton}
                onPress={() => setAmount(quickAmount)}
              >
                <Text style={styles.quickButtonText}>
                  Rp {parseInt(quickAmount).toLocaleString('de-DE')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bali Reference Prices */}
        <View style={styles.referenceSection}>
          <Text style={styles.sectionTitle}>🏝️ Bali Referenzpreise (2026)</Text>
          <View style={styles.referenceGrid}>
            {Object.entries(BALI_REFERENCE_PRICES).map(([item, price]) => (
              <View key={item} style={styles.referenceCard}>
                <Text style={styles.referenceItem}>{item}</Text>
                <Text style={styles.referencePrice}>Rp {price.toLocaleString('de-DE')}</Text>
                <Text style={styles.referenceConverted}>
                  ≈ {calculateConversion(price.toString(), 'IDR', toCurrency)} {toCurrency}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exchange Rate Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📊 Wechselkurs-Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aktueller Kurs:</Text>
              <Text style={styles.infoValue}>
                1 {fromCurrency} = {exchangeRates[toCurrency]?.toFixed(6) || '0'} {toCurrency}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trend:</Text>
              <View style={styles.trendContainer}>
                {getRateChange(toCurrency) === 'up' && <TrendingUp size={16} color="#10B981" />}
                {getRateChange(toCurrency) === 'down' && <TrendingDown size={16} color="#EF4444" />}
                <Text style={[
                  styles.trendText,
                  { color: getRateChange(toCurrency) === 'up' ? '#10B981' : getRateChange(toCurrency) === 'down' ? '#EF4444' : '#6B7280' }
                ]}>
                  {getRateChange(toCurrency) === 'up' ? 'Steigend' : getRateChange(toCurrency) === 'down' ? 'Fallend' : 'Stabil'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  converterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  converterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  converterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  currencySelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  currencyScroll: {
    flexDirection: 'row',
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  currencyChipActive: {
    backgroundColor: '#00B4D8',
  },
  currencyFlag: {
    fontSize: 18,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  currencyCodeActive: {
    color: '#FFFFFF',
  },
  resultSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00B4D8',
  },
  resultCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  quickSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  referenceSection: {
    marginBottom: 24,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  referenceCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  referenceItem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  referencePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B4D8',
    marginBottom: 4,
  },
  referenceConverted: {
    fontSize: 12,
    color: '#64748B',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
});