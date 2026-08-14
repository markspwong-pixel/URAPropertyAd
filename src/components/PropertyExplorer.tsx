import React, { useState, useMemo } from 'react';
import { PropertyListing, SingaporeRegion, InvestorObjective, BuyerProfileType } from '../types/property';
import { SINGAPORE_PROPERTIES, SINGAPORE_DISTRICTS_DATA } from '../data/singaporeProperties';
import { calculateInvestmentScore, formatSGD, formatFullSGD } from '../utils/calculators';
import { VerdictBadge } from './VerdictBadge';
import { ScoreGauge } from './ScoreGauge';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Train, 
  GraduationCap, 
  Percent, 
  Sparkles, 
  ArrowUpRight, 
  FileText, 
  Building, 
  ShieldCheck,
  Scale
} from 'lucide-react';

interface PropertyExplorerProps {
  onSelectProperty: (property: PropertyListing) => void;
  onGenerateMemo: (property: PropertyListing) => void;
  investorObjective: InvestorObjective;
  buyerProfile: BuyerProfileType;
}

export const PropertyExplorer: React.FC<PropertyExplorerProps> = ({
  onSelectProperty,
  onGenerateMemo,
  investorObjective,
  buyerProfile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedTenure, setSelectedTenure] = useState<string>('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(15000000);
  const [minYield, setMinYield] = useState<number>(0);
  const [selectedForComparison, setSelectedForComparison] = useState<PropertyListing[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [showDistrictMetrics, setShowDistrictMetrics] = useState<boolean>(false);

  const filteredProperties = useMemo(() => {
    return SINGAPORE_PROPERTIES.filter((prop) => {
      // Search text filter
      const matchesSearch = 
        prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.districtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.mrtStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `D${prop.district}`.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Region filter
      if (selectedRegion !== 'ALL' && prop.region !== selectedRegion) {
        return false;
      }

      // Tenure filter
      if (selectedTenure === 'FREEHOLD' && prop.tenure === '99-year Leasehold') {
        return false;
      }
      if (selectedTenure === 'LEASEHOLD' && prop.tenure !== '99-year Leasehold') {
        return false;
      }

      // Price filter
      if (prop.askingPrice > maxPrice) {
        return false;
      }

      // Min Yield filter
      if (prop.grossRentalYield < minYield) {
        return false;
      }

      // Strategy filter
      if (selectedStrategy === 'HIGH_YIELD' && prop.grossRentalYield < 3.5) return false;
      if (selectedStrategy === 'COMMERCIAL' && !['Commercial Shophouse', 'Strata Office', 'Retail'].includes(prop.propertyType)) return false;
      if (selectedStrategy === 'VALUE' && prop.askingPrice >= (prop.estimatedFairValueMin + prop.estimatedFairValueMax) / 2) return false;
      if (selectedStrategy === 'GROWTH' && prop.region === 'CCR' && prop.remainingLeaseYears < 90) return false;

      return true;
    });
  }, [searchTerm, selectedRegion, selectedTenure, selectedStrategy, maxPrice, minYield]);

  const toggleCompare = (prop: PropertyListing, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedForComparison.some(p => p.id === prop.id)) {
      setSelectedForComparison(selectedForComparison.filter(p => p.id !== prop.id));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('You can compare up to 3 properties simultaneously.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, prop]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Mission Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                DECISION ENGINE ACTIVE
              </span>
              <span className="text-xs text-slate-400">
                Grounded in URA Transaction Datasets & IRAS Regulatory Framework
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Singapore Property Investment Explorer
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Evaluate real Singapore residential and commercial properties against verified Tier 1/2/3 transaction comparables, fair value estimates, gross/net rental yields, and institutional investment scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDistrictMetrics(!showDistrictMetrics)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 rounded-xl text-xs font-semibold text-slate-200 backdrop-blur-md transition-all shadow-xs"
            >
              <Building className="w-4 h-4 text-emerald-400" />
              <span>{showDistrictMetrics ? 'Hide Benchmarks' : 'District Benchmarks (CCR/RCR/OCR)'}</span>
            </button>
            {selectedForComparison.length > 0 && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected ({selectedForComparison.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* District Benchmarks Dropdown Panel */}
      {showDistrictMetrics && (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 text-white shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Singapore District Macro Intelligence Matrix (D01 – D28)
              </h3>
              <p className="text-xs text-slate-400">Official URA District-Level PSF Benchmarks, Average Gross Rental Yields & 12-Month Price Velocity</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Source: URA & SingStat</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
            {SINGAPORE_DISTRICTS_DATA.map((dist) => (
              <div key={dist.district} className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 text-xs space-y-1.5 hover:border-emerald-500/40 backdrop-blur-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">D{dist.district < 10 ? `0${dist.district}` : dist.district}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    dist.region === 'CCR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    dist.region === 'RCR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {dist.region}
                  </span>
                </div>
                <div className="text-slate-200 font-semibold truncate" title={dist.name}>{dist.name}</div>
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-slate-400">
                  <span>Avg PSF: <strong className="text-slate-200 font-mono">${dist.avgPsf}</strong></span>
                  <span>Yield: <strong className="text-emerald-300 font-mono">{dist.rentalYield}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Singapore properties by name, district (e.g. D15, D06), MRT, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/15 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all backdrop-blur-md"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Region */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
            {['ALL', 'CCR', 'RCR', 'OCR'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  selectedRegion === reg
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {reg === 'ALL' ? 'All Regions' : reg}
              </button>
            ))}
          </div>

          {/* Strategy */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
            {[
              { id: 'ALL', label: 'All Strategies' },
              { id: 'HIGH_YIELD', label: 'High Yield (≥3.5%)' },
              { id: 'VALUE', label: 'Value (< Fair Value)' },
              { id: 'COMMERCIAL', label: 'Commercial (0% ABSD)' }
            ].map((strat) => (
              <button
                key={strat.id}
                onClick={() => setSelectedStrategy(strat.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  selectedStrategy === strat.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {strat.label}
              </button>
            ))}
          </div>

          {/* Tenure */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
            {[
              { id: 'ALL', label: 'All Tenures' },
              { id: 'FREEHOLD', label: 'Freehold / 999-yr' },
              { id: 'LEASEHOLD', label: '99-year Leasehold' }
            ].map((ten) => (
              <button
                key={ten.id}
                onClick={() => setSelectedTenure(ten.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  selectedTenure === ten.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {ten.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="ml-auto text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-200">{filteredProperties.length}</span> curated opportunities
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProperties.map((property) => {
          const scoreBreakdown = calculateInvestmentScore(property, investorObjective);
          const fairValueMid = (property.estimatedFairValueMin + property.estimatedFairValueMax) / 2;
          const discountPercent = ((fairValueMid - property.askingPrice) / fairValueMid) * 100;
          const isComparing = selectedForComparison.some(p => p.id === property.id);

          return (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="group bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Card Top: Region Badge, District, Name, Verdict */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                        property.region === 'CCR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        property.region === 'RCR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {property.region} • District {property.district < 10 ? `0${property.district}` : property.district}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {property.tenure === 'Freehold' ? 'Freehold' : `${property.remainingLeaseYears} yrs lease left`}
                      </span>
                      <span className="text-xs text-slate-500">• TOP {property.topYear}</span>
                    </div>

                    <h2 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                      {property.name}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{property.address} ({property.districtName})</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <VerdictBadge verdict={property.defaultVerdict} targetPrice={property.targetBuyPrice} size="md" />
                    <button
                      onClick={(e) => toggleCompare(property, e)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all ${
                        isComparing 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {isComparing ? '✓ Comparing' : '+ Compare'}
                    </button>
                  </div>
                </div>

                {/* Financial Key Numbers Grid */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400">Asking Price</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">
                      {formatSGD(property.askingPrice)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">${property.askingPsf} PSF</div>
                  </div>

                  <div className="border-x border-white/10">
                    <div className="text-[11px] font-medium text-slate-400">Est. Fair Value</div>
                    <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                      {formatSGD(property.estimatedFairValueMin)} - {formatSGD(property.estimatedFairValueMax)}
                    </div>
                    <div className={`text-[10px] font-bold mt-0.5 ${discountPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {discountPercent >= 0 ? `${discountPercent.toFixed(1)}% Discount` : `${Math.abs(discountPercent).toFixed(1)}% Premium`}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-400">Gross / Net Yield</div>
                    <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                      {property.grossRentalYield}% <span className="text-xs text-slate-400 font-normal">/ {property.estimatedNetYield}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Est. ${property.estimatedRentMonthly.toLocaleString()}/mo</div>
                  </div>
                </div>

                {/* Key Location Attributes & Highlights */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Train className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium truncate">{property.mrtStation} ({property.mrtDistanceMeters}m)</span>
                  </div>
                  {property.primarySchoolsNearby.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{property.primarySchoolsNearby.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Score and Highlights snippet */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold text-slate-400">100-pt Score:</div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-xs rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      {scoreBreakdown.totalScore} / 100
                    </span>
                    <span className="text-[11px] text-slate-500">({investorObjective.split(' ')[0]})</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {property.bedroomCount > 0 ? `${property.bedroomCount} BR • ${property.unitSizeSqft} sqft` : `${property.unitSizeSqft} sqft`}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateMemo(property);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generate AI Memo</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>View Comps & Analysis</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-5xl w-full p-6 space-y-6 shadow-2xl border border-white/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  Head-to-Head Property Investment Comparison
                </h2>
                <p className="text-xs text-slate-400">Side-by-side transaction, valuation, yield, and risk matrix</p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.05] border-b border-white/10">
                    <th className="p-3 font-bold text-slate-400">Metric</th>
                    {selectedForComparison.map((p) => (
                      <th key={p.id} className="p-3 font-extrabold text-white text-sm">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Recommendation Verdict</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3">
                        <VerdictBadge verdict={p.defaultVerdict} targetPrice={p.targetBuyPrice} size="sm" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">100-pt Investment Score</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 font-mono font-bold text-emerald-400">
                        {calculateInvestmentScore(p, investorObjective).totalScore} / 100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Asking Price & PSF</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 font-mono">
                        <strong className="text-white">{formatFullSGD(p.askingPrice)}</strong>
                        <div className="text-[11px] text-slate-400">${p.askingPsf} PSF</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Estimated Fair Value Range</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 font-mono text-slate-200 font-medium">
                        {formatSGD(p.estimatedFairValueMin)} – {formatSGD(p.estimatedFairValueMax)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Gross & Net Yield</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 font-mono">
                        <strong className="text-emerald-400">{p.grossRentalYield}% Gross</strong>
                        <div className="text-[11px] text-slate-400">{p.estimatedNetYield}% Net</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Monthly Rent (Est.)</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 font-mono text-slate-200">
                        ${p.estimatedRentMonthly.toLocaleString()}/mo
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Region & District</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 text-slate-300">
                        {p.region} • District {p.district} ({p.districtName})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Tenure & Remaining Lease</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 text-slate-300">
                        {p.tenure} {p.tenure !== 'Freehold' && `(${p.remainingLeaseYears} yrs)`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">MRT Connectivity</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 text-slate-300">
                        {p.mrtStation} ({p.mrtDistanceMeters}m)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Liquidity Rating</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 font-semibold text-slate-200">
                        {p.liquidityRating}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedForComparison([])}
                className="px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
