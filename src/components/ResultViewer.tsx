import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Table as TableIcon,
  FileCode2,
  Copy,
  Check,
  Download,
  Search,
  ArrowUpDown,
  FileDown,
  Sparkles,
  Maximize2,
  Terminal,
} from 'lucide-react';
import { useExtractorStore, OutputFormat } from '../store/useExtractorStore';

export const ResultViewer: React.FC = () => {
  const { outputText, isStreaming, activeTab, setActiveTab } = useExtractorStore();
  const [copied, setCopied] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // 1-Click Copy
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = outputText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download File
  const handleDownload = (format: 'md' | 'json') => {
    if (!outputText) return;
    const blob = new Blob([outputText], {
      type: format === 'json' ? 'application/json' : 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-extract-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse Markdown Tables or JSON arrays into Table rows
  const parsedTableData = useMemo(() => {
    if (!outputText) return null;

    // Check if output is JSON containing an array
    try {
      const parsedJson = JSON.parse(outputText.trim());
      if (Array.isArray(parsedJson) && parsedJson.length > 0 && typeof parsedJson[0] === 'object') {
        const headers = Object.keys(parsedJson[0]);
        const rows = parsedJson.map((item) => headers.map((h) => String(item[h] ?? '')));
        return { headers, rows, title: 'JSON Array Data' };
      }
      if (typeof parsedJson === 'object') {
        // Look for array property like "entities", "metrics", "actions"
        for (const key of Object.keys(parsedJson)) {
          if (Array.isArray(parsedJson[key]) && parsedJson[key].length > 0 && typeof parsedJson[key][0] === 'object') {
            const headers = Object.keys(parsedJson[key][0]);
            const rows = parsedJson[key].map((item: any) => headers.map((h) => String(item[h] ?? '')));
            return { headers, rows, title: `JSON Object: ${key}` };
          }
        }
      }
    } catch {}

    // Otherwise, parse markdown tables
    const lines = outputText.split('\n');
    const tableLines = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));

    if (tableLines.length >= 3) {
      const parseLine = (line: string) =>
        line
          .trim()
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());

      const rawHeaders = parseLine(tableLines[0]);
      // tableLines[1] is separator ---
      const rows = tableLines.slice(2).map(parseLine);
      return { headers: rawHeaders, rows, title: 'Markdown Table' };
    }

    return null;
  }, [outputText]);

  // Filtered & Sorted Table Rows
  const processedTableRows = useMemo(() => {
    if (!parsedTableData) return [];
    let rows = parsedTableData.rows;

    if (tableSearch.trim()) {
      const query = tableSearch.toLowerCase();
      rows = rows.filter((r) => r.some((c) => c.toLowerCase().includes(query)));
    }

    if (sortCol !== null) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortCol] || '';
        const valB = b[sortCol] || '';
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return rows;
  }, [parsedTableData, tableSearch, sortCol, sortAsc]);

  // Download Table as CSV
  const handleDownloadCsv = () => {
    if (!parsedTableData) return;
    const headerLine = parsedTableData.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
    const dataLines = parsedTableData.rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headerLine, ...dataLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-table-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check JSON format validity
  const jsonStatus = useMemo(() => {
    if (!outputText) return null;
    try {
      const parsed = JSON.parse(outputText.trim());
      return { valid: true, formatted: JSON.stringify(parsed, null, 2) };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  }, [outputText]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Top Header / View Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-6 bg-slate-900/90 border-b border-slate-800 gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'markdown'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown View</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'table'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Interactive Table</span>
            {parsedTableData && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'json'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>JSON Code</span>
            {jsonStatus?.valid && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!outputText}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              copied
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép!' : 'Copy 1-Click'}</span>
          </button>

          {/* Download Buttons */}
          <button
            onClick={() => handleDownload('md')}
            disabled={!outputText}
            title="Tải tệp Markdown (.md)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            onClick={() => handleDownload('json')}
            disabled={!outputText}
            title="Tải tệp JSON (.json)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.JSON</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 min-h-[380px] max-h-[680px] overflow-y-auto">
        {!outputText && !isStreaming ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-300 mb-1">
              Sẵn sàng trích xuất thông tin
            </h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Hãy chọn tệp tài liệu, dán đường dẫn YouTube hoặc bài viết Web ở trên, sau đó nhấn nút 
              <span className="text-cyan-400 font-medium"> "Bắt Đầu Trích Xuất Dữ Liệu"</span> để xem luồng kết quả thời gian thực.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. MARKDOWN VIEW */}
            {activeTab === 'markdown' && (
              <div className="prose prose-invert prose-cyan max-w-none text-slate-200 text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="text-xl sm:text-2xl font-bold text-white border-b border-slate-800 pb-2 mb-4 mt-6" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-lg font-semibold text-cyan-300 border-b border-slate-800/60 pb-1 mb-3 mt-5" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-base font-medium text-slate-200 mb-2 mt-4" {...props} />
                    ),
                    p: ({ ...props }) => (
                      <p className="mb-3 text-slate-300 leading-relaxed" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-300" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-5 mb-4 space-y-1 text-slate-300" {...props} />
                    ),
                    blockquote: ({ ...props }) => (
                      <blockquote className="border-l-4 border-cyan-500/80 pl-4 py-1 italic bg-slate-900/60 rounded-r-lg my-3 text-slate-300" {...props} />
                    ),
                    table: ({ ...props }) => (
                      <div className="overflow-x-auto my-4 rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs border-collapse" {...props} />
                      </div>
                    ),
                    thead: ({ ...props }) => (
                      <thead className="bg-slate-900 text-cyan-300 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800" {...props} />
                    ),
                    th: ({ ...props }) => (
                      <th className="px-4 py-3 font-semibold" {...props} />
                    ),
                    td: ({ ...props }) => (
                      <td className="px-4 py-2.5 border-b border-slate-800/60 text-slate-300" {...props} />
                    ),
                    code: ({ inline, ...props }: any) =>
                      inline ? (
                        <code className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 font-mono text-xs" {...props} />
                      ) : (
                        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto my-3">
                          <code {...props} />
                        </pre>
                      ),
                  }}
                >
                  {outputText}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                )}
              </div>
            )}

            {/* 2. INTERACTIVE TABLE VIEW */}
            {activeTab === 'table' && (
              <div>
                {parsedTableData ? (
                  <div className="space-y-4">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={tableSearch}
                          onChange={(e) => setTableSearch(e.target.value)}
                          placeholder="Tìm kiếm trong bảng..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">
                          {processedTableRows.length} / {parsedTableData.rows.length} hàng
                        </span>
                        <button
                          onClick={handleDownloadCsv}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                        >
                          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Xuất CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Table Render */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-md">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-900/90 text-slate-200 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800 sticky top-0">
                          <tr>
                            {parsedTableData.headers.map((header, idx) => (
                              <th
                                key={idx}
                                onClick={() => {
                                  if (sortCol === idx) {
                                    setSortAsc(!sortAsc);
                                  } else {
                                    setSortCol(idx);
                                    setSortAsc(true);
                                  }
                                }}
                                className="px-4 py-3 font-semibold cursor-pointer hover:bg-slate-800 transition-colors select-none"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>{header}</span>
                                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                          {processedTableRows.map((row, rowIdx) => (
                            <tr
                              key={rowIdx}
                              className="hover:bg-slate-900/60 transition-colors"
                            >
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-4 py-2.5 text-slate-300">
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
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <TableIcon className="w-10 h-10 mb-2 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">Chưa phát hiện cấu trúc bảng</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Dữ liệu hiện tại chưa chứa định dạng bảng Markdown hoặc mảng JSON. Hãy chọn Preset "Action Items" hoặc chuyển sang tab Markdown.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. JSON CODE VIEWER */}
            {activeTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-slate-300">RFC 8259 JSON Representation</span>
                  </div>
                  {jsonStatus?.valid ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                      ✓ Valid JSON Schema
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
                      Raw Stream / Parsing...
                    </span>
                  )}
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-[560px]">
                  <code>{jsonStatus?.formatted || outputText}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
