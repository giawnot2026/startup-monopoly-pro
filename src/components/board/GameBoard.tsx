'use client'
import React, { useState, useEffect } from 'react';
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

  // Funzione per l'animazione del lancio dadi
  const handleDiceRoll = () => {
    if (modalConfig.isOpen || isRolling) return;
    
    setIsRolling(true);
    let counter = 0;
    const maxIterations = 15; // Quante volte cambia il numero prima di fermarsi

    // Effetto "rimescolamento" visivo
    const shuffleInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      counter++;
      
      if (counter >= maxIterations) {
        clearInterval(shuffleInterval);
        
        // Risultato reale
        const steps = Math.floor(Math.random() * 6) + 1;
        setDiceValue(steps);
        
        // Aspettiamo un attimo sul numero finale prima di muovere
        setTimeout(() => {
          const tile = movePlayer(steps);
          setIsRolling(false);
          processTile(tile);
          // Opzionale: resettiamo il dado dopo il movimento
          // setDiceValue(null); 
        }, 800);
      }
    }, 80); // Velocità del rimescolamento (ms)
  };

  const processTile = (tile: any) => {
    // ... (Logica processTile rimane identica a quella precedente)
    if (tile.name.toLowerCase().includes("exit")) {
      const canExit = valuation >= 1000000 && currentPlayer.equity > 0;
      setModalConfig({
        isOpen: true,
        type: canExit ? 'success' : 'danger',
        title: "Tentativo di EXIT",
        description: canExit ? "Congratulazioni! Hai i numeri per vendere." : "Non hai i requisiti (Valutation > 1M e Equity > 0).",
        actionLabel: canExit ? "Vendi e Vinci" : "Indietro",
        onAction: () => { if(canExit) attemptExit(); setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    if (tile.type === 'special' && (tile.name.includes("Pitch") || tile.name.includes("Funding"))) {
      const offer = FUNDING_OFFERS[Math.floor(Math.random() * FUNDING_OFFERS.length)];
      setModalConfig({
        isOpen: true,
        type: 'info',
        title: `Round: ${offer.investor}`,
        description: offer.description,
        impact: { details: offer.type === 'EQUITY' ? `Diluizione: ~${(offer.equityRange.min + offer.equityRange.max)/2}%` : offer.type === 'BANK' ? `Interesse: ${offer.interestRate*100}%` : `Fondo: €${offer.fixedAmount}` },
        actionLabel: "Accetta",
        secondaryActionLabel: "Rifiuta",
        onAction: () => { applyFunding(offer); setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    const owner = players.find(p => !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
    if (owner && tile.badges) {
      const ownerAsset = owner.assets.find(a => a.tileId === tile.id);
      const toll = tile.badges[ownerAsset!.level as keyof typeof tile.badges].toll;
      setModalConfig({ isOpen: true, type: 'danger', title: "Paga Royalties", impact: { cash: -toll }, actionLabel: "Paga", onAction: () => { setModalConfig({ isOpen: false }); nextTurn(); } });
      return;
    }

    if (tile.type === 'asset' && tile.badges) {
      setModalConfig({ isOpen: true, type: 'success', title: tile.name, description: "Vuoi investire?", actionLabel: "Compra/Upgrade", onAction: () => { upgradeBadge(tile.id); setModalConfig({ isOpen: false }); nextTurn(); }, onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); } });
    } else if (tile.type === 'special') {
      const isOpp = tile.name.toLowerCase().includes("opportunità");
      const event = (isOpp ? OPPORTUNITA : IMPREVISTI)[Math.floor(Math.random() * 5)];
      setModalConfig({ isOpen: true, type: 'info', title: event.title, description: event.effect, actionLabel: "Ok", onAction: () => { applyEvent(event); setModalConfig({ isOpen: false }); nextTurn(); } });
    } else {
      setTimeout(() => nextTurn(), 800);
    }
  };

  if (gameWinner) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-6xl font-black text-white mb-4 italic uppercase tracking-tighter">Exit Riuscita!</h1>
        <p className="text-2xl text-blue-400 mb-8">{gameWinner.name} ha venduto la startup con successo.</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-blue-600 text-white font-bold rounded-full hover:scale-110 transition-transform">Gioca ancora</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen items-start font-sans">
      
      {/* COLONNA SINISTRA: TABELLONE */}
      <div className="relative w-full lg:w-[800px] aspect-square bg-slate-950 p-4 border border-blue-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* HUD CENTRALE + DADO ANIMATO */}
        <div className="absolute inset-[25%] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] z-20 p-6 shadow-2xl">
          
          <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
            <span className="text-white font-black text-[9px] uppercase tracking-widest">{currentPlayer.name}</span>
          </div>

          {/* COMPONENTE DADO VISIVO */}
          <div className={`w-20 h-20 mb-6 flex items-center justify-center rounded-2xl border-2 transition-all duration-150 ${
            isRolling ? 'scale-110 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] rotate-12 blur-[1px]' : 'border-white/20 rotate-0 blur-0'
          } bg-slate-800 text-white text-4xl font-black`}>
            {diceValue || '?'}
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl font-black text-white tracking-tighter italic">€{valuation.toLocaleString()}</div>
            <span className="text-blue-400 font-mono text-[8px] uppercase tracking-widest opacity-70">Company Valuation</span>
          </div>

          <button 
            onClick={handleDiceRoll} 
            disabled={isRolling || modalConfig.isOpen} 
            className={`px-10 py-3 font-black rounded-xl transition-all uppercase tracking-widest text-xs shadow-lg ${
              isRolling ? 'bg-slate-800 text-slate-500 scale-95' : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
            }`}
          >
            {isRolling ? "In movimento..." : "Lancia Dadi"}
          </button>
        </div>

        {/* TABELLONE GRID */}
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
                <Tile {...tile} isActive={playersHere.length > 0} ownerBadge={tileOwner?.assets.find(a => a.tileId === tile.id)?.level || 'none'} ownerColor={tileOwner?.color || 'transparent'} />
                <div className="absolute bottom-1 left-1 flex gap-0.5 z-30">
                  {playersHere.map(p => <div key={p.id} className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: p.color }} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLONNA DESTRA: DASHBOARD (Mantenuta uguale) */}
      <div className="w-full lg:w-[350px] space-y-4 overflow-y-auto max-h-screen pb-10">
        <h3 className="text-blue-400 font-black tracking-widest uppercase text-xs mb-4 px-2">Market Overview</h3>
        {players.map((p) => {
          const isTurn = p.id === currentPlayer.id;
          const pValuation = (p.mrr - p.monthlyCosts) * 12 * 10 + p.cash;

          return (
            <div 
              key={p.id} 
              className={`p-4 rounded-2xl border transition-all duration-500 ${
                isTurn ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-slate-900/50 border-white/5 opacity-80'
              } ${p.isBankrupt ? 'grayscale opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white font-bold text-sm uppercase tracking-tight">{p.name} {p.isBankrupt && '(FALLITO)'}</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400">{p.equity.toFixed(0)}% EQ</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/20 p-2 rounded-lg text-center">
                  <span className="text-slate-500 text-[8px] uppercase font-bold block">Cash</span>
                  <span className="text-white font-mono text-xs font-bold">€{p.cash.toLocaleString()}</span>
                </div>
                <div className="bg-black/20 p-2 rounded-lg text-center">
                  <span className="text-slate-500 text-[8px] uppercase font-bold block">EBITDA (M)</span>
                  <span className={`font-mono text-xs font-bold ${(p.mrr - p.monthlyCosts) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    €{(p.mrr - p.monthlyCosts).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-500 text-[8px] uppercase font-bold">Valuation</span>
                <span className="text-blue-400 font-mono text-sm font-black">€{pValuation.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <ActionModal {...modalConfig} onClose={() => { if (modalConfig.onClose) modalConfig.onClose(); setModalConfig({ ...modalConfig, isOpen: false }); }} />
    </div>
  );
}
