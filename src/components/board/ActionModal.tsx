'use client'
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Award, X } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: 'success' | 'danger' | 'info' | 'funding';
  impact?: {
    mrr?: number;
    costs?: number;
    cash?: number;
  };
  actionLabel?: string;
  onAction?: () => void;
  canAfford?: boolean;
}

export default function ActionModal({ 
  isOpen, onClose, title, description, type, impact, actionLabel, onAction, canAfford = true 
}: ActionModalProps) {
  
  const colors = {
    success: 'border-blue-500 shadow-blue-500/20 text-blue-400',
    danger: 'border-red-500 shadow-red-500/20 text-red-400',
    info: 'border-emerald-500 shadow-emerald-500/20 text-emerald-400',
    funding: 'border-purple-500 shadow-purple-500/20 text-purple-400'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md bg-slate-900 border-2 rounded-3xl p-8 shadow-2xl ${colors[type]}`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-1 text-white">{title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Impact Grid */}
            {impact && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {impact.mrr !== undefined && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-blue-400" />
                      <span className="text-[10px] uppercase font-bold text-slate-500">MRR Effect</span>
                    </div>
                    <p className={`text-lg font-mono font-bold ${impact.mrr >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {impact.mrr >= 0 ? '+' : ''}{impact.mrr}€
                    </p>
                  </div>
                )}
                {impact.costs !== undefined && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown size={14} className="text-red-400" />
                      <span className="text-[10px] uppercase font-bold text-slate-500">Cost Effect</span>
                    </div>
                    <p className="text-lg font-mono font-bold text-white">
                      +{impact.costs}€
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Section */}
            <div className="flex flex-col gap-3">
              {actionLabel && (
                <button 
                  disabled={!canAfford}
                  onClick={onAction}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all
                    ${canAfford 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  {canAfford ? actionLabel : 'Insufficient Cash'}
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-full py-4 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 rounded-2xl font-bold uppercase text-xs transition-all"
              >
                Close
              </button>
            </div>

            {/* Glow Decorativo */}
            <div className={`absolute -inset-1 rounded-3xl opacity-20 blur-xl -z-10 ${colors[type].split(' ')[0].replace('border', 'bg')}`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
