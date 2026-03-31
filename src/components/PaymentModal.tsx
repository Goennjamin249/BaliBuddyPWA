import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Participant, Payment, TourStop } from '../stores/tourPlannerStore';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  tourStop: TourStop;
  participants: Participant[];
  onAddPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  onRemovePayment: (paymentId: string) => void;
}

export default function PaymentModal({
  visible,
  onClose,
  tourStop,
  participants,
  onAddPayment,
  onRemovePayment,
}: PaymentModalProps) {
  const { t } = useTranslation();
  
  // Form state
  const [selectedPayer, setSelectedPayer] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedPayer(participants[0]?.id || '');
      setAmount('');
      setDescription('');
    }
  }, [visible, participants]);

  const handleSubmit = () => {
    if (!selectedPayer || !amount) return;

    onAddPayment({
      payerId: selectedPayer,
      amount: parseFloat(amount) || 0,
      description: description.trim() || t('wallet.payment', 'Zahlung'),
    });

    // Reset
    setAmount('');
    setDescription('');
  };

  const totalPaid = tourStop.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = tourStop.totalCost - totalPaid;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('wallet.payments', 'Zahlungen')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Tour Stop Info */}
            <View style={styles.stopInfo}>
              <Text style={styles.stopName}>{tourStop.name}</Text>
              <Text style={styles.stopCost}>
                {t('wallet.total', 'Gesamt')}: Rp {tourStop.totalCost.toLocaleString('de-DE')}
              </Text>
            </View>

            {/* Payment Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('wallet.paid', 'Bezahlt')}
                </Text>
                <Text style={[styles.summaryValue, styles.paidValue]}>
                  Rp {totalPaid.toLocaleString('de-DE')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('wallet.remaining', 'Offen')}
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    remaining > 0 ? styles.remainingValue : styles.paidOffValue,
                  ]}
                >
                  Rp {remaining.toLocaleString('de-DE')}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (totalPaid / tourStop.totalCost) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Add Payment Form */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.whoPaid', 'Wer hat bezahlt?')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.payerList}>
                  {participants.map((participant) => (
                    <TouchableOpacity
                      key={participant.id}
                      style={[
                        styles.payerChip,
                        selectedPayer === participant.id && styles.payerChipSelected,
                      ]}
                      onPress={() => setSelectedPayer(participant.id)}
                    >
                      <Text
                        style={[
                          styles.payerName,
                          selectedPayer === participant.id
                            ? styles.payerNameSelected
                            : styles.payerNameUnselected,
                        ]}
                      >
                        {participant.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.amount', 'Betrag (Rp)')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.description', 'Beschreibung')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.descriptionPlaceholder', 'z.B. Eintritt, Essen...')}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                (!selectedPayer || !amount) && styles.addButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedPayer || !amount}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>
                {t('wallet.addPayment', 'Zahlung hinzufügen')}
              </Text>
            </TouchableOpacity>

            {/* Payment History */}
            {tourStop.payments.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>
                  {t('wallet.paymentHistory', 'Zahlungshistorie')}
                </Text>
                {tourStop.payments.map((payment) => {
                  const payer = participants.find((p) => p.id === payment.payerId);
                  return (
                    <View key={payment.id} style={styles.paymentItem}>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentPayer}>
                          {payer?.name || t('wallet.unknown', 'Unbekannt')}
                        </Text>
                        <Text style={styles.paymentDescription}>{payment.description}</Text>
                        <Text style={styles.paymentDate}>
                          {new Date(payment.date).toLocaleDateString('de-DE')}
                        </Text>
                      </View>
                      <View style={styles.paymentRight}>
                        <Text style={styles.paymentAmount}>
                          Rp {payment.amount.toLocaleString('de-DE')}
                        </Text>
                        <TouchableOpacity
                          style={styles.deletePaymentButton}
                          onPress={() => onRemovePayment(payment.id)}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      web: {
        borderRadius: 24,
        width: '90%',
        maxWidth: 500,
        maxHeight: undefined,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    padding: 20,
  },
  stopInfo: {
    backgroundColor: 'rgba(0, 180, 216, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  stopCost: {
    fontSize: 14,
    color: '#00B4D8',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  paidValue: {
    color: '#10B981',
  },
  remainingValue: {
    color: '#F59E0B',
  },
  paidOffValue: {
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  payerList: {
    flexDirection: 'row',
    gap: 8,
  },
  payerChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  payerChipSelected: {
    backgroundColor: '#00B4D8',
    borderColor: '#00B4D8',
  },
  payerChipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  payerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  payerNameSelected: {
    color: '#FFFFFF',
  },
  payerNameUnselected: {
    color: '#64748B',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentPayer: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  deletePaymentButton: {
    padding: 4,
  },
});
