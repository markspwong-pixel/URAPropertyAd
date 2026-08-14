import React, { useState, useEffect } from 'react';
import { InvestorObjective, BuyerProfileType, PropertyListing } from './types/property';
import { SINGAPORE_PROPERTIES } from './data/singaporeProperties';
import { getUraStatus } from './services/api';
import { Navbar } from './components/Navbar';
import { PropertyExplorer } from './components/PropertyExplorer';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { InvestmentMemoView } from './components/InvestmentMemoView';
import { BuyToRentCalculator } from './components/BuyToRentCalculator';
import { SellVsHoldStudio } from './components/SellVsHoldStudio';
import { PortfolioAnalyzer } from './components/PortfolioAnalyzer';
import { AIAdvisorChat } from './components/AIAdvisorChat';
import { UraConsole } from './components/UraConsole';
import { DisqusComments } from './components/DisqusComments';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('explorer');
  const [investorObjective, setInvestorObjective] = useState<InvestorObjective>('Balanced');
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfileType>('Singapore Citizen (1st Property)');
  
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(SINGAPORE_PROPERTIES[0]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [calculatorTargetProperty, setCalculatorTargetProperty] = useState<PropertyListing | null>(null);

  const [uraStatus, setUraStatus] = useState<any>(null);

  useEffect(() => {
    getUraStatus()
      .then(setUraStatus)
      .catch((err) => console.warn('Failed to pre-fetch URA status:', err));
  }, []);

  const handleOpenDetail = (property: PropertyListing) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const handleGenerateMemoForProperty = (property: PropertyListing) => {
    setSelectedProperty(property);
    setActiveTab('memo');
  };

  const handleOpenCalculatorForProperty = (property: PropertyListing) => {
    setCalculatorTargetProperty(property);
    setActiveTab('calculator');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Frosted Glass Background Ambient Lighting Orbs */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-0" />
      <div className="fixed bottom-1/3 left-10 w-[600px] h-[600px] bg-emerald-600/10 blur-[180px] rounded-full pointer-events-none -z-0" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none -z-0" />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        investorObjective={investorObjective}
        setInvestorObjective={setInvestorObjective}
        buyerProfile={buyerProfile}
        setBuyerProfile={setBuyerProfile}
        uraStatus={uraStatus}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'explorer' && (
          <>
            <PropertyExplorer
              onSelectProperty={handleOpenDetail}
              onGenerateMemo={handleGenerateMemoForProperty}
              investorObjective={investorObjective}
              buyerProfile={buyerProfile}
            />
            <DisqusComments
              pageIdentifier="singapore-property-investor-advisor-home"
              title="Singapore Property Investor Community Discussion"
            />
          </>
        )}

        {activeTab === 'memo' && (
          <InvestmentMemoView
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
            investorObjective={investorObjective}
            buyerProfile={buyerProfile}
          />
        )}

        {activeTab === 'calculator' && (
          <BuyToRentCalculator
            initialProperty={calculatorTargetProperty || selectedProperty}
            buyerProfile={buyerProfile}
            setBuyerProfile={setBuyerProfile}
          />
        )}

        {activeTab === 'sell-vs-hold' && (
          <SellVsHoldStudio initialProperty={selectedProperty} />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioAnalyzer />
        )}

        {activeTab === 'advisor-chat' && (
          <AIAdvisorChat
            selectedProperty={selectedProperty}
            investorObjective={investorObjective}
            buyerProfile={buyerProfile}
          />
        )}

        {activeTab === 'ura-console' && (
          <UraConsole />
        )}
      </main>

      {/* Property Deep-Dive Modal */}
      {isDetailModalOpen && selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setIsDetailModalOpen(false)}
          onGenerateMemo={handleGenerateMemoForProperty}
          onOpenCalculator={handleOpenCalculatorForProperty}
          investorObjective={investorObjective}
          buyerProfile={buyerProfile}
        />
      )}

      {/* Persistent Status & Compliance Footer */}
      <footer className="bg-slate-950/70 backdrop-blur-xl border-t border-white/10 py-6 text-slate-400 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-[11px] shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              SG
            </div>
            <span className="font-bold text-slate-200">Singapore Property Investor Advisor</span>
            <span className="text-slate-500 hidden sm:inline">— Institutional Decision Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              URA Proxy Synchronized
            </span>
            <span>IRAS Progressive BSD/ABSD (2024–2026)</span>
            <span>MAS TDSR 55% Framework</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
