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
    // 1. Controllo Pedaggio
    const owner = players.find(p => p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
    
    if (owner && tile.badges) {
      const ownerAsset = owner.assets.find(a => a.tileId === tile.id);
      const level = ownerAsset!.level as keyof typeof tile.badges;
      const toll = tile.badges[level].toll;

      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: "Licenza d'uso",
        description: `Casella di ${owner.name}. Hai pagato €${toll.toLocaleString()} per l'utilizzo dei loro sistemi.`,
        impact: { cash: -toll },
        actionLabel: "Ricevuto",
        onAction: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    // 2. Logica Asset Libero / Proprio
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
          ? `Effetto base applicato. Vuoi potenziare questa casella al livello ${next.l.toUpperCase()}?` 
          : "Hai già il massimo potenziamento tecnologico su questa casella.",
        impact: { mrr: tile.revenueModifier },
        actionLabel: next ? `Acquista ${next.l} (${next.cost}€)` : null,
        canAfford: next ? currentPlayer.cash >= next.cost : false,
        onAction: () => { 
          if (next) upgradeBadge(tile.id); 
          setModalConfig({ isOpen: false }); 
          nextTurn(); 
        },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
    } 
    // 3. Special Tiles (Eventi)
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
        actionLabel: "Applica Effetto",
        onAction: () => { applyEvent(event); setModalConfig({ isOpen: false }); nextTurn(); }
      });
    }
    // 4. Funding (Angoli)
    else if (tile.type === 'funding' && tile.id !== 0) {
      const offerCash = Math.round(valuation * 0.15);
      setModalConfig({
        isOpen: true,
        type: 'funding',
        title: "Funding Round",
        description: `Un VC offre €${offerCash.toLocaleString()} per il 15% di Equity.`,
        impact: { cash: offerCash },
        actionLabel: "Accetta Investimento",
        onAction: () => { /* Logica Equity espandibile */ setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
    } else {
      // Casella START o Tax senza Badge
      setTimeout(() => nextTurn(), 800);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-square bg-slate-950 p-4 border border-blue-500/20 shadow-2xl rounded-[2rem] overflow-hidden">
      
      {/* HUD CENTRALE */}
      <div className="absolute inset-[22%] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] z-20 p-8 shadow-2xl text-center">
        <div className="flex items-center gap-3 mb-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
          <span className="text-white font-black tracking-widest uppercase text-[10px]">{currentPlayer.name}</span>
        </div>

        <div className="mb-6">
          <h2 className="text-blue-400 font-mono text-[9px] tracking-[0.4em] uppercase opacity-70">Valuation</h2>
          <div className="text-5xl font-black text-white tracking-tighter">€{valuation.toLocaleString()}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-10 w-full mb-8">
          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold tracking-widest block mb-1">Cash</span>
            <span className="text-xl font-mono text-green-400 font-bold">€{currentPlayer.cash.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold tracking-widest block mb-1">EBITDA</span>
            <span className={`text-xl font-mono font-bold ${ebitda >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
              €{ebitda.toLocaleString()}
            </span>
          </div>
        </div>

        <button 
          onClick={handleDiceRoll}
          disabled={isRolling || modalConfig.isOpen}
          className="px-12 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-sm font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] uppercase tracking-widest"
        >
          {isRolling ? "Rolling..." : "Lancia Dadi"}
        </button>
      </div>

      {/* TABELLONE */}
      <div className="grid grid-cols-8 grid-rows-8 gap-1.5 h-full w-full">
        {TILES.map((tile) => {
          let row, col;
          if (tile.id <= 7) { row = 1; col = tile.id + 1; }
          else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
          else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
          else { col = 1; row = 8 - (tile.id - 21); }

          const playersHere = players.filter(p => p.position === tile.id);
          // Troviamo il proprietario del badge per questa specifica casella
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
              {/* Segnaposto Giocatori */}
              <div className="absolute bottom-1 left-1 flex gap-1 z-30">
                {playersHere.map(p => (
                  <motion.div 
                    key={p.id} 
                    layoutId={`player-${p.id}`}
                    className="w-3 h-3 rounded-full border-2 border-white shadow-lg" 
                    style={{ backgroundColor: p.color }} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ActionModal {...modalConfig} onClose={() => { if(modalConfig.onClose) modalConfig.onClose(); else setModalConfig({ ...modalConfig, isOpen: false }); }} />
    </div>
  );
}
