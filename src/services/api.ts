import { PropertyListing, InvestorObjective, BuyerProfileType } from '../types/property';

export interface AdvisorChatParams {
  message: string;
  propertyContext?: PropertyListing | null;
  investorProfile?: {
    objective: InvestorObjective;
    buyerProfile: BuyerProfileType;
    budget?: number;
    ltv?: number;
    rate?: number;
  };
}

export interface UraStatusResponse {
  status: string;
  hasAccessKey: boolean;
  tokenValid: boolean;
  lastFetchedAt: string;
  totalCachedRecords: number;
  activeBatches: number[];
  proxyStatus: string;
  auditGuidelines: {
    fact: string;
    calculation: string;
    estimate: string;
    assumption: string;
  };
}

export interface UraTransactionsResponse {
  source: string;
  timestamp: string;
  batch: string | number;
  district?: string | number;
  data?: any;
  message?: string;
}

export async function getUraStatus(): Promise<UraStatusResponse> {
  const res = await fetch('/api/ura/status');
  if (!res.ok) {
    throw new Error('Failed to fetch URA proxy status');
  }
  return res.json();
}

export async function fetchUraTransactions(batch: number = 1, district?: number): Promise<UraTransactionsResponse> {
  const params = new URLSearchParams();
  params.append('batch', String(batch));
  if (district) params.append('district', String(district));
  const res = await fetch(`/api/ura/transactions?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch URA transaction batch');
  }
  return res.json();
}


export async function askAdvisor(params: AdvisorChatParams): Promise<{ reply: string; timestamp: string }> {
  const res = await fetch('/api/advisor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to communicate with Senior Property Advisor');
  }
  return res.json();
}

export async function generateInvestmentMemo(
  property: PropertyListing,
  investorProfile?: {
    objective: InvestorObjective;
    buyerProfile: BuyerProfileType;
  }
): Promise<{ memo: string; timestamp: string }> {
  const res = await fetch('/api/advisor/memo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property, investorProfile })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate Investment Memo');
  }
  return res.json();
}
