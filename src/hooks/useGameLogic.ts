'use client'
import { useState, useMemo, useCallback } from 'react';
import { TILES } from '@/data/tiles';
import { PlayerState, BadgeLevel, PlayerAsset } from '@/types/game';

const PLAYER_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

export const useGameLogic = (numberOfPlayers: number) => {
  const [players, setPlayers] = useState<PlayerState[]>(
    Array.from({ length: numberOfPlayers }).map((_, i) => ({
      id: i,
      name: `Founder ${i + 1}`,
      color: PLAYER_COLORS[i],
      cash: 50000,
      mrr: 0,
      monthlyCosts: 0,
      equity: 100,
      position: 0,
      assets: [],
      debts: [],
      totalRaised: 0,
      isBankrupt: false
    }))
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const currentPlayer = players[currentPlayerIndex];

  // Helper Finanziari
  const getPlayerEbitda = (p: PlayerState) => p.mrr - p.monthlyCosts;
  const getPlayerValuation = (p: PlayerState) => {
    const ebitda = getPlayerEbitda(p);
    const annualEbitda = ebitda * 12;
    return annualEbitda > 0 ? annualEbitda * 10 : (p.mrr * 12) * 2;
  };

  const nextTurn = useCallback(() => {
    setCurrentPlayerIndex((prev) => (prev + 1) % numberOfPlayers);
  }, [numberOfPlayers]);

  const movePlayer = useCallback((steps: number) => {
    const nextPos = (currentPlayer.position + steps) % TILES.length;
    const tile = TILES[nextPos];

    setPlayers(prevPlayers => {
      // 1. Identifichiamo il proprietario (se esiste e non è il giocatore corrente)
      const owner = prevPlayers.find(p => 
        p.id !== currentPlayerIndex && 
        p.assets.some(a => a.tileId === nextPos)
      );
      
      const ownerAsset = owner?.assets.find(a => a.tileId === nextPos);
      let tollToPay = 0;

      if (owner && ownerAsset && tile.badges) {
        const level = ownerAsset.level as keyof typeof tile.badges;
        tollToPay = tile.badges[level].toll;
      }

      return prevPlayers.map((p, idx) => {
        // Logica Giocatore Corrente
        if (idx === currentPlayerIndex) {
          let newCash = p.cash - tollToPay;
          let newMrr = p.mrr;
          let newCosts = p.monthlyCosts;

          // Passaggio dallo START (Trimestrale)
          if (nextPos < p.position || nextPos === 0) {
            newCash += (newMrr - newCosts) * 3;
          }

          // EFFETTO BASE AUTOMATICO (Indipendente dai Badge)
          if (tile.type === 'asset' || tile.type === 'tax') {
            newMrr += (tile.revenueModifier || 0);
            newCosts += (tile.costModifier || 0);
          }

          return { ...p, position: nextPos, cash: newCash, mrr: newMrr, monthlyCosts: newCosts };
        }

        // Logica Proprietario (Riceve il pedaggio)
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
      let revBonus = 0;

      if (currentLevel === 'none') {
        nextLevel = 'bronze';
        cost = tile.badges.bronze.cost;
        revBonus = tile.badges.bronze.revenueBonus;
      } else if (currentLevel === 'bronze') {
        nextLevel = 'silver';
        cost = tile.badges.silver.cost;
        revBonus = tile.badges.silver.revenueBonus - tile.badges.bronze.revenueBonus;
      } else if (currentLevel === 'silver') {
        nextLevel = 'gold';
        cost = tile.badges.gold.cost;
        revBonus = tile.badges.gold.revenueBonus - tile.badges.silver.revenueBonus;
      }

      if (nextLevel !== 'none' && p.cash >= cost) {
        return {
          ...p,
          cash: p.cash - cost,
          mrr: p.mrr + revBonus,
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
    ebitda: getPlayerEbitda(currentPlayer),
    valuation: getPlayerValuation(currentPlayer),
    movePlayer,
    upgradeBadge,
    applyEvent,
    nextTurn
  };
};
