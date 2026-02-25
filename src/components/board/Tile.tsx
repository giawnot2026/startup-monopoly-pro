'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Tile({ id, name, type, gridClass }: any) {
  const isSpecial = ['special', 'chance', 'tax'].includes(type);
  
  return (
    <motion.div 
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      className={`relative p-3 flex flex-col justify-between border border-white/5 transition-colors ${gridClass} ${isSpecial ? 'bg-white/[0.03]' : 'bg-transparent'}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-[8px] font-mono text-slate-500">0x{id}</span>
        <div className={`w-1 h-1 rounded-full ${isSpecial ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-800'}`} />
      </div>
      <div className="mt-auto">
        <h3 className="text-[10px] font-bold text-slate-200 leading-tight uppercase truncate">{name}</h3>
        <p className={`text-[6px] font-black uppercase tracking-widest mt-1 ${isSpecial ? 'text-blue-400' : 'text-slate-600'}`}>{type}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
}
