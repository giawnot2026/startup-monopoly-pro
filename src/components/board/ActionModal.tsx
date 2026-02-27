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
      {/* Container principale aumentato a max-w-2xl */}
      <div className={`${config.bg} ${config.border} border-2 w-full max-w-2xl rounded-[3rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all animate-in fade-in zoom-in duration-300`}>
        
        {/* Etichetta Header */}
        <div className={`${config.accent} absolute top-0 left-1/2 -translate-x-1/2 px-8 py-1.5 rounded-b-2xl shadow-lg`}>
          <span className="text-[11px] font-black text-black tracking-[0.3em] uppercase">{config.label}</span>
        </div>

        <div className="text-center mt-6">
          {/* Titolo più grande */}
          <h2 className={`text-3xl font-black ${config.text} uppercase tracking-tighter mb-4 italic leading-none`}>
            {title}
          </h2>
          
          {/* Box Insight Educativo - Più leggibile */}
          {insight && (
            <div className="mb-6 bg-white/5 rounded-2xl p-5 border-l-4 border-white/20">
              <p className="text-slate-200 text-sm leading-relaxed italic text-left opacity-90">
                “{insight}”
              </p>
            </div>
          )}

          {/* Descrizione standard */}
          <p className="text-slate-400 text-sm leading-snug mb-8 px-6 font-medium">
            {description}
          </p>

          {/* Box Impatto Funzionale - Layout migliorato */}
          {impact && (
            <div className="bg-black/40 rounded-[1.5rem] p-5 mb-8 border border-white/10 shadow-inner">
               <p className="text-[10px] uppercase text-slate-500 font-black mb-2 tracking-widest italic opacity-70">
                 Analisi Impatto Finanziario
               </p>
               <div className="text-sm font-mono text-white font-bold tracking-tight">
                 {impact.details || 'Calcolo metriche in corso...'}
               </div>
            </div>
          )}

          {/* Sezione Asset / Badge - Grid più spaziosa */}
          {assetLevels && (
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {assetLevels.map((level) => (
                  <div 
                    key={level.id} 
                    className={`relative p-5 rounded-[2rem] border-2 flex flex-col items-center transition-all duration-300 ${
                      level.status === 'owned' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                      level.status === 'available' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] animate-pulse scale-105 z-10' :
                      'bg-slate-800/40 border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-3xl mb-2">{level.icon}</span>
                    <span className="text-[10px] font-black text-white mb-1 uppercase tracking-widest">{level.label}</span>
                    <div className={`text-[11px] font-mono font-black ${level.status === 'available' ? 'text-blue-400' : 'text-slate-500'}`}>
                      €{(Number(level.cost) || 0).toLocaleString()}
                    </div>
                    
                    {level.status === 'owned' && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow-lg">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Call to Action Badge */}
              {badgeCta && (
                <div className="bg-blue-500/10 py-2 px-4 rounded-full inline-block border border-blue-500/20">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.15em]">
                    🎯 {badgeCta}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pulsanti Azione - Più grandi e cliccabili */}
          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={onAction}
              className={`w-full py-5 ${config.accent} text-black font-black rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-sm shadow-[0_10px_30px_rgba(0,0,0,0.3)]`}
            >
              {actionLabel}
            </button>
            {secondaryActionLabel && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 text-white/40 font-bold rounded-xl hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]"
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
