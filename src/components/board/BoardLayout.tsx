'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[950px] aspect-square mx-auto">
      {/* Effetti di luce ambientale */}
      <div className="absolute inset-[-10%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-8 grid-rows-8 w-full h-full gap-1 p-1 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        {children}

        {/* Nucleo Centrale: occupa lo spazio da riga 2 a 7 e colonna 2 a 7 */}
        <div className="col-start-2 col-end-8 row-start-2 row-end-8 m-2 rounded-3xl bg-gradient-to-br from-slate-950 via-black to-slate-950 border border-white/5 flex flex-col items-center justify-center shadow-inner relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          
          <div className="z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
              STARTUP <span className="text-blue-500">RACE</span>
            </h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto mt-4 rounded-full shadow-[0_0_20px_#2563eb]" />
            <p className="text-[10px] text-slate-500 mt-6 tracking-[0.5em] font-mono uppercase">Venture_Engine_2026</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
