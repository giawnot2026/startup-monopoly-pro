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

export const useGameLogic = (initialPlayers: InitialPlayer[], victoryTarget: number = 20000000) => {
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
  const [eliminatedPlayerName, setEliminatedPlayerName] = useState<string | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  // FUNZIONE AGGIUNTA PER SINCRONIZZAZIONE ESTERNA
  const syncFromExternal = useCallback((externalPlayers: ExtendedPlayer[], nextIndex: number) => {
    if (!externalPlayers || externalPlayers.length === 0) return;
    setPlayers(externalPlayers);
    setCurrentPlayerIndex(nextIndex);
  }, []);

  const calculateValuation = useCallback((p: ExtendedPlayer) => {
    if (!p) return 0;
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
    const activePlayers = updatedPlayers.filter(p => p && !p.isBankrupt);
    if (activePlayers.length === 1 && updatedPlayers.length > 1) {
      setGameWinner(activePlayers[0]);
    }
  }, []);

  const nextTurn = useCallback(() => {
    // 1. Creiamo una copia dello stato attuale per calcolare il prossimo giocatore
    let updatedPlayersState = [...players];
    const p = updatedPlayersState[currentPlayerIndex];
    if (!p) return;

    const ebitda = (Number(p.mrr) || 0) - (Number(p.monthlyCosts) || 0);

    // 2. Gestione Bancarotta: se il giocatore è in rosso profondo, lo eliminiamo
    if (p.cash < 0 && (p.cash + ebitda) < 0 && !p.isBankrupt) {
      setEliminatedPlayerName(p.name);
      updatedPlayersState = updatedPlayersState.map((player, idx) =>
        idx === currentPlayerIndex 
          ? { ...player, isBankrupt: true, cash: 0, mrr: 0, assets: [], lastLoanRepaidAmount: undefined } 
          : player
      );
      // Aggiorniamo lo stato dei giocatori
      setPlayers(updatedPlayersState);
      checkGameStatus(updatedPlayersState);
    } else {
      // Se non è fallito, puliamo solo i metadati del prestito
      updatedPlayersState = updatedPlayersState.map((player, idx) =>
        idx === currentPlayerIndex ? { ...player, lastLoanRepaidAmount: undefined } : player
      );
      setPlayers(updatedPlayersState);
    }

    // 3. LOGICA DI SALTO: Trova il prossimo giocatore attivo
    // Usiamo updatedPlayersState per essere sicuri di vedere se qualcuno è appena fallito
    let nextIndex = (currentPlayerIndex + 1) % updatedPlayersState.length;
    let attempts = 0;

    // Continua a cercare finché non trovi un giocatore non fallito
    while (updatedPlayersState[nextIndex]?.isBankrupt && attempts < updatedPlayersState.length) {
      nextIndex = (nextIndex + 1) % updatedPlayersState.length;
      attempts++;
    }

    // 4. Aggiorniamo l'indice del turno
    setCurrentPlayerIndex(nextIndex);

    console.log(`Turno passato da ${currentPlayerIndex} a ${nextIndex}. Tentativi salto: ${attempts}`);
  }, [players, currentPlayerIndex, checkGameStatus]);

// Da inserire prima di const movePlayer = useCallback...
const getCategoryMultiplier = (owner: ExtendedPlayer, category: string) => {
  // Trova tutte le caselle della stessa categoria (escludendo quelle speciali)
  const categoryTiles = TILES.filter(t => t.category === category && t.badges);
  if (categoryTiles.length === 0) return 1;

  // Filtra gli asset che il proprietario possiede in questa categoria
  const ownedInCategory = owner.assets.filter(asset => 
    categoryTiles.some(t => t.id === asset.tileId)
  );

  // Se non possiede l'intero set della categoria, il moltiplicatore è 1
  if (ownedInCategory.length !== categoryTiles.length) return 1;

  // Determina il livello minimo di badge nel set per assegnare il moltiplicatore
  const levels = ownedInCategory.map(a => a.level);
  
  if (levels.every(l => l === 'gold')) return 5;
  if (levels.every(l => l === 'silver' || l === 'gold')) return 3;
  if (levels.every(l => l === 'bronze' || l === 'silver' || l === 'gold')) return 2;
  
  return 1;
};
  
  const movePlayer = useCallback((steps: number) => {
    if (!currentPlayer) return { tile: null, updatedPlayers: players };
    
    const currentPos = Number(currentPlayer.position) || 0;
    const nextPos = (currentPos + steps) % TILES.length;
    const tile = TILES[nextPos];

    const owner = players.find(p => p && !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => a.tileId === nextPos));
    const ownerAsset = owner?.assets.find(a => a.tileId === nextPos);
    let tollToPay = 0;

      if (owner && ownerAsset && tile.badges) {
      const level = ownerAsset.level as keyof typeof tile.badges;
      // 1. Prendiamo il pedaggio base
      const baseToll = Number(tile.badges[level]?.toll) || 0;
      
      // 2. Calcoliamo il moltiplicatore di categoria
      const multiplier = getCategoryMultiplier(owner, tile.category);
      
      // 3. Applichiamo il moltiplicatore al pedaggio finale
      tollToPay = baseToll * multiplier;

      if (multiplier > 1) {
        console.log(`Vantaggio competitivo x${multiplier} applicato per la categoria ${tile.category}`);
      }   
    }

    const newState = players.map((p, idx) => {
      if (idx === currentPlayerIndex) {
        let updatedMrr = Math.max(0, Number(p.mrr) - tollToPay);
        let updatedCash = Number(p.cash);
        let updatedLaps = Number(p.laps) || 0;
        let totalRepaidThisTurn = 0;
        let updatedDebts = [...p.debts];
        let newMonthlyCosts = Number(p.monthlyCosts);

        if (nextPos < currentPos || (currentPos !== 0 && nextPos === 0)) {
          updatedLaps += 1;
          updatedDebts = updatedDebts.map(debt => {
            const annualInterest = Math.round(Number(debt.amount) * Number(debt.interestRate));
            const capitalRepayment = Number(debt.capitalInstallment);
            updatedCash -= capitalRepayment;
            totalRepaidThisTurn += capitalRepayment;
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
          lastLoanRepaidAmount: totalRepaidThisTurn > 0 ? totalRepaidThisTurn : undefined
        };
      }
      if (owner && idx === owner.id) return { ...p, mrr: Number(p.mrr) + tollToPay };
      return p;
    });

    setPlayers(newState);
    return { tile, updatedPlayers: newState };
  }, [currentPlayerIndex, currentPlayer, players]);

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
      if (!p || (idx !== currentPlayerIndex && !event.global)) return p;
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
    if (!currentPlayer) return false;
    const currentVal = calculateValuation(currentPlayer);
    const founderExitValue = (currentVal * currentPlayer.equity) / 100;

    if (currentPlayer.equity > 0 && founderExitValue >= victoryTarget) {
      setGameWinner(currentPlayer);
      return true;
    }
    return false;
  }, [currentPlayer, calculateValuation, victoryTarget]);

  return { 
    players, currentPlayer, valuation, movePlayer, applyFunding, 
    upgradeBadge, applyEvent, nextTurn, gameWinner, attemptExit, 
    calculateValuation, eliminatedPlayerName, setEliminatedPlayerName,
    setPlayers, setCurrentPlayerIndex, syncFromExternal
  };
};
