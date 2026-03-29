import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, Clock, MapPin, Phone, ChevronLeft, Play, Square, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

function SafetyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlertSent, setIsAlertSent] = useState(false);
  const [checkIns, setCheckIns] = useState<{ time: string; location: string }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoized timer presets
  const timerPresets = useMemo(() => [
    { label: t('safety.30min'), minutes: 30 },
    { label: t('safety.1hour'), minutes: 60 },
    { label: t('safety.2hours'), minutes: 120 },
    { label: t('safety.4hours'), minutes: 240 },
    { label: t('safety.6hours'), minutes: 360 },
  ], [t]);

  // Memoized format time function
  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoized start timer handler
  const startTimer = useCallback(() => {
    setTimeRemaining(timerMinutes * 60);
    setIsRunning(true);
    setIsAlertSent(false);
  }, [timerMinutes]);

  // Memoized stop timer handler
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Memoized check in handler
  const checkIn = useCallback(() => {
    const now = new Date();
    setCheckIns(prevCheckIns => [{
      time: now.toLocaleTimeString('de-DE'),
      location: 'GPS: -8.3405, 115.0920 (Bali)',
    }, ...prevCheckIns]);
    setTimeRemaining(timerMinutes * 60);
  }, [timerMinutes]);

  // Memoized reset alert handler
  const resetAlert = useCallback(() => {
    setIsAlertSent(false);
    setTimeRemaining(0);
    setCheckIns([]);
  }, []);

  // Memoized preset press handler
  const handlePresetPress = useCallback((minutes: number) => {
    setTimerMinutes(minutes);
  }, []);

  // Memoized back handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsAlertSent(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>🛡️ {t('safety.title')}</Text>
            <Text style={styles.subtitle}>{t('safety.subtitle')}</Text>
          </View>
        </View>

        {/* Alert Banner */}
        {isAlertSent && (
          <View style={styles.alertBanner}>
            <AlertTriangle size={32} color="#DC2626" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>⚠️ {t('safety.alertTitle')}</Text>
              <Text style={styles.alertText}>
                {t('safety.alertText')}
              </Text>
              <Text style={styles.alertLocation}>
                📍 GPS: -8.3405, 115.0920 (Bali)
              </Text>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={resetAlert}>
              <Text style={styles.resetButtonText}>{t('safety.reset')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timer Display */}
        {!isAlertSent && (
          <View style={[styles.timerCard, isRunning && styles.timerCardActive]}>
            <Clock size={48} color={isRunning ? '#F59E0B' : '#00B4D8'} />
            <Text style={styles.timerDisplay}>
              {isRunning ? formatTime(timeRemaining) : formatTime(timerMinutes * 60)}
            </Text>
            <Text style={styles.timerLabel}>
              {isRunning ? t('safety.remainingTime') : t('safety.setTimer')}
            </Text>
            
            {!isRunning && (
              <View style={styles.presetRow}>
                {timerPresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.minutes}
                    style={[
                      styles.presetButton,
                      timerMinutes === preset.minutes && styles.presetButtonActive,
                    ]}
                    onPress={() => handlePresetPress(preset.minutes)}
                  >
                    <Text style={[
                      styles.presetButtonText,
                      timerMinutes === preset.minutes && styles.presetButtonTextActive,
                    ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!isRunning ? (
              <TouchableOpacity style={styles.startButton} onPress={startTimer}>
                <Play size={24} color="#FFFFFF" />
                <Text style={styles.startButtonText}>{t('safety.startTimer')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.runningButtons}>
                <TouchableOpacity style={styles.checkInButton} onPress={checkIn}>
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.checkInButtonText}>{t('safety.imSafe')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                  <Square size={20} color="#FFFFFF" />
                  <Text style={styles.stopButtonText}>{t('safety.stop')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Emergency Contact */}
        <View style={styles.contactCard}>
          <Phone size={24} color="#DC2626" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>{t('safety.emergencyContact')}</Text>
            <Text style={styles.contactText}>
              {t('safety.emergencyText')}
            </Text>
            <Text style={styles.contactNumber}>+49 170 1234567</Text>
          </View>
        </View>

        {/* Check-in History */}
        {checkIns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ {t('safety.checkinHistory')}</Text>
            {checkIns.map((checkIn, index) => (
              <View key={index} style={styles.checkInCard}>
                <CheckCircle size={20} color="#10B981" />
                <View style={styles.checkInInfo}>
                  <Text style={styles.checkInTime}>{checkIn.time}</Text>
                  <Text style={styles.checkInLocation}>{checkIn.location}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 {t('safety.tipsTitle')}</Text>
          <Text style={styles.tipText}>• {t('safety.tip1')}</Text>
          <Text style={styles.tipText}>• {t('safety.tip2')}</Text>
          <Text style={styles.tipText}>• {t('safety.tip3')}</Text>
          <Text style={styles.tipText}>• {t('safety.tip4')}</Text>
          <Text style={styles.tipText}>• {t('safety.tip5')}</Text>
        </View>

        {/* How it works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>⚙️ {t('safety.howItWorks')}</Text>
          <View style={styles.stepRow}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>{t('safety.step1')}</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>{t('safety.step2')}</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>{t('safety.step3')}</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNumber}>4.</Text>
            <Text style={styles.stepText}>{t('safety.step4')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertBanner: {
    backgroundColor: '#FEE2E2',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#DC2626',
    alignItems: 'center',
  },
  alertContent: {
    alignItems: 'center',
    marginTop: 12,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertLocation: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: 'monospace',
  },
  resetButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timerCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerCardActive: {
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 16,
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  presetButtonActive: {
    backgroundColor: '#00B4D8',
  },
  presetButtonText: {
    fontSize: 13,
    color: '#374151',
  },
  presetButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  runningButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#7F1D1D',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  checkInInfo: {
    flex: 1,
  },
  checkInTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  checkInLocation: {
    fontSize: 11,
    color: '#047857',
  },
  tipsCard: {
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#0C4A6E',
    marginBottom: 4,
    lineHeight: 18,
  },
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  howItWorksTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B4D8',
    marginRight: 8,
  },
  stepText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
});

export default memo(SafetyScreen);