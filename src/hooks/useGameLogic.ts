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
  annualRate: number;
}

export interface ExtendedPlayer extends PlayerState {
  debts: Debt[];
  laps: number;
  hasHadFunding: boolean;
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

  const calculateValuation = (p: ExtendedPlayer) => {
    const ebitda = p.mrr - p.monthlyCosts;
    const annualEbitda = ebitda * 12;
    const operationalValue = annualEbitda > 0 ? annualEbitda * 10 : (p.mrr * 12) * 2;
    return operationalValue + p.cash;
  };

  const ebitda = useMemo(() => currentPlayer.mrr - currentPlayer.monthlyCosts, [currentPlayer]);
  const valuation = useMemo(() => calculateValuation(currentPlayer), [currentPlayer]);

  const checkGameStatus = useCallback((updatedPlayers: ExtendedPlayer[]) => {
    const activePlayers = updatedPlayers.filter(p => !p.isBankrupt);
    if (activePlayers.length === 1 && updatedPlayers.length > 1) {
      setGameWinner(activePlayers[0]);
    }
  }, []);

  const nextTurn = useCallback(() => {
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
        tollToPay = tile.badges[level].toll;
      }

      const newState = prevPlayers.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          let updatedCash = p.cash - tollToPay;
          let updatedDebts = [...p.debts];
          let updatedLaps = p.laps;

          // Gestione passaggio dal VIA (Check Debiti)
          if (nextPos < p.position || nextPos === 0) {
            updatedLaps += 1;
            p.debts.forEach(debt => { updatedCash -= debt.annualRate; });
            updatedDebts = p.debts
              .map(d => ({ ...d, remainingYears: d.remainingYears - 1 }))
              .filter(d => d.remainingYears > 0);
          }

          const revMod = tile.revenueModifier || 0;
          const costMod = tile.costModifier || 0;
          const finalCash = updatedCash + revMod - costMod;

          // LOGICA BANCAROTTA: Cash < 0 + Almeno 3 Giri + Almeno un finanziamento/debito ricevuto
          let isNowBankrupt = p.isBankrupt;
          if (finalCash < 0 && updatedLaps >= 3 && p.hasHadFunding) {
            isNowBankrupt = true;
          }

          return { 
            ...p, 
            position: nextPos, 
            cash: finalCash,
            mrr: Math.max(0, p.mrr + revMod),
            monthlyCosts: Math.max(0, p.monthlyCosts + costMod),
            debts: updatedDebts,
            laps: updatedLaps,
            isBankrupt: isNowBankrupt
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
      let newDebt = null;

      if (offer.type === 'GRANT') {
        cashBonus = offer.fixedAmount;
      } else if (offer.type === 'EQUITY') {
        equityLoss = (offer.equityRange.min + offer.equityRange.max) / 2;
        cashBonus = (calculateValuation(p) * equityLoss) / 100;
      } else if (offer.type === 'BANK') {
        cashBonus = calculateValuation(p) * 0.15;
        newDebt = {
          amount: cashBonus,
          interestRate: offer.interestRate,
          remainingYears: offer.durationYears,
          annualRate: (cashBonus * (1 + offer.interestRate)) / offer.durationYears
        };
      }

      return {
        ...p,
        cash: p.cash + cashBonus,
        equity: Math.max(0, p.equity - equityLoss),
        hasHadFunding: offer.type !== 'GRANT' ? true : p.hasHadFunding,
        debts: newDebt ? [...p.debts, newDebt] : p.debts,
        totalRaised: p.totalRaised + cashBonus
      };
    }));
  }, [currentPlayerIndex]);

  const upgradeBadge = useCallback((tileId: number) => {
    const tile = TILES[tileId];
    if (!tile.badges) return;
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;
      const asset = p.assets.find(a => a.tileId === tileId);
      const currentLevel = asset ? asset.level : 'none';
      let nextLevel: BadgeLevel = 'none';
      let cost = 0;
      if (currentLevel === 'none') { nextLevel = 'bronze'; cost = tile.badges.bronze.cost; }
      else if (currentLevel === 'bronze') { nextLevel = 'silver'; cost = tile.badges.silver.cost; }
      else if (currentLevel === 'silver') { nextLevel = 'gold'; cost = tile.badges.gold.cost; }
      if (nextLevel !== 'none' && p.cash >= cost) {
        return {
          ...p,
          cash: p.cash - cost,
          assets: asset ? p.assets.map(a => a.tileId === tileId ? { ...a, level: nextLevel } : a) : [...p.assets, { tileId, level: nextLevel }]
        };
      }
      return p;
    }));
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
    const currentVal = calculateValuation(currentPlayer);
    if (currentPlayer.equity > 0 && currentVal >= 1000000) {
      setGameWinner(currentPlayer);
      return true;
    }
    return false;
  }, [currentPlayer]);

  return {
    players, currentPlayerIndex, currentPlayer, ebitda, valuation,
    movePlayer, applyFunding, upgradeBadge, applyEvent, nextTurn,
    gameWinner, attemptExit
  };
};
