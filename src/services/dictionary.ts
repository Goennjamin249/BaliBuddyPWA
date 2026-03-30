/**
 * Indonesian-German Dictionary with Fuzzy Search
 * Includes common phrases and words for Bali travelers
 */

// Dictionary entry interface
export interface DictionaryEntry {
  id: string;
  indonesian: string;
  german: string;
  english: string;
  pronunciation: string;
  category: string;
  examples: {
    indonesian: string;
    german: string;
  }[];
  synonyms?: string[];
  antonyms?: string[];
}

// Indonesian-German dictionary data
export const dictionaryData: DictionaryEntry[] = [
  // Greetings
  {
    id: '1',
    indonesian: 'Selamat pagi',
    german: 'Guten Morgen',
    english: 'Good morning',
    pronunciation: 'suh-LAH-mat PAH-gee',
    category: 'Begrüßung',
    examples: [
      { indonesian: 'Selamat pagi, apa kabar?', german: 'Guten Morgen, wie geht es Ihnen?' },
    ],
  },
  {
    id: '2',
    indonesian: 'Selamat siang',
    german: 'Guten Tag',
    english: 'Good afternoon',
    pronunciation: 'suh-LAH-mat SEE-ang',
    category: 'Begrüßung',
    examples: [
      { indonesian: 'Selamat siang, Bu', german: 'Guten Tag, Frau' },
    ],
  },
  {
    id: '3',
    indonesian: 'Selamat malam',
    german: 'Guten Abend',
    english: 'Good evening',
    pronunciation: 'suh-LAH-mat MAH-lam',
    category: 'Begrüßung',
    examples: [],
  },
  {
    id: '4',
    indonesian: 'Terima kasih',
    german: 'Danke',
    english: 'Thank you',
    pronunciation: 'tuh-REE-mah KAH-see',
    category: 'Höflichkeit',
    examples: [
      { indonesian: 'Terima kasih banyak', german: 'Vielen Dank' },
    ],
  },
  {
    id: '5',
    indonesian: 'Sama-sama',
    german: 'Bitte gern geschehen',
    english: 'You are welcome',
    pronunciation: 'SAH-mah SAH-mah',
    category: 'Höflichkeit',
    examples: [],
  },
  {
    id: '6',
    indonesian: 'Maaf',
    german: 'Entschuldigung',
    english: 'Sorry / Excuse me',
    pronunciation: 'MAH-af',
    category: 'Höflichkeit',
    examples: [
      { indonesian: 'Maaf, saya terlambat', german: 'Entschuldigung, ich bin spät' },
    ],
  },
  {
    id: '7',
    indonesian: 'Tolong',
    german: 'Hilfe / Bitte',
    english: 'Help / Please',
    pronunciation: 'TOH-long',
    category: 'Höflichkeit',
    examples: [
      { indonesian: 'Tolong bantu saya', german: 'Bitte helfen Sie mir' },
    ],
  },
  
  // Food & Drinks
  {
    id: '8',
    indonesian: 'Makan',
    german: 'Essen',
    english: 'Food / Eat',
    pronunciation: 'MAH-kan',
    category: 'Essen',
    examples: [
      { indonesian: 'Saya mau makan', german: 'Ich möchte essen' },
    ],
  },
  {
    id: '9',
    indonesian: 'Minum',
    german: 'Trinken',
    english: 'Drink',
    pronunciation: 'mee-NOOM',
    category: 'Essen',
    examples: [],
  },
  {
    id: '10',
    indonesian: 'Air',
    german: 'Wasser',
    english: 'Water',
    pronunciation: 'AH-yeer',
    category: 'Essen',
    examples: [
      { indonesian: 'Air putih', german: 'Trinkwasser' },
    ],
  },
  {
    id: '11',
    indonesian: 'Nasi',
    german: 'Reis',
    english: 'Rice',
    pronunciation: 'NAH-see',
    category: 'Essen',
    examples: [
      { indonesian: 'Nasi goreng', german: 'Gebratener Reis' },
    ],
  },
  {
    id: '12',
    indonesian: 'Ayam',
    german: 'Huhn',
    english: 'Chicken',
    pronunciation: 'AH-yam',
    category: 'Essen',
    examples: [
      { indonesian: 'Ayam bakar', german: 'Gegrilltes Huhn' },
    ],
  },
  {
    id: '13',
    indonesian: 'Ikan',
    german: 'Fisch',
    english: 'Fish',
    pronunciation: 'EE-kan',
    category: 'Essen',
    examples: [],
  },
  {
    id: '14',
    indonesian: 'Sayur',
    german: 'Gemüse',
    english: 'Vegetables',
    pronunciation: 'SAH-yoor',
    category: 'Essen',
    examples: [],
  },
  {
    id: '15',
    indonesian: 'Buah',
    german: 'Obst',
    english: 'Fruit',
    pronunciation: 'BOO-ah',
    category: 'Essen',
    examples: [
      { indonesian: 'Buah segar', german: 'Frisches Obst' },
    ],
  },
  {
    id: '16',
    indonesian: 'Pedas',
    german: 'Scharf',
    english: 'Spicy',
    pronunciation: 'PEH-das',
    category: 'Essen',
    examples: [
      { indonesian: 'Tidak pedas', german: 'Nicht scharf' },
    ],
  },
  {
    id: '17',
    indonesian: 'Enak',
    german: 'Lecker',
    english: 'Delicious',
    pronunciation: 'EH-nak',
    category: 'Essen',
    examples: [],
  },
  
  // Numbers
  {
    id: '18',
    indonesian: 'Satu',
    german: 'Eins',
    english: 'One',
    pronunciation: 'SAH-too',
    category: 'Zahlen',
    examples: [],
  },
  {
    id: '19',
    indonesian: 'Dua',
    german: 'Zwei',
    english: 'Two',
    pronunciation: 'DOO-ah',
    category: 'Zahlen',
    examples: [],
  },
  {
    id: '20',
    indonesian: 'Tiga',
    german: 'Drei',
    english: 'Three',
    pronunciation: 'TEE-gah',
    category: 'Zahlen',
    examples: [],
  },
  {
    id: '21',
    indonesian: 'Empat',
    german: 'Vier',
    english: 'Four',
    pronunciation: 'EM-pat',
    category: 'Zahlen',
    examples: [],
  },
  {
    id: '22',
    indonesian: 'Lima',
    german: 'Fünf',
    english: 'Five',
    pronunciation: 'LEE-mah',
    category: 'Zahlen',
    examples: [],
  },
  {
    id: '23',
    indonesian: 'Seratus',
    german: 'Einhundert',
    english: 'One hundred',
    pronunciation: 'seh-RAH-too',
    category: 'Zahlen',
    examples: [],
  },
  {
    id: '24',
    indonesian: 'Seribu',
    german: 'Eintausend',
    english: 'One thousand',
    pronunciation: 'seh-REE-boo',
    category: 'Zahlen',
    examples: [],
  },
  
  // Directions
  {
    id: '25',
    indonesian: 'Di mana',
    german: 'Wo ist',
    english: 'Where is',
    pronunciation: 'dee MAH-nah',
    category: 'Wegbeschreibung',
    examples: [
      { indonesian: 'Di mana toilet?', german: 'Wo ist die Toilette?' },
    ],
  },
  {
    id: '26',
    indonesian: 'Kiri',
    german: 'Links',
    english: 'Left',
    pronunciation: 'KEE-ree',
    category: 'Wegbeschreibung',
    examples: [],
  },
  {
    id: '27',
    indonesian: 'Kanan',
    german: 'Rechts',
    english: 'Right',
    pronunciation: 'KAH-nan',
    category: 'Wegbeschreibung',
    examples: [],
  },
  {
    id: '28',
    indonesian: 'Lurus',
    german: 'Geradeaus',
    english: 'Straight ahead',
    pronunciation: 'LOO-roos',
    category: 'Wegbeschreibung',
    examples: [],
  },
  {
    id: '29',
    indonesian: 'Jauh',
    german: 'Weit',
    english: 'Far',
    pronunciation: 'JAH-oo',
    category: 'Wegbeschreibung',
    examples: [
      { indonesian: 'Tidak jauh', german: 'Nicht weit' },
    ],
  },
  {
    id: '30',
    indonesian: 'Dekat',
    german: 'Nahe',
    english: 'Near',
    pronunciation: 'DEH-kat',
    category: 'Wegbeschreibung',
    examples: [],
  },
  
  // Shopping
  {
    id: '31',
    indonesian: 'Berapa harga',
    german: 'Wie viel kostet',
    english: 'How much',
    pronunciation: 'beh-RAH-pah HAR-gah',
    category: 'Einkaufen',
    examples: [
      { indonesian: 'Berapa harga ini?', german: 'Wie viel kostet das?' },
    ],
  },
  {
    id: '32',
    indonesian: 'Mahal',
    german: 'Teuer',
    english: 'Expensive',
    pronunciation: 'MAH-hal',
    category: 'Einkaufen',
    examples: [],
  },
  {
    id: '33',
    indonesian: 'Murah',
    german: 'Günstig',
    english: 'Cheap',
    pronunciation: 'MOO-rah',
    category: 'Einkaufen',
    examples: [],
  },
  {
    id: '34',
    indonesian: 'Beli',
    german: 'Kaufen',
    english: 'Buy',
    pronunciation: 'BEH-lee',
    category: 'Einkaufen',
    examples: [
      { indonesian: 'Saya mau beli ini', german: 'Ich möchte das kaufen' },
    ],
  },
  {
    id: '35',
    indonesian: 'Bisa kurang',
    german: 'Kann es billiger sein',
    english: 'Can it be cheaper',
    pronunciation: 'BEE-sah KOOR-ang',
    category: 'Einkaufen',
    examples: [],
  },
  
  // Emergency
  {
    id: '36',
    indonesian: 'Tolong',
    german: 'Hilfe',
    english: 'Help',
    pronunciation: 'TOH-long',
    category: 'Notfall',
    examples: [
      { indonesian: 'Tolong! Saya butuh bantuan!', german: 'Hilfe! Ich brauche Hilfe!' },
    ],
  },
  {
    id: '37',
    indonesian: 'Dokter',
    german: 'Arzt',
    english: 'Doctor',
    pronunciation: 'DOK-ter',
    category: 'Notfall',
    examples: [],
  },
  {
    id: '38',
    indonesian: 'Rumah sakit',
    german: 'Krankenhaus',
    english: 'Hospital',
    pronunciation: 'ROO-mah SAH-kit',
    category: 'Notfall',
    examples: [],
  },
  {
    id: '39',
    indonesian: 'Sakit',
    german: 'Krank / Schmerz',
    english: 'Sick / Pain',
    pronunciation: 'SAH-kit',
    category: 'Notfall',
    examples: [
      { indonesian: 'Saya sakit', german: 'Ich bin krank' },
    ],
  },
  {
    id: '40',
    indonesian: 'Polisi',
    german: 'Polizei',
    english: 'Police',
    pronunciation: 'po-LEE-see',
    category: 'Notfall',
    examples: [],
  },
  
  // Transport
  {
    id: '41',
    indonesian: 'Taksi',
    german: 'Taxi',
    english: 'Taxi',
    pronunciation: 'TAK-see',
    category: 'Transport',
    examples: [],
  },
  {
    id: '42',
    indonesian: 'Bandara',
    german: 'Flughafen',
    english: 'Airport',
    pronunciation: 'BAN-dah-rah',
    category: 'Transport',
    examples: [],
  },
  {
    id: '43',
    indonesian: 'Stasiun',
    german: 'Bahnhof',
    english: 'Station',
    pronunciation: 'sta-see-OON',
    category: 'Transport',
    examples: [],
  },
  {
    id: '44',
    indonesian: 'Jalan',
    german: 'Straße / Gehen',
    english: 'Street / Walk',
    pronunciation: 'JAH-lan',
    category: 'Transport',
    examples: [
      { indonesian: 'Jalan ini ke mana?', german: 'Wohin führt diese Straße?' },
    ],
  },
  
  // Common phrases
  {
    id: '45',
    indonesian: 'Ya',
    german: 'Ja',
    english: 'Yes',
    pronunciation: 'YAH',
    category: 'Allgemein',
    examples: [],
  },
  {
    id: '46',
    indonesian: 'Tidak',
    german: 'Nein',
    english: 'No',
    pronunciation: 'TEE-dak',
    category: 'Allgemein',
    examples: [],
  },
  {
    id: '47',
    indonesian: 'Bisa',
    german: 'Können',
    english: 'Can',
    pronunciation: 'BEE-sah',
    category: 'Allgemein',
    examples: [
      { indonesian: 'Bisa bahasa Inggris?', german: 'Können Sie Englisch?' },
    ],
  },
  {
    id: '48',
    indonesian: 'Tidak bisa',
    german: 'Kann nicht',
    english: 'Cannot',
    pronunciation: 'TEE-dak BEE-sah',
    category: 'Allgemein',
    examples: [],
  },
  {
    id: '49',
    indonesian: 'Saya',
    german: 'Ich',
    english: 'I',
    pronunciation: 'SAH-yah',
    category: 'Allgemein',
    examples: [],
  },
  {
    id: '50',
    indonesian: 'Anda',
    german: 'Sie',
    english: 'You',
    pronunciation: 'AN-dah',
    category: 'Allgemein',
    examples: [],
  },
];

