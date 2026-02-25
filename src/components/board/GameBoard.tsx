'use client'
import React, { useState } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';
import { OPPORTUNITA } from '@/data/opportunita';
import { IMPREVISTI } from '@/data/imprevisti';

export default function GameBoard({ playersCount }: { playersCount: number }) {
  const { 
    players, currentPlayer, ebitda, valuation, 
    movePlayer, upgradeBadge, applyEvent, nextTurn 
  } = useGameLogic(playersCount);

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
    const owner = players.find(p => p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
    
    // 1. CASO PEDAGGIO
    if (owner && tile.badges) {
      const ownerAsset = owner.assets.find(a => a.tileId === tile.id);
      const level = ownerAsset!.level as keyof typeof tile.badges;
      const toll = tile.badges[level].toll;

      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: "Paga Royalties",
        description: `Sei atterrato su un asset di ${owner.name}. Paghi €${toll.toLocaleString()} di commissioni.`,
        impact: { cash: -toll },
        actionLabel: "Paga",
        onAction: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    // 2. CASO ASSET / UPGRADE
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
        description: next 
          ? `L'attività di base è avviata. Vuoi investire nel Badge ${next.l.toUpperCase()} per riscuotere pedaggi dagli altri?` 
          : "Massimo livello raggiunto.",
        impact: { mrr: tile.revenueModifier, costs: tile.costModifier },
        actionLabel: next ? `Acquista ${next.l} (${next.cost}€)` : null,
        canAfford: next ? currentPlayer.cash >= next.cost : false,
        onAction: () => { if (next) upgradeBadge(tile.id); setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
    } 
    // 3. SPECIAL (IMPREVISTI/OPPORTUNITÀ)
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
        onAction: () => { applyEvent(event); setModalConfig({ isOpen: false }); nextTurn(); }
      });
    }
    // 4. ALTRO
    else {
      setTimeout(() => nextTurn(), 800);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-square bg-slate-950 p-4 border border-blue-500/20 shadow-2xl rounded-[2.5rem]">
      {/* HUD CENTRALE */}
      <div className="absolute inset-[22%] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] z-20 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentPlayer.color }} />
          <span className="text-white font-black tracking-widest uppercase text-[10px]">{currentPlayer.name}</span>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-blue-400 font-mono text-[9px] tracking-[0.4em] uppercase opacity-70">Company Valuation</h2>
          <div className="text-5xl font-black text-white tracking-tighter italic">€{valuation.toLocaleString()}</div>
        </div>
        <div className="grid grid-cols-2 gap-10 w-full mb-8 text-center">
          <div><span className="text-slate-500 text-[8px] uppercase font-bold block">Cash</span><span className="text-xl font-mono text-green-400">€{currentPlayer.cash.toLocaleString()}</span></div>
          <div><span className="text-slate-500 text-[8px] uppercase font-bold block">EBITDA</span><span className={`text-xl font-mono ${ebitda >= 0 ? 'text-blue-400' : 'text-red-500'}`}>€{ebitda.toLocaleString()}</span></div>
        </div>
        <button onClick={handleDiceRoll} disabled={isRolling} className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm shadow-xl">
          {isRolling ? "Rolling..." : "Lancia Dadi"}
        </button>
      </div>

      {/* GRID TABELLONE */}
      <div className="grid grid-cols-8 grid-rows-8 gap-1.5 h-full w-full">
        {TILES.map((tile) => {
          let row, col;
          if (tile.id <= 7) { row = 1; col = tile.id + 1; }
          else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
          else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
          else { col = 1; row = 8 - (tile.id - 21); }

          const playersHere = players.filter(p => p.position === tile.id);
          const tileOwner = players.find(p => p.assets.some(a => a.tileId === tile.id));
          const assetInfo = tileOwner?.assets.find(a => a.tileId === tile.id);

          return (
            <div key={tile.id} style={{ gridRow: row, gridColumn: col }} className="relative h-full w-full">
              <Tile 
                {...tile} 
                isActive={playersHere.length > 0}
                ownerBadge={assetInfo?.level || 'none'}
                ownerColor={tileOwner?.color || 'transparent'}
              />
              <div className="absolute bottom-1 left-1 flex gap-1 z-30">
                {playersHere.map(p => (
                  <div key={p.id} className="w-3 h-3 rounded-full border border-white shadow-md" style={{ backgroundColor: p.color }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <ActionModal {...modalConfig} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} />
    </div>
  );
}
