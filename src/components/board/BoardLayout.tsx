// src/components/board/BoardLayout.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#020408] flex items-center justify-center p-4 overflow-hidden">
      {/* Luci ambientali dinamiche di sfondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

      {/* Griglia Tecnica di Sfondo */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      
      {/* Contenitore Prospettico del Tabellone */}
      <motion.div 
        initial={{ rotateX: 15, scale: 0.8, opacity: 0 }}
        animate={{ rotateX: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative grid grid-cols-7 grid-rows-7 w-full max-w-[900px] aspect-square border border-white/5 bg-slate-900/10 backdrop-blur-2xl rounded-3xl shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}

        {/* Dashboard Centrale (Inner Board) */}
        <div className="col-start-2 col-end-7 row-start-2 row-end-7 m-4 rounded-2xl border border-white/10 bg-black/40 shadow-inner flex flex-col items-center justify-center relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50" />
          
          {/* Logo Animato */}
          <motion.h1 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-5xl font-black italic tracking-tighter text-white/10 select-none uppercase"
          >
            Startup Race
          </motion.h1>
          
          {/* Scanline Effect stile monitor anni '90 */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
      </motion.div>
    </div>
  );
}
