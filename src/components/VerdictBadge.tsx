import React from 'react';
import { InvestmentVerdictType } from '../types/property';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert, DollarSign } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: InvestmentVerdictType;
  targetPrice?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict, targetPrice, size = 'md' }) => {
  const getStyle = () => {
    switch (verdict) {
      case 'BUY':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md',
          icon: <CheckCircle2 className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        };
      case 'BUY BELOW $X':
        return {
          bg: 'bg-teal-500/15 text-teal-300 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-md',
          icon: <DollarSign className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        };
      case 'HOLD':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-md',
          icon: <Clock className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        };
      case 'SELL':
        return {
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)] backdrop-blur-md',
          icon: <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        };
      case 'RENT / DO NOT BUY':
        return {
          bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)] backdrop-blur-md',
          icon: <XCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        };
      case 'WAIT':
      default:
        return {
          bg: 'bg-white/10 text-slate-300 border-white/20 shadow-xs backdrop-blur-md',
          icon: <ShieldAlert className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        };
    }
  };

  const style = getStyle();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-xs font-bold tracking-wide uppercase',
    lg: 'px-4 py-1.5 text-sm font-extrabold tracking-wider uppercase'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl border ${style.bg} ${sizeClasses}`}>
      {style.icon}
      <span>{verdict === 'BUY BELOW $X' && targetPrice ? `BUY < $${(targetPrice / 1000000).toFixed(2)}M` : verdict}</span>
    </span>
  );
};
