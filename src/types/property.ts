export type SingaporeRegion = 'CCR' | 'RCR' | 'OCR';

export type PropertyType = 
  | 'Condominium' 
  | 'Apartment' 
  | 'Executive Condominium' 
  | 'Landed' 
  | 'Strata Office' 
  | 'Commercial Shophouse' 
  | 'Retail';

export type TenureType = 'Freehold' | '999-year Leasehold' | '99-year Leasehold';

export type InvestmentVerdictType = 
  | 'BUY' 
  | 'BUY BELOW $X' 
  | 'HOLD' 
  | 'SELL' 
  | 'RENT / DO NOT BUY' 
  | 'WAIT';

export type InvestorObjective = 
  | 'Income (High Yield)' 
  | 'Capital Growth' 
  | 'Balanced' 
  | 'Conservative' 
  | 'Value-Add / Opportunistic' 
  | 'Own Stay / Family';

export type BuyerProfileType = 
  | 'Singapore Citizen (1st Property)' 
  | 'Singapore Citizen (2nd Property)' 
  | 'Singapore Citizen (3rd+ Property)' 
  | 'Permanent Resident (1st Property)' 
  | 'Permanent Resident (2nd+ Property)' 
  | 'Foreigner' 
  | 'Entity / Trust';

export interface TransactionRecord {
  id: string;
  contractDate: string; // e.g. "2024-Q3" or "2024-08"
  propertyType: PropertyType;
  developmentName: string;
  district: number;
  streetName: string;
  areaSqft: number;
  areaSqm: number;
  price: number;
  psf: number;
  floorRange: string; // e.g. "11-15"
  unitType: string; // e.g. "2 Bedroom", "3 Bedroom"
  tenure: TenureType;
  typeOfSale: 'New Sale' | 'Sub Sale' | 'Resale';
  tier?: 1 | 2 | 3;
}

export interface RentalRecord {
  id: string;
  leaseDate: string;
  developmentName: string;
  district: number;
  areaSqftRange: string;
  monthlyRent: number;
  rentPsf: number;
  bedroomCount: number;
}

export interface PropertyListing {
  id: string;
  name: string;
  district: number;
  districtName: string;
  region: SingaporeRegion;
  address: string;
  propertyType: PropertyType;
  tenure: TenureType;
  tenureYears?: number;
  leaseStartYear?: number;
  remainingLeaseYears: number;
  topYear: number;
  totalUnits: number;
  developer: string;
  mrtStation: string;
  mrtDistanceMeters: number;
  primarySchoolsNearby: string[];
  askingPrice: number;
  unitSizeSqft: number;
  askingPsf: number;
  bedroomCount: number;
  bathroomCount: number;
  floorLevel: string;
  facing: string;
  estimatedFairValueMin: number;
  estimatedFairValueMax: number;
  estimatedRentMonthly: number;
  grossRentalYield: number;
  estimatedNetYield: number;
  maintenanceFeeMonthly: number;
  investmentScore: number;
  defaultVerdict: InvestmentVerdictType;
  targetBuyPrice?: number;
  liquidityRating: 'High' | 'Moderate' | 'Low';
  enBlocPotential: 'High' | 'Moderate' | 'Low' | 'N/A';
  historicalPsfTrends: { quarter: string; psf: number; volume: number }[];
  tier1Comparables: TransactionRecord[];
  tier2Comparables: TransactionRecord[];
  recentRentalTransactions: RentalRecord[];
  keyHighlights: string[];
  keyRisks: string[];
  catalysts: string[];
  dataGaps: string[];
}

export interface InvestmentScoreBreakdown {
  valuationScore: number; // Max 25
  rentalScore: number; // Max 20
  capitalAppreciationScore: number; // Max 25
  locationScore: number; // Max 15
  liquidityScore: number; // Max 10
  riskScore: number; // Max 5
  totalScore: number; // Max 100
  notes: string[];
}

export interface StampDutyResult {
  purchasePrice: number;
  bsd: number;
  bsdBreakdown: { tier: string; rate: number; amount: number }[];
  absdRate: number;
  absd: number;
  totalStampDuty: number;
  effectiveTaxRate: number;
}

export interface BuyToRentEconomics {
  purchasePrice: number;
  totalAcquisitionCost: number;
  stampDuty: StampDutyResult;
  legalAndValuationFees: number;
  renovationAndFurnishing: number;
  downpaymentRequired: number;
  loanAmount: number;
  monthlyMortgage: number;
  monthlyInterest: number;
  monthlyPrincipal: number;
  annualGrossRent: number;
  annualPropertyTax: number;
  annualMaintenance: number;
  annualInsurance: number;
  annualAgentLeasingFee: number;
  annualRepairsAndBuffer: number;
  annualNetRent: number;
  grossYield: number;
  netYield: number;
  monthlyNetCashFlow: number;
  annualNetCashFlow: number;
  cashOnCashReturn: number;
}

export interface SellVsHoldResult {
  currentProperty: {
    currentMarketValue: number;
    outstandingLoan: number;
    purchasePrice: number;
    currentMonthlyRent: number;
    annualExpenses: number;
    yearsHeld: number;
  };
  holdScenario: {
    projectedAppreciationRate: number;
    holdingPeriodYears: number;
    projectedFutureValue: number;
    totalNetRentalIncome: number;
    totalInterestPaid: number;
    netEquityAtEnd: number;
    annualizedReturn: number;
  };
  sellScenario: {
    grossProceeds: number;
    agentSellingFee: number;
    legalFee: number;
    ssdPayable: number;
    netCashProceeds: number;
    reinvestmentAsset: string;
    reinvestmentYieldAnnual: number;
    reinvestmentProjectedValue: number;
    netEquityAtEnd: number;
    annualizedReturn: number;
  };
  recommendation: 'HOLD' | 'SELL' | 'REDEPLOY';
  decisionRationale: string[];
}

export interface ScenarioAnalysisResult {
  baseCase: {
    priceGrowthPercent: number;
    rentalGrowthPercent: number;
    interestRatePercent: number;
    netYield: number;
    fiveYearReturnPercent: number;
    verdict: InvestmentVerdictType;
  };
  bullCase: {
    priceGrowthPercent: number;
    rentalGrowthPercent: number;
    interestRatePercent: number;
    netYield: number;
    fiveYearReturnPercent: number;
    verdict: InvestmentVerdictType;
  };
  bearCase: {
    priceGrowthPercent: number;
    rentalGrowthPercent: number;
    interestRatePercent: number;
    netYield: number;
    fiveYearReturnPercent: number;
    verdict: InvestmentVerdictType;
  };
}

export interface UserPortfolioItem {
  id: string;
  propertyName: string;
  district: number;
  region: SingaporeRegion;
  propertyType: PropertyType;
  tenure: TenureType;
  purchaseYear: number;
  purchasePrice: number;
  currentEstimatedValue: number;
  currentMonthlyRent: number;
  monthlyMortgage: number;
  outstandingLoan: number;
  occupancyStatus: 'Tenanted' | 'Owner Occupied' | 'Vacant';
}

export interface AIAdvisorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  dataPointsUsed?: {
    fact?: string[];
    calculation?: string[];
    estimate?: string[];
    assumption?: string[];
  };
}
