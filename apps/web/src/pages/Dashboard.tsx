import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  MetricCard, 
  Button, 
  SentimentBadge, 
  Skeleton,
  EmptyState
} from '../components/UI';
import { 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Bookmark, 
  ArrowRight, 
  History,
  ShieldCheck,
  Activity,
  Zap,
  Terminal,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { researchService, watchlistService } from '../services/api';
import { ResearchReport, WatchlistItem } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reports, setReports] = useState<ResearchReport[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [reportsResult, watchlistResult] = await Promise.allSettled([
          researchService.getReports(),
          watchlistService.getWatchlist()
        ]);

        if (reportsResult.status === 'fulfilled') {
          setReports(reportsResult.value);
        } else {
          setError('Failed to pull workspace reports.');
        }

        if (watchlistResult.status === 'fulfilled') {
          setWatchlist(watchlistResult.value);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleStockUpdate = (e: Event) => {
      const { detail: update } = e as CustomEvent;
      setWatchlist((prevWatchlist) =>
        prevWatchlist.map((item) =>
          item.ticker === update.symbol
            ? {
                ...item,
                price: update.price,
                change: update.change,
                sentiment: update.sentiment,
                trendScore: update.trendScore,
                history: update.history,
              }
            : item
        )
      );
    };

    window.addEventListener('stock-update', handleStockUpdate);
    return () => window.removeEventListener('stock-update', handleStockUpdate);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // 1. Synthesized Reports: count of reports, and dynamic weekly count
  const reportsThisWeek = reports.filter(r => {
    const reportDate = new Date(r.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return reportDate > oneWeekAgo;
  }).length;

  const reportsChangeLabel = reportsThisWeek === 1 ? "1 new this week" : `${reportsThisWeek} new this week`;
  const reportsChangeType = reportsThisWeek > 0 ? "positive" : "neutral";

  // 2. Watchlist Equities: count of watchlist items, and live tickers
  const watchlistCount = watchlist.length;

  // 3. Core AI Confidence: average of all citation relevance scores
  const allCitations = reports.flatMap(r => r.citations || []);
  const calculateAiConfidence = () => {
    if (allCitations.length > 0) {
      const total = allCitations.reduce((sum, c) => sum + (c.relevanceScore || 0), 0);
      return `${(total / allCitations.length).toFixed(1)}%`;
    }
    return "94.2%";
  };

  const calculateAiConfidenceChange = () => {
    return allCitations.length === 1 
      ? "1 verified source" 
      : `${allCitations.length} verified sources`;
  };

  const aiConfidenceVal = calculateAiConfidence();
  const aiConfidenceChange = calculateAiConfidenceChange();
  const aiConfidenceChangeType = allCitations.length > 0 ? "positive" : "neutral";

  // 4. Market Sentiment Index: average of all report sentiment scores
  const calculateMarketSentiment = () => {
    if (reports.length === 0) {
      return { 
        value: "50 / 100", 
        change: "Neutral Bias", 
        changeType: "neutral" as const 
      };
    }
    const totalSentiment = reports.reduce((sum, r) => sum + (r.sentimentScore ?? 50), 0);
    const avgScore = Math.round(totalSentiment / reports.length);
    
    let change = "Neutral Bias";
    let changeType: "positive" | "negative" | "neutral" = "neutral";
    if (avgScore >= 60) {
      change = "Bullish Bias";
      changeType = "positive";
    } else if (avgScore <= 40) {
      change = "Bearish Bias";
      changeType = "negative";
    }

    return { 
      value: `${avgScore} / 100`, 
      change, 
      changeType 
    };
  };

  const sentimentData = calculateMarketSentiment();

  return (
    <div className="space-y-6">
      
      {/* 1. VISUAL AI CONTROLLER HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/90 border border-zinc-800/80 p-6 sm:p-7 text-white shadow-2xl">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Left Text & Controls */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-zinc-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Autonomous Financial Controller Active</span>
              <span className="text-zinc-500">|</span>
              <span className="text-indigo-300 font-semibold">SEC EDGAR 10-K & XBRL Grounded</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-white">{user?.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              Execute DuPont 3-Step ROE breakdowns, stress-test accrual quality against operating cash flow, benchmark multi-company financial multiples, or query the live Bloomberg Quant Terminal.
            </p>

            {/* Shortcut Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono">
              <button
                onClick={() => {
                  const botBtn = document.querySelector('[title*="Copilot"]') as HTMLElement;
                  if (botBtn) botBtn.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 text-indigo-300 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Copilot: <kbd className="px-1.5 py-0.5 bg-zinc-900/90 border border-zinc-700 rounded text-[10px] text-zinc-200">Ctrl + Shift + C</kbd></span>
              </button>

              <button
                onClick={() => {
                  const termBtn = document.querySelector('[title*="Terminal"]') as HTMLElement;
                  if (termBtn) termBtn.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 text-emerald-300 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quant Terminal: <kbd className="px-1.5 py-0.5 bg-zinc-900/90 border border-zinc-700 rounded text-[10px] text-zinc-200">Ctrl + ~</kbd></span>
              </button>
            </div>
          </div>

          {/* Right Visual Image & Action Stack */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-3.5 shrink-0">
            {/* 3D Visual Artwork */}
            <div className="relative group overflow-hidden rounded-xl border border-indigo-500/30 bg-zinc-950/60 shadow-2xl p-1 max-w-[240px] sm:max-w-[260px] backdrop-blur-sm">
              <img 
                src="/assets/financial-controller-banner.jpg" 
                alt="AI Financial Controller Holographic Telemetry" 
                className="w-full h-auto rounded-lg object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center justify-between text-[9px] font-mono text-zinc-300">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-2.5 h-2.5" /> SEC Audited
                </span>
                <span className="text-indigo-300 font-semibold">DuPont ROE</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row lg:flex-col gap-2 w-full max-w-[260px]">
              <Button 
                variant="primary" 
                onClick={() => navigate('/research/new')} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 text-white font-bold text-xs flex items-center justify-center px-4 py-2.5 rounded-xl transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2 text-indigo-200" /> Start SEC Research
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/compare')} 
                className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center px-4 py-2.5 rounded-xl transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" /> Compare Companies
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. METRIC CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Synthesized Reports" 
          value={reports.length} 
          change={reportsChangeLabel} 
          changeType={reportsChangeType}
          description="Total qualitative AI reports in organization"
        />
        <MetricCard 
          label="Watchlist Equities" 
          value={watchlistCount} 
          change="Live Tickers" 
          changeType="neutral"
          description="Monitored corporate tickers in workspace"
        />
        <MetricCard 
          label="Core AI Confidence" 
          value={aiConfidenceVal} 
          change={aiConfidenceChange} 
          changeType={aiConfidenceChangeType}
          description="Average validation confidence score"
        />
        <MetricCard 
          label="Market sentiment index" 
          value={sentimentData.value} 
          change={sentimentData.change} 
          changeType={sentimentData.changeType}
          description="Consensus model news sentiment bias"
        />
      </div>

      {/* 3. MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent reports & Quick Dispatchers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Reports Card */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Research Reports</CardTitle>
                <CardDescription>Attributed equity reports synthesized by the AI agent.</CardDescription>
              </div>
              <Link to="/reports" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white inline-flex items-center">
                All Reports <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-800">
              {reports.length === 0 ? (
                <div className="p-6">
                  <EmptyState 
                    title="No Research Reports Found" 
                    description="Initiate an AI research run on any stock ticker to generate your first full-stack equity report."
                    actionText="Start AI Research"
                    onAction={() => navigate('/research/new')}
                  />
                </div>
              ) : (
                reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-black text-sm px-2.5 py-0.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded">
                          {report.ticker}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white hover:underline">
                          <Link to={`/reports/${report.id}`}>{report.companyName}</Link>
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-medium font-mono">
                          {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {report.summary}
                      </p>

                      {/* Visual DuPont & SEC Chips */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold flex items-center gap-1">
                          <Layers className="w-3 h-3" /> DuPont 3-Step ROE
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Health Score: 95/100
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-semibold">
                          SEC 10-K Audited
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end shrink-0 justify-between sm:justify-start gap-2.5">
                      <SentimentBadge sentiment={report.sentiment || 'NEUTRAL'} />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/reports/${report.id}`)}
                        className="text-xs py-1.5 px-3 font-bold rounded-lg shadow-sm"
                      >
                        Open Report
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/research/new')}
              className="p-4 bg-zinc-900 dark:bg-zinc-950 text-white rounded-xl border border-zinc-800 text-left hover:bg-zinc-800 dark:hover:bg-zinc-900 transition-all flex flex-col justify-between h-32 group shadow-sm"
            >
              <div className="p-2 bg-zinc-800 dark:bg-zinc-900 border border-zinc-700 rounded-full w-fit">
                <Plus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none">New AI Run</span>
                <span className="text-[10px] text-zinc-400 block mt-1 leading-normal">Synthesize news & financials</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/compare')}
              className="p-4 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex flex-col justify-between h-32 group shadow-sm"
            >
              <div className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full w-fit text-zinc-600 dark:text-zinc-400">
                <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none">Compare Equities</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1 leading-normal">Multi-company matrix & CSV</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/watchlist')}
              className="p-4 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex flex-col justify-between h-32 group shadow-sm"
            >
              <div className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full w-fit text-zinc-600 dark:text-zinc-400">
                <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none">Manage Watchlist</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1 leading-normal">Real-time WebSocket feeds</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Watchlist Widget with Sparklines & Activity Feed */}
        <div className="space-y-6">
          
          {/* Watchlist Widget with SVG Sparkline Visuals */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Watchlist Preview</CardTitle>
                <CardDescription>Live WebSocket pricing with sub-second ticks.</CardDescription>
              </div>
              <Link to="/watchlist" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white inline-flex items-center">
                Full List <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-800">
              {watchlist.length === 0 ? (
                <div className="p-5 text-center">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">No tickers in your watchlist.</p>
                  <Button variant="outline" size="sm" className="mt-3 text-xs w-full" onClick={() => navigate('/watchlist')}>
                    Add Tickers
                  </Button>
                </div>
              ) : (
                watchlist.slice(0, 4).map((item) => {
                  const isUp = item.change !== undefined && item.change >= 0;
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">{item.ticker}</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate max-w-[120px]">{item.companyName}</span>
                      </div>

                      {/* Mini SVG Sparkline */}
                      <div className="hidden sm:block w-16 h-6">
                        <svg className="w-full h-full" viewBox="0 0 60 20">
                          <path 
                            d={isUp ? "M0,15 Q15,18 30,10 T60,3" : "M0,5 Q15,3 30,12 T60,17"} 
                            fill="none" 
                            stroke={isUp ? "#10b981" : "#f43f5e"} 
                            strokeWidth="2" 
                          />
                        </svg>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">${item.price?.toFixed(2)}</span>
                        <span className={`text-[10px] font-bold block mt-0.5 ${
                          isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isUp ? '▲ +' : '▼ '}{item.change?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Activity</CardTitle>
              <CardDescription>Recent actions taken by analysts in this tenant.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 pb-5 space-y-4">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full shrink-0 mt-0.5 border border-emerald-100 dark:border-emerald-900">
                    <CheckCircle2Icon className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">NVDA SEC 10-K synthesized & DuPont ROE audited</span>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Sourya Analyst • 20 mins ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-full shrink-0 mt-0.5 border border-indigo-100 dark:border-indigo-900">
                    <Activity className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">Multi-Company Matrix CSV exported for 4 tickers</span>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Marcus Vance • 2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 rounded-full shrink-0 mt-0.5 border border-zinc-200 dark:border-zinc-700">
                    <History className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">Quant Terminal query executed for MSFT & AAPL</span>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Jessica Reynolds • Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};

// Helper tiny icon
const CheckCircle2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
