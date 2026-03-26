import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, Dimensions } from 'react-native';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react-native';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if should show iOS prompt
    if (iOS && !standalone) {
      const hasShownIOSPrompt = localStorage.getItem('balibuddy_ios_prompt_shown');
      const promptCount = parseInt(localStorage.getItem('balibuddy_ios_prompt_count') || '0');
      
      if (!hasShownIOSPrompt && promptCount < 3) {
        // Show iOS prompt after a delay
        const timer = setTimeout(() => {
          setShowIOSModal(true);
          localStorage.setItem('balibuddy_ios_prompt_count', String(promptCount + 1));
        }, 5000);
        
        return () => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallButton(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  const handleIOSModalClose = () => {
    setShowIOSModal(false);
    localStorage.setItem('balibuddy_ios_prompt_shown', 'true');
  };

  // Don't show anything if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Android/Chrome/Edge Install Button */}
      {showInstallButton && Platform.OS === 'web' && !isIOS && (
        <View style={styles.installButtonContainer}>
          <TouchableOpacity
            style={styles.installButton}
            onPress={handleInstallClick}
            activeOpacity={0.8}
          >
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.installButtonText}>App installieren</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => setShowInstallButton(false)}
          >
            <X size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      {/* iOS Safari A2HS Modal */}
      <Modal
        visible={showIOSModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleIOSModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Smartphone size={32} color="#00B4D8" />
              </View>
              <Text style={styles.modalTitle}>BaliBuddy installieren</Text>
              <Text style={styles.modalSubtitle}>
                Installiere BaliBuddy für die beste Offline-Erfahrung!
              </Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>So geht's:</Text>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>
                    Tippe auf das <Text style={styles.boldText}>Teilen-Symbol</Text> unten in der Mitte
                  </Text>
                  <View style={styles.shareIconContainer}>
                    <Share size={24} color="#00B4D8" />
                  </View>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>
                    Scrolle nach unten und tippe auf <Text style={styles.boldText}>"Zum Home-Bildschirm"</Text>
                  </Text>
                  <View style={styles.plusIconContainer}>
                    <Plus size={24} color="#00B4D8" />
                  </View>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>
                    Tippe oben rechts auf <Text style={styles.boldText}>"Hinzufügen"</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Vorteile:</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Funktioniert komplett offline</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Schneller App-Start</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Push-Benachrichtigungen</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Kein App Store nötig</Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleIOSModalClose}
            >
              <Text style={styles.closeButtonText}>Später erinnern</Text>
            </TouchableOpacity>

            {/* Don't show again */}
            <TouchableOpacity
              style={styles.dontShowButton}
              onPress={() => {
                localStorage.setItem('balibuddy_ios_prompt_shown', 'true');
                handleIOSModalClose();
              }}
            >
              <Text style={styles.dontShowButtonText}>Nicht mehr anzeigen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Install Button Styles
  installButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 12,
    paddingLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(20px)',
    zIndex: 1000,
  },
  installButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#00B4D8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  installButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dismissButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.85,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Instructions Styles
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  shareIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  plusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // Benefits Styles
  benefitsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#90BE6D',
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 14,
    color: '#334155',
  },

  // Button Styles
  closeButton: {
    backgroundColor: '#00B4D8',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dontShowButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dontShowButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});