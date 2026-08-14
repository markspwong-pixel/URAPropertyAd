import { 
  BuyerProfileType, 
  PropertyType, 
  StampDutyResult, 
  BuyToRentEconomics, 
  PropertyListing,
  InvestmentScoreBreakdown,
  InvestorObjective,
  SellVsHoldResult,
  ScenarioAnalysisResult
} from '../types/property';

/**
 * Computes Singapore Buyer's Stamp Duty (BSD) according to IRAS updated tiers
 */
export function calculateBSD(price: number, isCommercial: boolean = false): { bsd: number; breakdown: { tier: string; rate: number; amount: number }[] } {
  const breakdown: { tier: string; rate: number; amount: number }[] = [];
  let remaining = price;
  let totalBsd = 0;

  if (isCommercial) {
    // Non-residential tiers
    // 1st $180,000 @ 1%
    const t1 = Math.min(remaining, 180000);
    if (t1 > 0) {
      const amt = t1 * 0.01;
      totalBsd += amt;
      breakdown.push({ tier: 'First $180,000', rate: 1, amount: amt });
      remaining -= t1;
    }
    // Next $180,000 @ 2%
    const t2 = Math.min(remaining, 180000);
    if (t2 > 0) {
      const amt = t2 * 0.02;
      totalBsd += amt;
      breakdown.push({ tier: 'Next $180,000', rate: 2, amount: amt });
      remaining -= t2;
    }
    // Next $640,000 @ 3%
    const t3 = Math.min(remaining, 640000);
    if (t3 > 0) {
      const amt = t3 * 0.03;
      totalBsd += amt;
      breakdown.push({ tier: 'Next $640,000', rate: 3, amount: amt });
      remaining -= t3;
    }
    // Next $500,000 @ 4%
    const t4 = Math.min(remaining, 500000);
    if (t4 > 0) {
      const amt = t4 * 0.04;
      totalBsd += amt;
      breakdown.push({ tier: 'Next $500,000', rate: 4, amount: amt });
      remaining -= t4;
    }
    // Above $1,500,000 @ 5%
    if (remaining > 0) {
      const amt = remaining * 0.05;
      totalBsd += amt;
      breakdown.push({ tier: 'Amount above $1,500,000', rate: 5, amount: amt });
    }
  } else {
    // Residential tiers
    // 1st $180,000 @ 1%
    const t1 = Math.min(remaining, 180000);
    if (t1 > 0) {
      const amt = t1 * 0.01;
      totalBsd += amt;
      breakdown.push({ tier: 'First $180,000', rate: 1, amount: amt });
      remaining -= t1;
    }
    // Next $180,000 @ 2%
    const t2 = Math.min(remaining, 180000);
    if (t2 > 0) {
      const amt = t2 * 0.02;
      totalBsd += amt;
      breakdown.push({ tier: 'Next $180,000', rate: 2, amount: amt });
      remaining -= t2;
    }
    // Next $640,000 @ 3%
    const t3 = Math.min(remaining, 640000);
    if (t3 > 0) {
      const amt = t3 * 0.03;
      totalBsd += amt;
      breakdown.push({ tier: 'Next $640,000', rate: 3, amount: amt });
      remaining -= t3;
    }
    // Next $500,000 @ 4%
    const t4 = Math.min(remaining, 500000);
    if (t4 > 0) {
      const amt = t4 * 0.04;
      totalBsd += amt;
      breakdown.push({ tier: 'Next $500,000', rate: 4, amount: amt });
      remaining -= t4;
    }
    // Next $1,500,000 @ 5%
    const t5 = Math.min(remaining, 1500000);
    if (t5 > 0) {
      const amt = t5 * 0.05;
      totalBsd += amt;
      breakdown.push({ tier: 'Next $1,500,000', rate: 5, amount: amt });
      remaining -= t5;
    }
    // Above $3,000,000 @ 6%
    if (remaining > 0) {
      const amt = remaining * 0.06;
      totalBsd += amt;
      breakdown.push({ tier: 'Amount above $3,000,000', rate: 6, amount: amt });
    }
  }

  return { bsd: Math.round(totalBsd), breakdown };
}

/**
 * Returns ABSD percentage based on buyer residency & property count
 */
