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

const createBadges = (baseCost: number, baseRev: number): BadgeLevels => ({
  bronze: { cost: baseCost, revenueBonus: baseRev * 0.6, toll: baseRev * 0.5 },
  silver: { cost: baseCost * 2.5, revenueBonus: baseRev * 1.5, toll: baseRev * 1.2 },
  gold: { cost: baseCost * 5, revenueBonus: baseRev * 3.5, toll: baseRev * 3.0 },
});

export const TILES: Tile[] = [
  { id: 0, name: "START: Fiscal Year", type: "funding", revenueModifier: 0, costModifier: 0 },
  { 
    id: 1, name: "Sviluppo MVP", type: "asset", revenueModifier: 500, costModifier: 200, 
    badges: createBadges(12000, 500),
    insight: "L'MVP serve a testare le ipotesi core con il minimo sforzo, riducendo i tempi di ingresso sul mercato.",
    badgeCta: "Ottieni il tuo Badge Sviluppo per consolidare le fondamenta tech."
  },
  { 
    id: 2, name: "Test di Mercato", type: "asset", revenueModifier: 300, costModifier: 100, 
    badges: createBadges(8000, 300),
    insight: "Validare il bisogno dei clienti prima di scalare evita di costruire prodotti che nessuno vuole.",
    badgeCta: "Conquista il Badge Validation per dimostrare la trazione del prodotto."
  },
  { id: 3, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 4, name: "Pitch Incubatori", type: "asset", revenueModifier: 1000, costModifier: 500, 
    badges: createBadges(20000, 1000),
    insight: "Gli incubatori offrono network e mentorship, elementi chiave per accelerare la crescita iniziale.",
    badgeCta: "Sblocca il Badge Ecosystem per accedere a risorse strategiche."
  },
  { id: 5, name: "Costi Prototipo", type: "tax", revenueModifier: 0, costModifier: 1500, insight: "La prototipazione rapida è un costo necessario per abbattere il rischio tecnico." },
  { 
    id: 6, name: "Acquisizione Primi Clienti", type: "asset", revenueModifier: 2000, costModifier: 800, 
    badges: createBadges(35000, 2000),
    insight: "I primi 'Early Adopters' sono fondamentali per ricevere feedback e generare i primi ricavi ricorrenti.",
    badgeCta: "Ottieni il Badge Traction per scalare il tuo database utenti."
  },
  { id: 7, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { 
    id: 8, name: "Campagna Marketing", type: "asset", revenueModifier: 4000, costModifier: 2500, 
    badges: createBadges(50000, 4000),
    insight: "Il marketing scalabile trasforma il budget in crescita prevedibile, a patto di controllare il costo di acquisizione (CAC).",
    badgeCta: "Sblocca il Badge Growth per dominare i tuoi canali di acquisizione."
  },
  { 
    id: 9, name: "Espansione Canali", type: "asset", revenueModifier: 3500, costModifier: 1500, 
    badges: createBadges(45000, 3500),
    insight: "Diversificare i canali di vendita riduce la dipendenza da una singola piattaforma.",
    badgeCta: "Conquista il Badge Omnichannel per proteggere il tuo business."
  },
  { id: 10, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 11, name: "Nuovi Mercati", type: "asset", revenueModifier: 6000, costModifier: 4000, 
    badges: createBadges(70000, 6000),
    insight: "L'internazionalizzazione moltiplica il mercato potenziale (TAM) ma aumenta la complessità operativa.",
    badgeCta: "Sblocca il Badge Expansion per diventare un player globale."
  },
  { 
    id: 12, name: "Partnership Strategiche", type: "asset", revenueModifier: 5000, costModifier: 2000, 
    badges: createBadges(60000, 5000),
    insight: "Le alleanze con grandi player permettono di accedere a mercati chiusi e database pre-esistenti.",
    badgeCta: "Ottieni il Badge Alliance per accelerare la tua distribuzione."
  },
  { id: 13, name: "Competitor Emergente", type: "tax", revenueModifier: -1000, costModifier: 1000, insight: "La concorrenza erode i margini. Innovare è l'unica difesa per mantenere il market share." },
  { id: 14, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 15, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 16, name: "Espansione Internazionale", type: "asset", revenueModifier: 15000, costModifier: 10000, 
    badges: createBadges(150000, 15000),
    insight: "Operare su più fusi orari e valute richiede una struttura di management solida.",
    badgeCta: "Conquista il Badge Global Leader per dominare il settore."
  },
  { id: 17, name: "Hiring Team", type: "tax", revenueModifier: 2000, costModifier: 8000, insight: "Il capitale umano è il costo più alto, ma è l'unico motore che genera valore a lungo termine." },
  { 
    id: 18, name: "Ottimizzazione Prodotto", type: "asset", revenueModifier: 8000, costModifier: 2000, 
    badges: createBadges(100000, 8000),
    insight: "Migliorare l'efficienza del prodotto riduce il churn (abbandono) e aumenta il valore del cliente (LTV).",
    badgeCta: "Sblocca il Badge Optimization per massimizzare i tuoi margini."
  },
  { 
    id: 19, name: "Aumento Retention", type: "asset", revenueModifier: 10000, costModifier: 1000, 
    badges: createBadges(120000, 10000),
    insight: "Mantenere un cliente costa 5 volte meno che acquisirne uno nuovo. La retention è la chiave del profitto.",
    badgeCta: "Ottieni il Badge Loyalty per blindare la tua base utenti."
  },
  { id: 20, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 21, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  { id: 22, name: "Opportunità", type: "special", revenueModifier: 0, costModifier: 0 },
  { 
    id: 23, name: "Acquisizione Aziendale", type: "asset", revenueModifier: 25000, costModifier: 5000, 
    badges: createBadges(250000, 25000),
    insight: "Comprare un competitor permette di acquisire istantaneamente tecnologia, talenti e clienti.",
    badgeCta: "Sblocca il Badge M&A per consolidare il mercato."
  },
  { 
    id: 24, name: "Spin-off", type: "asset", revenueModifier: 15000, costModifier: 3000, 
    badges: createBadges(180000, 15000),
    insight: "Separare un ramo d'azienda permette di focalizzare meglio le risorse su un prodotto specifico.",
    badgeCta: "Ottieni il Badge Agility per diversificare la tua offerta."
  },
  { 
    id: 25, name: "Licenza Brevetto", type: "asset", revenueModifier: 30000, costModifier: 1000, 
    badges: createBadges(300000, 30000),
    insight: "I brevetti creano un 'fossato' (moat) difensivo che protegge la proprietà intellettuale.",
    badgeCta: "Conquista il Badge IP Protection per rendere unica la tua startup."
  },
  { id: 26, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  { id: 27, name: "Exit Preparation", type: "tax", revenueModifier: -5000, costModifier: 15000, insight: "Prepararsi alla vendita richiede audit legali e finanziari costosi ma indispensabili per un multiplo elevato." }
];
