'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';
import { OPPORTUNITA } from '@/data/opportunita';
import { IMPREVISTI } from '@/data/imprevisti';
import { FUNDING_OFFERS } from '@/data/funding';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Skull, Home } from 'lucide-react';
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
    setPlayers, setCurrentPlayerIndex 
  } = useGameLogic([], victoryTarget);

  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const lastSyncRef = useRef<string>("");
  const lastUpdateIdRef = useRef<number>(0);

  const sanitizeGameState = (state: any) => {
    if (!state || !state.players) return null;
    return {
      ...state,
      currentPlayerIndex: Number(state.currentPlayerIndex),
      updateId: Number(state.updateId) || 0,
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

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const { data } = await supabase
        .from('multiplayer_games')
        .select('game_state')
        .eq('room_code', roomCode)
        .maybeSingle();

      const initialState = sanitizeGameState(data?.game_state);
      if (initialState) {
        setPlayers(initialState.players);
        setCurrentPlayerIndex(initialState.currentPlayerIndex);
        if (initialState.lastDiceValue) setDiceValue(initialState.lastDiceValue);
        lastSyncRef.current = JSON.stringify(initialState);
      }

      const channel = supabase
        .channel(`room-${roomCode}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'multiplayer_games',
          filter: `room_code=eq.${roomCode}`
        }, (payload) => {
          const newState = sanitizeGameState(payload.new.game_state);
          if (!newState) return;

          // Filtro ID aggiornamento
          if (newState.updateId === lastUpdateIdRef.current) return;

          // MODIFICA: Aggiorniamo sempre se il numero di giocatori è cambiato (nuovo ingresso)
          const playersCountChanged = newState.players.length !== players.length;

          if (playersCountChanged || (!isSyncing && !isRolling)) {
            const stateStr = JSON.stringify(newState);
            if (stateStr === lastSyncRef.current) return;

            const pIndex = newState.currentPlayerIndex;
            const isMyTurnNow = newState.players[pIndex]?.name === localPlayerName;
            
            if (!isMyTurnNow || newState.currentPlayerIndex !== players.indexOf(currentPlayer)) {
              setPlayers(newState.players);
              setCurrentPlayerIndex(newState.currentPlayerIndex);
              if (newState.lastDiceValue !== undefined) setDiceValue(newState.lastDiceValue);
              lastSyncRef.current = stateStr;
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchAndSubscribe();
  }, [roomCode, localPlayerName, isSyncing, isRolling, players.length]); 

  const syncGameState = useCallback(async (updatedPlayers: any[], nextIndex: number, currentDice?: number) => {
    setIsSyncing(true);
    const updateId = Date.now();
    lastUpdateIdRef.current = updateId;

    const newState = { 
      players: updatedPlayers, 
      currentPlayerIndex: nextIndex,
      lastDiceValue: currentDice ?? diceValue,
      victoryTarget: victoryTarget,
      updateId: updateId
    };
    
    lastSyncRef.current = JSON.stringify(newState);

    await supabase
      .from('multiplayer_games')
      .update({ game_state: newState })
      .eq('room_code', roomCode);
    
    setTimeout(() => setIsSyncing(false), 500);
  }, [roomCode, victoryTarget, diceValue]);

  // MODIFICA: Spostata l'esecuzione di nextTurn per garantire la sincronizzazione
  const handleCloseModal = useCallback(() => {
    setModalConfig({ isOpen: false });
    const nextIdx = (players.indexOf(currentPlayer) + 1) % players.length;
    syncGameState(players, nextIdx);
    nextTurn();
  }, [nextTurn, players, currentPlayer, syncGameState]);

  const handleDiceRoll = () => {
    if (!currentPlayer || currentPlayer.name !== localPlayerName) return;
    if (modalConfig.isOpen || isRolling || isSyncing || currentPlayer.isBankrupt) return;

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
          
          syncGameState(updatedPlayers, players.indexOf(currentPlayer), steps);

          processTile(tile, updatedPlayers);
        }, 600);
      }
    }, 60);
  };

  const processTile = (tile: any, currentPlayers: any[]) => {
    if (!tile) { 
      const nextIdx = (currentPlayers.indexOf(currentPlayer) + 1) % currentPlayers.length;
      syncGameState(currentPlayers, nextIdx);
      nextTurn(); 
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
    
    const nextIdx = (currentPlayers.indexOf(currentPlayer) + 1) % currentPlayers.length;
    syncGameState(currentPlayers, nextIdx);
    nextTurn();
  };

  const handleCornerTile = (tile: any) => {
    switch (tile.id) {
      case 0:
        const totalDebtAmount = (currentPlayer.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
        if (totalDebtAmount > 0) {
          const totalCapital = (currentPlayer.debts || []).reduce((acc, d) => acc + Number(d.capitalInstallment), 0);
          const totalInterest = (currentPlayer.debts || []).reduce((acc, d) => {
             return acc + Math.round((Number(d.amount) + Number(d.capitalInstallment)) * Number(d.interestRate));
          }, 0);
          setModalConfig({
            isOpen: true, type: 'info', title: "Chiusura Anno Fiscale",
            description: `Rendicontazione annuale completata. Pagata quota capitale del debito: €${totalCapital.toLocaleString()} e relativa quota di interesse di €${totalInterest.toLocaleString()}`,
            impact: { details: `Ammortamento: -€${totalCapital.toLocaleString()} (Cash) | Interessi: -€${totalInterest.toLocaleString()} (EBITDA)` },
            actionLabel: "Continua", onAction: handleCloseModal
          });
        } else {
          setModalConfig({
            isOpen: true, type: 'info', title: "Revisione dei Bilanci",
            description: "L'anno fiscale si chiude in assenza di debiti finanziari. Il team contabile ha confermato la solidità dei flussi.",
            impact: { details: "Audit superato con successo | Nessun onere finanziario rilevato" },
            actionLabel: "Continua", onAction: handleCloseModal
          });
        }
        break;
      case 7:
      case 14:
      case 21:
        const currentVal = calculateValuation(currentPlayer);
        const isValuable = currentVal > 120000;
        const availableOffers = FUNDING_OFFERS.filter(o => o.type === 'EQUITY' ? (isValuable && currentPlayer.laps > 0) : true);
        const offer = { ...availableOffers[Math.floor(Math.random() * availableOffers.length)] };
        let details = "";
        if (offer.type === 'EQUITY') {
          const cash = (currentVal * 15) / 100;
          details = `Iniezione Cash: €${cash.toLocaleString()} | Cessione: 15% Equity`;
          offer.actualDilution = 15;
        } else if (offer.type === 'BANK') {
          const amount = (Number(offer.fixedAmount) || 50000).toLocaleString();
          const rate = (Number(offer.interestRate) * 100).toFixed(1);
          const duration = offer.durationYears || 3;
          details = `Erogazione: €${amount} | Tasso: ${rate}% | Durata: ${duration} giri`;
        } else if (offer.type === 'GRANT') {
          details = `Capitale a fondo perduto: +€${(Number(offer.fixedAmount) || 25000).toLocaleString()}`;
        }
        setModalConfig({
          isOpen: true, type: 'info', title: `Round: ${offer.investor}`, 
          description: offer.description, impact: { details },
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
        Inizializzazione startup...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen items-start bg-slate-950 font-sans text-white relative">
      
      <AnimatePresence>
        {gameWinner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-6xl bg-slate-900 border border-blue-500/30 rounded-[3rem] p-6 md:p-10 shadow-2xl text-center relative"
            >
              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Trophy size={40} className="text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-1">Vittoria Epica!</h2>
                <p className="text-blue-400 font-mono text-[10px] tracking-[0.3em] uppercase mb-8">Exit completata con successo</p>

                <div className="space-y-3 mb-10 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {[...players].sort((a, b) => {
                    const valA = (calculateValuation(a) * (a.equity || 100)) / 100;
                    const valB = (calculateValuation(b) * (b.equity || 100)) / 100;
                    return valB - valA;
                  }).map((p, idx) => {
                    if (!p) return null;
                    const totalVal = calculateValuation(p);
                    const founderIncasso = (totalVal * (Number(p.equity) || 100)) / 100;
                    const ebitda = (Number(p.mrr) || 0) - (Number(p.monthlyCosts) || 0);
                    const debt = (p.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
                    
                    return (
                      <motion.div 
                        key={p.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex flex-col lg:flex-row items-center gap-4 p-5 rounded-[2rem] border ${p.id === gameWinner.id ? 'bg-blue-600/20 border-blue-500 shadow-lg' : 'bg-white/5 border-white/10 opacity-70'}`}
                      >
                        <div className="flex items-center gap-4 min-w-[200px] w-full lg:w-1/4">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-black text-white bg-slate-800 border border-white/10">
                            {idx + 1}
                          </div>
                          <div className="text-left overflow-hidden">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 flex-shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                              <span className="font-black text-white uppercase text-base truncate">{p.name}</span>
                              {idx === 0 && <Award size={18} className="text-yellow-400 flex-shrink-0" />}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block truncate">Quota: {Number(p.equity).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full lg:flex-1">
                          <div className="text-center lg:text-right px-3 border-r border-white/5 overflow-hidden">
                            <span className="block text-[8px] text-slate-500 uppercase font-black mb-1">Cash</span>
                            <span className="text-white font-mono font-bold text-sm block truncate">€{Math.floor(Number(p.cash)).toLocaleString()}</span>
                          </div>
                          <div className="text-center lg:text-right px-3 border-r border-white/5 overflow-hidden">
                            <span className="block text-[8px] text-slate-500 uppercase font-black mb-1">EBITDA (Year)</span>
                            <span className={`font-mono font-bold text-sm block truncate ${ebitda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>€{Math.floor(ebitda * 12).toLocaleString()}</span>
                          </div>
                          <div className="text-center lg:text-right px-3 border-r border-white/5 overflow-hidden">
                            <span className="block text-[8px] text-slate-500 uppercase font-black mb-1">Debiti</span>
                            <span className="text-rose-400 font-mono font-bold text-sm block truncate">€{Math.floor(debt).toLocaleString()}</span>
                          </div>
                          <div className="text-center lg:text-right px-3 overflow-hidden">
                            <span className="block text-[8px] text-blue-400 uppercase font-black italic mb-1">Net Founder Exit</span>
                            <span className="text-blue-400 font-mono font-black text-lg block truncate">€{Math.floor(founderIncasso).toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <button 
                  onClick={() => window.location.reload()} 
                  className="px-10 py-4 bg-white text-slate-900 font-black uppercase rounded-2xl hover:bg-blue-400 hover:text-white transition-all shadow-xl text-sm"
                >
                  Nuova Scalata
                </button>
              </div>
            </motion.div>
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
          
          <button 
            onClick={handleDiceRoll} 
            disabled={isRolling || isSyncing || modalConfig.isOpen || currentPlayer.isBankrupt || currentPlayer.name !== localPlayerName} 
            className={`px-10 py-3 font-black rounded-xl text-white text-[10px] font-mono transition-all
              ${currentPlayer.name === localPlayerName 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
          >
            {currentPlayer.isBankrupt ? "OUT" : (isRolling ? "Lancio..." : (currentPlayer.name === localPlayerName ? "Lancia Dadi" : "Attendi..."))}
          </button>
        </div>

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

      <div className="w-full lg:w-[350px] space-y-3 font-mono">
        <h3 className="text-blue-400 font-black tracking-widest uppercase text-[10px] mb-2 px-2 italic">Dashboard {localPlayerName}</h3>
        {players.map((p) => {
          if (!p) return null;
          const isTurn = p.id === currentPlayer.id;
          const isMe = p.name === localPlayerName;
          const currentEbitda = (Number(p.mrr) || 0) - (Number(p.monthlyCosts) || 0);
          const pVal = calculateValuation(p) || 0;
          const founderPart = (pVal * (Number(p.equity) || 100)) / 100;
          const totalDebt = (p.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
          const isNegative = (Number(p.cash) || 0) < 0;

          return (
            <div 
              key={p.id} 
              className={`p-4 rounded-2xl border transition-all duration-500 
                ${isTurn ? 'bg-blue-600/20 border-blue-500 shadow-lg' : 'bg-slate-900/50 border-white/5 opacity-80'} 
                ${isMe ? 'ring-1 ring-white/20 shadow-lg' : ''}
                ${p.isBankrupt ? 'grayscale opacity-50 bg-rose-950/20' : ''}
                ${isNegative && !p.isBankrupt ? 'animate-pulse border-rose-500 bg-rose-500/10' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.isBankrupt ? '#555' : p.color }} />
                  <span className={`font-bold text-xs uppercase ${p.isBankrupt ? 'text-rose-500 line-through' : 'text-white'}`}>
                    {p.name} {isMe && "(TU)"}
                  </span>
                </div>
                {p.isBankrupt ? (
                   <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                    <Skull size={10} /> BANCAROTTA
                   </span>
                ) : (
                  <span className="text-[10px] font-black text-blue-400">{Number(p.equity || 0).toFixed(1)}% EQ</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">Cash</span>
                  <span className={`font-black ${ (Number(p.cash) || 0) < 0 ? 'text-rose-400' : 'text-white'}`}>€{Math.floor(Number(p.cash || 0)).toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">EBITDA</span>
                  <span className={`font-black ${currentEbitda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>€{currentEbitda.toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">Debiti</span>
                  <span className={`font-black ${totalDebt > 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {totalDebt > 0 ? `€${totalDebt.toLocaleString()}` : '0'}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase font-black text-[7px]">Company Val.</span>
                  <span className="text-white font-black text-[10px]">€{pVal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 uppercase font-black text-[7px]">Founder Exit Val.</span>
                  <span className="text-blue-400 font-black text-xs italic">€{founderPart.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <ActionModal {...modalConfig} currentPlayerCash={currentPlayer?.cash || 0} />

      <AnimatePresence>
        {eliminatedPlayerName && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-red-950 border-2 border-red-500 p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Skull size={32} className="text-white" />
              </div>
              <div className="text-red-500 text-5xl mb-2 font-black italic tracking-tighter uppercase">Default</div>
              <h2 className="text-xl text-white font-bold mb-3 uppercase tracking-widest">
                {eliminatedPlayerName} eliminato
              </h2>
              <button 
                onClick={() => setEliminatedPlayerName(null)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all text-[10px]"
              >
                Continua Partita
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={() => window.location.href = '/'} 
          className="group flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 p-2 pr-5 rounded-full transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <Home size={18} className="text-white" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">Exit to Home</span>
        </button>
      </div>
    </div>
  );
}
