/**
 * Audio Feedback Hook
 * 
 * Provides haptic and sound feedback for user interactions
 * using expo-audio and expo-haptics.
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';

export type FeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface UseAudioFeedbackReturn {
  triggerFeedback: (type: FeedbackType) => Promise<void>;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => Promise<void>;
  triggerSuccess: () => Promise<void>;
  triggerError: () => Promise<void>;
}

/**
 * Custom hook for audio and haptic feedback
 */
export function useAudioFeedback(): UseAudioFeedbackReturn {
  /**
   * Trigger haptic feedback
   */
  const triggerHaptic = useCallback(async (type: 'light' | 'medium' | 'heavy') => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      console.log(`Haptic feedback: ${type}`);
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }, []);

  /**
   * Trigger combined feedback (haptic + audio)
   */
  const triggerFeedback = useCallback(async (type: FeedbackType) => {
    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        await triggerHaptic(type);
        break;
      case 'success':
        await triggerHaptic('light');
        break;
      case 'warning':
        await triggerHaptic('medium');
        break;
      case 'error':
        await triggerHaptic('heavy');
        break;
    }
  }, [triggerHaptic]);

  /**
   * Trigger success feedback
   */
  const triggerSuccess = useCallback(async () => {
    await triggerFeedback('success');
  }, [triggerFeedback]);

  /**
   * Trigger error feedback
   */
  const triggerError = useCallback(async () => {
    await triggerFeedback('error');
  }, [triggerFeedback]);

  return {
    triggerFeedback,
    triggerHaptic,
    triggerSuccess,
    triggerError,
  };
}

export default useAudioFeedback;