'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Tile({ id, name, type, gridClass }: any) {
  const isFunding = type === 'funding';
  const isTax = type === 'tax';
  const isCorner = [0, 7, 14, 21].includes(id);
  
  return (
    <motion.div 
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      className={`relative p-2 md:p-3 flex flex-col justify-between border border-white/5 transition-colors overflow-hidden ${gridClass} 
        ${isCorner ? 'bg-blue-600/5' : 'bg-transparent'}
      `}
    >
      <div className="flex justify-between items-start relative z-10">
        <span className="text-[7px] font-mono text-slate-500">0x{id}</span>
        <div className={`w-1 h-1 rounded-full ${isCorner ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-800'}`} />
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className={`text-[9px] md:text-[10px] font-bold leading-tight uppercase tracking-tight 
          ${isCorner ? 'text-blue-300' : 'text-slate-200'}
        `}>
          {name}
        </h3>
        <p className={`text-[6px] font-black uppercase tracking-tighter mt-1
          ${isFunding ? 'text-blue-400' : isTax ? 'text-red-500/80' : 'text-slate-600'}
        `}>
          {type}
        </p>
      </div>

      {/* Sfondo per gli angoli */}
      {isCorner && (
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
      )}
    </motion.div>
  );
}
