import React from 'react';

interface ActionModalProps {
  isOpen: boolean;
  type: 'success' | 'danger' | 'info' | 'opportunity' | 'danger_event';
  title: string;
  description: string;
  impact?: {
    cash?: number;
    ebitda?: number;
    details?: string;
  };
  actionLabel: string;
  secondaryActionLabel?: string;
  onAction: () => void;
  onClose?: () => void;
}

export default function ActionModal({
  isOpen, type, title, description, impact, actionLabel, secondaryActionLabel, onAction, onClose
}: ActionModalProps) {
  if (!isOpen) return null;

  // Configurazione stili e icone in base al tipo
  const configs = {
    opportunity: {
      bg: 'bg-emerald-950/95',
      border: 'border-emerald-500',
      text: 'text-emerald-400',
      icon: '🚀',
      accent: 'bg-emerald-500',
      label: 'OPPORTUNITÀ'
    },
    danger_event: {
      bg: 'bg-rose-950/95',
      border: 'border-rose-500',
      text: 'text-rose-400',
      icon: '⚠️',
      accent: 'bg-rose-500',
      label: 'IMPREVISTO'
    },
    success: { bg: 'bg-slate-900', border: 'border-blue-500', text: 'text-blue-400', icon: '💰', accent: 'bg-blue-500', label: 'INVESTIMENTO' },
    danger: { bg: 'bg-slate-900', border: 'border-red-500', text: 'text-red-400', icon: '💸', accent: 'bg-red-500', label: 'COSTO' },
    info: { bg: 'bg-slate-900', border: 'border-amber-500', text: 'text-amber-400', icon: '🏢', accent: 'bg-amber-500', label: 'ROUND' },
  };

  const config = configs[type] || configs.info;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <div className={`${config.bg} ${config.border} border-2 w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
        
        {/* Badge Superiore */}
        <div className={`${config.accent} absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1 rounded-b-xl`}>
          <span className="text-[10px] font-black text-black tracking-[0.2em]">{config.label}</span>
        </div>

        <div className="text-center mt-4">
          <div className="text-5xl mb-4">{config.icon}</div>
          <h2 className={`text-2xl font-black ${config.text} uppercase tracking-tighter mb-4 italic`}>
            {title}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
            {description}
          </p>

          {impact && (
            <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
              {impact.cash && (
                <div className={`text-xl font-black ${impact.cash > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {impact.cash > 0 ? '+' : ''}€{impact.cash.toLocaleString()}
                </div>
              )}
              {impact.details && <div className="text-xs text-slate-400 mt-1 font-mono">{impact.details}</div>}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={onAction}
              className={`w-full py-4 ${config.accent} text-black font-black rounded-2xl hover:scale-[1.02] transition-transform uppercase tracking-widest text-xs`}
            >
              {actionLabel}
            </button>
            {secondaryActionLabel && (
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 text-white/50 font-bold rounded-2xl hover:text-white transition-colors uppercase tracking-widest text-[10px]"
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
