import { create } from 'zustand';

// Participant interface
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

// Payment record - who paid how much
export interface Payment {
  id: string;
  payerId: string;
  amount: number;
  description: string;
  date: string;
}

// Tour stop interface
export interface TourStop {
  id: string;
  name: string;
  location: string;
  date: string;
  totalCost: number;
  participantIds: string[];
  payments: Payment[];
  notes: string;
}

// Balance calculation result
export interface Balance {
  participantId: string;
  participantName: string;
  paid: number;
  owes: number;
  balance: number; // positive = gets money back, negative = owes money
}

// Debt settlement result
export interface DebtSettlement {
  fromParticipantId: string;
  fromParticipantName: string;
  toParticipantId: string;
  toParticipantName: string;
  amount: number;
}

// Tour Planner State
interface TourPlannerState {
  // Participants
  participants: Participant[];
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, name: string) => void;

  // Tour Stops
  tourStops: TourStop[];
  addTourStop: (stop: Omit<TourStop, 'id' | 'payments'>) => void;
  updateTourStop: (id: string, stop: Partial<TourStop>) => void;
  removeTourStop: (id: string) => void;

  // Payments
  addPayment: (tourStopId: string, payment: Omit<Payment, 'id' | 'date'>) => void;
  removePayment: (tourStopId: string, paymentId: string) => void;

  // Calculations
  calculateBalances: () => Balance[];
  calculateDebts: () => DebtSettlement[];
  getTotalCost: () => number;
  getTotalPaid: () => number;

  // UI State
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingStopId: string | null;
  setEditingStopId: (id: string | null) => void;

  // Reset
  resetAll: () => void;
}

// Helper: generate unique ID
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper: calculate balances for all participants
const calculateBalancesHelper = (
  participants: Participant[],
  tourStops: TourStop[]
): Balance[] => {
  const balances = participants.map((p) => ({
    participantId: p.id,
    participantName: p.name,
    paid: 0,
    owes: 0,
    balance: 0,
  }));

  // Calculate total paid by each participant
  tourStops.forEach((stop) => {
    stop.payments.forEach((payment) => {
      const payer = balances.find((b) => b.participantId === payment.payerId);
      if (payer) {
        payer.paid += payment.amount;
      }
    });

    // Calculate what each participant owes for this stop
    const splitAmount = stop.totalCost / stop.participantIds.length;
    stop.participantIds.forEach((participantId) => {
      const participant = balances.find((b) => b.participantId === participantId);
      if (participant) {
        participant.owes += splitAmount;
      }
    });
  });

  // Calculate final balance
  balances.forEach((b) => {
    b.balance = b.paid - b.owes;
  });

  return balances;
};

// Helper: calculate debt settlements
const calculateDebtsHelper = (
  participants: Participant[],
  tourStops: TourStop[]
): DebtSettlement[] => {
  const balances = calculateBalancesHelper(participants, tourStops);
  const debts: DebtSettlement[] = [];

  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const debtors = balances
    .filter((b) => b.balance < 0)
    .sort((a, b) => a.balance - b.balance);

  // Create settlement matrix
  const creditorBalances = new Map(creditors.map((c) => [c.participantId, c.balance]));
  const debtorBalances = new Map(debtors.map((d) => [d.participantId, Math.abs(d.balance)]));

  // Match debtors with creditors
  for (const debtor of debtors) {
    let remainingDebt = debtorBalances.get(debtor.participantId) || 0;

    for (const creditor of creditors) {
      if (remainingDebt <= 0) break;

      const creditorBalance = creditorBalances.get(creditor.participantId) || 0;
      if (creditorBalance <= 0) continue;

      const settlementAmount = Math.min(remainingDebt, creditorBalance);

      debts.push({
        fromParticipantId: debtor.participantId,
        fromParticipantName: debtor.participantName,
        toParticipantId: creditor.participantId,
        toParticipantName: creditor.participantName,
        amount: Math.round(settlementAmount * 100) / 100,
      });

      remainingDebt -= settlementAmount;
      creditorBalances.set(creditor.participantId, creditorBalance - settlementAmount);
    }

    debtorBalances.set(debtor.participantId, remainingDebt);
  }

  return debts;
};

// Create store
export const useTourPlannerStore = create<TourPlannerState>((set, get) => ({
  // Initial state
  participants: [],
  tourStops: [],
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  editingStopId: null,
  setEditingStopId: (id) => set({ editingStopId: id }),

  // Participant actions
  addParticipant: (name) => {
    set((state) => ({
      participants: [
        ...state.participants,
        { id: generateId(), name, avatar: undefined },
      ],
    }));
  },

  removeParticipant: (id) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
      tourStops: state.tourStops.map((stop) => ({
        ...stop,
        participantIds: stop.participantIds.filter((pid) => pid !== id),
        payments: stop.payments.filter((p) => p.payerId !== id),
      })),
    }));
  },

  updateParticipant: (id, name) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, name } : p
      ),
    }));
  },

  // Tour stop actions
  addTourStop: (stop) => {
    set((state) => ({
      tourStops: [
        ...state.tourStops,
        { ...stop, id: generateId(), payments: [] },
      ],
    }));
  },

  updateTourStop: (id, stop) => {
    set((state) => ({
      tourStops: state.tourStops.map((s) =>
        s.id === id ? { ...s, ...stop } : s
      ),
    }));
  },

  removeTourStop: (id) => {
    set((state) => ({
      tourStops: state.tourStops.filter((s) => s.id !== id),
    }));
  },

  // Payment actions
  addPayment: (tourStopId, payment) => {
    set((state) => ({
      tourStops: state.tourStops.map((stop) =>
        stop.id === tourStopId
          ? {
              ...stop,
              payments: [
                ...stop.payments,
                { ...payment, id: generateId(), date: new Date().toISOString() },
              ],
            }
          : stop
      ),
    }));
  },

  removePayment: (tourStopId, paymentId) => {
    set((state) => ({
      tourStops: state.tourStops.map((stop) =>
        stop.id === tourStopId
          ? {
              ...stop,
              payments: stop.payments.filter((p) => p.id !== paymentId),
            }
          : stop
      ),
    }));
  },

  // Calculations
  calculateBalances: () => {
    const { participants, tourStops } = get();
    return calculateBalancesHelper(participants, tourStops);
  },

  calculateDebts: () => {
    const { participants, tourStops } = get();
    return calculateDebtsHelper(participants, tourStops);
  },

  getTotalCost: () => {
    const { tourStops } = get();
    return tourStops.reduce((sum, stop) => sum + stop.totalCost, 0);
  },

  getTotalPaid: () => {
    const { tourStops } = get();
    return tourStops.reduce(
      (sum, stop) => sum + stop.payments.reduce((pSum, p) => pSum + p.amount, 0),
      0
    );
  },

  // Reset
  resetAll: () => {
    set({
      participants: [],
      tourStops: [],
      isModalOpen: false,
      editingStopId: null,
    });
  },
}));

export default useTourPlannerStore;
