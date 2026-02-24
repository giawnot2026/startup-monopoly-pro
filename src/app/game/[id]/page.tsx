'use client'
import React from 'react';
import { useParams } from 'next/navigation';
// Usiamo i percorsi relativi per essere sicuri al 100%
import BoardLayout from '../../../components/board/BoardLayout';
import Tile from '../../../components/board/Tile';
import { TILES } from '../../../data/tiles';

export default function GamePage() {
  const params = useParams();
  const id = params?.id;

  // Funzione per mappare l'indice dell'array TILES sulla griglia 7x7
  const getGridPosition = (index: number) => {
    // Riga superiore (0-6)
    if (index <= 6) return `col-start-${index + 1} row-start-1`;
    // Colonna destra (7-11)
    if (index <= 11) return `col-start-7 row-start-${index - 6 + 1}`;
    // Riga inferiore (12-18)
    if (index <= 18) return `col-start-${7 - (index - 12)} row-start-7`;
    // Colonna sinistra (19-23)
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
            name={typeof tile.name === 'string' ? tile.name : "Startup Asset"} 
            type={tile.type}
            gridClass={getGridPosition(i)}
          />
        ))}
      </BoardLayout>
    </main>
  );
}
