import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Download, X, Share, Plus } from 'lucide-react-native';

interface InstallPromptProps {
  onDismiss: () => void;
}

export default function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const dismissedAt = localStorage.getItem('a2hs_dismissed_at');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    if (isIOSDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('a2hs_dismissed_at', new Date().toISOString());
    onDismiss();
  };

  const handleInstall = () => {
    setIsVisible(false);
  };

  if (!isVisible || !isIOS || isStandalone) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Download size={32} color="#00B4D8" />
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleDismiss}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>BaliBuddy installieren</Text>
            <Text style={styles.subtitle}>
              Für das beste Erlebnis und Offline-Zugriff
            </Text>

            <View style={styles.instructions}>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Share size={20} color="#00B4D8" />
                  <Text style={styles.stepText}>
                    Tippe auf die <Text style={styles.bold}>Teilen</Text>-Schaltfläche
                  </Text>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Plus size={20} color="#00B4D8" />
                  <Text style={styles.stepText}>
                    Wähle <Text style={styles.bold}>"Zum Home-Bildschirm"</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Download size={20} color="#00B4D8" />
                  <Text style={styles.stepText}>
                    Bestätige mit <Text style={styles.bold}>"Hinzufügen"</Text>
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>✨ Vorteile:</Text>
              <Text style={styles.benefitItem}>• Offline-Karte & POIs</Text>
              <Text style={styles.benefitItem}>• Schnellerer Zugriff</Text>
              <Text style={styles.benefitItem}>• Push-Benachrichtigungen</Text>
              <Text style={styles.benefitItem}>• Vollbild-Modus</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleInstall}
            >
              <Text style={styles.primaryButtonText}>Verstanden!</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleDismiss}
            >
              <Text style={styles.secondaryButtonText}>Später erinnern</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  instructions: {
    gap: 16,
    marginBottom: 24,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  benefits: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20,
  },
  actions: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryButton: {
    backgroundColor: '#00B4D8',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});