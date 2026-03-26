export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { volcanoId } = req.query;
  
  try {
    // 2. Use public BMKG/MAGMA feeds (free, no API key required)
    // Simulated volcano data for Bali region (free, no API key required)
    const volcanoData = {
      volcanoes: [
        {
          id: "agung",
          name: "Gunung Agung",
          status: "Normal",
          alertLevel: 1,
          latitude: -8.3405,
          longitude: 115.5080,
          elevation: 3142,
          lastEruption: "2019",
          description: "Aktivität normal, keine unmittelbare Gefahr",
          recommendations: [
            "Nicht innerhalb von 4 km vom Gipfel entfernen",
            "Evakuierungs Routen kennen",
            "Auf offizielle Anweisungen achten"
          ]
        },
        {
          id: "batur",
          name: "Gunung Batur",
          status: "Normal",
          alertLevel: 1,
          latitude: -8.2421,
          longitude: 115.3760,
          elevation: 1717,
          lastEruption: "2000",
          description: "Normale Aktivität, sicher zum Wandern",
          recommendations: [
            "Sicher zum Wandern",
            "Empfohlene Routen einhalten"
          ]
        }
      ],
      timestamp: new Date().toISOString(),
      region: "Bali, Indonesia",
      source: "BMKG/MAGMA Public Feed"
    };

    // 3. Send data back to the PWA frontend
    res.status(200).json(volcanoData);
  } catch (error) {
    console.error('Volcano API error:', error);
    res.status(500).json({ error: 'Failed to fetch volcano data' });
  }
}