// Categories for filtering
export const dictionaryCategories = [
  'Alle',
  'Begrüßung',
  'Höflichkeit',
  'Essen',
  'Zahlen',
  'Wegbeschreibung',
  'Einkaufen',
  'Notfall',
  'Transport',
  'Allgemein',
];

// Fuzzy search implementation (simple Levenshtein distance)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Search function with fuzzy matching
export function searchDictionary(
  query: string,
  category: string = 'Alle'
): DictionaryEntry[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return category === 'Alle' 
      ? dictionaryData 
      : dictionaryData.filter(entry => entry.category === category);
  }
  
  // Filter by category first
  let results = category === 'Alle'
    ? [...dictionaryData]
    : dictionaryData.filter(entry => entry.category === category);
  
  // Exact match first
  const exactMatches = results.filter(entry =>
    entry.indonesian.toLowerCase().includes(normalizedQuery) ||
    entry.german.toLowerCase().includes(normalizedQuery) ||
    entry.english.toLowerCase().includes(normalizedQuery)
  );
  
  // Fuzzy matches
  const fuzzyMatches = results
    .filter(entry => !exactMatches.includes(entry))
    .map(entry => ({
      entry,
      distance: Math.min(
        levenshteinDistance(normalizedQuery, entry.indonesian.toLowerCase()),
        levenshteinDistance(normalizedQuery, entry.german.toLowerCase()),
        levenshteinDistance(normalizedQuery, entry.english.toLowerCase())
      ),
    }))
    .filter(item => item.distance <= 3) // Max 3 character differences
    .sort((a, b) => a.distance - b.distance)
    .map(item => item.entry);
  
  return [...exactMatches, ...fuzzyMatches];
}
