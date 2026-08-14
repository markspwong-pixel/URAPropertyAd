import React, { useState } from 'react';
import { PropertyListing, BuyerProfileType, PropertyType } from '../types/property';
import { SINGAPORE_PROPERTIES } from '../data/singaporeProperties';
import { calculateBuyToRentEconomics, formatFullSGD, formatSGD } from '../utils/calculators';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Building2, 
  HelpCircle, 
  ArrowDownRight, 
  ArrowUpRight,
  ShieldCheck,
  ReceiptText
} from 'lucide-react';

interface BuyToRentCalculatorProps {
  initialProperty?: PropertyListing | null;
  buyerProfile: BuyerProfileType;
  setBuyerProfile: (profile: BuyerProfileType) => void;
}

export const BuyToRentCalculator: React.FC<BuyToRentCalculatorProps> = ({
  initialProperty,
  buyerProfile,
  setBuyerProfile
}) => {
  const [purchasePrice, setPurchasePrice] = useState<number>(initialProperty ? initialProperty.askingPrice : 2450000);
  const [monthlyRent, setMonthlyRent] = useState<number>(initialProperty ? initialProperty.estimatedRentMonthly : 7200);
  const [propertyType, setPropertyType] = useState<PropertyType>(initialProperty ? initialProperty.propertyType : 'Condominium');
  const [downpaymentPercent, setDownpaymentPercent] = useState<number>(25); // 75% LTV
  const [loanTenureYears, setLoanTenureYears] = useState<number>(30);
  const [interestRatePercent, setInterestRatePercent] = useState<number>(3.5);
  const [maintenanceFeeMonthly, setMaintenanceFeeMonthly] = useState<number>(initialProperty ? initialProperty.maintenanceFeeMonthly : 480);
  const [renovationCost, setRenovationCost] = useState<number>(25000);
  const [legalFees, setLegalFees] = useState<number>(3500);

  const economics = calculateBuyToRentEconomics({
    purchasePrice,
    monthlyRent,
    buyerProfile,
    propertyType,
    downpaymentPercent,
    loanTenureYears,
    interestRatePercent,
    maintenanceFeeMonthly,
    legalAndValuationFees: legalFees,
    renovationAndFurnishing: renovationCost
  });

  const loadPreset = (prop: PropertyListing) => {
    setPurchasePrice(prop.askingPrice);
    setMonthlyRent(prop.estimatedRentMonthly);
    setPropertyType(prop.propertyType);
    setMaintenanceFeeMonthly(prop.maintenanceFeeMonthly);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg">
                IRAS 2024–2026 TAX TIERS & MAS TDSR / LTV
              </span>
              <span className="text-xs text-slate-400">Total Invested Capital & Net Cash Flow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Singapore Buy-To-Rent Financial Decision Engine
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Calculate exact total acquisition capital (Purchase Price + BSD + ABSD + Conveyancing), progressive residential non-owner property taxes, mortgage amortization, net yields, and monthly cash flow.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
            <span className="text-xs text-slate-400">Preset:</span>
            <select
              onChange={(e) => {
                const found = SINGAPORE_PROPERTIES.find(p => p.id === e.target.value);
                if (found) loadPreset(found);
              }}
              className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
            >
              <option value="">Select Property Preset...</option>
              {SINGAPORE_PROPERTIES.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({formatSGD(p.askingPrice)})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) and Financial Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS COLUMN (5 cols) */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-xl shadow-2xl">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Acquisition & Financing Parameters
          </h2>

          {/* Purchase Price */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Purchase Price (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">$</span>
              <input
                type="number"
                step="50000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Monthly Rent */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Estimated Monthly Rental Income (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">$</span>
              <input
                type="number"
                step="100"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Annual Gross Rent: {formatFullSGD(monthlyRent * 12)}
            </div>
          </div>

          {/* Buyer Profile (ABSD) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Buyer Residency & ABSD Profile
            </label>
            <select
              value={buyerProfile}
              onChange={(e) => setBuyerProfile(e.target.value as BuyerProfileType)}
              className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Singapore Citizen (1st Property)" className="bg-slate-900">Singapore Citizen (1st Property - 0% ABSD)</option>
              <option value="Singapore Citizen (2nd Property)" className="bg-slate-900">Singapore Citizen (2nd Property - 20% ABSD)</option>
              <option value="Singapore Citizen (3rd+ Property)" className="bg-slate-900">Singapore Citizen (3rd+ Property - 30% ABSD)</option>
              <option value="Permanent Resident (1st Property)" className="bg-slate-900">Permanent Resident (1st Property - 5% ABSD)</option>
              <option value="Permanent Resident (2nd+ Property)" className="bg-slate-900">Permanent Resident (2nd+ Property - 30% ABSD)</option>
              <option value="Foreigner" className="bg-slate-900">Foreigner (60% ABSD on Residential)</option>
              <option value="Entity / Trust" className="bg-slate-900">Entity / Trust (65% ABSD on Residential)</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Property Asset Class
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Condominium" className="bg-slate-900">Private Condominium / Apartment</option>
              <option value="Executive Condominium" className="bg-slate-900">Executive Condominium (EC)</option>
              <option value="Landed" className="bg-slate-900">Landed Property</option>
              <option value="Commercial Shophouse" className="bg-slate-900">Commercial Shophouse (0% ABSD)</option>
              <option value="Strata Office" className="bg-slate-900">Strata Office (0% ABSD)</option>
            </select>
          </div>

          {/* Loan-To-Value & Downpayment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Downpayment ({downpaymentPercent}%)
              </label>
              <select
                value={downpaymentPercent}
                onChange={(e) => setDownpaymentPercent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-semibold text-white cursor-pointer"
              >
                <option value={25} className="bg-slate-900">25% (75% Max LTV - 1st Loan)</option>
                <option value={45} className="bg-slate-900">45% (55% LTV - 2nd Loan)</option>
                <option value={55} className="bg-slate-900">55% (45% LTV - 3rd Loan)</option>
                <option value={100} className="bg-slate-900">100% (All Cash / No Loan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Loan Tenure
              </label>
              <select
                value={loanTenureYears}
                onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-semibold text-white cursor-pointer"
              >
                <option value={30} className="bg-slate-900">30 Years</option>
                <option value={25} className="bg-slate-900">25 Years</option>
                <option value={20} className="bg-slate-900">20 Years</option>
                <option value={15} className="bg-slate-900">15 Years</option>
              </select>
            </div>
          </div>

          {/* Mortgage Rate & Monthly MCST */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRatePercent}
                onChange={(e) => setInterestRatePercent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                MCST Maintenance / Mo
              </label>
              <input
                type="number"
                step="20"
                value={maintenanceFeeMonthly}
                onChange={(e) => setMaintenanceFeeMonthly(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-mono font-bold text-white"
              />
            </div>
          </div>
        </div>

        {/* FINANCIAL OUTPUT DASHBOARD (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Key Return Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Gross Rental Yield</div>
              <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                {economics.grossYield}%
              </div>
              <div className="text-[10px] text-slate-400">Annual Gross / Price</div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-xs text-emerald-300 font-medium">Net Rental Yield</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {economics.netYield}%
              </div>
              <div className="text-[10px] text-emerald-400/80">Post-Tax & Expenses</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Net Monthly Cash Flow</div>
              <div className={`text-xl font-extrabold font-mono mt-0.5 ${economics.monthlyNetCashFlow >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {economics.monthlyNetCashFlow >= 0 ? `+$${economics.monthlyNetCashFlow.toLocaleString()}` : `-$${Math.abs(economics.monthlyNetCashFlow).toLocaleString()}`}
              </div>
              <div className="text-[10px] text-slate-400">After Full Mortgage</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Cash-on-Cash Return</div>
              <div className="text-xl font-extrabold text-teal-400 font-mono mt-0.5">
                {economics.cashOnCashReturn}%
              </div>
              <div className="text-[10px] text-slate-400">Net Cash / Invested Equity</div>
            </div>
          </div>

          {/* Stamp Duty (IRAS BSD & ABSD) Breakdown Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-emerald-400" />
                Singapore Stamp Duty Liability (IRAS Official Schedule)
              </span>
              <span className="font-mono text-emerald-400 text-xs">
                Total Tax: {formatFullSGD(economics.stampDuty.totalStampDuty)} ({economics.stampDuty.effectiveTaxRate}%)
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* BSD Breakdown */}
              <div className="bg-slate-950/40 rounded-xl p-3.5 space-y-1.5 border border-white/10">
                <div className="flex justify-between font-bold text-white pb-1 border-b border-white/10">
                  <span>Buyer's Stamp Duty (BSD)</span>
                  <span className="font-mono">{formatFullSGD(economics.stampDuty.bsd)}</span>
                </div>
                {economics.stampDuty.bsdBreakdown.map((tier, i) => (
                  <div key={i} className="flex justify-between text-slate-400 text-[11px]">
                    <span>{tier.tier} ({tier.rate}%)</span>
                    <span className="font-mono">{formatFullSGD(tier.amount)}</span>
                  </div>
                ))}
              </div>

              {/* ABSD Breakdown */}
              <div className="bg-slate-950/40 rounded-xl p-3.5 space-y-1.5 border border-white/10">
                <div className="flex justify-between font-bold text-white pb-1 border-b border-white/10">
                  <span>Additional BSD (ABSD: {economics.stampDuty.absdRate}%)</span>
                  <span className="font-mono text-rose-400">{formatFullSGD(economics.stampDuty.absd)}</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {economics.stampDuty.absdRate === 0 ? (
                    <span className="text-emerald-400 font-semibold">✓ 0% ABSD Applied (1st Property for SC or Commercial Title)</span>
                  ) : (
                    <span>Applicable rate for {buyerProfile} under latest IRAS regulatory mandate.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Invested Capital & Outlay Requirement */}
          <div className="bg-slate-950/70 border border-white/15 text-white rounded-2xl p-5 space-y-3 backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-bold text-emerald-400 border-b border-white/10 pb-2">
              Initial Cash Capital Requirement (Total Cash Outlay)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Downpayment ({downpaymentPercent}%):</span>
                <span className="font-mono font-bold text-sm text-white">{formatFullSGD(economics.downpaymentRequired)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">BSD + ABSD:</span>
                <span className="font-mono font-bold text-sm text-white">{formatFullSGD(economics.stampDuty.totalStampDuty)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Legal & Reno Buffer:</span>
                <span className="font-mono font-bold text-sm text-white">{formatFullSGD(legalFees + renovationCost)}</span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-2.5 rounded-xl text-center backdrop-blur-md">
                <span className="text-emerald-300 font-semibold block text-[11px]">Total Equity Needed:</span>
                <span className="font-mono font-black text-base text-emerald-400">
                  {formatFullSGD(economics.downpaymentRequired + economics.stampDuty.totalStampDuty + legalFees + renovationCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Cash Flow Amortization Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">
              Monthly Cash Flow Waterfall (Mortgage Principal vs Interest vs Net Cash)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold text-white">
                <span>Monthly Gross Rent</span>
                <span className="font-mono text-emerald-400">+{formatFullSGD(monthlyRent)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>- Monthly Mortgage Payment ({interestRatePercent}% over {loanTenureYears} yrs)</span>
                <span className="font-mono text-rose-400">-{formatFullSGD(economics.monthlyMortgage)}</span>
              </div>
              <div className="pl-4 text-[11px] text-slate-400 flex justify-between">
                <span>└ Principal paydown (Equity creation)</span>
                <span className="font-mono">+{formatFullSGD(economics.monthlyPrincipal)}</span>
              </div>
              <div className="pl-4 text-[11px] text-slate-400 flex justify-between">
                <span>└ Interest expense</span>
                <span className="font-mono">-${economics.monthlyInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>- Monthly Operating Expenses (Tax, MCST, Maint & Vacancy)</span>
                <span className="font-mono text-rose-400">
                  -{formatFullSGD((economics.annualGrossRent - economics.annualNetRent) / 12)}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-white/10">
                <span className="text-white">Net Monthly Pocket Cash Flow</span>
                <span className={`font-mono ${economics.monthlyNetCashFlow >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {economics.monthlyNetCashFlow >= 0 ? `+${formatFullSGD(economics.monthlyNetCashFlow)}` : `-${formatFullSGD(Math.abs(economics.monthlyNetCashFlow))}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
