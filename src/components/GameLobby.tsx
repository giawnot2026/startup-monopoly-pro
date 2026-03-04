'use client'
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Play, Plus, HelpCircle, Target, ArrowLeft } from 'lucide-react';

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

    const { data: room } = await supabase
      .from('multiplayer_games')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (mode === 'create') {
      if (room) {
        setError("Codice già in uso.");
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
        status: 'waiting'
      };

      await supabase.from('multiplayer_games').insert([{ 
        room_code: roomCode.toUpperCase(), 
        game_state: initialState 
      }]);
      
      onJoinGame(roomCode.toUpperCase(), playerName, victoryTarget);
    } else {
      if (!room) {
        setError("Stanza non trovata.");
        setLoading(false);
        return;
      }
      const state = room.game_state;
      if (state.players.some((p: any) => p.name.toLowerCase() === playerName.toLowerCase())) {
        setError("Nome già preso.");
        setLoading(false);
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
        }]
      };

      await supabase.from('multiplayer_games').update({ game_state: updatedState }).eq('room_code', roomCode.toUpperCase());
      onJoinGame(roomCode.toUpperCase(), playerName, state.victoryTarget);
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
        <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">
          Startup <span className="text-blue-500 not-italic">Tycoon</span>
        </h1>
      </div>

      <div className="space-y-6">
        {/* INPUT CODICE E NOME */}
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Codice Stanza</p>
            <input 
              type="text" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ES: UNICORN"
              className="w-full bg-transparent border-none text-white font-bold focus:ring-0 text-xl"
            />
          </div>

          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Tuo Nome Founder</p>
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Inserisci nome..."
              className="w-full bg-transparent border-none text-white font-bold focus:ring-0 text-xl"
            />
          </div>
        </div>

        {isCreating ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-4">Valutazione Target</p>
              <div className="grid grid-cols-3 gap-3">
                {VICTORY_TARGETS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setVictoryTarget(t.value)}
                    className={`py-3 px-2 rounded-2xl border text-xs font-black transition-all ${
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
              <button onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest"><ArrowLeft size={16} className="inline mr-2"/> Indietro</button>
              <button onClick={() => handleStart('create')} className="flex-[2] py-4 bg-emerald-600 rounded-2xl font-black uppercase text-sm shadow-xl shadow-emerald-500/20">Crea Partita</button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleStart('join')}
              className="py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
            >
              Partecipa
            </button>
            <button 
              onClick={() => setIsCreating(true)}
              className="py-6 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/20"
            >
              Crea Nuova
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-[10px] font-black uppercase text-center">{error}</p>}
      </div>
    </motion.div>
  );
}
