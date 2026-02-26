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
    players, currentPlayer, valuation, 
    movePlayer, upgradeBadge, applyEvent, applyFunding, nextTurn,
    gameWinner, attemptExit, calculateValuation
  } = useGameLogic(initialPlayers);

  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);

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
    const tileName = tile.name.toLowerCase();

    // 1. EXIT (Casella ID 27 o nome "Exit")
    if (tileName.includes("exit")) {
      const canExit = valuation >= 1000000 && currentPlayer.equity > 0;
      setModalConfig({
        isOpen: true,
        type: canExit ? 'success' : 'danger',
        title: "Tentativo di EXIT",
        description: canExit ? "La tua startup è pronta per il mercato. Vendi ora?" : "Valutazione insufficiente per una Exit (Min €1M).",
        impact: { details: `Valutazione attuale: €${valuation.toLocaleString()}` },
        actionLabel: canExit ? "Vendi e Vinci" : "Torna a lavorare",
        onAction: () => { if(canExit) attemptExit(); setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    // 2. SPECIAL (Imprevisti e Opportunità)
    if (tile.type === 'special' || tileName.includes("imprevisto") || tileName.includes("opportunità")) {
      const isOpp = tileName.includes("opportunità") || tile.id === 3 || tile.id === 15 || tile.id === 22;
      const deck = isOpp ? OPPORTUNITA : IMPREVISTI;
      const event = deck[Math.floor(Math.random() * deck.length)];
      setModalConfig({ 
        isOpen: true, type: isOpp ? 'opportunity' : 'danger_event', 
        title: event.title, description: event.effect, actionLabel: "Ok", 
        onAction: () => { applyEvent(event); setModalConfig({ isOpen: false }); nextTurn(); } 
      });
      return;
    }

    // 3. FUNDING (Caselle 0, 7, 14, 21 e simili)
    if (tile.type === 'funding' || tileName.includes("funding") || tileName.includes("start")) {
      if (tile.id === 0) { // Speciale per lo START
         setModalConfig({
           isOpen: true, type: 'success', title: "Nuovo Anno Fiscale",
           description: "Hai passato il via. Ricevi finanziamenti governativi e gestisci i debiti.",
           impact: { details: "+€25.000 Cash | Pagamento Interessi Debiti" },
           actionLabel: "Avanti",
           onAction: () => { setModalConfig({ isOpen: false }); nextTurn(); }
         });
         return;
      }
      
      const availableOffers = FUNDING_OFFERS.filter(o => currentPlayer.laps > 0 || o.type !== 'EQUITY');
      const offer = { ...availableOffers[Math.floor(Math.random() * availableOffers.length)] };
      let details = "";
      if (offer.type === 'EQUITY') {
        const dil = Math.max(15, (offer.equityRange.min + offer.equityRange.max) / 2);
        details = `Ricevi: +€${((valuation * dil) / 100).toLocaleString()} | Cedi: ${dil.toFixed(0)}% Equity`;
        offer.actualDilution = dil;
      } else if (offer.type === 'BANK') {
        offer.durationYears = Math.floor(Math.random() * 3) + 2;
        details = `Prestito: €${offer.fixedAmount.toLocaleString()} | Interessi: €${(offer.fixedAmount * offer.interestRate).toLocaleString()}/giro`;
      } else {
        details = `Grant: €${offer.fixedAmount.toLocaleString()}`;
      }

      setModalConfig({
        isOpen: true, type: 'info', title: offer.investor, description: offer.description,
        impact: { details }, actionLabel: "Accetta", secondaryActionLabel: "Rifiuta",
        onAction: () => { applyFunding(offer); setModalConfig({ isOpen: false }); nextTurn(); },
        onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    // 4. ASSET (Acquisto/Upgrade)
    if (tile.type === 'asset') {
      const owner = players.find(p => !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));
      if (owner) {
        const toll = tile.badges[owner.assets.find(a => a.tileId === tile.id)?.level || 'none']?.toll || 0;
        setModalConfig({ 
          isOpen: true, type: 'danger', title: "Pagamento Royalties", 
          description: `Sei su un asset di ${owner.name}`, impact: { details: `Paga: €${toll.toLocaleString()}` }, 
          actionLabel: "Paga", onAction: () => { setModalConfig({ isOpen: false }); nextTurn(); } 
        });
      } else {
        setModalConfig({ 
          isOpen: true, type: 'success', title: tile.name, description: "Vuoi investire in questo asset?",
          impact: { details: `Costo: €${tile.badges.bronze.cost.toLocaleString()} | Bonus MRR: +€${tile.badges.bronze.revenueBonus.toLocaleString()}` },
          actionLabel: "Investi", onAction: () => { upgradeBadge(tile.id); setModalConfig({ isOpen: false }); nextTurn(); }, 
          onClose: () => { setModalConfig({ isOpen: false }); nextTurn(); } 
        });
      }
      return;
    }

    // 5. TAX / MODIFICATORI DIRETTI (Caselle come ID 5, 13, 17)
    if (tile.type === 'tax' || tile.revenueModifier !== 0 || tile.costModifier !== 0) {
      const isPositive = (tile.revenueModifier || 0) > (tile.costModifier || 0);
      setModalConfig({
        isOpen: true, type: isPositive ? 'opportunity' : 'danger', title: tile.name,
        description: "L'ambiente di mercato influenza i tuoi numeri.",
        impact: { details: `MRR: ${tile.revenueModifier >= 0 ? '+' : ''}${tile.revenueModifier} | Costi: ${tile.costModifier >= 0 ? '+' : ''}${tile.costModifier}` },
        actionLabel: "Continua", onAction: () => { setModalConfig({ isOpen: false }); nextTurn(); }
      });
      return;
    }

    // 6. FALLBACK DI SICUREZZA (Se arriviamo qui, la casella è neutra)
    console.log("Casella neutra rilevata, cambio turno forzato.");
    nextTurn();
  };

  // ... Render (Invariato, usa la dashboard a 3 colonne dell'ultimo step)
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen items-start bg-slate-950 font-sans">
      <div className="relative w-full lg:w-[800px] aspect-square bg-slate-900 p-4 border border-blue-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="absolute inset-[25%] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[3rem] z-20 p-6 shadow-2xl text-center">
          <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }} />
            <span className="text-white font-black text-[9px] uppercase tracking-widest">{currentPlayer.name}</span>
          </div>
          <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-2xl border-2 transition-all duration-150 ${isRolling ? 'scale-110 border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.4)] rotate-12' : 'border-white/10'} bg-slate-800 text-white text-3xl font-black`}>
            {diceValue || '?'}
          </div>
          <div className="text-2xl font-black text-white italic mb-1 tracking-tighter">€{valuation.toLocaleString()}</div>
          <span className="text-blue-400 font-mono text-[7px] uppercase tracking-widest opacity-60 mb-6 block">Company Valuation</span>
          <button onClick={handleDiceRoll} disabled={isRolling || modalConfig.isOpen} className={`px-10 py-3 font-black rounded-xl transition-all uppercase tracking-widest text-[10px] shadow-lg ${isRolling ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'}`}>
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

      <div className="w-full lg:w-[350px] space-y-3">
        <h3 className="text-blue-400 font-black tracking-[0.2em] uppercase text-[10px] mb-2 px-2 italic opacity-80">Market Overview</h3>
        {players.map((p) => {
          const isTurn = p.id === currentPlayer.id;
          const currentEbitda = p.mrr - p.monthlyCosts;
          const pVal = calculateValuation(p);
          return (
            <div key={p.id} className={`p-4 rounded-2xl border transition-all duration-500 ${isTurn ? 'bg-blue-600/20 border-blue-500 shadow-xl' : 'bg-slate-900/50 border-white/5 opacity-80'} ${p.isBankrupt ? 'grayscale opacity-50 contrast-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white font-bold text-xs uppercase tracking-tight">{p.name}</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{p.equity.toFixed(0)}% EQ</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-bold mb-1">Cash</span>
                  <span className="text-white font-mono font-bold">€{p.cash.toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-bold mb-1">EBITDA</span>
                  <span className={`font-mono font-bold ${currentEbitda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>€{currentEbitda.toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg text-center">
                  <span className="text-slate-500 block text-[6px] uppercase font-bold mb-1">Debts</span>
                  <span className="text-amber-400 font-mono font-bold">{p.debts.length > 0 ? `${p.debts.length} Act.` : 'None'}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-500 uppercase font-bold text-[7px]">Net Valuation</span>
                <span className="text-blue-400 font-black text-xs italic">€{pVal.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
      <ActionModal {...modalConfig} onClose={() => { if (modalConfig.onClose) modalConfig.onClose(); setModalConfig({ ...modalConfig, isOpen: false }); }} />
    </div>
  );
}
