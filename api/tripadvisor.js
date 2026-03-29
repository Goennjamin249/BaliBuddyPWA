export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { lat, lng, radius = 10, category = 'all' } = req.query;
  
  // 2. Securely load the API key from process.env
  const apiKey = process.env.RAPIDAPI_KEY;
  
  // Validate API key exists
  if (!apiKey) {
    console.error('RapidAPI key not configured');
    return res.status(500).json({ 
      error: 'API key not configured',
      message: 'RapidAPI key is missing. Please set RAPIDAPI_KEY in environment variables.'
    });
  }

  try {
    // 3. Fetch data from Booking.com API via RapidAPI
    // Using Booking.com's location search endpoint
    const queryParams = new URLSearchParams({
      latitude: lat,
      longitude: lng,
      radius: radius,
      category: category === 'all' ? 'hotels' : category
    });
    
    const url = `https://booking-com.p.rapidapi.com/v1/hotels/search-by-coordinates?${queryParams}`;
    const response = await fetch(url, { 
      method: 'GET', 
      headers: { 
        'Accept': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Booking.com API error: ${response.status}`);
    }
    
    const data = await response.json();

    // 4. Transform the response to match expected format
    const transformedData = {
      data: data.result?.map(hotel => ({
        location_id: hotel.hotel_id,
        name: hotel.hotel_name,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        rating: hotel.review_score || 0,
        review_count: hotel.review_nr || 0,
        photo_url: hotel.max_photo_url || '',
        web_url: hotel.url || '',
        address: hotel.address || '',
        category: 'hotels',
        price_level: hotel.price_level || '$$'
      })) || [],
      total_results: data.result?.length || 0,
      source: 'booking.com'
    };

    // 5. Send data back to the PWA frontend
    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Booking.com API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accommodation data',
      message: error.message 
    });
  }
}
