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
  const { 
    players, currentPlayer, valuation, 
    movePlayer, upgradeBadge, applyEvent, applyFunding, nextTurn,
    gameWinner, attemptExit, calculateValuation
  } = useGameLogic(initialPlayers);

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
      if (++counter >= 12) {
        clearInterval(shuffleInterval);
        const steps = Math.floor(Math.random() * 6) + 1;
        setDiceValue(steps);
        setTimeout(() => {
          const tile = movePlayer(steps);
          setIsRolling(false);
          processTile(tile);
        }, 600);
      }
    }, 60);
  };

  const processTile = (tile: any) => {
    if (!tile) { nextTurn(); return; }
    const corners = [0, 7, 14, 21];
    if (corners.includes(tile.id)) { handleCornerTile(tile); return; }
    
    if (tile.id === 27) {
      const currentVal = calculateValuation(currentPlayer);
      const canExit = currentVal >= 1000000 && currentPlayer.equity > 0;
      setModalConfig({
        isOpen: true, type: canExit ? 'success' : 'danger',
        title: "Tavolo delle Trattative Exit",
        description: canExit ? "La tua startup ha raggiunto la massa critica. Vuoi vendere?" : "Valutazione troppo bassa per una Exit (Min €1M).",
        impact: { details: `Valutazione attuale: €${currentVal.toLocaleString()}` },
        actionLabel: canExit ? "Vendi e Vinci" : "Rifiuta e continua",
        onAction: () => { if(canExit) attemptExit(); handleCloseModal(); },
        onClose: handleCloseModal
      });
      return;
    }

    if (tile.type === 'special') {
      const isOpp = tile.name?.toLowerCase().includes("opportunità") || [3, 15, 22].includes(tile.id);
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
      const owner = players.find(p => !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
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
    nextTurn();
  };

  const handleCornerTile = (tile: any) => {
    switch (tile.id) {
      case 0:
        setModalConfig({
          isOpen: true, type: 'info', title: "Chiusura Anno Fiscale",
          description: "Rendicontazione annuale completata. La quota capitale è stata detratta dal cash, mentre l'interesse residuo è stato imputato all'EBITDA.",
          impact: { details: "Ammortamento Capitale (Cash) | Interessi Operativi (EBITDA)" },
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
        let details = "";
        if (offer.type === 'EQUITY') {
          const cash = (currentVal * 15) / 100;
          details = `Iniezione Cash: €${cash.toLocaleString()} | Cessione: 15% Equity`;
          offer.actualDilution = 15;
        } else if (offer.type === 'BANK') {
          const amount = (Number(offer.fixedAmount) || 50000).toLocaleString();
          const rate = (Number(offer.interestRate) * 100);
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen items-start bg-slate-950 font-sans text-white">
      <div className="relative w-full lg:w-[800px] aspect-square bg-slate-900 p-4 border border-blue-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="absolute inset-[25%] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[3rem] z-20 p-6 text-center">
          <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
            <span className="text-white font-black text-[9px] uppercase tracking-widest font-mono">{currentPlayer.name}</span>
          </div>
          <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-2xl border-2 transition-all ${isRolling ? 'scale-110 border-blue-500 rotate-12' : 'border-white/10'} bg-slate-800 text-white text-3xl font-black font-mono`}>
            {diceValue || '?'}
          </div>
          <div className="text-2xl font-black text-white italic mb-1 tracking-tighter font-mono">€{(Number(valuation) || 0).toLocaleString()}</div>
          <span className="text-blue-400 font-mono text-[7px] uppercase tracking-widest opacity-60 mb-6 block">Valuation</span>
          <button onClick={handleDiceRoll} disabled={isRolling || modalConfig.isOpen} className="px-10 py-3 font-black rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono">
            {isRolling ? "Lancio..." : "Lancia Dadi"}
          </button>
        </div>
        <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full font-mono">
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
      <div className="w-full lg:w-[350px] space-y-3 font-mono">
        <h3 className="text-blue-400 font-black tracking-widest uppercase text-[10px] mb-2 px-2 italic">Dashboard</h3>
        {players.map((p) => {
          const isTurn = p.id === currentPlayer.id;
          const currentEbitda = (Number(p.mrr) || 0) - (Number(p.monthlyCosts) || 0);
          const pVal = calculateValuation(p) || 0;
          const totalDebt = (p.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
          return (
            <div key={p.id} className={`p-4 rounded-2xl border transition-all ${isTurn ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-900/50 border-white/5 opacity-80'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white font-bold text-xs uppercase">{p.name}</span>
                </div>
                <span className="text-[10px] font-black text-blue-400">{p.equity?.toFixed(0) || 100}% EQ</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">Cash</span>
                  <span className="text-white font-black">€{Number(p.cash).toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">EBITDA</span>
                  <span className={`font-black ${currentEbitda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>€{currentEbitda.toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">Debts</span>
                  <span className={`font-black ${totalDebt > 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {totalDebt > 0 ? `€${totalDebt.toLocaleString()}` : 'NONE'}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-500 uppercase font-black text-[7px]">Net Valuation</span>
                <span className="text-blue-400 font-black text-xs italic">€{pVal.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
      <ActionModal {...modalConfig} currentPlayerCash={currentPlayer.cash} />
    </div>
  );
}
