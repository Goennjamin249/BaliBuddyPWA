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
import { X, Plus, Trash2, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Participant, TourStop } from '../stores/tourPlannerStore';

interface TourStopModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (stop: Omit<TourStop, 'id' | 'payments'>) => void;
  editingStop?: TourStop | null;
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: string) => void;
}

export default function TourStopModal({
  visible,
  onClose,
  onSubmit,
  editingStop,
  participants,
  onAddParticipant,
  onRemoveParticipant,
}: TourStopModalProps) {
  const { t } = useTranslation();
  
  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  // New participant input
  const [newParticipantName, setNewParticipantName] = useState('');

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (visible) {
      if (editingStop) {
        setName(editingStop.name);
        setLocation(editingStop.location);
        setDate(editingStop.date);
        setTotalCost(editingStop.totalCost.toString());
        setSelectedParticipants(editingStop.participantIds);
        setNotes(editingStop.notes);
      } else {
        // Default: select all participants
        setName('');
        setLocation('');
        setDate(new Date().toISOString().split('T')[0]);
        setTotalCost('');
        setSelectedParticipants(participants.map(p => p.id));
        setNotes('');
      }
      setNewParticipantName('');
    }
  }, [visible, editingStop, participants]);

  const handleSubmit = () => {
    if (!name.trim() || !totalCost) return;

    onSubmit({
      name: name.trim(),
      location: location.trim(),
      date: date || new Date().toISOString().split('T')[0],
      totalCost: parseFloat(totalCost) || 0,
      participantIds: selectedParticipants,
      notes: notes.trim(),
    });

    // Reset and close
    setName('');
    setLocation('');
    setTotalCost('');
    setSelectedParticipants([]);
    setNotes('');
    onClose();
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      onAddParticipant(newParticipantName.trim());
      setNewParticipantName('');
    }
  };

  const costPerPerson = selectedParticipants.length > 0
    ? (parseFloat(totalCost) || 0) / selectedParticipants.length
    : 0;

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
              {editingStop
                ? t('wallet.editStop', 'Stopp bearbeiten')
                : t('wallet.addStop', 'Neuer Stopp')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Stop Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.destination', 'Ziel')} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.destinationPlaceholder', 'z.B. Tanah Lot Tempel')}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.location', 'Ort')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.locationPlaceholder', 'z.B. Tabanan, Bali')}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.date', 'Datum')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.datePlaceholder', 'YYYY-MM-DD')}
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Total Cost */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.totalCost', 'Gesamtkosten (Rp)')} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={totalCost}
                onChangeText={setTotalCost}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
              {costPerPerson > 0 && (
                <Text style={styles.costPerPerson}>
                  {t('wallet.perPerson', 'Pro Person')}: Rp {costPerPerson.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
              )}
            </View>

            {/* Participants Section */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.participants', 'Teilnehmer')}
              </Text>
              
              {/* Add new participant */}
              <View style={styles.addParticipantRow}>
                <TextInput
                  style={styles.participantInput}
                  placeholder={t('wallet.newParticipant', 'Neuer Teilnehmer...')}
                  value={newParticipantName}
                  onChangeText={setNewParticipantName}
                  placeholderTextColor="#94A3B8"
                  onSubmitEditing={handleAddParticipant}
                />
                <TouchableOpacity
                  style={styles.addParticipantButton}
                  onPress={handleAddParticipant}
                >
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Participants list */}
              <View style={styles.participantsList}>
                {participants.map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={[
                      styles.participantChip,
                      selectedParticipants.includes(participant.id)
                        ? styles.participantChipSelected
                        : styles.participantChipUnselected,
                    ]}
                    onPress={() => toggleParticipant(participant.id)}
                  >
                    <View
                      style={[
                        styles.participantAvatar,
                        selectedParticipants.includes(participant.id)
                          ? styles.participantAvatarSelected
                          : styles.participantAvatarUnselected,
                      ]}
                    >
                      <User
                        size={14}
                        color={
                          selectedParticipants.includes(participant.id)
                            ? '#FFFFFF'
                            : '#64748B'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.participantName,
                        selectedParticipants.includes(participant.id)
                          ? styles.participantNameSelected
                          : styles.participantNameUnselected,
                      ]}
                    >
                      {participant.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeParticipantButton}
                      onPress={() => onRemoveParticipant(participant.id)}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              {participants.length === 0 && (
                <Text style={styles.noParticipants}>
                  {t('wallet.noParticipants', 'Füge Teilnehmer hinzu')}
                </Text>
              )}
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t('wallet.notes', 'Notizen')}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('wallet.notesPlaceholder', 'Optionale Notizen...')}
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>
                {t('common.cancel', 'Abbrechen')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!name.trim() || !totalCost) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!name.trim() || !totalCost}
            >
              <Text style={styles.submitButtonText}>
                {editingStop
                  ? t('common.save', 'Speichern')
                  : t('wallet.add', 'Hinzufügen')}
              </Text>
            </TouchableOpacity>
          </View>
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
  formGroup: {
    marginBottom: 20,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  costPerPerson: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 6,
  },
  addParticipantRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  participantInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addParticipantButton: {
    backgroundColor: '#00B4D8',
    width: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsList: {
    gap: 8,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  participantChipSelected: {
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    borderWidth: 1,
    borderColor: '#00B4D8',
  },
  participantChipUnselected: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  participantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarSelected: {
    backgroundColor: '#00B4D8',
  },
  participantAvatarUnselected: {
    backgroundColor: '#E2E8F0',
  },
  participantName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  participantNameSelected: {
    color: '#00B4D8',
  },
  participantNameUnselected: {
    color: '#64748B',
  },
  removeParticipantButton: {
    padding: 4,
  },
  noParticipants: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  submitButton: {
    backgroundColor: '#00B4D8',
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
