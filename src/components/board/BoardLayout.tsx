'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#030712] flex items-center justify-center p-6 overflow-hidden">
      {/* Effetti di luce ambientale */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(3,7,18,1)_100%)]" />
      <div className="absolute w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full" />

      {/* Main Board Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative grid grid-cols-7 grid-rows-7 w-full max-w-[900px] aspect-square border border-white/10 bg-slate-900/10 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] p-2"
      >
        {children}

        {/* Dashboard Centrale - Area interattiva per i dadi */}
        <div className="col-start-2 col-end-7 row-start-2 row-end-7 m-4 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center z-10"
          >
            <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 select-none uppercase">
              Startup Race
            </h1>
            <div className="h-[2px] w-24 bg-blue-500 mx-auto mt-4 shadow-[0_0_15px_#3b82f6]" />
            <p className="mt-4 text-blue-400/40 font-mono text-[10px] tracking-[0.3em] uppercase">Venture Capital Edition</p>
          </motion.div>

          {/* Glow centrale pulsante */}
          <div className="absolute w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
