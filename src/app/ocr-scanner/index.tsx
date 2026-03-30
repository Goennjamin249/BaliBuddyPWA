/**
 * OCR Scanner Screen for BaliBuddy
 * Uses tesseract.js for text recognition and translation
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Camera, Image as ImageIcon, Translate, Copy, Check, X } from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';

// Recognized text block interface
interface TextBlock {
  id: string;
  text: string;
  translation?: string;
  confidence: number;
}

export default function OCRScannerScreen() {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<TextBlock[]>([]);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang = i18n.language === 'de' ? 'deu' : 'eng';

  // Handle image selection
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  // Process selected image
  const processImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to data URL for display
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process with tesseract.js
    setIsProcessing(true);
    setRecognizedText([]);
    setTranslatedText('');

    try {
      // Dynamic import tesseract.js for web
      const Tesseract = (await import('tesseract.js')).default;
      
      const { data: { text, words } } = await Tesseract.recognize(
        file,
        lang,
        {
          logger: (m) => console.log('OCR Progress:', m),
        }
      );

      // Parse recognized text into blocks
      const blocks: TextBlock[] = text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map((line, idx) => ({
          id: `line-${idx}`,
          text: line.trim(),
          confidence: 0.9, // Simplified confidence
        }));

      setRecognizedText(blocks);

      // Translate using MyMemory API (free tier)
      if (text.trim().length > 0) {
        const translation = await translateText(text);
        setTranslatedText(translation);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert(i18n.language === 'de' 
        ? 'OCR fehlgeschlagen. Bitte versuchen Sie es erneut.'
        : 'OCR failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Translate text using MyMemory API
  const translateText = async (text: string): Promise<string> => {
    const sourceLang = i18n.language === 'de' ? 'de' : 'en';
    const targetLang = sourceLang === 'de' ? 'en' : 'de';
    
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      const data = await response.json();
      return data.responseData.translatedText || text;
    } catch {
      return text;
    }
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setSelectedImage(null);
    setRecognizedText([]);
    setTranslatedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader 
        title={t('survival.ocrScanner', 'OCR Scanner')} 
        showBackButton={true} 
        showSettings={false} 
      />

      <ScrollView style={styles.content}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={processImage}
          style={{ display: 'none' }}
        />

        {/* Image Capture Section */}
        {!selectedImage ? (
          <View style={styles.captureSection}>
            <Text style={styles.captureTitle}>
              {i18n.language === 'de' ? 'Foto aufnehmen' : 'Take Photo'}
            </Text>
            <Text style={styles.captureSubtitle}>
              {i18n.language === 'de' 
                ? 'Fotografiere Text zum Erkennen und Übersetzen'
                : 'Photograph text to recognize and translate'
              }
            </Text>
            
            <TouchableOpacity style={styles.captureButton} onPress={handleImageSelect}>
              <Camera size={48} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.captureHint}>
              {i18n.language === 'de' ? 'Tippe für Kamera' : 'Tap for camera'}
            </Text>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
              <X size={20} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>
                {i18n.language === 'de' ? 'Neues Foto' : 'New Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingSection}>
            <ActivityIndicator size="large" color="#00B4D8" />
            <Text style={styles.processingText}>
              {i18n.language === 'de' ? 'Erkenne Text...' : 'Recognizing text...'}
            </Text>
          </View>
        )}

        {/* Recognized Text */}
        {recognizedText.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <ImageIcon size={20} color="#10B981" />
              <Text style={styles.resultTitle}>
                {i18n.language === 'de' ? 'Erkannter Text' : 'Recognized Text'}
              </Text>
            </View>
            
            {recognizedText.map((block) => (
              <View key={block.id} style={styles.textBlock}>
                <Text style={styles.blockText}>{block.text}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(block.text, block.id)}
                >
                  {copiedId === block.id ? (
                    <Check size={16} color="#10B981" />
                  ) : (
                    <Copy size={16} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Translation */}
        {translatedText && (
          <View style={styles.translationSection}>
            <View style={styles.resultHeader}>
              <Translate size={20} color="#8B5CF6" />
              <Text style={styles.resultTitle}>
                {i18n.language === 'de' ? 'Übersetzung' : 'Translation'}
              </Text>
            </View>
            <View style={styles.translationBlock}>
              <Text style={styles.translationText}>{translatedText}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(translatedText, 'translation')}
              >
                {copiedId === 'translation' ? (
                  <Check size={16} color="#10B981" />
                ) : (
                  <Copy size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>
            {i18n.language === 'de' ? 'Tipps für bessere Ergebnisse' : 'Tips for better results'}
          </Text>
          <Text style={styles.tip}>• {i18n.language === 'de' ? 'Gute Beleuchtung' : 'Good lighting'}</Text>
          <Text style={styles.tip}>• {i18n.language === 'de' ? 'Text scharf fokussieren' : 'Focus text sharply'}</Text>
          <Text style={styles.tip}>• {i18n.language === 'de' ? 'Gerade halten' : 'Hold camera straight'}</Text>
          <Text style={styles.tip}>• {i18n.language === 'de' ? 'Hohe Auflösung verwenden' : 'Use high resolution'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCE8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  captureSection: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  captureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  captureSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00B4D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureHint: {
    fontSize: 14,
    color: '#94A3B8',
  },
  imageSection: {
    marginBottom: 24,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  processingSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  processingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  resultSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  textBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  blockText: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  copyButton: {
    padding: 4,
  },
  translationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  translationBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 12,
  },
  translationText: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 24,
  },
});
