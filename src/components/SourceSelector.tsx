import React, { useRef, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Video,
  Music,
  Youtube,
  Globe,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Link,
  Sparkles,
} from 'lucide-react';
import { useExtractorStore, SourceType } from '../store/useExtractorStore';

interface SourceTabConfig {
  type: SourceType;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accept?: string;
  description: string;
}

const SOURCE_TABS: SourceTabConfig[] = [
  {
    type: 'pdf',
    label: 'PDF Document',
    badge: 'pdf-parse / File API',
    icon: FileText,
    accept: '.pdf',
    description: 'Tài liệu PDF kỹ thuật số hoặc scan (<20MB trực tiếp / ≥20MB qua Gemini File API).',
  },
  {
    type: 'docx',
    label: 'Word (.docx)',
    badge: 'mammoth',
    icon: FileCode,
    accept: '.docx',
    description: 'Tài liệu văn bản Microsoft Word giữ nguyên cấu trúc phân cấp tiêu đề.',
  },
  {
    type: 'excel',
    label: 'Excel / CSV',
    badge: 'exceljs',
    icon: FileSpreadsheet,
    accept: '.xlsx,.xls,.csv',
    description: 'Bảng tính Excel hoặc tệp CSV, chuyển đổi tự động thành bảng Markdown.',
  },
  {
    type: 'video',
    label: 'Video Clip',
    badge: 'Gemini File API',
    icon: Video,
    accept: '.mp4,.webm,.mov',
    description: 'Video ngắn (MP4, WebM) phân tích đa phương thức hình ảnh và âm thanh trực tiếp.',
  },
  {
    type: 'audio',
    label: 'File Âm thanh',
    badge: 'Gemini Audio',
    icon: Music,
    accept: '.mp3,.wav,.m4a,.aac',
    description: 'Ghi âm cuộc họp, podcast, phỏng vấn (.mp3, .wav, .m4a).',
  },
  {
    type: 'youtube',
    label: 'YouTube Link',
    badge: 'youtube-transcript',
    icon: Youtube,
    description: 'Phụ đề chính thức hoặc auto-generated bóc tách trong 300ms.',
  },
  {
    type: 'web',
    label: 'Web Article',
    badge: 'Readability',
    icon: Globe,
    description: 'Trích xuất bài viết sạch, lọc bỏ 100% navbar, sidebar và quảng cáo rác.',
  },
];

const SAMPLE_YOUTUBE = 'https://www.youtube.com/watch?v=aircAruvnKk'; // 3Blue1Brown Neural Networks
const SAMPLE_WEB = 'https://en.wikipedia.org/wiki/Artificial_intelligence';

export const SourceSelector: React.FC = () => {
  const {
    sourceType,
    setSourceType,
    selectedFile,
    setSelectedFile,
    webUrl,
    setWebUrl,
    youtubeUrl,
    setYoutubeUrl,
    isStreaming,
  } = useExtractorStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTab = SOURCE_TABS.find((t) => t.type === sourceType) || SOURCE_TABS[0];
  const isFileUpload = ['pdf', 'docx', 'excel', 'video', 'audio'].includes(sourceType);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStreaming) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isStreaming) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30">
            1
          </span>
          <h2 className="text-base font-semibold text-slate-100">
            Chọn Nguồn Dữ Liệu Đầu Vào (7 Ingestion Pipelines)
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Hỗ trợ đa phương thức văn bản, bảng tính, video & âm thanh
        </span>
      </div>

      {/* Source Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-5">
        {SOURCE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = sourceType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => {
                if (!isStreaming) {
                  setSourceType(tab.type);
                }
              }}
              disabled={isStreaming}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border text-center relative group ${
                isActive
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:border-slate-700'
              } disabled:opacity-50`}
            >
              <Icon className={`w-5 h-5 mb-1.5 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-xs font-medium line-clamp-1">{tab.label}</span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1 font-mono">
                {tab.badge}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Context / Description */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span>{activeTab.description}</span>
      </div>

      {/* Input Box: File Upload Zone */}
      {isFileUpload && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={activeTab.accept}
            className="hidden"
            disabled={isStreaming}
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99]'
                  : 'border-slate-700/80 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-slate-200 mb-1">
                Kéo thả tệp {activeTab.label} vào đây, hoặc <span className="text-cyan-400 underline">duyệt tệp</span>
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Hỗ trợ định dạng {activeTab.accept} (Tối đa 200MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'file'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                disabled={isStreaming}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                title="Xóa tệp"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input Box: YouTube URL */}
      {sourceType === 'youtube' && (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
              <Youtube className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Dán đường dẫn YouTube (ví dụ: https://www.youtube.com/watch?v=... hoặc shorts)"
              disabled={isStreaming}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm text-slate-100 placeholder-slate-500 transition-all font-mono"
            />
            {youtubeUrl && (
              <button
                onClick={() => setYoutubeUrl('')}
                disabled={isStreaming}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Thử mẫu nhanh:</span>
            <button
              type="button"
              onClick={() => setYoutubeUrl(SAMPLE_YOUTUBE)}
              disabled={isStreaming}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              🎬 3Blue1Brown Neural Networks
            </button>
          </div>
        </div>
      )}

      {/* Input Box: Web Article URL */}
      {sourceType === 'web' && (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <input
              type="url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="Dán đường dẫn bài viết website (ví dụ: https://example.com/article)"
              disabled={isStreaming}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-100 placeholder-slate-500 transition-all font-mono"
            />
            {webUrl && (
              <button
                onClick={() => setWebUrl('')}
                disabled={isStreaming}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Thử mẫu nhanh:</span>
            <button
              type="button"
              onClick={() => setWebUrl(SAMPLE_WEB)}
              disabled={isStreaming}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              🌐 Wikipedia: Artificial Intelligence
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
