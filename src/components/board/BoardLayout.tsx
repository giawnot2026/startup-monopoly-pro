'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden">
      {/* Luci ambientali di profondità */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 blur-[100px] rounded-full" />

      {/* Griglia Principale */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative grid grid-cols-7 grid-rows-7 w-full max-w-[850px] aspect-square gap-1 p-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl"
      >
        {children}

        {/* Centro del Tabellone */}
        <div className="col-start-2 col-end-7 row-start-2 row-end-7 m-2 rounded-2xl bg-gradient-to-br from-slate-900/80 to-black/90 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="z-10 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white italic uppercase italic">
              STARTUP <span className="text-blue-500">RACE</span>
            </h1>
            <div className="h-1 w-20 bg-blue-600 mx-auto mt-2 rounded-full shadow-[0_0_15px_#2563eb]" />
            <p className="text-[10px] text-slate-500 mt-4 tracking-[0.4em] font-mono">ESTABLISHED_2026</p>
          </motion.div>

          {/* Glow centrale */}
          <div className="absolute w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
