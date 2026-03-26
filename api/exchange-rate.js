export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { from = 'USD', to = 'IDR' } = req.query;
  
  try {
    // 2. Use Frankfurter API (100% free, open source, European Central Bank data)
    const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
    
    const response = await fetch(url, { 
      method: 'GET', 
      headers: { accept: 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }
    
    const data = await response.json();

    // 3. Transform to match expected format
    const result = {
      base: data.base,
      date: data.date,
      rates: data.rates
    };

    // 4. Send data back to the PWA frontend
    res.status(200).json(result);
  } catch (error) {
    console.error('Exchange rate API error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
}
