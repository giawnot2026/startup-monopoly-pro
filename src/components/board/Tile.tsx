'use client'
import React from 'react';

interface TileProps {
  id: number;
  name: string;
  type: string;
  gridClass: string;
}

export default function Tile({ id, name, type, gridClass }: TileProps) {
  const isSpecial = ['chance', 'tax', 'special', 'station'].includes(type);

  return (
    <div className={`relative border border-white/5 p-4 flex flex-col justify-between group transition-all duration-500 ${gridClass} ${isSpecial ? 'bg-white/[0.02]' : ''}`}>
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-mono text-slate-600 group-hover:text-blue-400 transition-colors">
          ID_{id < 10 ? `0${id}` : id}
        </span>
        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isSpecial ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`} />
      </div>

      <div className="space-y-1">
        <h3 className="text-[11px] font-bold text-slate-300 uppercase leading-tight group-hover:text-white">
          {name}
        </h3>
        <span className="text-[7px] font-black text-blue-500/60 uppercase tracking-widest">
          {type}
        </span>
      </div>
    </div>
  );
}
