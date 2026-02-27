export type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold';

export interface PlayerAsset {
  tileId: number;
  level: BadgeLevel;
}

export interface Debt {
  id: string;
  principal: number; // Capitale residuo
  remainingYears: number;
  interestRate: number; // Esempio: 0.08 per 8%
}

export interface PlayerState {
  id: number;
  name: string;
  color: string;
  cash: number;
  mrr: number;
  monthlyCosts: number;
  equity: number;
  position: number;
  assets: PlayerAsset[];
  debts: Debt[];
  totalRaised: number;
  isBankrupt: boolean;
  laps: number;
}
