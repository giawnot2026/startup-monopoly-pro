export type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold';

export interface PlayerAsset {
  tileId: number;
  level: BadgeLevel;
}

export interface PlayerState {
  id: number;
  name: string;
  color: string;
  cash: number;
  mrr: number;           // Ricavi mensili (somma base + badge)
  monthlyCosts: number;  // Costi operativi
  equity: number;        // Parte dal 100%
  position: number;      // Indice della casella (0-27)
  assets: PlayerAsset[]; // Elenco badge acquistati
  totalRaised: number;   // Storico investimenti ricevuti
}
