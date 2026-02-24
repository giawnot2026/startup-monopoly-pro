// src/components/board/Tile.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { SectorId, SECTORS } from '@/lib/sectors';

interface TileProps {
  id: number;
  name: string;
  type: string;
  ownerSector?: SectorId;
  gridClass: string;
}

export default function Tile({ id, name, type, ownerSector, gridClass }: TileProps) {
  const color = ownerSector ? SECTORS[ownerSector].color : '#1e293b';

  return (
    <motion.div 
      whileHover={{ z: 20, backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
      className={`relative border border-white/5 p-3 flex flex-col justify-between overflow-hidden group transition-all ${gridClass}`}
    >
      {/* Glow Effect se posseduta */}
      {ownerSector && (
        <div 
          className="absolute top-0 left-0 w-full h-[2px] blur-[1px]"
          style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
        />
      )}

      <div className="z-10">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-mono text-slate-500">ID_0{id}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${ownerSector ? 'animate-pulse' : 'bg-slate-800'}`} 
               style={{ backgroundColor: ownerSector ? color : '' }} />
        </div>
        <h3 className="text-[11px] font-black text-slate-200 uppercase tracking-tight mt-2 leading-tight group-hover:text-white">
          {name}
        </h3>
      </div>

      <div className="z-10 flex justify-between items-end">
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{type}</span>
        {/* Un piccolo indicatore di livello stile barre di caricamento */}
        <div className="flex gap-0.5">
          {[1,2,3].map(i => (
            <div key={i} className="w-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-blue-500/40 translate-y-full group-hover:translate-y-0 transition-transform duration-500" 
                   style={{ transitionDelay: `${i * 100}ms` }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Riflesso vetro interno */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
