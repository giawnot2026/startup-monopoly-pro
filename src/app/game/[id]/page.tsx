'use client'
import React, { use, useEffect, useState } from 'react';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Mappatura manuale e infallibile delle coordinate 8x8
  const getCoords = (i: number) => {
    // Lato Superiore (0-7)
    if (i <= 7) return { row: 1, col: i + 1 };
    // Lato Destro (8-13)
    if (i <= 13) return { row: (i - 7) + 1, col: 8 };
    // Lato Inferiore (14-21)
    if (i <= 21) return { row: 8, col: 8 - (i - 14) };
    // Lato Sinistro (22-27)
    if (i <= 27) return { row: 8 - (i - 21), col: 1 };
    return { row: 1, col: 1 };
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <main className="bg-[#020617] min-h-screen flex items-center justify-center p-4">
      <BoardLayout>
        {TILES.map((tile, i) => {
          const { row, col } = getCoords(i);
          return (
            <Tile 
              key={tile.id} 
              id={tile.id} 
              name={tile.name} 
              type={tile.type} 
              // Passiamo le coordinate come stile inline per sovrascrivere ogni errore CSS
              style={{ gridRowStart: row, gridColumnStart: col }}
            />
          );
        })}
      </BoardLayout>
    </main>
  );
}
