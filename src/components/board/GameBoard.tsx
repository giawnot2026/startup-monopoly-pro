'use client'
import React, { useState } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';
import { OPPORTUNITA } from '@/data/opportunita';
import { IMPREVISTI } from '@/data/imprevisti';

interface GameBoardProps {
  playersCount: number;
}

export default function GameBoard({ playersCount }: GameBoardProps) {
  const { 
    players, currentPlayer, ebitda, valuation, 
    movePlayer, upgradeBadge, applyEvent, nextTurn 
  } = useGameLogic(playersCount);

  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [isRolling, setIsRolling] = useState(false);

  const handleDiceRoll = () => {
    if (modalConfig.isOpen) return;
    setIsRolling(true);
    
    setTimeout(() => {
      const steps = Math.floor(Math.random() * 6) + 1;
      const tile = movePlayer(steps);
      setIsRolling(false);
      processTile(tile);
    }, 600);
  };

  const processTile = (tile: any) => {
    if (tile.type === 'asset' && tile.badges) {
      const currentAsset = currentPlayer.assets.find(a => a.tileId === tile.id);
      const level = currentAsset ? currentAsset.level : 'none';
      
      let next = null;
      if (level === 'none') next = { l: 'bronze', ...tile.badges.bronze };
      else if (level === 'bronze') next = { l: 'silver', ...tile.badges.silver };
      else if (level === 'silver') next = { l: 'gold', ...tile.badges.gold };

      setModalConfig({
        isOpen: true,
        type: 'success',
        title: tile.name,
        description: next ? `Vuoi investire nel badge ${next.l}?` : "Livello massimo raggiunto.",
        impact: { mrr: tile.revenueModifier },
        actionLabel: next ? `Upgrade ${next.l} (${next.cost}€)` : null,
        canAfford: next ? currentPlayer.cash >= next.cost : false,
        onAction: () => { upgradeBadge(tile.id); setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
    } 
    else if (tile.type === 'special') {
      const isOpp = tile.name.toLowerCase().includes("opportunità");
      const deck = isOpp ? OPPORTUNITA : IMPREVISTI;
      const event = deck[Math.floor(Math.random() * deck.length)];

      setModalConfig({
        isOpen: true,
        type: isOpp ? 'info' : 'danger',
        title: event.title,
        description: event.effect,
        impact: { mrr: event.revenueModifier, cash: event.cashEffect },
        actionLabel: "Applica",
        onAction: () => { applyEvent(event); setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
    }
    else if (tile.type === 'funding') {
      const offerCash = Math.round(valuation * 0.15);
      setModalConfig({
        isOpen: true,
        type: 'funding',
        title: "Funding Round",
        description: `Offerta: €${offerCash.toLocaleString()} per il 15% di Equity.`,
        actionLabel: "Accetta",
        onAction: () => { /* Logica Equity simile a prima */ setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
    } else {
      // Per le caselle neutre o tax senza badge
      setTimeout(() => nextTurn(), 1000);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-square bg-slate-950 p-4 border border-blue-500/20 shadow-2xl rounded-3xl overflow-hidden">
      
      {/* HUD CENTRALE */}
      <div className="absolute inset-[22%] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] z-20 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
          <span className="text-white font-bold tracking-widest uppercase text-sm">{currentPlayer.name}'s Turn</span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-blue-400 font-mono text-[9px] tracking-[0.4em] uppercase opacity-70">Valuation</h2>
          <div className="text-5xl font-black text-white tracking-tighter">€{valuation.toLocaleString()}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 w-full mb-8">
          <div className="text-center">
            <span className="text-slate-500 text-[8px] uppercase font-bold tracking-widest block">Cash</span>
            <span className="text-xl font-mono text-green-400">€{currentPlayer.cash.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="text-slate-500 text-[8px] uppercase font-bold tracking-widest block">EBITDA</span>
            <span className={`text-xl font-mono ${ebitda >= 0 ? 'text-blue-400' : 'text-red-500'}`}>€{ebitda.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={handleDiceRoll}
          disabled={isRolling || modalConfig.isOpen}
          className="px-12 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-sm font-black rounded-2xl transition-all shadow-lg uppercase"
        >
          {isRolling ? "Rolling..." : "Roll Dice"}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-8 grid-rows-8 gap-1.5 h-full w-full">
        {TILES.map((tile) => {
          let row, col;
          if (tile.id <= 7) { row = 1; col = tile.id + 1; }
          else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
          else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
          else { col = 1; row = 8 - (tile.id - 21); }

          // Trova se qualche player è su questa casella
          const playersHere = players.filter(p => p.position === tile.id);
          const asset = currentPlayer.assets.find(a => a.tileId === tile.id);

          return (
            <div key={tile.id} style={{ gridRow: row, gridColumn: col }} className="relative">
              <Tile 
                {...tile} 
                isActive={playersHere.length > 0}
                ownerBadge={asset?.level || 'none'}
                ownerColor={currentPlayer.color}
              />
              {/* Pedine Giocatori */}
              <div className="absolute bottom-1 left-1 flex gap-1">
                {playersHere.map(p => (
                  <div key={p.id} className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: p.color }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ActionModal {...modalConfig} onClose={modalConfig.onClose} />
    </div>
  );
}
