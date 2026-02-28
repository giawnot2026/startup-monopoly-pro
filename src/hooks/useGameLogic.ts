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
  capitalInstallment: number;
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
    const mrr = Number(p.mrr) || 0;
    const costs = Number(p.monthlyCosts) || 0;
    const cash = Number(p.cash) || 0;
    
    const monthlyEbitda = mrr - costs;
    const annualEbitda = monthlyEbitda * 12;
    
    const operationalValue = annualEbitda > 0 ? annualEbitda * 10 : 0;
    const total = operationalValue + cash;
    
    return !isNaN(total) ? total : 0;
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
        tollToPay = Number(tile.badges[level]?.toll) || 0;
      }

      const newState = prevPlayers.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          let updatedMrr = Math.max(0, Number(p.mrr) - tollToPay);
          let updatedCash = Number(p.cash);
          let updatedLaps = p.laps;
          let totalRepaidThisTurn = 0;
          let updatedDebts = [...p.debts];
          let newMonthlyCosts = Number(p.monthlyCosts);

          // LOGICA PASSAGGIO DAL VIA / CHIUSURA ANNO FISCALE
          if (nextPos < p.position || (p.position !== 0 && nextPos === 0)) {
            updatedLaps += 1;

            updatedDebts = updatedDebts.map(debt => {
              // 1. Calcolo interesse sul debito residuo
              const annualInterest = Math.round(Number(debt.amount) * Number(debt.interestRate));
              
              // 2. Quota Capitale
              const capitalRepayment = Number(debt.capitalInstallment);
              
              // 3. FIX: Al cash viene sottratta SOLO la quota capitale
              updatedCash -= capitalRepayment;
              totalRepaidThisTurn += capitalRepayment;

              // 4. L'interesse viene imputato come costo operativo all'EBITDA
              newMonthlyCosts += annualInterest; 

              return { 
                ...debt, 
                amount: Math.max(0, Number(debt.amount) - capitalRepayment),
                remainingYears: debt.remainingYears - 1 
              };
            }).filter(d => d.remainingYears > 0 && d.amount > 0);
          }

          const isSpecial = tile.type === 'special' || [7, 14, 21].includes(tile.id);
          const revMod = !isSpecial ? (Number(tile.revenueModifier) || 0) : 0;
          const costMod = !isSpecial ? (Number(tile.costModifier) || 0) : 0;
          const cashMod = !isSpecial ? (Number(tile.cashEffect) || 0) : 0;

          return { 
            ...p, 
            position: nextPos, 
            cash: updatedCash + cashMod,
            mrr: Math.max(0, updatedMrr + revMod),
            monthlyCosts: Math.max(0, newMonthlyCosts + costMod),
            laps: updatedLaps,
            debts: updatedDebts,
            isBankrupt: (updatedCash + cashMod < -50000 && updatedLaps >= 3),
            lastLoanRepaidAmount: totalRepaidThisTurn > 0 ? totalRepaidThisTurn : undefined
          };
        }
        if (owner && idx === owner.id) return { ...p, mrr: Number(p.mrr) + tollToPay };
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
        cashBonus = Number(offer.fixedAmount) || 25000;
      } else if (offer.type === 'EQUITY') {
        equityLoss = Number(offer.actualDilution) || 15;
        cashBonus = (currentVal * equityLoss) / 100;
      } else if (offer.type === 'BANK') {
        const loanAmount = Number(offer.fixedAmount) || 50000;
        const duration = offer.durationYears || 3;
        const rate = offer.interestRate || 0.08;
        const newDebt: Debt = { 
          amount: loanAmount, 
          interestRate: rate, 
          remainingYears: duration, 
          annualInterest: loanAmount * rate,
          capitalInstallment: loanAmount / duration
        };
        return { ...p, cash: Number(p.cash) + loanAmount, debts: [...p.debts, newDebt], hasHadFunding: true };
      }
      return { 
        ...p, 
        cash: Number(p.cash) + cashBonus, 
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

      if (currentLevel === 'none') { nextLevel = 'bronze'; cost = Number(tile.badges.bronze.cost); }
      else if (currentLevel === 'bronze') { nextLevel = 'silver'; cost = Number(tile.badges.silver.cost); }
      else if (currentLevel === 'silver') { nextLevel = 'gold'; cost = Number(tile.badges.gold.cost); }

      if (nextLevel !== 'none' && Number(p.cash) >= cost) {
        success = true;
        return {
          ...p,
          cash: Number(p.cash) - cost,
          assets: asset 
            ? p.assets.map(a => a.tileId === tileId ? { ...a, level: nextLevel } : a)
            : [...p.assets, { tileId, level: nextLevel }]
        };
      }
      return p;
    }));
    return success;
  }, [currentPlayerIndex]);

  const applyEvent = useCallback((event: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex && !event.global) return p;
      const cashEff = Number(event.cashEffect) || 0;
      const cashPerc = Number(event.cashPercent) || 0;
      return { 
        ...p, 
        cash: Number(p.cash) + cashEff + (Number(p.cash) * cashPerc), 
        mrr: Math.max(0, Number(p.mrr) + (Number(event.revenueModifier) || 0)), 
        monthlyCosts: Math.max(0, Number(p.monthlyCosts) + (Number(event.costModifier) || 0)) 
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

  return { 
    players, currentPlayer, valuation, movePlayer, applyFunding, 
    upgradeBadge, applyEvent, nextTurn, gameWinner, attemptExit, calculateValuation 
  };
};
