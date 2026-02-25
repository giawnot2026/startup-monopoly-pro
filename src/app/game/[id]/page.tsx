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
    if (i <= 6) return `col-start-${i + 1} row-start-1`;
    if (i <= 11) return `col-start-7 row-start-${i - 6 + 1}`;
    if (i <= 18) return `col-start-${7 - (i - 12)} row-start-7`;
    if (i <= 23) return `col-start-1 row-start-${7 - (i - 18)}`;
    return '';
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <main className="bg-[#020617] min-h-screen">
      <BoardLayout>
        {TILES.map((tile, i) => (
          <Tile key={tile.id} id={tile.id} name={tile.name} type={tile.type} gridClass={getGridPosition(i)} />
        ))}
      </BoardLayout>
      <div className="fixed top-8 right-8 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg">
        <p className="text-[8px] text-blue-500 font-mono uppercase tracking-[0.3em]">Node_Active</p>
        <p className="text-xs font-bold text-white uppercase">{resolvedParams.id}</p>
      </div>
    </main>
  );
}
