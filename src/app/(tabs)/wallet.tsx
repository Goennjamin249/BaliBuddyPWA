import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowDownLeft,
  Plus,
  Trash2,
  Users,
  X,
  Receipt,
  ChevronRight,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Q } from "@nozbe/watermelondb";

import db from "../../db/index";
import { Group, Expense, SquadMember } from "../../db/models";

// === V2 Design Tokens ===
const VIOLET_600 = "#7C3AED";
const PURPLE_700 = "#6D28D9";
const BG = "#F2F2F7";
const WHITE = "#FFFFFF";
const GRAY_100 = "#F3F4F6";
const GRAY_200 = "#E5E7EB";
const GRAY_500 = "#6B7280";
const GRAY_600 = "#4B5563";
const GRAY_800 = "#1F2937";
const RED_500 = "#EF4444";
const GREEN_500 = "#10B981";

// === Kategorien ===
const EXPENSE_CATEGORIES = [
  { id: "food", label: "Essen", icon: "🍜" },
  { id: "transport", label: "Transport", icon: "🛵" },
  { id: "accommodation", label: "Unterkunft", icon: "🏨" },
  { id: "activities", label: "Aktivitäten", icon: "🏄" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "other", label: "Sonstiges", icon: "📦" },
];

interface GroupWithMembers {
  id: string;
  name: string;
  emoji: string;
  members: { id: string; name: string }[];
}

interface ExpenseRecord {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  category: string;
  date: number;
}

