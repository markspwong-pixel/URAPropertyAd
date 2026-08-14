import React, { useState } from 'react';
import { PropertyListing } from '../types/property';
import { SINGAPORE_PROPERTIES } from '../data/singaporeProperties';
import { calculateSellVsHold, formatFullSGD, formatSGD } from '../utils/calculators';
import { VerdictBadge } from './VerdictBadge';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Building2, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface SellVsHoldStudioProps {
  initialProperty?: PropertyListing | null;
}

export const SellVsHoldStudio: React.FC<SellVsHoldStudioProps> = ({ initialProperty }) => {
  const [currentMarketValue, setCurrentMarketValue] = useState<number>(initialProperty ? initialProperty.askingPrice : 2300000);
  const [purchasePrice, setPurchasePrice] = useState<number>(initialProperty ? Math.round(initialProperty.askingPrice * 0.85) : 1950000);
  const [outstandingLoan, setOutstandingLoan] = useState<number>(1100000);
  const [currentMonthlyRent, setCurrentMonthlyRent] = useState<number>(initialProperty ? initialProperty.estimatedRentMonthly : 6800);
  const [annualExpenses, setAnnualExpenses] = useState<number>(7500);
  const [projectedAppreciationRate, setProjectedAppreciationRate] = useState<number>(3.0); // % p.a.
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(5);
  const [reinvestmentYieldAnnual, setReinvestmentYieldAnnual] = useState<number>(5.5); // e.g. Singapore REITs basket
  const [reinvestmentAsset, setReinvestmentAsset] = useState<string>('Singapore REITs Basket (5.5% DPU)');
  const [yearsHeld, setYearsHeld] = useState<number>(4);

  const result = calculateSellVsHold({
    currentMarketValue,
    purchasePrice,
    outstandingLoan,
    currentMonthlyRent,
    annualExpenses,
    projectedAppreciationRate,
    holdingPeriodYears,
    reinvestmentAsset,
    reinvestmentYieldAnnual,
    yearsHeld
  });

  const chartData = [
    {
      name: 'Year 1',
      HoldProperty: Math.round(result.holdScenario.netEquityAtEnd * 0.2),
      RedeployCapital: Math.round(result.sellScenario.reinvestmentProjectedValue * 0.2)
    },
    {
      name: `Year ${Math.round(holdingPeriodYears / 2)}`,
      HoldProperty: Math.round(result.holdScenario.netEquityAtEnd * 0.6),
      RedeployCapital: Math.round(result.sellScenario.reinvestmentProjectedValue * 0.6)
    },
    {
      name: `Year ${holdingPeriodYears} (Terminal)`,
      HoldProperty: Math.round(result.holdScenario.netEquityAtEnd),
      RedeployCapital: Math.round(result.sellScenario.reinvestmentProjectedValue)
    }
  ];

  const presets = [
    { name: 'SG REITs (5.5% yield)', rate: 5.5 },
    { name: 'S&P 500 ETF (7.0% hist)', rate: 7.0 },
    { name: 'MAS T-Bills / SSB (3.0%)', rate: 3.0 },
    { name: 'New Launch Property (4.5%)', rate: 4.5 }
  ];

  const verdict = result.recommendation === 'REDEPLOY' ? 'SELL' : 'HOLD';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg">
                OPPORTUNITY COST & CAPITAL REDEPLOYMENT
              </span>
              <span className="text-xs text-slate-400">Institutional Exit / Hold Decision Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sell vs. Hold Capital Allocation Studio
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Compare {holdingPeriodYears}-year total holding returns (capital appreciation + net rental income - debt service) against realizing net cash proceeds (post-SSD & selling friction) and redeploying into alternative yield assets.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-white/10 p-3.5 rounded-2xl text-right shrink-0 backdrop-blur-md">
            <div className="text-xs text-slate-400 font-medium">Recommended Decision:</div>
            <div className="mt-1">
              <VerdictBadge verdict={verdict} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Configuration (5 cols) */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-xl shadow-2xl">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
            Current Property & Exit Parameters
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Current Market Value / Expected Sale Price (SGD)
            </label>
            <input
              type="number"
              step="50000"
              value={currentMarketValue}
              onChange={(e) => setCurrentMarketValue(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Outstanding Mortgage
              </label>
              <input
                type="number"
                step="20000"
                value={outstandingLoan}
                onChange={(e) => setOutstandingLoan(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Years Held (SSD Check)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={yearsHeld}
                onChange={(e) => setYearsHeld(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Monthly Rent (SGD)
              </label>
              <input
                type="number"
                step="200"
                value={currentMonthlyRent}
                onChange={(e) => setCurrentMonthlyRent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Annual Expenses (Tax/MCST)
              </label>
              <input
                type="number"
                step="500"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Holding Horizon (Years)
              </label>
              <select
                value={holdingPeriodYears}
                onChange={(e) => setHoldingPeriodYears(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white cursor-pointer"
              >
                <option value={3} className="bg-slate-900">3 Years</option>
                <option value={5} className="bg-slate-900">5 Years</option>
                <option value={7} className="bg-slate-900">7 Years</option>
                <option value={10} className="bg-slate-900">10 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Projected Growth (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={projectedAppreciationRate}
                onChange={(e) => setProjectedAppreciationRate(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Alternative Deployment Options */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Alternative Deployment Benchmark Return (% p.a.)
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setReinvestmentYieldAnnual(p.rate);
                    setReinvestmentAsset(p.name);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left truncate transition-all cursor-pointer ${
                    reinvestmentYieldAnnual === p.rate
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-950/40 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.1"
              value={reinvestmentYieldAnnual}
              onChange={(e) => setReinvestmentYieldAnnual(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Financial Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Decision Rationale Box */}
          <div className={`p-5 rounded-3xl border backdrop-blur-xl shadow-xl ${result.recommendation === 'REDEPLOY' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
            <div className="flex items-center gap-2 font-bold text-base mb-1">
              <VerdictBadge verdict={verdict} size="md" />
              <span className="text-white">Recommendation Summary: {result.recommendation}</span>
            </div>
            <ul className="text-xs leading-relaxed mt-2 space-y-1 text-slate-300">
              {result.decisionRationale.map((rat, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{rat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hold Scenario */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Option A: Hold Property</span>
                <span className="text-xs font-bold text-white font-mono">{holdingPeriodYears}-Yr Terminal</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {formatFullSGD(result.holdScenario.netEquityAtEnd)}
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Projected Future Price:</span>
                  <span className="font-mono text-white">{formatFullSGD(result.holdScenario.projectedFutureValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cumulative Net Rent ({holdingPeriodYears} yrs):</span>
                  <span className="font-mono text-emerald-400">+{formatFullSGD(result.holdScenario.totalNetRentalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Annualized Return:</span>
                  <span className="font-mono text-teal-400 font-bold">+{result.holdScenario.annualizedReturn}% p.a.</span>
                </div>
              </div>
            </div>

            {/* Sell Scenario */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Option B: Realize & Redeploy</span>
                <span className="text-xs font-bold text-white font-mono">{holdingPeriodYears}-Yr Terminal</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {formatFullSGD(result.sellScenario.reinvestmentProjectedValue)}
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Cash Proceeds Today:</span>
                  <span className="font-mono font-bold text-white">{formatFullSGD(result.sellScenario.netCashProceeds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selling Fees (Agent + Legal):</span>
                  <span className="font-mono text-rose-400">-{formatFullSGD(result.sellScenario.agentSellingFee + result.sellScenario.legalFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Annualized Return:</span>
                  <span className="font-mono text-emerald-400 font-bold">+{result.sellScenario.annualizedReturn}% p.a.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart View */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md shadow-lg">
            <h3 className="text-xs font-bold text-white">
              Wealth Trajectory Comparison ({holdingPeriodYears} Years)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="rgba(255,255,255,0.15)" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="rgba(255,255,255,0.15)" tickFormatter={(v) => `$${(v / 1000000).toFixed(2)}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', color: '#f8fafc' }}
                    formatter={(val: any) => formatFullSGD(val)} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="HoldProperty" name="Holding Property" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="RedeployCapital" name={`Redeploy in ${reinvestmentAsset}`} fill="#34d399" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
