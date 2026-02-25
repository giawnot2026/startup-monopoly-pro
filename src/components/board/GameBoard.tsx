'use client'
import React, { useState } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';

export default function GameBoard() {
  const { player, ebitda, valuation, movePlayer, upgradeBadge } = useGameLogic();
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });

  // Funzione per gestire il tiro dei dadi e l'apertura del Modal
  const handleDiceRoll = () => {
    const steps = Math.floor(Math.random() * 6) + 1;
    const tile = movePlayer(steps);

    // Prepariamo la configurazione del Modal in base al tipo di casella
    setTimeout(() => {
      if (tile.type === 'asset' && tile.badges) {
        const currentAsset = player.assets.find(a => a.tileId === tile.id);
        const currentLevel = currentAsset ? currentAsset.level : 'none';
        
        let nextBadgeInfo = null;
        if (currentLevel === 'none') nextBadgeInfo = { level: 'Bronze', ...tile.badges.bronze };
        else if (currentLevel === 'bronze') nextBadgeInfo = { level: 'Silver', ...tile.badges.silver };
        else if (currentLevel === 'silver') nextBadgeInfo = { level: 'Gold', ...tile.badges.gold };

        setModalConfig({
          isOpen: true,
          type: 'success',
          title: tile.name,
          description: nextBadgeInfo 
            ? `Sei atterrato su ${tile.name}. Hai sbloccato l'asset base. Vuoi potenziare l'infrastruttura con un badge ${nextBadgeInfo.level}?`
            : `Sei atterrato su ${tile.name}. Hai già raggiunto il massimo livello tecnologico (GOLD) qui!`,
          impact: { mrr: landedTileImpact(tile, currentLevel), costs: tile.costModifier },
          actionLabel: nextBadgeInfo ? `Acquista ${nextBadgeInfo.level} (${nextBadgeInfo.cost}€)` : null,
          canAfford: nextBadgeInfo ? player.cash >= nextBadgeInfo.cost : false,
          onAction: () => {
            upgradeBadge(tile.id);
            setModalConfig({ isOpen: false });
          }
        });
      } else if (tile.type === 'special') {
        setModalConfig({
          isOpen: true,
          type: 'info',
          title: tile.name,
          description: "Pesca una carta per scoprire cosa riserva il mercato per la tua startup...",
          actionLabel: "Pesca Carta",
          onAction: () => {
            // Qui implementeremo la pesca random degli imprevisti/opportunità
            setModalConfig({ isOpen: false });
          }
        });
      } else if (tile.type === 'funding') {
        setModalConfig({
          isOpen: true,
          type: 'funding',
          title: "Funding Round",
          description: "Gli investitori stanno analizzando il tuo Pitch Deck. Sei pronto a negoziare l'equity?",
          actionLabel: "Ricevi Offerta",
          onAction: () => {
            // Qui implementeremo l'offerta random dei VC
            setModalConfig({ isOpen: false });
          }
        });
      }
    }, 600); // Piccolo delay per far finire l'animazione del movimento
  };

  // Funzione helper per mostrare l'impatto nel modal
  const landedTileImpact = (tile: any, level: string) => {
    if (level === 'none') return tile.revenueModifier;
    if (level === 'bronze') return tile.badges.silver.revenueBonus - tile.badges.bronze.revenueBonus;
    return 0;
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-square bg-slate-950 p-4 border border-blue-500/20 shadow-2xl rounded-3xl overflow-hidden">
      
      {/* HUD CENTRALE */}
      <div className="absolute inset-[22%] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] z-20 p-8 shadow-2xl">
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-blue-400 font-mono text-[10px] tracking-[0.4em] uppercase opacity-70">Company Valuation</h2>
          <div className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            €{valuation.toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-12 w-full mb-10">
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Available Cash</span>
            <span className="text-2xl font-mono text-green-400 font-bold italic">€{player.cash.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Monthly EBITDA</span>
            <span className={`text-2xl font-mono font-bold ${ebitda >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
              €{ebitda.toLocaleString()}
            </span>
          </div>
        </div>

        <button 
          onClick={handleDiceRoll}
          className="group relative px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(37,99,235,0.4)] uppercase tracking-widest"
        >
          <span className="relative z-10">Roll Dice</span>
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* GRIGLIA TABELLONE */}
      <div className="grid grid-cols-8 grid-rows-8 gap-1.5 h-full w-full">
        {TILES.map((tile) => {
          let row, col;
          if (tile.id <= 7) { row = 1; col = tile.id + 1; }
          else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
          else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
          else { col = 1; row = 8 - (tile.id - 21); }

          const asset = player.assets.find(a => a.tileId === tile.id);

          return (
            <Tile 
              key={tile.id} 
              {...tile} 
              isActive={player.position === tile.id}
              ownerBadge={asset?.level || 'none'}
              ownerColor={player.color}
              style={{ gridRow: row, gridColumn: col }} 
            />
          );
        })}
      </div>

      {/* MODAL DELLE AZIONI */}
      <ActionModal 
        {...modalConfig} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}
