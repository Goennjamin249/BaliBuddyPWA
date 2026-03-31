/**
 * Custom Hook for AISStream Ferry Tracking
 * Provides real-time ferry positions via WebSocket
 * 
 * Features:
 * - useRef for WebSocket to prevent multiple connections on re-renders
 * - Automatic cleanup on unmount
 * - Bali bounding box: [[-8.9, 114.4], [-8.0, 115.7]]
 * - Environment variable for API key security
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';

// Ferry position interface
export interface FerryPosition {
  mmsi: string; // Maritime Mobile Service Identity
  name: string;
  latitude: number;
  longitude: number;
  speed: number; // knots
  heading: number; // degrees
  timestamp: number;
  vesselType: string;
}

// AIS Message from aisstream.io
interface AISMessage {
  MessageType: string;
  Message: {
    PositionReport?: {
      UserID: number;
      Latitude: number;
      Longitude: number;
      Sog: number; // Speed over ground
      Cog: number; // Course over ground
      TrueHeading: number;
      Timestamp: number;
    };
    ShipAndVoyageData?: {
      UserID: number;
      Name: string;
      IMO: number;
      Type: string;
    };
  };
  MetaData: {
    MMSI: number;
    ShipName: string;
    latitude: number;
    longitude: number;
    time_utc: string;
  };
}

// Bali bounding box for AIS subscription
const BALI_BOUNDING_BOX = {
  LatitudeDegreesMin: -8.9,
  LatitudeDegreesMax: -8.0,
  LongitudeDegreesMin: 114.4,
  LongitudeDegreesMax: 115.7,
};

// Known ferry MMSI numbers for Bali routes (examples)
const KNOWN_FERRY_MMSI = new Set([
  // Add known ferry MMSI numbers here
  // These are typically 9-digit numbers
]);

interface UseFerryTrackerOptions {
  autoConnect?: boolean;
  onFerryUpdate?: (ferries: FerryPosition[]) => void;
  onError?: (error: Error) => void;
}

interface UseFerryTrackerReturn {
  ferries: FerryPosition[];
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useFerryTracker(
  options: UseFerryTrackerOptions = {}
): UseFerryTrackerReturn {
  const { autoConnect = true, onFerryUpdate, onError } = options;

  // Refs for WebSocket and cleanup
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);

  // State
  const [ferries, setFerries] = useState<FerryPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get API key from environment
  const getApiKey = useCallback((): string | null => {
    if (Platform.OS === 'web') {
      // On web, use Vite's environment variable
      return (import.meta as any).env?.VITE_AISSTREAM_API_KEY || null;
    }
    // On native, use Expo's environment variable
    return process.env.EXPO_PUBLIC_AISSTREAM_API_KEY || null;
  }, []);

  // Process AIS message and update ferry positions
  const processAISMessage = useCallback((data: AISMessage) => {
    if (data.MessageType !== 'PositionReport') return;
    
    const positionReport = data.Message?.PositionReport;
    if (!positionReport) return;

    const { UserID, Latitude, Longitude, Sog, Cog, TrueHeading, Timestamp } = positionReport;
    
    // Filter for ferry/vessel types (you can refine this based on vessel type codes)
    // AIS vessel type 60-69 are passenger ships
    const vesselType = data.Message?.ShipAndVoyageData?.Type || 'unknown';
    
    const ferryPosition: FerryPosition = {
      mmsi: String(UserID),
      name: data.MetaData?.ShipName || `Vessel ${UserID}`,
      latitude: Latitude,
      longitude: Longitude,
      speed: Sog,
      heading: Cog || TrueHeading,
      timestamp: Timestamp,
      vesselType,
    };

    setFerries((prev) => {
      // Update existing or add new
      const existingIndex = prev.findIndex((f) => f.mmsi === ferryPosition.mmsi);
      let updated: FerryPosition[];
      
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = ferryPosition;
      } else {
        updated = [...prev, ferryPosition];
      }
      
      // Notify callback
      onFerryUpdate?.(updated);
      
      return updated;
    });
  }, [onFerryUpdate]);

  // Connect to AISStream WebSocket
  const connect = useCallback(() => {
    // Prevent multiple connections
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('[FerryTracker] Already connected');
      return;
    }

    // Only works on web platform
    if (Platform.OS !== 'web') {
      const platformError = new Error('AISStream WebSocket only available on web platform');
      setError(platformError);
      onError?.(platformError);
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      const keyError = new Error('AISSTREAM_API_KEY not configured');
      setError(keyError);
      onError?.(keyError);
      console.warn('[FerryTracker] API key not set, using mock data');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const socket = new WebSocket(
        `wss://api.aisstream.io/v1/stream?apiKey=${apiKey}`
      );

      socket.onopen = () => {
        if (!mountedRef.current) {
          socket.close();
          return;
        }

        console.log('[FerryTracker] Connected to AISStream');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;

        // Subscribe to Bali area
        const subscribeMessage = {
          APIKey: apiKey,
          BoundingBoxes: [[
            [BALI_BOUNDING_BOX.LatitudeDegreesMin, BALI_BOUNDING_BOX.LongitudeDegreesMin],
            [BALI_BOUNDING_BOX.LatitudeDegreesMax, BALI_BOUNDING_BOX.LongitudeDegreesMax],
          ]],
          FilterMessageTypes: ['PositionReport'],
        };

        socket.send(JSON.stringify(subscribeMessage));
      };

      socket.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const data = JSON.parse(event.data) as AISMessage;
          processAISMessage(data);
        } catch (parseError) {
          console.error('[FerryTracker] Failed to parse message:', parseError);
        }
      };

      socket.onerror = (event) => {
        if (!mountedRef.current) return;

        console.error('[FerryTracker] WebSocket error:', event);
        const wsError = new Error('WebSocket connection error');
        setError(wsError);
        onError?.(wsError);
      };

      socket.onclose = () => {
        if (!mountedRef.current) return;

        console.log('[FerryTracker] WebSocket closed');
        setIsConnected(false);
        socketRef.current = null;

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              console.log(`[FerryTracker] Reconnecting (attempt ${reconnectAttemptsRef.current})...`);
              connect();
            }
          }, delay);
        }
      };

      socketRef.current = socket;
    } catch (err) {
      const connectError = err instanceof Error ? err : new Error('Failed to connect');
      setError(connectError);
      onError?.(connectError);
      setIsConnecting(false);
    }
  }, [getApiKey, processAISMessage, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Force reconnect
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ferries,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    reconnect,
  };
}

// Helper function to get mock ferry data for development/offline mode
export function getMockFerries(): FerryPosition[] {
  return [
    {
      mmsi: '525012345',
      name: 'Bali Express 1',
      latitude: -8.5833,
      longitude: 115.5167,
      speed: 25,
      heading: 45,
      timestamp: Date.now(),
      vesselType: 'Passenger',
    },
    {
      mmsi: '525012346',
      name: 'Blue Water Jet',
      latitude: -8.6833,
      longitude: 115.4500,
      speed: 28,
      heading: 90,
      timestamp: Date.now(),
      vesselType: 'Passenger',
    },
    {
      mmsi: '525012347',
      name: 'Gili Fast Boat',
      latitude: -8.5500,
      longitude: 115.4833,
      speed: 22,
      heading: 30,
      timestamp: Date.now(),
      vesselType: 'Passenger',
    },
  ];
}

export default useFerryTracker;