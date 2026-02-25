'use client'
import { useState, useMemo } from 'react';
import { TILES } from '@/data/tiles';
import { PlayerState, BadgeLevel } from '@/types/game';

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

  // Calcoli Finanziari in tempo reale
  const ebitda = useMemo(() => player.mrr - player.monthlyCosts, [player.mrr, player.monthlyCosts]);
  const valuation = useMemo(() => {
    const annualEbitda = ebitda * 12;
    return annualEbitda > 0 ? annualEbitda * 10 : (player.mrr * 12) * 2;
  }, [ebitda, player.mrr]);

  // Gestione del movimento e degli effetti casella
  const handleTileEffect = (position: number) => {
    const tile = TILES[position];
    
    // 1. Applica modificatori base della casella (se è Asset o Tax)
    if (tile.type === 'asset' || tile.type === 'tax') {
      setPlayer(prev => ({
        ...prev,
        mrr: prev.mrr + (tile.revenueModifier || 0),
        monthlyCosts: prev.monthlyCosts + (tile.costModifier || 0)
      }));
    }
    
    // 2. Se è speciale (Opportunità/Imprevisto/Funding), qui attiveremo il Modal
    if (tile.type === 'special' || tile.type === 'funding') {
      console.log("Trigger Evento Random...");
    }
  };

  const movePlayer = (steps: number) => {
    const nextPos = (player.position + steps) % TILES.length;
    setPlayer(prev => ({ ...prev, position: nextPos }));
    handleTileEffect(nextPos);
  };

  const buyBadge = (tileId: number) => {
    const tile = TILES[tileId];
    if (!tile.badges) return;

    const currentAsset = player.assets.find(a => a.tileId === tileId);
    const level: BadgeLevel = currentAsset ? currentAsset.level : 'none';

    // Logica di upgrade (da none -> bronze -> silver -> gold)
    // ... calcolo costi e aggiornamento MRR (lo implementeremo nel dettaglio al prossimo step)
  };

  return { player, ebitda, valuation, movePlayer, buyBadge };
};
