import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, Plus, DollarSign, ChevronLeft, Trash2, Calculator, ArrowLeft, TrendingDown } from 'lucide-react-native';

interface Member {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  category: string;
}

interface Balance {
  from: string;
  to: string;
  amount: number;
}

// Bali 2026 Real Prices for categories
const BALI_CATEGORIES = {
  'Essen & Trinken': { icon: '🍽️', avgPrice: 75000 },
  'Transport': { icon: '🛵', avgPrice: 100000 },
  'Unterhaltung': { icon: '🎉', avgPrice: 150000 },
  'Shopping': { icon: '🛍️', avgPrice: 200000 },
  'Unterkunft': { icon: '🏨', avgPrice: 500000 },
  'Aktivitäten': { icon: '🏄', avgPrice: 350000 },
  'Sonstiges': { icon: '📦', avgPrice: 50000 },
};

export default function ExpensesScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Essen & Trinken');

  const addMember = () => {
    if (newMemberName.trim()) {
      setMembers([...members, { id: Date.now().toString(), name: newMemberName.trim() }]);
      setNewMemberName('');
    }
  };

  const removeMember = (id: string) => {
    if (members.length <= 2) {
      Alert.alert('Fehler', 'Mindestens 2 Mitglieder müssen bleiben');
      return;
    }
    setMembers(members.filter(m => m.id !== id));
    setExpenses(expenses.filter(e => e.paidBy !== id && !e.splitAmong.includes(id)));
  };

  const addExpense = () => {
    if (newExpenseDesc.trim() && newExpenseAmount && newExpensePaidBy && members.length >= 2) {
      const amount = parseFloat(newExpenseAmount);
      if (!isNaN(amount) && amount > 0) {
        setExpenses([...expenses, {
          id: Date.now().toString(),
          description: newExpenseDesc.trim(),
          amount,
          paidBy: newExpensePaidBy,
          splitAmong: members.map(m => m.id),
          category: newExpenseCategory,
        }]);
        setNewExpenseDesc('');
        setNewExpenseAmount('');
        setNewExpensePaidBy('');
      }
    }
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Dynamic balance calculation with group discounts
  const calculateBalances = useMemo((): Balance[] => {
    const balances: { [key: string]: number } = {};
    
    members.forEach(m => balances[m.id] = 0);
    
    expenses.forEach(expense => {
      const memberCount = expense.splitAmong.length;
      // Apply group discount for larger groups
      const discount = memberCount >= 5 ? 0.15 : memberCount >= 3 ? 0.10 : 0;
      const discountedAmount = expense.amount * (1 - discount);
      const share = discountedAmount / memberCount;
      
      balances[expense.paidBy] += expense.amount;
      expense.splitAmong.forEach(id => {
        balances[id] -= share;
      });
    });

    const result: Balance[] = [];
    const debtors = Object.entries(balances).filter(([_, b]) => b < 0);
    const creditors = Object.entries(balances).filter(([_, b]) => b > 0);

    debtors.forEach(([debtorId, debtorBalance]) => {
      let remaining = Math.abs(debtorBalance);
      creditors.forEach(([creditorId, creditorBalance]) => {
        if (remaining > 0 && creditorBalance > 0) {
          const amount = Math.min(remaining, creditorBalance);
          if (amount > 0) {
            result.push({
              from: debtorId,
              to: creditorId,
              amount: Math.round(amount),
            });
            remaining -= amount;
            balances[creditorId] -= amount;
          }
        }
      });
    });

    return result;
  }, [expenses, members]);

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balances = calculateBalances;

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    expenses.forEach(expense => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
    });
    return breakdown;
  }, [expenses]);

  const formatIDR = (amount: number) => {
    return amount.toLocaleString('id-ID');
  };

  const formatEUR = (amount: number) => {
    // Approximate exchange rate: 1 EUR = 17,000 IDR
    const eurAmount = amount / 17000;
    return eurAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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
          <View style={styles.headerText}>
            <Text style={styles.title}>💰 Squad Ausgaben</Text>
            <Text style={styles.subtitle}>Gruppenausgaben teilen</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Calculator size={24} color="#00B4D8" />
            <Text style={styles.summaryTitle}>💳 Übersicht</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gesamtausgaben:</Text>
              <Text style={styles.summaryValue}>IDR {formatIDR(totalExpenses)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>In Euro:</Text>
              <Text style={styles.summaryValue}>€ {formatEUR(totalExpenses)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mitglieder:</Text>
              <Text style={styles.summaryValue}>{members.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ausgaben:</Text>
              <Text style={styles.summaryValue}>{expenses.length}</Text>
            </View>
            {members.length >= 3 && (
              <View style={styles.discountBadge}>
                <TrendingDown size={16} color="#065F46" />
                <Text style={styles.discountText}>
                  Gruppenrabatt: {members.length >= 5 ? '15%' : '10%'} aktiv
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <View style={styles.categoryCard}>
            <Text style={styles.sectionTitle}>📊 Kategorieaufteilung</Text>
            <View style={styles.categoryList}>
              {Object.entries(categoryBreakdown).map(([category, amount]) => (
                <View key={category} style={styles.categoryItem}>
                  <Text style={styles.categoryIcon}>
                    {BALI_CATEGORIES[category as keyof typeof BALI_CATEGORIES]?.icon || '📦'}
                  </Text>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryAmount}>IDR {formatIDR(amount)}</Text>
                  </View>
                  <Text style={styles.categoryPercent}>
                    {Math.round((amount / totalExpenses) * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Add Member */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Squad Mitglieder</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Name eingeben..."
              placeholderTextColor="#9CA3AF"
              value={newMemberName}
              onChangeText={setNewMemberName}
            />
            <TouchableOpacity style={styles.addButton} onPress={addMember}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <TouchableOpacity onPress={() => removeMember(member.id)}>
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Expense */}
        {members.length >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💸 Ausgabe hinzufügen</Text>
            <TextInput
              style={styles.input}
              placeholder="Beschreibung (z.B. Dinner)"
              placeholderTextColor="#9CA3AF"
              value={newExpenseDesc}
              onChangeText={setNewExpenseDesc}
            />
            <TextInput
              style={styles.input}
              placeholder="Betrag in IDR"
              placeholderTextColor="#9CA3AF"
              value={newExpenseAmount}
              onChangeText={setNewExpenseAmount}
              keyboardType="numeric"
            />
            
            {/* Category Selector */}
            <Text style={styles.label}>Kategorie:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {Object.entries(BALI_CATEGORIES).map(([category, data]) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newExpenseCategory === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setNewExpenseCategory(category)}
                >
                  <Text style={styles.categoryButtonIcon}>{data.icon}</Text>
                  <Text style={[
                    styles.categoryButtonText,
                    newExpenseCategory === category && styles.categoryButtonTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Bezahlt von:</Text>
            <View style={styles.payerRow}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.payerButton,
                    newExpensePaidBy === member.id && styles.payerButtonActive,
                  ]}
                  onPress={() => setNewExpensePaidBy(member.id)}
                >
                  <Text style={[
                    styles.payerButtonText,
                    newExpensePaidBy === member.id && styles.payerButtonTextActive,
                  ]}>
                    {member.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addExpenseButton} onPress={addExpense}>
              <DollarSign size={20} color="#FFFFFF" />
              <Text style={styles.addExpenseButtonText}>Ausgabe hinzufügen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Expenses List */}
        {expenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Ausgabenliste</Text>
            {expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseIcon}>
                  <Text style={styles.expenseIconText}>
                    {BALI_CATEGORIES[expense.category as keyof typeof BALI_CATEGORIES]?.icon || '📦'}
                  </Text>
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDesc}>{expense.description}</Text>
                  <Text style={styles.expenseDetails}>
                    Bezahlt von {getMemberName(expense.paidBy)} • 
                    Geteilt durch {expense.splitAmong.length}
                  </Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>IDR {formatIDR(expense.amount)}</Text>
                  <Text style={styles.expenseAmountEUR}>€ {formatEUR(expense.amount)}</Text>
                  <TouchableOpacity onPress={() => removeExpense(expense.id)}>
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Balances */}
        {balances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚖️ Abrechnung</Text>
            {balances.map((balance: Balance, index: number) => (
              <View key={index} style={styles.balanceCard}>
                <Calculator size={20} color="#F59E0B" />
                <Text style={styles.balanceText}>
                  <Text style={styles.balanceName}>{getMemberName(balance.from)}</Text>
                  {' schuldet '}
                  <Text style={styles.balanceName}>{getMemberName(balance.to)}</Text>
                </Text>
                <Text style={styles.balanceAmount}>IDR {formatIDR(balance.amount)}</Text>
                <Text style={styles.balanceAmountEUR}>€ {formatEUR(balance.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {members.length < 2 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Füge mindestens 2 Squad-Mitglieder hinzu, um Ausgaben zu teilen.
            </Text>
          </View>
        )}
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
  headerText: {
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

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },

  // Category Card
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  categoryAmount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  categoryPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B4D8',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  addRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#00B4D8',
    padding: 14,
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    marginTop: 8,
  },
  categorySelector: {
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#00B4D8',
  },
  categoryButtonIcon: {
    fontSize: 14,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  payerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  payerButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  payerButtonActive: {
    backgroundColor: '#00B4D8',
  },
  payerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  payerButtonTextActive: {
    color: '#FFFFFF',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#90BE6D',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  addExpenseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseIconText: {
    fontSize: 18,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 11,
    color: '#64748B',
  },
  expenseCategory: {
    fontSize: 11,
    color: '#00B4D8',
    fontWeight: '600',
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B4D8',
  },
  expenseAmountEUR: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  balanceText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  balanceName: {
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },
  balanceAmountEUR: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#E0F2FE',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0C4A6E',
    textAlign: 'center',
    fontWeight: '500',
  },
});