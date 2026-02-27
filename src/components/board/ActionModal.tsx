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
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-xl bg-black/70 font-mono">
      <div className={`${config.bg} ${config.border} border-2 w-full max-w-xl rounded-[2.5rem] p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all animate-in fade-in zoom-in duration-300`}>
        
        {/* Label Superiore (Stile Casella) */}
        <div className={`${config.accent} absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-b-xl shadow-lg`}>
          <span className="text-[10px] font-black text-black tracking-[0.2em] uppercase">{config.label}</span>
        </div>

        <div className="text-center mt-6">
          {/* Titolo: Extra Bold e Mono */}
          <h2 className={`text-3xl font-black ${config.text} uppercase tracking-tighter mb-6 italic`}>
            {title}
          </h2>
          
          {/* Insight Educativo: Layout Monospace */}
          {insight && (
            <div className="mb-6 bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner">
              <p className="text-slate-100 text-sm md:text-base leading-relaxed italic text-left font-bold tracking-tight">
                {`> ${insight}`}
              </p>
            </div>
          )}

          {/* Descrizione: Mono e chiara */}
          <p className="text-slate-400 text-sm md:text-base leading-snug mb-8 px-2 font-bold uppercase tracking-tight opacity-90">
            {description}
          </p>

          {/* Impatto Finanziario: Identico allo stile delle metriche nel board */}
          {impact && (
            <div className="bg-black/60 rounded-[1.5rem] p-5 mb-8 border border-white/5 shadow-2xl">
               <p className="text-[9px] uppercase text-slate-500 font-black mb-2 tracking-[0.3em] italic">
                 DATA_ANALYSIS_SYSTEM
               </p>
               <div className="text-base md:text-xl font-black text-white tracking-tighter italic">
                 {impact.details || 'WAITING...'}
               </div>
            </div>
          )}

          {/* Asset Levels: Stile caselle mini */}
          {assetLevels && (
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {assetLevels.map((level) => (
                  <div 
                    key={level.id} 
                    className={`relative p-4 rounded-[1.8rem] border-2 flex flex-col items-center transition-all duration-300 ${
                      level.status === 'owned' ? 'bg-emerald-500/10 border-emerald-500' :
                      level.status === 'available' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-105 z-10' :
                      'bg-slate-800/40 border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-3xl mb-2">{level.icon}</span>
                    <span className="text-[10px] font-black text-white mb-1 uppercase tracking-tighter">{level.label}</span>
                    <div className={`text-[11px] font-black italic ${level.status === 'available' ? 'text-blue-400' : 'text-slate-400'}`}>
                      €{(Number(level.cost) || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Badge: Stile Terminale */}
              {badgeCta && (
                <div className="bg-blue-600/10 py-2 px-6 rounded-full border border-blue-500/30 animate-pulse">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    [ {badgeCta} ]
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Pulsante Primario: Stile "Lancia Dadi" */}
            <button
              onClick={onAction}
              className={`w-full py-5 ${config.accent} text-black font-black rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.25em] text-sm shadow-[0_8px_25px_rgba(0,0,0,0.4)]`}
            >
              {actionLabel}
            </button>
            
            {/* Pulsante Secondario: Uniformato */}
            {secondaryActionLabel && (
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 text-white/50 font-black rounded-[1.2rem] hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-xs border border-white/5"
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
