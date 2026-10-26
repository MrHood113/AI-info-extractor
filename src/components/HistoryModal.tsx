import React, { useEffect, useState } from 'react';
import {
  X,
  History,
  Clock,
  Trash2,
  ExternalLink,
  Coins,
  Zap,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useExtractorStore, HistoryItem } from '../store/useExtractorStore';

export const HistoryModal: React.FC = () => {
  const { historyModalOpen, setHistoryModalOpen, loadFromHistory } = useExtractorStore();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history?limit=30');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (historyModalOpen) {
      fetchHistory();
    }
  }, [historyModalOpen]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  if (!historyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md sm:max-w-lg bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Lịch Sử Trích Xuất (PostgreSQL Records)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              title="Làm mới danh sách"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
              <History className="w-8 h-8 mb-2 text-slate-700" />
              <p className="text-xs text-slate-400">Chưa có lịch sử trích xuất nào được ghi lại.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.sourceType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Xóa bản ghi"
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                  {item.sourceName}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2 font-sans">
                  {item.prompt}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                  <span>Preset: {item.presetId}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 flex items-center gap-0.5">
                      <Zap className="w-3 h-3" />
                      {item.latencyMs}ms
                    </span>
                    {item.tokensUsed && (
                      <span className="text-indigo-400 flex items-center gap-0.5">
                        <Coins className="w-3 h-3" />
                        {item.tokensUsed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
