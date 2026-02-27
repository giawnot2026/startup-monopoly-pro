'use client'
import React, { useState, useCallback } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';
import { OPPORTUNITA } from '@/data/opportunita';
import { IMPREVISTI } from '@/data/imprevisti';
import { FUNDING_OFFERS } from '@/data/funding';

export default function GameBoard({ initialPlayers }: { initialPlayers: any[] }) {
  const { players, currentPlayer, valuation, movePlayer, upgradeBadge, applyEvent, applyFunding, nextTurn, attemptExit, calculateFinancials } = useGameLogic(initialPlayers);
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);

  const handleCloseModal = useCallback(() => {
    setModalConfig({ isOpen: false });
    nextTurn();
  }, [nextTurn]);

  const handleDiceRoll = () => {
    if (modalConfig.isOpen || isRolling) return;
    setIsRolling(true);
    let counter = 0;
    const shuffleInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      if (++counter >= 10) {
        clearInterval(shuffleInterval);
        const steps = Math.floor(Math.random() * 6) + 1;
        setDiceValue(steps);
        setTimeout(() => {
          const tile = movePlayer(steps);
          setIsRolling(false);
          processTile(tile);
        }, 500);
      }
    }, 60);
  };

  const processTile = (tile: any) => {
    if (!tile) { nextTurn(); return; }

    // VIA e Caselle Speciali
    if ([0, 7, 14, 21].includes(tile.id)) {
      handleCornerTile(tile);
      return;
    }

    // EXIT
    if (tile.id === 27) {
      const { valuation: v } = calculateFinancials(currentPlayer);
      const canExit = v >= 1000000;
      setModalConfig({
        isOpen: true, type: canExit ? 'success' : 'danger',
        title: "Exit Strategy", description: canExit ? "Siete pronti per l'exit della vita!" : "Valutazione troppo bassa per vendere.",
        insight: "L'exit richiede un multiplo solido dell'EBITDA e cassa positiva.",
        impact: { details: `Valutazione attuale: €${Math.floor(v).toLocaleString()}` },
        actionLabel: canExit ? "Vendi Startup" : "Continua Scalata",
        onAction: () => { if(canExit) attemptExit(); handleCloseModal(); }
      });
      return;
    }

    // OPPORTUNITÀ / IMPREVISTI
    if (tile.type === 'special') {
      const isOpp = [3, 15, 22].includes(tile.id);
      const event = (isOpp ? OPPORTUNITA : IMPREVISTI)[Math.floor(Math.random() * 5)];
      const impacts = [];
      if (event.cashEffect) impacts.push(`Cash: ${event.cashEffect > 0 ? '+' : ''}€${event.cashEffect.toLocaleString()}`);
      if (event.revenueModifier) impacts.push(`MRR: +€${event.revenueModifier.toLocaleString()}`);
      if (event.costModifier) impacts.push(`Costi: +€${event.costModifier.toLocaleString()}`);

      setModalConfig({
        isOpen: true, type: isOpp ? 'opportunity' : 'danger_event',
        title: event.title, description: event.effect, insight: event.insight,
        impact: { details: impacts.join(' | ') },
        onAction: () => { applyEvent(event); handleCloseModal(); }
      });
      return;
    }

    // ASSET
    if (tile.type === 'asset') {
      const owner = players.find(p => p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
      const myAsset = currentPlayer.assets.find(a => a.tileId === tile.id);
      const currentLevel = myAsset ? myAsset.level : 'none';

      if (owner) {
        const lvl = owner.assets.find(a => a.tileId === tile.id)?.level || 'none';
        const toll = tile.badges[lvl].toll;
        setModalConfig({
          isOpen: true, type: 'danger', title: "Tassa di Mercato",
          description: `Sei su un asset di ${owner.name}.`,
          impact: { details: `Paga Royalties: €${toll.toLocaleString()}` },
          onAction: handleCloseModal
        });
      } else {
        const next = currentLevel === 'none' ? 'bronze' : currentLevel === 'bronze' ? 'silver' : 'gold';
        setModalConfig({
          isOpen: true, type: 'success', title: tile.name, description: "Potenzia questo asset.",
          insight: tile.insight,
          badges: {
            currentLevel,
            bronze: { ...tile.badges.bronze, owned: ['bronze', 'silver', 'gold'].includes(currentLevel) },
            silver: { ...tile.badges.silver, owned: ['silver', 'gold'].includes(currentLevel) },
            gold: { ...tile.badges.gold, owned: currentLevel === 'gold' }
          },
          actionLabel: currentLevel === 'gold' ? "Livello Max" : `Compra ${next}`,
          onAction: () => { if(currentLevel !== 'gold') upgradeBadge(tile.id); handleCloseModal(); }
        });
      }
      return;
    }
    nextTurn();
  };

  const handleCornerTile = (tile: any) => {
    if (tile.id === 0) {
      setModalConfig({
        isOpen: true, type: 'info', title: "Nuovo Anno Fiscale", description: "Budget ricaricato.",
        impact: { details: "+€25.000 Cash | Debiti Ammortizzati" },
        onAction: handleCloseModal
      });
    } else {
      const offer = FUNDING_OFFERS[Math.floor(Math.random() * FUNDING_OFFERS.length)];
      setModalConfig({
        isOpen: true, type: 'info', title: `Round: ${offer.investor}`,
        description: offer.description, insight: offer.insight,
        actionLabel: "Accetta", secondaryActionLabel: "Rifiuta",
        onAction: () => { applyFunding(offer); handleCloseModal(); }
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen bg-slate-950 font-mono text-white">
      {/* Tabellone Grafico */}
      <div className="relative w-full lg:w-[800px] aspect-square bg-slate-900 p-4 border border-blue-500/20 rounded-[2.5rem] shadow-2xl">
        <div className="absolute inset-[25%] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[3rem] z-20 text-center">
          <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
            <span className="text-[9px] uppercase font-black">{currentPlayer.name}</span>
          </div>
          <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl border-2 border-white/10 bg-slate-800 text-3xl font-black italic">
            {diceValue || '?'}
          </div>
          <div className="text-2xl font-black italic mb-1">€{Math.floor(valuation).toLocaleString()}</div>
          <span className="text-blue-400 text-[7px] uppercase tracking-widest opacity-60 mb-6">Valuation</span>
          <button onClick={handleDiceRoll} disabled={isRolling || modalConfig.isOpen} className="px-10 py-3 font-black rounded-xl bg-blue-600 hover:bg-blue-500 text-[10px] uppercase">
            {isRolling ? "Lancio..." : "Lancia Dadi"}
          </button>
        </div>

        <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
          {TILES.map((tile) => {
            let row, col;
            if (tile.id <= 7) { row = 1; col = tile.id + 1; }
            else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
            else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
            else { col = 1; row = 8 - (tile.id - 21); }
            const playersHere = players.filter(p => p.position === tile.id);
            const tileOwner = players.find(p => p.assets.some(a => a.tileId === tile.id));
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

      {/* Dashboard laterale */}
      <div className="w-full lg:w-[350px] space-y-3">
        <h3 className="text-blue-400 font-black tracking-widest uppercase text-[10px] italic px-2">Market Dashboard</h3>
        {players.map((p) => {
          const { monthlyEbitda: e, valuation: v } = calculateFinancials(p);
          const totalDebt = p.debts.reduce((acc, d) => acc + d.principal, 0);
          return (
            <div key={p.id} className={`p-4 rounded-2xl border transition-all ${p.id === currentPlayer.id ? 'bg-blue-600/20 border-blue-500 shadow-lg' : 'bg-slate-900/50 border-white/5 opacity-80'}`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-bold text-xs uppercase">{p.name}</span>
                </div>
                <span className="text-[10px] font-black text-blue-400">{p.equity.toFixed(0)}% EQ</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase mb-1">Cash</span>
                  <span className="font-black">€{Math.floor(p.cash).toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase mb-1">EBITDA (m)</span>
                  <span className={`font-black ${e >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>€{Math.floor(e).toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase mb-1">Debt</span>
                  <span className="font-black text-rose-400">€{Math.floor(totalDebt).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-500 uppercase text-[7px]">Net Valuation</span>
                <span className="text-blue-400 font-black text-xs italic">€{Math.floor(v).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
      <ActionModal {...modalConfig} />
    </div>
  );
}
