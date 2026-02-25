'use client'
import { useState, useMemo, useCallback } from 'react';
import { TILES } from '@/data/tiles';
import { PlayerState, BadgeLevel } from '@/types/game';

// Interfaccia per i dati che arrivano dalla Landing Page
interface InitialPlayer {
  name: string;
  color: string;
}

export const useGameLogic = (initialPlayers: InitialPlayer[]) => {
  // Inizializziamo i giocatori usando i nomi e i colori scelti dall'utente
  const [players, setPlayers] = useState<PlayerState[]>(
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
      isBankrupt: false
    }))
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const currentPlayer = players[currentPlayerIndex];

  // --- FORMULA VALUATION ---
  // (EBITDA * 12 * 10) + Cash
  const calculateValuation = (p: PlayerState) => {
    const ebitda = p.mrr - p.monthlyCosts;
    const annualEbitda = ebitda * 12;
    
    const operationalValue = annualEbitda > 0 
      ? annualEbitda * 10 
      : (p.mrr * 12) * 2;

    return operationalValue + p.cash;
  };

  const ebitda = useMemo(() => currentPlayer.mrr - currentPlayer.monthlyCosts, [currentPlayer]);
  const valuation = useMemo(() => calculateValuation(currentPlayer), [currentPlayer]);

  // Gestione turni basata sulla lunghezza dell'array dinamico
  const nextTurn = useCallback(() => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  }, [players.length]);

  const movePlayer = useCallback((steps: number) => {
    const nextPos = (currentPlayer.position + steps) % TILES.length;
    const tile = TILES[nextPos];

    setPlayers(prevPlayers => {
      // Controllo pedaggio (Toll)
      const owner = prevPlayers.find(p => p.id !== currentPlayerIndex && p.assets.some(a => a.tileId === nextPos));
      const ownerAsset = owner?.assets.find(a => a.tileId === nextPos);
      let tollToPay = 0;

      if (owner && ownerAsset && tile.badges) {
        const level = ownerAsset.level as keyof typeof tile.badges;
        tollToPay = tile.badges[level].toll;
      }

      return prevPlayers.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          let newCash = p.cash - tollToPay;
          let newMrr = p.mrr;
          let newCosts = p.monthlyCosts;

          // Passaggio dal VIA (Quarterly Review)
          if (nextPos < p.position || nextPos === 0) {
            newCash += (newMrr - newCosts) * 3;
          }

          // Effetto Base della Casella (Sempre applicato)
          if (tile.type === 'asset' || tile.type === 'tax') {
            newMrr += (tile.revenueModifier || 0);
            newCosts += (tile.costModifier || 0);
          }

          return { ...p, position: nextPos, cash: newCash, mrr: newMrr, monthlyCosts: newCosts };
        }

        if (owner && idx === owner.id) {
          return { ...p, cash: p.cash + tollToPay };
        }

        return p;
      });
    });

    return tile;
  }, [currentPlayerIndex, currentPlayer.position]);

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
      return {
        ...p,
        cash: p.cash + (event.cashEffect || 0) + (p.cash * (event.cashPercent || 0)),
        mrr: Math.max(0, p.mrr + (event.revenueModifier || 0)),
        monthlyCosts: Math.max(0, p.monthlyCosts + (event.costModifier || 0))
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
    upgradeBadge,
    applyEvent,
    nextTurn
  };
};
