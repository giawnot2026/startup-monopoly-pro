'use client'
import React from 'react';

interface ActionModalProps {
  isOpen: boolean;
  type: 'success' | 'danger' | 'info' | 'opportunity' | 'danger_event';
  title: string;
  description: string;
  insight?: string;
  badgeCta?: string;
  impact?: {
    cash?: number;
    details?: string;
  };
  badges?: {
    currentLevel: string;
    bronze: { cost: number; owned: boolean };
    silver: { cost: number; owned: boolean };
    gold: { cost: number; owned: boolean };
  };
  currentPlayerCash?: number;
  actionLabel: string;
  secondaryActionLabel?: string;
  onAction: () => void;
  onClose?: () => void;
}

const BadgeShape = ({ level, active }: { level: string, active: boolean }) => {
  const color = active ? '#3b82f6' : '#475569';
  const glow = active ? `drop-shadow(0 0 8px ${color}cc)` : 'none';

  if (level === 'bronze') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" style={{ filter: glow }}>
        <path d="M12 2L2 20H22L12 2Z" fill={color} />
      </svg>
    );
  }
  if (level === 'silver') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" style={{ filter: glow }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="10" fill={color} />
    </svg>
  );
};

export default function ActionModal({
  isOpen, type, title, description, insight, badgeCta, impact, badges, currentPlayerCash = 0, actionLabel, secondaryActionLabel, onAction, onClose
}: ActionModalProps) {
  if (!isOpen) return null;

  const configs = {
    opportunity: { bg: 'bg-emerald-950/98', border: 'border-emerald-500', text: 'text-emerald-400', accent: 'bg-emerald-500', label: 'OPPORTUNITÀ' },
    danger_event: { bg: 'bg-rose-950/98', border: 'border-rose-500', text: 'text-rose-400', accent: 'bg-rose-500', label: 'IMPREVISTO' },
    success: { bg: 'bg-slate-950/98', border: 'border-blue-600', text: 'text-blue-400', accent: 'bg-blue-600', label: 'INVESTIMENTO' },
    danger: { bg: 'bg-slate-900/98', border: 'border-red-500', text: 'text-red-400', accent: 'bg-red-500', label: 'ATTENZIONE' },
    info: { bg: 'bg-slate-900/98', border: 'border-amber-500', text: 'text-amber-400', accent: 'bg-amber-500', label: 'STRATEGIA' },
  };

  const config = configs[type] || configs.info;

  // --- LOGICA DI CONTROLLO CASH ---
  let finalActionLabel = actionLabel;
  let canAfford = true;
  const userCash = Number(currentPlayerCash);

  const nextToBuy = badges ? (
    badges.currentLevel === 'none' ? 'bronze' : 
    badges.currentLevel === 'bronze' ? 'silver' : 
    badges.currentLevel === 'silver' ? 'gold' : null
  ) : null;

  if (badges && nextToBuy) {
    const nextCost = Number(badges[nextToBuy as keyof typeof badges].cost);
    // FIX: Il confronto ora è puramente numerico per evitare l'errore 100k vs 10k
    canAfford = userCash >= nextCost;
    
    if (!canAfford) {
      finalActionLabel = "Fondi Insufficienti - Chiudi";
    }
  }

  // Gestisce il click: se non ha soldi, il tasto chiude la modale invece di comprare
  const handleMainAction = () => {
    if (badges && nextToBuy && !canAfford) {
      if (onClose) onClose();
    } else {
      onAction();
    }
  };

  const renderBadgesList = badges ? [
    { id: 'bronze', label: 'BRONZO', cost: badges.bronze.cost, owned: badges.bronze.owned },
    { id: 'silver', label: 'ARGENTO', cost: badges.silver.cost, owned: badges.silver.owned },
    { id: 'gold', label: 'ORO', cost: badges.gold.cost, owned: badges.gold.owned },
  ] : [];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80">
      <div className={`${config.bg} ${config.border} border-2 w-full max-w-xl rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all animate-in fade-in zoom-in duration-300`}>
        
        {/* Badge Etichetta Superiore */}
        <div className={`${config.accent} absolute top-0 left-1/2 -translate-x-1/2 px-8 py-2 rounded-b-2xl shadow-lg z-10`}>
          <span className="text-[11px] font-black text-white tracking-[0.3em] uppercase">{config.label}</span>
        </div>

        <div className="text-center mt-6">
          <h2 className={`text-4xl font-black ${config.text} uppercase tracking-tighter mb-6 italic leading-tight drop-shadow-sm`}>
            {title}
          </h2>
          
          {insight && (
            <div className="mb-6 bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner">
              <p className="text-slate-200 text-sm md:text-base leading-relaxed italic text-center font-medium opacity-90">
                “{insight}”
              </p>
            </div>
          )}

          <p className="text-slate-400 text-sm md:text-base leading-snug mb-8 px-4 font-medium">
            {description}
          </p>

          {impact && (
            <div className="bg-black/40 rounded-[2rem] p-5 mb-8 border border-white/5 shadow-2xl">
               <p className="text-[10px] uppercase text-slate-500 font-black mb-2 tracking-[0.25em] italic opacity-60">
                 Startup Impact Analysis
               </p>
               <div className="text-lg md:text-xl font-mono text-white font-bold tracking-tight">
                 {impact.details}
               </div>
            </div>
          )}

          {/* Sezione Badges con stili originali */}
          {badges && (
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {renderBadgesList.map((b) => {
                  const isAvailable = b.id === nextToBuy;
                  const isActive = b.owned || isAvailable;
                  return (
                    <div 
                      key={b.id} 
                      className={`relative p-5 rounded-[2.2rem] border-2 flex flex-col items-center justify-center transition-all duration-500 ${
                        b.owned 
                          ? 'bg-blue-600/10 border-blue-500/50 opacity-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                          : isAvailable 
                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-105 z-10 ring-2 ring-blue-400/20' 
                            : 'bg-slate-900/40 border-white/5 opacity-20 grayscale'
                      }`}
                    >
                      <div className="mb-4">
                        <BadgeShape level={b.id} active={isActive} />
                      </div>
                      <span className="text-[10px] font-black text-white mb-1 uppercase tracking-widest">{b.label}</span>
                      <div className={`text-[11px] font-mono font-black ${isAvailable ? 'text-blue-400' : 'text-slate-500'}`}>
                        €{Number(b.cost).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {badgeCta && (
                <div className="bg-blue-500/10 py-2.5 px-8 rounded-full inline-block border border-blue-500/20">
                  <p className="text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="animate-bounce">🎯</span> {badgeCta}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={handleMainAction}
              className={`w-full py-5 ${(!canAfford && nextToBuy) ? 'bg-slate-800 text-slate-400 border border-white/10' : config.accent + ' text-white'} font-black rounded-[1.8rem] hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.25em] text-sm shadow-2xl`}
            >
              {finalActionLabel}
            </button>
            
            {secondaryActionLabel && (
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 text-slate-500 font-black rounded-[1.5rem] hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[11px]"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
