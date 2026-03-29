export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { countryCode = 'ID', year = new Date().getFullYear() } = req.query;
  
  try {
    // 2. Fetch long weekends from Nager.Date API
    const longWeekendsUrl = `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`;
    const response = await fetch(longWeekendsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nager.Date API error: ${response.status}`);
    }
    
    const longWeekends = await response.json();
    
    // 3. Transform data to match expected format
    const transformedLongWeekends = longWeekends.map(weekend => ({
      startDate: weekend.startDate,
      endDate: weekend.endDate,
      dayCount: weekend.dayCount,
      needBridgeDay: weekend.needBridgeDay,
      bridgeDays: weekend.bridgeDays || []
    }));
    
    // 4. Send data back to the PWA frontend
    res.status(200).json({
      longWeekends: transformedLongWeekends,
      year: year,
      countryCode: countryCode,
      count: transformedLongWeekends.length,
      source: 'nager.date'
    });
  } catch (error) {
    console.error('Long weekends API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch long weekends',
      message: error.message 
    });
  }
}