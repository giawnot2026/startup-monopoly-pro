// src/data/tiles.ts
import { SectorId } from '@/lib/types';

export interface TileDef {
  id: number;
  type: 'asset' | 'chance' | 'tax' | 'station' | 'special';
  name: string | Record<SectorId, string>;
  baseCost?: number;
  baseMRR?: number;
}

export const TILES: TileDef[] = [
  { id: 0, type: 'special', name: 'VIA / FISCAL YEAR' },
  { 
    id: 1, 
    type: 'asset', 
    name: {
      saas_b2b: "Sviluppo API Core",
      cleantech: "Prototipo Hardware",
      ai_deeptech: "Training LLM Base",
      marketplace: "UX/UI Piattaforma",
      manufacturing: "Setup Linea Prod."
    },
    baseCost: 5000,
    baseMRR: 800
  },
  { id: 2, type: 'chance', name: 'HACKER NEWS' },
  { 
    id: 3, 
    type: 'asset', 
    name: {
      saas_b2b: "Beta Testing",
      cleantech: "Certificazioni CE",
      ai_deeptech: "Data Cleaning",
      marketplace: "Onboarding Vendor",
      manufacturing: "Test Materiali"
    },
    baseCost: 8000,
    baseMRR: 1200
  },
  { id: 4, type: 'tax', name: 'CLOUD & OPS COSTS', baseCost: 2000 },
  { id: 5, type: 'station', name: 'PRE-SEED ROUND' },
  // ... continueremo a mappare le restanti 18 man mano
];
