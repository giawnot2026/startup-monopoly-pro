export interface FundingOffer {
  id: number;
  investor: string;
  type: 'EQUITY' | 'BANK' | 'GRANT';
  description: string;
  insight: string;
  equityRange?: { min: number; max: number };
  multiplierBonus?: number;
  interestRate?: number;
  durationYears?: number;
  fixedAmount?: number;
}

export const FUNDING_OFFERS: FundingOffer[] = [
  // --- INVESTITORI EQUITY (VC & ANGELS) ---
  { 
    id: 1, investor: "Pre-Seed Syndicate", type: "EQUITY", description: "Piccolo round per consolidare l'MVP.", 
    insight: "Il round Pre-Seed serve a trasformare un'idea in un business validato. È la fase con il rischio più alto.",
    equityRange: { min: 5, max: 8 }, multiplierBonus: 0 
  },
  { 
    id: 2, investor: "Silicon Valley Scout", type: "EQUITY", description: "Vogliono una crescita esplosiva. Multiplo +3x.", 
    insight: "Puntare alla Valley significa accettare una filosofia di 'Blitzscaling': crescere a ogni costo per dominare il mercato.",
    equityRange: { min: 15, max: 25 }, multiplierBonus: 3 
  },
  { 
    id: 3, investor: "Family Office", type: "EQUITY", description: "Investitori pazienti, bassa diluizione.", 
    insight: "I Family Office gestiscono patrimoni privati. Spesso hanno orizzonti temporali più lunghi dei classici fondi VC.",
    equityRange: { min: 3, max: 7 }, multiplierBonus: -1 
  },
  { 
    id: 4, investor: "Vulture Capital", type: "EQUITY", description: "Tanti soldi, ma vogliono prendersi l'azienda.", 
    insight: "Attenzione alle clausole: capitali ingenti in cambio di controllo aggressivo possono limitare la libertà dei founder.",
    equityRange: { min: 25, max: 40 }, multiplierBonus: 2 
  },
  { 
    id: 5, investor: "Impact Fund", type: "EQUITY", description: "Focus su sostenibilità. Diluizione equa.", 
    insight: "Gli investitori ESG (Environmental, Social, Governance) cercano un ritorno economico unito a un impatto positivo sul mondo.",
    equityRange: { min: 8, max: 12 }, multiplierBonus: 0 
  },

  // --- PRESTITI BANCARI E DEBITO (BANK) ---
  { 
    id: 21, investor: "Banca Nazionale", type: "BANK", description: "Prestito standard a tasso fisso.", 
    insight: "Il debito bancario è capitale 'non diluitivo'. Restituisci i soldi con gli interessi senza cedere quote della società.",
    interestRate: 0.05, durationYears: 3 
  },
  { 
    id: 22, investor: "Venture Debt Fund", type: "BANK", description: "Debito per chi ha già VC. Caro ma veloce.", 
    insight: "Il Venture Debt è uno strumento ibrido: è debito, ma spesso richiede dei 'warrant' (opzioni sulle quote) come garanzia.",
    interestRate: 0.12, durationYears: 2 
  },
  { 
    id: 26, investor: "Prestito Ponte (Bridge)", type: "BANK", description: "Breve durata per arrivare al prossimo round.", 
    insight: "Un finanziamento bridge serve a non finire i soldi mentre si chiude un round di investimento più grande.",
    interestRate: 0.15, durationYears: 1 
  },

  // --- FONDI PERDUTI (GRANT) ---
  { 
    id: 31, investor: "Bando Europeo Horizon", type: "GRANT", description: "Fondo perduto per innovazione radicale.", 
    insight: "I Grant sono 'soldi gratis' dallo Stato o UE. Non vanno restituiti e non costano quote, ma la rendicontazione è complessa.",
    fixedAmount: 50000 
  },
  { 
    id: 32, investor: "Smart & Start Grant", type: "GRANT", description: "Copertura costi operativi al 50%.", 
    insight: "Questi incentivi abbassano il 'burn rate' (la velocità con cui consumi cash) coprendo le spese correnti.",
    fixedAmount: 30000 
  }
];
