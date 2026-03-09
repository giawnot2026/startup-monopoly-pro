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
  bronze: { cost: baseCost, revenueBonus: baseRev, toll: Math.floor(baseRev * 0.8) },
  silver: { cost: Math.floor(baseCost * 2.2), revenueBonus: Math.floor(baseRev * 2.5), toll: Math.floor(baseRev * 2.0) },
  gold: { cost: Math.floor(baseCost * 4.5), revenueBonus: Math.floor(baseRev * 5.5), toll: Math.floor(baseRev * 4.5) },
});

export const TILES: Tile[] = [
  { id: 0, name: "START: Fiscal Year", type: "funding", revenueModifier: 0, costModifier: 0 },
  
  { id: 1, name: "Sviluppo MVP", type: "asset", revenueModifier: 0, costModifier: 5000, badges: createBadges(25000, 1000), 
    insight: "L'MVP non è un prodotto ridotto, è un processo per imparare. Riduce il debito tecnico iniziale.", badgeCta: "Ottieni il Badge Sviluppo." },
  
  { id: 2, name: "Test di Mercato", type: "asset", revenueModifier: 2500, costModifier: 1000, badges: createBadges(30000, 1500), 
    insight: "Parla con gli utenti: se non risolvi un 'hair-on-fire problem', non hai un business. Accelera il Product-Market Fit.", badgeCta: "Conquista il Badge Validation." },
  
  { id: 3, name: "Probabilità", type: "special", revenueModifier: 0, costModifier: 0 },
  
  { id: 4, name: "Pitch Incubatori", type: "asset", revenueModifier: 3500, costModifier: 500, badges: createBadges(30000, 1500), 
    insight: "Il network vale più del capitale. Hai accesso a mentors che hanno già scalato da 0 a 100M.", badgeCta: "Sblocca il Badge Ecosystem." },
  
  { id: 5, name: "Costi Prototipo", type: "tax", revenueModifier: 0, costModifier: 2500, badges: createBadges(25000, 1000),
    insight: "Itera velocemente. Fallire con un prototipo costa poco; fallire con un prodotto finito distrugge l'azienda.", badgeCta: "Sblocca il Badge product expert." },
  
  { id: 6, name: "Primi Clienti", type: "asset", revenueModifier: 3500, costModifier: 500, badges: createBadges(35000, 1750), 
    insight: "Fai cose che non scalano per conquistare i primi 10 utenti. Stabilizza la tua Traction iniziale.", badgeCta: "Ottieni il Badge Traction." },
  
  { id: 7, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  
  { id: 8, name: "Campagna Marketing", type: "asset", revenueModifier: 7500, costModifier: 5000, badges: createBadges(35000, 1750), 
    insight: "Se il costo di acquisizione (CAC) è inferiore al valore nel tempo (LTV), il marketing si transforma in una macchina da soldi.", badgeCta: "Sblocca il Badge Growth." },
  
  { id: 9, name: "Espansione Canali", type: "asset", revenueModifier: 7500, costModifier: 2500, badges: createBadges(50000, 2500), 
    insight: "Non dipendere da un solo canale di vendita. Diversifica i flussi di entrata rendendo i ricavi antifragili.", badgeCta: "Conquista il Badge Omnichannel." },
  
  { id: 10, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  
  { id: 11, name: "Nuovi Mercati", type: "asset", revenueModifier: 10000, costModifier: 3500, badges: createBadges(35000, 1750), 
    insight: "Il mercato totale (TAM) definisce il tuo tetto. Il Badge abbatte le barriere d'ingresso geografiche.", badgeCta: "Sblocca il Badge Expansion." },
  
  { id: 12, name: "Partnership Strategiche", type: "asset", revenueModifier: 10000, costModifier: 2500, badges: createBadges(50000, 2500), 
    insight: "Usa la forza degli altri per crescere. Sfrutta la fiducia di brand già consolidati per creare sinergie e acquisire nuovi clienti.", badgeCta: "Ottieni il Badge Alliance." },
  
  { id: 13, name: "Competitor Emergente", type: "tax", revenueModifier: -7500, costModifier: 2500, badges: createBadges(50000, 2500),
    insight: "Non hai differenziato abbastanza, nuovo competitor sul mercato. Senza un 'Moat' (fossato difensivo), i tuoi margini spariranno.", badgeCta: "Ottieni il Badge SWOT." },
  
  { id: 14, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  
  { id: 15, name: "Probabilità", type: "special", revenueModifier: 0, costModifier: 0 },
  
  { id: 16, name: "Espansione Globale", type: "asset", revenueModifier: 15000, costModifier: 5000, badges: createBadges(50000, 2500), 
    insight: "Scalare globalmente non è semplicemente servire altri mercati, ma rispettare le rispettive normative. Bisogna strutturare le operations supportando i clienti di ogni regione.", badgeCta: "Conquista il Badge Global Leader." },
  
  { id: 17, name: "Hiring Team", type: "tax", revenueModifier: 0, costModifier: 7500, badges: createBadges(30000, 1500),
    insight: "Le persone sono le fondamenta dell'azienda. Assumi solo 'A-Players' per non diluire la cultura e i valori aziendali.", badgeCta: "Conquista il Badge Hiring Leader."},
  
  { id: 18, name: "Ottimizzazione Prodotto", type: "tax", revenueModifier: 0, costModifier: 5000, badges: createBadges(25000, 1000), 
    insight: "L'efficienza è il carburante segreto. Trasforma i costi fissi in margini di profitto più alti.", badgeCta: "Sblocca il Badge Optimization." },
  
  { id: 19, name: "Aumento Retention", type: "asset", revenueModifier: 6500, costModifier: 1500, badges: createBadges(35000, 1750), 
    insight: "Il Churn è il killer silenzioso. Assicurati che il tuo 'secchio' non perda acqua mentre ne versi di nuova.", badgeCta: "Ottieni il Badge Loyalty." },
  
  { id: 20, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  
  { id: 21, name: "Funding Round", type: "funding", revenueModifier: 0, costModifier: 0 },
  
  { id: 22, name: "Probabilità", type: "special", revenueModifier: 0, costModifier: 0 },
  
  { id: 23, name: "Acquisizione Aziendale", type: "asset", revenueModifier: 25000, costModifier: 10000, badges: createBadges(50000, 2500), 
    insight: "A volte è più economico comprare che costruire. Acquisisci un player strategico per ottenere una fetta di mercato in un colpo solo.", badgeCta: "Sblocca il Badge M&A." },
  
  { id: 24, name: "Spin-off", type: "asset", revenueModifier: 7500, costModifier: 5000, badges: createBadges(30000, 1500), 
    insight: "La velocità uccide i giganti. Ridai agilità a un ramo d'azienda diventato troppo pesante.", badgeCta: "Ottieni il Badge Agility." },
  
  { id: 25, name: "Licenza Brevetto", type: "asset", revenueModifier: 20000, costModifier: 5000, badges: createBadges(30000, 1500), 
    insight: "La proprietà intellettuale è il tuo scudo legale. Rendi la tua tecnologia un asset inattaccabile.", badgeCta: "Conquista il Badge IP Protection." },
  
  { id: 26, name: "Imprevisto", type: "special", revenueModifier: 0, costModifier: 0 },
  
  { id: 27, name: "Exit Preparation", type: "tax", revenueModifier: 0, costModifier: 0, 
    insight: "Una buona Exit si costruisce anni prima. L'audit pulito è il passaporto per una valutazione multimilionaria." }
];
