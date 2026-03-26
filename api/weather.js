 export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { lat, lng } = req.query;
  
  try {
    // 2. Use Open-Meteo API (100% free, no API key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat || -8.4095}&longitude=${lng || 115.1889}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Makassar&forecast_days=5`;
    
    const response = await fetch(url, { 
      method: 'GET', 
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }
    
    const data = await response.json();

    // 3. Send data back to the PWA frontend
    res.status(200).json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
