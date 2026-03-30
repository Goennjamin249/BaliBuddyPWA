/**
 * Law Hub Data for BaliBuddy
 * Indonesian laws and regulations for tourists
 */

export interface LawCategory {
  id: string;
  title: {
    de: string;
    en: string;
  };
  icon: string;
  color: string;
}

export interface LawEntry {
  id: string;
  categoryId: string;
  title: {
    de: string;
    en: string;
  };
  description: {
    de: string;
    en: string;
  };
  penalty: {
    de: string;
    en: string;
  };
  tips: {
    de: string[];
    en: string[];
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const lawCategories: LawCategory[] = [
  {
    id: 'traffic',
    title: { de: 'Verkehr', en: 'Traffic' },
    icon: '🚗',
    color: '#3B82F6',
  },
  {
    id: 'drugs',
    title: { de: 'Drogen', en: 'Drugs' },
    icon: '⚠️',
    color: '#EF4444',
  },
  {
    id: 'alcohol',
    title: { de: 'Alkohol', en: 'Alcohol' },
    icon: '🍺',
    color: '#F59E0B',
  },
  {
    id: 'dress',
    title: { de: 'Kleidung', en: 'Dress Code' },
    icon: '👔',
    color: '#8B5CF6',
  },
  {
    id: 'temple',
    title: { de: 'Tempel', en: 'Temples' },
    icon: '🛕',
    color: '#EC4899',
  },
  {
    id: 'visa',
    title: { de: 'Visum', en: 'Visa' },
    icon: '📋',
    color: '#10B981',
  },
  {
    id: 'environment',
    title: { de: 'Umwelt', en: 'Environment' },
    icon: '🌿',
    color: '#22C55E',
  },
  {
    id: 'behavior',
    title: { de: 'Verhalten', en: 'Behavior' },
    icon: '🤝',
    color: '#6366F1',
  },
];

export const lawEntries: LawEntry[] = [
  // Traffic Laws
  {
    id: 'traffic-1',
    categoryId: 'traffic',
    title: { de: 'Führerschein', en: 'Driving License' },
    description: {
      de: 'Ein internationaler Führerschein ist in Indonesien gesetzlich vorgeschrieben. Der deutsche Führerschein allein ist nicht gültig.',
      en: 'An International Driving Permit (IDP) is legally required in Indonesia. German license alone is not valid.',
    },
    penalty: {
      de: 'Bußgeld: 500.000 - 1.000.000 IDR. Bei Unfall: Keine Versicherung!',
      en: 'Fine: 500,000 - 1,000,000 IDR. In accident: No insurance coverage!',
    },
    tips: {
      de: [
        'IDP vor Reiseantritt beantragen (in Deutschland beim Straßenverkehrsamt)',
        'Immer zusammen mit dem Original-Führerschein mitführen',
        'Kopie im Hotel lassen',
      ],
      en: [
        'Apply for IDP before travel (at local vehicle registration office)',
        'Always carry with original license',
        'Leave copy at hotel',
      ],
    },
    severity: 'high',
  },
  {
    id: 'traffic-2',
    categoryId: 'traffic',
    title: { de: 'Helmpflicht', en: 'Helmet Requirement' },
    description: {
      de: 'Helmpflicht für Rollerfahrer und Beifahrer. Der Helm muss einen Kinnriemen haben und dem SNI-Standard entsprechen.',
      en: 'Helmet mandatory for scooter drivers and passengers. Helmet must have chin strap and meet SNI standard.',
    },
    penalty: {
      de: 'Bußgeld: 250.000 IDR',
      en: 'Fine: 250,000 IDR',
    },
    tips: {
      de: [
        'Immer Helm tragen (auch als Beifahrer)',
        'Auf SNI-Siegel im Helm achten',
        'Kinnriemen schließen',
      ],
      en: [
        'Always wear helmet (even as passenger)',
        'Check for SNI sticker on helmet',
        'Fasten chin strap',
      ],
    },
    severity: 'medium',
  },
  {
    id: 'traffic-3',
    categoryId: 'traffic',
    title: { de: 'Alkohol am Steuer', en: 'Drink Driving' },
    description: {
      de: 'Alkohol am Steuer ist streng verboten. Indonesien hat eine Null-Toleranz-Politik.',
      en: 'Drink driving is strictly prohibited. Indonesia has zero-tolerance policy.',
    },
    penalty: {
      de: 'Bußgeld: bis zu 10.000.000 IDR oder bis zu 3 Monate Haft',
      en: 'Fine: up to 10,000,000 IDR or up to 3 months imprisonment',
    },
    tips: {
      de: [
        'Kein Alkohol vor dem Fahren',
        'Gojek/Grab nach dem Trinken nutzen',
      ],
      en: [
        'No alcohol before driving',
        'Use Gojek/Grab after drinking',
      ],
    },
    severity: 'critical',
  },
  
  // Drug Laws
  {
    id: 'drugs-1',
    categoryId: 'drugs',
    title: { de: 'Drogenbesitz', en: 'Drug Possession' },
    description: {
      de: 'Indonesien hat extrem strenge Drogengesetze. Besitz jeglicher illegaler Drogen wird hart bestraft.',
      en: 'Indonesia has extremely strict drug laws. Possession of any illegal drugs is severely punished.',
    },
    penalty: {
      de: 'Besitz: 4-12 Jahre Haft. Handel: 15 Jahre bis lebenslänglich. Einfuhr: Todesstrafe möglich!',
      en: 'Possession: 4-12 years prison. Trafficking: 15 years to life. Import: Death penalty possible!',
    },
    tips: {
      de: [
        'NIEMALS Drogen anfassen oder besitzen',
        'Vorsicht vor "K2"/"Spice" (kann tödlich sein)',
        'Bei Angebot sofort ablehnen und Ort verlassen',
        'Bali ist bekannt für Drogenkontrollen am Flughafen',
      ],
      en: [
        'NEVER touch or possess drugs',
        'Beware of "K2"/"Spice" (can be deadly)',
        'Immediately refuse and leave if offered',
        'Bali known for drug checks at airport',
      ],
    },
    severity: 'critical',
  },
  {
    id: 'drugs-2',
    categoryId: 'drugs',
    title: { de: 'Magic Mushrooms', en: 'Magic Mushrooms' },
    description: {
      de: 'Magic Mushrooms sind in Indonesien ILLEGAL. Sie enthalten Psilocybin, eine verbotene Substanz.',
      en: 'Magic Mushrooms are ILLEGAL in Indonesia. They contain psilocybin, a prohibited substance.',
    },
    penalty: {
      de: 'Bis zu 12 Jahre Haft für Besitz',
      en: 'Up to 12 years prison for possession',
    },
    tips: {
      de: [
        'Nicht konsumieren, nicht besitzen',
        'Auch "Pizza Magic" ist illegal',
      ],
      en: [
        'Do not consume or possess',
        '"Pizza Magic" is also illegal',
      ],
    },
    severity: 'critical',
  },
  
  // Alcohol Laws
  {
    id: 'alcohol-1',
    categoryId: 'alcohol',
    title: { de: 'Methanol-Vergiftung', en: 'Methanol Poisoning' },
    description: {
      de: 'Gefälschter Alkohol mit Methanol ist auf Bali verbreitet. Kann zu Blindheit oder Tod führen.',
      en: 'Fake alcohol with methanol is common in Bali. Can cause blindness or death.',
    },
    penalty: {
      de: 'Keine Strafe, aber gesundheitliches Risiko!',
      en: 'No penalty, but health risk!',
    },
    tips: {
      de: [
        'Nur original verschlossene Flaschen trinken',
        'Keine selbstgemachten Cocktails',
        'Vorsicht bei zu günstigen Drinks',
        'Nur in etablierten Bars trinken',
      ],
      en: [
        'Only drink originally sealed bottles',
        'No homemade cocktails',
        'Beware of too-cheap drinks',
        'Drink only in established bars',
      ],
    },
    severity: 'critical',
  },
  {
    id: 'alcohol-2',
    categoryId: 'alcohol',
    title: { de: 'Öffentlicher Alkoholkonsum', en: 'Public Drinking' },
    description: {
      de: 'In einigen Gebieten Balis (besonders muslimische) ist öffentlicher Alkoholkonsum unerwünscht.',
      en: 'In some areas of Bali (especially Muslim areas) public drinking is frowned upon.',
    },
    penalty: {
      de: 'Keine Strafe, aber kulturell unangemessen',
      en: 'No penalty, but culturally inappropriate',
    },
    tips: {
      de: [
        'Nicht auf der Straße trinken',
        'In Tempeln und religiösen Stätten verboten',
      ],
      en: [
        'Do not drink on streets',
        'Forbidden in temples and religious sites',
      ],
    },
    severity: 'low',
  },
  
  // Dress Code
  {
    id: 'dress-1',
    categoryId: 'dress',
    title: { de: 'Tempel-Kleidung', en: 'Temple Dress Code' },
    description: {
      de: 'Beim Tempelbesuch müssen Schultern und Knie bedeckt sein. Sarong und Schärpe sind Pflicht.',
      en: 'When visiting temples, shoulders and knees must be covered. Sarong and sash are mandatory.',
    },
    penalty: {
      de: 'Zutritt verweigert',
      en: 'Entry denied',
    },
    tips: {
      de: [
        'Sarong dabei haben (oder vor Ort mieten)',
        'Nicht während der Menstruation in Tempel (traditionell)',
        'Respektvolle Kleidung tragen',
      ],
      en: [
        'Carry sarong (or rent on-site)',
        'No temple visits during menstruation (traditional)',
        'Wear respectful clothing',
      ],
    },
    severity: 'medium',
  },
  {
    id: 'dress-2',
    categoryId: 'dress',
    title: { de: 'Öffentliche Kleidung', en: 'Public Attire' },
    description: {
      de: 'Außerhalb von Touristengebieten sollte angemessene Kleidung getragen werden.',
      en: 'Outside tourist areas, appropriate clothing should be worn.',
    },
    penalty: {
      de: 'Keine Strafe, aber kulturell unangemessen',
      en: 'No penalty, but culturally inappropriate',
    },
    tips: {
      de: [
        'Bikini nur am Strand/Pool',
        'In Dörfern bedeckte Kleidung',
      ],
      en: [
        'Bikini only at beach/pool',
        'Covered clothing in villages',
      ],
    },
    severity: 'low',
  },
  
  // Temple Etiquette
  {
    id: 'temple-1',
    categoryId: 'temple',
    title: { de: 'Tempel-Verhalten', en: 'Temple Behavior' },
    description: {
      de: 'Tempel sind heilige Orte. Respektvolles Verhalten ist erforderlich.',
      en: 'Temples are sacred places. Respectful behavior is required.',
    },
    penalty: {
      de: 'Zutritt verweigert, bei schwerem Vergehen: Anzeige',
      en: 'Entry denied, for serious offenses: charges',
    },
    tips: {
      de: [
        'Nicht auf Altäre zeigen',
        'Leise sprechen',
        'Nicht mit dem Rücken zum Altar sitzen',
        'Frauen während Menstruation nicht eintreten',
      ],
      en: [
        'Do not point at altars',
        'Speak quietly',
        'Do not sit with back to altar',
        'Women should not enter during menstruation',
      ],
    },
    severity: 'medium',
  },
  {
    id: 'temple-2',
    categoryId: 'temple',
    title: { de: 'Fotografieren', en: 'Photography' },
    description: {
      de: 'Fotografieren ist oft erlaubt, aber nicht während Zeremonien oder von betenden Personen.',
      en: 'Photography is often allowed, but not during ceremonies or of praying people.',
    },
    penalty: {
      de: 'Aufforderung zum Löschen, bei Wiederholung: Verweis',
      en: 'Request to delete, for repeat: removal',
    },
    tips: {
      de: [
        'Immer um Erlaubnis fragen',
        'Keine Selfies während Zeremonien',
        'Blitz ausschalten',
      ],
      en: [
        'Always ask permission',
        'No selfies during ceremonies',
        'Turn off flash',
      ],
    },
    severity: 'low',
  },
  
  // Visa Laws
  {
    id: 'visa-1',
    categoryId: 'visa',
    title: { de: 'Overstay', en: 'Overstay' },
    description: {
      de: 'Das Überschreiten des Visums ist eine Straftat. Jeder Tag zählt!',
      en: 'Exceeding visa is a criminal offense. Every day counts!',
    },
    penalty: {
      de: '1.000.000 IDR pro Tag. Bei >60 Tagen: Abschiebung und Einreisesperre!',
      en: '1,000,000 IDR per day. For >60 days: Deportation and entry ban!',
    },
    tips: {
      de: [
        'Visum-Ablaufdatum im Kalender markieren',
        'Verlängerung 7 Tage vor Ablauf beantragen',
        'Bei Verlust: Sofort zur Immigrationsbehörde',
      ],
      en: [
        'Mark visa expiry in calendar',
        'Apply for extension 7 days before expiry',
        'If lost: Go to immigration immediately',
      ],
    },
    severity: 'critical',
  },
  {
    id: 'visa-2',
    categoryId: 'visa',
    title: { de: 'Arbeiten mit Touristenvisum', en: 'Working on Tourist Visa' },
    description: {
      de: 'Mit Touristenvisum ist jegliche bezahlte Arbeit verboten.',
      en: 'Any paid work is forbidden on tourist visa.',
    },
    penalty: {
      de: 'Abschiebung, Einreisesperre, bis zu 5 Jahre Haft',
      en: 'Deportation, entry ban, up to 5 years prison',
    },
    tips: {
      de: [
        'Nicht als "Digital Nomad" sichtbar arbeiten',
        'Für Arbeit: KITAS (Arbeitserlaubnis) beantragen',
      ],
      en: [
        'Do not visibly work as "Digital Nomad"',
        'For work: Apply for KITAS (work permit)',
      ],
    },
    severity: 'critical',
  },
  
  // Environment Laws
  {
    id: 'env-1',
    categoryId: 'environment',
    title: { de: 'Plastiktüten', en: 'Plastic Bags' },
    description: {
      de: 'Einige Gebiete Balis haben Plastiktüten verboten.',
      en: 'Some areas of Bali have banned plastic bags.',
    },
    penalty: {
      de: 'Bußgeld: bis zu 500.000 IDR',
      en: 'Fine: up to 500,000 IDR',
    },
    tips: {
      de: [
        'Stofftasche mitnehmen',
        'Wiederverwendbare Wasserflasche nutzen',
      ],
      en: [
        'Bring cloth bag',
        'Use reusable water bottle',
      ],
    },
    severity: 'low',
  },
  {
    id: 'env-2',
    categoryId: 'environment',
    title: { de: 'Korallen schützen', en: 'Protect Coral' },
    description: {
      de: 'Das Beschädigen oder Mitnehmen von Korallen ist verboten.',
      en: 'Damaging or taking coral is prohibited.',
    },
    penalty: {
      de: 'Bußgeld: bis zu 100.000.000 IDR oder bis zu 10 Jahre Haft',
      en: 'Fine: up to 100,000,000 IDR or up to 10 years prison',
    },
    tips: {
      de: [
        'Nicht auf Korallen treten',
        'Keine Souvenirs aus Korallen kaufen',
      ],
      en: [
        'Do not step on coral',
        'Do not buy coral souvenirs',
      ],
    },
    severity: 'high',
  },
  
  // Behavior
  {
    id: 'behavior-1',
    categoryId: 'behavior',
    title: { de: 'Respekt vor der Kultur', en: 'Cultural Respect' },
    description: {
      de: 'Balinesen legen großen Wert auf kulturellen Respekt.',
      en: 'Balinese place great importance on cultural respect.',
    },
    penalty: {
      de: 'Soziale Ächtung, bei schwerem Vergehen: Anzeige',
      en: 'Social ostracism, for serious offenses: charges',
    },
    tips: {
      de: [
        'Nicht mit dem Kopf berühren (auch Kinder)',
        'Nicht mit Füßen auf Personen/Objekte zeigen',
        'Rechte Hand für Überreichungen nutzen',
        'Opfergaben nicht betreten',
      ],
      en: [
        'Do not touch head (even children)',
        'Do not point feet at people/objects',
        'Use right hand for giving/receiving',
        'Do not step on offerings',
      ],
    },
    severity: 'medium',
  },
  {
    id: 'behavior-2',
    categoryId: 'behavior',
    title: { de: 'Öffentliche Zuneigung', en: 'Public Displays of Affection' },
    description: {
      de: 'Übermäßige öffentliche Zuneigung ist kulturell unangemessen.',
      en: 'Excessive public displays of affection are culturally inappropriate.',
    },
    penalty: {
      de: 'Keine Strafe, aber kulturell unangemessen',
      en: 'No penalty, but culturally inappropriate',
    },
    tips: {
      de: [
        'Händchenhalten ist okay',
        'Küssen in der Öffentlichkeit vermeiden',
      ],
      en: [
        'Hand-holding is okay',
        'Avoid kissing in public',
      ],
    },
    severity: 'low',
  },
];

// Get laws by category
export function getLawsByCategory(categoryId: string): LawEntry[] {
  return lawEntries.filter(entry => entry.categoryId === categoryId);
}

// Get severity color
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#EF4444';
    case 'high': return '#F59E0B';
    case 'medium': return '#3B82F6';
    case 'low': return '#10B981';
    default: return '#64748B';
  }
}

// Get severity label
export function getSeverityLabel(severity: string, lang: string): string {
  const labels: Record<string, { de: string; en: string }> = {
    critical: { de: 'Kritisch', en: 'Critical' },
    high: { de: 'Hoch', en: 'High' },
    medium: { de: 'Mittel', en: 'Medium' },
    low: { de: 'Niedrig', en: 'Low' },
  };
  return labels[severity]?.[lang === 'de' ? 'de' : 'en'] || severity;
}
