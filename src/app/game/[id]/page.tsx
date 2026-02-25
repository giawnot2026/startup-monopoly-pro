'use client'
import React, { use, useEffect, useState } from 'react';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const getGridPosition = (i: number) => {
    // LATO SUPERIORE (0-7) -> Riga 1, Colonna da 1 a 8
    if (i >= 0 && i <= 7) {
      return `row-start-1 col-start-${i + 1}`;
    }
    // LATO DESTRO (8-13) -> Colonna 8, Riga da 2 a 7
    if (i >= 8 && i <= 13) {
      return `col-start-8 row-start-${i - 6}`;
    }
    // LATO INFERIORE (14-21) -> Riga 8, Colonna da 8 a 1 (va all'indietro)
    if (i >= 14 && i <= 21) {
      return `row-start-8 col-start-${8 - (i - 14)}`;
    }
    // LATO SINISTRO (22-27) -> Colonna 1, Riga da 7 a 2 (sale verso l'alto)
    if (i >= 22 && i <= 27) {
      return `col-start-1 row-start-${8 - (i - 21)}`;
    }
    return '';
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <main className="bg-[#020617] min-h-screen p-4 md:p-8">
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
      
      <div className="fixed bottom-4 left-6 text-[10px] font-mono text-blue-500/40 uppercase tracking-[0.3em]">
        SESSION_ID: {resolvedParams.id} // GRID_MODE: 8x8_STABLE
      </div>
    </main>
  );
}
