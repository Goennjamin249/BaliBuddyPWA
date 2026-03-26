import { Database } from '@nozbe/watermelondb';
import database from './index';

// Pre-seed data for BaliBuddy
export async function seedDatabase() {
  const db = database;
  
  console.log('🌱 Seeding BaliBuddy database...');
  
  try {
    // Check if already seeded
    const settingsCollection = db.get('settings');
    const existingSeed = await settingsCollection.query().fetch();
    const isSeeded = existingSeed.find((s: any) => s.key === 'db_seeded');
    
    if (isSeeded) {
      console.log('✅ Database already seeded');
      return;
    }
    
    await db.write(async () => {
      // Seed Currencies
      const currenciesCollection = db.get('currencies');
      const currencies = [
        { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate_to_idr: 1 },
        { code: 'EUR', name: 'Euro', symbol: '€', rate_to_idr: 17500 },
        { code: 'USD', name: 'US Dollar', symbol: '$', rate_to_idr: 16000 },
        { code: 'GBP', name: 'British Pound', symbol: '£', rate_to_idr: 20000 },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate_to_idr: 10500 },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate_to_idr: 12000 },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate_to_idr: 110 },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate_to_idr: 18000 },
      ];
      
      for (const currency of currencies) {
        await currenciesCollection.create((c: any) => {
          c.code = currency.code;
          c.name = currency.name;
          c.symbol = currency.symbol;
          c.rate_to_idr = currency.rate_to_idr;
          c.last_updated = Date.now();
        });
      }
      console.log('✅ Currencies seeded');
      
      // Seed Phrases
      const phrasesCollection = db.get('phrases');
      const phrases = [
        // Greetings
        { category: 'greetings', indonesian: 'Selamat pagi', german: 'Guten Morgen', english: 'Good morning', pronunciation: 'seh-lah-mat pa-gi' },
        { category: 'greetings', indonesian: 'Selamat siang', german: 'Guten Tag', english: 'Good afternoon', pronunciation: 'seh-lah-mat see-ang' },
        { category: 'greetings', indonesian: 'Selamat malam', german: 'Guten Abend', english: 'Good evening', pronunciation: 'seh-lah-mat ma-lam' },
        { category: 'greetings', indonesian: 'Apa kabar?', german: 'Wie geht es Ihnen?', english: 'How are you?', pronunciation: 'ah-pa ka-bar' },
        { category: 'greetings', indonesian: 'Baik, terima kasih', german: 'Gut, danke', english: 'Fine, thank you', pronunciation: 'ba-ik, teh-ree-mah ka-seeh' },
        
        // Directions
        { category: 'directions', indonesian: 'Di mana...?', german: 'Wo ist...?', english: 'Where is...?', pronunciation: 'dee mah-na' },
        { category: 'directions', indonesian: 'Kiri', german: 'Links', english: 'Left', pronunciation: 'kee-ree' },
        { category: 'directions', indonesian: 'Kanan', german: 'Rechts', english: 'Right', pronunciation: 'kah-nan' },
        { category: 'directions', indonesian: 'Lurus', german: 'Geradeaus', english: 'Straight', pronunciation: 'loo-roos' },
        { category: 'directions', indonesian: 'Berhenti', german: 'Stopp/Halt', english: 'Stop', pronunciation: 'ber-hen-tee' },
        
        // Food
        { category: 'food', indonesian: 'Saya mau pesan', german: 'Ich möchte bestellen', english: 'I want to order', pronunciation: 'sah-ya ma-ow peh-san' },
        { category: 'food', indonesian: 'Berapa harganya?', german: 'Wie viel kostet das?', english: 'How much is it?', pronunciation: 'beh-rah-pa har-gan-ya' },
        { category: 'food', indonesian: 'Tidak pedas', german: 'Nicht scharf', english: 'Not spicy', pronunciation: 'tee-dak peh-das' },
        { category: 'food', indonesian: 'Air putih', german: 'Wasser', english: 'Water', pronunciation: 'ah-ir poo-teeh' },
        { category: 'food', indonesian: 'Nasi goreng', german: 'Gebratener Reis', english: 'Fried rice', pronunciation: 'nah-see go-reng' },
        
        // Emergency
        { category: 'emergency', indonesian: 'Tolong!', german: 'Hilfe!', english: 'Help!', pronunciation: 'toh-long' },
        { category: 'emergency', indonesian: 'Panggil dokter', german: 'Rufen Sie einen Arzt', english: 'Call a doctor', pronunciation: 'pang-gil dok-ter' },
        { category: 'emergency', indonesian: 'Saya sakit', german: 'Ich bin krank', english: 'I am sick', pronunciation: 'sah-ya sah-kit' },
        { category: 'emergency', indonesian: 'Di mana rumah sakit?', german: 'Wo ist das Krankenhaus?', english: 'Where is the hospital?', pronunciation: 'dee mah-na roo-mah sah-kit' },
        { category: 'emergency', indonesian: 'Kecelakaan', german: 'Unfall', english: 'Accident', pronunciation: 'keh-cheh-la-ka-an' },
        
        // Shopping
        { category: 'shopping', indonesian: 'Terlalu mahal', german: 'Zu teuer', english: 'Too expensive', pronunciation: 'ter-la-loo ma-hal' },
        { category: 'shopping', indonesian: 'Boleh kurang?', german: 'Kann man handeln?', english: 'Can I bargain?', pronunciation: 'bo-leh koo-rang' },
        { category: 'shopping', indonesian: 'Saya beli', german: 'Ich nehme es', english: 'I will buy it', pronunciation: 'sah-ya beh-lee' },
        { category: 'shopping', indonesian: 'Di mana ATM?', german: 'Wo ist der Geldautomat?', english: 'Where is the ATM?', pronunciation: 'dee mah-na ah-teh-em' },
        
        // Transport
        { category: 'transport', indonesian: 'Berapa ongkosnya?', german: 'Wie viel kostet die Fahrt?', english: 'How much is the fare?', pronunciation: 'beh-rah-pa ong-kos-nya' },
        { category: 'transport', indonesian: 'Ke bandara', german: 'Zum Flughafen', english: 'To the airport', pronunciation: 'keh ban-da-ra' },
        { category: 'transport', indonesian: 'Pakai meter', german: 'Mit Taxameter', english: 'Use the meter', pronunciation: 'pa-ka-ee meh-ter' },
      ];
      
      for (const phrase of phrases) {
        await phrasesCollection.create((p: any) => {
          p.category = phrase.category;
          p.indonesian = phrase.indonesian;
          p.german = phrase.german;
          p.english = phrase.english;
          p.pronunciation = phrase.pronunciation;
          p.is_favorite = false;
        });
      }
      console.log('✅ Phrases seeded');
      
      // Seed Prices
      const pricesCollection = db.get('prices');
      const prices = [
        { item_name: 'Nasi Goreng', category: 'food', min_price_idr: 15000, max_price_idr: 35000, market_type: 'warung', bargaining_tips: 'Ask for local price, avoid tourist areas' },
        { item_name: 'Mie Goreng', category: 'food', min_price_idr: 15000, max_price_idr: 30000, market_type: 'warung', bargaining_tips: 'Similar to nasi goreng pricing' },
        { item_name: 'Bintang Beer (small)', category: 'drinks', min_price_idr: 25000, max_price_idr: 50000, market_type: 'bar', bargaining_tips: 'Cheaper at minimarkets' },
        { item_name: 'Water Bottle (1.5L)', category: 'drinks', min_price_idr: 3000, max_price_idr: 8000, market_type: 'minimarket', bargaining_tips: 'Fixed price at convenience stores' },
        { item_name: 'Scooter Rental (per day)', category: 'transport', min_price_idr: 60000, max_price_idr: 100000, market_type: 'rental', bargaining_tips: 'Negotiate for longer rentals' },
        { item_name: 'Taxi (per km)', category: 'transport', min_price_idr: 6500, max_price_idr: 10000, market_type: 'taxi', bargaining_tips: 'Use Grab or Gojek for fixed prices' },
        { item_name: 'Sarong', category: 'clothing', min_price_idr: 30000, max_price_idr: 100000, market_type: 'market', bargaining_tips: 'Start at 50% of asking price' },
        { item_name: 'Bali SIM Card (tourist)', category: 'services', min_price_idr: 50000, max_price_idr: 150000, market_type: 'shop', bargaining_tips: 'Buy at official Telkomsel shops' },
        { item_name: 'Laundry (per kg)', category: 'services', min_price_idr: 6000, max_price_idr: 15000, market_type: 'laundry', bargaining_tips: 'Hotel laundry is more expensive' },
        { item_name: 'Temple Entrance', category: 'attractions', min_price_idr: 20000, max_price_idr: 60000, market_type: 'entrance', bargaining_tips: 'Fixed prices, sarong rental extra' },
      ];
      
      for (const price of prices) {
        await pricesCollection.create((p: any) => {
          p.item_name = price.item_name;
          p.category = price.category;
          p.min_price_idr = price.min_price_idr;
          p.max_price_idr = price.max_price_idr;
          p.market_type = price.market_type;
          p.bargaining_tips = price.bargaining_tips;
        });
      }
      console.log('✅ Prices seeded');
      
      // Seed Water Stations
      const waterStationsCollection = db.get('water_stations');
      const waterStations = [
        { name: 'Refill Bali Ubud', latitude: -8.5069, longitude: 115.2624, address: 'Jl. Monkey Forest, Ubud', water_type: 'filtered', price_per_liter: 5000, operating_hours: '08:00-20:00', rating: 4.5 },
        { name: 'Aqua Refill Station Seminyak', latitude: -8.6913, longitude: 115.1683, address: 'Jl. Laksmana, Seminyak', water_type: 'mineral', price_per_liter: 6000, operating_hours: '07:00-22:00', rating: 4.3 },
        { name: 'Bali Water Refill Kuta', latitude: -8.7183, longitude: 115.1687, address: 'Jl. Legian, Kuta', water_type: 'filtered', price_per_liter: 4000, operating_hours: '09:00-21:00', rating: 4.0 },
        { name: 'Eco Refill Canggu', latitude: -8.6477, longitude: 115.1378, address: 'Jl. Batu Bolong, Canggu', water_type: 'alkaline', price_per_liter: 8000, operating_hours: '07:00-20:00', rating: 4.7 },
      ];
      
      for (const station of waterStations) {
        await waterStationsCollection.create((w: any) => {
          w.name = station.name;
          w.latitude = station.latitude;
          w.longitude = station.longitude;
          w.address = station.address;
          w.water_type = station.water_type;
          w.price_per_liter = station.price_per_liter;
          w.operating_hours = station.operating_hours;
          w.rating = station.rating;
        });
      }
      console.log('✅ Water stations seeded');
      
      // Seed Settings
      await settingsCollection.create((s: any) => {
        s.key = 'db_seeded';
        s.value = 'true';
      });
      
      await settingsCollection.create((s: any) => {
        s.key = 'seed_version';
        s.value = '1.0.0';
      });
      
      await settingsCollection.create((s: any) => {
        s.key = 'default_language';
        s.value = 'de';
      });
      
      await settingsCollection.create((s: any) => {
        s.key = 'currency_base';
        s.value = 'IDR';
      });
    });
    
    console.log('✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Export for use in app initialization
export default seedDatabase;