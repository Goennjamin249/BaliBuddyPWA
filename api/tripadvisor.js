export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { lat, lng, radius = 10, category = 'all' } = req.query;
  
  // 2. Securely load the API key from process.env
  const apiKey = process.env.EXPO_PUBLIC_TRIPADVISOR_API_KEY;

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
    const data = await response.json();

    // 4. Send data back to the PWA frontend
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TripAdvisor data' });
  }
}
