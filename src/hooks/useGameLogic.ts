'use client'
import { useState, useMemo, useCallback } from 'react';
import { TILES } from '@/data/tiles';
import { PlayerState, Debt, BadgeLevel } from '@/types/game';

interface InitialPlayer { name: string; color: string; }

export interface ExtendedPlayer extends PlayerState {
  hasHadFunding: boolean;
  lastLoanRepaidAmount?: number;
}

export const useGameLogic = (initialPlayers: InitialPlayer[]) => {
  const [players, setPlayers] = useState<ExtendedPlayer[]>(
    initialPlayers.map((p, i) => ({
      id: i, name: p.name, color: p.color, cash: 50000, mrr: 0, monthlyCosts: 0,
      equity: 100, position: 0, assets: [], totalRaised: 0, isBankrupt: false,
      hasHadFunding: false, laps: 0, debts: []
    }))
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameWinner, setGameWinner] = useState<ExtendedPlayer | null>(null);
  const currentPlayer = players[currentPlayerIndex];

  // --- CALCOLO FINANZIARIO ---
  const calculateFinancials = useCallback((p: ExtendedPlayer) => {
    const mrr = Number(p.mrr) || 0;
    const costs = Number(p.monthlyCosts) || 0;
    const cash = Number(p.cash) || 0;

    // Interessi mensili (Annual Interest / 12)
    const monthlyInterests = p.debts.reduce((acc, d) => {
      return acc + ((d.principal * d.interestRate) / 12);
    }, 0);

    const monthlyEbitda = mrr - costs - monthlyInterests;
    const annualEbitda = monthlyEbitda * 12;
    
    // Valutazione = (EBITDA Annuale * 10) + Cash
    const operationalValue = annualEbitda > 0 ? annualEbitda * 10 : 0;
    const valuation = operationalValue + cash;

    return { monthlyEbitda, valuation, monthlyInterests };
  }, []);

  const { valuation, monthlyEbitda } = useMemo(() => 
    calculateFinancials(currentPlayer), [currentPlayer, calculateFinancials]
  );

  // --- MOVIMENTO E VIA ---
  const movePlayer = useCallback((steps: number) => {
    const nextPos = (currentPlayer.position + steps) % TILES.length;
    const tile = TILES[nextPos];

    setPlayers(prevPlayers => {
      return prevPlayers.map((p, idx) => {
        if (idx !== currentPlayerIndex) return p;

        let updatedCash = Number(p.cash);
        let updatedLaps = p.laps;
        let updatedDebts = [...p.debts];
        let totalRepaidThisTurn = 0;

        // Gestione Passaggio dal VIA
        if (nextPos < p.position || (p.position !== 0 && nextPos === 0)) {
          updatedLaps += 1;
          updatedCash += 25000; // Bonus giro

          updatedDebts = updatedDebts.map(debt => {
            const annualInterest = debt.principal * debt.interestRate;
            const capitalInstallment = debt.principal / debt.remainingYears;
            
            // La rata (Capitale + Interessi) esce dal Cash
            const yearlyRepayment = capitalInstallment + annualInterest;
            updatedCash -= yearlyRepayment;
            totalRepaidThisTurn += yearlyRepayment;

            return {
              ...debt,
              principal: Math.max(0, debt.principal - capitalInstallment),
              remainingYears: debt.remainingYears - 1
            };
          }).filter(d => d.remainingYears > 0 && d.principal > 0);
        }

        return {
          ...p,
          position: nextPos,
          cash: updatedCash,
          laps: updatedLaps,
          debts: updatedDebts,
          mrr: Math.max(0, p.mrr + (Number(tile.revenueModifier) || 0)),
          monthlyCosts: Math.max(0, p.monthlyCosts + (Number(tile.costModifier) || 0)),
          isBankrupt: updatedCash < -50000 && updatedLaps >= 3,
          lastLoanRepaidAmount: totalRepaidThisTurn > 0 ? totalRepaidThisTurn : undefined
        };
      });
    });
    return tile;
  }, [currentPlayerIndex, currentPlayer.position]);

  // --- EVENTI E FUNDING ---
  const applyEvent = useCallback((event: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex && !event.global) return p;
      
      if (event.cashEffect !== undefined) {
        // OPPORTUNITÀ: Solo Cash
        return { ...p, cash: p.cash + Number(event.cashEffect) };
      } 
      // IMPREVISTI: Solo EBITDA (MRR/Costi)
      return {
        ...p,
        mrr: Math.max(0, p.mrr + (Number(event.revenueModifier) || 0)),
        monthlyCosts: Math.max(0, p.monthlyCosts + (Number(event.costModifier) || 0))
      };
    }));
  }, [currentPlayerIndex]);

  const applyFunding = useCallback((offer: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;

      if (offer.type === 'BANK') {
        const amount = Number(offer.fixedAmount) || 50000;
        const newDebt: Debt = {
          id: `loan-${Date.now()}`,
          principal: amount,
          interestRate: offer.interestRate || 0.08,
          remainingYears: offer.durationYears || 3
        };
        return { ...p, cash: p.cash + amount, debts: [...p.debts, newDebt], hasHadFunding: true };
      }

      if (offer.type === 'EQUITY') {
        const { valuation: currentVal } = calculateFinancials(p);
        const dilution = Number(offer.actualDilution) || 15;
        const cashInjected = (currentVal * dilution) / 100;
        return { ...p, cash: p.cash + cashInjected, equity: Math.max(0, p.equity - dilution), hasHadFunding: true };
      }

      if (offer.type === 'GRANT') {
        return { ...p, cash: p.cash + (Number(offer.fixedAmount) || 25000), hasHadFunding: true };
      }
      return p;
    }));
  }, [currentPlayerIndex, calculateFinancials]);

  const upgradeBadge = useCallback((tileId: number) => {
    const tile = TILES[tileId];
    if (!tile.badges) return false;
    let success = false;
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;
      const asset = p.assets.find(a => a.tileId === tileId);
      const currentLevel = asset ? asset.level : 'none';
      let nextLevel: BadgeLevel = 'none';
      let cost = 0; let revBonus = 0;

      if (currentLevel === 'none') { nextLevel = 'bronze'; cost = tile.badges.bronze.cost; revBonus = tile.badges.bronze.revenueBonus; }
      else if (currentLevel === 'bronze') { nextLevel = 'silver'; cost = tile.badges.silver.cost; revBonus = tile.badges.silver.revenueBonus; }
      else if (currentLevel === 'silver') { nextLevel = 'gold'; cost = tile.badges.gold.cost; revBonus = tile.badges.gold.revenueBonus; }

      if (nextLevel !== 'none' && p.cash >= cost) {
        success = true;
        return {
          ...p, cash: p.cash - cost, mrr: p.mrr + revBonus,
          assets: asset ? p.assets.map(a => a.tileId === tileId ? { ...a, level: nextLevel } : a) : [...p.assets, { tileId, level: nextLevel }]
        };
      }
      return p;
    }));
    return success;
  }, [currentPlayerIndex]);

  const nextTurn = useCallback(() => {
    setCurrentPlayerIndex(prev => (prev + 1) % players.length);
  }, [players.length]);

  const attemptExit = useCallback(() => {
    const { valuation: currentVal } = calculateFinancials(currentPlayer);
    if (currentPlayer.equity > 0 && currentVal >= 1000000) {
      setGameWinner(currentPlayer);
      return true;
    }
    return false;
  }, [currentPlayer, calculateFinancials]);

  return { 
    players, currentPlayer, valuation, monthlyEbitda, 
    movePlayer, applyFunding, upgradeBadge, applyEvent, 
    nextTurn, gameWinner, attemptExit, calculateFinancials 
  };
};
