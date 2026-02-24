// src/lib/sectors.ts
import { SectorId, SectorConfig } from './types';

export const SECTORS: Record<SectorId, SectorConfig> = {
  saas_b2b: {
    id: 'saas_b2b',
    name: 'SaaS B2B',
    color: '#0ea5e9', // Azzurro
    multiplier: 10,
    initialCash: 50000,
    exitMRR: 80000,
  },
  cleantech: {
    id: 'cleantech',
    name: 'Green Tech',
    color: '#10b981', // Smeraldo
    multiplier: 6,
    initialCash: 120000,
    exitMRR: 150000,
  },
  ai_deeptech: {
    id: 'ai_deeptech',
    name: 'AI Deep Tech',
    color: '#8b5cf6', // Viola
    multiplier: 20,
    initialCash: 150000,
    exitMRR: 250000,
  },
  marketplace: {
    id: 'marketplace',
    name: 'Marketplace',
    color: '#f59e0b', // Ambra
    multiplier: 8,
    initialCash: 40000,
    exitMRR: 120000,
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing 4.0',
    color: '#ef4444', // Rosso
    multiplier: 4,
    initialCash: 200000,
    exitMRR: 100000,
  }
};
