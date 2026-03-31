import {
  AlertCircle,
  ArrowLeftRight,
  Bed,
  Calculator,
  Car,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Info,
  MapPin,
  Plus,
  ShoppingBag,
  Tag,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
  X,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import { Chip, ListLink, AnimatedView } from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";
import { TourStop, useTourPlannerStore } from "../../stores/tourPlannerStore";

// ==================== TYPES ====================
interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  flag: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  category: string;
  date: string;
}

interface BargainItem {
  id: string;
  category: string;
  item: string;
  touristPrice: string;
  localPrice: string;
  fairPrice: string;
  tip: string;
}

// ==================== CONSTANTS ====================
const CURRENCIES: Currency[] = [
  { code: "EUR", name: "Euro", symbol: "€", rate: 1, flag: "🇪🇺" },
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.08, flag: "🇺🇸" },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    rate: 16800,
    flag: "🇮🇩",
  },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.86, flag: "🇬🇧" },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    rate: 1.65,
    flag: "🇦🇺",
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    rate: 1.45,
    flag: "🇸🇬",
  },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    rate: 4.85,
    flag: "🇲🇾",
  },
  { code: "THB", name: "Thai Baht", symbol: "฿", rate: 37.5, flag: "🇹🇭" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 162, flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 7.8, flag: "🇨🇳" },
];

const EXPENSE_CATEGORIES = [
  { id: "food", name: "Essen", icon: Utensils, color: "#F59E0B" },
  { id: "transport", name: "Transport", icon: Car, color: "#3B82F6" },
  { id: "accommodation", name: "Unterkunft", icon: Bed, color: "#8B5CF6" },
  { id: "activity", name: "Aktivität", icon: Ticket, color: "#EC4899" },
  { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "#10B981" },
  { id: "other", name: "Sonstiges", icon: Zap, color: "#6B7280" },
];

const BARGAINING_GUIDE: BargainItem[] = [
  {
    id: "b1",
    category: "Transport",
    item: "Scooter Miete (Tag)",
    touristPrice: "150k - 200k IDR",
    localPrice: "50k - 70k IDR",
    fairPrice: "70k - 100k IDR",
    tip: "Wochenpreis verhandeln (500k-700k)",
  },
  {
    id: "b2",
    category: "Transport",
    item: "Grab/Gojek (5km)",
    touristPrice: "50k - 80k IDR",
    localPrice: "20k - 30k IDR",
    fairPrice: "25k - 35k IDR",
    tip: "App-Preis ist fix - nicht verhandelbar",
  },
  {
    id: "b3",
    category: "Transport",
    item: "Taxi Flughafen-Seminyak",
    touristPrice: "300k - 500k IDR",
    localPrice: "150k - 200k IDR",
    fairPrice: "200k - 250k IDR",
    tip: "Bluebird Taxi nutzen - Meter verlangen",
  },
  {
    id: "b4",
    category: "Essen",
    item: "Warung Hauptgericht",
    touristPrice: "50k - 80k IDR",
    localPrice: "15k - 25k IDR",
    fairPrice: "25k - 35k IDR",
    tip: "Preise stehen meist auf der Karte",
  },
  {
    id: "b5",
    category: "Essen",
    item: "Street Food (Satay)",
    touristPrice: "30k - 50k IDR",
    localPrice: "10k - 15k IDR",
    fairPrice: "15k - 20k IDR",
    tip: "Anzahl Spieße vorher klären",
  },
  {
    id: "b6",
    category: "Shopping",
    item: "Sarong",
    touristPrice: "150k - 300k IDR",
    localPrice: "30k - 50k IDR",
    fairPrice: "50k - 80k IDR",
    tip: "Bei 50% vom Anfangspreis starten",
  },
  {
    id: "b7",
    category: "Shopping",
    item: "Holzschnitzerei (klein)",
    touristPrice: "500k - 1M IDR",
    localPrice: "100k - 200k IDR",
    fairPrice: "200k - 350k IDR",
    tip: "In Ubud günstiger als am Strand",
  },
  {
    id: "b8",
    category: "Shopping",
    item: "Silberschmuck (Gramm)",
    touristPrice: "50k - 100k IDR",
    localPrice: "15k - 25k IDR",
    fairPrice: "25k - 40k IDR",
    tip: "Gewicht prüfen - 925 Sterling",
  },
  {
    id: "b9",
    category: "Aktivitäten",
    item: "Surfkurs (2h)",
    touristPrice: "600k - 1M IDR",
    localPrice: "300k - 400k IDR",
    fairPrice: "400k - 500k IDR",
    tip: "Mehrfach-Tage rabattieren",
  },
  {
    id: "b10",
    category: "Aktivitäten",
    item: "Schnorchel-Tour",
    touristPrice: "800k - 1.5M IDR",
    localPrice: "400k - 600k IDR",
    fairPrice: "500k - 700k IDR",
    tip: "Boot-Qualität und Essen inkludiert prüfen",
  },
  {
    id: "b11",
    category: "Unterkunft",
    item: "Homestay (Nacht)",
    touristPrice: "400k - 800k IDR",
    localPrice: "150k - 250k IDR",
    fairPrice: "200k - 350k IDR",
    tip: "Wochen-/Monatspreise stark rabattiert",
  },
  {
    id: "b12",
    category: "Unterkunft",
    item: "Hotel 3* (Nacht)",
    touristPrice: "800k - 1.5M IDR",
    localPrice: "400k - 600k IDR",
    fairPrice: "500k - 800k IDR",
    tip: "Booking.com vs. Walk-in vergleichen",
  },
];

