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
  annualRate: number; // La rata da pagare ogni giro
}

// Estendiamo il PlayerState con i nuovi campi necessari
export interface ExtendedPlayer extends PlayerState {
  debts: Debt[];
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
      debts: []
    }))
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const currentPlayer = players[currentPlayerIndex];

  // Calcolo della valutazione aziendale
  const calculateValuation = (p: ExtendedPlayer) => {
    const ebitda = p.mrr - p.monthlyCosts;
    const annualEbitda = ebitda * 12;
    const operationalValue = annualEbitda > 0 ? annualEbitda * 10 : (p.mrr * 12) * 2;
    return operationalValue + p.cash;
  };

  const ebitda = useMemo(() => currentPlayer.mrr - currentPlayer.monthlyCosts, [currentPlayer]);
  const valuation = useMemo(() => calculateValuation(currentPlayer), [currentPlayer]);

  const nextTurn = useCallback(() => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  }, [players.length]);

  const movePlayer = useCallback((steps: number) => {
    const nextPos = (currentPlayer.position + steps) % TILES.length;
    const tile = TILES[nextPos];

    setPlayers(prevPlayers => {
      // Pedaggi (Toll)
      const owner = prevPlayers.find(p => p.id !== currentPlayerIndex && p.assets.some(a => a.tileId === nextPos));
      const ownerAsset = owner?.assets.find(a => a.tileId === nextPos);
      let tollToPay = 0;

      if (owner && ownerAsset && tile.badges) {
        const level = ownerAsset.level as keyof typeof tile.badges;
        tollToPay = tile.badges[level].toll;
      }

      return prevPlayers.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          let updatedCash = p.cash - tollToPay;
          let updatedDebts = [...p.debts];

          // --- LOGICA PASSAGGIO DAL VIA (PAGAMENTO DEBITI) ---
          // Ogni giro completo = 1 anno. Paghiamo le rate dei prestiti.
          if (nextPos < p.position || nextPos === 0) {
            p.debts.forEach(debt => {
              updatedCash -= debt.annualRate;
            });

            // Scaliamo un anno dai debiti e rimuoviamo quelli estinti
            updatedDebts = p.debts
              .map(d => ({ ...d, remainingYears: d.remainingYears - 1 }))
              .filter(d => d.remainingYears > 0);
          }

          // Effetto immediato casella
          const revMod = tile.revenueModifier || 0;
          const costMod = tile.costModifier || 0;

          return { 
            ...p, 
            position: nextPos, 
            cash: updatedCash + revMod - costMod,
            mrr: Math.max(0, p.mrr + revMod),
            monthlyCosts: Math.max(0, p.monthlyCosts + costMod),
            debts: updatedDebts
          };
        }

        // Accredito pedaggio
        if (owner && idx === owner.id) {
          return { ...p, cash: p.cash + tollToPay };
        }

        return p;
      });
    });

    return tile;
  }, [currentPlayerIndex, currentPlayer.position]);

  const applyFunding = useCallback((offer: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;

      // 1. GRANT (Fondo perduto)
      if (offer.type === 'GRANT') {
        return { ...p, cash: p.cash + offer.fixedAmount };
      }

      // 2. EQUITY (Diluizione)
      if (offer.type === 'EQUITY') {
        const equityToGive = (offer.equityRange.min + offer.equityRange.max) / 2;
        const currentVal = calculateValuation(p);
        const cashReceived = (currentVal * equityToGive) / 100;
        
        return { 
          ...p, 
          cash: p.cash + cashReceived, 
          equity: Math.max(0, p.equity - equityToGive),
          totalRaised: p.totalRaised + cashReceived 
        };
      }

      // 3. BANK (Debito)
      if (offer.type === 'BANK') {
        // Il prestito è parametrato sulla solidità (Valuation) - es. 15% della valuation
        const loanAmount = calculateValuation(p) * 0.15;
        const totalToPay = loanAmount * (1 + offer.interestRate);
        const annualRate = totalToPay / offer.durationYears;

        return {
          ...p,
          cash: p.cash + loanAmount,
          debts: [...p.debts, {
            amount: loanAmount,
            interestRate: offer.interestRate,
            remainingYears: offer.durationYears,
            annualRate: annualRate
          }]
        };
      }

      return p;
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
          assets: asset 
            ? p.assets.map(a => a.tileId === tileId ? { ...a, level: nextLevel } : a)
            : [...p.assets, { tileId, level: nextLevel }]
        };
      }
      return p;
    }));
  }, [currentPlayerIndex]);

  const applyEvent = useCallback((event: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;
      const revMod = event.revenueModifier || 0;
      const costMod = event.costModifier || 0;
      const cashEff = event.cashEffect || 0;
      const cashPerc = event.cashPercent ? (p.cash * event.cashPercent) : 0;

      return {
        ...p,
        cash: p.cash + cashEff + cashPerc + revMod - costMod,
        mrr: Math.max(0, p.mrr + revMod),
        monthlyCosts: Math.max(0, p.monthlyCosts + costMod)
      };
    }));
  }, [currentPlayerIndex]);

  return {
    players,
    currentPlayerIndex,
    currentPlayer,
    ebitda,
    valuation,
    movePlayer,
    applyFunding,
    upgradeBadge,
    applyEvent,
    nextTurn
  };
};
