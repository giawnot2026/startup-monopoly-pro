'use client'
import { useState, useMemo, useCallback } from 'react';
import { TILES } from '@/data/tiles';
import { PlayerState, BadgeLevel } from '@/types/game';

interface InitialPlayer {
  name: string;
  color: string;
}

interface Debt {
  amount: number;
  interestRate: number;
  remainingYears: number;
  annualInterest: number;
  initialCash: number;
}

export interface ExtendedPlayer extends PlayerState {
  debts: Debt[];
  laps: number;
  hasHadFunding: boolean;
  lastLoanRepaidAmount?: number;
}

export const useGameLogic = (initialPlayers: InitialPlayer[]) => {
  const [players, setPlayers] = useState<ExtendedPlayer[]>(
    initialPlayers.map((p, i) => ({
      id: i,
      name: p.name,
      color: p.color,
      cash: 50000,
      mrr: 0,
      monthlyCosts: 0,
      equity: 100,
      position: 0,
      assets: [],
      totalRaised: 0,
      isBankrupt: false,
      hasHadFunding: false,
      laps: 0,
      debts: []
    }))
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameWinner, setGameWinner] = useState<ExtendedPlayer | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  const calculateValuation = useCallback((p: ExtendedPlayer) => {
    const mrr = p.mrr || 0;
    const costs = p.monthlyCosts || 0;
    const cash = p.cash || 0;
    const ebitdaVal = mrr - costs;
    const annualEbitda = ebitdaVal * 12;
    const operationalValue = annualEbitda > 0 ? annualEbitda * 10 : (mrr * 12) * 2;
    const total = operationalValue + cash;
    return !isNaN(total) && total > 100000 ? total : 100000;
  }, []);

  const valuation = useMemo(() => calculateValuation(currentPlayer), [currentPlayer, calculateValuation]);

  const checkGameStatus = useCallback((updatedPlayers: ExtendedPlayer[]) => {
    const activePlayers = updatedPlayers.filter(p => !p.isBankrupt);
    if (activePlayers.length === 1 && updatedPlayers.length > 1) {
      setGameWinner(activePlayers[0]);
    }
  }, []);

  const nextTurn = useCallback(() => {
    setPlayers(prev => prev.map((p, idx) => 
      idx === currentPlayerIndex ? { ...p, lastLoanRepaidAmount: undefined } : p
    ));
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let attempts = 0;
    while (players[nextIndex].isBankrupt && attempts < players.length) {
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }
    setCurrentPlayerIndex(nextIndex);
  }, [players, currentPlayerIndex]);

  const movePlayer = useCallback((steps: number) => {
    const nextPos = (currentPlayer.position + steps) % TILES.length;
    const tile = TILES[nextPos];

    setPlayers(prevPlayers => {
      const owner = prevPlayers.find(p => !p.isBankrupt && p.id !== currentPlayerIndex && p.assets.some(a => a.tileId === nextPos));
      const ownerAsset = owner?.assets.find(a => a.tileId === nextPos);
      let tollToPay = 0;

      if (owner && ownerAsset && tile.badges) {
        const level = ownerAsset.level as keyof typeof tile.badges;
        tollToPay = tile.badges[level]?.toll || 0;
      }

      const newState = prevPlayers.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          let updatedCash = p.cash - tollToPay;
          let updatedLaps = p.laps;
          let repaidAmount: number | undefined = undefined;
          let updatedDebts = [...p.debts];
          
          if (nextPos < p.position || (p.position !== 0 && nextPos === 0)) {
            updatedLaps += 1;
            updatedCash += 25000;
            
            const processedDebts = updatedDebts.map(debt => {
              updatedCash -= debt.annualInterest;
              const newRemaining = debt.remainingYears - 1;
              if (newRemaining === 0) {
                updatedCash -= debt.amount;
                repaidAmount = debt.amount;
              }
              return { ...debt, remainingYears: newRemaining };
            }).filter(d => d.remainingYears > 0);
            
            updatedDebts = processedDebts;
          }

          const revMod = tile.revenueModifier || 0;
          const costMod = tile.costModifier || 0;

          return { 
            ...p, 
            position: nextPos, 
            cash: updatedCash,
            mrr: Math.max(0, p.mrr + revMod),
            monthlyCosts: Math.max(0, p.monthlyCosts + costMod),
            laps: updatedLaps,
            debts: updatedDebts, // Fix: Aggiornamento immutabile dei debiti
            isBankrupt: (updatedCash < -50000 && updatedLaps >= 3),
            lastLoanRepaidAmount: repaidAmount
          };
        }
        if (owner && idx === owner.id) return { ...p, cash: p.cash + tollToPay };
        return p;
      });
      checkGameStatus(newState);
      return newState;
    });
    return tile;
  }, [currentPlayerIndex, currentPlayer.position, checkGameStatus]);

  const applyFunding = useCallback((offer: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;
      let cashBonus = 0;
      let equityLoss = 0;
      const currentVal = calculateValuation(p);

      if (offer.type === 'GRANT') {
        cashBonus = offer.fixedAmount;
      } else if (offer.type === 'EQUITY') {
        equityLoss = offer.actualDilution || 15;
        cashBonus = (currentVal * equityLoss) / 100;
      } else if (offer.type === 'BANK') {
        cashBonus = offer.fixedAmount || 50000;
        const duration = offer.durationYears || 3;
        const newDebt: Debt = { 
          amount: cashBonus, 
          interestRate: offer.interestRate || 0.08, 
          remainingYears: duration, 
          annualInterest: cashBonus * (offer.interestRate || 0.08), 
          initialCash: cashBonus 
        };
        return { 
          ...p, 
          cash: p.cash + cashBonus, 
          debts: [...p.debts, newDebt], 
          hasHadFunding: true 
        };
      }
      
      return { 
        ...p, 
        cash: p.cash + cashBonus, 
        equity: Math.max(0, p.equity - equityLoss), 
        hasHadFunding: offer.type !== 'GRANT' ? true : p.hasHadFunding 
      };
    }));
  }, [currentPlayerIndex, calculateValuation]);

  const upgradeBadge = useCallback((tileId: number) => {
    const tile = TILES[tileId];
    if (!tile.badges) return false;
    let success = false;
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;
      const asset = p.assets.find(a => a.tileId === tileId);
      const currentLevel = asset ? asset.level : 'none';
      let nextLevel: BadgeLevel = 'none';
      let cost = 0;
      let revBonus = 0;
      if (currentLevel === 'none') { nextLevel = 'bronze'; cost = tile.badges.bronze.cost; revBonus = tile.badges.bronze.revenueBonus; }
      else if (currentLevel === 'bronze') { nextLevel = 'silver'; cost = tile.badges.silver.cost; revBonus = tile.badges.silver.revenueBonus; }
      else if (currentLevel === 'silver') { nextLevel = 'gold'; cost = tile.badges.gold.cost; revBonus = tile.badges.gold.revenueBonus; }
      if (nextLevel !== 'none' && p.cash >= cost) {
        success = true;
        return {
          ...p,
          cash: p.cash - cost,
          mrr: p.mrr + revBonus,
          assets: asset ? p.assets.map(a => a.tileId === tileId ? { ...a, level: nextLevel } : a) : [...p.assets, { tileId, level: nextLevel }]
        };
      }
      return p;
    }));
    return success;
  }, [currentPlayerIndex]);

  const applyEvent = useCallback((event: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;
      return { 
        ...p, 
        cash: p.cash + (event.cashEffect || 0) + (p.cash * (event.cashPercent || 0)), 
        mrr: Math.max(0, p.mrr + (event.revenueModifier || 0)), 
        monthlyCosts: Math.max(0, p.monthlyCosts + (event.costModifier || 0)) 
      };
    }));
  }, [currentPlayerIndex]);

  const attemptExit = useCallback(() => {
    if (currentPlayer.equity > 0 && calculateValuation(currentPlayer) >= 1000000) {
      setGameWinner(currentPlayer);
      return true;
    }
    return false;
  }, [currentPlayer, calculateValuation]);

  return { players, currentPlayer, valuation, movePlayer, applyFunding, upgradeBadge, applyEvent, nextTurn, gameWinner, attemptExit, calculateValuation };
};
