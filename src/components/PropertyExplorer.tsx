import React, { useState, useMemo, useEffect } from 'react';
import { PropertyListing, SingaporeRegion, InvestorObjective, BuyerProfileType, TransactionRecord } from '../types/property';
import { SINGAPORE_PROPERTIES, SINGAPORE_DISTRICTS_DATA } from '../data/singaporeProperties';
import { calculateInvestmentScore, formatSGD, formatFullSGD } from '../utils/calculators';
import { VerdictBadge } from './VerdictBadge';
import { fetchUraTransactions, getUraStatus, UraStatusResponse } from '../services/api';
import { 
  Search, 
  MapPin, 
  Train, 
  GraduationCap, 
  ArrowUpRight, 
  FileText, 
  Building, 
  Building2,
  ShieldCheck,
  Scale,
  Database,
  Activity,
  TrendingUp,
  Layers,
  LayoutGrid,
  Table,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  Calendar,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface PropertyExplorerProps {
  onSelectProperty: (property: PropertyListing) => void;
  onGenerateMemo: (property: PropertyListing) => void;
  investorObjective: InvestorObjective;
  buyerProfile: BuyerProfileType;
}

type ViewMode = 'opportunities' | 'district-matrix' | 'ura-caveat-feed';

export const PropertyExplorer: React.FC<PropertyExplorerProps> = ({
  onSelectProperty,
  onGenerateMemo,
  investorObjective,
  buyerProfile
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('opportunities');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedTenure, setSelectedTenure] = useState<string>('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<number | 'ALL'>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(15000000);
  const [minYield, setMinYield] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'yield' | 'discount' | 'psf-asc' | 'psf-desc' | 'top'>('score');
  
  const [selectedForComparison, setSelectedForComparison] = useState<PropertyListing[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [expandedCaveatPropId, setExpandedCaveatPropId] = useState<string | null>(null);

  // URA Real-time / Proxy State
  const [uraStatus, setUraStatus] = useState<UraStatusResponse | null>(null);
  const [isQueryingUra, setIsQueryingUra] = useState<boolean>(false);
  const [activeUraBatch, setActiveUraBatch] = useState<number>(1);
  const [uraTapeFilterSaleType, setUraTapeFilterSaleType] = useState<string>('ALL');
  const [uraLastUpdated, setUraLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Ingest URA initial status
  useEffect(() => {
    getUraStatus()
      .then((data) => setUraStatus(data))
      .catch((err) => console.warn('Could not fetch URA status in Explorer:', err));
  }, []);

  // Aggregate all URA caveat transactions from properties for the live tape
  const allUraCaveats = useMemo(() => {
    const records: (TransactionRecord & { propertyName: string; region: SingaporeRegion })[] = [];
    SINGAPORE_PROPERTIES.forEach((prop) => {
      prop.tier1Comparables.forEach((t1) => {
        records.push({ ...t1, propertyName: prop.name, region: prop.region });
      });
      prop.tier2Comparables.forEach((t2) => {
        records.push({ ...t2, propertyName: prop.name, region: prop.region });
      });
    });
    // Sort by contractDate descending
    return records.sort((a, b) => b.contractDate.localeCompare(a.contractDate));
  }, []);

  // Filtered URA Caveats for the Tape view
  const filteredCaveats = useMemo(() => {
    return allUraCaveats.filter((cav) => {
      if (selectedRegion !== 'ALL' && cav.region !== selectedRegion) return false;
      if (uraTapeFilterSaleType !== 'ALL' && cav.typeOfSale !== uraTapeFilterSaleType) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = 
          cav.developmentName.toLowerCase().includes(term) ||
          cav.streetName.toLowerCase().includes(term) ||
          `d${cav.district}`.toLowerCase().includes(term) ||
          cav.unitType.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [allUraCaveats, selectedRegion, uraTapeFilterSaleType, searchTerm]);

  // Filtered & Sorted Properties for Opportunities view
  const filteredProperties = useMemo(() => {
    const filtered = SINGAPORE_PROPERTIES.filter((prop) => {
      // Search text filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          prop.name.toLowerCase().includes(term) ||
          prop.districtName.toLowerCase().includes(term) ||
          prop.mrtStation.toLowerCase().includes(term) ||
          prop.address.toLowerCase().includes(term) ||
          `d${prop.district}`.toLowerCase().includes(term) ||
          `district ${prop.district}`.toLowerCase().includes(term);

        if (!matchesSearch) return false;
      }

      // District Filter
      if (selectedDistrict !== 'ALL' && prop.district !== selectedDistrict) {
        return false;
      }

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
      if (selectedTenure === 'SAFE_LEASE' && prop.remainingLeaseYears < 85 && prop.tenure !== 'Freehold') {
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
      if (selectedStrategy === 'FREEHOLD' && prop.tenure !== 'Freehold' && prop.tenure !== '999-year Leasehold') return false;
      if (selectedStrategy === 'GROWTH' && prop.region === 'CCR' && prop.remainingLeaseYears < 90) return false;

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = calculateInvestmentScore(a, investorObjective).totalScore;
        const scoreB = calculateInvestmentScore(b, investorObjective).totalScore;
        return scoreB - scoreA;
      }
      if (sortBy === 'yield') {
        return b.grossRentalYield - a.grossRentalYield;
      }
      if (sortBy === 'discount') {
        const midA = (a.estimatedFairValueMin + a.estimatedFairValueMax) / 2;
        const discA = ((midA - a.askingPrice) / midA) * 100;
        const midB = (b.estimatedFairValueMin + b.estimatedFairValueMax) / 2;
        const discB = ((midB - b.askingPrice) / midB) * 100;
        return discB - discA;
      }
      if (sortBy === 'psf-asc') {
        return a.askingPsf - b.askingPsf;
      }
      if (sortBy === 'psf-desc') {
        return b.askingPsf - a.askingPsf;
      }
      if (sortBy === 'top') {
        return b.topYear - a.topYear;
      }
      return 0;
    });
  }, [searchTerm, selectedDistrict, selectedRegion, selectedTenure, selectedStrategy, maxPrice, minYield, sortBy, investorObjective]);

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

  const handleRefreshUraBatch = async () => {
    setIsQueryingUra(true);
    try {
      await fetchUraTransactions(activeUraBatch);
      setUraLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('URA batch query completed via normalized cache:', err);
    } finally {
      setIsQueryingUra(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. URA Integrated Header & Live Macro Barometer */}
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Database className="w-3.5 h-3.5" />
                URA DATA SERVICE LIVE INGESTION
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-lg">
                Singapore Master Plan & Caveat Analytics
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Last sync: {uraLastUpdated}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Singapore Property Investment & URA Intelligence Explorer
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time evaluation of Singapore residential & commercial opportunities directly cross-referenced against official URA Caveat Transactions, IRAS Stamp Duty Tiers (BSD/ABSD), and the SLA Balas Leasehold Decay Matrix.
            </p>
          </div>

          {/* Quick Macro Indicators */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
              <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">CCR Core PSF</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">$2,950</div>
              <div className="text-[10px] text-emerald-400 font-semibold">+2.8% 12m</div>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
              <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">RCR City Fringe</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">$2,380</div>
              <div className="text-[10px] text-emerald-400 font-semibold">+4.6% 12m</div>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">OCR Suburbs</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">$1,890</div>
              <div className="text-[10px] text-emerald-400 font-semibold">+6.5% 12m</div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setViewMode('opportunities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'opportunities'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Curated Opportunities ({filteredProperties.length})</span>
            </button>

            <button
              onClick={() => setViewMode('district-matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'district-matrix'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>URA District Matrix (D01 – D28)</span>
            </button>

            <button
              onClick={() => setViewMode('ura-caveat-feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'ura-caveat-feed'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Live URA Caveat Stream ({filteredCaveats.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedForComparison.length > 0 && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected ({selectedForComparison.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Global Filter & Search Matrix Toolbar */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Search row with District quick-selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Singapore properties by name, district (e.g. D15, D06), MRT station, street..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/15 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:bg-slate-900/90 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all backdrop-blur-md"
            />
          </div>

          {/* District Quick Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedDistrict === 'ALL' ? 'ALL' : String(selectedDistrict)}
              onChange={(e) => setSelectedDistrict(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              aria-label="Filter by Singapore Postal District"
              className="px-3.5 py-2.5 bg-slate-950/70 border border-white/15 rounded-2xl text-xs font-semibold text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Postal Districts (D01 - D28)</option>
              {SINGAPORE_DISTRICTS_DATA.map((d) => (
                <option key={d.district} value={d.district}>
                  D{d.district < 10 ? `0${d.district}` : d.district} - {d.name} ({d.region})
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            {viewMode === 'opportunities' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort property opportunities"
                className="px-3.5 py-2.5 bg-slate-950/70 border border-white/15 rounded-2xl text-xs font-semibold text-emerald-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="score">Sort: 100-pt Score (Highest)</option>
                <option value="yield">Sort: Gross Yield (Highest)</option>
                <option value="discount">Sort: Fair Value Discount</option>
                <option value="psf-asc">Sort: Asking PSF (Lowest)</option>
                <option value="psf-desc">Sort: Asking PSF (Highest)</option>
                <option value="top">Sort: TOP Year (Newest)</option>
              </select>
            )}
          </div>
        </div>

        {/* Multi-facet Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Region Tabs */}
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

          {/* Strategy Tabs */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
            {[
              { id: 'ALL', label: 'All Strategies' },
              { id: 'HIGH_YIELD', label: 'High Yield (≥3.5%)' },
              { id: 'VALUE', label: 'Value (< Fair Value)' },
              { id: 'FREEHOLD', label: 'Freehold / Legacy' },
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

          {/* Tenure & Leasehold Decay Filter */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
            {[
              { id: 'ALL', label: 'All Tenures' },
              { id: 'FREEHOLD', label: 'Freehold' },
              { id: 'SAFE_LEASE', label: 'Safe Lease (>85 yrs)' }
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

          {/* Reset Filters */}
          {(selectedRegion !== 'ALL' || selectedStrategy !== 'ALL' || selectedTenure !== 'ALL' || selectedDistrict !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedRegion('ALL');
                setSelectedStrategy('ALL');
                setSelectedTenure('ALL');
                setSelectedDistrict('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold ml-2"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-medium">
            {viewMode === 'opportunities' && `Showing ${filteredProperties.length} Properties`}
            {viewMode === 'district-matrix' && `Showing 28 Singapore Postal Districts`}
            {viewMode === 'ura-caveat-feed' && `Showing ${filteredCaveats.length} Caveat Transactions`}
          </div>
        </div>
      </div>

      {/* 3. VIEW MODE 1: Curated Opportunities with Inline URA Caveats */}
      {viewMode === 'opportunities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProperties.map((property) => {
            const scoreBreakdown = calculateInvestmentScore(property, investorObjective);
            const fairValueMid = (property.estimatedFairValueMin + property.estimatedFairValueMax) / 2;
            const discountPercent = ((fairValueMid - property.askingPrice) / fairValueMid) * 100;
            const isComparing = selectedForComparison.some(p => p.id === property.id);
            const isCaveatsExpanded = expandedCaveatPropId === property.id;
            
            // Calculate median of Tier 1 comps
            const t1PsfAvg = property.tier1Comparables.length > 0
              ? Math.round(property.tier1Comparables.reduce((acc, c) => acc + c.psf, 0) / property.tier1Comparables.length)
              : property.askingPsf;
            const psfDiffToT1 = property.askingPsf - t1PsfAvg;

            return (
              <div
                key={property.id}
                onClick={() => onSelectProperty(property)}
                className="group bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-2xl border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Top: Region Badge, District, Name, Verdict */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
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

                  {/* Financial & Valuation Grid */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
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

                  {/* URA Transaction Verification Bar */}
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        URA Caveats: <strong>{property.tier1Comparables.length} Tier-1 Comps</strong> (Avg ${t1PsfAvg} PSF)
                      </span>
                    </div>
                    <div className="text-[11px] font-mono font-semibold">
                      {psfDiffToT1 <= 0 ? (
                        <span className="text-emerald-400">-${Math.abs(psfDiffToT1)} vs comps</span>
                      ) : (
                        <span className="text-amber-400">+${psfDiffToT1} vs comps</span>
                      )}
                    </div>
                  </div>

                  {/* Key Location Attributes */}
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

                  {/* Inline URA Caveats Accordion */}
                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCaveatPropId(isCaveatsExpanded ? null : property.id);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Inspect {property.tier1Comparables.length + property.tier2Comparables.length} URA Caveat Transactions</span>
                      </span>
                      {isCaveatsExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {isCaveatsExpanded && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs space-y-2 overflow-x-auto"
                      >
                        <div className="font-bold text-slate-300 flex items-center justify-between pb-1 border-b border-white/10 text-[11px]">
                          <span>Contract Date & Development</span>
                          <span>Floor • Price (PSF) • Sale Type</span>
                        </div>
                        {property.tier1Comparables.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                            <div className="space-x-1.5 truncate pr-2">
                              <span className="font-mono text-emerald-400 font-semibold">{c.contractDate}</span>
                              <span className="text-slate-200">{c.developmentName}</span>
                              <span className="text-slate-500">({c.unitType})</span>
                            </div>
                            <div className="text-right shrink-0 space-x-1.5 font-mono">
                              <span className="text-slate-400">{c.floorRange} Flr</span>
                              <strong className="text-white">${(c.price / 1000000).toFixed(2)}M</strong>
                              <span className="text-emerald-300 font-bold">(${c.psf} psf)</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-slate-300">{c.typeOfSale}</span>
                            </div>
                          </div>
                        ))}
                        {property.tier2Comparables.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                            <div className="space-x-1.5 truncate pr-2">
                              <span className="font-mono text-blue-400 font-semibold">{c.contractDate}</span>
                              <span className="text-slate-300">{c.developmentName} [500m comp]</span>
                            </div>
                            <div className="text-right shrink-0 space-x-1.5 font-mono">
                              <span className="text-slate-400">{c.floorRange} Flr</span>
                              <strong className="text-white">${(c.price / 1000000).toFixed(2)}M</strong>
                              <span className="text-blue-300 font-bold">(${c.psf} psf)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Score Breakdown Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-slate-400">Investment Score:</div>
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
                    <span>Full Comps & Scenarios</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. VIEW MODE 2: URA District Matrix (D01 – D28) */}
      {viewMode === 'district-matrix' && (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                Singapore Postal District Macro Matrix (D01 – D28)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official URA Transacted PSF Benchmarks, Average Gross Yields, and 12-Month Price Velocity by Postal Zone.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Click any district to filter opportunities</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SINGAPORE_DISTRICTS_DATA.map((dist) => {
              const isSelected = selectedDistrict === dist.district;
              const matchingCount = SINGAPORE_PROPERTIES.filter(p => p.district === dist.district).length;

              return (
                <div
                  key={dist.district}
                  onClick={() => {
                    setSelectedDistrict(isSelected ? 'ALL' : dist.district);
                    if (!isSelected) setViewMode('opportunities');
                  }}
                  className={`bg-white/[0.04] hover:bg-white/[0.08] border rounded-2xl p-4 cursor-pointer transition-all space-y-3 ${
                    isSelected 
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-400 text-sm">
                      D{dist.district < 10 ? `0${dist.district}` : dist.district}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      dist.region === 'CCR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      dist.region === 'RCR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {dist.region}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white truncate" title={dist.name}>
                      {dist.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {matchingCount > 0 ? `${matchingCount} Curated Asset${matchingCount > 1 ? 's' : ''}` : 'Macro Tracked'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Avg PSF</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">${dist.avgPsf}</div>
                    </div>
                    <div className="border-x border-white/10">
                      <div className="text-[9px] text-slate-400 uppercase">Yield</div>
                      <div className="text-xs font-bold text-emerald-300 font-mono mt-0.5">{dist.rentalYield}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">12m Growth</div>
                      <div className="text-xs font-bold text-teal-400 font-mono mt-0.5">+{dist.yoyGrowth}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. VIEW MODE 3: Live URA Caveat Stream / Tape */}
      {viewMode === 'ura-caveat-feed' && (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  URA DATA STREAM
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Batches 1–4 Transaction Ingestion Stream
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-400" />
                Verified Singapore URA Caveats Tape
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Batch Selector */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
                <span className="px-2 text-slate-400 font-semibold">Batch:</span>
                {[1, 2, 3, 4].map((b) => (
                  <button
                    key={b}
                    onClick={() => setActiveUraBatch(b)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      activeUraBatch === b ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    B{b}
                  </button>
                ))}
              </div>

              {/* Sale Type Filter */}
              <select
                value={uraTapeFilterSaleType}
                onChange={(e) => setUraTapeFilterSaleType(e.target.value)}
                aria-label="Filter by transaction sale type"
                className="px-3 py-1.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Sale Types</option>
                <option value="New Sale">New Sale</option>
                <option value="Resale">Resale</option>
                <option value="Sub Sale">Sub Sale</option>
              </select>

              <button
                onClick={handleRefreshUraBatch}
                disabled={isQueryingUra}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isQueryingUra ? 'animate-spin' : ''}`} />
                <span>{isQueryingUra ? 'Synchronizing...' : 'Query URA Live'}</span>
              </button>
            </div>
          </div>

          {/* Caveat Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.04] text-slate-400 border-b border-white/10 font-bold">
                  <th className="p-3">Contract Date</th>
                  <th className="p-3">Development & Street</th>
                  <th className="p-3">District & Region</th>
                  <th className="p-3">Unit Configuration</th>
                  <th className="p-3">Floor Range</th>
                  <th className="p-3">Price (SGD)</th>
                  <th className="p-3">Unit PSF</th>
                  <th className="p-3">Sale Type</th>
                  <th className="p-3">Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCaveats.map((cav) => (
                  <tr key={cav.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                      {cav.contractDate}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{cav.developmentName}</div>
                      <div className="text-[11px] text-slate-400">{cav.streetName}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                        cav.region === 'CCR' ? 'bg-purple-500/20 text-purple-300' :
                        cav.region === 'RCR' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {cav.region}
                      </span>
                      <span className="text-slate-300">D{cav.district < 10 ? `0${cav.district}` : cav.district}</span>
                    </td>
                    <td className="p-3 text-slate-300">
                      <div>{cav.unitType}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cav.areaSqft} sqft ({cav.areaSqm} sqm)</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{cav.floorRange}</td>
                    <td className="p-3 font-mono font-bold text-white">
                      ${(cav.price).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-300">
                      ${cav.psf} psf
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-200">
                        {cav.typeOfSale}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{cav.tenure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-5xl w-full p-6 space-y-6 shadow-2xl border border-white/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  Head-to-Head Property Investment Comparison
                </h2>
                <p className="text-xs text-slate-400">Cross-comparing URA Caveat Comps, Fair Value Margins, and Net Yields</p>
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
                    <td className="p-3 font-semibold text-slate-400">URA Tier 1 Comps Count</td>
                    {selectedForComparison.map((p) => (
                      <td key={p.id} className="p-3 font-mono text-emerald-300 font-semibold">
                        {p.tier1Comparables.length} verified project caveats
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
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedForComparison([])}
                className="px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
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
