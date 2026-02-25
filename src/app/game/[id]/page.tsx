'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

// Forza la pagina a essere generata dinamicamente lato client
export const dynamic = 'force-dynamic';

export default function GamePage() {
  const params = useParams();
  
  // Gestione di sicurezza per l'ID
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : 'loading...';

  const getGridPosition = (index: number) => {
    if (index <= 6) return `col-start-${index + 1} row-start-1`;
    if (index <= 11) return `col-start-7 row-start-${index - 6 + 1}`;
    if (index <= 18) return `col-start-${7 - (index - 12)} row-start-7`;
    if (index <= 23) return `col-start-1 row-start-${7 - (index - 18)}`;
    return '';
  };

  return (
    <main className="bg-black min-h-screen">
      <BoardLayout>
        {TILES && TILES.map((tile, i) => (
          <Tile 
            key={tile.id}
            id={tile.id}
            name={tile.name} 
            type={tile.type}
            gridClass={getGridPosition(i)}
          />
        ))}
      </BoardLayout>
      
      {/* Label di debug visibile per conferma */}
      <div className="fixed top-4 right-4 text-[10px] font-mono text-emerald-500 bg-black/80 p-2 border border-emerald-500/30 rounded z-50">
        STATUS: ONLINE | ROOM: {id}
      </div>
    </main>
  );
}
