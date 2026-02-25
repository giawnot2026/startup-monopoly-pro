'use client'
import { useState, useMemo, useCallback } from 'react';
import { TILES } from '@/data/tiles';
import { PlayerState, PlayerAsset, BadgeLevel } from '@/types/game';

export const useGameLogic = () => {
  const [player, setPlayer] = useState<PlayerState>({
    id: 1,
    name: "Founder 1",
    color: "#3b82f6",
    cash: 50000,
    mrr: 0,
    monthlyCosts: 0,
    equity: 100,
    position: 0,
    assets: [],
    totalRaised: 0
  });

  // --- LOGICA FINANZIARIA ---
  const ebitda = useMemo(() => player.mrr - player.monthlyCosts, [player.mrr, player.monthlyCosts]);
  
  const valuation = useMemo(() => {
    const annualEbitda = ebitda * 12;
    // Multiplo 10x se EBITDA positivo, altrimenti 2x Revenue annuali
    return annualEbitda > 0 ? annualEbitda * 10 : (player.mrr * 12) * 2;
  }, [ebitda, player.mrr]);

  // --- AZIONI CORE ---

  // Upgrade Badge: gestisce l'acquisto e il potenziamento dei livelli
  const upgradeBadge = useCallback((tileId: number) => {
    const tile = TILES[tileId];
    if (!tile.badges) return { success: false, reason: "Nessun badge disponibile" };

    const existingAsset = player.assets.find(a => a.tileId === tileId);
    const currentLevel = existingAsset ? existingAsset.level : 'none';

    let nextLevel: BadgeLevel;
    let cost: number;
    let revenueBonus: number;

    if (currentLevel === 'none') {
      nextLevel = 'bronze';
      cost = tile.badges.bronze.cost;
      revenueBonus = tile.badges.bronze.revenueBonus;
    } else if (currentLevel === 'bronze') {
      nextLevel = 'silver';
      cost = tile.badges.silver.cost;
      revenueBonus = tile.badges.silver.revenueBonus - tile.badges.bronze.revenueBonus;
    } else if (currentLevel === 'silver') {
      nextLevel = 'gold';
      cost = tile.badges.gold.cost;
      revenueBonus = tile.badges.gold.revenueBonus - tile.badges.silver.revenueBonus;
    } else {
      return { success: false, reason: "Livello massimo raggiunto" };
    }

    if (player.cash < cost) return { success: false, reason: "Cash insufficiente" };

    setPlayer(prev => ({
      ...prev,
      cash: prev.cash - cost,
      mrr: prev.mrr + revenueBonus,
      assets: existingAsset 
        ? prev.assets.map(a => a.tileId === tileId ? { ...a, level: nextLevel } : a)
        : [...prev.assets, { tileId, level: nextLevel }]
    }));

    return { success: true, nextLevel };
  }, [player]);

  // Muove il giocatore e applica gli effetti della casella
  const movePlayer = useCallback((steps: number) => {
    let landedTile: any;

    setPlayer(prev => {
      const nextPos = (prev.position + steps) % TILES.length;
      landedTile = TILES[nextPos];

      let newMrr = prev.mrr;
      let newCosts = prev.monthlyCosts;
      let newCash = prev.cash;

      // Logica "Passaggio dal Via" (Quarterly Review)
      if (nextPos < prev.position || nextPos === 0) {
        const quarterlyProfit = (newMrr - newCosts) * 3;
        newCash += quarterlyProfit;
      }

      // Effetto base automatico della casella (Asset o Tax)
      if (landedTile.type === 'asset' || landedTile.type === 'tax') {
        newMrr += (landedTile.revenueModifier || 0);
        newCosts += (landedTile.costModifier || 0);
      }

      return {
        ...prev,
        position: nextPos,
        mrr: newMrr,
        monthlyCosts: newCosts,
        cash: newCash
      };
    });

    return TILES[(player.position + steps) % TILES.length];
  }, [player.position]);

  return {
    player,
    ebitda,
    valuation,
    movePlayer,
    upgradeBadge,
    setPlayer
  };
};
