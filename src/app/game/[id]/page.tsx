'use client'
import React from 'react';
import { useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="border border-blue-500 p-10 rounded-2xl bg-slate-900 shadow-[0_0_50px_rgba(59,130,246,0.2)] text-center">
        <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">Startup Race</h1>
        <p className="text-blue-400 font-mono">Room ID: <span className="text-white">{id}</span></p>
        <div className="mt-8 p-4 bg-white/5 rounded border border-white/10">
          <p className="text-sm text-slate-400">Se vedi questa schermata, la rotta dinamica funziona.</p>
        </div>
      </div>
    </div>
  );
}
