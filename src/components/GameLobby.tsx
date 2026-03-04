'use client'
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Play, Plus, HelpCircle, Target, ArrowLeft, Loader2 } from 'lucide-react';

interface LobbyProps {
  onJoinGame: (roomCode: string, playerName: string, victoryTarget: number) => void;
}

const AVAILABLE_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
const VICTORY_TARGETS = [
  { label: '5 Milioni', value: 5000000 },
  { label: '20 Milioni', value: 20000000 },
  { label: '50 Milioni', value: 50000000 }
];

export default function GameLobby({ onJoinGame }: LobbyProps) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [victoryTarget, setVictoryTarget] = useState(20000000);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async (mode: 'create' | 'join') => {
    if (!roomCode || !playerName) {
      setError("Inserisci codice stanza e il tuo nome.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Controllo se la stanza esiste già
      const { data: room, error: fetchError } = await supabase
        .from('multiplayer_games')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (mode === 'create') {
        if (room) {
          setError("Codice già in uso. Scegline un altro.");
          setLoading(false);
          return;
        }

        const initialState = {
          players: [{
            id: 1,
            name: playerName,
            color: AVAILABLE_COLORS[0],
            position: 0,
            cash: 100000,
            mrr: 5000,
            monthlyCosts: 3000,
            equity: 100,
            assets: [],
            debts: [],
            laps: 0,
            isBankrupt: false
          }],
          currentPlayerIndex: 0,
          victoryTarget: victoryTarget,
          status: 'waiting',
          lastUpdate: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('multiplayer_games')
          .insert([{ 
            room_code: roomCode.toUpperCase(), 
            game_state: initialState 
          }]);

        if (insertError) throw insertError;
        
        onJoinGame(roomCode.toUpperCase(), playerName, victoryTarget);
      } else {
        // MODALITÀ JOIN
        if (!room) {
          setError("Stanza non trovata.");
          setLoading(false);
          return;
        }

        const state = room.game_state;
        
        // Verifica se il giocatore è già dentro
        if (state.players.some((p: any) => p.name.toLowerCase() === playerName.toLowerCase())) {
          // Se esiste già, lo facciamo rientrare senza duplicarlo
          onJoinGame(roomCode.toUpperCase(), playerName, state.victoryTarget);
          return;
        }

        const updatedState = {
          ...state,
          players: [...state.players, {
            id: state.players.length + 1,
            name: playerName,
            color: AVAILABLE_COLORS[state.players.length % AVAILABLE_COLORS.length],
            position: 0,
            cash: 100000,
            mrr: 5000,
            monthlyCosts: 3000,
            equity: 100,
            assets: [],
            debts: [],
            laps: 0,
            isBankrupt: false
          }],
          lastUpdate: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('multiplayer_games')
          .update({ game_state: updatedState })
          .eq('room_code', roomCode.toUpperCase());

        if (updateError) throw updateError;

        onJoinGame(roomCode.toUpperCase(), playerName, state.victoryTarget);
      }
    } catch (err: any) {
      console.error("Errore Supabase:", err);
      setError("Errore di connessione al database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Rocket className="text-white" size={24} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">
            Startup <span className="text-blue-500 not-italic">Tycoon</span>
          </h1>
          <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase mt-1 ml-1">Multiplayer Edition</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Codice Stanza</p>
            <input 
              type="text" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ES: UNICORN"
              disabled={loading}
              className="w-full bg-transparent border-none text-white font-bold focus:ring-0 text-xl placeholder:text-white/10"
            />
          </div>

          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Tuo Nome Founder</p>
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Inserisci nome..."
              disabled={loading}
              className="w-full bg-transparent border-none text-white font-bold focus:ring-0 text-xl placeholder:text-white/10"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div 
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-4">Valutazione Target per Vincere</p>
                <div className="grid grid-cols-3 gap-3">
                  {VICTORY_TARGETS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setVictoryTarget(t.value)}
                      className={`py-3 px-2 rounded-2xl border text-[10px] font-black transition-all ${
                        victoryTarget === t.value 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsCreating(false)} 
                  disabled={loading}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors"
                >
                  <ArrowLeft size={14} className="inline mr-2 mb-0.5"/> Indietro
                </button>
                <button 
                  onClick={() => handleStart('create')} 
                  disabled={loading}
                  className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-sm shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Crea Partita'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-2 gap-4"
            >
              <button 
                onClick={() => handleStart('join')}
                disabled={loading}
                className="py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Partecipa'}
              </button>
              <button 
                onClick={() => setIsCreating(true)}
                disabled={loading}
                className="py-6 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Crea Nuova
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-red-400 text-[10px] font-black uppercase text-center bg-red-400/10 py-2 rounded-xl border border-red-400/20"
          >
            {error}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
