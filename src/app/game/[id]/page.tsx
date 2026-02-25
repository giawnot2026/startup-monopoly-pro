'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

export default function GamePage() {
  const params = useParams();
  const id = params?.id as string;

  // Algoritmo di mappatura perimetrale 7x7
  const getGridPosition = (index: number) => {
    // Top row: 0-6
    if (index <= 6) return `col-start-${index + 1} row-start-1`;
    // Right column: 7-11
    if (index <= 11) return `col-start-7 row-start-${index - 6 + 1}`;
    // Bottom row: 12-18
    if (index <= 18) return `col-start-${7 - (index - 12)} row-start-7`;
    // Left column: 19-23
    if (index <= 23) return `col-start-1 row-start-${7 - (index - 18)}`;
    return '';
  };

  return (
    <main className="bg-[#030712] min-h-screen">
      <BoardLayout>
        {TILES.map((tile, i) => (
          <Tile 
            key={tile.id}
            id={tile.id}
            name={tile.name} 
            type={tile.type}
            gridClass={getGridPosition(i)}
          />
        ))}
      </BoardLayout>
      
      {/* HUD di sessione */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Network Status: Stable / Room: {id}
          </span>
        </div>
      </div>
    </main>
  );
}
