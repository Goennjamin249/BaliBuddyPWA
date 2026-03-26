import { useState, useEffect, useRef, useCallback } from 'react';

interface Vessel {
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number;
  timestamp: number;
}

interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  error?: string;
}

interface UseWebSocketWorkerReturn {
  connect: (apiKey: string, boundingBox: number[][]) => void;
  disconnect: () => void;
  vessels: Vessel[];
  connectionStatus: ConnectionStatus;
  isReady: boolean;
  vesselCount: number;
  setBatchInterval: (interval: number) => void;
}

export function useWebSocketWorker(): UseWebSocketWorkerReturn {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected'
  });
  const [isReady, setIsReady] = useState(false);
  const [vesselCount, setVesselCount] = useState(0);
  
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        workerRef.current = new Worker('/src/workers/websocket-worker.js');
        
        workerRef.current.onmessage = (e) => {
          const { type, status, vessels: vesselData, count, error: workerError, timestamp } = e.data;
          
          switch (type) {
            case 'ready':
              setIsReady(true);
              setConnectionStatus({ status: 'disconnected' });
              break;
              
            case 'connection':
              if (status === 'connected') {
                setConnectionStatus({ status: 'connected' });
              } else if (status === 'disconnected') {
                setConnectionStatus({ status: 'disconnected' });
                setVessels([]);
                setVesselCount(0);
              } else if (status === 'failed') {
                setConnectionStatus({ 
                  status: 'failed', 
                  error: workerError || 'Connection failed' 
                });
              }
              break;
              
            case 'vessels':
              setVessels(vesselData);
              setVesselCount(count);
              break;
              
            case 'error':
              setConnectionStatus({ 
                status: 'failed', 
                error: workerError 
              });
              break;
              
            case 'config':
              console.log('Batch interval updated:', e.data.batchInterval);
              break;
              
            case 'status':
              console.log('Worker status:', {
                connected: e.data.connected,
                vesselCount: e.data.vesselCount,
                batchInterval: e.data.batchInterval
              });
              break;
          }
        };
        
        workerRef.current.onerror = (error) => {
          setConnectionStatus({ 
            status: 'failed', 
            error: `Worker error: ${error.message}` 
          });
        };
        
      } catch (err) {
        setConnectionStatus({ 
          status: 'failed', 
          error: `Failed to create worker: ${err instanceof Error ? err.message : 'Unknown error'}` 
        });
      }
    } else {
      setConnectionStatus({ 
        status: 'failed', 
        error: 'Web Workers are not supported in this browser' 
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'disconnect' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Connect to AISStream
  const connect = useCallback((apiKey: string, boundingBox: number[][]) => {
    if (!workerRef.current || !isReady) {
      setConnectionStatus({ 
        status: 'failed', 
        error: 'WebSocket worker is not ready' 
      });
      return;
    }
    
    if (connectionStatus.status === 'connected' || connectionStatus.status === 'connecting') {
      console.log('Already connected or connecting');
      return;
    }
    
    setConnectionStatus({ status: 'connecting' });
    
    workerRef.current.postMessage({
      action: 'connect',
      apiKey,
      boundingBox
    });
  }, [isReady, connectionStatus.status]);

  // Disconnect from AISStream
  const disconnect = useCallback(() => {
    if (!workerRef.current) {
      return;
    }
    
    workerRef.current.postMessage({ action: 'disconnect' });
  }, []);

  // Set batch update interval
  const setBatchInterval = useCallback((interval: number) => {
    if (!workerRef.current || !isReady) {
      return;
    }
    
    workerRef.current.postMessage({
      action: 'setInterval',
      interval
    });
  }, [isReady]);

  return {
    connect,
    disconnect,
    vessels,
    connectionStatus,
    isReady,
    vesselCount,
    setBatchInterval
  };
}