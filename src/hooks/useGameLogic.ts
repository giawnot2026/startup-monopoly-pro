'use client'
import { useState, useMemo, useCallback } from 'react';
import { TILES } from '@/data/tiles';
import { PlayerState, BadgeLevel } from '@/types/game';

interface InitialPlayer {
  name: string;
  color: string;
}

export const useGameLogic = (initialPlayers: InitialPlayer[]) => {
  // 1. Stato Iniziale dei Giocatori
  const [players, setPlayers] = useState<PlayerState[]>(
    initialPlayers.map((p, i) => ({
      id: i,
      name: p.name,
      color: p.color,
      cash: 50000, // Cassa iniziale
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

  // 2. Calcoli Derivati (Valuation ed EBITDA)
  const calculateValuation = (p: PlayerState) => {
    const currentEbitda = p.mrr - p.monthlyCosts;
    const annualEbitda = currentEbitda * 12;
    
    // Valore basato sulle performance + la cassa liquida
    const operationalValue = annualEbitda > 0 
      ? annualEbitda * 10 
      : (p.mrr * 12) * 2;

    return operationalValue + p.cash;
  };

  const ebitda = useMemo(() => currentPlayer.mrr - currentPlayer.monthlyCosts, [currentPlayer]);
  const valuation = useMemo(() => calculateValuation(currentPlayer), [currentPlayer]);

  // 3. Gestione Turni
  const nextTurn = useCallback(() => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  }, [players.length]);

  // 4. Movimento e Logica Caselle (Impatto Cash Diretto)
  const movePlayer = useCallback((steps: number) => {
    const nextPos = (currentPlayer.position + steps) % TILES.length;
    const tile = TILES[nextPos];

    setPlayers(prevPlayers => {
      // Controllo se la casella appartiene a un altro giocatore (Pedaggio)
      const owner = prevPlayers.find(p => p.id !== currentPlayerIndex && p.assets.some(a => a.tileId === nextPos));
      const ownerAsset = owner?.assets.find(a => a.tileId === nextPos);
      let tollToPay = 0;

      if (owner && ownerAsset && tile.badges) {
        const level = ownerAsset.level as keyof typeof tile.badges;
        tollToPay = tile.badges[level].toll;
      }

      return prevPlayers.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          // MODIFICA SEMPLIFICATA: I modificatori della casella colpiscono subito il Cash
          const revMod = tile.revenueModifier || 0;
          const costMod = tile.costModifier || 0;

          return { 
            ...p, 
            position: nextPos, 
            cash: p.cash - tollToPay + revMod - costMod,
            mrr: Math.max(0, p.mrr + revMod),
            monthlyCosts: Math.max(0, p.monthlyCosts + costMod)
          };
        }

        // Se sei il proprietario, ricevi il pedaggio
        if (owner && idx === owner.id) {
          return { ...p, cash: p.cash + tollToPay };
        }

        return p;
      });
    });

    return tile;
  }, [currentPlayerIndex, currentPlayer.position]);

  // 5. Potenziamento Badge (Sottrae Cash)
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

  // 6. Applicazione Eventi (Opportunità/Imprevisti)
  const applyEvent = useCallback((event: any) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;

      const revMod = event.revenueModifier || 0;
      const costMod = event.costModifier || 0;
      const cashEff = event.cashEffect || 0;
      const cashPerc = event.cashPercent ? (p.cash * event.cashPercent) : 0;

      return {
        ...p,
        // L'evento impatta la cassa e le statistiche contemporaneamente
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
    upgradeBadge,
    applyEvent,
    nextTurn
  };
};
