import {
  ArrowLeftRight,
  Calculator,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalHeader from "../../components/GlobalHeader";

// Currency interface
interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

// Expense interface
interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitWith: string[];
  date: Date;
}

// Tour stop interface
interface TourStop {
  id: string;
  name: string;
  location: string;
  estimatedCost: number;
  notes: string;
}

export default function WalletScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "currency" | "expenses" | "planner"
  >("currency");
  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<string>("EUR");
  const [toCurrency, setToCurrency] = useState<string>("IDR");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tourStops, setTourStops] = useState<TourStop[]>([]);

  // Available currencies
  const currencies: Currency[] = [
    { code: "EUR", name: "Euro", symbol: "€", rate: 1 },
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1.08 },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", rate: 16800 },
    { code: "GBP", name: "British Pound", symbol: "£", rate: 0.86 },
  ];

  // Convert currency using Frankfurter API
  const convertCurrency = useCallback(async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setConvertedAmount(null);
      return;
    }

    try {
      // Use Frankfurter API for real exchange rates
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`,
      );

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();
      const rate = data.rates[toCurrency] || 1;
      const result = parseFloat(amount) * rate;
      setConvertedAmount(result);
    } catch (error) {
      console.error("Currency conversion error:", error);
      // Fallback to static rates
      const fromRate =
        currencies.find((c) => c.code === fromCurrency)?.rate || 1;
      const toRate = currencies.find((c) => c.code === toCurrency)?.rate || 1;
      const result = (parseFloat(amount) / fromRate) * toRate;
      setConvertedAmount(result);
    }
  }, [amount, fromCurrency, toCurrency, currencies]);

  useEffect(() => {
    convertCurrency();
  }, [convertCurrency]);

  // Add expense
  const addExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      description: t("wallet.newExpense", "Neue Ausgabe"),
      amount: 0,
      currency: "IDR",
      paidBy: "Ich",
      splitWith: [],
      date: new Date(),
    };
    setExpenses([...expenses, newExpense]);
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  // Add tour stop
  const addTourStop = () => {
    const newStop: TourStop = {
      id: Date.now().toString(),
      name: t("wallet.newStop", "Neuer Stopp"),
      location: "",
      estimatedCost: 0,
      notes: "",
    };
    setTourStops([...tourStops, newStop]);
  };

  // Delete tour stop
  const deleteTourStop = (id: string) => {
    setTourStops(tourStops.filter((s) => s.id !== id));
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  // Calculate total tour costs
  const totalTourCosts = tourStops.reduce(
    (sum, stop) => sum + stop.estimatedCost,
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Global Header */}
      <GlobalHeader
        title={t("wallet.title", "Wallet & Planer")}
        showBackButton={false}
        showSettings={true}
      />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "currency" && styles.tabActive]}
          onPress={() => setActiveTab("currency")}
        >
          <DollarSign
            size={20}
            color={activeTab === "currency" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "currency" && styles.tabTextActive,
            ]}
          >
            {t("wallet.currency", "Währung")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "expenses" && styles.tabActive]}
          onPress={() => setActiveTab("expenses")}
        >
          <Calculator
            size={20}
            color={activeTab === "expenses" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "expenses" && styles.tabTextActive,
            ]}
          >
            {t("wallet.expenses", "Ausgaben")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "planner" && styles.tabActive]}
          onPress={() => setActiveTab("planner")}
        >
          <MapPin
            size={20}
            color={activeTab === "planner" ? "#00B4D8" : "#64748B"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "planner" && styles.tabTextActive,
            ]}
          >
            {t("wallet.planner", "Planer")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Currency Converter */}
        {activeTab === "currency" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("wallet.converter", "Währungsrechner")}
            </Text>
            <View style={styles.converterCard}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.amountInput}
                  placeholder={t("wallet.enterAmount", "Betrag eingeben")}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.currencySelector}>
                  <Text style={styles.currencyCode}>{fromCurrency}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.swapButton}>
                <ArrowLeftRight size={24} color="#00B4D8" />
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.convertedAmount}>
                  {convertedAmount !== null
                    ? convertedAmount.toLocaleString("de-DE")
                    : "0"}
                </Text>
                <TouchableOpacity style={styles.currencySelector}>
                  <Text style={styles.currencyCode}>{toCurrency}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Currency Buttons */}
            <View style={styles.quickCurrencies}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.quickCurrencyButton,
                    (fromCurrency === currency.code ||
                      toCurrency === currency.code) &&
                      styles.quickCurrencyButtonActive,
                  ]}
                  onPress={() => {
                    if (
                      fromCurrency !== currency.code &&
                      toCurrency !== currency.code
                    ) {
                      setToCurrency(currency.code);
                    }
                  }}
                >
                  <Text style={styles.quickCurrencySymbol}>
                    {currency.symbol}
                  </Text>
                  <Text style={styles.quickCurrencyCode}>{currency.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Expenses Tracker */}
        {activeTab === "expenses" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t("wallet.expenses", "Ausgaben")}
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={addExpense}>
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Total */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>
                {t("wallet.total", "Gesamt")}
              </Text>
              <Text style={styles.totalAmount}>
                Rp {totalExpenses.toLocaleString("de-DE")}
              </Text>
            </View>

            {/* Expense List */}
            {expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription}>
                    {expense.description}
                  </Text>
                  <Text style={styles.expenseAmount}>
                    {expense.currency} {expense.amount.toLocaleString("de-DE")}
                  </Text>
                  <Text style={styles.expenseMeta}>
                    {t("wallet.paidBy", "Bezahlt von")}: {expense.paidBy}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteExpense(expense.id)}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {expenses.length === 0 && (
              <View style={styles.emptyState}>
                <Calculator size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  {t("wallet.noExpenses", "Keine Ausgaben")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tour Planner */}
        {activeTab === "planner" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t("wallet.tourPlanner", "Tour Planer")}
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={addTourStop}>
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Total Costs */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>
                {t("wallet.estimatedCosts", "Geschätzte Kosten")}
              </Text>
              <Text style={styles.totalAmount}>
                Rp {totalTourCosts.toLocaleString("de-DE")}
              </Text>
            </View>

            {/* Tour Stops */}
            {tourStops.map((stop, index) => (
              <View key={stop.id} style={styles.stopCard}>
                <View style={styles.stopNumber}>
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stopInfo}>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  {stop.location && (
                    <Text style={styles.stopLocation}>
                      <MapPin size={12} color="#64748B" /> {stop.location}
                    </Text>
                  )}
                  <Text style={styles.stopCost}>
                    Rp {stop.estimatedCost.toLocaleString("de-DE")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteTourStop(stop.id)}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {tourStops.length === 0 && (
              <View style={styles.emptyState}>
                <MapPin size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  {t("wallet.noStops", "Keine Stopps geplant")}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: "#E0F2FE",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#00B4D8",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#00B4D8",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  converterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginRight: 12,
  },
  currencySelector: {
    backgroundColor: "#00B4D8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  swapButton: {
    alignItems: "center",
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  convertedAmount: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: "#10B981",
    marginRight: 12,
  },
  quickCurrencies: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  quickCurrencyButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickCurrencyButtonActive: {
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#00B4D8",
  },
  quickCurrencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  quickCurrencyCode: {
    fontSize: 12,
    color: "#64748B",
  },
  totalCard: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  expenseCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 2,
  },
  expenseMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  stopCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00B4D8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stopNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  stopLocation: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  stopCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
});
