'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Player } from '@/lib/types'

export default function GameController({ roomId }: { roomId: string }) {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    // 1. Carica i giocatori iniziali
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
      if (data) setPlayers(data)
    }

    fetchPlayers()

    // 2. Ascolta i cambiamenti in REAL-TIME
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'players',
        filter: `room_id=eq.${roomId}` 
      }, (payload) => {
        // Quando un giocatore si muove, aggiorna lo stato locale
        setPlayers((current) => 
          current.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return (
    <div className="fixed bottom-4 left-4 bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md">
      <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Players in Room</h4>
      {players.map(p => (
        <div key={p.id} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
          <span className="text-sm font-mono">{p.name} - Pos: {p.position}</span>
        </div>
      ))}
    </div>
  )
}
