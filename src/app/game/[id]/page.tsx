'use client'
import React, { use, useEffect, useState } from 'react';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Algoritmo per disporre 28 caselle su un perimetro 8x8
  const getGridPosition = (i: number) => {
    // Lato Superiore (0-7)
    if (i <= 7) return `col-start-${i + 1} row-start-1`;
    // Lato Destro (8-13)
    if (i <= 13) return `col-start-8 row-start-${(i - 7) + 1}`;
    // Lato Inferiore (14-21)
    if (i <= 21) return `col-start-${8 - (i - 14)} row-start-8`;
    // Lato Sinistro (22-27)
    if (i <= 27) return `col-start-1 row-start-${8 - (i - 21)}`;
    return '';
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <main className="bg-[#020617] min-h-screen">
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

      {/* Overlay Identificativo Sessione */}
      <div className="fixed bottom-8 left-8 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
        <p className="text-[9px] font-mono text-blue-500 tracking-widest uppercase">
          Node_Connection: {resolvedParams.id}
        </p>
      </div>
    </main>
  );
}
