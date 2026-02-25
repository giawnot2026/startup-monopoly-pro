'use client'
import React, { useState } from 'react';
import { useGameLogic, ExtendedPlayer } from '@/hooks/useGameLogic';
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

  const handleDiceRoll = () => {
    if (modalConfig.isOpen || isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      const steps = Math.floor(Math.random() * 6) + 1;
      const tile = movePlayer(steps);
      setIsRolling(false);
      processTile(tile);
    }, 600);
  };

  const processTile = (tile: any) => {
    // 1. EXIT TILE
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

    // 2. FUNDING TILES
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

    // 3. LOGICA ASSET/TOLL/SPECIAL (PRE-ESISTENTE)
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
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-black text-white mb-4 italic uppercase">Exit Riuscita!</h1>
        <p className="text-2xl text-blue-400 mb-8">{gameWinner.name} vince la partita.</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-blue-600 text-white font-bold rounded-full">Gioca ancora</button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-square bg-slate-950 p-4 border border-blue-500/20 rounded-[2.5rem]">
      {/* HUD CENTRALE */}
      <div className="absolute inset-[22%] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] z-20 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentPlayer.color }} />
          <span className="text-white font-black text-[10px] uppercase tracking-widest">{currentPlayer.name}</span>
          <span className="text-blue-400 font-mono text-[10px] ml-2">{currentPlayer.equity.toFixed(1)}% EQUITY</span>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-blue-400 font-mono text-[9px] tracking-[0.4em] uppercase opacity-70">Valuation</h2>
          <div className="text-5xl font-black text-white tracking-tighter">€{valuation.toLocaleString()}</div>
        </div>
        <div className="grid grid-cols-2 gap-8 w-full mb-8 text-center">
          <div><span className="text-slate-500 text-[8px] uppercase font-bold block mb-1">Cash</span><span className="text-xl font-mono text-green-400 font-bold">€{currentPlayer.cash.toLocaleString()}</span></div>
          <div><span className="text-slate-500 text-[8px] uppercase font-bold block mb-1">EBITDA</span><span className={`text-xl font-mono font-bold ${ebitda >= 0 ? 'text-blue-400' : 'text-red-500'}`}>€{ebitda.toLocaleString()}</span></div>
        </div>
        <button onClick={handleDiceRoll} disabled={isRolling || modalConfig.isOpen} className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm shadow-xl">
          {isRolling ? "Rolling..." : "Lancia Dadi"}
        </button>
        {currentPlayer.laps < 3 && <div className="mt-4 text-[8px] text-yellow-500 font-mono uppercase">Protezione Bancarotta: Giro {currentPlayer.laps}/3</div>}
      </div>

      {/* TABELLONE GRID */}
      <div className="grid grid-cols-8 grid-rows-8 gap-1.5 h-full w-full">
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
              <div className="absolute bottom-1 left-1 flex gap-1 z-30">
                {playersHere.map(p => <div key={p.id} className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: p.color }} />)}
              </div>
            </div>
          );
        })}
      </div>
      <ActionModal {...modalConfig} onClose={() => { if (modalConfig.onClose) modalConfig.onClose(); setModalConfig({ ...modalConfig, isOpen: false }); }} />
    </div>
  );
}
