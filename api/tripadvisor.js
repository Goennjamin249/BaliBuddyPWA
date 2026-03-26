export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { lat, lng, radius = 10, category = 'all' } = req.query;
  
  // 2. Securely load the API key from process.env
  const apiKey = process.env.EXPO_PUBLIC_TRIPADVISOR_API_KEY;
  
  // Validate API key exists
  if (!apiKey) {
    console.error('TripAdvisor API key not configured');
    return res.status(500).json({ 
      error: 'API key not configured',
      message: 'TripAdvisor API key is missing. Please set EXPO_PUBLIC_TRIPADVISOR_API_KEY in environment variables.'
    });
  }

  try {
    // 3. Fetch data from the external API
    // TripAdvisor API for POI data with booking capability
    const url = `https://api.tripadvisor.com/api/internal/1.14/location/nearby_search`;
    const response = await fetch(url, { 
      method: 'GET', 
      headers: { 
        accept: 'application/json',
        'X-TripAdvisor-API-Key': apiKey
      },
      params: {
        latLong: `${lat},${lng}`,
        radius: radius,
        category: category
      }
    });
    
    if (!response.ok) {
      throw new Error(`TripAdvisor API error: ${response.status}`);
    }
    
    const data = await response.json();

    // 4. Send data back to the PWA frontend
    res.status(200).json(data);
  } catch (error) {
    console.error('TripAdvisor API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch TripAdvisor data',
      message: error.message 
    });
  }
}
