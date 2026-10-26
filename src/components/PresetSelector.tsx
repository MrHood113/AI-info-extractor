import React from 'react';
import {
  Lightbulb,
  CheckSquare,
  Binary,
  Briefcase,
  Compass,
  SlidersHorizontal,
  FileCode2,
  Table,
  FileText,
} from 'lucide-react';
import { useExtractorStore, PRESETS, OutputFormat } from '../store/useExtractorStore';

const PRESET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  insights: Lightbulb,
  actions: CheckSquare,
  json_entities: Binary,
  executive: Briefcase,
  swot: Compass,
};

export const PresetSelector: React.FC = () => {
  const {
    presetId,
    setPresetId,
    customPrompt,
    setCustomPrompt,
    outputFormat,
    setOutputFormat,
    isStreaming,
  } = useExtractorStore();

  const formats: { id: OutputFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'markdown', label: 'Markdown', icon: FileText },
    { id: 'table', label: 'Interactive Table', icon: Table },
    { id: 'json', label: 'JSON Schema', icon: FileCode2 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/30">
            2
          </span>
          <h2 className="text-base font-semibold text-slate-100">
            Chọn AI Extraction Preset hoặc Tùy Chỉnh Prompt
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Định dạng đích:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = outputFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setOutputFormat(fmt.id)}
                  disabled={isStreaming}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5 Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {PRESETS.map((preset, index) => {
          const Icon = PRESET_ICONS[preset.id] || SlidersHorizontal;
          const isSelected = presetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                if (!isStreaming) setPresetId(preset.id);
              }}
              disabled={isStreaming}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 relative group ${
                isSelected
                  ? 'bg-indigo-500/10 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-indigo-400 group-hover:text-indigo-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 uppercase">
                  P{index + 1}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                {preset.name}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Prompt Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="text-slate-300 font-medium flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Nội dung Prompt gửi tới Gemini 3.8 Flash:</span>
          </label>
          <span className="text-slate-400 font-mono text-[11px]">
            {customPrompt.length} ký tự
          </span>
        </div>
        <div className="relative">
          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => {
              setCustomPrompt(e.target.value);
              if (presetId !== 'custom') {
                setPresetId('custom');
              }
            }}
            disabled={isStreaming}
            placeholder="Nhập yêu cầu trích xuất chi tiết theo nhu cầu của bạn..."
            className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-y leading-relaxed transition-all font-sans"
          />
        </div>
      </div>
    </div>
  );
};
