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

// --- LOGICA CATEGORIE CON COLORI NEON SATURI (Punto 2) ---
const getCategoryStyle = (name: string) => {
  const n = name.toLowerCase();
  
  // 1. FONDAZIONE (Cyan Elettrico)
  if (n.includes("start") || n.includes("test di mercato") || n.includes("hiring team") || n.includes("spin-off") || n.includes("pitch incubatori")) {
    return { color: "#00E5FF", glow: "rgba(0, 229, 255, 0.4)" };
  }
  // 2. PRODOTTO (Verde Smeraldo Neon)
  if (n.includes("mvp") || n.includes("prototipo") || n.includes("ottimizzazione prodotto") || n.includes("licenza brevetto")) {
    return { color: "#00E676", glow: "rgba(0, 230, 118, 0.4)" };
  }
  // 3. MERCATO (Giallo Oro)
  if (n.includes("marketing") || n.includes("clienti") || n.includes("nuovi mercati") || n.includes("retention")) {
    return { color: "#FFD600", glow: "rgba(255, 214, 0, 0.4)" };
  }
  // 4. ESPANSIONE (Arancione Fuoco)
  if (n.includes("canali") || n.includes("partnership") || n.includes("globale") || n.includes("acquisizione") || n.includes("competitor")) {
    return { color: "#FF6D00", glow: "rgba(255, 109, 0, 0.4)" };
  }
  // 5. FINANCE (Viola Ametista Intenso)
  if (n.includes("round") || n.includes("seed") || n.includes("series") || n.includes("exit")) {
    return { color: "#D500F9", glow: "rgba(213, 0, 249, 0.4)" };
  }
  // 6. RISCHIO (Rosso Saturato)
  if (n.includes("imprevisto")) return { color: "#FF1744", glow: "rgba(255, 23, 68, 0.5)" };
  if (n.includes("probabilità") || n.includes("opportunità")) return { color: "#94a3b8", glow: "rgba(148, 163, 184, 0.3)" };

  return { color: "#f8fafc", glow: "rgba(255,255,255,0.1)" };
};

const GeometricBadge = ({ level, color }: { level: string, color: string }) => {
  const glowStyle = { filter: `drop-shadow(0 0 8px ${color})`, fill: color };
  if (level === 'bronze') return (<svg width="14" height="14" viewBox="0 0 24 24" className="animate-in zoom-in duration-500"><path d="M12 2L2 20H22L12 2Z" style={glowStyle} /></svg>);
  if (level === 'silver') return (<svg width="14" height="14" viewBox="0 0 24 24" className="animate-in zoom-in duration-500"><rect x="3" y="3" width="18" height="18" rx="2" style={glowStyle} /></svg>);
  if (level === 'gold') return (<svg width="16" height="16" viewBox="0 0 24 24" className="animate-pulse"><circle cx="12" cy="12" r="10" style={glowStyle} /></svg>);
  return null;
};

export default function Tile({ id, name, type, style, isActive = false, ownerBadge = 'none', ownerColor = '#3b82f6' }: any) {
  const cat = getCategoryStyle(name);

  return (
    <motion.div 
      style={{ 
        ...style, 
        background: `linear-gradient(135deg, ${cat.color}15 0%, ${cat.color}05 100%)`,
        borderColor: `${cat.color}40`
      }}
      whileHover={{ 
        scale: 0.98, 
        background: `linear-gradient(135deg, ${cat.color}25 0%, ${cat.color}10 100%)`,
        borderColor: `${cat.color}80`
      }}
      className={`relative p-3 flex flex-col justify-between border transition-all h-full w-full overflow-hidden group
        backdrop-blur-md shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]
        ${isActive ? 'ring-2 ring-inset ring-white/60 shadow-2xl' : ''}
        rounded-[1.25rem]
      `}
    >
      {/* Indicatore ID / Badge Proprietario */}
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center justify-center min-w-[14px] min-h-[14px]">
          {ownerBadge !== 'none' ? (
            <GeometricBadge level={ownerBadge} color={ownerColor} />
          ) : (
            <span className="text-[7px] font-black font-mono text-white/30 uppercase tracking-tighter">
              {id.toString(16).toUpperCase().padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Icona con Glow Dinamico */}
        <div 
          style={{ 
            color: 'white', 
            filter: `drop-shadow(0 0 6px ${cat.color})` 
          }} 
          className="transition-all duration-300 opacity-90 group-hover:scale-110"
        >
          {getIcon(name)}
        </div>
      </div>

      {/* Testi con contrasto migliorato */}
      <div className="mt-auto z-10">
        <h3 className="text-[9px] md:text-[10px] font-black leading-tight uppercase tracking-tighter mb-0.5 text-white">
          {name}
        </h3>
        <p 
          style={{ color: cat.color, textShadow: `0 0 10px ${cat.color}50` }} 
          className="text-[6px] font-black uppercase tracking-[0.15em] filter brightness-125"
        >
          {type}
        </p>
      </div>

      {/* Luce di fondo immersiva (Punto 2) */}
      <div 
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 70% 20%, ${cat.color}20 0%, transparent 70%)`,
          opacity: isActive ? 0.8 : 0.3
        }} 
      />
      
      {/* Riflesso "Glass" diagonale */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none" />
      
      {/* Ring di attività animato */}
      {isActive && (
        <div 
          className="absolute inset-0 border-[3px] animate-pulse pointer-events-none"
          style={{ borderColor: `${cat.color}60` }}
        />
      )}
    </motion.div>
  );
}
