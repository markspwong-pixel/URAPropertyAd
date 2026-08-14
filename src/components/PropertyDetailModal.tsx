import React, { useState } from 'react';
import { PropertyListing, InvestorObjective, BuyerProfileType } from '../types/property';
import { 
  calculateInvestmentScore, 
  generateScenarioAnalysis, 
  calculateBuyToRentEconomics,
  formatSGD, 
  formatFullSGD 
} from '../utils/calculators';
import { VerdictBadge } from './VerdictBadge';
import { ScoreGauge } from './ScoreGauge';
import { 
  X, 
  Building2, 
  TrendingUp, 
  Calculator, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  Train, 
  GraduationCap, 
  MapPin, 
  Layers, 
  ArrowRight,
  Info,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface PropertyDetailModalProps {
  property: PropertyListing | null;
  onClose: () => void;
  onGenerateMemo: (property: PropertyListing) => void;
  onOpenCalculator: (property: PropertyListing) => void;
  investorObjective: InvestorObjective;
  buyerProfile: BuyerProfileType;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onGenerateMemo,
  onOpenCalculator,
  investorObjective,
  buyerProfile
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'comps' | 'rental' | 'trends' | 'scenarios' | 'risks'>('overview');

  if (!property) return null;

  const scoreBreakdown = calculateInvestmentScore(property, investorObjective);
  const scenarioAnalysis = generateScenarioAnalysis(property);
  const economics = calculateBuyToRentEconomics({
    purchasePrice: property.askingPrice,
    monthlyRent: property.estimatedRentMonthly,
    buyerProfile,
    propertyType: property.propertyType,
    downpaymentPercent: 25,
    loanTenureYears: 30,
    interestRatePercent: 3.5,
    maintenanceFeeMonthly: property.maintenanceFeeMonthly
  });

  const fairValueMid = (property.estimatedFairValueMin + property.estimatedFairValueMax) / 2;
  const discountPercent = ((fairValueMid - property.askingPrice) / fairValueMid) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-5xl w-full shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950/70 text-white px-6 py-5 flex items-start justify-between gap-4 border-b border-white/10 shrink-0 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                property.region === 'CCR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                property.region === 'RCR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {property.region} • District {property.district < 10 ? `0${property.district}` : property.district} ({property.districtName})
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {property.propertyType} • TOP {property.topYear} • {property.tenure}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              {property.name}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{property.address}</span>
              <span className="text-slate-600">•</span>
              <span>Developer: {property.developer}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <VerdictBadge verdict={property.defaultVerdict} targetPrice={property.targetBuyPrice} size="lg" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex space-x-1 bg-white/5 p-2 border-b border-white/10 overflow-x-auto text-xs font-semibold shrink-0">
          {[
            { id: 'overview', label: '1. Overview & Fair Value' },
            { id: 'comps', label: '2. Comparable Matrix (Tier 1 & 2)' },
            { id: 'rental', label: '3. Rental & Yield Economics' },
            { id: 'trends', label: '4. Price & Volume Trends' },
            { id: 'scenarios', label: '5. Scenario Modeling (Base/Bull/Bear)' },
            { id: 'risks', label: '6. Catalysts, Risks & Data Gaps' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 flex-1">
          {/* TAB 1: OVERVIEW & FAIR VALUE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Quick Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Asking Price</div>
                  <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                    {formatFullSGD(property.askingPrice)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">${property.askingPsf} PSF</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Estimated Fair Value</div>
                  <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">
                    {formatSGD(property.estimatedFairValueMin)} - {formatSGD(property.estimatedFairValueMax)}
                  </div>
                  <div className={`text-[11px] font-bold ${discountPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {discountPercent >= 0 ? `${discountPercent.toFixed(1)}% Discount to Fair Value` : `${Math.abs(discountPercent).toFixed(1)}% Premium`}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Gross / Net Yield</div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                    {property.grossRentalYield}% <span className="text-xs text-slate-400 font-normal">/ {property.estimatedNetYield}%</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Est. ${property.estimatedRentMonthly.toLocaleString()}/mo</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">100-pt Score ({investorObjective.split(' ')[0]})</div>
                  <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                    {scoreBreakdown.totalScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Liquidity: {property.liquidityRating}</div>
                </div>
              </div>

              {/* Decision Box: Why Buy / Hold / Sell */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>Investment Verdict: {property.defaultVerdict}</span>
                    {property.targetBuyPrice && (
                      <span className="text-xs font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-300">
                        Target Entry: {formatFullSGD(property.targetBuyPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">
                    Profile: {buyerProfile.split('(')[0]}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-emerald-300">Fair Value & Valuation Discipline:</strong> Analyzed against {property.tier1Comparables.length} Tier 1 and {property.tier2Comparables.length} Tier 2 transaction comparables. The mid-point fair value sits at {formatSGD(fairValueMid)}. At {formatFullSGD(property.askingPrice)} (${property.askingPsf} PSF), the property offers a {discountPercent.toFixed(1)}% margin relative to recent physical sub-sale and resale benchmarks.
                  </p>
                </div>
              </div>

              {/* Grid: Unit Specifics & 100-Point Scorecard breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unit & Development Specifics */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3.5 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Unit & Micro-Location Specifications
                  </h3>

                  <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400">Unit Type / Size:</span>
                      <div className="font-semibold text-slate-200">{property.bedroomCount > 0 ? `${property.bedroomCount} Bedroom (${property.unitSizeSqft} sqft)` : `${property.unitSizeSqft} sqft`}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Floor Level:</span>
                      <div className="font-semibold text-slate-200">{property.floorLevel}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Facing / Orientation:</span>
                      <div className="font-semibold text-slate-200">{property.facing}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Tenure & Remaining:</span>
                      <div className="font-semibold text-slate-200">
                        {property.tenure === 'Freehold' ? 'Freehold' : `${property.remainingLeaseYears} Years (${property.tenure})`}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">MRT Connectivity:</span>
                      <div className="font-semibold text-slate-200">{property.mrtStation} ({property.mrtDistanceMeters}m)</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Estimated MCST Fee:</span>
                      <div className="font-semibold text-slate-200">${property.maintenanceFeeMonthly}/month</div>
                    </div>
                  </div>

                  {property.primarySchoolsNearby.length > 0 && (
                    <div className="pt-2 border-t border-white/10 text-xs">
                      <span className="text-slate-400 block mb-1 font-medium">Primary Schools Nearby (1-2km):</span>
                      <div className="space-y-1">
                        {property.primarySchoolsNearby.map((sch, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-300">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{sch}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 100-Point Scorecard breakdown */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Institutional 100-Point Scorecard
                  </h3>
                  <ScoreGauge score={scoreBreakdown.totalScore} breakdown={scoreBreakdown} showBreakdown={true} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPARABLE MATRIX */}
          {activeTab === 'comps' && (
            <div className="space-y-6">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed backdrop-blur-md">
                <strong className="text-white">Comparable Hierarchy Rules:</strong> Prioritizes <strong className="text-emerald-400">Tier 1</strong> (Same development, unit type, similar size/floor, recent contract) followed by <strong className="text-blue-400">Tier 2</strong> (Nearby developments with similar tenure, age, and positioning).
              </div>

              {/* Tier 1 Comparables Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono text-xs">TIER 1</span>
                  Same Development Transactions ({property.name})
                </h3>

                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-white/[0.02]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
                      <tr>
                        <th className="p-3">Contract Date</th>
                        <th className="p-3">Unit / Floor</th>
                        <th className="p-3">Area (sqft)</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">PSF</th>
                        <th className="p-3">Sale Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {property.tier1Comparables.map((comp) => (
                        <tr key={comp.id} className="hover:bg-white/5">
                          <td className="p-3 font-mono text-slate-300">{comp.contractDate}</td>
                          <td className="p-3 text-slate-200">{comp.unitType} (Flr {comp.floorRange})</td>
                          <td className="p-3 font-mono text-slate-300">{comp.areaSqft} sqft ({comp.areaSqm} sqm)</td>
                          <td className="p-3 font-mono font-bold text-white">{formatFullSGD(comp.price)}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">${comp.psf}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-white/10 text-slate-300 rounded text-[11px] font-medium border border-white/10">
                              {comp.typeOfSale}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tier 2 Comparables Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-mono text-xs">TIER 2</span>
                  Nearby Competing Developments (Similar Tenure & Positioning)
                </h3>

                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-white/[0.02]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
                      <tr>
                        <th className="p-3">Development</th>
                        <th className="p-3">Contract Date</th>
                        <th className="p-3">Unit / Floor</th>
                        <th className="p-3">Area (sqft)</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">PSF</th>
                        <th className="p-3">Tenure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {property.tier2Comparables.map((comp) => (
                        <tr key={comp.id} className="hover:bg-white/5">
                          <td className="p-3 font-semibold text-white">{comp.developmentName}</td>
                          <td className="p-3 font-mono text-slate-300">{comp.contractDate}</td>
                          <td className="p-3 text-slate-200">{comp.unitType} (Flr {comp.floorRange})</td>
                          <td className="p-3 font-mono text-slate-300">{comp.areaSqft} sqft</td>
                          <td className="p-3 font-mono font-bold text-white">{formatFullSGD(comp.price)}</td>
                          <td className="p-3 font-mono font-bold text-blue-400">${comp.psf}</td>
                          <td className="p-3 text-slate-400">{comp.tenure}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RENTAL & YIELD ECONOMICS */}
          {activeTab === 'rental' && (
            <div className="space-y-6">
              {/* Yield & Cash Flow Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                  <div className="text-xs text-slate-400 font-medium">Gross Rental Yield</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                    {economics.grossYield}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">${(economics.annualGrossRent / 12).toLocaleString()}/month</div>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                  <div className="text-xs text-slate-400 font-medium">Estimated Net Rental Yield</div>
                  <div className="text-2xl font-extrabold text-teal-400 font-mono mt-1">
                    {economics.netYield}%
                  </div>
                  <div className="text-[11px] text-slate-400">Post-Property Tax, MCST, Maint & Vacancy</div>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                  <div className="text-xs text-slate-400 font-medium">Est. Monthly Net Cash Flow</div>
                  <div className={`text-2xl font-extrabold font-mono mt-1 ${economics.monthlyNetCashFlow >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {economics.monthlyNetCashFlow >= 0 ? `+$${economics.monthlyNetCashFlow.toLocaleString()}` : `-$${Math.abs(economics.monthlyNetCashFlow).toLocaleString()}`}
                  </div>
                  <div className="text-[11px] text-slate-400">After 75% LTV Mortgage Payment</div>
                </div>
              </div>

              {/* Annual Income & Expense Deductions Breakdown */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">
                  Annual Rental Economics & Expense Waterfall (IRAS Non-Owner Schedule)
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white pb-1 border-b border-white/10">
                    <span>Gross Annual Rental Income</span>
                    <span className="font-mono">+{formatFullSGD(economics.annualGrossRent)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• IRAS Non-Owner Occupier Property Tax (Progressive)</span>
                    <span className="font-mono text-rose-400">-{formatFullSGD(economics.annualPropertyTax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• MCST Maintenance Fees (${property.maintenanceFeeMonthly}/mo)</span>
                    <span className="font-mono text-rose-400">-{formatFullSGD(economics.annualMaintenance)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Fire & Landlord Building Insurance</span>
                    <span className="font-mono text-rose-400">-{formatFullSGD(economics.annualInsurance)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Agent Leasing Fee (0.5 mo amortized)</span>
                    <span className="font-mono text-rose-400">-{formatFullSGD(economics.annualAgentLeasingFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Vacancy & Repair Allowance (~3 weeks)</span>
                    <span className="font-mono text-rose-400">-{formatFullSGD(economics.annualRepairsAndBuffer)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-emerald-400 pt-2 border-t border-white/10">
                    <span>Net Annual Rental Income</span>
                    <span className="font-mono font-bold">={formatFullSGD(economics.annualNetRent)}</span>
                  </div>
                </div>
              </div>

              {/* Recent Rental Transactions Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">
                  Recent Transacted Rental Comparables
                </h3>
                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-white/[0.02]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
                      <tr>
                        <th className="p-3">Development</th>
                        <th className="p-3">Lease Date</th>
                        <th className="p-3">Unit Area Range</th>
                        <th className="p-3">Monthly Rent</th>
                        <th className="p-3">Rent PSF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {property.recentRentalTransactions.map((rent) => (
                        <tr key={rent.id} className="hover:bg-white/5">
                          <td className="p-3 font-semibold text-white">{rent.developmentName}</td>
                          <td className="p-3 font-mono text-slate-300">{rent.leaseDate}</td>
                          <td className="p-3 font-mono text-slate-300">{rent.areaSqftRange} sqft ({rent.bedroomCount}BR)</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">${rent.monthlyRent.toLocaleString()}/mo</td>
                          <td className="p-3 font-mono text-slate-200 font-semibold">${rent.rentPsf}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORICAL PSF & VOLUME TRENDS */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Historical PSF & Transaction Volume (Quarterly)
                    </h3>
                    <p className="text-xs text-slate-400">URA Caveat Transactions Analysis</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    Current Asking: ${property.askingPsf} PSF
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={property.historicalPsfTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', color: '#f8fafc' }}
                        formatter={(value: any, name: any) => [name === 'psf' ? `$${value} PSF` : `${value} units`, name === 'psf' ? 'Average PSF' : 'Volume']} 
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                      <Bar yAxisId="right" dataKey="volume" fill="#475569" name="Transaction Volume" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="left" type="monotone" dataKey="psf" stroke="#10b981" strokeWidth={3} name="Average PSF" dot={{ r: 4, fill: '#10b981' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed backdrop-blur-md">
                <strong className="text-white">Institutional Stress Testing:</strong> Evaluates holding returns over a 5-year investment horizon across Base, Bull, and Bear macroeconomic conditions.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Base Case */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">Base Case</span>
                    <VerdictBadge verdict={scenarioAnalysis.baseCase.verdict} size="sm" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Annual Price Growth:</span>
                      <span className="font-mono font-semibold">+{scenarioAnalysis.baseCase.priceGrowthPercent}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Rental Growth:</span>
                      <span className="font-mono font-semibold">+{scenarioAnalysis.baseCase.rentalGrowthPercent}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Interest Rate:</span>
                      <span className="font-mono font-semibold">{scenarioAnalysis.baseCase.interestRatePercent}%</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                      <span>5-Year Total Return:</span>
                      <span className="font-mono">+{scenarioAnalysis.baseCase.fiveYearReturnPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Bull Case */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-300">Bull Case</span>
                    <VerdictBadge verdict={scenarioAnalysis.bullCase.verdict} size="sm" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-emerald-200">
                      <span>Annual Price Growth:</span>
                      <span className="font-mono font-semibold">+{scenarioAnalysis.bullCase.priceGrowthPercent}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-emerald-200">
                      <span>Rental Growth:</span>
                      <span className="font-mono font-semibold">+{scenarioAnalysis.bullCase.rentalGrowthPercent}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-emerald-200">
                      <span>Interest Rate:</span>
                      <span className="font-mono font-semibold">{scenarioAnalysis.bullCase.interestRatePercent}%</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/30 flex justify-between font-bold text-emerald-300">
                      <span>5-Year Total Return:</span>
                      <span className="font-mono">+{scenarioAnalysis.bullCase.fiveYearReturnPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Bear Case */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-rose-300">Bear Case</span>
                    <VerdictBadge verdict={scenarioAnalysis.bearCase.verdict} size="sm" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-rose-200">
                      <span>Annual Price Growth:</span>
                      <span className="font-mono font-semibold">{scenarioAnalysis.bearCase.priceGrowthPercent}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-rose-200">
                      <span>Rental Growth:</span>
                      <span className="font-mono font-semibold">{scenarioAnalysis.bearCase.rentalGrowthPercent}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-rose-200">
                      <span>Interest Rate:</span>
                      <span className="font-mono font-semibold">{scenarioAnalysis.bearCase.interestRatePercent}%</span>
                    </div>
                    <div className="pt-2 border-t border-rose-500/30 flex justify-between font-bold text-rose-300">
                      <span>5-Year Total Return:</span>
                      <span className="font-mono">+{scenarioAnalysis.bearCase.fiveYearReturnPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CATALYSTS, RISKS & DATA GAPS */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Structural Catalysts */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Structural Growth Catalysts
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {property.catalysts.map((cat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Downside Risks */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2 border-b border-rose-500/30 pb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Identified Investment & Regulatory Risks
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {property.keyRisks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Data Gaps (Strict Data Discipline) */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-2 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  Identified Data Gaps & Pending Verification
                </h3>
                <p className="text-xs text-slate-400">
                  In adherence to institutional data discipline, these items represent unverified variables requiring physical inspection or legal/conveyancing confirmation:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                  {property.dataGaps.map((gap, i) => (
                    <li key={i} className="flex items-center gap-2 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="text-amber-400 font-bold">[DATA GAP]:</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="bg-slate-950/70 border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 backdrop-blur-xl">
          <div className="text-xs text-slate-400">
            Selected Profile: <strong className="text-white">{buyerProfile.split('(')[0]}</strong> • Target Objective: <strong className="text-white">{investorObjective.split('(')[0]}</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenCalculator(property);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-xs font-bold transition-all shadow-xs backdrop-blur-md"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Buy-to-Rent Calc</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onGenerateMemo(property);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <FileText className="w-4 h-4" />
              <span>Generate AI Investment Memo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
