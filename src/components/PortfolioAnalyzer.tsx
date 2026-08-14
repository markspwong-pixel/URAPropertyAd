import React, { useState } from 'react';
import { SINGAPORE_PROPERTIES } from '../data/singaporeProperties';
import { PropertyListing } from '../types/property';
import { formatFullSGD, formatSGD } from '../utils/calculators';
import { 
  PieChart as PieChartIcon, 
  Building2, 
  ShieldAlert, 
  TrendingUp, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';

interface PortfolioItem {
  id: string;
  name: string;
  region: 'CCR' | 'RCR' | 'OCR';
  tenure: 'Freehold' | '99-year Leasehold';
  currentValuation: number;
  outstandingLoan: number;
  monthlyRent: number;
  monthlyMortgage: number;
  monthlyExpenses: number;
}

export const PortfolioAnalyzer: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    {
      id: '1',
      name: 'Marina One Residences (D01)',
      region: 'CCR',
      tenure: '99-year Leasehold',
      currentValuation: 2500000,
      outstandingLoan: 1200000,
      monthlyRent: 7400,
      monthlyMortgage: 4800,
      monthlyExpenses: 850
    },
    {
      id: '2',
      name: 'The Continuum (D15)',
      region: 'RCR',
      tenure: 'Freehold',
      currentValuation: 2420000,
      outstandingLoan: 1100000,
      monthlyRent: 6800,
      monthlyMortgage: 4400,
      monthlyExpenses: 720
    }
  ]);

  const [investorMonthlyIncome, setInvestorMonthlyIncome] = useState<number>(28000);

  // Portfolio aggregates
  const totalValuation = portfolio.reduce((sum, item) => sum + item.currentValuation, 0);
  const totalDebt = portfolio.reduce((sum, item) => sum + item.outstandingLoan, 0);
  const netEquity = totalValuation - totalDebt;
  const totalMonthlyGrossRent = portfolio.reduce((sum, item) => sum + item.monthlyRent, 0);
  const totalMonthlyMortgage = portfolio.reduce((sum, item) => sum + item.monthlyMortgage, 0);
  const totalMonthlyExpenses = portfolio.reduce((sum, item) => sum + item.monthlyExpenses, 0);
  const totalMonthlyNetCash = totalMonthlyGrossRent - totalMonthlyMortgage - totalMonthlyExpenses;

  // LTV & Yield
  const portfolioLtv = totalValuation > 0 ? (totalDebt / totalValuation) * 100 : 0;
  const portfolioGrossYield = totalValuation > 0 ? ((totalMonthlyGrossRent * 12) / totalValuation) * 100 : 0;
  const portfolioNetYield = totalValuation > 0 ? (((totalMonthlyGrossRent - totalMonthlyExpenses) * 12) / totalValuation) * 100 : 0;

  // TDSR calculation (MAS 55% limit, 70% rental haircut for eligible income)
  const recognizedRentalIncome = totalMonthlyGrossRent * 0.70;
  const totalEligibleIncome = investorMonthlyIncome + recognizedRentalIncome;
  const currentTdsrRatio = totalEligibleIncome > 0 ? (totalMonthlyMortgage / totalEligibleIncome) * 100 : 0;

  // Region breakdown
  const regionBreakdown = [
    { name: 'CCR', value: portfolio.filter(p => p.region === 'CCR').reduce((s, p) => s + p.currentValuation, 0) },
    { name: 'RCR', value: portfolio.filter(p => p.region === 'RCR').reduce((s, p) => s + p.currentValuation, 0) },
    { name: 'OCR', value: portfolio.filter(p => p.region === 'OCR').reduce((s, p) => s + p.currentValuation, 0) },
  ].filter(r => r.value > 0);

  // Tenure breakdown
  const tenureBreakdown = [
    { name: 'Freehold', value: portfolio.filter(p => p.tenure === 'Freehold').reduce((s, p) => s + p.currentValuation, 0) },
    { name: '99-Yr Leasehold', value: portfolio.filter(p => p.tenure === '99-year Leasehold').reduce((s, p) => s + p.currentValuation, 0) },
  ].filter(t => t.value > 0);

  const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981'];

  const addProperty = () => {
    const defaultProp = SINGAPORE_PROPERTIES[2];
    setPortfolio([
      ...portfolio,
      {
        id: Date.now().toString(),
        name: defaultProp.name,
        region: defaultProp.region as any,
        tenure: defaultProp.tenure === 'Freehold' ? 'Freehold' : '99-year Leasehold',
        currentValuation: defaultProp.askingPrice,
        outstandingLoan: Math.round(defaultProp.askingPrice * 0.55),
        monthlyRent: defaultProp.estimatedRentMonthly,
        monthlyMortgage: 3800,
        monthlyExpenses: 650
      }
    ]);
  };

  const removeProperty = (id: string) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg">
                PORTFOLIO & RISK SURVEILLANCE
              </span>
              <span className="text-xs text-slate-400">MAS TDSR 55% & Macro Exposure Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Singapore Real Estate Portfolio & Stress Test
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Consolidated debt-to-equity surveillance, region exposure (CCR vs RCR vs OCR), leasehold decay vs freehold allocation, and MAS TDSR borrowing capacity stress tests.
            </p>
          </div>

          <button
            onClick={addProperty}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property to Portfolio</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Total Portfolio Value</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatFullSGD(totalValuation)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{portfolio.length} Properties Tracked</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Net Equity Value</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {formatFullSGD(netEquity)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Portfolio LTV: {portfolioLtv.toFixed(1)}%</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Gross / Net Annual Rent</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatSGD(totalMonthlyGrossRent * 12)}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
            Gross {portfolioGrossYield.toFixed(2)}% | Net {portfolioNetYield.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Net Monthly Cash Flow</div>
          <div className={`text-2xl font-black font-mono mt-1 ${totalMonthlyNetCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalMonthlyNetCash >= 0 ? `+${formatFullSGD(totalMonthlyNetCash)}` : `-${formatFullSGD(Math.abs(totalMonthlyNetCash))}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">After all mortgages & taxes</div>
        </div>
      </div>

      {/* MAS TDSR & Regulatory Stress Test Box */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              MAS Total Debt Servicing Ratio (TDSR 55% Limit) Stress Test
            </h2>
            <p className="text-xs text-slate-400">Includes 30% standard haircut on gross rental income under MAS guidelines</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300">Fixed Monthly Income (SGD):</span>
            <input
              type="number"
              step="1000"
              value={investorMonthlyIncome}
              onChange={(e) => setInvestorMonthlyIncome(Number(e.target.value))}
              className="px-2.5 py-1 bg-slate-950/50 border border-white/10 rounded-lg font-mono font-bold text-white w-28 text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-slate-400">Eligible Monthly Income (Base + 70% Rent):</span>
            <div className="text-lg font-bold text-white font-mono">{formatFullSGD(totalEligibleIncome)}</div>
            <div className="text-[11px] text-slate-400">Base: {formatSGD(investorMonthlyIncome)} | Rent (70%): {formatSGD(recognizedRentalIncome)}</div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-slate-400">Total Monthly Debt Service:</span>
            <div className="text-lg font-bold text-white font-mono">{formatFullSGD(totalMonthlyMortgage)}</div>
            <div className="text-[11px] text-slate-400">Aggregated across all properties</div>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 backdrop-blur-md ${currentTdsrRatio <= 55 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
            <span className="font-semibold">Current TDSR Utilization:</span>
            <div className="text-2xl font-black font-mono">
              {currentTdsrRatio.toFixed(1)}% <span className="text-xs font-normal">/ 55% MAS Max</span>
            </div>
            <div className="text-[11px] font-bold">
              {currentTdsrRatio <= 55 ? '✓ Fully Compliant (Borrowing Headroom Available)' : '⚠️ Exceeds MAS 55% Threshold'}
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Charts & Properties List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Properties Table (8 cols) */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Individual Portfolio Holdings
          </h3>

          <div className="overflow-x-auto border border-white/10 rounded-2xl bg-white/[0.02]">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
                <tr>
                  <th className="p-3">Development</th>
                  <th className="p-3">Region / Tenure</th>
                  <th className="p-3">Valuation</th>
                  <th className="p-3">Debt / LTV</th>
                  <th className="p-3">Rent / mo</th>
                  <th className="p-3">Net Cash</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {portfolio.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-white">{item.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-white/10 font-semibold text-[10px] mr-1 text-slate-300 border border-white/10">
                        {item.region}
                      </span>
                      <span className="text-slate-400">{item.tenure === 'Freehold' ? 'FH' : '99-yr'}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-white">{formatSGD(item.currentValuation)}</td>
                    <td className="p-3 font-mono text-slate-300">
                      {formatSGD(item.outstandingLoan)}{' '}
                      <span className="text-[10px] text-slate-400">
                        ({((item.outstandingLoan / item.currentValuation) * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">${item.monthlyRent.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold">
                      {item.monthlyRent - item.monthlyMortgage - item.monthlyExpenses >= 0 ? (
                        <span className="text-emerald-400">+${(item.monthlyRent - item.monthlyMortgage - item.monthlyExpenses).toLocaleString()}</span>
                      ) : (
                        <span className="text-rose-400">-${Math.abs(item.monthlyRent - item.monthlyMortgage - item.monthlyExpenses).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => removeProperty(item.id)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Remove from portfolio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-white">Regional Asset Distribution</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regionBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} fill="#8884d8">
                    {regionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', color: '#f8fafc' }}
                    formatter={(val: any) => formatSGD(val)} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-white">Tenure Allocation (FH vs 99-Yr)</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tenureBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} fill="#8884d8">
                    {tenureBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', color: '#f8fafc' }}
                    formatter={(val: any) => formatSGD(val)} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