// ==================== MAIN COMPONENT ====================
export default function WalletScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "converter" | "expenses" | "planner" | "bargain"
  >("converter");

  // Currency Converter State
  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<string>("EUR");
  const [toCurrency, setToCurrency] = useState<string>("IDR");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(false);

  // Tour Planner Store
  const {
    participants,
    tourStops,
    addParticipant,
    removeParticipant,
    addTourStop,
    removeTourStop,
    addPayment,
    removePayment,
    calculateBalances,
    calculateDebts,
    getTotalCost,
    isModalOpen,
    setIsModalOpen,
    editingStopId,
    setEditingStopId,
  } = useTourPlannerStore();

  // Local UI State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedStopForPayment, setSelectedStopForPayment] =
    useState<TourStop | null>(null);
  const [newParticipantName, setNewParticipantName] = useState<string>("");

  // Bargaining Guide State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Fetch live rates on mount
  useEffect(() => {
    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Exchange Rates (Frankfurter API)
  const fetchLiveRates = async () => {
    setLoadingRates(true);
    try {
      const response = await fetch(
        "https://api.frankfurter.app/latest?from=EUR",
      );
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setLiveRates(data.rates);
    } catch (error) {
      console.error("Rate fetch error:", error);
    } finally {
      setLoadingRates(false);
    }
  };

  // Convert Currency
  const convertCurrency = useCallback(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      setConvertedAmount(null);
      return;
    }

    let rate: number;

    // Use live rates if available
    if (liveRates[fromCurrency] && liveRates[toCurrency]) {
      // Convert via EUR base
      const inEUR = parseFloat(amount) / liveRates[fromCurrency];
      rate = inEUR * liveRates[toCurrency];
    } else {
      // Fallback to static rates
      const fromRate =
        CURRENCIES.find((c) => c.code === fromCurrency)?.rate || 1;
      const toRate = CURRENCIES.find((c) => c.code === toCurrency)?.rate || 1;
      rate = (parseFloat(amount) / fromRate) * toRate;
    }

    setConvertedAmount(rate);
  }, [amount, fromCurrency, toCurrency, liveRates]);

  useEffect(() => {
    convertCurrency();
  }, [convertCurrency]);

  // Swap currencies
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Quick select currency
  const handleQuickCurrency = (code: string) => {
    if (fromCurrency !== code && toCurrency !== code) {
      setToCurrency(code);
    } else if (fromCurrency === code) {
      setFromCurrency(toCurrency);
      setToCurrency(code);
    }
  };

  // Format large numbers for IDR
  const formatIDR = (value: number): string => {
    return value.toLocaleString("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format small numbers for EUR
  const formatEUR = (value: number): string => {
    return value.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Tour Planner handlers
  const handleAddTourStop = (stop: Omit<TourStop, "id" | "payments">) => {
    addTourStop(stop);
  };

  const handleOpenPaymentModal = (stop: TourStop) => {
    setSelectedStopForPayment(stop);
    setPaymentModalVisible(true);
  };

  // Get currency icon
  const getCurrencyFlag = (code: string): string => {
    return CURRENCIES.find((c) => c.code === code)?.flag || "💱";
  };

  // ==================== RENDER FUNCTIONS ====================

  // Render Currency Converter Tab
  const renderConverterTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💱 Währungsrechner</Text>

      {/* Live Rates Indicator */}
      <View style={styles.liveRatesIndicator}>
        {loadingRates ? (
          <Text style={styles.liveRatesText}>🔄 Live-Kurse laden...</Text>
        ) : (
          <Text style={styles.liveRatesText}>✅ Live-Kurse aktualisiert</Text>
        )}
        <Text style={styles.lastUpdateText}>Frankfurter API</Text>
      </View>

      {/* Main Converter Card */}
      <View style={styles.converterCard}>
        {/* From Amount */}
        <View style={styles.converterRow}>
          <View style={styles.amountInputContainer}>
            <Text style={styles.inputLabel}>Betrag</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#94A3B8"
              nativeID="amount-input"
              autoComplete="off"
            />
          </View>
          <TouchableOpacity
            style={styles.currencySelector}
            onPress={() => setShowCurrencyPicker("from")}
          >
            <Text style={styles.currencyFlag}>
              {getCurrencyFlag(fromCurrency)}
            </Text>
            <Text style={styles.currencyCode}>{fromCurrency}</Text>
            <ChevronDown size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Swap Button */}
        <TouchableOpacity
          style={styles.swapButton}
          onPress={handleSwapCurrencies}
        >
          <ArrowLeftRight size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* To Amount */}
        <View style={styles.converterRow}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Ergebnis</Text>
            <Text style={styles.resultAmount}>
              {convertedAmount !== null
                ? toCurrency === "IDR"
                  ? formatIDR(convertedAmount)
                  : formatEUR(convertedAmount)
                : "0.00"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.currencySelector, { backgroundColor: "#10B981" }]}
            onPress={() => setShowCurrencyPicker("to")}
          >
            <Text style={styles.currencyFlag}>
              {getCurrencyFlag(toCurrency)}
            </Text>
            <Text style={styles.currencyCode}>{toCurrency}</Text>
            <ChevronDown size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Exchange Rate Info */}
        {!!convertedAmount && !!amount && (
          <View style={styles.rateInfo}>
            <TrendingUp size={14} color="#64748B" />
            <Text style={styles.rateInfoText}>
              1 {fromCurrency} ={" "}
              {(convertedAmount / parseFloat(amount)).toFixed(4)} {toCurrency}
            </Text>
          </View>
        )}
      </View>

      {/* Quick Currency Buttons */}
      <Text style={styles.subsectionTitle}>Häufige Währungen</Text>
      <View style={styles.currenciesGrid}>
        {CURRENCIES.slice(0, 6).map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyCard,
              (fromCurrency === currency.code ||
                toCurrency === currency.code) &&
                styles.currencyCardActive,
            ]}
            onPress={() => handleQuickCurrency(currency.code)}
          >
            <Text style={styles.currencyFlagLarge}>{currency.flag}</Text>
            <Text style={styles.currencyName}>{currency.code}</Text>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Common Conversions */}
      <Text style={styles.subsectionTitle}>Beliebte Umrechnungen</Text>
      <View style={styles.popularConversions}>
        {[
          { from: "EUR", to: "IDR", amount: 1 },
          { from: "EUR", to: "IDR", amount: 10 },
          { from: "EUR", to: "IDR", amount: 50 },
          { from: "EUR", to: "IDR", amount: 100 },
        ].map((conv, index) => {
          const rate = liveRates["IDR"] || 16800;
          const result = conv.amount * rate;
          return (
            <TouchableOpacity
              key={index}
              style={styles.popularConversionItem}
              onPress={() => {
                setFromCurrency(conv.from);
                setToCurrency(conv.to);
                setAmount(conv.amount.toString());
              }}
            >
              <Text style={styles.popularConversionFrom}>
                {conv.amount} {conv.from}
              </Text>
              <ArrowLeftRight size={14} color="#94A3B8" />
              <Text style={styles.popularConversionTo}>
                {formatIDR(result)} {conv.to}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render Expenses Tab
  const renderExpensesTab = () => {
    const balances = calculateBalances();
    const debts = calculateDebts();
    const totalCost = getTotalCost();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Ausgaben & Splitter</Text>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Users size={24} color="#FFFFFF" />
            <Text style={styles.summaryCardValue}>{participants.length}</Text>
            <Text style={styles.summaryCardLabel}>Personen</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardPurple]}>
            <MapPin size={24} color="#FFFFFF" />
            <Text style={styles.summaryCardValue}>{tourStops.length}</Text>
            <Text style={styles.summaryCardLabel}>Stopps</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Wallet size={24} color="#FFFFFF" />
            <Text style={styles.summaryCardValue}>
              Rp {formatIDR(totalCost)}
            </Text>
            <Text style={styles.summaryCardLabel}>Gesamt</Text>
          </View>
        </View>

        {/* Add Participant */}
        <View style={styles.addParticipantSection}>
          <Text style={styles.subsectionTitle}>Teilnehmer verwalten</Text>
          <View style={styles.quickAddRow}>
            <TextInput
              style={styles.quickAddInput}
              placeholder="Name eingeben..."
              placeholderTextColor="#94A3B8"
              value={newParticipantName}
              onChangeText={setNewParticipantName}
              onSubmitEditing={() => {
                if (newParticipantName.trim()) {
                  addParticipant(newParticipantName.trim());
                  setNewParticipantName("");
                }
              }}
            />
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => {
                if (newParticipantName.trim()) {
                  addParticipant(newParticipantName.trim());
                  setNewParticipantName("");
                }
              }}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.participantsChips}>
            {participants.map((participant) => (
              <View key={participant.id} style={styles.participantChip}>
                <Users size={14} color="#00B4D8" />
                <Text style={styles.participantChipText}>
                  {participant.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeParticipant(participant.id)}
                  style={styles.removeParticipantChip}
                >
                  <Trash2 size={12} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {participants.length === 0 && (
              <Text style={styles.noParticipantsText}>
                Noch keine Teilnehmer - füge welche hinzu
              </Text>
            )}
          </View>
        </View>

        {/* Balances Overview */}
        {balances.length > 0 && (
          <View style={styles.balancesSection}>
            <Text style={styles.subsectionTitle}>Guthaben & Schulden</Text>
            {balances.map((balance) => (
              <View
                key={balance.participantId}
                style={[
                  styles.balanceCard,
                  balance.balance >= 0
                    ? styles.balanceCardPositive
                    : styles.balanceCardNegative,
                ]}
              >
                <View style={styles.balanceHeader}>
                  <Users
                    size={20}
                    color={balance.balance >= 0 ? "#10B981" : "#EF4444"}
                  />
                  <Text style={styles.balanceName}>
                    {balance.participantName}
                  </Text>
                </View>
                <View style={styles.balanceDetails}>
                  <View style={styles.balanceDetailRow}>
                    <Text style={styles.balanceDetailLabel}>Bezahlt:</Text>
                    <Text style={styles.balanceDetailValue}>
                      Rp {formatIDR(balance.paid)}
                    </Text>
                  </View>
                  <View style={styles.balanceDetailRow}>
                    <Text style={styles.balanceDetailLabel}>Schuldet:</Text>
                    <Text style={styles.balanceDetailValue}>
                      Rp {formatIDR(balance.owes)}
                    </Text>
                  </View>
                  <View style={styles.balanceDivider} />
                  <View style={styles.balanceDetailRow}>
                    <Text
                      style={[
                        styles.balanceDetailLabel,
                        styles.balanceTotalLabel,
                      ]}
                    >
                      {balance.balance >= 0 ? "Bekommt zurück" : "Schuldet"}:
                    </Text>
                    <Text
                      style={[
                        styles.balanceDetailValue,
                        balance.balance >= 0
                          ? styles.balancePositive
                          : styles.balanceNegative,
                      ]}
                    >
                      Rp {formatIDR(Math.abs(balance.balance))}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Debt Settlements */}
        {debts.length > 0 && (
          <View style={styles.debtsSection}>
            <Text style={styles.subsectionTitle}>💵 Ausgleich</Text>
            {debts.map((debt, index) => (
              <View key={index} style={styles.debtCard}>
                <View style={styles.debtRow}>
                  <View style={styles.debtPerson}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.debtPersonName}>
                      {debt.fromParticipantName}
                    </Text>
                  </View>
                  <Text style={styles.debtArrow}>→</Text>
                  <View style={styles.debtPerson}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text style={styles.debtPersonName}>
                      {debt.toParticipantName}
                    </Text>
                  </View>
                </View>
                <Text style={styles.debtAmount}>
                  Rp {formatIDR(debt.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tour Stops */}
        <View style={styles.tourStopsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.subsectionTitle}>Tour Stopps</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalOpen(true)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {tourStops.map((stop, index) => {
            const stopPaid = stop.payments.reduce(
              (sum, p) => sum + p.amount,
              0,
            );
            const stopRemaining = stop.totalCost - stopPaid;
            const stopParticipants = stop.participantIds
              .map((id) => participants.find((p) => p.id === id)?.name)
              .filter(Boolean)
              .join(", ");

            return (
              <View key={stop.id} style={styles.tourStopCard}>
                <View style={styles.tourStopHeader}>
                  <View style={styles.tourStopNumber}>
                    <Text style={styles.tourStopNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.tourStopInfo}>
                    <Text style={styles.tourStopName}>{stop.name}</Text>
                    {stop.location && (
                      <Text style={styles.tourStopLocation}>
                        <MapPin size={12} color="#64748B" /> {stop.location}
                      </Text>
                    )}
                  </View>
                  <View style={styles.tourStopActions}>
                    <TouchableOpacity
                      style={styles.paymentButton}
                      onPress={() => handleOpenPaymentModal(stop)}
                    >
                      <Wallet size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteTourStopButton}
                      onPress={() => removeTourStop(stop.id)}
                    >
                      <Trash2 size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.tourStopDetails}>
                  <View style={styles.tourStopDetailRow}>
                    <Text style={styles.tourStopDetailLabel}>Kosten:</Text>
                    <Text style={styles.tourStopDetailValue}>
                      Rp {formatIDR(stop.totalCost)}
                    </Text>
                  </View>
                  <View style={styles.tourStopDetailRow}>
                    <Text style={styles.tourStopDetailLabel}>Teilnehmer:</Text>
                    <Text style={styles.tourStopDetailValue}>
                      {stopParticipants || "Keine"}
                    </Text>
                  </View>
                  <View style={styles.tourStopDetailRow}>
                    <Text style={styles.tourStopDetailLabel}>Bezahlt:</Text>
                    <Text
                      style={[
                        styles.tourStopDetailValue,
                        stopRemaining <= 0
                          ? styles.paidOff
                          : styles.partiallyPaid,
                      ]}
                    >
                      Rp {formatIDR(stopPaid)}
                    </Text>
                  </View>
                  {stopRemaining > 0 && (
                    <View style={styles.tourStopDetailRow}>
                      <Text style={styles.tourStopDetailLabel}>Offen:</Text>
                      <Text
                        style={[styles.tourStopDetailValue, styles.remaining]}
                      >
                        Rp {formatIDR(stopRemaining)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {tourStops.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MapPin size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyText}>Keine Stopps geplant</Text>
              <Text style={styles.emptySubtext}>
                Tippe auf + um einen Stopp hinzuzufügen
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render Bargaining Guide Tab
  const renderBargainTab = () => {
    const categories = [
      "all",
      ...new Set(BARGAINING_GUIDE.map((item) => item.category)),
    ];

    const filteredItems =
      selectedCategory === "all"
        ? BARGAINING_GUIDE
        : BARGAINING_GUIDE.filter((item) => item.category === selectedCategory);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏷️ Preisverhandlungs-Guide</Text>

        <View style={styles.bargainInfo}>
          <Info size={20} color="#3B82F6" />
          <Text style={styles.bargainInfoText}>
            Verhandle respektvoll! Starte bei 40-50% des genannten Preises und
            treffe dich in der Mitte.
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat === "all" ? "Alle" : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Items List */}
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.bargainItemCard}>
            <TouchableOpacity
              style={styles.bargainItemHeader}
              onPress={() =>
                setExpandedItem(expandedItem === item.id ? null : item.id)
              }
            >
              <View style={styles.bargainItemTitle}>
                <Tag size={18} color="#8B5CF6" />
                <Text style={styles.bargainItemName}>{item.item}</Text>
              </View>
              {expandedItem === item.id ? (
                <ChevronUp size={20} color="#64748B" />
              ) : (
                <ChevronDown size={20} color="#64748B" />
              )}
            </TouchableOpacity>

            {expandedItem === item.id && (
              <View style={styles.bargainItemDetails}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>👤 Touristenpreis:</Text>
                  <Text style={[styles.priceValue, styles.priceTourist]}>
                    {item.touristPrice}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>🏠 Einheimischer:</Text>
                  <Text style={[styles.priceValue, styles.priceLocal]}>
                    {item.localPrice}
                  </Text>
                </View>
                <View style={[styles.priceRow, styles.priceRowFair]}>
                  <Text style={styles.priceLabel}>✅ Fairer Preis:</Text>
                  <Text style={[styles.priceValue, styles.priceFair]}>
                    {item.fairPrice}
                  </Text>
                </View>
                <View style={styles.tipBox}>
                  <Info size={16} color="#10B981" />
                  <Text style={styles.tipText}>{item.tip}</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Bargaining Tips */}
        <View style={styles.bargainTipsCard}>
          <Text style={styles.bargainTipsTitle}>💡 Verhandlungstipps</Text>
          <View style={styles.tipList}>
            <Text style={styles.tipListItem}>• Immer freundlich bleiben</Text>
            <Text style={styles.tipListItem}>• Bei 40-50% starten</Text>
            <Text style={styles.tipListItem}>• Bereit sein zu gehen</Text>
            <Text style={styles.tipListItem}>• Mengenrabatt fragen</Text>
            <Text style={styles.tipListItem}>• Bar in kleinen Scheinen</Text>
          </View>
        </View>
      </View>
    );
  };

  // Currency Picker Modal
  const [showCurrencyPicker, setShowCurrencyPicker] = useState<
    "from" | "to" | null
  >(null);

  const renderCurrencyPickerModal = () => (
    <Modal
      visible={showCurrencyPicker !== null}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCurrencyPicker(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showCurrencyPicker === "from" ? "Von Währung" : "Zu Währung"}
            </Text>
            <TouchableOpacity onPress={() => setShowCurrencyPicker(null)}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.currencyList}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyListItem,
                  ((showCurrencyPicker === "from" &&
                    fromCurrency === currency.code) ||
                    (showCurrencyPicker === "to" &&
                      toCurrency === currency.code)) &&
                    styles.currencyListItemActive,
                ]}
                onPress={() => {
                  if (showCurrencyPicker === "from") {
                    setFromCurrency(currency.code);
                  } else {
                    setToCurrency(currency.code);
                  }
                  setShowCurrencyPicker(null);
                }}
              >
                <Text style={styles.currencyListItemFlag}>{currency.flag}</Text>
                <View style={styles.currencyListItemInfo}>
                  <Text style={styles.currencyListItemCode}>
                    {currency.code}
                  </Text>
                  <Text style={styles.currencyListItemName}>
                    {currency.name}
                  </Text>
                </View>
                <Text style={styles.currencyListItemSymbol}>
                  {currency.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header
          title={t("wallet.title", "Wallet & Planer")}
          showBackButton={false}
        />

        {/* Tab Selector */}
        <AnimatedView animation="fadeIn" delay={100}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "converter" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("converter")}
            >
              <DollarSign
                size={20}
                color={activeTab === "converter" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "converter" && styles.tabTextActive,
                ]}
              >
                Rechner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "expenses" && styles.tabActive]}
              onPress={() => setActiveTab("expenses")}
            >
              <Calculator
                size={20}
                color={activeTab === "expenses" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "expenses" && styles.tabTextActive,
                ]}
              >
                Splitter
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "bargain" && styles.tabActive]}
              onPress={() => setActiveTab("bargain")}
            >
              <Tag
                size={20}
                color={activeTab === "bargain" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "bargain" && styles.tabTextActive,
                ]}
              >
                Preise
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>

        {/* Main Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "ios" ? 140 : 120,
          }}
        >
          {activeTab === "converter" && renderConverterTab()}
          {activeTab === "expenses" && renderExpensesTab()}
          {activeTab === "bargain" && renderBargainTab()}
        </ScrollView>

        {/* Currency Picker Modal */}
        {renderCurrencyPickerModal()}
      </SafeAreaView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.5)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#00B4D8",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 12,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#00B4D8",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  // Live Rates Indicator
  liveRatesIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  liveRatesText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
  },
  lastUpdateText: {
    fontSize: 11,
    color: "#64748B",
  },
  // Converter Card
  converterCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    elevation: 4,
  },
  converterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  amountInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
  },
  amountInput: {
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    borderRadius: 14,
    padding: 14,
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  currencySelector: {
    backgroundColor: "#00B4D8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 100,
  },
  currencyFlag: {
    fontSize: 20,
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  swapButton: {
    backgroundColor: "#00B4D8",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    boxShadow: "0 4px 8px rgba(0, 180, 216, 0.3)",
    elevation: 4,
  },
  resultContainer: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#10B981",
  },
  rateInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  rateInfoText: {
    fontSize: 13,
    color: "#64748B",
  },
  // Currencies Grid
  currenciesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  currencyCard: {
    width: "31%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  currencyCardActive: {
    backgroundColor: "rgba(0, 180, 216, 0.15)",
    borderWidth: 2,
    borderColor: "#00B4D8",
  },
  currencyFlagLarge: {
    fontSize: 28,
    marginBottom: 6,
  },
  currencyName: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  // Popular Conversions
  popularConversions: {
    gap: 8,
  },
  popularConversionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  popularConversionFrom: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    width: 60,
  },
  popularConversionTo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    flex: 1,
    textAlign: "right",
  },
  // Summary Grid
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  summaryCardBlue: { backgroundColor: "#00B4D8" },
  summaryCardPurple: { backgroundColor: "#8B5CF6" },
  summaryCardGreen: { backgroundColor: "#10B981" },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  summaryCardLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  // Add Participant
  addParticipantSection: {
    marginBottom: 16,
  },
  quickAddRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  quickAddInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  quickAddButton: {
    backgroundColor: "#00B4D8",
    width: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  participantsChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  participantChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  participantChipText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  removeParticipantChip: {
    padding: 2,
  },
  noParticipantsText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  // Balances
  balancesSection: {
    marginBottom: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  balanceCardPositive: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  balanceCardNegative: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  balanceName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  balanceDetails: {
    gap: 6,
  },
  balanceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceDetailLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  balanceTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  balanceDetailValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  balancePositive: {
    color: "#10B981",
    fontSize: 15,
  },
  balanceNegative: {
    color: "#EF4444",
    fontSize: 15,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "rgba(226, 232, 240, 0.8)",
    marginVertical: 6,
  },
  // Debts
  debtsSection: {
    marginBottom: 16,
  },
  debtCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  debtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  debtPerson: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  debtPersonName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  debtArrow: {
    fontSize: 18,
    color: "#94A3B8",
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
    textAlign: "right",
  },
  // Tour Stops
  tourStopsSection: {
    marginBottom: 8,
  },
  tourStopCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  tourStopHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  tourStopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00B4D8",
    justifyContent: "center",
    alignItems: "center",
  },
  tourStopNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tourStopInfo: {
    flex: 1,
  },
  tourStopName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  tourStopLocation: {
    fontSize: 12,
    color: "#64748B",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tourStopActions: {
    flexDirection: "row",
    gap: 6,
  },
  paymentButton: {
    backgroundColor: "#10B981",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteTourStopButton: {
    backgroundColor: "#EF4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  tourStopDetails: {
    gap: 6,
  },
  tourStopDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tourStopDetailLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  tourStopDetailValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  paidOff: { color: "#10B981" },
  partiallyPaid: { color: "#F59E0B" },
  remaining: { color: "#EF4444" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
  // Bargaining Guide
  bargainInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bargainInfoText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
    lineHeight: 18,
  },
  categoryFilter: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryChipActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  bargainItemCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    overflow: "hidden",
  },
  bargainItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  bargainItemTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bargainItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  bargainItemDetails: {
    padding: 14,
    paddingTop: 0,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  priceRowFair: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  priceTourist: { color: "#EF4444" },
  priceLocal: { color: "#3B82F6" },
  priceFair: { color: "#10B981" },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  tipText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
    lineHeight: 16,
  },
  bargainTipsCard: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  bargainTipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  tipList: {
    gap: 6,
  },
  tipListItem: {
    fontSize: 13,
    color: "#475569",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  currencyList: {
    padding: 12,
  },
  currencyListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
  },
  currencyListItemActive: {
    backgroundColor: "rgba(0, 180, 216, 0.15)",
    borderWidth: 1,
    borderColor: "#00B4D8",
  },
  currencyListItemFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  currencyListItemInfo: {
    flex: 1,
  },
  currencyListItemCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  currencyListItemName: {
    fontSize: 13,
    color: "#64748B",
  },
  currencyListItemSymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
});
