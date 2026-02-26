import React from 'react';

interface ActionModalProps {
  isOpen: boolean;
  type: 'success' | 'danger' | 'info' | 'opportunity' | 'danger_event';
  title: string;
  description: string;
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
  isOpen, type, title, description, impact, assetLevels, actionLabel, secondaryActionLabel, onAction, onClose
}: ActionModalProps) {
  if (!isOpen) return null;

  const configs = {
    opportunity: { bg: 'bg-emerald-950/95', border: 'border-emerald-500', text: 'text-emerald-400', icon: '🚀', accent: 'bg-emerald-500', label: 'OPPORTUNITÀ' },
    danger_event: { bg: 'bg-rose-950/95', border: 'border-rose-500', text: 'text-rose-400', icon: '⚠️', accent: 'bg-rose-500', label: 'IMPREVISTO' },
    success: { bg: 'bg-slate-900', border: 'border-blue-500', text: 'text-blue-400', icon: '🏢', accent: 'bg-blue-500', label: 'INVESTIMENTO' },
    danger: { bg: 'bg-slate-900', border: 'border-red-500', text: 'text-red-400', icon: '💸', accent: 'bg-red-500', label: 'COSTO' },
    info: { bg: 'bg-slate-900', border: 'border-amber-500', text: 'text-amber-400', icon: '💰', accent: 'bg-amber-500', label: 'ROUND' },
  };

  const config = configs[type] || configs.info;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <div className={`${config.bg} ${config.border} border-2 w-full max-w-lg rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all animate-in fade-in zoom-in duration-300`}>
        
        <div className={`${config.accent} absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1 rounded-b-xl`}>
          <span className="text-[10px] font-black text-black tracking-[0.2em]">{config.label}</span>
        </div>

        <div className="text-center mt-4">
          <h2 className={`text-2xl font-black ${config.text} uppercase tracking-tighter mb-2 italic`}>{title}</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6 px-4">{description}</p>

          {/* Sezione Impatto Immediato (sempre visibile se presente) */}
          {impact && (
            <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
               <p className="text-[8px] uppercase text-slate-500 font-bold mb-1 tracking-widest text-center">Impatto sulla Startup</p>
               <div className="text-sm font-mono text-white text-center leading-tight">
                 {impact.details}
               </div>
            </div>
          )}

          {/* Sezione Asset Levels (Card Grafiche) */}
          {assetLevels && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {assetLevels.map((level) => (
                <div 
                  key={level.id} 
                  className={`relative p-3 rounded-2xl border-2 flex flex-col items-center transition-all duration-300 ${
                    level.status === 'owned' ? 'bg-emerald-500/10 border-emerald-500 opacity-100 scale-100' :
                    level.status === 'available' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-pulse' :
                    'bg-slate-800/40 border-white/5 opacity-40 grayscale scale-95'
                  }`}
                >
                  <span className="text-2xl mb-1">{level.icon}</span>
                  <span className="text-[9px] font-black text-white mb-1 uppercase tracking-tighter">{level.label}</span>
                  <div className="text-[8px] font-mono font-bold text-blue-400">€{level.cost.toLocaleString()}</div>
                  
                  {level.status === 'owned' && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-lg">✓</div>
                  )}
                  {level.status === 'available' && (
                    <div className="mt-2 text-[7px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase">BUY</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={onAction}
              className={`w-full py-4 ${config.accent} text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs shadow-xl`}
            >
              {actionLabel}
            </button>
            {secondaryActionLabel && (
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 text-white/50 font-bold rounded-2xl hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]"
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
