'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#020408] flex items-center justify-center p-4 overflow-hidden font-sans text-white">
      {/* Luci ambientali dinamiche */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />

      {/* Tabellone con prospettiva */}
      <motion.div 
        initial={{ rotateX: 10, y: 20, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative grid grid-cols-7 grid-rows-7 w-full max-w-[850px] aspect-square border border-white/10 bg-slate-900/20 backdrop-blur-2xl rounded-3xl shadow-[0_0_80px_-20px_rgba(0,0,0,1)]"
      >
        {children}

        {/* Dashboard Centrale */}
        <div className="col-start-2 col-end-7 row-start-2 row-end-7 m-4 rounded-2xl border border-white/5 bg-black/40 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <h1 className="text-4xl font-black italic tracking-tighter text-white/5 select-none uppercase">Startup Race</h1>
          
          {/* Qui inseriremo il DiceRoller nel prossimo step */}
          <div id="dice-container" className="z-10"></div>
        </div>
      </motion.div>
    </div>
  );
}
