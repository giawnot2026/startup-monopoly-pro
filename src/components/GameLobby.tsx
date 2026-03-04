'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Users, Target, ArrowRight } from 'lucide-react';

interface LobbyProps {
  onJoinGame: (roomCode: string, playerName: string, victoryTarget: number) => void;
}

export default function GameLobby({ onJoinGame }: LobbyProps) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [victoryTarget, setVictoryTarget] = useState(20000000); // Default 20M
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Funzione per creare o unirsi a una stanza
  const handleStart = async (mode: 'create' | 'join') => {
    if (!roomCode || !playerName) {
      setError("Inserisci codice stanza e il tuo nome.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Controlliamo se la stanza esiste già
    const { data: room, error: fetchError } = await supabase
      .from('multiplayer_games')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (mode === 'create') {
      if (room) {
        setError("Questa stanza esiste già. Scegli un altro codice o clicca Partecipa.");
        setLoading(false);
        return;
      }

      // Crea nuova stanza con lo stato iniziale
      const initialState = {
        players: [{
          id: 1,
          name: playerName,
          color: '#3b82f6', // Blu per il primo
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

      const { error: insertError } = await supabase
        .from('multiplayer_games')
        .insert([{ 
          room_code: roomCode.toUpperCase(), 
          game_state: initialState 
        }]);

      if (insertError) {
        setError("Errore nella creazione della stanza.");
      } else {
        localStorage.setItem('my_founder_name', playerName);
        onJoinGame(roomCode.toUpperCase(), playerName, victoryTarget);
      }
    } else {
      // Modalità JOIN
      if (!room) {
        setError("Stanza non trovata.");
        setLoading(false);
        return;
      }

      const state = room.game_state;
      // Controllo se il nome è già preso
      if (state.players.some((p: any) => p.name.toLowerCase() === playerName.toLowerCase())) {
        setError("Questo nome è già occupato in questa stanza.");
        setLoading(false);
        return;
      }

      // Aggiunge il nuovo giocatore allo stato
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const newPlayer = {
        id: state.players.length + 1,
        name: playerName,
        color: colors[state.players.length % colors.length],
        position: 0,
        cash: 100000,
        mrr: 5000,
        monthlyCosts: 3000,
        equity: 100,
        assets: [],
        debts: [],
        laps: 0,
        isBankrupt: false
      };

      const updatedState = {
        ...state,
        players: [...state.players, newPlayer]
      };

      const { error: updateError } = await supabase
        .from('multiplayer_games')
        .update({ game_state: updatedState })
        .eq('room_code', roomCode.toUpperCase());

      if (updateError) {
        setError("Errore durante l'accesso alla stanza.");
      } else {
        localStorage.setItem('my_founder_name', playerName);
        onJoinGame(roomCode.toUpperCase(), playerName, state.victoryTarget);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Rocket className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Startup Scalata</h1>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em] mt-2">Multiplayer Engine</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block ml-1">Codice Stanza</label>
            <input 
              type="text" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ES: UNICORN2026"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block ml-1">Tuo Nome Founder</label>
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Inserisci il tuo nome"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {!isCreating ? (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleStart('join')}
                disabled={loading}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
              >
                Partecipa
              </button>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                Crea Nuova
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 block ml-1">Obiettivo Exit (EUR)</label>
                <input 
                  type="number" 
                  value={victoryTarget}
                  onChange={(e) => setVictoryTarget(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsCreating(false)} className="flex-1 bg-white/5 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest">Indietro</button>
                <button 
                  onClick={() => handleStart('create')}
                  disabled={loading}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                >
                  Inizia Scalata
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <p className="text-rose-500 text-[10px] font-mono uppercase text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
