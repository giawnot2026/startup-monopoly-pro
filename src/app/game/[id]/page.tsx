'use client'
import React, { use, useEffect, useState } from 'react';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);

  // Risolve l'errore #419 (Hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  const getGridPosition = (index: number) => {
    if (index <= 6) return `col-start-${index + 1} row-start-1`;
    if (index <= 11) return `col-start-7 row-start-${index - 6 + 1}`;
    if (index <= 18) return `col-start-${7 - (index - 12)} row-start-7`;
    if (index <= 23) return `col-start-1 row-start-${7 - (index - 18)}`;
    return '';
  };

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <main className="bg-[#030712] min-h-screen">
      <BoardLayout>
        {TILES.map((tile, i) => (
          <Tile 
            key={`tile-${i}`}
            id={tile.id}
            name={tile.name} 
            type={tile.type}
            gridClass={getGridPosition(i)}
          />
        ))}
      </BoardLayout>
      <div className="fixed bottom-4 left-6 text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
        SECURE_CONNECTION_STABLISHED // NODE: {resolvedParams.id}
      </div>
    </main>
  );
}
