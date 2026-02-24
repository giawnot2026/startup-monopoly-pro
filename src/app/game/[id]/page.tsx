// src/app/game/[id]/page.tsx
'use client'
import React from 'react';
import BoardLayout from '@/components/board/BoardLayout';
import Tile from '@/components/board/Tile';
import { TILES } from '@/data/tiles';
import { useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const roomId = params.id as string;

  // Funzione per mappare l'indice della casella (0-23) alla posizione nella griglia CSS 7x7
  const getGridPosition = (index: number) => {
    if (index <= 6) return `col-start-${index + 1} row-start-1`; // Lato Superiore
    if (index <= 11) return `col-start-7 row-start-${index - 6 + 1}`; // Lato Destro
    if (index <= 18) return `col-start-${7 - (index - 12)} row-start-7`; // Lato Inferiore
    if (index <= 23) return `col-start-1 row-start-${7 - (index - 18)}`; // Lato Sinistro
    return '';
  };

  return (
    <main className="bg-black min-h-screen">
      <BoardLayout>
        {/* Generiamo le 24 caselle basandoci sul nostro array TILES */}
        {TILES.map((tile, i) => (
          <Tile 
            key={tile.id}
            id={tile.id}
            // Gestiamo il nome: se è un oggetto (settoriale) o una stringa semplice
            name={typeof tile.name === 'string' ? tile.name : "Asset Startup"} 
            type={tile.type}
            gridClass={getGridPosition(i)}
            // Per ora passiamo un owner fittizio per vedere l'effetto neon
            ownerSector={i === 1 ? 'ai_deeptech' : undefined}
          />
        ))}
      </BoardLayout>

      {/* Overlay UI per info Stanza */}
      <div className="fixed top-6 left-6 z-50">
        <div className="glass-morphism p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">Room Protocol</p>
          <h2 className="text-white font-black text-sm uppercase">{roomId.slice(0, 8)}</h2>
        </div>
      </div>
    </main>
  );
}
