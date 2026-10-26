import React from 'react';
import {
  Play,
  Square,
  Zap,
  Clock,
  Coins,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useExtractorStore } from '../store/useExtractorStore';

export const TelemetryBar: React.FC = () => {
  const {
    isStreaming,
    statusMessage,
    errorMessage,
    ttftMs,
    latencyMs,
    tokensEstimated,
    startStream,
    stopStream,
  } = useExtractorStore();

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Start / Stop Button & Error */}
        <div className="flex flex-wrap items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={startStream}
              className="relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt Đầu Trích Xuất Dữ Liệu</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/30 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Dừng Luồng (Stop Stream)</span>
            </button>
          )}

          {/* Current status message / pipeline step */}
          {statusMessage && !errorMessage && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              {isStreaming ? (
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="font-mono">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Right Side: Telemetry Metrics */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Time to First Token (TTFT) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Zap className={`w-4 h-4 ${ttftMs !== null && ttftMs < 500 ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">TTFT Metric</p>
              <p className="font-mono font-semibold text-slate-200">
                {ttftMs !== null ? (
                  <>
                    <span>{ttftMs}ms</span>
                    {ttftMs < 500 && (
                      <span className="ml-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-sans">
                        &lt;500ms⚡
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">-- ms</span>
                )}
              </p>
            </div>
          </div>

          {/* Total Latency */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Latency</p>
              <p className="font-mono font-semibold text-slate-200">
                {latencyMs !== null ? `${latencyMs}ms` : <span className="text-slate-400">-- ms</span>}
              </p>
            </div>
          </div>

          {/* Estimated Tokens */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Coins className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Est. Tokens</p>
              <p className="font-mono font-semibold text-slate-200">
                {tokensEstimated !== null ? (
                  tokensEstimated.toLocaleString()
                ) : (
                  <span className="text-slate-400">--</span>
                )}
              </p>
            </div>
          </div>

          {/* Engine Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Activity className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Status</p>
              <p className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{isStreaming ? 'Streaming...' : 'Ready'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Đã xảy ra lỗi trong quá trình xử lý:</p>
            <p className="mt-0.5 text-rose-200/90 font-mono text-[11px]">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
