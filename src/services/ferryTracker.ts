/**
 * Ferry Tracker Service for BaliBuddy
 * Connects to maritime APIs for real-time ferry positions
 */

// Ferry data interface
export interface Ferry {
  id: string;
  name: string;
  route: string;
  departure: string;
  arrival: string;
  status: 'on-time' | 'delayed' | 'boarding' | 'departed' | 'cancelled';
  price: number;
  capacity: number;
  booked: number;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  eta?: string;
}

// Popular Bali ferry routes
export const ferryRoutes = [
  {
    id: 'bali-gili-t',
    name: 'Bali → Gili Trawangan',
    from: 'Padang Bai',
    to: 'Gili Trawangan',
    duration: '2.5 hours',
    operators: ['Bali Express', 'Blue Water Jet', 'Island Speedboat'],
  },
  {
    id: 'bali-gili-a',
    name: 'Bali → Gili Air',
    from: 'Padang Bai',
    to: 'Gili Air',
    duration: '2 hours',
    operators: ['Bali Express', 'Fast Boat Bali'],
  },
  {
    id: 'bali-nusa-l',
    name: 'Bali → Nusa Lembongan',
    from: 'Sanur',
    to: 'Nusa Lembongan',
    duration: '30 min',
    operators: ['Blue Water Jet', 'Maruti Express', 'Rocky Fast Boat'],
  },
  {
    id: 'bali-nusa-p',
    name: 'Bali → Nusa Penida',
    from: 'Sanur',
    to: 'Nusa Penida',
    duration: '45 min',
    operators: ['Maruti Express', 'Atas Awan', 'Semabu Hills'],
  },
  {
    id: 'bali-lombok',
    name: 'Bali → Lombok',
    from: 'Padang Bai',
    to: 'Lembar',
    duration: '4-5 hours',
    operators: ['ASDP Ferry', 'Wahana Gita'],
  },
  {
    id: 'bali-java',
    name: 'Bali → Java',
    from: 'Gilimanuk',
    to: 'Ketapang',
    duration: '45 min',
    operators: ['ASDP Ferry'],
  },
];

// Mock ferry schedule data (for demo/offline mode)
export const mockFerrySchedule: Ferry[] = [
  {
    id: '1',
    name: 'Bali Express',
    route: 'Bali → Gili Trawangan',
    departure: '08:00',
    arrival: '10:30',
    status: 'on-time',
    price: 450000,
    capacity: 150,
    booked: 120,
    latitude: -8.5833,
    longitude: 115.5167,
    speed: 25,
    heading: 45,
    eta: '10:30',
  },
  {
    id: '2',
    name: 'Blue Water Jet',
    route: 'Bali → Nusa Lembongan',
    departure: '09:30',
    arrival: '10:00',
    status: 'boarding',
    price: 350000,
    capacity: 100,
    booked: 95,
    latitude: -8.6833,
    longitude: 115.4500,
    speed: 0,
    heading: 90,
    eta: '10:00',
  },
  {
    id: '3',
    name: 'Island Hopper',
    route: 'Bali → Nusa Penida',
    departure: '10:00',
    arrival: '11:00',
    status: 'delayed',
    price: 300000,
    capacity: 80,
    booked: 60,
    latitude: -8.6500,
    longitude: 115.5000,
    speed: 15,
    heading: 120,
    eta: '11:30',
  },
  {
    id: '4',
    name: 'Fast Boat Bali',
    route: 'Bali → Gili Air',
    departure: '11:00',
    arrival: '13:00',
    status: 'on-time',
    price: 500000,
    capacity: 120,
    booked: 85,
    latitude: -8.5500,
    longitude: 115.4833,
    speed: 28,
    heading: 30,
    eta: '13:00',
  },
  {
    id: '5',
    name: 'Paradise Cruise',
    route: 'Bali → Lombok',
    departure: '14:00',
    arrival: '17:00',
    status: 'on-time',
    price: 600000,
    capacity: 200,
    booked: 150,
    latitude: -8.6167,
    longitude: 115.4000,
    speed: 20,
    heading: 80,
    eta: '17:00',
  },
];

// aisstream.io WebSocket integration (for real ship tracking)
// Note: This requires a backend proxy due to WebSocket limitations in serverless
export class FerryTrackerService {
  private ws: WebSocket | null = null;
  private subscribers: ((data: any) => void)[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connected: boolean = false;

  // Connect to aisstream.io WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // aisstream.io requires API key - use environment variable
        const apiKey = process.env.AISSTREAM_API_KEY || '';
        
        if (!apiKey) {
          console.warn('AISSTREAM_API_KEY not set, using mock data');
          resolve();
          return;
        }

        this.ws = new WebSocket(`wss://api.aisstream.io/v1/stream?apiKey=${apiKey}`);

        this.ws.onopen = () => {
          this.connected = true;
          console.log('Connected to aisstream.io');
          
          // Subscribe to Bali Strait area
          this.ws?.send(JSON.stringify({
            MessageType: 'SubscribeRequest',
            LatitudeDegreesMin: -9.0,
            LatitudeDegreesMax: -8.0,
            LongitudeDegreesMin: 115.0,
            LongitudeDegreesMax: 116.0,
          }));
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.notifySubscribers(data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
        };

        this.ws.onclose = () => {
          this.connected = false;
          console.log('Disconnected from aisstream.io');
          this.reconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Reconnect with exponential backoff
  private reconnect(): void {
    if (this.reconnectTimer) return;
    
    let delay = 1000;
    const maxDelay = 30000;

    const attemptReconnect = () => {
      if (delay > maxDelay) {
        this.reconnectTimer = null;
        return;
      }

      this.reconnectTimer = setTimeout(async () => {
        try {
          await this.connect();
          this.reconnectTimer = null;
        } catch {
          delay *= 2;
          attemptReconnect();
        }
      }, delay);

      delay *= 2;
    };

    attemptReconnect();
  }

  // Subscribe to ferry updates
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers(data: any): void {
    this.subscribers.forEach(cb => cb(data));
  }

  // Get current ferry positions
  getFerryPositions(): Ferry[] {
    return mockFerrySchedule;
  }

  // Get ferries by route
  getFerriesByRoute(routeId: string): Ferry[] {
    const route = ferryRoutes.find(r => r.id === routeId);
    if (!route) return [];
    
    return mockFerrySchedule.filter(f => f.route.includes(route.name.split('→')[0].trim()));
  }

  // Book ferry ticket (redirect to operator)
  getBookingUrl(ferryName: string, route: string): string {
    // Generate affiliate booking URLs
    const operators: Record<string, string> = {
      'Bali Express': 'https://www.bali-express.com/',
      'Blue Water Jet': 'https://www.bluewaterjet.com/',
      'Fast Boat Bali': 'https://www.fastboatbali.com/',
      'Island Hopper': 'https://www.islandhopperbali.com/',
      'Maruti Express': 'https://www.maruti-express.com/',
    };

    const operator = Object.keys(operators).find(op => ferryName.includes(op));
    if (operator && operators[operator]) {
      return operators[operator];
    }

    // Fallback to booking.com affiliate
    const affiliateId = process.env.BOOKING_COM_AFFILIATE_ID || '';
    return `https://www.booking.com/flights/index.html?aid=${affiliateId}`;
  }

  // Disconnect
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.connected = false;
  }
}

// Singleton instance
export const ferryTracker = new FerryTrackerService();