export function getABSDPercent(buyerProfile: BuyerProfileType, propertyType: PropertyType): number {
  if (['Commercial Shophouse', 'Strata Office', 'Retail'].includes(propertyType)) {
    return 0; // Commercial is 0% ABSD
  }

  switch (buyerProfile) {
    case 'Singapore Citizen (1st Property)':
      return 0;
    case 'Singapore Citizen (2nd Property)':
      return 20;
    case 'Singapore Citizen (3rd+ Property)':
      return 30;
    case 'Permanent Resident (1st Property)':
      return 5;
    case 'Permanent Resident (2nd+ Property)':
      return 30;
    case 'Foreigner':
      return 60;
    case 'Entity / Trust':
      return 65;
    default:
      return 0;
  }
}

/**
 * Full Stamp Duty computation
 */
export function calculateStampDuty(
  price: number,
  buyerProfile: BuyerProfileType,
  propertyType: PropertyType
): StampDutyResult {
  const isCommercial = ['Commercial Shophouse', 'Strata Office', 'Retail'].includes(propertyType);
  const { bsd, breakdown } = calculateBSD(price, isCommercial);
  const absdRate = getABSDPercent(buyerProfile, propertyType);
  const absd = Math.round(price * (absdRate / 100));
  const totalStampDuty = bsd + absd;
  const effectiveTaxRate = price > 0 ? (totalStampDuty / price) * 100 : 0;

  return {
    purchasePrice: price,
    bsd,
    bsdBreakdown: breakdown,
    absdRate,
    absd,
    totalStampDuty,
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(2))
  };
}

/**
 * Monthly mortgage amortization
 */
