import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Github, 
  Zap, 
  TrendingUp, 
  CheckCircle 
} from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { TerminalDrawer } from '../components/TerminalDrawer';

const TABS: Array<'trade' | 'markets' | 'portfolio' | 'activity'> = ['trade', 'markets', 'portfolio', 'activity'];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'trade' | 'markets' | 'portfolio' | 'activity'>('trade');
  const [tradeType, setTradeType] = useState<'yes' | 'no'>('yes');
  const [isPaused, setIsPaused] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Global shortcut: Ctrl + ~ or Cmd + ~ to toggle terminal drawer on landing page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-rotate tabs every 3 seconds unless user is hovering / interacting
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const nextIdx = (TABS.indexOf(prev) + 1) % TABS.length;
        return TABS[nextIdx];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* 1. CLOUD BACKGROUND HERO WRAPPER */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat pt-6 pb-24"
        style={{ backgroundImage: `url('/cloud.jpg')` }}
      >
        {/* Dark Vignette & Top Sky Glow Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-sky-900/20 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black pointer-events-none" />

        {/* 1. NAVBAR */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-black tracking-widest uppercase text-white hover:opacity-90 transition-opacity cursor-pointer">
              KLYPUP
            </span>
          </div>

          {/* Center Badge Pill */}
          <div className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-zinc-300">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Autonomous Equity Research & Audit
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-indigo-300 font-mono text-[11px]">Grounded in SEC EDGAR & GAAP Analytics</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
              className="text-xs font-bold text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleLaunchApp}
              className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black shadow-xl hover:shadow-white/20 transition-all flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 2. ANNOUNCEMENT PILL (BELOW NAVBAR) */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex justify-center mt-8 mb-2">
          <a
            href="https://github.com/Sourya07/klypup"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-all shadow-lg group"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Now live: AI Financial Controller & SEC EDGAR Grounding</span>
            <span className="text-zinc-500">•</span>
            <span className="text-indigo-300 font-semibold group-hover:underline flex items-center gap-1">
              GitHub <ArrowRight className="w-3 h-3" />
            </span>
          </a>
        </div>

        {/* 3. HERO HEADLINE */}
        <div className="relative z-10 max-w-4xl mx-auto text-center mt-6 px-6 space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none drop-shadow-md">
            AI Financial Controller <br />
            <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              at flash speed.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow">
            Sub-second deep SEC 10-K audits, DuPont 3-step ROE decompositions, and multi-company valuation models. No hallucinations, verified GAAP data.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleLaunchApp}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-500/60 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch App (Instant Demo)</span>
            </button>
            <button
              onClick={() => setTerminalOpen(prev => !prev)}
              className="px-5 py-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Open Quant Terminal (`Ctrl + ~`)</span>
            </button>
          </div>

          {/* Sub Tab Switcher Pills with auto-rotating progress animation */}
          <div className="pt-8 flex justify-center">
            <div className="p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 inline-flex items-center space-x-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 8000); // resume auto-rotate after 8s
                    }}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-300 ${
                      isActive 
                        ? 'bg-white text-black shadow-lg scale-105' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{tab === 'trade' ? 'Valuation & Trade' : tab}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. CENTERPIECE INTERACTIVE TERMINAL MOCKUP (AUTO-CHANGING EVERY 3 SECONDS) */}
        <div 
          className="relative z-10 max-w-5xl mx-auto px-6 mt-6 transition-all duration-500"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
            
            {/* Top Bar of the Mockup */}
            <div className="px-5 py-3 bg-zinc-900/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4">
                <span className="font-black tracking-widest text-white uppercase">KLYPUP</span>
                <nav className="hidden sm:flex items-center space-x-3 text-zinc-400 text-[11px]">
                  <span className={activeTab === 'trade' ? 'text-white font-bold' : ''}>Trade</span>
                  <span className={activeTab === 'markets' ? 'text-white font-bold' : ''}>Markets</span>
                  <span className={activeTab === 'portfolio' ? 'text-white font-bold' : ''}>Portfolio</span>
                  <span className={activeTab === 'activity' ? 'text-white font-bold' : ''}>Activity</span>
                </nav>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right font-mono text-[10px]">
                  <span className="text-zinc-500 block uppercase">Workspace AUM</span>
                  <span className="text-white font-bold">$1.4M USDC</span>
                </div>
                <button 
                  onClick={handleLaunchApp}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[11px] transition-colors"
                >
                  Launch App
                </button>
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Sub Status Notice */}
            <div className="px-5 py-1.5 bg-zinc-900/40 border-b border-white/5 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
              <span>Illustrative demo • Real SEC EDGAR GAAP math • Auto-rotating preview (3s)</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Live WebSocket Feed
              </span>
            </div>

            {/* DYNAMIC CONTENT PER ACTIVE TAB */}

            {/* TAB 1: VALUATION & TRADE */}
            {activeTab === 'trade' && (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
                      NASDAQ: NVDA vs S&P 500
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      NVIDIA Corporation — Operating Margin & Revenue Trajectory
                    </h3>
                  </div>

                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-black text-white font-mono">$216.85</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">▲ +1.2% (1D)</span>
                  </div>

                  {/* SVG Chart Preview */}
                  <div className="h-44 w-full bg-zinc-900/60 rounded-xl border border-white/5 p-4 relative overflow-hidden flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <line x1="0" y1="30" x2="400" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="400" y2="90" stroke="#27272a" strokeDasharray="3 3" />
                      <path d="M0,80 Q60,95 120,60 T240,40 T320,50 T400,20" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <path d="M0,100 Q80,75 160,85 T280,65 T360,70 T400,55" fill="none" stroke="#f43f5e" strokeWidth="2" />
                    </svg>
                    <div className="absolute bottom-2 inset-x-4 flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>22 Jul</span>
                      <span>6 Aug</span>
                      <span>21 Aug</span>
                    </div>
                  </div>

                  {/* Sub Prediction Selectors */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button 
                      onClick={() => setTradeType('yes')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        tradeType === 'yes'
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Bullish Expansion</span>
                        <span className="font-mono text-emerald-400">41¢ ▲ +1.2%</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-1">GAAP Net Profit Margin: 55.6%</span>
                    </button>

                    <button 
                      onClick={() => setTradeType('no')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        tradeType === 'no'
                          ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Multiple Compression</span>
                        <span className="font-mono text-rose-400">59¢ ▼ -1.2%</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-1">Valuation Multiple: 34.3x P/E</span>
                    </button>
                  </div>
                </div>

                {/* Right Col: Controller Order & Audit Card */}
                <div className="bg-zinc-900/70 border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Controller Audit
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        95/100 STRONG
                      </span>
                    </div>

                    <div className="space-y-3 pt-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Valuation Multiple Input</span>
                        <div className="mt-1 flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white">
                          <span>25.00</span>
                          <span className="text-xs text-zinc-500">P/E</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-zinc-300 pt-1 font-mono">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500">Latest Revenue:</span>
                          <span className="font-bold text-white">$215.94B</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500">Net Profit Margin:</span>
                          <span className="font-bold text-emerald-400">55.60%</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500">DuPont ROE:</span>
                          <span className="font-bold text-indigo-400">104.2%</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500">SEC Citations:</span>
                          <span className="font-bold text-white">10-K & 10-Q XBRL</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchApp}
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Launch Controller Workspace →</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MARKETS BENCHMARK MATRIX */}
            {activeTab === 'markets' && (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Live Multi-Equity Matrix
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Comparative Financial Multiple & Solvency Benchmarking
                    </h3>
                  </div>

                  <div className="overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-900/60 p-3">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase">
                          <th className="py-2 px-3">Ticker</th>
                          <th className="py-2 px-3">Price</th>
                          <th className="py-2 px-3">P/E Ratio</th>
                          <th className="py-2 px-3">Revenue YoY</th>
                          <th className="py-2 px-3">Net Margin</th>
                          <th className="py-2 px-3">Health</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">NVDA</td>
                          <td className="py-2.5 px-3">$216.85</td>
                          <td className="py-2.5 px-3 text-amber-300">34.3x</td>
                          <td className="py-2.5 px-3 text-emerald-400">+122.4%</td>
                          <td className="py-2.5 px-3 text-emerald-400">55.6%</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">95/100</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">AAPL</td>
                          <td className="py-2.5 px-3">$311.30</td>
                          <td className="py-2.5 px-3">34.2x</td>
                          <td className="py-2.5 px-3 text-emerald-400">+6.4%</td>
                          <td className="py-2.5 px-3 text-emerald-400">26.9%</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">88/100</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">MSFT</td>
                          <td className="py-2.5 px-3">$425.20</td>
                          <td className="py-2.5 px-3">32.1x</td>
                          <td className="py-2.5 px-3 text-emerald-400">+15.2%</td>
                          <td className="py-2.5 px-3 text-emerald-400">35.4%</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">92/100</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">TSLA</td>
                          <td className="py-2.5 px-3">$345.13</td>
                          <td className="py-2.5 px-3 text-rose-400">82.5x</td>
                          <td className="py-2.5 px-3 text-amber-300">+3.1%</td>
                          <td className="py-2.5 px-3 text-amber-300">8.2%</td>
                          <td className="py-2.5 px-3 font-bold text-amber-400">68/100</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-zinc-900/70 border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Market Sentiment
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        78 / 100 BULLISH
                      </span>
                    </div>

                    <div className="space-y-3 pt-3 text-xs text-zinc-300 leading-relaxed">
                      <p>
                        Consensus sentiment scores across audited SEC filings show strong capital expenditure in enterprise AI and semiconductor buildouts.
                      </p>
                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1 text-[11px] font-mono">
                        <div className="text-zinc-400 font-bold uppercase">Sector Leaders:</div>
                        <div className="text-emerald-400">• Semiconductors (NVDA, AMD)</div>
                        <div className="text-indigo-400">• Enterprise Cloud (MSFT, AMZN)</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchApp}
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Compare in Workspace →</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PORTFOLIO & RISK ALLOCATION */}
            {activeTab === 'portfolio' && (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Institutional Portfolio Allocation
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Risk-Weighted Capital & Solvency Exposure Breakdown
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Portfolio NAV</span>
                      <span className="text-xl font-black text-white font-mono mt-1 block">$1,420,500</span>
                      <span className="text-[10px] text-emerald-400 font-bold">▲ +8.4% (30D)</span>
                    </div>
                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Avg Margin</span>
                      <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">34.8%</span>
                      <span className="text-[10px] text-zinc-400">High Quality</span>
                    </div>
                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">DuPont ROE</span>
                      <span className="text-xl font-black text-indigo-400 font-mono mt-1 block">48.2%</span>
                      <span className="text-[10px] text-zinc-400">3-Step Average</span>
                    </div>
                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Risk Rating</span>
                      <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">A+</span>
                      <span className="text-[10px] text-zinc-400">Low Leverage</span>
                    </div>
                  </div>

                  {/* Asset Allocation Stack */}
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-400">
                      <span>Asset Allocation Breakdown</span>
                      <span>100% Verified</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden flex">
                      <div className="bg-indigo-500 h-full" style={{ width: '42%' }} title="AI Infrastructure (42%)" />
                      <div className="bg-emerald-500 h-full" style={{ width: '28%' }} title="Cloud Software (28%)" />
                      <div className="bg-amber-500 h-full" style={{ width: '18%' }} title="Auto/CleanTech (18%)" />
                      <div className="bg-zinc-600 h-full" style={{ width: '12%' }} title="Cash & Yield (12%)" />
                    </div>
                    <div className="flex flex-wrap gap-4 text-[10px] text-zinc-400 font-mono pt-1">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> AI Infra (42%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Cloud SaaS (28%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Auto/Clean (18%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-600" /> Cash (12%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/70 border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Solvency Guard
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        SAFE
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-3 text-xs text-zinc-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Zero unhedged variable debt exposure across top holdings.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Stress-tested against a 200bps interest rate shock scenario.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchApp}
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Watchlist & Portfolio →</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: ACTIVITY & SEC AUDIT LOG */}
            {activeTab === 'activity' && (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Live Autonomous Audit Trail
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Real-Time SEC EDGAR Filings & Gemini 3.6 Synthesis Feed
                    </h3>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {[
                      { time: '12:48:12', ticker: 'NVDA', text: 'Form 10-Q Ingested — GAAP Revenue $215.94B Verified', status: 'COMPLETED' },
                      { time: '12:47:30', ticker: 'META', text: 'DuPont ROE Calculated — 23.1% ROE / 95 Health Score', status: 'COMPLETED' },
                      { time: '12:46:05', ticker: 'AAPL', text: 'Revenue Normalization — $416.16B Verified (data.sec.gov)', status: 'COMPLETED' },
                      { time: '12:44:50', ticker: 'TSLA', text: 'Accrual Anomaly Stress-Test — Operating Cash Conversion Safe', status: 'COMPLETED' },
                    ].map((log, idx) => (
                      <div key={idx} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-zinc-500">{log.time}</span>
                          <span className="px-2 py-0.5 bg-zinc-800 text-white font-bold rounded text-[10px]">{log.ticker}</span>
                          <span className="text-zinc-300 text-[11px]">{log.text}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">✓ {log.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900/70 border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" /> Pipeline Status
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        100% ONLINE
                      </span>
                    </div>

                    <div className="space-y-2 pt-3 text-xs text-zinc-300 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Gemini 3.6 Flash:</span>
                        <span className="text-emerald-400 font-bold">Active (0.2 Temp)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">SEC EDGAR API:</span>
                        <span className="text-emerald-400 font-bold">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Neon Postgres:</span>
                        <span className="text-emerald-400 font-bold">Serverless Pooled</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchApp}
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>View All Research Reports →</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 3. THREE VALUE PILLARS (MATCHING ONYX SCREENSHOT FOOTER CARDS) */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-md space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Ephemeral real-time speed</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Price ticks stream via native Finnhub WebSockets with in-memory RAM caching (15-min TTL) and instant broadcast to connected clients.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-md space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Provable GAAP Solvency</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every balance sheet fact drains to audited SEC EDGAR 10-K concepts — audited down to the line item. No hallucinations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-md space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-1">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Quant Terminal & Copilot</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bloomberg-style quant terminal drawer (<kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[10px]">Ctrl + `</kbd>) and persistent floating Copilot (<kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[10px]">Ctrl + Shift + C</kbd>).
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div className="pt-12 pb-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300">KLYPUP</span>
            <span>•</span>
            <span>AI Investment Research & Finance Controller Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://github.com/Sourya07/klypup" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
            <button onClick={handleLaunchApp} className="hover:text-white transition-colors">
              Launch Workspace
            </button>
          </div>
        </div>
      </div>

      {/* AUTHENTICATION & ACCESS MODAL */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

      {/* QUANT TERMINAL DRAWER */}
      <TerminalDrawer 
        isOpen={terminalOpen} 
        onClose={() => setTerminalOpen(false)} 
      />

    </div>
  );
};
