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
  const isSpecial = ['chance', 'tax', 'special', 'station'].includes(type);

  return (
    <motion.div 
      whileHover={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.03)' }}
      className={`relative border border-white/5 p-4 flex flex-col justify-between group transition-all duration-500 ${gridClass} ${isSpecial ? 'bg-white/[0.02]' : ''}`}
    >
      {/* Header Casella */}
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-mono text-slate-600 group-hover:text-blue-400 transition-colors">
          ID_{id < 10 ? `0${id}` : id}
        </span>
        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isSpecial ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700 group-hover:bg-slate-500'}`} />
      </div>

      {/* Nome e Tipologia */}
      <div className="space-y-1">
        <h3 className="text-[11px] md:text-[12px] font-bold text-slate-300 uppercase leading-tight tracking-tight group-hover:text-white transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] font-black text-blue-500/60 uppercase tracking-[0.2em]">
            {type}
          </span>
          {type === 'asset' && <div className="h-[1px] flex-1 bg-white/5" />}
        </div>
      </div>

      {/* Effetto Overlay al passaggio del mouse */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Linea di accento inferiore */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[1px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
