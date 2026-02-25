'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[850px] aspect-square">
      {/* Background Decor */}
      <div className="absolute -inset-10 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Container della Griglia */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-8 grid-rows-8 w-full h-full gap-1 p-1 bg-slate-950 border border-white/10 rounded-[2rem] shadow-2xl relative"
      >
        {children}

        {/* Logo Centrale Solidificato */}
        <div className="col-start-2 col-end-8 row-start-2 row-end-8 m-2 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <h1 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter z-10">
            STARTUP <span className="text-blue-500">RACE</span>
          </h1>
          <div className="h-1 w-20 bg-blue-600 mt-4 rounded-full z-10" />
          <p className="text-[10px] text-slate-500 font-mono tracking-[0.4em] mt-6 z-10">VENTURE_ENGINE_2026</p>
        </div>
      </motion.div>
    </div>
  );
}
