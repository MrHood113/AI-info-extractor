import React, { useState, useEffect } from 'react';
import {
  Layers,
  Clock,
  Kanban,
  GraduationCap,
  FileText,
  Award,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Send,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useExtractorStore } from '../../store/useExtractorStore';
import { translations } from '../../utils/i18n';

// 1. Flashcards View
export const FlashcardsView: React.FC = () => {
  const { language } = useExtractorStore();
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    {
      front: 'Gemini 3.8 Flash Context Window là bao nhiêu?',
      back: '2,000,000+ tokens (2M Tokens), cho phép nạp hàng ngàn trang tài liệu, video dài hàng giờ hoặc toàn bộ codebase.',
      tag: 'AI Architecture',
    },
    {
      front: 'Sự khác biệt giữa File API và Inline Base64 trong Gemini là gì?',
      back: 'File API cho phép upload tệp lớn (video, audio, PDF >20MB) lên Google storage tạm và tái sử dụng qua URI; Base64 chỉ phù hợp với payload nhỏ.',
      tag: 'SDK Best Practices',
    },
    {
      front: 'Server-Sent Events (SSE) hoạt động theo cơ chế nào?',
      back: 'SSE là kết nối một chiều HTTP duy trì mở (Content-Type: text/event-stream), server chủ động stream từng chunk token đến client với độ trễ tối thiểu.',
      tag: 'Web Standards',
    },
    {
      front: 'Cơ chế Zero-Disk-Leak trong hệ thống là gì?',
      back: 'Xóa tệp tạm ngay trong khối finally {}, kết hợp Cron Worker dọn file quá hạn mỗi 15 phút và cleanup handler khi nhận tín hiệu SIGINT/SIGTERM.',
      tag: 'DevOps & Storage',
    },
  ];

  const currentCard = cards[currentIndex];

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center space-y-6 select-none">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Thẻ Ghi Nhớ Flashcards</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">Nhấp vào thẻ để lật mặt sau và ôn tập kiến thức</p>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-lg h-72 rounded-2xl custom-card shadow-md p-8 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all border-2 border-[var(--border-color)] hover:border-[var(--accent)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            {currentCard.tag}
          </span>
          <span className="text-xs font-mono text-[var(--text-subtle)]">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="text-center my-auto px-4">
          <p className="text-xs font-medium text-[var(--text-subtle)] mb-2 uppercase tracking-wide">
            {flipped ? 'Đáp án (Back)' : 'Câu hỏi (Front)'}
          </p>
          <p className="text-base sm:text-lg font-bold text-[var(--text-main)] leading-relaxed">
            {flipped ? currentCard.back : currentCard.front}
          </p>
        </div>

        <p className="text-[11px] text-center text-[var(--text-subtle)]">
          {flipped ? 'Nhấp để xem câu hỏi' : 'Nhấp để xem giải thích'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setFlipped(false);
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
          }}
          className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
        >
          ← Thẻ trước
        </button>
        <button
          onClick={() => {
            setFlipped(false);
            setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
          }}
          className="px-5 py-2 rounded-xl accent-btn text-xs font-semibold shadow-xs"
        >
          Thẻ tiếp theo →
        </button>
      </div>
    </div>
  );
};

