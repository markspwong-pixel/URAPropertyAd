import React from 'react';
import { InvestmentScoreBreakdown } from '../types/property';

interface ScoreGaugeProps {
  score: number;
  breakdown?: InvestmentScoreBreakdown;
  showBreakdown?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, breakdown, showBreakdown = false }) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
    if (val >= 75) return 'text-teal-300 bg-teal-500/15 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.25)]';
    if (val >= 60) return 'text-amber-300 bg-amber-500/15 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
    return 'text-rose-300 bg-rose-500/15 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
  };

  const getBarColor = (val: number, max: number) => {
    const pct = (val / max) * 100;
    if (pct >= 85) return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
    if (pct >= 70) return 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]';
    if (pct >= 50) return 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
    return 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Investment Score</div>
          <div className="text-[11px] text-slate-400">Institutional 100-pt Decision Model</div>
        </div>
        <div className={`px-3 py-1.5 rounded-xl border backdrop-blur-md font-mono font-bold text-lg flex items-baseline gap-1 ${getScoreColor(score)}`}>
          <span>{score}</span>
          <span className="text-xs opacity-60 font-sans font-normal">/ 100</span>
        </div>
      </div>

      {showBreakdown && breakdown && (
        <div className="space-y-2.5 pt-2.5 border-t border-white/10 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Valuation & Pricing</span>
              <span className="font-semibold text-slate-200">{breakdown.valuationScore} / 25</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(breakdown.valuationScore, 25)}`}
                style={{ width: `${(breakdown.valuationScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Rental Yield & Income</span>
              <span className="font-semibold text-slate-200">{breakdown.rentalScore} / 20</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(breakdown.rentalScore, 20)}`}
                style={{ width: `${(breakdown.rentalScore / 20) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Capital Appreciation Potential</span>
              <span className="font-semibold text-slate-200">{breakdown.capitalAppreciationScore} / 25</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(breakdown.capitalAppreciationScore, 25)}`}
                style={{ width: `${(breakdown.capitalAppreciationScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Location Fundamentals</span>
              <span className="font-semibold text-slate-200">{breakdown.locationScore} / 15</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(breakdown.locationScore, 15)}`}
                style={{ width: `${(breakdown.locationScore / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Liquidity Rating</span>
              <span className="font-semibold text-slate-200">{breakdown.liquidityScore} / 10</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(breakdown.liquidityScore, 10)}`}
                style={{ width: `${(breakdown.liquidityScore / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Risk & Margin of Safety</span>
              <span className="font-semibold text-slate-200">{breakdown.riskScore} / 5</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(breakdown.riskScore, 5)}`}
                style={{ width: `${(breakdown.riskScore / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
