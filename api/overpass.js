export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { query } = req.query;
  
  // 2. This is a free public API (OpenStreetMap Overpass) - no API key needed
  try {
    // 3. Fetch data from the external API
    const url = `https://overpass-api.de/api/interpreter`;
    const response = await fetch(url, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });
    const data = await response.json();

    // 4. Send data back to the PWA frontend
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Overpass data' });
  }
}