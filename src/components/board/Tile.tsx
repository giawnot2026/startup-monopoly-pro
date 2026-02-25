'use client'
import React from 'react';

export default function Tile({ id, name, type, gridClass }: any) {
  // Fix per Errore #31: trasformiamo qualsiasi oggetto in stringa
  const displayName = typeof name === 'object' ? JSON.stringify(name) : String(name);
  const displayType = typeof type === 'object' ? 'special' : String(type);
  
  const isSpecial = ['chance', 'tax', 'special', 'station'].includes(displayType);

  return (
    <div className={`relative border border-white/5 p-3 flex flex-col justify-between ${gridClass} ${isSpecial ? 'bg-white/[0.03]' : ''}`}>
      <div className="flex justify-between items-start">
        <span className="text-[8px] font-mono text-slate-600">ID_{id}</span>
        <div className={`w-1 h-1 rounded-full ${isSpecial ? 'bg-blue-400' : 'bg-slate-700'}`} />
      </div>
      <div className="space-y-1">
        <h3 className="text-[10px] font-bold text-slate-200 uppercase leading-tight truncate">
          {displayName}
        </h3>
        <span className="text-[6px] font-black text-blue-500/50 uppercase tracking-widest">
          {displayType}
        </span>
      </div>
    </div>
  );
}
