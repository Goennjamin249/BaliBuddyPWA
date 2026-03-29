export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { countryCode = 'ID', year = new Date().getFullYear() } = req.query;
  
  try {
    // 2. Fetch public holidays from Nager.Date API
    const holidaysUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    const response = await fetch(holidaysUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nager.Date API error: ${response.status}`);
    }
    
    const holidays = await response.json();
    
    // 3. Transform data to match expected format
    const transformedHolidays = holidays.map(holiday => ({
      date: holiday.date,
      localName: holiday.localName,
      name: holiday.name,
      countryCode: holiday.countryCode,
      fixed: holiday.fixed,
      global: holiday.global,
      counties: holiday.counties || [],
      launchYear: holiday.launchYear,
      types: holiday.types || []
    }));
    
    // 4. Send data back to the PWA frontend
    res.status(200).json({
      holidays: transformedHolidays,
      year: year,
      countryCode: countryCode,
      count: transformedHolidays.length,
      source: 'nager.date'
    });
  } catch (error) {
    console.error('Holidays API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch holidays',
      message: error.message 
    });
  }
}