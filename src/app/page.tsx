'use client'
import React, { useState } from 'react';
import GameBoard from '@/components/board/GameBoard';
import { motion } from 'framer-motion';
import { Rocket, Users, Play } from 'lucide-react';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playersCount, setPlayersCount] = useState(2);

  // Schermata di Setup
  if (!gameStarted) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-blue-500/30">
        {/* Background Glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl overflow-hidden"
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
              <Rocket className="text-white" size={40} />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">
              STARTUP <span className="text-blue-500 font-mono not-italic text-4xl">TYCOON</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em]">Scalabilità o Fallimento</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                <Users size={14} /> Numero di Founder
              </label>
              
              <div className="grid grid-cols-3 gap-4">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPlayersCount(num)}
                    className={`relative overflow-hidden py-6 rounded-2xl border-2 transition-all duration-300 group
                      ${playersCount === num 
                        ? 'border-blue-500 bg-blue-600/10 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                        : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="relative z-10 text-2xl font-black">{num}</span>
                    {playersCount === num && (
                      <motion.div layoutId="active-bg" className="absolute inset-0 bg-blue-600 opacity-10" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setGameStarted(true)}
              className="w-full group relative flex items-center justify-center gap-3 py-6 bg-white text-black font-black text-lg uppercase rounded-2xl transition-all hover:bg-blue-400 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            >
              <Play size={20} fill="currentColor" />
              Inizia Round Seed
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-600 text-[9px] uppercase tracking-widest font-bold">
              Budget Iniziale: <span className="text-slate-400 italic">€50,000</span> • Multiplo Valuation: <span className="text-slate-400 italic">10x EBITDA</span>
            </p>
          </div>
        </motion.div>
      </main>
    );
  }

  // Se il gioco è iniziato, renderizziamo il GameBoard passando il numero di giocatori
  return (
    <main className="min-h-screen bg-slate-950 py-10 flex items-center justify-center">
      <GameBoard playersCount={playersCount} />
    </main>
  );
}
