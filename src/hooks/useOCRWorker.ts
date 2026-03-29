import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface OCRResult {
  text: string;
  confidence: number;
  timestamp: number;
}

interface OCRProgress {
  progress: number;
  status: string;
}

interface UseOCRWorkerReturn {
  processImage: (imageData: File | Blob | string) => Promise<OCRResult>;
  isProcessing: boolean;
  progress: OCRProgress | null;
  error: string | null;
  isReady: boolean;
}

// Isolated state types for better performance
interface WorkerState {
  isProcessing: boolean;
  progress: OCRProgress | null;
  error: string | null;
  isReady: boolean;
}

export function useOCRWorker(): UseOCRWorkerReturn {
  // Isolated state updates for better performance
  const [workerState, setWorkerState] = useState<WorkerState>({
    isProcessing: false,
    progress: null,
    error: null,
    isReady: false
  });
  
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((result: OCRResult) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Memoized state selectors for performance
  const isProcessing = useMemo(() => workerState.isProcessing, [workerState.isProcessing]);
  const progress = useMemo(() => workerState.progress, [workerState.progress]);
  const error = useMemo(() => workerState.error, [workerState.error]);
  const isReady = useMemo(() => workerState.isReady, [workerState.isReady]);

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        workerRef.current = new Worker('/src/workers/ocr-worker.js');
        
        workerRef.current.onmessage = (e) => {
          const { type, text, confidence, progress: progressValue, status, error: workerError, timestamp } = e.data;
          
          switch (type) {
            case 'ready':
              setWorkerState(prev => ({ ...prev, isReady: true, error: null }));
              break;
              
            case 'progress':
              setWorkerState(prev => ({ ...prev, progress: { progress: progressValue, status } }));
              break;
              
            case 'result':
              setWorkerState(prev => ({ ...prev, isProcessing: false, progress: null, error: null }));
              
              if (resolveRef.current) {
                resolveRef.current({ text, confidence, timestamp });
                resolveRef.current = null;
                rejectRef.current = null;
              }
              break;
              
            case 'error':
              setWorkerState(prev => ({ ...prev, isProcessing: false, progress: null, error: workerError }));
              
              if (rejectRef.current) {
                rejectRef.current(new Error(workerError));
                resolveRef.current = null;
                rejectRef.current = null;
              }
              break;
          }
        };
        
        workerRef.current.onerror = (error) => {
          setWorkerState(prev => ({ ...prev, isProcessing: false, progress: null, error: `Worker error: ${error.message}` }));
          
          if (rejectRef.current) {
            rejectRef.current(new Error(`Worker error: ${error.message}`));
            resolveRef.current = null;
            rejectRef.current = null;
          }
        };
        
      } catch (err) {
        setWorkerState(prev => ({ ...prev, error: `Failed to create worker: ${err instanceof Error ? err.message : 'Unknown error'}` }));
      }
    } else {
      setWorkerState(prev => ({ ...prev, error: 'Web Workers are not supported in this browser' }));
    }
    
    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'terminate' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Process image using worker
  const processImage = useCallback(async (imageData: File | Blob | string): Promise<OCRResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('OCR worker is not ready'));
        return;
      }
      
      if (isProcessing) {
        reject(new Error('OCR is already processing an image'));
        return;
      }
      
      setWorkerState(prev => ({ ...prev, isProcessing: true, error: null, progress: { progress: 0, status: 'Starting...' } }));
      
      resolveRef.current = resolve;
      rejectRef.current = reject;
      
      // Convert File/Blob to base64 if needed
      if (imageData instanceof File || imageData instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          workerRef.current?.postMessage({
            action: 'process',
            imageData: reader.result
          });
        };
        reader.onerror = () => {
          setWorkerState(prev => ({ ...prev, isProcessing: false, error: 'Failed to read image file' }));
          reject(new Error('Failed to read image file'));
        };
        reader.readAsDataURL(imageData);
      } else {
        // Assume it's already a base64 string or URL
        workerRef.current.postMessage({
          action: 'process',
          imageData: imageData
        });
      }
    });
  }, [isReady, isProcessing]);

  return {
    processImage,
    isProcessing,
    progress,
    error,
    isReady
  };
}