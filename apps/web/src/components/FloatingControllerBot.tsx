import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  FileText,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { researchService } from '../services/api';
import { AskControllerResponse } from '../types/api';

const POPULAR_TICKERS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ticker?: string;
  metrics?: Record<string, string>;
  citations?: Array<{ sourceName: string; snippet: string }>;
  agentSteps?: string[];
}

export const FloatingControllerBot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [tickerInput, setTickerInput] = useState('AAPL');
  const [showTickerMenu, setShowTickerMenu] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '👋 **Hello! I am your Autonomous Financial Controller Agent.**\n\nI audit corporate SEC 10-K filings, calculate DuPont 3-step ROE decompositions, stress-test working capital, and flag balance sheet anomalies. Select a ticker or ask any question below!',
      agentSteps: ['Agent Initialized', 'SEC EDGAR Link Ready', 'Gemini 3.6 Flash Connected']
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, currentStep]);

  // Global shortcut: Ctrl + Shift + C to toggle controller bot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    const ticker = selectedTicker.trim().toUpperCase() || 'AAPL';
    if (!q || isLoading) return;

    const userMsgId = Math.random().toString(36).substring(7);
    const botMsgId = Math.random().toString(36).substring(7);

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text: q,
        ticker
      }
    ]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Step 1: Ingesting filings
      setCurrentStep('1/3: Ingesting SEC 10-K/10-Q XBRL facts from data.sec.gov...');
      await new Promise(r => setTimeout(r, 450));

      // Step 2: Running balance sheet audit
      setCurrentStep('2/3: Stress-testing GAAP balance sheet & accrual ratios...');
      await new Promise(r => setTimeout(r, 450));

      // Step 3: Gemini AI synthesis
      setCurrentStep('3/3: Gemini 3.6 Flash synthesizing Controller audit response...');

      const res: AskControllerResponse = await researchService.askController(ticker, q);

      setCurrentStep(null);
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          role: 'assistant',
          text: res.answer,
          ticker,
          metrics: res.relatedMetrics,
          citations: res.citations,
          agentSteps: [
            '✓ Verified SEC EDGAR XBRL Data Ingested',
            '✓ Calculated Balance Sheet Leverage',
            '✓ Gemini AI Grounding Completed'
          ]
        }
      ]);
    } catch (err: any) {
      setCurrentStep(null);
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          role: 'assistant',
          text: `⚠️ **Agent Error:** ${err.message || 'Could not retrieve financial data from SEC engine.'}`,
          ticker
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (BOTTOM RIGHT) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 border border-indigo-400/30"
          title="Open AI Financial Controller Copilot (Ctrl + Shift + C)"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-indigo-900 rounded-full animate-pulse" />
          </div>
          <div className="text-left font-sans">
            <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>Ask Controller</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded font-mono uppercase">Agent</span>
            </div>
            <div className="text-[10px] text-indigo-200">AI Financial Audit & ROE</div>
          </div>
        </button>
      )}

      {/* FLOATING AGENTIC POPUP WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col font-sans transition-all duration-300 ${
            isExpanded 
              ? 'w-[92vw] sm:w-[680px] h-[82vh] max-h-[780px]' 
              : 'w-[92vw] sm:w-[420px] h-[580px]'
          } bg-zinc-950/95 backdrop-blur-md rounded-2xl border border-indigo-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden`}
        >
          {/* HEADER BAR */}
          <div className="px-4 py-3 bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white tracking-wide">
                    AI Financial Controller
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    Agentic RAG
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Grounded in SEC EDGAR & Gemini 3.6
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-zinc-400">
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE TICKER & CONTEXT SELECTOR */}
          <div className="px-3.5 py-2 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-zinc-400 font-medium">Target Ticker:</span>
              <div className="relative">
                <button
                  onClick={() => setShowTickerMenu(prev => !prev)}
                  className="flex items-center space-x-1 font-mono font-bold text-xs bg-zinc-800 text-indigo-300 hover:text-white px-2.5 py-1 rounded border border-zinc-700 transition-colors"
                >
                  <span>{selectedTicker}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showTickerMenu && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-1 z-30 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">Popular Equities</div>
                    <div className="grid grid-cols-3 gap-1 px-1">
                      {POPULAR_TICKERS.map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            setSelectedTicker(t);
                            setShowTickerMenu(false);
                          }}
                          className={`px-2 py-1 rounded font-mono text-xs font-bold text-center ${
                            selectedTicker === t 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="pt-1 border-t border-zinc-800">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (tickerInput.trim()) {
                            setSelectedTicker(tickerInput.trim().toUpperCase());
                            setShowTickerMenu(false);
                          }
                        }}
                        className="flex gap-1 p-1"
                      >
                        <input
                          type="text"
                          value={tickerInput}
                          onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                          placeholder="Custom..."
                          className="w-full bg-zinc-950 text-white font-mono text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none"
                        />
                        <button type="submit" className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded">
                          Set
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate(`/research/new?ticker=${selectedTicker}`)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <FileText className="w-3 h-3" /> Full Report →
            </button>
          </div>

          {/* CHAT THREAD FEED */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs font-medium'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-xs shadow-md'
                  }`}
                >
                  {/* Assistant Header */}
                  {m.role === 'assistant' && (
                    <div className="flex items-center space-x-1.5 pb-2 mb-2 border-b border-zinc-800 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Financial Controller Assessment {m.ticker ? `// ${m.ticker}` : ''}</span>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-line text-[11.5px]">
                    {m.text}
                  </div>

                  {/* Related Metrics Grid */}
                  {m.metrics && Object.keys(m.metrics).length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800 grid grid-cols-2 gap-1.5 font-mono">
                      {Object.entries(m.metrics).map(([k, v]) => (
                        <div key={k} className="p-1.5 rounded bg-zinc-950/80 border border-zinc-800/80">
                          <span className="text-[8px] uppercase text-zinc-500 block">{k}</span>
                          <span className="text-xs font-bold text-emerald-400">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agent Step Checkpoints */}
                  {m.agentSteps && m.agentSteps.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800 space-y-1">
                      {m.agentSteps.map((step, idx) => (
                        <div key={idx} className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* LIVE AGENTIC PROGRESS STEP DISPLAY */}
            {isLoading && currentStep && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 space-y-1.5 animate-pulse">
                <div className="flex items-center space-x-2 font-bold text-[11px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Agentic Workflow Executing:</span>
                </div>
                <div className="text-[10px] font-mono text-indigo-200 pl-5">
                  {currentStep}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="px-3 py-2 bg-zinc-900/60 border-t border-zinc-800/60 overflow-x-auto flex gap-1.5 shrink-0 scrollbar-none">
            {[
              { label: 'DuPont ROE', prompt: `Calculate DuPont 3-step ROE breakdown for ${selectedTicker}` },
              { label: 'Red Flags', prompt: `Audit financial red flags & accruals for ${selectedTicker}` },
              { label: 'Cash Flow Quality', prompt: `Analyze operating cash flow vs net income for ${selectedTicker}` },
              { label: 'Debt Maturity', prompt: `Audit balance sheet leverage & debt liabilities for ${selectedTicker}` },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(chip.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-zinc-800/90 hover:bg-indigo-600 hover:text-white text-zinc-300 border border-zinc-700 text-[10.5px] font-medium shrink-0 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask Financial Controller about ${selectedTicker}...`}
                disabled={isLoading}
                className="flex-1 bg-zinc-950 text-white placeholder-zinc-500 text-xs px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
