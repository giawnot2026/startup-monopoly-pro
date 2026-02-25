'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden">
      {/* Sfondo con profondità */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />

      {/* Griglia 8x8 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative grid grid-cols-8 grid-rows-8 w-full max-w-[900px] aspect-square gap-1 p-1 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl"
      >
        {children}

        {/* Centro del Tabellone (Area 6x6 interna) */}
        <div className="col-start-2 col-end-8 row-start-2 row-end-8 m-2 rounded-2xl bg-gradient-to-br from-slate-900/60 to-black/80 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="z-10 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white italic uppercase">
              STARTUP <span className="text-blue-500 shadow-blue-500/50">RACE</span>
            </h1>
            <div className="h-1 w-16 bg-blue-600 mx-auto mt-2 rounded-full shadow-[0_0_15px_#2563eb]" />
            <p className="text-[10px] text-slate-500 mt-4 tracking-[0.4em] font-mono uppercase">Venture_Engine_2026</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
