'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Tile({ id, name, type, gridClass }: any) {
  const isFunding = type === 'funding';
  const isTax = type === 'tax';
  
  return (
    <motion.div 
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', scale: 0.98 }}
      className={`relative p-3 flex flex-col justify-between border border-white/5 transition-all duration-300 group ${gridClass} 
        ${isFunding ? 'bg-blue-600/10 border-blue-500/30' : 'bg-transparent'} 
        ${isTax ? 'hover:border-red-500/30' : 'hover:border-blue-500/30'}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-[8px] font-mono text-slate-500 group-hover:text-blue-400">0x{id}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${isFunding ? 'bg-blue-400 shadow-[0_0_10px_#3b82f6] animate-pulse' : 'bg-slate-800'}`} />
      </div>

      <div className="mt-auto">
        <h3 className={`text-[10px] font-bold leading-tight uppercase tracking-tight 
          ${isFunding ? 'text-blue-300' : 'text-slate-200'}
        `}>
          {name}
        </h3>
        <p className={`text-[6px] font-black uppercase tracking-[0.2em] mt-1
          ${isFunding ? 'text-blue-400' : isTax ? 'text-red-500' : 'text-slate-600'}
        `}>
          {type}
        </p>
      </div>

      {/* Effetto sweep al passaggio */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
