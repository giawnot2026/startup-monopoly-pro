'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Tile({ id, name, type, gridClass }: any) {
  const isFunding = type === 'funding';
  const isTax = type === 'tax';
  const isCorner = [0, 7, 14, 21].includes(id);

  return (
    <motion.div 
      className={`relative p-2 md:p-3 flex flex-col justify-between border border-white/5 transition-all duration-300 ${gridClass} 
        ${isCorner ? 'bg-blue-600/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'bg-transparent'}
        hover:bg-white/[0.07] hover:border-white/20
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-[7px] md:text-[8px] font-mono text-slate-500">0x{id}</span>
        <div className={`w-1 h-1 rounded-full ${isCorner ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`} />
      </div>

      <div className="mt-auto overflow-hidden">
        <h3 className={`text-[8px] md:text-[10px] font-bold leading-tight uppercase tracking-tight truncate
          ${isCorner ? 'text-blue-300' : 'text-slate-200'}
        `}>
          {name}
        </h3>
        <p className={`text-[6px] font-black uppercase tracking-tighter mt-0.5
          ${isFunding ? 'text-blue-400' : isTax ? 'text-red-500/70' : 'text-slate-600'}
        `}>
          {type}
        </p>
      </div>

      {isCorner && (
        <div className="absolute inset-0 border-2 border-blue-500/20 pointer-events-none" />
      )}
    </motion.div>
  );
}