export function calculateMortgage(loanAmount: number, annualRatePercent: number, loanTenureYears: number) {
  if (loanAmount <= 0 || loanTenureYears <= 0) {
    return { monthlyMortgage: 0, monthlyInterest: 0, monthlyPrincipal: 0 };
  }

  const r = annualRatePercent / 100 / 12;
  const n = loanTenureYears * 12;

  let monthlyPayment = 0;
  if (r === 0) {
    monthlyPayment = loanAmount / n;
  } else {
    monthlyPayment = (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  }

  const firstMonthInterest = loanAmount * r;
  const firstMonthPrincipal = monthlyPayment - firstMonthInterest;

  return {
    monthlyMortgage: Math.round(monthlyPayment),
    monthlyInterest: Math.round(firstMonthInterest),
    monthlyPrincipal: Math.round(firstMonthPrincipal)
  };
}

/**
 * Calculates IRAS Non-Owner Occupier Annual Property Tax (Progressive residential rate)
 * Annual Value (AV) approx = Monthly Rent * 12 * 0.85
 */
export function calculateResidentialNonOwnerPropertyTax(annualValue: number): number {
  let tax = 0;
  let rem = annualValue;

  // First $30k @ 12%
  const t1 = Math.min(rem, 30000);
  if (t1 > 0) {
    tax += t1 * 0.12;
    rem -= t1;
  }
  // Next $15k @ 20% ($30k to $45k)
  const t2 = Math.min(rem, 15000);
  if (t2 > 0) {
    tax += t2 * 0.20;
    rem -= t2;
  }
  // Next $15k @ 28% ($45k to $60k)
  const t3 = Math.min(rem, 15000);
  if (t3 > 0) {
    tax += t3 * 0.28;
    rem -= t3;
  }
  // Above $60k @ 36%
  if (rem > 0) {
    tax += rem * 0.36;
  }

  return Math.round(tax);
}

/**
 * Buy-To-Rent Full Financial Economics Engine
 */
export function calculateBuyToRentEconomics(params: {
  purchasePrice: number;
  monthlyRent: number;
  buyerProfile: BuyerProfileType;
  propertyType: PropertyType;
  downpaymentPercent: number; // e.g. 25% for 75% LTV
  loanTenureYears: number; // e.g. 30 yrs
  interestRatePercent: number; // e.g. 3.5%
  maintenanceFeeMonthly: number;
  legalAndValuationFees?: number;
  renovationAndFurnishing?: number;
}): BuyToRentEconomics {
  const {
    purchasePrice,
    monthlyRent,
    buyerProfile,
    propertyType,
    downpaymentPercent,
    loanTenureYears,
    interestRatePercent,
    maintenanceFeeMonthly,
    legalAndValuationFees = 3500,
    renovationAndFurnishing = 25000
  } = params;

  const stampDuty = calculateStampDuty(purchasePrice, buyerProfile, propertyType);
  const downpaymentRequired = Math.round(purchasePrice * (downpaymentPercent / 100));
  const loanAmount = purchasePrice - downpaymentRequired;

  const { monthlyMortgage, monthlyInterest, monthlyPrincipal } = calculateMortgage(
    loanAmount,
    interestRatePercent,
    loanTenureYears
  );

  const annualGrossRent = monthlyRent * 12;
  const isCommercial = ['Commercial Shophouse', 'Strata Office', 'Retail'].includes(propertyType);
  
  // Approximate Annual Value (AV) = Annual Rent * 0.85
  const estimatedAV = annualGrossRent * 0.85;
  const annualPropertyTax = isCommercial 
    ? Math.round(estimatedAV * 0.10) 
    : calculateResidentialNonOwnerPropertyTax(estimatedAV);

  const annualMaintenance = maintenanceFeeMonthly * 12;
  const annualInsurance = isCommercial ? 1500 : 450;
  const annualAgentLeasingFee = Math.round(monthlyRent * 0.5); // 0.5 month per yr average
  const annualRepairsAndBuffer = Math.round(monthlyRent * 0.75); // approx 3-4 weeks buffer

  const totalAnnualExpenses = 
    annualPropertyTax + 
    annualMaintenance + 
    annualInsurance + 
    annualAgentLeasingFee + 
    annualRepairsAndBuffer;

  const annualNetRent = annualGrossRent - totalAnnualExpenses;
  const grossYield = purchasePrice > 0 ? Number(((annualGrossRent / purchasePrice) * 100).toFixed(2)) : 0;
  
  const totalAcquisitionCost = 
    purchasePrice + 
    stampDuty.totalStampDuty + 
    legalAndValuationFees + 
    renovationAndFurnishing;

  const totalInvestedCash = 
    downpaymentRequired + 
    stampDuty.totalStampDuty + 
    legalAndValuationFees + 
    renovationAndFurnishing;

  const netYield = totalAcquisitionCost > 0 
    ? Number(((annualNetRent / totalAcquisitionCost) * 100).toFixed(2)) 
    : 0;

  const annualMortgagePayment = monthlyMortgage * 12;
  const annualNetCashFlow = annualNetRent - annualMortgagePayment;
  const monthlyNetCashFlow = Math.round(annualNetCashFlow / 12);

  const cashOnCashReturn = totalInvestedCash > 0 
    ? Number(((annualNetCashFlow / totalInvestedCash) * 100).toFixed(2)) 
    : 0;

  return {
    purchasePrice,
    totalAcquisitionCost,
    stampDuty,
    legalAndValuationFees,
    renovationAndFurnishing,
    downpaymentRequired,
    loanAmount,
    monthlyMortgage,
    monthlyInterest,
    monthlyPrincipal,
    annualGrossRent,
    annualPropertyTax,
    annualMaintenance,
    annualInsurance,
    annualAgentLeasingFee,
    annualRepairsAndBuffer,
    annualNetRent,
    grossYield,
    netYield,
    monthlyNetCashFlow,
    annualNetCashFlow,
    cashOnCashReturn
  };
}

/**
 * 100-Point Institutional Investment Score
 */
export function calculateInvestmentScore(
  property: PropertyListing,
  objective: InvestorObjective = 'Balanced'
): InvestmentScoreBreakdown {
  const notes: string[] = [];

  // 1. Valuation / Pricing (Max 25 pts)
  let valuationScore = 18;
  const fairValueMid = (property.estimatedFairValueMin + property.estimatedFairValueMax) / 2;
  const priceDiffPercent = ((fairValueMid - property.askingPrice) / fairValueMid) * 100;
  
  if (priceDiffPercent >= 5) {
    valuationScore = 24;
    notes.push(`Attractive entry: priced ${priceDiffPercent.toFixed(1)}% below estimated fair value`);
  } else if (priceDiffPercent >= 0) {
    valuationScore = 20;
    notes.push('Fairly valued relative to Tier 1 development comps');
  } else if (priceDiffPercent >= -5) {
    valuationScore = 15;
    notes.push('Slightly full valuation; entry price discipline recommended');
  } else {
    valuationScore = 10;
    notes.push('Asking price is at a premium to recent transaction comparables');
  }

  // 2. Rental Yield / Income (Max 20 pts)
  let rentalScore = 14;
  if (property.grossRentalYield >= 4.0) {
    rentalScore = 19;
    notes.push(`Strong gross yield (${property.grossRentalYield}%) exceeding Singapore residential baseline`);
  } else if (property.grossRentalYield >= 3.4) {
    rentalScore = 16;
    notes.push(`Healthy rental yield (${property.grossRentalYield}%) with robust tenant catchment`);
  } else if (property.grossRentalYield >= 2.8) {
    rentalScore = 13;
    notes.push(`Moderate rental yield (${property.grossRentalYield}%) standard for prime CCR/RCR`);
  } else {
    rentalScore = 9;
    notes.push('Low current yield; heavily dependent on capital appreciation');
  }

  // 3. Capital Appreciation Potential (Max 25 pts)
  let capScore = 19;
  if (property.mrtDistanceMeters <= 100) capScore += 3;
  if (property.tenure === 'Freehold' || property.remainingLeaseYears >= 90) capScore += 2;
  if (property.catalysts.length >= 2) capScore += 1;
  capScore = Math.min(25, capScore);
  notes.push(`Solid capital growth profile supported by ${property.catalysts.length} structural catalysts`);

  // 4. Location Fundamentals (Max 15 pts)
  let locScore = 12;
  if (property.mrtDistanceMeters <= 200) locScore += 2;
  if (property.primarySchoolsNearby.some(s => s.includes('Within 1km') || s.includes('Tao Nan') || s.includes('St. Nicholas') || s.includes('River Valley'))) {
    locScore += 1;
  }
  locScore = Math.min(15, locScore);

  // 5. Liquidity (Max 10 pts)
  let liqScore = property.liquidityRating === 'High' ? 9 : property.liquidityRating === 'Moderate' ? 7 : 4;

  // 6. Risk Profile (Max 5 pts)
  let riskScore = 4;
  if (property.remainingLeaseYears < 75 && property.tenure !== 'Freehold') riskScore -= 1;
  if (property.keyRisks.length > 2) riskScore -= 1;
  riskScore = Math.max(1, riskScore);

  // Apply Objective Weights
  let totalScore = valuationScore + rentalScore + capScore + locScore + liqScore + riskScore;

  if (objective === 'Income (High Yield)') {
    totalScore = Math.round(valuationScore * 0.8 + rentalScore * 1.5 + capScore * 0.7 + locScore * 0.9 + liqScore * 1.0 + riskScore * 1.0);
  } else if (objective === 'Capital Growth') {
    totalScore = Math.round(valuationScore * 1.1 + rentalScore * 0.6 + capScore * 1.4 + locScore * 1.1 + liqScore * 0.9 + riskScore * 0.8);
  } else if (objective === 'Conservative') {
    totalScore = Math.round(valuationScore * 1.2 + rentalScore * 1.0 + capScore * 0.8 + locScore * 1.0 + liqScore * 1.2 + riskScore * 1.5);
  }

  totalScore = Math.min(100, Math.max(20, totalScore));

  return {
    valuationScore,
    rentalScore,
    capitalAppreciationScore: capScore,
    locationScore: locScore,
    liquidityScore: liqScore,
    riskScore,
    totalScore,
    notes
  };
}

/**
 * Sell-vs-Hold Engine
 */
export function calculateSellVsHold(params: {
  currentMarketValue: number;
  purchasePrice: number;
  outstandingLoan: number;
  currentMonthlyRent: number;
  annualExpenses: number;
  projectedAppreciationRate: number; // e.g. 3.5% p.a.
  holdingPeriodYears: number; // e.g. 5 yrs
  reinvestmentAsset: string;
  reinvestmentYieldAnnual: number; // e.g. 5.5% (REITs) or 8.0% (S&P500)
  yearsHeld: number;
}): SellVsHoldResult {
  const {
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
  } = params;

  // HOLD SCENARIO
  const projectedFutureValue = Math.round(currentMarketValue * Math.pow(1 + projectedAppreciationRate / 100, holdingPeriodYears));
  const annualNetRent = currentMonthlyRent * 12 - annualExpenses;
  const totalNetRentalIncome = annualNetRent * holdingPeriodYears;
  
  // Outstanding loan payoff estimate over holding period
  const loanPaidDown = Math.min(outstandingLoan, (outstandingLoan * 0.03) * holdingPeriodYears);
  const finalLoanBalance = Math.max(0, outstandingLoan - loanPaidDown);
  const totalInterestPaid = Math.round(outstandingLoan * 0.035 * holdingPeriodYears);

  const holdNetEquityAtEnd = projectedFutureValue - finalLoanBalance + totalNetRentalIncome;
  const currentEquity = currentMarketValue - outstandingLoan;
  const holdAnnualizedReturn = currentEquity > 0 
    ? ((Math.pow(holdNetEquityAtEnd / currentEquity, 1 / holdingPeriodYears) - 1) * 100)
    : 0;

  // SELL SCENARIO
  const agentSellingFee = Math.round(currentMarketValue * 0.02 * 1.09); // 2% + 9% GST
  const legalFee = 3000;
  
  // SSD if held < 3 years
  let ssdRate = 0;
  if (yearsHeld < 1) ssdRate = 12;
  else if (yearsHeld < 2) ssdRate = 8;
  else if (yearsHeld < 3) ssdRate = 4;
  const ssdPayable = Math.round(currentMarketValue * (ssdRate / 100));

  const netCashProceeds = currentMarketValue - outstandingLoan - agentSellingFee - legalFee - ssdPayable;
  const reinvestmentProjectedValue = Math.round(
    netCashProceeds * Math.pow(1 + reinvestmentYieldAnnual / 100, holdingPeriodYears)
  );

  const sellAnnualizedReturn = reinvestmentYieldAnnual;

  let recommendation: 'HOLD' | 'SELL' | 'REDEPLOY' = 'HOLD';
  const decisionRationale: string[] = [];

  if (reinvestmentProjectedValue > holdNetEquityAtEnd * 1.08) {
    recommendation = 'REDEPLOY';
    decisionRationale.push(`Selling and redeploying $${(netCashProceeds / 1000000).toFixed(2)}M equity into ${reinvestmentAsset} generates an estimated $${((reinvestmentProjectedValue - holdNetEquityAtEnd) / 1000).toFixed(0)}k higher terminal value.`);
    decisionRationale.push('Higher liquidity and elimination of property maintenance, tenancy management, and illiquidity friction.');
  } else if (holdNetEquityAtEnd >= reinvestmentProjectedValue) {
    recommendation = 'HOLD';
    decisionRationale.push(`Holding yields an estimated $${(holdNetEquityAtEnd / 1000000).toFixed(2)}M terminal equity with strong rental cash flow cushion.`);
    decisionRationale.push('Avoids selling transaction costs (approx 2.18% agent + legal) and capital gains redeployment friction.');
  } else {
    recommendation = 'HOLD';
    decisionRationale.push('Differences are marginal; holding preserves prime Singapore real estate inflation hedge.');
  }

  return {
    currentProperty: {
      currentMarketValue,
      outstandingLoan,
      purchasePrice,
      currentMonthlyRent,
      annualExpenses,
      yearsHeld
    },
    holdScenario: {
      projectedAppreciationRate,
      holdingPeriodYears,
      projectedFutureValue,
      totalNetRentalIncome,
      totalInterestPaid,
      netEquityAtEnd: holdNetEquityAtEnd,
      annualizedReturn: Number(holdAnnualizedReturn.toFixed(2))
    },
    sellScenario: {
      grossProceeds: currentMarketValue,
      agentSellingFee,
      legalFee,
      ssdPayable,
      netCashProceeds,
      reinvestmentAsset,
      reinvestmentYieldAnnual,
      reinvestmentProjectedValue,
      netEquityAtEnd: reinvestmentProjectedValue,
      annualizedReturn: Number(sellAnnualizedReturn.toFixed(2))
    },
    recommendation,
    decisionRationale
  };
}

/**
 * Scenario Analysis Engine (Base, Bull, Bear cases)
 */
export function generateScenarioAnalysis(property: PropertyListing): ScenarioAnalysisResult {
  const baseYield = property.estimatedNetYield;

  return {
    baseCase: {
      priceGrowthPercent: 3.5,
      rentalGrowthPercent: 2.0,
      interestRatePercent: 3.5,
      netYield: baseYield,
      fiveYearReturnPercent: 21.5,
      verdict: property.defaultVerdict
    },
    bullCase: {
      priceGrowthPercent: 7.5,
      rentalGrowthPercent: 5.5,
      interestRatePercent: 2.8,
      netYield: Number((baseYield + 0.6).toFixed(2)),
      fiveYearReturnPercent: 44.2,
      verdict: 'BUY'
    },
    bearCase: {
      priceGrowthPercent: -2.0,
      rentalGrowthPercent: -4.0,
      interestRatePercent: 4.5,
      netYield: Number((baseYield - 0.7).toFixed(2)),
      fiveYearReturnPercent: 4.8,
      verdict: 'WAIT'
    }
  };
}

/**
 * Format currency to SGD string
 */
export function formatSGD(val: number): string {
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}k`;
  }
  return `$${val.toLocaleString()}`;
}

export function formatFullSGD(val: number): string {
  return `$${Math.round(val).toLocaleString('en-SG')}`;
}
