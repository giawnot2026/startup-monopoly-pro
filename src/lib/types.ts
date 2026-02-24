// src/lib/types.ts

export type SectorId = 'saas_b2b' | 'cleantech' | 'ai_deeptech' | 'marketplace' | 'manufacturing';

export interface SectorConfig {
  id: SectorId;
  name: string;
  color: string;
  multiplier: number;
  initialCash: number;
  exitMRR: number;
}

export interface Player {
  id: string;
  name: string;
  sector: SectorId;
  position: number;
  cash: number;
  equity: number;
  mrr: number;
  laps: number;
  is_turn: boolean;
}

export interface TileDef {
  id: number;
  type: 'asset' | 'chance' | 'tax' | 'station' | 'special';
  name: string | Record<SectorId, string>;
  baseCost?: number;
  baseMRR?: number;
}
