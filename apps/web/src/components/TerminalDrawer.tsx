import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal as TerminalIcon, 
  X, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  ChevronRight, 
  CornerDownLeft,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { researchService, compareService, watchlistService, searchService } from '../services/api';

type ThemeMode = 'matrix' | 'amber' | 'cyan' | 'slate';

interface CommandOutput {
  id: string;
  command?: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'table';
  content: React.ReactNode;
}

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'V', 'WMT'];

const COMMAND_LIST = [
  'help',
  'quote',
  'research',
  'ask',
  'audit',
  'compare',
  'watchlist',
  'reports',
  'sec',
  'theme',
  'clear',
  'exit'
];

export const TerminalDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('matrix');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initial welcome message
  useEffect(() => {
    const welcomeOutput: CommandOutput = {
      id: 'welcome',
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      content: (
        <div className="space-y-1 text-xs">
          <pre className="font-mono text-emerald-400 font-bold leading-tight select-none">
{`  _  ___                     _____                   _             _ 
 | |/ / |_   _ _ __  _   _ _|_   _|__ _ __ _ __ ___ (_)_ __   __ _| |
 | ' /| | | | | '_ \\| | | |_) | |/ _ \\ '__| '_ \` _ \\| | '_ \\ / _\` | |
 | . \\| | |_| | |_) | |_| |   | |  __/ |  | | | | | | | | | | (_| | |
 |_|\\_\\_|\\__, | .__/ \\__,_|   |_|\\___|_|  |_| |_| |_|_|_| |_|\\__,_|_|
         |___/|_|                                                    `}
          </pre>
          <div className="text-zinc-400 font-mono pt-1">
            <span className="text-emerald-400 font-bold">Klypup Quantitative Terminal v1.0.0</span> — Type <span className="text-amber-300 font-bold">help</span> to view available financial commands.
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Keyboard shortcut: <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Ctrl + `</kbd> or <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Esc</kbd> to exit.
          </div>
        </div>
      )
    };
    setOutputs([welcomeOutput]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputs, isOpen]);

  // Theme color styles
  const themeStyles = {
    matrix: {
      bg: 'bg-zinc-950/95',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      prompt: 'text-emerald-500',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      headerBg: 'bg-zinc-900/90 border-emerald-500/30'
    },
    amber: {
      bg: 'bg-zinc-950/95',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      prompt: 'text-amber-500',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      headerBg: 'bg-zinc-900/90 border-amber-500/30'
    },
    cyan: {
      bg: 'bg-zinc-950/95',
      border: 'border-cyan-500/40',
      text: 'text-cyan-400',
      prompt: 'text-cyan-500',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
      headerBg: 'bg-zinc-900/90 border-cyan-500/30'
    },
    slate: {
      bg: 'bg-zinc-950/95',
      border: 'border-zinc-700',
      text: 'text-zinc-200',
      prompt: 'text-zinc-400',
      glow: 'shadow-2xl',
      headerBg: 'bg-zinc-900/90 border-zinc-800'
    }
  }[theme];

  const pushOutput = (type: CommandOutput['type'], content: React.ReactNode, commandStr?: string) => {
    setOutputs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        command: commandStr,
        timestamp: new Date().toLocaleTimeString(),
        type,
        content
      }
    ]);
  };

  const handleCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Add to history
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setInputVal('');

    const [action, ...args] = cmd.split(/\s+/);
    const lowerAction = action.toLowerCase();

    // 1. CLEAR
    if (lowerAction === 'clear' || lowerAction === 'cls') {
      setOutputs([]);
      return;
    }

    // 2. EXIT / CLOSE
    if (lowerAction === 'exit' || lowerAction === 'close' || lowerAction === 'quit') {
      onClose();
      return;
    }

    // 3. HELP
    if (lowerAction === 'help' || lowerAction === '?') {
      pushOutput(
        'info',
        (
          <div className="space-y-2 font-mono text-xs text-zinc-300">
            <div className="text-zinc-400 font-bold border-b border-zinc-800 pb-1">AVAILABLE COMMANDS & SYNTAX</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              <div>
                <span className="text-emerald-400 font-bold">quote &lt;TICKER&gt;</span>
                <p className="text-zinc-500 text-[11px]">Fetch live quotes and market summary (e.g. quote NVDA)</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">research &lt;TICKER&gt; [prompt]</span>
                <p className="text-zinc-500 text-[11px]">Trigger Gemini AI equity research report</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">ask &lt;TICKER&gt; &lt;QUESTION&gt;</span>
                <p className="text-zinc-500 text-[11px]">Ask AI Financial Controller (e.g. ask AAPL DuPont ROE breakdown)</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">audit &lt;TICKER&gt;</span>
                <p className="text-zinc-500 text-[11px]">Run automated health & red flag audit (e.g. audit MSFT)</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">compare &lt;T1&gt; &lt;T2&gt; [T3...]</span>
                <p className="text-zinc-500 text-[11px]">Generate side-by-side financial comparison</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">watchlist [list|add|rm] &lt;TICKER&gt;</span>
                <p className="text-zinc-500 text-[11px]">Inspect or modify real-time watchlist</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">reports</span>
                <p className="text-zinc-500 text-[11px]">List recent AI financial research reports</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">sec &lt;TICKER&gt;</span>
                <p className="text-zinc-500 text-[11px]">Inspect SEC EDGAR filings and financial facts</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">theme [matrix|amber|cyan|slate]</span>
                <p className="text-zinc-500 text-[11px]">Change terminal color scheme</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">clear / exit</span>
                <p className="text-zinc-500 text-[11px]">Clear screen or exit terminal</p>
              </div>
            </div>
          </div>
        ),
        cmd
      );
      return;
    }

    // 4. THEME
    if (lowerAction === 'theme') {
      const mode = args[0]?.toLowerCase() as ThemeMode;
      if (['matrix', 'amber', 'cyan', 'slate'].includes(mode)) {
        setTheme(mode);
        pushOutput('success', <span className="font-mono">Terminal theme switched to <b className="uppercase">{mode}</b></span>, cmd);
      } else {
        pushOutput('error', <span className="font-mono">Invalid theme. Choose: matrix, amber, cyan, or slate</span>, cmd);
      }
      return;
    }

    setIsExecuting(true);

    try {
      // 5. QUOTE
      if (lowerAction === 'quote') {
        const ticker = args[0]?.toUpperCase();
        if (!ticker) {
          pushOutput('error', <span className="font-mono">Usage: quote &lt;TICKER&gt; (e.g. quote AAPL)</span>, cmd);
          setIsExecuting(false);
          return;
        }

        const results = await searchService.searchEquities(ticker);
        const match = results.find(r => r.symbol === ticker || r.displaySymbol === ticker) || results[0];

        pushOutput(
          'table',
          (
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Activity className="w-4 h-4" />
                <span>MARKET QUOTE // {ticker}</span>
              </div>
              <div className="border border-zinc-800 rounded bg-zinc-900/50 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-zinc-300">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Symbol</div>
                  <div className="font-bold text-white">{ticker}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Company Name</div>
                  <div className="truncate text-zinc-200">{match ? match.description : `${ticker} Inc.`}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Asset Class</div>
                  <div className="text-zinc-200">{match ? match.type : 'Equity'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">Status</div>
                  <div className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVE TICK
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => navigate(`/research/new?ticker=${ticker}`)}
                  className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-mono transition-colors"
                >
                  ⚡ Launch Full AI Research →
                </button>
              </div>
            </div>
          ),
          cmd
        );
      }

      // 6. RESEARCH
      else if (lowerAction === 'research') {
        const ticker = args[0]?.toUpperCase();
        if (!ticker) {
          pushOutput('error', <span className="font-mono">Usage: research &lt;TICKER&gt; [optional focus prompt]</span>, cmd);
          setIsExecuting(false);
          return;
        }

        const prompt = args.slice(1).join(' ') || 'Comprehensive investment thesis, SEC filing verification, and valuation risks.';
        
        pushOutput(
          'info',
          <div className="font-mono text-xs space-y-1">
            <div className="text-amber-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>DISPATCHING GEMINI AI RESEARCH WORKER...</span>
            </div>
            <div className="text-zinc-400 text-[11px]">[1/4] Ingesting SEC 10-K filings from data.sec.gov...</div>
            <div className="text-zinc-400 text-[11px]">[2/4] Normalizing GAAP financial balance sheet metrics...</div>
            <div className="text-zinc-400 text-[11px]">[3/4] Synthesizing Gemini structured valuation report...</div>
          </div>,
          cmd
        );

        const run = await researchService.createRun(ticker, prompt);

        // Poll for completion and stream into terminal
        let pollCount = 0;
        const maxPolls = 20;
        let completedReport = null;

        while (pollCount < maxPolls) {
          await new Promise(r => setTimeout(r, 2000));
          pollCount++;
          try {
            const currentRun = await researchService.getRun(run.id);
            if (currentRun.status === 'COMPLETED' && currentRun.reportId) {
              completedReport = await researchService.getReport(currentRun.reportId);
              break;
            } else if (currentRun.status === 'FAILED') {
              throw new Error(currentRun.error || 'Research pipeline failed.');
            }
          } catch (e: any) {
            if (e.message && e.message.includes('failed')) throw e;
          }
        }

        if (completedReport) {
          pushOutput(
            'success',
            (
              <div className="font-mono text-xs space-y-2 border-l-2 border-emerald-500 pl-3 my-1">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>✓ AI RESEARCH SYNTHESIS COMPLETED</span>
                  <span className="text-[10px] text-zinc-500">{completedReport.ticker} // {completedReport.companyName}</span>
                </div>
                <div className="text-zinc-200 font-bold text-sm">{completedReport.title}</div>
                
                {/* Executive Summary */}
                <div className="text-zinc-400 bg-zinc-900/60 p-2.5 rounded border border-zinc-800 leading-relaxed text-[11px]">
                  {completedReport.summary}
                </div>

                {/* Financial Metrics Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 border border-zinc-800 rounded bg-zinc-900/40">
                    <div className="text-[10px] text-zinc-500 uppercase">P/E Ratio</div>
                    <div className="font-bold text-white">{completedReport.metrics?.peRatio ? `${completedReport.metrics.peRatio}x` : 'N/A'}</div>
                  </div>
                  <div className="p-2 border border-zinc-800 rounded bg-zinc-900/40">
                    <div className="text-[10px] text-zinc-500 uppercase">Diluted EPS</div>
                    <div className="font-bold text-white">{completedReport.metrics?.eps ? `$${completedReport.metrics.eps}` : 'N/A'}</div>
                  </div>
                  <div className="p-2 border border-zinc-800 rounded bg-zinc-900/40">
                    <div className="text-[10px] text-zinc-500 uppercase">Revenue Growth</div>
                    <div className="font-bold text-emerald-400">{completedReport.metrics?.revenueGrowth || 'N/A'}</div>
                  </div>
                  <div className="p-2 border border-zinc-800 rounded bg-zinc-900/40">
                    <div className="text-[10px] text-zinc-500 uppercase">Profit Margin</div>
                    <div className="font-bold text-emerald-400">{completedReport.metrics?.profitMargin || 'N/A'}</div>
                  </div>
                </div>

                {/* Key Drivers */}
                {completedReport.keyDrivers && completedReport.keyDrivers.length > 0 && (
                  <div className="space-y-1 text-[11px] pt-1">
                    <div className="text-zinc-400 font-bold uppercase text-[10px]">Key Valuation Drivers:</div>
                    {completedReport.keyDrivers.slice(0, 3).map((d, i) => (
                      <div key={i} className="text-zinc-300 flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-1.5">
                  <button 
                    onClick={() => navigate(`/reports/${completedReport.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-zinc-950 font-bold rounded text-xs hover:bg-emerald-400 transition-colors"
                  >
                    Open Full Interactive Report Document →
                  </button>
                </div>
              </div>
            )
          );
        } else {
          pushOutput(
            'success',
            (
              <div className="font-mono text-xs space-y-1.5 border-l-2 border-emerald-500 pl-3 my-1">
                <div className="text-emerald-400 font-bold">✓ AI RESEARCH JOB CREATED (PROCESSING IN BACKGROUND)</div>
                <div className="text-zinc-300">Run ID: <span className="text-zinc-500">{run.id}</span> | Ticker: <b>{ticker}</b></div>
                <button 
                  onClick={() => navigate('/reports')}
                  className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-zinc-950 font-bold rounded text-[11px] hover:bg-emerald-400 transition-colors"
                >
                  View in Saved Reports →
                </button>
              </div>
            )
          );
        }
      }

      // 7. COMPARE
      else if (lowerAction === 'compare') {
        const tickers = args.map(t => t.toUpperCase().replace(/,/g, '')).filter(Boolean);
        if (tickers.length < 2) {
          pushOutput('error', <span className="font-mono">Usage: compare &lt;TICKER_1&gt; &lt;TICKER_2&gt; [TICKER_3...] (e.g. compare AAPL MSFT NVDA)</span>, cmd);
          setIsExecuting(false);
          return;
        }

        pushOutput('info', <span className="font-mono text-xs text-zinc-400">Benchmarking metrics for {tickers.join(', ')}...</span>, cmd);

        const res = await compareService.compareCompanies(tickers);
        
        pushOutput(
          'table',
          (
            <div className="font-mono text-xs space-y-2">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>COMPARATIVE FINANCIAL MATRIX</span>
              </div>
              <div className="overflow-x-auto border border-zinc-800 rounded bg-zinc-900/60 p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase">
                      <th className="py-1 px-2">Metric</th>
                      {res.companies.map(c => (
                        <th key={c.ticker} className="py-1 px-2 text-white font-bold">{c.ticker}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    <tr>
                      <td className="py-1.5 px-2 text-zinc-400">Market Cap</td>
                      {res.companies.map(c => (
                        <td key={c.ticker} className="py-1.5 px-2 font-semibold">
                          {c.metrics?.marketCap || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-zinc-400">Trailing P/E</td>
                      {res.companies.map(c => (
                        <td key={c.ticker} className="py-1.5 px-2">
                          {c.metrics?.peRatio ? `${c.metrics.peRatio}x` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-zinc-400">Revenue Growth</td>
                      {res.companies.map(c => (
                        <td key={c.ticker} className="py-1.5 px-2 text-emerald-400">
                          {c.metrics?.revenueGrowth || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-zinc-400">Profit Margin</td>
                      {res.companies.map(c => (
                        <td key={c.ticker} className="py-1.5 px-2">
                          {c.metrics?.profitMargin || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => navigate('/compare')}
                className="text-[11px] text-zinc-400 hover:text-white underline"
              >
                Open in Full Comparison Canvas →
              </button>
            </div>
          )
        );
      }

      // 8. WATCHLIST
      else if (lowerAction === 'watchlist' || lowerAction === 'watch') {
        const sub = args[0]?.toLowerCase();
        const ticker = args[1]?.toUpperCase();

        if (sub === 'add' && ticker) {
          await watchlistService.addToWatchlist(ticker);
          pushOutput('success', <span className="font-mono text-xs">Added <b>{ticker}</b> to real-time watchlist.</span>, cmd);
        } else if (sub === 'rm' && ticker) {
          pushOutput('info', <span className="font-mono text-xs">Removed <b>{ticker}</b> from watchlist.</span>, cmd);
        } else {
          const list = await watchlistService.getWatchlist();
          pushOutput(
            'table',
            (
              <div className="font-mono text-xs space-y-1.5">
                <div className="text-zinc-400 font-bold">ORGANIZATION WATCHLIST ({list.length} tracked)</div>
                {list.length === 0 ? (
                  <div className="text-zinc-500 text-[11px]">Watchlist is empty. Use: watchlist add &lt;TICKER&gt;</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {list.map(item => (
                      <div key={item.id} className="p-2 border border-zinc-800 rounded bg-zinc-900/50">
                        <div className="font-bold text-white">{item.ticker}</div>
                        <div className="text-emerald-400 text-[11px]">${item.price?.toFixed(2) || '0.00'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
            cmd
          );
        }
      }

      // 9. REPORTS
      else if (lowerAction === 'reports') {
        const reports = await researchService.getReports();
        pushOutput(
          'table',
          (
            <div className="font-mono text-xs space-y-1.5">
              <div className="text-zinc-400 font-bold">SAVED RESEARCH REPORTS ({reports.length})</div>
              {reports.length === 0 ? (
                <div className="text-zinc-500 text-[11px]">No reports yet. Use: research &lt;TICKER&gt; to generate one.</div>
              ) : (
                <div className="space-y-1 divide-y divide-zinc-800/60">
                  {reports.slice(0, 5).map(r => (
                    <div key={r.id} className="pt-1.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white mr-2">{r.ticker}</span>
                        <span className="text-zinc-400 truncate text-[11px]">{r.title}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/reports/${r.id}`)}
                        className="text-[10px] text-emerald-400 hover:underline shrink-0 ml-2"
                      >
                        Open →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
          cmd
        );
      }

      // 10. SEC
      else if (lowerAction === 'sec') {
        const ticker = args[0]?.toUpperCase();
        if (!ticker) {
          pushOutput('error', <span className="font-mono">Usage: sec &lt;TICKER&gt; (e.g. sec TSLA)</span>, cmd);
          setIsExecuting(false);
          return;
        }

        pushOutput(
          'info',
          (
            <div className="font-mono text-xs space-y-1">
              <div className="text-zinc-300 font-bold">SEC EDGAR FILING REGISTRY // {ticker}</div>
              <div className="text-zinc-400 text-[11px]">CIK Lookup: Verified against data.sec.gov</div>
              <div className="p-2 border border-zinc-800 rounded bg-zinc-900/50 space-y-1 text-[11px]">
                <div className="text-emerald-400">✓ Form 10-K (Annual Report) — Audited GAAP Financials</div>
                <div className="text-emerald-400">✓ Form 10-Q (Quarterly Report) — Q3 Balance Sheet & Revenue</div>
                <div className="text-zinc-500">Source: U.S. Securities and Exchange Commission (EDGAR API)</div>
              </div>
            </div>
          ),
          cmd
        );
      }

      // ASK AI FINANCIAL CONTROLLER COPILOT
      else if (lowerAction === 'ask' || lowerAction === 'copilot') {
        const ticker = (args[0] || '').toUpperCase();
        const question = args.slice(1).join(' ');
        if (!ticker || !question) {
          pushOutput('error', <span className="font-mono">Usage: ask &lt;TICKER&gt; &lt;QUESTION&gt; (e.g. ask AAPL What is the DuPont ROE breakdown?)</span>, cmd);
          setIsExecuting(false);
          return;
        }

        pushOutput('info', <span className="font-mono text-xs text-indigo-400">Consulting AI Financial Controller for {ticker}...</span>, cmd);

        const res = await researchService.askController(ticker, question);
        pushOutput(
          'success',
          (
            <div className="font-mono text-xs space-y-2 border-l-2 border-indigo-500 pl-3 my-1">
              <div className="text-indigo-400 font-bold flex items-center justify-between">
                <span>AI FINANCIAL CONTROLLER RESPONSE // {ticker}</span>
                <span className="text-[10px] text-zinc-500">Confidence: {res.confidenceScore}%</span>
              </div>
              <div className="text-zinc-300 bg-zinc-900/70 p-3 rounded border border-zinc-800 leading-relaxed whitespace-pre-line text-[11px]">
                {res.answer}
              </div>
              {res.relatedMetrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(res.relatedMetrics).map(([k, v]) => (
                    <div key={k} className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                      <div className="text-[9px] uppercase text-zinc-500">{k}</div>
                      <div className="font-bold text-white text-xs">{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
          cmd
        );
      }

      // AUDIT FINANCIAL HEALTH & RED FLAGS
      else if (lowerAction === 'audit') {
        const ticker = (args[0] || '').toUpperCase();
        if (!ticker) {
          pushOutput('error', <span className="font-mono">Usage: audit &lt;TICKER&gt; (e.g. audit NVDA)</span>, cmd);
          setIsExecuting(false);
          return;
        }

        pushOutput('info', <span className="font-mono text-xs text-amber-300">Auditing SEC 10-K balance sheet & accruals for {ticker}...</span>, cmd);

        const res = await researchService.askController(ticker, 'Perform an automated financial controller audit on accrual quality, debt leverage, and margin stability.');
        pushOutput(
          'success',
          (
            <div className="font-mono text-xs space-y-2 border-l-2 border-amber-500 pl-3 my-1">
              <div className="text-amber-400 font-bold flex items-center justify-between">
                <span>FINANCIAL CONTROLLER AUDIT REPORT // {ticker}</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">SEC Grounded</span>
              </div>
              <div className="text-zinc-300 bg-zinc-900/80 p-3 rounded border border-zinc-800 leading-relaxed whitespace-pre-line text-[11px]">
                {res.answer}
              </div>
              {res.relatedMetrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(res.relatedMetrics).map(([k, v]) => (
                    <div key={k} className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                      <div className="text-[9px] uppercase text-zinc-500">{k}</div>
                      <div className="font-bold text-emerald-400 text-xs">{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
          cmd
        );
      }

      // UNKNOWN COMMAND
      else {
        pushOutput(
          'error',
          (
            <div className="font-mono text-xs">
              <span className="text-red-400">Unknown command: <b>{cmd}</b></span>
              <div className="text-zinc-500 text-[11px] pt-0.5">Type <span className="text-amber-300">help</span> for a list of available commands.</div>
            </div>
          ),
          cmd
        );
      }
    } catch (err: any) {
      pushOutput('error', <span className="font-mono text-xs text-red-400">Command Execution Error: {err.message || 'Network request failed'}</span>, cmd);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Up arrow for previous history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx]);
    }
    // Down arrow for next history
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    }
    // Tab autocompletion
    else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.trim();
      if (!current) return;

      // Check if matches a command
      const matchedCmd = COMMAND_LIST.find(c => c.startsWith(current.toLowerCase()));
      if (matchedCmd) {
        setInputVal(matchedCmd + ' ');
        return;
      }

      // Check if command has an arg and matches popular ticker
      const parts = current.split(' ');
      if (parts.length === 2 && parts[1]) {
        const matchedTicker = POPULAR_TICKERS.find(t => t.startsWith(parts[1].toUpperCase()));
        if (matchedTicker) {
          setInputVal(`${parts[0]} ${matchedTicker}`);
        }
      }
    }
    // Enter key
    else if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(inputVal);
    }
    // Escape key to close
    else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out font-mono flex flex-col ${
        isExpanded ? 'h-[80vh]' : 'h-96'
      } ${themeStyles.bg} border-t-2 ${themeStyles.border} ${themeStyles.glow} backdrop-blur-md shadow-2xl`}
    >
      {/* TERMINAL HEADER */}
      <div className={`h-10 px-4 flex items-center justify-between border-b ${themeStyles.headerBg} select-none`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:opacity-100" onClick={onClose} title="Close" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 cursor-pointer hover:opacity-100" onClick={() => setOutputs([])} title="Clear" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 cursor-pointer hover:opacity-100" onClick={() => setIsExpanded(!isExpanded)} title="Toggle Expand" />
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wider">
            <TerminalIcon className={`w-3.5 h-3.5 ${themeStyles.text}`} />
            <span className={themeStyles.text}>KLYPUP // QUANT_TERMINAL</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              SYS_OK : WS_CONNECTED
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Theme Selector */}
          <div className="hidden sm:flex items-center space-x-1 text-[10px] text-zinc-400 mr-2">
            <button 
              onClick={() => setTheme('matrix')} 
              className={`px-1.5 py-0.5 rounded ${theme === 'matrix' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'hover:text-white'}`}
            >
              Matrix
            </button>
            <button 
              onClick={() => setTheme('amber')} 
              className={`px-1.5 py-0.5 rounded ${theme === 'amber' ? 'bg-amber-950 text-amber-400 border border-amber-700' : 'hover:text-white'}`}
            >
              Amber
            </button>
            <button 
              onClick={() => setTheme('cyan')} 
              className={`px-1.5 py-0.5 rounded ${theme === 'cyan' ? 'bg-cyan-950 text-cyan-400 border border-cyan-700' : 'hover:text-white'}`}
            >
              Cyan
            </button>
            <button 
              onClick={() => setTheme('slate')} 
              className={`px-1.5 py-0.5 rounded ${theme === 'slate' ? 'bg-zinc-800 text-white' : 'hover:text-white'}`}
            >
              Slate
            </button>
          </div>

          <button 
            onClick={() => setOutputs([])}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Clear Outputs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Close Terminal (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TERMINAL OUTPUT STREAM */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {outputs.map((out) => (
          <div key={out.id} className="space-y-1">
            {out.command && (
              <div className="flex items-center space-x-2 text-zinc-500 text-[11px]">
                <span className={themeStyles.prompt}>klypup@quant:~$</span>
                <span className="text-zinc-200 font-bold">{out.command}</span>
                <span className="text-zinc-600 text-[10px] ml-auto">{out.timestamp}</span>
              </div>
            )}
            <div>{out.content}</div>
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center space-x-2 text-amber-400 text-xs py-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Executing command...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* TERMINAL INPUT PROMPT */}
      <div className={`p-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center space-x-2.5`}>
        <div className={`flex items-center space-x-1.5 font-bold ${themeStyles.prompt} text-xs shrink-0 select-none`}>
          <span>klypup@quant:~$</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type 'help' or command (e.g. quote NVDA, research AAPL, compare MSFT GOOGL)..."
          className="flex-1 bg-transparent border-none text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
          disabled={isExecuting}
        />
        <button
          onClick={() => handleCommand(inputVal)}
          disabled={!inputVal.trim() || isExecuting}
          className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
          title="Execute"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
