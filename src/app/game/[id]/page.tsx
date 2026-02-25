'use client'
import React, { use } from 'react';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15+ i params vanno "scartati" con use() o trattati come Promise
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const getGridPosition = (index: number) => {
    if (index <= 6) return `col-start-${index + 1} row-start-1`;
    if (index <= 11) return `col-start-7 row-start-${index - 6 + 1}`;
    if (index <= 18) return `col-start-${7 - (index - 12)} row-start-7`;
    if (index <= 23) return `col-start-1 row-start-${7 - (index - 18)}`;
    return '';
  };

  // Se i dati non sono ancora pronti, mostriamo un caricamento per evitare il crash
  if (!TILES) return <div className="bg-black min-h-screen flex items-center justify-center text-white">Caricamento Asset...</div>;

  return (
    <main className="bg-black min-h-screen">
      <BoardLayout>
        {TILES.map((tile, i) => (
          <Tile 
            key={tile.id || i}
            id={tile.id}
            name={tile.name || "Startup"} 
            type={tile.type || "asset"}
            gridClass={getGridPosition(i)}
          />
        ))}
      </BoardLayout>
      
      <div className="fixed bottom-4 left-4 text-[10px] font-mono text-blue-500/50 uppercase">
        LOBBY: {id}
      </div>
    </main>
  );
}
