export default async function handler(req, res) {
  // 1. Get parameters from the frontend request
  const { from = 'USD', to = 'IDR' } = req.query;
  
  try {
    // 2. Use Frankfurter API (100% free, open source, European Central Bank data)
    const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
    
    const response = await fetch(url, { 
      method: 'GET', 
      headers: { accept: 'application/json' },
      timeout: 10000 // 10 second timeout
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
    
    // Fallback: Return mock exchange rates for common currencies
    const mockRates = {
      USD: { IDR: 15500, EUR: 0.92, GBP: 0.79, JPY: 149.50 },
      EUR: { IDR: 16800, USD: 1.09, GBP: 0.86, JPY: 162.50 },
      GBP: { IDR: 19500, USD: 1.27, EUR: 1.16, JPY: 189.00 },
      IDR: { USD: 0.000065, EUR: 0.000059, GBP: 0.000051, JPY: 0.0097 }
    };
    
    const fallbackRate = mockRates[from]?.[to] || 15500; // Default to USD to IDR
    
    res.status(200).json({
      base: from,
      date: new Date().toISOString().split('T')[0],
      rates: { [to]: fallbackRate },
      _fallback: true,
      _message: 'Using fallback exchange rate due to API error'
    });
  }
}
