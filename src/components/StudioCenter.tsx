import React, { useRef, useState, useMemo } from 'react';
import {
  FileText,
  Edit3,
  Link2,
  HardDrive,
  FolderOpen,
  Music,
  Image as ImageIcon,
  Youtube,
  UploadCloud,
  X,
  Sparkles,
  Square,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Search,
  ArrowUpDown,
  FileDown,
  Terminal,
  HelpCircle,
  Zap,
  Clock,
  Coins,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useExtractorStore, IngestionTab, OutputFormat } from '../store/useExtractorStore';
import { translations } from '../utils/i18n';

interface TabItem {
  id: IngestionTab;
  labelKey: keyof typeof translations.en;
  icon: React.ComponentType<{ className?: string }>;
}

export const StudioCenter: React.FC = () => {
  const {
    language,
    sourceTab,
    setSourceTab,
    selectedFile,
    setSelectedFile,
    rawText,
    setRawText,
    webUrl,
    setWebUrl,
    youtubeUrl,
    setYoutubeUrl,
    isStreaming,
    statusMessage,
    errorMessage,
    outputText,
    ttftMs,
    latencyMs,
    tokensEstimated,
    activeResultTab,
    setActiveResultTab,
    startStream,
    stopStream,
  } = useExtractorStore();

  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // State for interactive quiz question answers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const row1Tabs: TabItem[] = [
    { id: 'file', labelKey: 'tabFile', icon: FileText },
    { id: 'text', labelKey: 'tabText', icon: Edit3 },
    { id: 'link', labelKey: 'tabLink', icon: Link2 },
    { id: 'drive', labelKey: 'tabDrive', icon: HardDrive },
  ];

  const row2Tabs: TabItem[] = [
    { id: 'material', labelKey: 'tabMaterial', icon: FolderOpen },
    { id: 'media', labelKey: 'tabMedia', icon: Music },
    { id: 'image', labelKey: 'tabImage', icon: ImageIcon },
    { id: 'youtube', labelKey: 'tabYoutube', icon: Youtube },
  ];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isStreaming) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'json') => {
    if (!outputText) return;
    const blob = new Blob([outputText], {
      type: format === 'json' ? 'application/json' : 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manabi-quiz-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse questions from Markdown output for Interactive Quiz View
  const parsedQuiz = useMemo(() => {
    if (!outputText) return [];
    const questions: {
      number: number;
      question: string;
      options: { key: string; text: string }[];
      correctAnswer?: string;
      explanation?: string;
    }[] = [];

    // Match questions like "### Câu 1: ..." or "Question 1: ..."
    const questionBlocks = outputText.split(/(?=###?\s*(?:Câu|Question|\d+[\.\:]))/i);

    questionBlocks.forEach((block, idx) => {
      if (!block.trim()) return;
      const lines = block.trim().split('\n');
      const titleLine = lines[0].replace(/^###?\s*/, '').trim();

      const options: { key: string; text: string }[] = [];
      let correctAnswer = '';
      let explanation = '';

      lines.slice(1).forEach((line) => {
        const optionMatch = line.match(/^[-*]?\s*([A-D])[\.\:\)]\s*(.+)/i);
        if (optionMatch) {
          options.push({ key: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() });
        }
        const answerMatch = line.match(/(?:Đáp án đúng|Correct Answer)[\*\:]*\s*([A-D])/i);
        if (answerMatch) {
          correctAnswer = answerMatch[1].toUpperCase();
        }
        const expMatch = line.match(/(?:Giải thích|Explanation)[\*\:]*\s*(.+)/i);
        if (expMatch) {
          explanation = expMatch[1].trim();
        }
      });

      if (options.length >= 2 || titleLine.length > 10) {
        questions.push({
          number: idx + 1,
          question: titleLine,
          options,
          correctAnswer: correctAnswer || (options[0] ? options[0].key : undefined),
          explanation: explanation || 'Dựa trên phân tích tài liệu học tập bởi Gemini 3.8 Flash.',
        });
      }
    });

    return questions;
  }, [outputText]);

  // Parse tables for Table View
  const parsedTable = useMemo(() => {
    if (!outputText) return null;
    const lines = outputText.split('\n');
    const tableLines = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
    if (tableLines.length >= 3) {
      const parseLine = (line: string) =>
        line
          .trim()
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
      const headers = parseLine(tableLines[0]);
      const rows = tableLines.slice(2).map(parseLine);
      return { headers, rows };
    }
    return null;
  }, [outputText]);

  const filteredTableRows = useMemo(() => {
    if (!parsedTable) return [];
    let rows = parsedTable.rows;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      rows = rows.filter((r) => r.some((c) => c.toLowerCase().includes(q)));
    }
    if (sortCol !== null) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortCol] || '';
        const valB = b[sortCol] || '';
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return rows;
  }, [parsedTable, tableSearch, sortCol, sortAsc]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
          {t.generateQuizTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          {t.generateQuizSubtitle}
        </p>
      </div>

      {/* 8 Tab Ingestion Grid (Matches Image Layout!) */}
      <div className="space-y-2">
        {/* Row 1: File, Text, Link, Drive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {row1Tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = sourceTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSourceTab(tab.id)}
                disabled={isStreaming}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'accent-pill-active shadow-xs' : 'accent-pill-inactive'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t[tab.labelKey] as string}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Material, Media, Image, YouTube */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {row2Tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = sourceTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSourceTab(tab.id)}
                disabled={isStreaming}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'accent-pill-active shadow-xs' : 'accent-pill-inactive'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t[tab.labelKey] as string}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Drag & Drop Zone / Input Box */}
      <div className="custom-card rounded-2xl p-6 sm:p-8">
        {['file', 'drive', 'material', 'media', 'image'].includes(sourceTab) && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              disabled={isStreaming}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent)] rounded-2xl p-10 sm:p-14 text-center cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] transition-all flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">
                  {t.dropOrSelect}
                </h3>
                <p className="text-xs text-[var(--text-subtle)]">
                  {t.supportedFiles}
                </p>
                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5 font-medium">
                  {t.maxSizeNotice}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs uppercase">
                    {selectedFile.name.split('.').pop() || 'file'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-main)]">{selectedFile.name}</p>
                    <p className="text-[11px] text-[var(--text-subtle)] font-mono">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={isStreaming}
                  className="p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text Input Mode */}
        {sourceTab === 'text' && (
          <div className="space-y-2">
            <textarea
              rows={6}
              value={rawText}
              disabled={isStreaming}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={t.enterTextPlaceholder}
              className="w-full p-4 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed"
            />
          </div>
        )}

        {/* Web Link Mode */}
        {sourceTab === 'link' && (
          <div className="space-y-3">
            <input
              type="url"
              value={webUrl}
              disabled={isStreaming}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder={t.pasteUrlPlaceholder}
              className="w-full px-4 py-3 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-subtle)]">Thử mẫu:</span>
              <button
                type="button"
                onClick={() => setWebUrl('https://en.wikipedia.org/wiki/Artificial_intelligence')}
                disabled={isStreaming}
                className="px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors font-medium"
              >
                🌐 Wikipedia: Artificial Intelligence
              </button>
            </div>
          </div>
        )}

        {/* YouTube Link Mode */}
        {sourceTab === 'youtube' && (
          <div className="space-y-3">
            <input
              type="text"
              value={youtubeUrl}
              disabled={isStreaming}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder={t.pasteYoutubePlaceholder}
              className="w-full px-4 py-3 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-subtle)]">Thử mẫu:</span>
              <button
                type="button"
                onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=aircAruvnKk')}
                disabled={isStreaming}
                className="px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors font-medium"
              >
                🎬 3Blue1Brown: Neural Networks
              </button>
            </div>
          </div>
        )}

        {/* Bottom Bar matching Image */}
        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-subtle)]">
            {t.useAccurateInfo}
          </p>

          {!isStreaming ? (
            <button
              onClick={startStream}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl accent-btn font-semibold text-xs shadow-sm transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.startMakingQuiz}</span>
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.99]"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>{t.stopGenerating}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* Telemetry & Output Section */}
      {(outputText || isStreaming) && (
        <div className="custom-card rounded-2xl overflow-hidden shadow-sm">
          {/* Telemetry Bar */}
          <div className="px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveResultTab('quiz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeResultTab === 'quiz'
                    ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t.resultQuizTab}
              </button>
              <button
                onClick={() => setActiveResultTab('markdown')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeResultTab === 'markdown'
                    ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t.resultMarkdownTab}
              </button>
              <button
                onClick={() => setActiveResultTab('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeResultTab === 'table'
                    ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t.resultTableTab}
              </button>
              <button
                onClick={() => setActiveResultTab('json')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeResultTab === 'json'
                    ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t.resultJsonTab}
              </button>
            </div>

            {/* Metrics & Actions */}
            <div className="flex items-center gap-3">
              {ttftMs !== null && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-muted)]">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>TTFT: {ttftMs}ms</span>
                </span>
              )}
              {latencyMs !== null && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{latencyMs}ms</span>
                </span>
              )}
              {tokensEstimated !== null && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-muted)]">
                  <Coins className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{tokensEstimated} tokens</span>
                </span>
              )}

              {/* Copy & Download */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedText : t.copyButton}</span>
              </button>
              <button
                onClick={() => handleDownload('md')}
                className="p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]"
                title={t.downloadMd}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Result Content */}
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {/* 1. INTERACTIVE QUIZ TAB */}
            {activeResultTab === 'quiz' && (
              <div className="space-y-6">
                {parsedQuiz.length > 0 ? (
                  parsedQuiz.map((q, qIndex) => {
                    const isRevealed = revealedAnswers[qIndex];
                    const chosen = selectedAnswers[qIndex];
                    return (
                      <div
                        key={qIndex}
                        className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3.5"
                      >
                        <h4 className="text-sm font-bold text-[var(--text-main)]">
                          {q.question}
                        </h4>

                        {/* Options */}
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const isSelected = chosen === opt.key;
                            const isCorrect = q.correctAnswer === opt.key;
                            let optionClass =
                              'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)]';

                            if (isRevealed) {
                              if (isCorrect) {
                                optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold';
                              } else if (isSelected && !isCorrect) {
                                optionClass = 'border-rose-400 bg-rose-50 text-rose-800';
                              }
                            } else if (isSelected) {
                              optionClass = 'border-[var(--accent)] bg-[var(--accent-soft)] font-semibold';
                            }

                            return (
                              <button
                                key={opt.key}
                                onClick={() => {
                                  setSelectedAnswers((prev) => ({ ...prev, [qIndex]: opt.key }));
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all ${optionClass}`}
                              >
                                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                                  {opt.key}
                                </span>
                                <span className="flex-1">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Reveal Answer Button & Explanation */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[var(--border-subtle)]">
                          <button
                            onClick={() => {
                              setRevealedAnswers((prev) => ({ ...prev, [qIndex]: !isRevealed }));
                            }}
                            className="text-xs text-[var(--accent)] font-semibold hover:underline"
                          >
                            {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án & giải thích'}
                          </button>

                          {isRevealed && q.correctAnswer && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              Đáp án đúng: {q.correctAnswer}
                            </span>
                          )}
                        </div>

                        {isRevealed && q.explanation && (
                          <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            <p className="font-semibold text-[var(--text-main)] mb-0.5">Giải thích:</p>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="prose prose-sm max-w-none text-[var(--text-main)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputText}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* 2. MARKDOWN TAB */}
            {activeResultTab === 'markdown' && (
              <div className="prose prose-sm max-w-none text-[var(--text-main)] leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputText}</ReactMarkdown>
              </div>
            )}

            {/* 3. INTERACTIVE TABLE TAB */}
            {activeResultTab === 'table' && (
              <div>
                {parsedTable ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                        <input
                          type="text"
                          value={tableSearch}
                          onChange={(e) => setTableSearch(e.target.value)}
                          placeholder="Tìm kiếm trong bảng..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const csv = [
                            parsedTable.headers.join(','),
                            ...parsedTable.rows.map((r) => r.join(',')),
                          ].join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `table-${Date.now()}.csv`;
                          a.click();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)] font-semibold"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Xuất CSV</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[var(--bg-card-subtle)] border-b border-[var(--border-color)] text-[var(--text-main)] font-bold">
                          <tr>
                            {parsedTable.headers.map((h, i) => (
                              <th
                                key={i}
                                onClick={() => {
                                  if (sortCol === i) setSortAsc(!sortAsc);
                                  else {
                                    setSortCol(i);
                                    setSortAsc(true);
                                  }
                                }}
                                className="px-4 py-3 cursor-pointer select-none hover:bg-[var(--border-color)] transition-colors"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>{h}</span>
                                  <ArrowUpDown className="w-3 h-3 text-[var(--text-subtle)]" />
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {filteredTableRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[var(--bg-card-subtle)]">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-2.5 text-[var(--text-main)]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] text-center py-8">
                    Không tìm thấy cấu trúc bảng trong nội dung phản hồi. Hãy chọn Preset "Action Items" để tạo bảng dữ liệu.
                  </p>
                )}
              </div>
            )}

            {/* 4. JSON TAB */}
            {activeResultTab === 'json' && (
              <pre className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-xs overflow-x-auto text-[var(--text-main)]">
                <code>{outputText}</code>
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
