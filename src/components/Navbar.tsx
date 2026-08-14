import React from 'react';
import { InvestorObjective, BuyerProfileType } from '../types/property';
import { Building2, TrendingUp, Calculator, ArrowRightLeft, PieChart, MessageSquareCode, Database, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  investorObjective: InvestorObjective;
  setInvestorObjective: (obj: InvestorObjective) => void;
  buyerProfile: BuyerProfileType;
  setBuyerProfile: (profile: BuyerProfileType) => void;
  uraStatus?: {
    tokenValid: boolean;
    proxyStatus: string;
    hasAccessKey: boolean;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  investorObjective,
  setInvestorObjective,
  buyerProfile,
  setBuyerProfile,
  uraStatus
}) => {
  const [showProfileSettings, setShowProfileSettings] = React.useState(false);

  const navItems = [
    { id: 'explorer', label: 'Property Explorer', icon: <Building2 className="w-4 h-4" /> },
    { id: 'memo', label: 'Investment Memo & Verdict', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'calculator', label: 'Buy-to-Rent & Stamp Duty', icon: <Calculator className="w-4 h-4" /> },
    { id: 'sell-vs-hold', label: 'Sell vs. Hold Studio', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio & Stress Test', icon: <PieChart className="w-4 h-4" /> },
    { id: 'advisor-chat', label: 'Senior AI Advisor', icon: <MessageSquareCode className="w-4 h-4" /> },
    { id: 'ura-console', label: 'URA Data & Discipline', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/75 backdrop-blur-xl border-b border-white/10 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top tier brand and quick profile bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md">
              SG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">Singapore Property Investor Advisor</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  URA DATA ENABLED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Institutional Acquisition, Disposal, Rental & Valuation Decision Engine
              </p>
            </div>
          </div>

          {/* Quick Profile Summary & Control */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-400">Profile:</span>
              <span className="font-semibold text-emerald-400">{buyerProfile.split('(')[0].trim()}</span>
              <span className="text-white/20">|</span>
              <span className="text-slate-400">Objective:</span>
              <span className="font-semibold text-teal-300">{investorObjective.split('(')[0].trim()}</span>
            </div>

            <button
              onClick={() => setShowProfileSettings(!showProfileSettings)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-emerald-500/40 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-xs"
              title="Configure Investor Profile & Stamp Duty Rules"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Investor Profile</span>
            </button>

            {/* URA Status Pill */}
            <div 
              onClick={() => setActiveTab('ura-console')}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-bold">URA API Live</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-2 border-t border-white/10 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all backdrop-blur-md ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide-out / Dropdown for Investor Profile Settings */}
      {showProfileSettings && (
        <div className="bg-slate-900/90 backdrop-blur-2xl border-b border-white/10 px-4 py-5 shadow-2xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Buyer Residency & Stamp Duty Profile (ABSD Rules)
              </label>
              <select
                value={buyerProfile}
                onChange={(e) => setBuyerProfile(e.target.value as BuyerProfileType)}
                className="w-full bg-slate-950/80 border border-white/15 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none backdrop-blur-md"
              >
                <option value="Singapore Citizen (1st Property)">Singapore Citizen (1st Property - 0% ABSD)</option>
                <option value="Singapore Citizen (2nd Property)">Singapore Citizen (2nd Property - 20% ABSD)</option>
                <option value="Singapore Citizen (3rd+ Property)">Singapore Citizen (3rd+ Property - 30% ABSD)</option>
                <option value="Permanent Resident (1st Property)">Permanent Resident (1st Property - 5% ABSD)</option>
                <option value="Permanent Resident (2nd+ Property)">Permanent Resident (2nd+ Property - 30% ABSD)</option>
                <option value="Foreigner">Foreigner (60% ABSD on Residential)</option>
                <option value="Entity / Trust">Entity / Trust (65% ABSD on Residential)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Note: Commercial Shophouses and Strata Offices are strictly 0% ABSD across all buyer profiles.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Primary Investment Objective
              </label>
              <select
                value={investorObjective}
                onChange={(e) => setInvestorObjective(e.target.value as InvestorObjective)}
                className="w-full bg-slate-950/80 border border-white/15 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none backdrop-blur-md"
              >
                <option value="Balanced">Balanced (Equal Weight: Yield + Growth + Margin)</option>
                <option value="Income (High Yield)">Income (High Yield & Resilient Rental Demand)</option>
                <option value="Capital Growth">Capital Growth (Infrastructure, Master Plan & Redevelopment)</option>
                <option value="Conservative">Conservative (Valuation Safety Margin, Freehold & Liquidity)</option>
                <option value="Value-Add / Opportunistic">Value-Add / Opportunistic (Sub-sale / Dislocation)</option>
                <option value="Own Stay / Family">Own Stay / Family (Liveability, Elite Schools & Transit)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Scorecards and AI decision models dynamically re-weight based on selected objective.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
