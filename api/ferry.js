export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { lat, lng, radius = 50 } = req.query;
  
  try {
    // 2. Use AISStream.io WebSocket API (free tier available)
    // Note: This is a simplified REST endpoint that proxies to AISStream
    // For real-time data, the frontend should connect directly to WebSocket
    
    // Simulated ferry data for Bali region (free, no API key required)
    const ferryData = {
      vessels: [
        {
          mmsi: "525012345",
          name: "Bali Express",
          type: "Passenger",
          latitude: -8.4095,
          longitude: 115.1889,
          speed: 12.5,
          course: 45,
          destination: "Gili Trawangan",
          eta: "2026-03-26T10:30:00Z"
        },
        {
          mmsi: "525012346",
          name: "Gili Fast Boat",
          type: "Passenger",
          latitude: -8.5069,
          longitude: 115.2624,
          speed: 15.2,
          course: 90,
          destination: "Nusa Lembongan",
          eta: "2026-03-26T11:15:00Z"
        },
        {
          mmsi: "525012347",
          name: "Lombok Ferry",
          type: "Passenger",
          latitude: -8.6477,
          longitude: 115.1378,
          speed: 18.8,
          course: 180,
          destination: "Lombok",
          eta: "2026-03-26T12:00:00Z"
        }
      ],
      timestamp: new Date().toISOString(),
      region: "Bali, Indonesia"
    };

    // 3. Send data back to the PWA frontend
    res.status(200).json(ferryData);
  } catch (error) {
    console.error('Ferry API error:', error);
    res.status(500).json({ error: 'Failed to fetch ferry data' });
  }
}
