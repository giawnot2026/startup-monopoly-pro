'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGameLogic, ExtendedPlayer } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';
import { OPPORTUNITA } from '@/data/opportunita';
import { IMPREVISTI } from '@/data/imprevisti';
import { FUNDING_OFFERS } from '@/data/funding';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Skull, Home, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function GameBoard({ 
  roomCode, 
  localPlayerName, 
  victoryTarget = 20000000 
}: { 
  roomCode: string, 
  localPlayerName: string, 
  victoryTarget?: number 
}) {
  
  const { 
    players, currentPlayer, valuation, 
    movePlayer, upgradeBadge, applyEvent, applyFunding, nextTurn,
    gameWinner, attemptExit, calculateValuation,
    eliminatedPlayerName, setEliminatedPlayerName,
    setPlayers, setCurrentPlayerIndex, syncFromExternal 
  } = useGameLogic([], victoryTarget);

  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [turnComplete, setTurnComplete] = useState(false); // Nuovo stato per il tasto "Termina Turno"

  const lastSyncRef = useRef<string>("");
  const isInitialLoad = useRef(true);

  const sanitizeGameState = (state: any) => {
    if (!state || !state.players || state.players.length === 0) return null;
    return {
      ...state,
      currentPlayerIndex: Number(state.currentPlayerIndex),
      players: state.players.map((p: any) => ({
        ...p,
        position: Number(p.position) || 0,
        cash: Number(p.cash),
        mrr: Number(p.mrr),
        laps: Number(p.laps) || 0,
        equity: Number(p.equity)
      }))
    };
  };

  // Caricamento Iniziale e Sottoscrizione
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const { data } = await supabase
        .from('multiplayer_games')
        .select('game_state')
        .eq('room_code', roomCode)
        .maybeSingle();

      const initialState = sanitizeGameState(data?.game_state);
      if (initialState && isInitialLoad.current) {
        setPlayers(initialState.players);
        setCurrentPlayerIndex(initialState.currentPlayerIndex);
        if (initialState.lastDiceValue) setDiceValue(initialState.lastDiceValue);
        lastSyncRef.current = JSON.stringify(initialState);
        isInitialLoad.current = false;
      }

      const channel = supabase
        .channel(`room-${roomCode}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'multiplayer_games',
          filter: `room_code=eq.${roomCode}`
        }, (payload) => {
          if (isSyncing || isRolling) return;

          const newState = sanitizeGameState(payload.new.game_state);
          if (!newState) return;
          
          const stateStr = JSON.stringify(newState);
          if (stateStr === lastSyncRef.current) return;

          // PROTEZIONE: Se il DB manda meno giocatori di quelli che ho, ignoro (pacchetto corrotto)
          if (players.length > 0 && newState.players.length < players.length) return;

          const pIndex = newState.currentPlayerIndex;
          const isMyTurnNow = newState.players[pIndex]?.name === localPlayerName;
          
          // Aggiorno lo stato se non è il mio turno o se i dati sono diversi
          if (!isMyTurnNow || newState.currentPlayerIndex !== players.indexOf(currentPlayer)) {
            setPlayers(newState.players);
            setCurrentPlayerIndex(newState.currentPlayerIndex);
            if (newState.lastDiceValue !== undefined) setDiceValue(newState.lastDiceValue);
            lastSyncRef.current = stateStr;
            setTurnComplete(false); // Resetta il tasto per il nuovo turno
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    fetchAndSubscribe();
  }, [roomCode, localPlayerName, isSyncing, isRolling, players.length, currentPlayer]); 

  // Funzione di Sincronizzazione Atomica
  const syncGameState = useCallback(async (updatedPlayers: any[], nextIndex: number, currentDice?: number, eventType: string = 'MOVE') => {
    if (!updatedPlayers || updatedPlayers.length === 0) return;

    setIsSyncing(true);
    const newState = { 
      players: updatedPlayers, 
      currentPlayerIndex: nextIndex,
      lastDiceValue: currentDice ?? diceValue,
      victoryTarget: victoryTarget,
      lastUpdate: Date.now()
    };
    
    const stateStr = JSON.stringify(newState);
    lastSyncRef.current = stateStr;

    // 1. Aggiorna lo stato principale
    await supabase
      .from('multiplayer_games')
      .update({ game_state: newState })
      .eq('room_code', roomCode);

    // 2. Storicizza l'evento nella nuova tabella
    await supabase
      .from('game_events')
      .insert({
        room_code: roomCode,
        player_id: players.indexOf(currentPlayer),
        event_type: eventType,
        payload: { dice: currentDice, nextIndex }
      });
    
    setTimeout(() => setIsSyncing(false), 500);
  }, [roomCode, victoryTarget, diceValue, players, currentPlayer]);

  // Gestione Fine Turno Esplicita
  const handleEndTurn = useCallback(() => {
    const nextIdx = (players.indexOf(currentPlayer) + 1) % players.length;
    // Salta i giocatori in bancarotta
    let finalNextIdx = nextIdx;
    let attempts = 0;
    while (players[finalNextIdx]?.isBankrupt && attempts < players.length) {
      finalNextIdx = (finalNextIdx + 1) % players.length;
      attempts++;
    }

    syncGameState(players, finalNextIdx, diceValue || 0, 'TURN_NEXT');
    nextTurn();
    setTurnComplete(false);
  }, [players, currentPlayer, diceValue, syncGameState, nextTurn]);

  const handleCloseModal = useCallback(() => {
    setModalConfig({ isOpen: false });
    // Invece di passare il turno qui, abilitiamo il tasto "Termina Turno"
    setTurnComplete(true);
    // Sincronizziamo lo stato attuale degli asset/soldi prima di chiudere
    syncGameState(players, players.indexOf(currentPlayer), diceValue || 0, 'ACTION_COMPLETE');
  }, [players, currentPlayer, diceValue, syncGameState]);

  const handleDiceRoll = () => {
    if (!currentPlayer || currentPlayer.name !== localPlayerName) return;
    if (modalConfig.isOpen || isRolling || isSyncing || currentPlayer.isBankrupt || turnComplete) return;

    setIsRolling(true);
    let counter = 0;
    const shuffleInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      if (++counter >= 12) {
        clearInterval(shuffleInterval);
        const steps = Math.floor(Math.random() * 6) + 1;
        setDiceValue(steps);
        
        setTimeout(() => {
          const { tile, updatedPlayers } = movePlayer(steps);
          setIsRolling(false);
          setPlayers([...updatedPlayers]);
          
          // Sincronizza il movimento ma mantieni il turno attivo
          syncGameState(updatedPlayers, players.indexOf(currentPlayer), steps, 'MOVE');
          processTile(tile, updatedPlayers);
        }, 600);
      }
    }, 60);
  };

  const processTile = (tile: any, currentPlayers: any[]) => {
    if (!tile) { 
      setTurnComplete(true);
      return; 
    }
    const corners = [0, 7, 14, 21];
    if (corners.includes(tile.id)) { handleCornerTile(tile); return; }
    
    if (tile.id === 27) {
      const currentVal = calculateValuation(currentPlayer);
      const founderExitValue = (currentVal * (currentPlayer.equity || 100)) / 100;
      const canExit = founderExitValue >= victoryTarget && currentPlayer.equity > 0;

      setModalConfig({
        isOpen: true, 
        type: canExit ? 'success' : 'danger',
        title: "Tavolo delle Trattative Exit",
        description: canExit 
          ? `Complimenti! La tua quota del ${currentPlayer.equity.toFixed(1)}% vale €${founderExitValue.toLocaleString()}, superando il tuo obiettivo personale di €${victoryTarget.toLocaleString()}.` 
          : `Non puoi ancora vendere. La tua quota vale €${founderExitValue.toLocaleString()}, ma il tuo obiettivo di incasso personale è €${victoryTarget.toLocaleString()}.`,
        impact: { 
          details: `Valutazione Aziendale: €${currentVal.toLocaleString()} | Tua Quota (${currentPlayer.equity.toFixed(1)}%): €${founderExitValue.toLocaleString()}` 
        },
        actionLabel: canExit ? "Vendi e Vinci" : "Rifiuta e continua",
        onAction: () => { if(canExit) attemptExit(); handleCloseModal(); },
        onClose: handleCloseModal
      });
      return;
    }

    if (tile.type === 'special') {
      const isOpp = tile.name?.toLowerCase().includes("probabilità") || [3, 15, 22].includes(tile.id);
      const deck = isOpp ? OPPORTUNITA : IMPREVISTI;
      const event = deck[Math.floor(Math.random() * deck.length)];
      const impactDetails = [];
      if (event.cashEffect) impactDetails.push(`${event.cashEffect > 0 ? '+' : ''}€${event.cashEffect.toLocaleString()} Cash`);
      if (event.revenueModifier) impactDetails.push(`${event.revenueModifier > 0 ? '+' : ''}€${event.revenueModifier.toLocaleString()} MRR`);
      if (event.costModifier) impactDetails.push(`${event.costModifier > 0 ? '+' : ''}€${event.costModifier.toLocaleString()} Costi`);

      setModalConfig({ 
        isOpen: true, 
        type: isOpp ? 'opportunity' : 'danger_event', 
        title: event.title, 
        description: event.effect || "Evento di mercato",
        insight: event.insight,
        impact: { details: impactDetails.join(' | ') || "Variazione assetto societario" },
        actionLabel: "Ricevuto", 
        onAction: () => { applyEvent(event); handleCloseModal(); } 
      });
      return;
    }

    if (tile.type === 'asset') {
      const owner = currentPlayers.find(p => p && !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
      const myAsset = currentPlayer.assets.find(a => a.tileId === tile.id);
      const currentLevel = myAsset ? myAsset.level : 'none';
      const revMod = tile.revenueModifier || 0;
      const costMod = tile.costModifier || 0;
      const immediateImpact = `Impatto Casella: MRR ${revMod >= 0 ? '+' : ''}${revMod.toLocaleString()} | Costi ${costMod >= 0 ? '+' : ''}${costMod.toLocaleString()}`;

      if (owner) {
        const level = owner.assets.find(a => a.tileId === tile.id)?.level || 'none';
        const toll = Number(tile.badges?.[level]?.toll) || 0;
        setModalConfig({ 
          isOpen: true, type: 'danger', title: "Tassa di Mercato", 
          description: `Sei atterrato su un asset di ${owner.name}.`,
          insight: tile.insight,
          impact: { details: `${immediateImpact} | Royalty pagata (MRR): -€${toll.toLocaleString()}` }, 
          actionLabel: "Prosegui", onAction: handleCloseModal
        });
      } else {
        const badgesInfo = {
          currentLevel: currentLevel,
          bronze: { ...tile.badges.bronze, owned: ['bronze', 'silver', 'gold'].includes(currentLevel) },
          silver: { ...tile.badges.silver, owned: ['silver', 'gold'].includes(currentLevel) },
          gold: { ...tile.badges.gold, owned: currentLevel === 'gold' }
        };
        const levelsData = [{ id: 'bronze', label: 'Bronzo' }, { id: 'silver', label: 'Argento' }, { id: 'gold', label: 'Oro' }];
        const nextLevelIndex = currentLevel === 'none' ? 0 : currentLevel === 'bronze' ? 1 : currentLevel === 'silver' ? 2 : 3;
        const nextLevelLabel = levelsData[nextLevelIndex]?.label || '';
        const nextLevelToll = nextLevelIndex < 3 ? tile.badges[levelsData[nextLevelIndex].id].toll : 0;

        setModalConfig({
          isOpen: true, type: 'success', title: tile.name,
          description: tile.badgeCta || "Sblocca i Badge per riscuotere royalty (MRR) dai competitor.",
          insight: tile.insight, badges: badgesInfo,
          impact: { details: `${immediateImpact} | ${nextLevelIndex < 3 ? `Royalty futura: €${nextLevelToll.toLocaleString()}` : "Livello Massimo"}` },
          actionLabel: nextLevelIndex > 2 ? "Massimo Livello" : `Acquista ${nextLevelLabel}`,
          secondaryActionLabel: nextLevelIndex <= 2 ? "Rifiuta" : null,
          onAction: () => { upgradeBadge(tile.id); handleCloseModal(); },
          onClose: handleCloseModal
        });
      }
      return;
    }

    if (tile.type === 'tax') {
      const revMod = tile.revenueModifier || 0;
      const costMod = tile.costModifier || 0;
      setModalConfig({
        isOpen: true, type: 'danger', title: tile.name, 
        description: "Variazione automatica dei flussi operativi.",
        impact: { details: `MRR: ${revMod >= 0 ? '+' : ''}${revMod.toLocaleString()} | Costi: ${costMod >= 0 ? '+' : ''}${costMod.toLocaleString()}` },
        actionLabel: "Ricevuto", onAction: handleCloseModal 
      });
      return;
    }
    
    setTurnComplete(true);
  };

  const handleCornerTile = (tile: any) => {
    switch (tile.id) {
      case 0:
        const totalDebtAmount = (currentPlayer.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
        setModalConfig({
          isOpen: true, type: 'info', title: totalDebtAmount > 0 ? "Chiusura Anno Fiscale" : "Revisione dei Bilanci",
          description: totalDebtAmount > 0 
            ? "Rendicontazione annuale completata. Pagate quote capitale e interessi del debito."
            : "L'anno fiscale si chiude in assenza di debiti finanziari. Audit superato con successo.",
          impact: { details: totalDebtAmount > 0 ? "Ammortamento debito eseguito" : "Nessun onere finanziario" },
          actionLabel: "Continua", onAction: handleCloseModal
        });
        break;
      case 7:
      case 14:
      case 21:
        const currentVal = calculateValuation(currentPlayer);
        const isValuable = currentVal > 120000;
        const availableOffers = FUNDING_OFFERS.filter(o => o.type === 'EQUITY' ? (isValuable && currentPlayer.laps > 0) : true);
        const offer = { ...availableOffers[Math.floor(Math.random() * availableOffers.length)] };
        setModalConfig({
          isOpen: true, type: 'info', title: `Round: ${offer.investor}`, 
          description: offer.description, impact: { details: "Analisi offerta finanziaria" },
          actionLabel: "Accetta", secondaryActionLabel: "Rifiuta",
          onAction: () => { applyFunding(offer); handleCloseModal(); },
          onClose: handleCloseModal
        });
        break;
    }
  };

  if (!players || players.length === 0 || !currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-mono uppercase tracking-widest">
        Caricamento Startup...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen items-start bg-slate-950 font-sans text-white relative">
      
      {/* SEZIONE VINCITORE (Invariata) */}
      <AnimatePresence>
        {gameWinner && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[300] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
             {/* ... contenuto modal vittoria identico al tuo ... */}
             <div className="text-center">
                <Trophy size={60} className="text-yellow-400 mx-auto mb-4" />
                <h2 className="text-4xl font-black mb-8 italic uppercase">Vittoria Epica per {gameWinner.name}!</h2>
                <button onClick={() => window.location.reload()} className="px-10 py-4 bg-blue-600 rounded-2xl font-black uppercase">Nuova Scalata</button>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full lg:w-[800px] aspect-square bg-slate-900 p-4 border border-blue-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="absolute inset-[25%] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[3rem] z-20 p-6 text-center">
          <div className="absolute top-4 text-[7px] text-slate-600 font-mono uppercase tracking-[0.3em]">Room: {roomCode}</div>
          
          <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
            <span className="text-white font-black text-[9px] uppercase tracking-widest font-mono">
              {currentPlayer.name === localPlayerName ? "È IL TUO TURNO" : `TURNO DI ${currentPlayer.name}`}
            </span>
          </div>
          
          <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-2xl border-2 transition-all ${isRolling ? 'scale-110 border-blue-500 rotate-12' : 'border-white/10'} bg-slate-800 text-white text-3xl font-black font-mono`}>
            {diceValue || '?'}
          </div>
          
          <div className="text-2xl font-black text-white italic mb-1 tracking-tighter font-mono">€{(Number(valuation) || 0).toLocaleString()}</div>
          <span className="text-blue-400 font-mono text-[7px] uppercase tracking-widest opacity-60 mb-6 block">Company Valuation</span>
          
          <div className="flex flex-col gap-2 w-full px-4">
            <button 
                onClick={handleDiceRoll} 
                disabled={isRolling || isSyncing || modalConfig.isOpen || currentPlayer.isBankrupt || currentPlayer.name !== localPlayerName || turnComplete} 
                className={`w-full py-3 font-black rounded-xl text-white text-[10px] font-mono transition-all
                ${currentPlayer.name === localPlayerName && !turnComplete
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
            >
                {isRolling ? "Lancio..." : "Lancia Dadi"}
            </button>

            {/* TASTO TERMINA TURNO - Fondamentale per la sincronizzazione */}
            {currentPlayer.name === localPlayerName && turnComplete && (
                <button 
                onClick={handleEndTurn}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] font-mono shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 animate-bounce"
                >
                <CheckCircle2 size={14} /> Termina Turno
                </button>
            )}
          </div>
        </div>

        {/* TABELLONE (Invariato) */}
        <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full font-mono">
          {TILES.map((tile) => {
            let row, col;
            if (tile.id <= 7) { row = 1; col = tile.id + 1; }
            else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
            else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
            else { col = 1; row = 8 - (tile.id - 21); }
            const playersHere = players.filter(p => p && Number(p.position) === tile.id && !p.isBankrupt);
            const tileOwner = players.find(p => p && p.assets.some(a => a.tileId === tile.id));
            return (
              <div key={tile.id} style={{ gridRow: row, gridColumn: col }} className="relative h-full w-full">
                <Tile {...tile} isActive={playersHere.length > 0} ownerBadge={tileOwner?.assets.find(a => a.tileId === tile.id)?.level || 'none'} ownerColor={tileOwner?.color || 'transparent'} />
                <div className="absolute bottom-1 left-1 flex gap-0.5 z-30">
                  {playersHere.map(p => <div key={p.id} className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.color }} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD LATERALE (Invariata) */}
      <div className="w-full lg:w-[350px] space-y-3 font-mono">
        <h3 className="text-blue-400 font-black tracking-widest uppercase text-[10px] mb-2 px-2 italic">Dashboard {localPlayerName}</h3>
        {players.map((p) => {
          if (!p) return null;
          const isTurn = p.id === currentPlayer.id;
          const isMe = p.name === localPlayerName;
          const currentEbitda = (Number(p.mrr) || 0) - (Number(p.monthlyCosts) || 0);
          const pVal = calculateValuation(p) || 0;
          return (
            <div key={p.id} className={`p-4 rounded-2xl border transition-all duration-500 ${isTurn ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-900/50 border-white/5 opacity-80'}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white uppercase">{p.name} {isMe && "(TU)"}</span>
                    <span className="text-[10px] text-blue-400 font-black">{p.equity.toFixed(1)}% EQ</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-black/40 p-2 rounded">CASH: €{Math.floor(p.cash).toLocaleString()}</div>
                    <div className="bg-black/40 p-2 rounded">EBITDA: €{currentEbitda.toLocaleString()}</div>
                </div>
            </div>
          );
        })}
      </div>
      
      <ActionModal {...modalConfig} currentPlayerCash={currentPlayer?.cash || 0} />

      {/* MODAL ELIMINAZIONE (Invariato) */}
      <AnimatePresence>
        {eliminatedPlayerName && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-red-950 border-2 border-red-500 p-8 rounded-[2.5rem] max-w-sm text-center">
              <Skull size={40} className="text-white mx-auto mb-4" />
              <h2 className="text-xl text-white font-bold mb-4 uppercase">{eliminatedPlayerName} Eliminato</h2>
              <button onClick={() => setEliminatedPlayerName(null)} className="w-full bg-red-600 py-4 rounded-2xl uppercase">Continua</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[100]">
        <button onClick={() => window.location.href = '/'} className="group flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-blue-500/50 p-2 pr-5 rounded-full transition-all">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600"><Home size={18} /></div>
          <span className="text-[10px] font-black text-white uppercase">Home</span>
        </button>
      </div>
    </div>
  );
}
