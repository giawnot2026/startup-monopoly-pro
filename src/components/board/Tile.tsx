'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Users, BarChart3, Presentation, Wallet, BadgeCheck, 
  Zap, Globe, ShieldAlert, Handshake, TrendingUp, Briefcase, 
  Factory, Network, Users2, Settings, HeartPulse, Landmark, 
  LineChart, Building2, Share2, FileCheck, Coins, Trophy, 
  HelpCircle, AlertTriangle, ArrowRight
} from 'lucide-react';

const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("start")) return <Rocket size={20} />;
  if (n.includes("mvp")) return <BadgeCheck size={18} />;
  if (n.includes("test")) return <BarChart3 size={18} />;
  if (n.includes("opportunità") || n.includes("probabilità")) return <HelpCircle size={22} />;
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

// --- NUOVA LOGICA DI CATEGORIZZAZIONE COLORI ---
const getCategoryStyle = (name: string) => {
  const n = name.toLowerCase();
  
  // 1. FONDAZIONE (Blu Chiaro - #00BCD4)
  if (n.includes("start") || n.includes("test di mercato") || n.includes("hiring team") || n.includes("pitch incubatori")) {
    return { color: "#00BCD4", bg: "rgba(0, 188, 212, 0.05)", border: "rgba(0, 188, 212, 0.3)" };
  }
  // 2. PRODOTTO (Verde Lime - #8BC34A)
  if (n.includes("mvp") || n.includes("prototipo") || n.includes("ottimizzazione prodotto") || n.includes("licenza brevetto")) {
    return { color: "#8BC34A", bg: "rgba(139, 195, 74, 0.05)", border: "rgba(139, 195, 74, 0.3)" };
  }
  // 3. MERCATO (Giallo - #FFC107)
  if (n.includes("marketing") || n.includes("clienti") || n.includes("nuovi mercati") || n.includes("retention")) {
    return { color: "#FFC107", bg: "rgba(255, 193, 7, 0.05)", border: "rgba(255, 193, 7, 0.3)" };
  }
  // 4. ESPANSIONE (Arancione - #FF9800)
  if (n.includes("canali") || n.includes("partnership") || n.includes("globale") || n.includes("competitor")) {
    return { color: "#FF9800", bg: "rgba(255, 152, 0, 0.05)", border: "rgba(255, 152, 0, 0.3)" };
  }
  // 5. FINANCE (Viola - #9C27B0)
  if (n.includes("round") || n.includes("seed") || n.includes("series") || n.includes("spin-off") || n.includes("acquisizione") || n.includes("exit")) {
    return { color: "#9C27B0", bg: "rgba(156, 39, 176, 0.05)", border: "rgba(156, 39, 176, 0.3)" };
  }
  // 6. RISCHIO (Rosso/Grigio)
  if (n.includes("imprevisto")) return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.4)" };
  if (n.includes("probabilità") || n.includes("opportunità")) return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.05)", border: "rgba(148, 163, 184, 0.3)" };

  return { color: "#64748b", bg: "transparent", border: "rgba(255,255,255,0.1)" };
};

const GeometricBadge = ({ level, color }: { level: string, color: string }) => {
  const glowStyle = { filter: `drop-shadow(0 0 5px ${color})`, fill: color };
  if (level === 'bronze') return (<svg width="14" height="14" viewBox="0 0 24 24" className="animate-in zoom-in duration-500"><path d="M12 2L2 20H22L12 2Z" style={glowStyle} /></svg>);
  if (level === 'silver') return (<svg width="14" height="14" viewBox="0 0 24 24" className="animate-in zoom-in duration-500"><rect x="3" y="3" width="18" height="18" rx="2" style={glowStyle} /></svg>);
  if (level === 'gold') return (<svg width="16" height="16" viewBox="0 0 24 24" className="animate-pulse"><circle cx="12" cy="12" r="10" style={glowStyle} /></svg>);
  return null;
};

export default function Tile({ id, name, type, style, isActive = false, ownerBadge = 'none', ownerColor = '#3b82f6' }: any) {
  const isCorner = [0, 7, 14, 21].includes(id);
  const cat = getCategoryStyle(name);

  return (
    <motion.div 
      style={{ ...style, backgroundColor: cat.bg, borderColor: cat.border }}
      whileHover={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.08)' }}
      className={`relative p-2 flex flex-col justify-between border transition-all h-full w-full overflow-hidden group
        /* NUOVO STILE: Vetro più chiaro e riflessi definiti */
        bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20
        ${isActive ? 'ring-2 ring-inset ring-white/50 shadow-xl' : ''}
        rounded-2xl
      `}
    >
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center justify-center min-w-[14px] min-h-[14px]">
          {ownerBadge !== 'none' ? (
            <GeometricBadge level={ownerBadge} color={ownerColor} />
          ) : (
            <span className="text-[7px] font-mono text-slate-500 uppercase tracking-tighter">0x{id}</span>
          )}
        </div>

        <div style={{ color: cat.color }} className="drop-shadow-[0_0_5px_rgba(0,0,0,0.5)] transition-all duration-300">
          {getIcon(name)}
        </div>
      </div>

      <div className="mt-auto z-10">
        <h3 className="text-[8px] md:text-[9px] font-bold leading-tight uppercase tracking-tighter mb-0.5 text-slate-100">
          {name}
        </h3>
        <p style={{ color: cat.color }} className="text-[5px] font-black uppercase tracking-widest filter brightness-110">
          {type}
        </p>
      </div>

      {/* Glow effect di fondo quando attiva o per categoria */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none transition-opacity duration-500"
        style={{ 
          backgroundColor: cat.color,
          opacity: isActive ? 0.2 : 0.03
        }} 
      />
      
      {isActive && (
        <div className="absolute inset-0 border-2 border-white/20 animate-pulse pointer-events-none" />
      )}
    </motion.div>
  );
}
