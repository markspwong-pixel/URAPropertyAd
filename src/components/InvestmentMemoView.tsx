import React, { useState, useEffect } from 'react';
import { PropertyListing, InvestorObjective, BuyerProfileType } from '../types/property';
import { SINGAPORE_PROPERTIES } from '../data/singaporeProperties';
import { generateInvestmentMemo } from '../services/api';
import { formatFullSGD, formatSGD } from '../utils/calculators';
import { VerdictBadge } from './VerdictBadge';
import { 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Building2, 
  Download, 
  SlidersHorizontal,
  Info,
  ShieldCheck
} from 'lucide-react';

interface InvestmentMemoViewProps {
  selectedProperty: PropertyListing | null;
  onSelectProperty: (property: PropertyListing) => void;
  investorObjective: InvestorObjective;
  buyerProfile: BuyerProfileType;
}

export const InvestmentMemoView: React.FC<InvestmentMemoViewProps> = ({
  selectedProperty,
  onSelectProperty,
  investorObjective,
  buyerProfile
}) => {
  const [currentProp, setCurrentProp] = useState<PropertyListing>(
    selectedProperty || SINGAPORE_PROPERTIES[0]
  );
  const [memoText, setMemoText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (selectedProperty) {
      setCurrentProp(selectedProperty);
    }
  }, [selectedProperty]);

  const handleGenerateMemo = async (propToUse = currentProp) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await generateInvestmentMemo(propToUse, {
        objective: investorObjective,
        buyerProfile
      });
      setMemoText(res.memo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate investment memo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate initial memo on mount or when property changes
    handleGenerateMemo(currentProp);
  }, [currentProp.id, investorObjective, buyerProfile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([memoText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `Investment_Memo_${currentProp.name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                GEMINI 3.7 FLASH ADVISORY ENGINE
              </span>
              <span className="text-xs text-slate-400">Institutional Decision Memo Synthesis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Institutional Property Investment Memo
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Generates rigorous, board-ready property investment memos with definitive Buy/Hold/Sell/Rent verdicts, key empirical reasons, financial snapshots, upside catalysts, and verified risk matrices.
            </p>
          </div>

          {/* Property Selector */}
          <div className="flex items-center gap-3 bg-slate-950/60 border border-white/10 p-2.5 rounded-2xl backdrop-blur-md">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <select
              value={currentProp.id}
              onChange={(e) => {
                const found = SINGAPORE_PROPERTIES.find(p => p.id === e.target.value);
                if (found) {
                  setCurrentProp(found);
                  onSelectProperty(found);
                }
              }}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {SINGAPORE_PROPERTIES.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} (D{p.district < 10 ? `0${p.district}` : p.district}) • {formatSGD(p.askingPrice)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Memo Controls & Metadata Ribbon */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-400">Target Property:</span>{' '}
            <strong className="text-white">{currentProp.name}</strong>
          </div>
          <div>
            <span className="text-slate-400">Asking:</span>{' '}
            <strong className="text-white font-mono">{formatFullSGD(currentProp.askingPrice)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Objective:</span>{' '}
            <strong className="text-emerald-400">{investorObjective.split('(')[0]}</strong>
          </div>
          <div>
            <span className="text-slate-400">Buyer Profile:</span>{' '}
            <strong className="text-slate-200">{buyerProfile.split('(')[0]}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerateMemo(currentProp)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Regenerate Memo'}</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!memoText || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!memoText || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>
        </div>
      </div>

      {/* Memo Display Area */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Synthesizing Senior Property Investment Memo...</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Cross-referencing URA comparable transactions, balance lease decay curves, progressive property tax schedules, and scenario stress tests.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs space-y-2 backdrop-blur-md">
            <strong className="block font-bold text-sm text-rose-200">Advisory Synthesis Error</strong>
            <p>{error}</p>
            <button
              onClick={() => handleGenerateMemo(currentProp)}
              className="mt-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Retry
            </button>
          </div>
        ) : memoText ? (
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4">
            <div className="p-4 bg-slate-950/40 border border-white/10 rounded-2xl mb-6 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Authoritative Singapore Investment Memo • Certified URA-Grounded Discipline
                </span>
              </div>
              <VerdictBadge verdict={currentProp.defaultVerdict} targetPrice={currentProp.targetBuyPrice} size="md" />
            </div>

            {/* Formatted Markdown Rendered Block */}
            <div className="whitespace-pre-wrap font-sans text-slate-200 space-y-4">
              {memoText}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
