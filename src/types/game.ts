export type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold';

export interface PlayerAsset {
  tileId: number;
  level: BadgeLevel;
}

export interface Debt {
  id: string;
  principal: number;
  remainingQuarters: number;
  interestRate: number;
}

export interface PlayerState {
  id: number;
  name: string;
  color: string; // Es: '#3b82f6' per il blu
  cash: number;
  mrr: number;
  monthlyCosts: number;
  equity: number;
  position: number;
  assets: PlayerAsset[];
  debts: Debt[];
}
