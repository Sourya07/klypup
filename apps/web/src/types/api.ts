import { 
  UserRole, 
  SharedUser, 
  SharedOrganization, 
  SharedMember, 
  SharedReport, 
  SharedCitation, 
  SharedWatchlist, 
  SharedWatchlistItem 
} from '@dashboard/shared/src/types';

export type { UserRole };
export type { LoginInput, SignupInput, CreateReportInput } from '@dashboard/shared/src/schemas';

export interface User extends SharedUser {}

export interface Organization extends SharedOrganization {}

export interface Member extends SharedMember {
  organization?: Organization;
  user: User;
}

export interface ResearchCitation extends SharedCitation {}

export interface RedFlagItem {
  category: 'ACCRUAL' | 'LEVERAGE' | 'MARGIN' | 'VALUATION' | 'REGULATORY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  detail: string;
  metricValue: string;
  recommendation: string;
}

export interface DuPontAnalysis {
  roe: string;
  netMargin: string;
  assetTurnover: string;
  financialLeverage: string;
}

export interface ResearchReport extends SharedReport {
  ticker: string;
  companyName: string;
  citations?: ResearchCitation[];
  metrics?: {
    peRatio?: number;
    eps?: number;
    marketCap?: string;
    revenueGrowth?: string;
    profitMargin?: string;
    debtEquity?: string;
  };
  healthScore?: number;
  healthRating?: 'STRONG' | 'MODERATE' | 'HIGH_RISK';
  redFlags?: RedFlagItem[];
  duPontAnalysis?: DuPontAnalysis;
  keyDrivers?: string[];
  risks?: string[];
  opportunities?: string[];
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore?: number;
  stockHistory?: Array<{ date: string; price: number; volume?: number }>;
  tags?: string[];
}

export interface AskControllerResponse {
  answer: string;
  confidenceScore: number;
  relatedMetrics?: Record<string, string>;
  citations?: Array<{ sourceName: string; snippet: string }>;
}

export interface ResearchRun {
  id: string;
  ticker: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0 to 100
  step: string; // e.g. "Data Gathering", "Modeling", etc.
  error?: string | null;
  reportId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem extends SharedWatchlistItem {
  price?: number;
  change?: number;
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trendScore?: number;
  history?: number[];
}

export interface Watchlist extends SharedWatchlist {
  items: WatchlistItem[];
}

export interface CompareMetric {
  label: string;
  key: string;
  formatter?: (val: any) => string;
}

export interface CompanyComparison {
  ticker: string;
  companyName: string;
  metrics: {
    peRatio: number;
    eps: number;
    marketCap: string;
    revenue: string;
    revenueGrowth: string;
    profitMargin: string;
    debtEquity: string;
    pbRatio: number;
    dividendYield: string;
  };
  strengths: string[];
  weaknesses: string[];
  sources: string[];
}

export interface CompareResponse {
  companies: CompanyComparison[];
  summary: string;
  comparisonChart: Array<{
    metric: string;
    [ticker: string]: number | string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  meta?: any;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  organization: Organization;
  role: UserRole;
  tokens: TokenPair;
}
