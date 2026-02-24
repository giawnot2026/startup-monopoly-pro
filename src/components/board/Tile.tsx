'use client'
import React from 'react';
import { motion } from 'framer-motion';

interface TileProps {
  id: number;
  name: string;
  type: string;
  gridClass: string;
}

export default function Tile({ id, name, type, gridClass }: TileProps) {
  const isSpecial = type === 'chance' || type === 'tax' || type === 'special' || type === 'station';

  return (
    <motion.div 
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className={`relative border border-white/5 p-3 flex flex-col justify-between group transition-all ${gridClass} ${isSpecial ? 'bg-white/5' : ''}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-mono text-slate-500 italic">ID_0{id}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-blue-500 group-hover:shadow-[0_0_8px_#3b82f6] transition-all" />
      </div>

      <h3 className="text-[10px] md:text-[11px] font-black text-slate-200 uppercase tracking-tight leading-tight mb-1 group-hover:text-white">
        {name}
      </h3>

      <div className="flex justify-between items-end">
        <span className="text-[7px] font-bold text-blue-400/60 uppercase tracking-widest">{type}</span>
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
