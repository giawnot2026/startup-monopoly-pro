'use client'
import React, { useState } from 'react';
import GameBoard from '@/components/board/GameBoard';
import GameLobby from '@/components/GameLobby';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';

export default function Home() {
  const [gameData, setGameData] = useState<{
    roomCode: string;
    playerName: string;
    victoryTarget: number;
  } | null>(null);
  const [showRules, setShowRules] = useState(false);

  // Funzione chiamata quando un utente crea o si unisce a una stanza nella Lobby
  const handleJoinGame = (roomCode: string, playerName: string, victoryTarget: number) => {
    setGameData({ roomCode, playerName, victoryTarget });
  };

  // Se non siamo ancora entrati in una stanza, mostriamo la Lobby con la tua grafica originale
  if (!gameData) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        {/* Sfondo con gradienti e blur originali */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <GameLobby onJoinGame={handleJoinGame} />
          
          {/* Pulsante Regolamento */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => setShowRules(true)}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-400 hover:text-blue-400 transition-all"
            >
              <BookOpen size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Leggi Regolamento</span>
            </button>
          </div>
        </div>

        {/* Modal Regole (Invariato) */}
        <AnimatePresence>
          {showRules && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowRules(false)} 
                  className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3 text-blue-400 mb-6 font-black uppercase tracking-widest text-sm">
                  <div className="w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  Regolamento di Gioco
                </div>

                <div className="space-y-4 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p><strong className="text-white uppercase text-[10px] block mb-1 text-blue-400">Obiettivo</strong> 
                    Raggiungere la valutazione target selezionata e atterrare sulla casella EXIT per vendere l'azienda.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p><strong className="text-white uppercase text-[10px] block mb-1 text-emerald-400">Valuation</strong> 
                    Calcolata come (EBITDA * 12 * 10) + Cassa Liquida.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p><strong className="text-white uppercase text-[10px] block mb-1 text-amber-400">Quarterly Review</strong> 
                    Ogni volta che passi dal "Via", incassi i profitti e paghi le rate dei debiti.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // Una volta effettuato l'accesso alla stanza, carichiamo il GameBoard
  return (
    <div className="min-h-screen bg-[#1e293b] relative overflow-hidden text-slate-100 p-6 font-sans">
      
      {/* Effetto gradiente radiale per dare luce al centro */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(51,65,85,0.5)_0%,_rgba(15,23,42,0.8)_100%)] pointer-events-none" />

      {/* Blob decorativi: Colori pastello molto sfumati per il tocco "giovane" */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Griglia tecnica chiara quasi invisibile */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Contenuto del Gioco */}
      <main className="relative z-10 flex items-center justify-center min-h-[90vh]">
        <GameBoard 
          roomCode={gameData.roomCode} 
          localPlayerName={gameData.playerName}
          victoryTarget={gameData.victoryTarget} 
        />
      </main>
    </div>
  );
}
