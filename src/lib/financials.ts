// src/lib/financials.ts
import { Player } from './types';
import { SECTORS } from './sectors';

// Calcola la valutazione: (MRR * 12) * Multiplo di Settore
export const calculateValuation = (player: Player): number => {
  const annualRevenue = player.mrr * 12;
  const multiplier = SECTORS[player.sector].multiplier;
  return annualRevenue * multiplier;
};

// Calcola il Net Worth: Cash + Valore della quota (Equity)
export const calculateNetWorth = (player: Player): number => {
  const valuation = calculateValuation(player);
  const equityValue = (valuation * player.equity) / 100;
  return player.cash + equityValue;
};

// Verifica se il giocatore può fare l'EXIT
export const checkExitEligibility = (player: Player): { canExit: boolean; reason?: string } => {
  const targetMRR = SECTORS[player.sector].exitMRR;
  
  if (player.mrr < targetMRR) return { canExit: false, reason: "MRR troppo basso" };
  if (player.equity < 15) return { canExit: false, reason: "Troppa diluizione (Equity < 15%)" };
  if (player.laps < 3) return { canExit: false, reason: "Devi completare almeno 3 anni (giri)" };
  
  return { canExit: true };
};
