export interface BadgeLevels {
  bronze: { cost: number; revenueBonus: number; toll: number };
  silver: { cost: number; revenueBonus: number; toll: number };
  gold: { cost: number; revenueBonus: number; toll: number };
}

export interface Tile {
  id: number;
  name: string;
  type: 'funding' | 'asset' | 'tax' | 'special';
  revenueModifier: number;
  costModifier: number;
  insight?: string;
  badgeCta?: string;
  badges?: BadgeLevels;
}

// Funzione di utilità per creare badge bilanciati
// Il costo è circa 20-25 volte il bonus MRR fornito (ROI a 2 anni circa)
const createBadges = (baseCost: number, baseRev: number): BadgeLevels => ({
  bronze: { 
    cost: baseCost, 
    revenueBonus: baseRev, 
    toll: Math.floor(baseRev * 0.8) 
  },
  silver: { 
    cost: Math.floor(baseCost * 2.2), 
    revenueBonus: Math.floor(baseRev * 2.5), 
    toll: Math.floor(baseRev * 2.0) 
  },
  gold: { 
    cost: Math.floor(baseCost * 4.5), 
    revenueBonus: Math.floor(baseRev * 5.5), 
    toll: Math.floor(baseRev * 4.5) 
  },
});

export const TILES: Tile[] = [
  { id: 0, name: "START: Fiscal Year", type: "funding", revenueModifier: 0, costModifier: 0 },
  { 
    id: 1, name: "Sviluppo MVP", type: "asset", revenueModifier: 500, costModifier: 200, 
    badges: createBadges(12000, 500),
    insight: "L'MVP serve a testare le ipotesi core con il minimo sforzo.",
    badgeCta: "Ottieni il Badge Sviluppo."
  },
  { 
    id: 2, name: "Test di Mercato", type: "asset", revenueModifier: 300, costModifier: 150, 
    badges: createBadges(8000, 300),
    insight: "Validare il bisogno dei clienti evita di costruire prodotti inutili.",
    badgeCta: "Conquista il Badge Validation."
  },
  { id: 3, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 4, name: "Pitch Incubatori", type: "asset", revenueModifier: 800, costModifier: 400, 
    badges: createBadges(18000, 800),
    insight: "Gli incubatori offrono network e mentorship strategica.",
    badgeCta: "Sblocca il Badge Ecosystem."
  },
  { id: 5, name: "Costi Prototipo", type: "tax", revenueModifier: 0, costModifier: 1200, insight: "La prototipazione rapida abbatte il rischio tecnico." },
  { 
    id: 6, name: "Primi Clienti", type: "asset", revenueModifier: 1200, costModifier: 600, 
    badges: createBadges(28000, 1200),
    insight: "Gli Early Adopters generano i primi ricavi ricorrenti.",
    badgeCta: "Ottieni il Badge Traction."
  },
  { id: 7, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { 
    id: 8, name: "Campagna Marketing", type: "asset", revenueModifier: 2500, costModifier: 1500, 
    badges: createBadges(55000, 2500),
    insight: "Il marketing trasforma il budget in crescita prevedibile.",
    badgeCta: "Sblocca il Badge Growth."
  },
  { 
    id: 9, name: "Espansione Canali", type: "asset", revenueModifier: 2200, costModifier: 1200, 
    badges: createBadges(50000, 2200),
    insight: "Diversificare i canali riduce la dipendenza da singole piattaforme.",
    badgeCta: "Conquista il Badge Omnichannel."
  },
  { id: 10, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 11, name: "Nuovi Mercati", type: "asset", revenueModifier: 4000, costModifier: 2500, 
    badges: createBadges(90000, 4000),
    insight: "L'internazionalizzazione moltiplica il mercato potenziale (TAM).",
    badgeCta: "Sblocca il Badge Expansion."
  },
  { 
    id: 12, name: "Partnership Strategiche", type: "asset", revenueModifier: 3500, costModifier: 1800, 
    badges: createBadges(80000, 3500),
    insight: "Le alleanze permettono di accedere a mercati pre-esistenti.",
    badgeCta: "Ottieni il Badge Alliance."
  },
  { id: 13, name: "Competitor Emergente", type: "tax", revenueModifier: -1000, costModifier: 1000, insight: "La concorrenza erode i margini. L'innovazione è l'unica difesa." },
  { id: 14, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 15, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 16, name: "Espansione Globale", type: "asset", revenueModifier: 8000, costModifier: 5000, 
    badges: createBadges(180000, 8000),
    insight: "Operare su scala globale richiede management solido.",
    badgeCta: "Conquista il Badge Global Leader."
  },
  { id: 17, name: "Hiring Team", type: "tax", revenueModifier: 1500, costModifier: 6000, insight: "Il capitale umano è il motore che genera valore." },
  { 
    id: 18, name: "Ottimizzazione Prodotto", type: "asset", revenueModifier: 5500, costModifier: 2000, 
    badges: createBadges(120000, 5500),
    insight: "Migliorare l'efficienza riduce il churn e aumenta l'LTV.",
    badgeCta: "Sblocca il Badge Optimization."
  },
  { 
    id: 19, name: "Aumento Retention", type: "asset", revenueModifier: 6500, costModifier: 1500, 
    badges: createBadges(140000, 6500),
    insight: "Mantenere un cliente costa 5 volte meno che acquisirne uno nuovo.",
    badgeCta: "Ottieni il Badge Loyalty."
  },
  { id: 20, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 21, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 22, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 23, name: "Acquisizione Aziendale", type: "asset", revenueModifier: 15000, costModifier: 7000, 
    badges: createBadges(300000, 15000),
    insight: "Comprare un competitor accelera la scalata al mercato.",
    badgeCta: "Sblocca il Badge M&A."
  },
  { 
    id: 24, name: "Spin-off", type: "asset", revenueModifier: 10000, costModifier: 4000, 
    badges: createBadges(220000, 10000),
    insight: "Separare un ramo d'azienda focalizza meglio le risorse.",
    badgeCta: "Ottieni il Badge Agility."
  },
  { 
    id: 25, name: "Licenza Brevetto", type: "asset", revenueModifier: 20000, costModifier: 2000, 
    badges: createBadges(400000, 20000),
    insight: "I brevetti creano un fossato difensivo sulla IP.",
    badgeCta: "Conquista il Badge IP Protection."
  },
  { id: 26, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 27, name: "Exit Preparation", type: "tax", revenueModifier: -3000, costModifier: 12000, insight: "Prepararsi alla vendita richiede audit costosi ma necessari." }
];
