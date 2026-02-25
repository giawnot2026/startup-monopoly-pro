'use client'
import React, { useState, useEffect } from 'react';
import GameBoard from '@/components/board/GameBoard';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Play, Plus, Trash2, HelpCircle, X, BookOpen } from 'lucide-react';

const AVAILABLE_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [players, setPlayers] = useState([
    { name: "Founder 1", color: "#3b82f6" },
    { name: "Founder 2", color: "#ef4444" }
  ]);

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, { 
        name: `Founder ${players.length + 1}`, 
        color: AVAILABLE_COLORS[players.length] 
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: string, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  if (!gameStarted) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        {/* Luci di background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
        >
          {/* Header & Regole */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Rocket className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                Startup <span className="text-blue-500 not-italic">Tycoon</span>
              </h1>
            </div>
            <button 
              onClick={() => setShowRules(true)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-blue-400 transition-all border border-white/5"
            >
              <HelpCircle size={24} />
            </button>
          </div>

          {/* Lista Giocatori */}
          <div className="space-y-4 mb-10">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Configura i Founder</p>
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5"
                >
                  <input 
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    className="flex-1 bg-transparent border-none text-white font-bold focus:ring-0"
                    placeholder="Nome..."
                  />
                  <div className="flex gap-1.5">
                    {AVAILABLE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => updatePlayer(index, 'color', c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${player.color === c ? 'border-white scale-125' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => removePlayer(index)}
                    className="p-2 text-slate-600 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length < 4 && (
              <button 
                onClick={addPlayer}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-blue-500/50 hover:text-blue-400 transition-all"
              >
                <Plus size={18} /> Aggiungi Founder
              </button>
            )}
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="w-full group relative flex items-center justify-center gap-3 py-6 bg-blue-600 text-white font-black text-lg uppercase rounded-2xl transition-all hover:bg-blue-500 shadow-xl"
          >
            <Play size={20} fill="currentColor" />
            Inizia Scalata
          </button>
        </motion.div>

        {/* Modal Regole */}
        <AnimatePresence>
          {showRules && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative"
              >
                <button onClick={() => setShowRules(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
                <div className="flex items-center gap-3 text-blue-400 mb-6 font-black uppercase tracking-widest text-sm">
                  <BookOpen size={20} /> Regolamento
                </div>
                <div className="space-y-4 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                  <p><strong className="text-white">Obiettivo:</strong> Raggiungere la valutazione più alta investendo in asset tecnologici.</p>
                  <p><strong className="text-white">Valuation:</strong> Calcolata come (EBITDA * 12 * 10) + Cassa Liquida.</p>
                  <p><strong className="text-white">Badge:</strong> Acquistare badge permette di riscuotere pedaggi (commissioni) dagli altri founder che atterrano sulla tua casella.</p>
                  <p><strong className="text-white">Quarterly Review:</strong> Ogni volta che passi dal "Via", incassi il profitto trimestrale (MRR - Costi) x 3.</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 py-10 flex items-center justify-center">
      <GameBoard initialPlayers={players} />
    </main>
  );
}