// 2. Pomodoro Focus Timer
export const PomodoroView: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(3);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0) {
      if (mode === 'work') {
        setMode('break');
        setSecondsLeft(5 * 60);
        setSessionsCompleted((prev) => prev + 1);
      } else {
        setMode('work');
        setSecondsLeft(25 * 60);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center space-y-6 select-none">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Đồng Hồ Pomodoro Tập Trung</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Học tập hiệu quả với chu kỳ 25 phút tập trung và 5 phút nghỉ ngơi
        </p>
      </div>

      <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <button
          onClick={() => {
            setMode('work');
            setSecondsLeft(25 * 60);
            setIsActive(false);
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'work' ? 'accent-btn shadow-xs' : 'text-[var(--text-muted)]'
          }`}
        >
          25 Phút Học Tập
        </button>
        <button
          onClick={() => {
            setMode('break');
            setSecondsLeft(5 * 60);
            setIsActive(false);
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'break' ? 'accent-btn shadow-xs' : 'text-[var(--text-muted)]'
          }`}
        >
          5 Phút Nghỉ Ngơi
        </button>
      </div>

      <div className="w-64 h-64 rounded-full custom-card border-4 border-[var(--accent)] flex flex-col items-center justify-center shadow-lg">
        <span className="text-5xl font-mono font-extrabold text-[var(--text-main)] tracking-tight">
          {timeFormatted}
        </span>
        <span className="text-xs font-semibold text-[var(--accent)] uppercase mt-2">
          {mode === 'work' ? '🔥 Đang tập trung' : '☕ Giờ giải lao'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl accent-btn font-bold text-xs shadow-sm active:scale-95 transition-all"
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{isActive ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
        </button>

        <button
          onClick={() => {
            setIsActive(false);
            setSecondsLeft(mode === 'work' ? 25 * 60 : 5 * 60);
          }}
          className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-[var(--text-subtle)] font-medium">
        Hôm nay bạn đã hoàn thành <span className="text-[var(--accent)] font-bold">{sessionsCompleted} phiên</span> học tập!
      </p>
    </div>
  );
};

// 3. Kanban Board
export const KanbanView: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 1, col: 'todo', text: 'Đọc tài liệu Machine Learning Chapter 4', tag: 'AI' },
    { id: 2, col: 'todo', text: 'Ôn tập 20 câu hỏi trắc nghiệm xác suất', tag: 'Math' },
    { id: 3, col: 'inprogress', text: 'Tạo tóm tắt Executive Summary về SWOT công ty', tag: 'Business' },
    { id: 4, col: 'done', text: 'Trích xuất dữ liệu báo cáo tài chính Q1 sang Markdown Table', tag: 'Finance' },
  ]);

  const [newTaskText, setNewTaskText] = useState('');

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), col: 'todo', text: newTaskText.trim(), tag: 'General' }]);
    setNewTaskText('');
  };

  const moveTask = (id: number, targetCol: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, col: targetCol } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const renderCol = (title: string, colId: string, badgeColor: string) => {
    const colTasks = tasks.filter((t) => t.col === colId);
    return (
      <div className="flex-1 custom-card rounded-2xl p-4 flex flex-col space-y-3 min-w-[260px]">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`} />
            <h3 className="text-xs font-bold text-[var(--text-main)]">{title}</h3>
          </div>
          <span className="text-xs font-bold text-[var(--text-subtle)] bg-[var(--bg-card-subtle)] px-2 py-0.5 rounded-full font-mono">
            {colTasks.length}
          </span>
        </div>

        <div className="space-y-2.5 flex-1">
          {colTasks.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase bg-[var(--accent-soft)] px-2 py-0.5 rounded">
                  {t.tag}
                </span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-subtle)] hover:text-rose-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-[var(--text-main)] leading-relaxed font-medium">{t.text}</p>

              <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--border-subtle)] text-[10px]">
                {colId !== 'todo' && (
                  <button
                    onClick={() => moveTask(t.id, 'todo')}
                    className="text-[var(--text-subtle)] hover:text-[var(--text-main)] underline"
                  >
                    ← Cần làm
                  </button>
                )}
                {colId !== 'inprogress' && (
                  <button
                    onClick={() => moveTask(t.id, 'inprogress')}
                    className="text-[var(--text-subtle)] hover:text-[var(--text-main)] underline"
                  >
                    Đang làm
                  </button>
                )}
                {colId !== 'done' && (
                  <button
                    onClick={() => moveTask(t.id, 'done')}
                    className="text-[var(--text-subtle)] hover:text-emerald-600 underline font-semibold ml-auto"
                  >
                    Xong ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 select-none overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Bảng Kế Hoạch Kanban</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Quản lý lộ trình học tập và hoàn thành các mục tiêu</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Thêm nhiệm vụ mới..."
            className="px-3.5 py-1.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] w-56"
          />
          <button
            onClick={addTask}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl accent-btn text-xs font-bold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 min-h-[480px]">
        {renderCol('Cần Làm (To Do)', 'todo', 'bg-amber-400')}
        {renderCol('Đang Thực Hiện (In Progress)', 'inprogress', 'bg-sky-500')}
        {renderCol('Đã Hoàn Thành (Completed)', 'done', 'bg-emerald-500')}
      </div>
    </div>
  );
};

// 4. AI Tutor Chat View
export const TutorView: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    {
      sender: 'ai',
      text: 'Xin chào! Mình là Gia sư AI Manabi (được hỗ trợ bởi Gemini 3.8 Flash). Bạn đang cần giải đáp tài liệu gì hay muốn mình đố vui kiến thức hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/extract/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          sourceType: 'web',
          prompt: `Bạn là Gia sư AI Manabi thân thiện, vui tính cho học sinh. Hãy giải đáp ngắn gọn, dễ hiểu và truyền cảm hứng cho câu hỏi: "${userText}"`,
        }),
      });

      let aiResponse = '';
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'chunk') aiResponse += data.text;
              } catch {}
            }
          }
        }
      }
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiResponse || 'Rất tuyệt! Hãy tiếp tục đặt câu hỏi nhé.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Hệ thống đang bận một chút, bạn hãy hỏi lại nhé!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      <div className="pb-4 border-b border-[var(--border-color)]">
        <h2 className="text-xl font-bold text-[var(--text-main)]">Gia Sư Học Tập AI</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Hỏi đáp trực tiếp mọi bài giảng và khái niệm khó hiểu</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                m.sender === 'user'
                  ? 'bg-slate-700 text-white'
                  : 'bg-[var(--accent)] text-white'
              }`}
            >
              {m.sender === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
            </div>
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'accent-btn text-white'
                  : 'custom-card text-[var(--text-main)] shadow-xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Hỏi bất kỳ câu hỏi nào về bài học..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl accent-btn shadow-xs disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