export default function WalletScreen() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("👥");
  const [newMemberNames, setNewMemberNames] = useState<string[]>([""]);

  // Expense Form
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [paidBy, setPaidBy] = useState("");

  // === Daten laden ===
  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const groupsCollection = db.collections.get("groups");
      const allGroups = await groupsCollection.query().fetch();

      const groupsWithMembers: GroupWithMembers[] = [];
      for (const group of allGroups) {
        const membersData = (group as any).members || (group as any)._raw?.members || "[]";
        let members: { id: string; name: string }[] = [];
        try {
          members = JSON.parse(membersData);
        } catch {
          members = [];
        }
        groupsWithMembers.push({
          id: group.id,
          name: (group as any).name || (group as any)._raw?.name || "Gruppe",
          emoji: (group as any).emoji || (group as any)._raw?.emoji || "👥",
          members,
        });
      }
      setGroups(groupsWithMembers);
    } catch (e) {
      console.error("Load groups error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExpenses = useCallback(async (groupId: string) => {
    try {
      const expensesCollection = db.collections.get("expenses");
      const allExpenses = await expensesCollection
        .query(Q.where("squad_id", groupId))
        .fetch();

      const expenseRecords: ExpenseRecord[] = allExpenses.map((exp: any) => ({
        id: exp.id,
        description: exp.description || exp._raw?.description || "",
        amount: exp.amountIdr || exp._raw?.amount_idr || 0,
        paidBy: exp.paidBy || exp._raw?.paid_by || "",
        category: exp.category || exp._raw?.category || "other",
        date: exp.date || exp._raw?.date || Date.now(),
      }));
      setExpenses(expenseRecords);
    } catch (e) {
      console.error("Load expenses error:", e);
      setExpenses([]);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroup) {
      loadExpenses(selectedGroup.id);
    }
  }, [selectedGroup, loadExpenses]);

  // === Salden-Berechnung ===
  const balances = useMemo(() => {
    if (!selectedGroup || selectedGroup.members.length === 0) return null;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const perPerson = totalExpenses / selectedGroup.members.length;

    const memberBalances = selectedGroup.members.map((member) => {
      const paid = expenses
        .filter((e) => e.paidBy === member.id || e.paidBy === member.name)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        ...member,
        paid,
        balance: paid - perPerson,
      };
    });

    return { totalExpenses, perPerson, members: memberBalances };
  }, [expenses, selectedGroup]);

  // === Gruppe erstellen ===
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const validMembers = newMemberNames
      .filter((n) => n.trim().length > 0)
      .map((name, idx) => ({
        id: `member_${Date.now()}_${idx}`,
        name: name.trim(),
      }));

    if (validMembers.length === 0) {
      Alert.alert("Fehler", "Mindestens ein Mitglied hinzufügen.");
      return;
    }

    try {
      await db.write(async () => {
        const collection = db.collections.get("groups");
        await collection.create((record: any) => {
          record.name = newGroupName.trim();
          record.emoji = newGroupEmoji;
          record.members = JSON.stringify(validMembers);
        });
      });
      setNewGroupName("");
      setNewGroupEmoji("👥");
      setNewMemberNames([""]);
      setShowAddGroup(false);
      await loadGroups();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("Create group error:", e);
      Alert.alert("Fehler", "Gruppe konnte nicht erstellt werden.");
    }
  };

  // === Gruppe löschen ===
  const handleDeleteGroup = async (groupId: string) => {
    Alert.alert("Gruppe löschen", "Möchtest du diese Gruppe wirklich löschen?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Löschen",
        style: "destructive",
        onPress: async () => {
          try {
            const group = await db.collections.get("groups").find(groupId);
            await db.write(async () => {
              await group.destroyPermanently();
            });
            setSelectedGroup(null);
            await loadGroups();
          } catch (e) {
            console.error("Delete group error:", e);
          }
        },
      },
    ]);
  };

  // === Ausgabe hinzufügen ===
  const handleAddExpense = async () => {
    if (!desc.trim() || !amount || !paidBy || !selectedGroup) return;

    try {
      await db.write(async () => {
        const collection = db.collections.get("expenses");
        await collection.create((record: any) => {
          record.description = desc.trim();
          record.amountIdr = parseFloat(amount);
          record.paidBy = paidBy;
          record.squadId = selectedGroup.id;
          record.category = category;
          record.date = Date.now();
        });
      });
      setDesc("");
      setAmount("");
      setCategory("food");
      setShowAddExpense(false);
      await loadExpenses(selectedGroup.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("Add expense error:", e);
      Alert.alert("Fehler", "Ausgabe konnte nicht hinzugefügt werden.");
    }
  };

  // === Ausgabe löschen ===
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const expense = await db.collections.get("expenses").find(expenseId);
      await db.write(async () => {
        await expense.destroyPermanently();
      });
      if (selectedGroup) {
        await loadExpenses(selectedGroup.id);
      }
    } catch (e) {
      console.error("Delete expense error:", e);
    }
  };

  const formatIDR = (n: number) => `Rp${Math.round(n).toLocaleString("de-DE")}`;

  // === Group Detail View ===
  if (selectedGroup && balances) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={[VIOLET_600, PURPLE_700]} style={styles.header}>
          <SafeAreaView>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => setSelectedGroup(null)}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {selectedGroup.emoji} {selectedGroup.name}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteGroup(selectedGroup.id)}>
                <Trash2 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Gesamtausgaben</Text>
            <Text style={styles.summaryValue}>{formatIDR(balances.totalExpenses)}</Text>
            <Text style={styles.summarySub}>
              {formatIDR(balances.perPerson)} pro Person
            </Text>
          </View>

          {/* Abrechnung */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Users size={18} color={GRAY_600} />
              <Text style={styles.cardTitle}>Abrechnung</Text>
            </View>
            {balances.members.map((m) => (
              <View key={m.id} style={styles.memberRow}>
                <View style={styles.memberLeft}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {m.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>{m.name}</Text>
                </View>
                <View style={styles.memberRight}>
                  <Text style={styles.memberPaid}>Bezahlt: {formatIDR(m.paid)}</Text>
                  <Text
                    style={[
                      styles.memberBalance,
                      { color: m.balance >= 0 ? GREEN_500 : RED_500 },
                    ]}
                  >
                    {m.balance >= 0 ? "Bekommt" : "Schuldet"}: {formatIDR(Math.abs(m.balance))}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Ausgaben */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ausgaben</Text>
            {expenses.length === 0 ? (
              <Text style={styles.empty}>Noch keine Ausgaben</Text>
            ) : (
              expenses.map((e) => {
                const cat = EXPENSE_CATEGORIES.find((c) => c.id === e.category) || EXPENSE_CATEGORIES[5];
                const payer = selectedGroup.members.find(
                  (m) => m.id === e.paidBy || m.name === e.paidBy
                );
                return (
                  <View key={e.id} style={styles.expenseRow}>
                    <View style={styles.expenseLeft}>
                      <Text style={styles.expenseIcon}>{cat.icon}</Text>
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseDesc}>{e.description}</Text>
                        <Text style={styles.expenseMeta}>
                          {payer?.name || "Unbekannt"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.expenseRight}>
                      <Text style={styles.expenseAmount}>{formatIDR(e.amount)}</Text>
                      <TouchableOpacity onPress={() => handleDeleteExpense(e.id)}>
                        <Trash2 size={16} color={RED_500} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (selectedGroup.members.length > 0) {
              setPaidBy(selectedGroup.members[0].id);
            }
            setShowAddExpense(true);
          }}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Add Expense Modal */}
        <Modal visible={showAddExpense} animationType="slide" transparent onRequestClose={() => setShowAddExpense(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Neue Ausgabe</Text>
                <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                  <X size={24} color={GRAY_600} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Beschreibung"
                value={desc}
                onChangeText={setDesc}
              />
              <TextInput
                style={styles.input}
                placeholder="Betrag in IDR"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Text style={styles.modalLabel}>Kategorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catChip, category === c.id && styles.catChipActive]}
                    onPress={() => setCategory(c.id)}
                  >
                    <Text>{c.icon}</Text>
                    <Text style={[styles.catText, category === c.id && styles.catTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.modalLabel}>Bezahlt von</Text>
              <View style={styles.payerRow}>
                {selectedGroup.members.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.payerChip, paidBy === m.id && styles.payerChipActive]}
                    onPress={() => setPaidBy(m.id)}
                  >
                    <Text style={styles.payerText}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddExpense}>
                <ArrowDownLeft size={20} color="#FFF" />
                <Text style={styles.submitText}>Hinzufügen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // === Gruppen-Übersicht ===
  return (
    <View style={styles.root}>
      <LinearGradient colors={[VIOLET_600, PURPLE_700]} style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>{t("wallet.title") || "Gruppenkasse"}</Text>
          <Text style={styles.headerSub}>Wer schuldet wem was?</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={VIOLET_600} />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={48} color={GRAY_500} />
            <Text style={styles.emptyText}>Noch keine Gruppen</Text>
            <Text style={styles.emptySubText}>Erstelle eine Gruppe, um Ausgaben zu teilen</Text>
          </View>
        ) : (
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => setSelectedGroup(group)}
              activeOpacity={0.7}
            >
              <View style={styles.groupCardLeft}>
                <Text style={styles.groupEmoji}>{group.emoji}</Text>
                <View>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>
                    {group.members.length} Mitglieder
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={GRAY_500} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddGroup(true)}
        activeOpacity={0.85}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add Group Modal */}
      <Modal visible={showAddGroup} animationType="slide" transparent onRequestClose={() => setShowAddGroup(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Neue Gruppe</Text>
              <TouchableOpacity onPress={() => setShowAddGroup(false)}>
                <X size={24} color={GRAY_600} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Gruppen-Emoji</Text>
            <View style={styles.emojiRow}>
              {["👥", "🏖️", "🛵", "🎉", "💰", "🏠"].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiChip, newGroupEmoji === emoji && styles.emojiChipActive]}
                  onPress={() => setNewGroupEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Gruppenname"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />

            <Text style={styles.modalLabel}>Mitglieder</Text>
            {newMemberNames.map((name, idx) => (
              <View key={idx} style={styles.memberInputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={`Mitglied ${idx + 1}`}
                  value={name}
                  onChangeText={(text) => {
                    const updated = [...newMemberNames];
                    updated[idx] = text;
                    setNewMemberNames(updated);
                  }}
                />
                {newMemberNames.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      setNewMemberNames(newMemberNames.filter((_, i) => i !== idx));
                    }}
                  >
                    <X size={20} color={RED_500} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addMemberBtn}
              onPress={() => setNewMemberNames([...newMemberNames, ""])}
            >
              <Plus size={16} color={VIOLET_600} />
              <Text style={styles.addMemberText}>Mitglied hinzufügen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateGroup}>
              <Text style={styles.submitText}>Gruppe erstellen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: "700", color: GRAY_600, marginTop: 16 },
  emptySubText: { fontSize: 14, color: GRAY_500, marginTop: 4 },
  summaryCard: {
    backgroundColor: VIOLET_600,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  summaryValue: { fontSize: 28, fontWeight: "800", color: "#FFF", marginTop: 4 },
  summarySub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: GRAY_800 },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  memberLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VIOLET_600,
    justifyContent: "center",
    alignItems: "center",
  },
  memberAvatarText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  memberName: { fontSize: 15, fontWeight: "600", color: GRAY_800 },
  memberRight: { alignItems: "flex-end" },
  memberPaid: { fontSize: 12, color: GRAY_500 },
  memberBalance: { fontSize: 14, fontWeight: "700" },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  expenseLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  expenseIcon: { fontSize: 22 },
  expenseInfo: { gap: 2 },
  expenseDesc: { fontSize: 14, fontWeight: "600", color: GRAY_800 },
  expenseMeta: { fontSize: 11, color: GRAY_500 },
  expenseRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  expenseAmount: { fontSize: 14, fontWeight: "700", color: GRAY_800 },
  empty: { textAlign: "center", color: GRAY_500, padding: 20 },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: VIOLET_600,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
    elevation: 4,
  },
  groupCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    elevation: 2,
  },
  groupCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  groupEmoji: { fontSize: 28 },
  groupName: { fontSize: 16, fontWeight: "700", color: GRAY_800 },
  groupMembers: { fontSize: 13, color: GRAY_500 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "800", color: GRAY_800 },
  input: {
    backgroundColor: GRAY_100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  modalLabel: { fontSize: 14, fontWeight: "600", color: GRAY_600 },
  catScroll: { gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GRAY_100,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catChipActive: { backgroundColor: VIOLET_600 },
  catText: { fontSize: 12, fontWeight: "600", color: GRAY_600 },
  catTextActive: { color: "#FFF" },
  payerRow: { flexDirection: "row", gap: 8 },
  payerChip: {
    backgroundColor: GRAY_100,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  payerChipActive: { backgroundColor: VIOLET_600 },
  payerText: { fontSize: 13, fontWeight: "600", color: GRAY_600 },
  payerTextActive: { color: "#FFF" },
  submitBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: VIOLET_600,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  emojiRow: { flexDirection: "row", gap: 8 },
  emojiChip: {
    backgroundColor: GRAY_100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emojiChipActive: { backgroundColor: VIOLET_600 },
  emojiText: { fontSize: 20 },
  memberInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  addMemberText: { fontSize: 14, fontWeight: "600", color: VIOLET_600 },
});