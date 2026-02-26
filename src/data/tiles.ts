export interface BadgeLevels {
  bronze: { cost: number; revenueBonus: number; toll: number };
  silver: { cost: number; revenueBonus: number; toll: number };
  gold: { cost: number; revenueBonus: number; toll: number };
}

export interface Tile {
  id: number;
  name: string;
  type: 'funding' | 'asset' | 'tax' | 'special';
  revenueModifier: number; // Resi obbligatori per sicurezza logica
  costModifier: number;    // Resi obbligatori per sicurezza logica
  badges?: BadgeLevels;
}

const createBadges = (baseCost: number, baseRev: number): BadgeLevels => ({
  bronze: { cost: baseCost, revenueBonus: baseRev * 0.6, toll: baseRev * 0.5 },
  silver: { cost: baseCost * 2.5, revenueBonus: baseRev * 1.5, toll: baseRev * 1.2 },
  gold: { cost: baseCost * 5, revenueBonus: baseRev * 3.5, toll: baseRev * 3.0 },
});

export const TILES: Tile[] = [
  { id: 0, name: "START: Fiscal Year", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 1, name: "Sviluppo MVP", type: "asset", revenueModifier: 500, costModifier: 200, badges: createBadges(12000, 500) },
  { id: 2, name: "Test di Mercato", type: "asset", revenueModifier: 300, costModifier: 100, badges: createBadges(8000, 300) },
  { id: 3, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 4, name: "Pitch Incubatori", type: "asset", revenueModifier: 1000, costModifier: 500, badges: createBadges(20000, 1000) },
  { id: 5, name: "Costi Prototipo", type: "tax", revenueModifier: 0, costModifier: 1500 },
  { id: 6, name: "Acquisizione Primi Clienti", type: "asset", revenueModifier: 2000, costModifier: 800, badges: createBadges(35000, 2000) },
  
  { id: 7, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 8, name: "Campagna Marketing", type: "asset", revenueModifier: 4000, costModifier: 2500, badges: createBadges(50000, 4000) },
  { id: 9, name: "Espansione Canali", type: "asset", revenueModifier: 3500, costModifier: 1500, badges: createBadges(45000, 3500) },
  { id: 10, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 11, name: "Nuovi Mercati", type: "asset", revenueModifier: 6000, costModifier: 4000, badges: createBadges(70000, 6000) },
  { id: 12, name: "Partnership Strategiche", type: "asset", revenueModifier: 5000, costModifier: 2000, badges: createBadges(60000, 5000) },
  { id: 13, name: "Competitor Emergente", type: "tax", revenueModifier: -1000, costModifier: 1000 },

  { id: 14, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 15, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 16, name: "Espansione Internazionale", type: "asset", revenueModifier: 15000, costModifier: 10000, badges: createBadges(150000, 15000) },
  { id: 17, name: "Hiring Team", type: "tax", revenueModifier: 2000, costModifier: 8000 },
  { id: 18, name: "Ottimizzazione Prodotto", type: "asset", revenueModifier: 8000, costModifier: 2000, badges: createBadges(100000, 8000) },
  { id: 19, name: "Aumento Retention", type: "asset", revenueModifier: 10000, costModifier: 1000, badges: createBadges(120000, 10000) },
  { id: 20, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },

  { id: 21, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 22, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 23, name: "Acquisizione Aziendale", type: "asset", revenueModifier: 25000, costModifier: 5000, badges: createBadges(250000, 25000) },
  { id: 24, name: "Spin-off", type: "asset", revenueModifier: 15000, costModifier: 3000, badges: createBadges(180000, 15000) },
  { id: 25, name: "Licenza Brevetto", type: "asset", revenueModifier: 30000, costModifier: 1000, badges: createBadges(300000, 30000) },
  { id: 26, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 27, name: "Exit", type: "tax", revenueModifier: -5000, costModifier: 15000 }
];
