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
    id: 1, name: "Sviluppo MVP", type: "asset", revenueModifier: 0, costModifier: 5000, 
    badges: createBadges(8000, 400),
    insight: "L'MVP serve a testare le ipotesi core con il minimo sforzo.",
    badgeCta: "Ottieni il Badge Sviluppo."
  },
  { 
    id: 2, name: "Test di Mercato", type: "asset", revenueModifier: 1000, costModifier: 500, 
    badges: createBadges(12000, 600),
    insight: "Validare il bisogno dei clienti evita di costruire prodotti inutili.",
    badgeCta: "Conquista il Badge Validation."
  },
  { id: 3, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 4, name: "Pitch Incubatori", type: "asset", revenueModifier: 1200, costModifier: 500, 
    badges: createBadges(16000, 800),
    insight: "Gli incubatori offrono network e mentorship strategica.",
    badgeCta: "Sblocca il Badge Ecosystem."
  },
  { id: 5, name: "Costi Prototipo", type: "tax", revenueModifier: 0, costModifier: 1200, insight: "La prototipazione rapida abbatte il rischio tecnico." },
  { 
    id: 6, name: "Primi Clienti", type: "asset", revenueModifier: 2500, costModifier: 500, 
    badges: createBadges(20000, 1000),
    insight: "Gli Early Adopters generano i primi ricavi ricorrenti.",
    badgeCta: "Ottieni il Badge Traction."
  },
  { id: 7, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { 
    id: 8, name: "Campagna Marketing", type: "asset", revenueModifier: 5000, costModifier: 1500, 
    badges: createBadges(35000, 1750),
    insight: "Il marketing trasforma il budget in crescita prevedibile.",
    badgeCta: "Sblocca il Badge Growth."
  },
  { 
    id: 9, name: "Espansione Canali", type: "asset", revenueModifier: 7500, costModifier: 2500, 
    badges: createBadges(50000, 2500),
    insight: "Diversificare i canali riduce la dipendenza da singole piattaforme.",
    badgeCta: "Conquista il Badge Omnichannel."
  },
  { id: 10, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 11, name: "Nuovi Mercati", type: "asset", revenueModifier: 10000, costModifier: 3500, 
    badges: createBadges(75000, 4500),
    insight: "L'internazionalizzazione moltiplica il mercato potenziale (TAM).",
    badgeCta: "Sblocca il Badge Expansion."
  },
  { 
    id: 12, name: "Partnership Strategiche", type: "asset", revenueModifier: 10000, costModifier: 2500, 
    badges: createBadges(85000, 4500),
    insight: "Le alleanze permettono di accedere a mercati pre-esistenti.",
    badgeCta: "Ottieni il Badge Alliance."
  },
  { id: 13, name: "Competitor Emergente", type: "tax", revenueModifier: -7500, costModifier: 2500, insight: "La concorrenza erode i margini. L'innovazione è l'unica difesa." },
  { id: 14, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 15, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 16, name: "Espansione Globale", type: "asset", revenueModifier: 15000, costModifier: 5000, 
    badges: createBadges(100000, 7500),
    insight: "Operare su scala globale richiede management solido.",
    badgeCta: "Conquista il Badge Global Leader."
  },
  { id: 17, name: "Hiring Team", type: "tax", revenueModifier: 0, costModifier: 7500, insight: "Il capitale umano è il motore che genera valore." },
  { 
    id: 18, name: "Ottimizzazione Prodotto", type: "tax", revenueModifier: 0, costModifier: 5000, 
    badges: createBadges(125000, 10000),
    insight: "Migliorare l'efficienza riduce il churn e aumenta l'LTV.",
    badgeCta: "Sblocca il Badge Optimization."
  },
  { 
    id: 19, name: "Aumento Retention", type: "asset", revenueModifier: 6500, costModifier: 1500, 
    badges: createBadges(150000, 8500),
    insight: "Mantenere un cliente costa 5 volte meno che acquisirne uno nuovo.",
    badgeCta: "Ottieni il Badge Loyalty."
  },
  { id: 20, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 21, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 22, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 23, name: "Acquisizione Aziendale", type: "asset", revenueModifier: 25000, costModifier: 10000, 
    badges: createBadges(200000, 20000),
    insight: "Comprare un competitor o un player strategico accelera la scalata al mercato.",
    badgeCta: "Sblocca il Badge M&A."
  },
  { 
    id: 24, name: "Spin-off", type: "asset", revenueModifier: 10000, costModifier: 5000, 
    badges: createBadges(250000, 10000),
    insight: "Separare un ramo d'azienda focalizza meglio le risorse.",
    badgeCta: "Ottieni il Badge Agility."
  },
  { 
    id: 25, name: "Licenza Brevetto", type: "asset", revenueModifier: 20000, costModifier: 5000, 
    badges: createBadges(500000, 25000),
    insight: "I brevetti creano un fossato difensivo sulla IP.",
    badgeCta: "Conquista il Badge IP Protection."
  },
  { id: 26, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 27, name: "Exit Preparation", type: "tax", revenueModifier: 0, costModifier: 0, insight: "Prepararsi alla vendita richiede audit costosi ma necessari." }
];
