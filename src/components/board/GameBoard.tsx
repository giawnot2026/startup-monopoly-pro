'use client'
import React, { useState } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';
import { OPPORTUNITA } from '@/data/opportunita';
import { IMPREVISTI } from '@/data/imprevisti';
import { FUNDING_OFFERS } from '@/data/funding';

export default function GameBoard({ initialPlayers }: { initialPlayers: any[] }) {
  const { 
    players, currentPlayer, ebitda, valuation, 
    movePlayer, upgradeBadge, applyEvent, applyFunding, nextTurn,
    gameWinner, attemptExit 
  } = useGameLogic(initialPlayers);

  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);

  const handleDiceRoll = () => {
    if (modalConfig.isOpen || isRolling) return;
    
    setIsRolling(true);
    let counter = 0;
    const maxIterations = 15;

    const shuffleInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      counter++;
      
      if (counter >= maxIterations) {
        clearInterval(shuffleInterval);
        const steps = Math.floor(Math.random() * 6) + 1;
        setDiceValue(steps);
        
        setTimeout(() => {
          const tile = movePlayer(steps);
          setIsRolling(false);
          processTile(tile);
        }, 800);
      }
    }, 80);
  };

  const processTile = (tile: any) => {
    console.log(`[GAME] Atterrato su: ${tile.name} (ID: ${tile.id})`);
    const tileName = tile.name.toLowerCase();
    
    // 1. GESTIONE EXIT
    if (tileName.includes("exit")) {
      const canExit = valuation >= 1000000 && currentPlayer.equity > 0;
      setModalConfig({
        isOpen: true,
        type: canExit ? 'success' : 'danger',
        title: "Tentativo di EXIT",
        description: canExit ? "Congratulazioni! Hai i numeri per vendere la startup." : "Requisiti insufficienti (Valutation > 1M e Equity > 0).",
        actionLabel: canExit ? "Vendi e Vinci" : "Continua a scalare",
        onAction: () => { 
          if(canExit) attemptExit(); 
          setModalConfig({ isOpen: false }); 
          nextTurn(); 
        },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    // 2. GESTIONE EVENTI (IMPREVISTI / OPPORTUNITÀ)
    // Usiamo check per nome o ID specifico per evitare conflitti
    if (tileName.includes("imprevisti") || tileName.includes("opportunità") || tileName.includes("?")) {
      const isOpp = tileName.includes("opportunità") || tileName.includes("?");
      const deck = isOpp ? OPPORTUNITA : IMPREVISTI;
      const event = deck[Math.floor(Math.random() * deck.length)];
      
      setModalConfig({ 
        isOpen: true, 
        type: isOpp ? 'opportunity' : 'danger_event', // Usiamo i nuovi tipi personalizzati
        title: event.title, 
        description: event.effect, 
        actionLabel: isOpp ? "Sfrutta l'occasione" : "Affronta le conseguenze", 
        onAction: () => { 
          applyEvent(event); 
          setModalConfig({ isOpen: false }); 
          nextTurn(); 
        } 
      });
      return;
    }

    // 3. GESTIONE FUNDING (PITCH DECK / ROUND)
    const hasFundingName = tileName.includes("pitch") || tileName.includes("funding") || tileName.includes("round") || tileName.includes("invest");
    const isFundingCorner = [8, 24].includes(tile.id); // Solo angoli dedicati

    if (hasFundingName || isFundingCorner) {
      const offer = FUNDING_OFFERS[Math.floor(Math.random() * FUNDING_OFFERS.length)];
      setModalConfig({
        isOpen: true,
        type: 'info',
        title: `Offerta: ${offer.investor}`,
        description: offer.description,
        impact: { 
          details: offer.type === 'EQUITY' 
            ? `Diluizione: ~${(offer.equityRange.min + offer.equityRange.max)/2}%` 
            : `Debito/Fondo: €${offer.fixedAmount || 'Variabile'}` 
        },
        actionLabel: "Accetta",
        secondaryActionLabel: "Rifiuta",
        onAction: () => { 
          applyFunding(offer); 
          setModalConfig({ isOpen: false }); 
          nextTurn(); 
        },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    // 4. LOGICA ASSET E PEDAGGI
    const owner = players.find(p => !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
    if (owner && tile.badges) {
      const ownerAsset = owner.assets.find(a => a.tileId === tile.id);
      const level = ownerAsset?.level || 'none';
      if (level !== 'none') {
        const toll = tile.badges[level as keyof typeof tile.badges].toll;
        setModalConfig({ 
          isOpen: true, type: 'danger', title: "Paga Royalties", 
          description: `Sei su un asset di ${owner.name}`, impact: { cash: -toll }, 
          actionLabel: "Paga ora", 
          onAction: () => { setModalConfig({ isOpen: false }); nextTurn(); } 
        });
        return;
      }
    }

    // 5. ACQUISTO ASSET
    if (tile.type === 'asset' && tile.badges) {
      setModalConfig({ 
        isOpen: true, type: 'success', title: tile.name, 
        description: "Vuoi investire per potenziare questo asset?",
        actionLabel: "Investi", 
        onAction: () => { upgradeBadge(tile.id); setModalConfig({ isOpen: false }); nextTurn(); }, 
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); } 
      });
      return;
    } 

    // 6. DEFAULT: PASSAGGIO TURNO AUTOMATICO
    console.log("[GAME] Nessuna azione necessaria, cambio turno.");
    setTimeout(() => nextTurn(), 800);
  };

  if (gameWinner) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-6xl font-black text-white mb-4 italic uppercase tracking-tighter">Exit Riuscita!</h1>
        <p className="text-2xl text-blue-400 mb-8">{gameWinner.name} vince la partita!</p>
        <button onClick={() => window.location.reload()} className="px-12 py-4 bg-white text-black font-bold rounded-xl hover:bg-blue-400 transition-colors">Nuova Partita</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen items-start bg-slate-950 font-sans">
      
      {/* TABELLONE */}
      <div className="relative w-full lg:w-[800px] aspect-square bg-slate-900 p-4 border border-blue-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* HUD CENTRALE */}
        <div className="absolute inset-[25%] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[3rem] z-20 p-6 shadow-2xl text-center">
          <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
            <span className="text-white font-black text-[9px] uppercase tracking-widest">{currentPlayer.name}</span>
          </div>

          {/* DADO ANIMATO */}
          <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-2xl border-2 transition-all duration-150 ${
            isRolling ? 'scale-110 border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.4)] rotate-12' : 'border-white/10 rotate-0'
          } bg-slate-800 text-white text-3xl font-black`}>
            {diceValue || '?'}
          </div>

          <div className="text-2xl font-black text-white italic mb-1 tracking-tighter">€{valuation.toLocaleString()}</div>
          <span className="text-blue-400 font-mono text-[7px] uppercase tracking-widest opacity-60 mb-6 block">Company Valuation</span>

          <button 
            onClick={handleDiceRoll} 
            disabled={isRolling || modalConfig.isOpen} 
            className={`px-10 py-3 font-black rounded-xl transition-all uppercase tracking-widest text-[10px] shadow-lg ${
              isRolling ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
            }`}
          >
            {isRolling ? "Lancio..." : "Lancia Dadi"}
          </button>
        </div>

        {/* GRIGLIA TABELLONE */}
        <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
          {TILES.map((tile) => {
            let row, col;
            if (tile.id <= 7) { row = 1; col = tile.id + 1; }
            else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
            else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
            else { col = 1; row = 8 - (tile.id - 21); }
            
            const playersHere = players.filter(p => p.position === tile.id && !p.isBankrupt);
            const tileOwner = players.find(p => p.assets.some(a => a.tileId === tile.id));
            
            return (
              <div key={tile.id} style={{ gridRow: row, gridColumn: col }} className="relative h-full w-full">
                <Tile 
                  {...tile} 
                  isActive={playersHere.length > 0} 
                  ownerBadge={tileOwner?.assets.find(a => a.tileId === tile.id)?.level || 'none'} 
                  ownerColor={tileOwner?.color || 'transparent'} 
                />
                <div className="absolute bottom-1 left-1 flex gap-0.5 z-30">
                  {playersHere.map(p => (
                    <div key={p.id} className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD RIEPILOGO LATERALE */}
      <div className="w-full lg:w-[350px] space-y-3">
        <h3 className="text-blue-400 font-black tracking-[0.2em] uppercase text-[10px] mb-2 px-2 italic opacity-80">Market Overview</h3>
        {players.map((p) => {
          const isTurn = p.id === currentPlayer.id;
          const pVal = (p.mrr - p.monthlyCosts) * 12 * 10 + p.cash;
          return (
            <div 
              key={p.id} 
              className={`p-4 rounded-2xl border transition-all duration-500 ${
                isTurn ? 'bg-blue-600/20 border-blue-500 shadow-xl' : 'bg-slate-900/50 border-white/5 opacity-80'
              } ${p.isBankrupt ? 'grayscale opacity-50 contrast-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white font-bold text-xs uppercase tracking-tight">
                    {p.name} {p.isBankrupt && '(X)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{p.equity.toFixed(0)}% EQ</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-black/30 p-2 rounded-lg">
                  <span className="text-slate-500 block text-[7px] uppercase font-bold mb-1">Cash</span>
                  <span className="text-white font-mono font-bold italic">€{p.cash.toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <span className="text-slate-500 block text-[7px] uppercase font-bold mb-1">EBITDA (M)</span>
                  <span className={`font-mono font-bold ${(p.mrr - p.monthlyCosts) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    €{(p.mrr - p.monthlyCosts).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                <span className="text-slate-500 uppercase font-bold text-[7px]">Net Valuation</span>
                <span className="text-blue-400 font-black">€{pVal.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <ActionModal {...modalConfig} onClose={() => { 
        if (modalConfig.onClose) modalConfig.onClose(); 
        setModalConfig({ ...modalConfig, isOpen: false }); 
      }} />
    </div>
  );
}
