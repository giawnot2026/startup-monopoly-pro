'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

export default function GamePage() {
  const params = useParams();
  const id = params?.id;

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
      
      {/* Label di controllo in basso a sinistra */}
      <div className="fixed bottom-4 left-4 text-[10px] font-mono text-blue-500/50 uppercase tracking-widest">
        Session: {id}
      </div>
    </main>
  );
}
