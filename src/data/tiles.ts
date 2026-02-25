export interface Tile {
  id: number;
  name: string;
  type: 'funding' | 'asset' | 'tax' | 'special';
  revenueModifier?: number; // Incremento/Decremento MRR (Monthly Recurring Revenue)
  costModifier?: number;    // Incremento/Decremento Costi Operativi Mensili
  description?: string;
}

export const TILES: Tile[] = [
  // FASE 1: GARAGE (Costi bassi, Ricavi minimi)
  { id: 0, name: "START: Anno Fiscale", type: "funding" },
  { id: 1, name: "Sviluppo MVP", type: "asset", revenueModifier: 500, costModifier: 200 },
  { id: 2, name: "Test di Mercato", type: "asset", revenueModifier: 300, costModifier: 100 },
  { id: 3, name: "Opportunità", type: "special" },
  { id: 4, name: "Pitch Incubatori", type: "asset", revenueModifier: 1000, costModifier: 500 },
  { id: 5, name: "Costi Prototipo", type: "tax", revenueModifier: 0, costModifier: 1500 },
  { id: 6, name: "Acquisizione Primi Clienti", type: "asset", revenueModifier: 2000, costModifier: 800 },

  // ANGOLO 7: SEED ROUND (Iniezione di Cash)
  { id: 7, name: "Seed Round", type: "funding" },

  // FASE 2: GO-TO-MARKET (Inizio crescita e costi marketing)
  { id: 8, name: "Campagna Marketing", type: "asset", revenueModifier: 4000, costModifier: 2500 },
  { id: 9, name: "Espansione Canali", type: "asset", revenueModifier: 3500, costModifier: 1500 },
  { id: 10, name: "Imprevisto", type: "special" },
  { id: 11, name: "Nuovi Mercati", type: "asset", revenueModifier: 6000, costModifier: 4000 },
  { id: 12, name: "Partnership Strategiche", type: "asset", revenueModifier: 5000, costModifier: 2000 },
  { id: 13, name: "Competitor Emergente", type: "tax", revenueModifier: -1000, costModifier: 1000 },

  // ANGOLO 14: BRIDGE ROUND
  { id: 14, name: "Bridge Round", type: "funding" },

  // FASE 3: SCALE-UP (Grandi volumi, grandi costi)
  { id: 15, name: "Opportunità", type: "special" },
  { id: 16, name: "Espansione Internazionale", type: "asset", revenueModifier: 15000, costModifier: 10000 },
  { id: 17, name: "Hiring Team", type: "tax", revenueModifier: 2000, costModifier: 8000 },
  { id: 18, name: "Ottimizzazione Prodotto", type: "asset", revenueModifier: 8000, costModifier: 2000 },
  { id: 19, name: "Aumento Retention", type: "asset", revenueModifier: 10000, costModifier: 1000 },
  { id: 20, name: "Imprevisto", type: "special" },

  // ANGOLO 21: SERIES B
  { id: 21, name: "Series B", type: "funding" },

  // FASE 4: EXIT (Massimizzazione Valuation)
  { id: 22, name: "Opportunità", type: "special" },
  { id: 23, name: "Acquisizione Aziendale", type: "asset", revenueModifier: 25000, costModifier: 5000 },
  { id: 24, name: "Spin-off", type: "asset", revenueModifier: 15000, costModifier: 3000 },
  { id: 25, name: "Licenza Brevetto", type: "asset", revenueModifier: 30000, costModifier: 1000 },
  { id: 26, name: "Imprevisto", type: "special" },
  { id: 27, name: "Exit", type: "tax", revenueModifier: -5000, costModifier: 15000 } // Costi di liquidazione
];
