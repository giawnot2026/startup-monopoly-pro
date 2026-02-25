'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Users, BarChart3, Presentation, Wallet, BadgeCheck, 
  Zap, Globe, ShieldAlert, Handshake, TrendingUp, Briefcase, 
  Factory, Network, Users2, Settings, HeartPulse, Landmark, 
  LineChart, Building2, Share2, FileCheck, Coins, Trophy, 
  HelpCircle, AlertTriangle, Award
} from 'lucide-react';

const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("start")) return <Rocket size={20} />;
  if (n.includes("mvp")) return <BadgeCheck size={18} />;
  if (n.includes("test")) return <BarChart3 size={18} />;
  if (n.includes("opportunità")) return <HelpCircle size={22} />;
  if (n.includes("imprevisto")) return <AlertTriangle size={22} />;
  if (n.includes("pitch")) return <Presentation size={18} />;
  if (n.includes("prototipo") || n.includes("costi")) return <Wallet size={18} />;
  if (n.includes("clienti")) return <Users size={18} />;
  if (n.includes("marketing")) return <Zap size={18} />;
  if (n.includes("canali")) return <Network size={18} />;
  if (n.includes("support")) return <HeartPulse size={18} />;
  if (n.includes("nuovi mercati")) return <Globe size={18} />;
  if (n.includes("partnership")) return <Handshake size={18} />;
  if (n.includes("competitor")) return <ShieldAlert size={18} />;
  if (n.includes("round") || n.includes("series") || n.includes("seed") || n.includes("bridge")) return <Landmark size={20} />;
  if (n.includes("automazione")) return <Factory size={18} />;
  if (n.includes("internazionale")) return <Globe size={18} />;
  if (n.includes("hiring")) return <Users2 size={18} />;
  if (n.includes("ottimizzazione")) return <Settings size={18} />;
  if (n.includes("retention")) return <TrendingUp size={18} />;
  if (n.includes("ipo")) return <LineChart size={18} />;
  if (n.includes("acquisizione")) return <Building2 size={18} />;
  if (n.includes("spin-off")) return <Share2 size={18} />;
  if (n.includes("licenza")) return <FileCheck size={18} />;
  if (n.includes("investitori")) return <Coins size={18} />;
  if (n.includes("exit")) return <Trophy size={20} />;
  return <Briefcase size={16} />;
};

export default function Tile({ id, name, type, style, isActive = false, ownerBadge = 'none', ownerColor = '#3b82f6' }: any) {
  const isCorner = [0, 7, 14, 21].includes(id);
  const isOpportunity = name.toLowerCase().includes("opportunità");
  const isImprevisto = name.toLowerCase().includes("imprevisto");
  const isTax = type === 'tax';

  return (
    <motion.div 
      style={style}
      whileHover={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.05)' }}
      className={`relative p-2 flex flex-col justify-between border border-white/10 transition-all h-full w-full overflow-hidden group
        ${isCorner ? 'bg-blue-900/20' : 'bg-transparent'}
        ${isOpportunity ? 'bg-blue-400/5 border-blue-500/30' : ''}
        ${isImprevisto || (isTax && !isCorner) ? 'bg-red-400/5 border-red-500/30' : ''}
        ${isActive ? 'ring-2 ring-inset ring-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]' : ''}
      `}
    >
      {/* Badge Ownership Indicator */}
      {ownerBadge !== 'none' && (
        <div className="absolute top-1 right-1 flex items-center gap-1 z-20">
          <div 
            className="w-1.5 h-4 rounded-full" 
            style={{ backgroundColor: ownerColor, boxShadow: `0 0 8px ${ownerColor}` }} 
          />
          <Award 
            size={12} 
            className={
              ownerBadge === 'gold' ? 'text-yellow-400 animate-pulse' : 
              ownerBadge === 'silver' ? 'text-slate-300' : 
              'text-amber-700'
            } 
          />
        </div>
      )}

      <div className="flex justify-between items-start z-10">
        <span className="text-[7px] font-mono text-slate-500 uppercase tracking-tighter">0x{id}</span>
        <div className={`transition-all duration-300 
          ${isOpportunity || isCorner ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : (isImprevisto || isTax) ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-slate-400 group-hover:text-white'}
        `}>
          {getIcon(name)}
        </div>
      </div>

      <div className="mt-auto z-10">
        <h3 className={`text-[8px] md:text-[9px] font-bold leading-tight uppercase tracking-tighter mb-0.5
          ${isCorner ? 'text-blue-300' : 'text-slate-100'}
        `}>
          {name}
        </h3>
        <p className={`text-[5px] font-black uppercase tracking-widest
          ${isOpportunity || isCorner ? 'text-blue-500' : (isImprevisto || isTax) ? 'text-red-500' : 'text-slate-600'}
        `}>
          {type}
        </p>
      </div>

      {(isCorner || isOpportunity || isImprevisto || isActive) && (
        <div className={`absolute inset-0 opacity-5 pointer-events-none 
          ${(isImprevisto || isTax) ? 'bg-red-500' : 'bg-blue-500'}
          ${isActive ? 'opacity-20 animate-pulse' : 'opacity-5'}
        `} />
      )}
    </motion.div>
  );
}
