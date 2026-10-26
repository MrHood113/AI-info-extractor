import React, { useEffect, useState } from 'react';
import { Sparkles, History, Database, Cpu, ExternalLink, RefreshCw } from 'lucide-react';
import { useExtractorStore } from '../store/useExtractorStore';

export const Navbar: React.FC = () => {
  const { setHistoryModalOpen, resetOutput, isStreaming } = useExtractorStore();
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setDbStatus(data.databaseConnected))
      .catch(() => setDbStatus(false));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                All-in-One AI Extractor
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-source & Multimodal Ingestion Engine
            </p>
          </div>
        </div>

        {/* System Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Model Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Gemini 3.8 Flash</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              2M Context
            </span>
          </div>

          {/* Database Flyway status */}
          <div
            title={dbStatus ? 'PostgreSQL (Flyway Migrations Active)' : 'In-Memory Fallback Active'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-400"
          >
            <Database className={`w-3.5 h-3.5 ${dbStatus ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden lg:inline text-[11px]">
              {dbStatus ? 'PostgreSQL' : 'Memory DB'}
            </span>
          </div>

          {/* Reset button */}
          <button
            onClick={resetOutput}
            disabled={isStreaming}
            title="Reset Output"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* History drawer button */}
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>History</span>
          </button>
        </div>
      </div>
    </header>
  );
};
