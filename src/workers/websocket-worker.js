// WebSocket Web Worker for AIS ferry tracking
// This worker handles real-time vessel data in the background to keep UI at 60 FPS

let websocket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;
const BATCH_UPDATE_INTERVAL = 1000; // Batch updates every 1 second

let vesselCache = new Map();
let lastBatchUpdate = Date.now();

// Connect to AISStream WebSocket
function connectToAISStream(apiKey, boundingBox) {
  try {
    // Close existing connection
    if (websocket) {
      websocket.close();
    }
    
    // Create new WebSocket connection
    websocket = new WebSocket('wss://stream.aisstream.io/v0/stream');
    
    websocket.onopen = function() {
      console.log('AISStream WebSocket connected');
      reconnectAttempts = 0;
      
      // Send subscription message
      const subscriptionMessage = {
        APIKey: apiKey,
        BoundingBoxes: [boundingBox],
        FilterMessageTypes: ['PositionReport']
      };
      
      websocket.send(JSON.stringify(subscriptionMessage));
      
      // Send connection status to main thread
      self.postMessage({
        type: 'connection',
        status: 'connected',
        timestamp: Date.now()
      });
    };
    
    websocket.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);
        
        if (data.MessageType === 'PositionReport') {
          const vessel = {
            mmsi: data.MetaData.MMSI,
            name: data.MetaData.ShipName || 'Unknown Vessel',
            latitude: data.Message.Latitude,
            longitude: data.Message.Longitude,
            speed: data.Message.SpeedOverGround || 0,
            course: data.Message.CourseOverGround || 0,
            heading: data.Message.TrueHeading || 0,
            timestamp: Date.now()
          };
          
          // Update vessel cache
          vesselCache.set(vessel.mmsi, vessel);
          
          // Check if it's time for batch update
          if (Date.now() - lastBatchUpdate >= BATCH_UPDATE_INTERVAL) {
            sendBatchUpdate();
            lastBatchUpdate = Date.now();
          }
        }
      } catch (error) {
        console.error('Error parsing AIS message:', error);
      }
    };
    
    websocket.onerror = function(error) {
      console.error('AISStream WebSocket error:', error);
      self.postMessage({
        type: 'error',
        error: 'WebSocket connection error',
        timestamp: Date.now()
      });
    };
    
    websocket.onclose = function(event) {
      console.log('AISStream WebSocket closed:', event.code, event.reason);
      
      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        setTimeout(() => {
          connectToAISStream(apiKey, boundingBox);
        }, RECONNECT_DELAY);
      } else {
        self.postMessage({
          type: 'connection',
          status: 'failed',
          error: 'Max reconnection attempts reached',
          timestamp: Date.now()
        });
      }
    };
    
  } catch (error) {
    console.error('Error connecting to AISStream:', error);
    self.postMessage({
      type: 'error',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

// Send batched vessel updates to main thread
function sendBatchUpdate() {
  if (vesselCache.size > 0) {
    const vessels = Array.from(vesselCache.values());
    
    self.postMessage({
      type: 'vessels',
      vessels: vessels,
      count: vessels.length,
      timestamp: Date.now()
    });
    
    // Clear old vessels (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    for (const [mmsi, vessel] of vesselCache.entries()) {
      if (vessel.timestamp < fiveMinutesAgo) {
        vesselCache.delete(mmsi);
      }
    }
  }
}

// Handle messages from main thread
self.onmessage = function(e) {
  const { action, apiKey, boundingBox, interval } = e.data;
  
  switch (action) {
    case 'connect':
      if (apiKey && boundingBox) {
        connectToAISStream(apiKey, boundingBox);
      } else {
        self.postMessage({
          type: 'error',
          error: 'Missing apiKey or boundingBox',
          timestamp: Date.now()
        });
      }
      break;
      
    case 'disconnect':
      if (websocket) {
        websocket.close();
        websocket = null;
      }
      vesselCache.clear();
      self.postMessage({
        type: 'connection',
        status: 'disconnected',
        timestamp: Date.now()
      });
      break;
      
    case 'setInterval':
      if (interval && interval > 0) {
        BATCH_UPDATE_INTERVAL = interval;
        self.postMessage({
          type: 'config',
          batchInterval: BATCH_UPDATE_INTERVAL,
          timestamp: Date.now()
        });
      }
      break;
      
    case 'getStatus':
      self.postMessage({
        type: 'status',
        connected: websocket && websocket.readyState === WebSocket.OPEN,
        vesselCount: vesselCache.size,
        batchInterval: BATCH_UPDATE_INTERVAL,
        timestamp: Date.now()
      });
      break;
      
    default:
      self.postMessage({
        type: 'error',
        error: `Unknown action: ${action}`,
        timestamp: Date.now()
      });
  }
};

// Send ready signal to main thread
self.postMessage({
  type: 'ready',
  timestamp: Date.now()
});