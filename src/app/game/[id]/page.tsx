'use client'
import React, { use, Suspense } from 'react';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

// Componente interno per isolare la logica dei parametri
function GameContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id || 'anonymous';

  const getGridPosition = (index: number) => {
    if (index <= 6) return `col-start-${index + 1} row-start-1`;
    if (index <= 11) return `col-start-7 row-start-${index - 6 + 1}`;
    if (index <= 18) return `col-start-${7 - (index - 12)} row-start-7`;
    if (index <= 23) return `col-start-1 row-start-${7 - (index - 18)}`;
    return '';
  };

  return (
    <BoardLayout>
      {TILES.map((tile, i) => (
        <Tile 
          key={`tile-${tile.id}-${i}`}
          id={tile.id}
          name={tile.name} 
          type={tile.type}
          gridClass={getGridPosition(i)}
        />
      ))}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">
            NODE_ID: {id}
          </span>
        </div>
      </div>
    </BoardLayout>
  );
}

// Default export con Suspense per evitare crash durante il caricamento dei parametri
export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="bg-[#030712] min-h-screen">
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-blue-500 font-mono italic">INITIALIZING_VIRTUAL_MARKET...</div>}>
        <GameContent params={params} />
      </Suspense>
    </main>
  );
}
