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
    opportunity: { bg: 'bg-emerald-950/98', border: 'border-emerald-500', text: 'text-emerald-400', icon: '🚀', accent: 'bg-emerald-500', label: 'OPPORTUNITÀ' },
    danger_event: { bg: 'bg-rose-950/98', border: 'border-rose-500', text: 'text-rose-400', icon: '⚠️', accent: 'bg-rose-500', label: 'IMPREVISTO' },
    success: { bg: 'bg-slate-900/98', border: 'border-blue-500', text: 'text-blue-400', icon: '🏢', accent: 'bg-blue-500', label: 'INVESTIMENTO' },
    danger: { bg: 'bg-slate-900/98', border: 'border-red-500', text: 'text-red-400', icon: '💸', accent: 'bg-red-500', label: 'ATTENZIONE' },
    info: { bg: 'bg-slate-900/98', border: 'border-amber-500', text: 'text-amber-400', icon: '💰', accent: 'bg-amber-500', label: 'STRATEGIA' },
  };

  const config = configs[type] || configs.info;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 backdrop-blur-xl bg-black/70">
      <div className={`${config.bg} ${config.border} border-2 w-full max-w-2xl rounded-[3rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all animate-in fade-in zoom-in duration-300`}>
        
        <div className={`${config.accent} absolute top-0 left-1/2 -translate-x-1/2 px-8 py-2 rounded-b-2xl shadow-lg`}>
          <span className="text-xs font-black text-black tracking-[0.3em] uppercase">{config.label}</span>
        </div>

        <div className="text-center mt-6">
          <h2 className={`text-4xl font-black ${config.text} uppercase tracking-tighter mb-6 italic leading-none`}>
            {title}
          </h2>
          
          {/* Insight Educativo: Testo INGRANDITO */}
          {insight && (
            <div className="mb-8 bg-white/5 rounded-2xl p-6 border-l-4 border-white/20 shadow-inner">
              <p className="text-slate-100 text-base md:text-lg leading-relaxed italic text-left font-medium">
                “{insight}”
              </p>
            </div>
          )}

          {/* Descrizione: Testo INGRANDITO */}
          <p className="text-slate-300 text-base md:text-lg leading-snug mb-8 px-4 font-normal opacity-90">
            {description}
          </p>

          {/* Impatto Finanziario: Numeri INGRANDITI */}
          {impact && (
            <div className="bg-black/40 rounded-[2rem] p-6 mb-8 border border-white/10 shadow-xl">
               <p className="text-xs uppercase text-slate-500 font-black mb-3 tracking-[0.2em] italic opacity-80">
                 Analisi Impatto Startup
               </p>
               <div className="text-lg md:text-xl font-mono text-white font-bold tracking-tight">
                 {impact.details || 'Calcolo metriche in corso...'}
               </div>
            </div>
          )}

          {/* Sezione Asset / Badge: Layout Spazioso */}
          {assetLevels && (
            <div className="mb-10">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {assetLevels.map((level) => (
                  <div 
                    key={level.id} 
                    className={`relative p-6 rounded-[2.5rem] border-2 flex flex-col items-center transition-all duration-300 ${
                      level.status === 'owned' ? 'bg-emerald-500/10 border-emerald-500' :
                      level.status === 'available' ? 'bg-blue-600/25 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-105 z-10' :
                      'bg-slate-800/40 border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-4xl mb-3">{level.icon}</span>
                    <span className="text-xs font-black text-white mb-2 uppercase tracking-widest">{level.label}</span>
                    <div className={`text-sm font-mono font-black ${level.status === 'available' ? 'text-blue-400' : 'text-slate-400'}`}>
                      €{(Number(level.cost) || 0).toLocaleString()}
                    </div>
                    
                    {level.status === 'owned' && (
                      <div className="absolute -top-3 -right-3 bg-emerald-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-black shadow-lg border-2 border-slate-900">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Call to Action Badge: Più visibile */}
              {badgeCta && (
                <div className="bg-blue-600/20 py-3 px-8 rounded-full inline-block border border-blue-500/30 shadow-lg animate-pulse">
                  <p className="text-blue-300 text-xs font-black uppercase tracking-[0.2em]">
                    🎯 {badgeCta}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={onAction}
              className={`w-full py-6 ${config.accent} text-black font-black rounded-[2rem] hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-[0.25em] text-base shadow-2xl`}
            >
              {actionLabel}
            </button>
            {secondaryActionLabel && (
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 text-white/40 font-bold rounded-2xl hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-xs"
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
