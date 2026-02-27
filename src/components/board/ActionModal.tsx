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
  assetLevels?: {
    id: string;
    label: string;
    cost: number;
    revenueBonus: number;
    status: 'owned' | 'available' | 'locked' | 'current';
    icon: string;
  }[];
  actionLabel: string;
  secondaryActionLabel?: string;
  onAction: () => void;
  onClose?: () => void;
}

export default function ActionModal({
  isOpen, type, title, description, insight, badgeCta, impact, assetLevels, actionLabel, secondaryActionLabel, onAction, onClose
}: ActionModalProps) {
  if (!isOpen) return null;

  const configs = {
    opportunity: { bg: 'bg-emerald-950/98', border: 'border-emerald-500', text: 'text-emerald-400', accent: 'bg-emerald-500', label: 'OPPORTUNITÀ' },
    danger_event: { bg: 'bg-rose-950/98', border: 'border-rose-500', text: 'text-rose-400', accent: 'bg-rose-500', label: 'IMPREVISTO' },
    success: { bg: 'bg-slate-900/98', border: 'border-blue-500', text: 'text-blue-400', accent: 'bg-blue-500', label: 'INVESTIMENTO' },
    danger: { bg: 'bg-slate-900/98', border: 'border-red-500', text: 'text-red-400', accent: 'bg-red-500', label: 'ATTENZIONE' },
    info: { bg: 'bg-slate-900/98', border: 'border-amber-500', text: 'text-amber-400', accent: 'bg-amber-500', label: 'STRATEGIA' },
  };

  const config = configs[type] || configs.info;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-xl bg-black/70">
      <div className={`${config.bg} ${config.border} border-2 w-full max-w-xl rounded-[2.5rem] p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all animate-in fade-in zoom-in duration-300`}>
        
        <div className={`${config.accent} absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-b-xl shadow-lg`}>
          <span className="text-[10px] font-black text-black tracking-[0.25em] uppercase">{config.label}</span>
        </div>

        <div className="text-center mt-4">
          <h2 className={`text-3xl font-black ${config.text} uppercase tracking-tighter mb-5 italic leading-tight`}>
            {title}
          </h2>
          
          {insight && (
            <div className="mb-6 bg-white/5 rounded-xl p-5 border-l-4 border-white/20">
              <p className="text-slate-100 text-sm md:text-base leading-relaxed italic text-left font-medium">
                “{insight}”
              </p>
            </div>
          )}

          <p className="text-slate-300 text-sm md:text-base leading-snug mb-6 px-2 font-normal opacity-90">
            {description}
          </p>

          {impact && (
            <div className="bg-black/40 rounded-[1.5rem] p-4 mb-6 border border-white/10">
               <p className="text-[9px] uppercase text-slate-500 font-black mb-2 tracking-[0.2em] italic opacity-70 text-center">
                 Startup Impact Analysis
               </p>
               <div className="text-base md:text-lg font-mono text-white font-bold tracking-tight text-center">
                 {impact.details || 'Calculating...'}
               </div>
            </div>
          )}

          {assetLevels && (
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-4 mb-5">
                {assetLevels.map((level) => (
                  <div 
                    key={level.id} 
                    className={`relative p-4 rounded-[2rem] border-2 flex flex-col items-center transition-all duration-300 ${
                      level.status === 'owned' ? 'bg-emerald-500/10 border-emerald-500' :
                      level.status === 'available' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-105 z-10' :
                      'bg-slate-800/40 border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-3xl mb-2">{level.icon}</span>
                    <span className="text-[9px] font-black text-white mb-1 uppercase tracking-widest text-center">{level.label}</span>
                    <div className={`text-[10px] font-mono font-black ${level.status === 'available' ? 'text-blue-400' : 'text-slate-400'}`}>
                      €{(Number(level.cost) || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {badgeCta && (
                <div className="bg-blue-600/15 py-2 px-6 rounded-full inline-block border border-blue-500/20 animate-pulse">
                  <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.15em]">
                    🎯 {badgeCta}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Tasto Primario */}
            <button
              onClick={onAction}
              className={`w-full py-5 ${config.accent} text-black font-black rounded-[1.5rem] hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm shadow-xl`}
            >
              {actionLabel}
            </button>
            
            {/* Tasto Secondario: Migliorato proporzionalmente */}
            {secondaryActionLabel && (
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 text-white/50 font-black rounded-[1.2rem] hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.15em] text-sm"
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
