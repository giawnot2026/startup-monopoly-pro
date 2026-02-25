'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Tile({ id, name, type, style }: any) {
  const isCorner = [0, 7, 14, 21].includes(id);
  const isTax = type === 'tax';
  const isFunding = type === 'funding';

  return (
    <motion.div 
      style={style} // Applica qui la posizione row/col fissa
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      className={`relative p-2 flex flex-col justify-between border border-white/10 transition-colors h-full w-full overflow-hidden
        ${isCorner ? 'bg-blue-900/20' : 'bg-transparent'}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-[7px] font-mono text-slate-500 tracking-tighter transition-colors group-hover:text-blue-400">0x{id}</span>
        <div className={`w-1 h-1 rounded-full ${isCorner ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`} />
      </div>

      <div className="mt-auto">
        <h3 className={`text-[8px] md:text-[9px] font-bold leading-[1.1] uppercase tracking-tighter
          ${isCorner ? 'text-blue-300' : 'text-slate-100'}
        `}>
          {name}
        </h3>
        <p className={`text-[6px] font-black uppercase tracking-widest mt-0.5
          ${isFunding ? 'text-blue-400' : isTax ? 'text-red-500' : 'text-slate-600'}
        `}>
          {type}
        </p>
      </div>

      {/* Glow laterale per gli angoli */}
      {isCorner && <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />}
    </motion.div>
  );
}
