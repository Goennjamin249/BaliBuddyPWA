import { useState, useEffect, useRef, useCallback } from 'react';

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

export function useOCRWorker(): UseOCRWorkerReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((result: OCRResult) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        workerRef.current = new Worker('/src/workers/ocr-worker.js');
        
        workerRef.current.onmessage = (e) => {
          const { type, text, confidence, progress: progressValue, status, error: workerError, timestamp } = e.data;
          
          switch (type) {
            case 'ready':
              setIsReady(true);
              setError(null);
              break;
              
            case 'progress':
              setProgress({ progress: progressValue, status });
              break;
              
            case 'result':
              setIsProcessing(false);
              setProgress(null);
              setError(null);
              
              if (resolveRef.current) {
                resolveRef.current({ text, confidence, timestamp });
                resolveRef.current = null;
                rejectRef.current = null;
              }
              break;
              
            case 'error':
              setIsProcessing(false);
              setProgress(null);
              setError(workerError);
              
              if (rejectRef.current) {
                rejectRef.current(new Error(workerError));
                resolveRef.current = null;
                rejectRef.current = null;
              }
              break;
          }
        };
        
        workerRef.current.onerror = (error) => {
          setIsProcessing(false);
          setProgress(null);
          setError(`Worker error: ${error.message}`);
          
          if (rejectRef.current) {
            rejectRef.current(new Error(`Worker error: ${error.message}`));
            resolveRef.current = null;
            rejectRef.current = null;
          }
        };
        
      } catch (err) {
        setError(`Failed to create worker: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      setError('Web Workers are not supported in this browser');
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
      
      setIsProcessing(true);
      setError(null);
      setProgress({ progress: 0, status: 'Starting...' });
      
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
          setIsProcessing(false);
          setError('Failed to read image file');
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