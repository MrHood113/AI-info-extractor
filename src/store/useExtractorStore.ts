import { create } from 'zustand';
import { translations, Language } from '../utils/i18n';

export type AppTheme =
  | 'warm-cream'
  | 'clean-white'
  | 'matcha-sage'
  | 'rose-peach'
  | 'sunset-lilac'
  | 'cozy-dark';

export type SidebarMenuId =
  | 'explore'
  | 'materials'
  | 'quizzes'
  | 'flashcards'
  | 'collections'
  | 'notes'
  | 'reader'
  | 'tutors'
  | 'pomodoro'
  | 'planner'
  | 'kanban'
  | 'study-groups'
  | 'achievements'
  | 'statistics'
  | 'settings';

export type IngestionTab =
  | 'file'
  | 'text'
  | 'link'
  | 'drive'
  | 'material'
  | 'media'
  | 'image'
  | 'youtube';

export type SourceType = 'pdf' | 'docx' | 'excel' | 'video' | 'audio' | 'youtube' | 'web';
export type OutputFormat = 'quiz' | 'markdown' | 'table' | 'json';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface HistoryItem {
  id: string;
  sourceType: SourceType;
  sourceName: string;
  presetId: string;
  prompt: string;
  outputText: string;
  outputFormat: string;
  latencyMs: number;
  tokensUsed?: number;
  createdAt: string;
}

export interface PresetInfo {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  format: OutputFormat;
}

export const PRESETS: PresetInfo[] = [
  {
    id: 'insights',
    name: '3-5 Key Insights',
    description: 'Tóm tắt 3-5 Key Insights và ý nghĩa cốt lõi nhất từ tài liệu.',
    promptTemplate:
      'Trích xuất và tóm tắt 3-5 Key Insights cốt lõi nhất từ nội dung được cung cấp. Đối với mỗi insight, giải thích rõ: (1) Bản chất insight, (2) Bằng chứng/Dữ liệu minh chứng từ nguồn, (3) Ý nghĩa chiến lược hoặc bài học rút ra.',
    format: 'markdown',
  },
  {
    id: 'actions',
    name: 'Action Items Matrix',
    description: 'Rút ra Action Items, người phụ trách và mức độ ưu tiên dạng bảng.',
    promptTemplate:
      'Hãy phân tích tài liệu và lập danh sách tất cả các Action Items (nhiệm vụ cần thực hiện) một cách chi tiết. Với mỗi Action Item, trình bày dạng bảng gồm các cột: Số thứ tự (No), Nhiệm vụ cụ thể (Action Item), Người/Bộ phận phụ trách (Assignee), Mức độ ưu tiên (High/Medium/Low), Deadline/Mốc thời gian dự kiến (nếu có), và Tiêu chí hoàn thành (Done Definition).',
    format: 'table',
  },
  {
    id: 'json_entities',
    name: 'Structured JSON Schema',
    description: 'Trích xuất thực thể, thông số & metrics theo schema JSON chuẩn.',
    promptTemplate:
      'Trích xuất toàn bộ các thực thể, thông số kỹ thuật, số liệu định lượng, ngày tháng, tên riêng và các thuộc tính quan trọng từ tài liệu dưới định dạng JSON hợp lệ tuân thủ schema chuẩn: { "title": string, "summary": string, "entities": [{"name": string, "type": string, "value": string, "confidence": number}], "metrics": [{"metric": string, "value": string, "unit": string}], "key_takeaways": [string] }.',
    format: 'json',
  },
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'Tóm tắt điều hành cô đọng, sắc bén dành cho ban lãnh đạo C-level.',
    promptTemplate:
      'Soạn thảo một bản Tóm tắt Điều hành (Executive Summary) chuyên nghiệp dành cho Ban Lãnh đạo (C-level). Cấu trúc gồm: 1. Tổng quan tình hình (Context), 2. Các điểm nóng và cơ hội chính (Key Highlights), 3. Rủi ro & Thách thức cần lưu tâm (Risks & Bottlenecks), 4. Khuyến nghị hành động chiến lược (Strategic Recommendations). Phong cách chuyên nghiệp, súc tích, định hướng kết quả.',
    format: 'markdown',
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Ma trận phân tích Strengths, Weaknesses, Opportunities, Threats.',
    promptTemplate:
      'Thực hiện phân tích ma trận SWOT toàn diện dựa trên nội dung được cung cấp. Phân bổ rõ 4 nhóm: Điểm mạnh (Strengths), Điểm yếu (Weaknesses), Cơ hội (Opportunities), và Thách thức (Threats). Với mỗi mục, đưa ra ít nhất 3-4 luận điểm sâu sắc kèm khuyến nghị chiến lược kết hợp (SO, WO, ST, WT).',
    format: 'markdown',
  },
];

export interface ExtractorState {
  // Theme & Language
  theme: AppTheme;
  language: Language;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (lang: Language) => void;

  // Navigation
  activeMenu: SidebarMenuId;
  setActiveMenu: (menu: SidebarMenuId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadNotifications: number;

  // User Authentication
  user: UserProfile | null;
  token: string | null;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => void;

  // Source selection & Ingestion
  sourceTab: IngestionTab;
  setSourceTab: (tab: IngestionTab) => void;
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  rawText: string;
  setRawText: (text: string) => void;
  webUrl: string;
  setWebUrl: (url: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;

  // Presets & Legacy compatibility
  presetId: string;
  setPresetId: (id: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  activeTab: OutputFormat;
  setActiveTab: (tab: OutputFormat) => void;
  historyModalOpen: boolean;
  setHistoryModalOpen: (open: boolean) => void;
  loadFromHistory: (item: HistoryItem) => void;

  // Generator Configuration (Right Sidebar in Image)
  visibility: 'private' | 'public';
  setVisibility: (v: 'private' | 'public') => void;
  quizLanguage: string;
  setQuizLanguage: (l: string) => void;
  questionType: string;
  setQuestionType: (qt: string) => void;
  numQuestions: string;
  setNumQuestions: (num: string) => void;
  mode: string;
  setMode: (m: string) => void;
  difficulty: string;
  setDifficulty: (d: string) => void;
  task: string;
  setTask: (t: string) => void;
  parsingMode: 'fast' | 'balanced' | 'premium';
  setParsingMode: (pm: 'fast' | 'balanced' | 'premium') => void;
  customInstructions: string;
  setCustomInstructions: (inst: string) => void;

  // Streaming & Output
  isStreaming: boolean;
  statusMessage: string;
  outputText: string;
  ttftMs: number | null;
  latencyMs: number | null;
  tokensEstimated: number | null;
  errorMessage: string | null;
  activeResultTab: OutputFormat;
  setActiveResultTab: (tab: OutputFormat) => void;

  abortController: AbortController | null;
  startStream: () => Promise<void>;
  stopStream: () => void;
  resetOutput: () => void;
}

// Read initial stored preferences
const storedTheme = (localStorage.getItem('manabi_theme') as AppTheme) || 'warm-cream';
const storedLang = (localStorage.getItem('manabi_lang') as Language) || 'vi';
const storedToken = localStorage.getItem('manabi_token') || 'demo-jwt-token';
const storedUser: UserProfile = (() => {
  try {
    const raw = localStorage.getItem('manabi_user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    id: 'demo-user-mr-hood',
    name: 'Mr Hood',
    email: 'luxuryplayer113@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MrHood',
  };
})();

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', storedTheme);
}

export const useExtractorStore = create<ExtractorState>((set, get) => ({
  // Theme & Language
  theme: storedTheme,
  language: storedLang,
  setTheme: (newTheme) => {
    localStorage.setItem('manabi_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },
  setLanguage: (lang) => {
    localStorage.setItem('manabi_lang', lang);
    set({ language: lang });
  },

  // Navigation
  activeMenu: 'quizzes',
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  unreadNotifications: 3,

  // Auth
  user: storedUser,
  token: storedToken,
  authModalOpen: false,
  authModalTab: 'login',
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),

  loginUser: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đăng nhập không thành công.');
    }
    localStorage.setItem('manabi_token', data.token);
    localStorage.setItem('manabi_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token, authModalOpen: false });
  },

  registerUser: async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đăng ký không thành công.');
    }
    localStorage.setItem('manabi_token', data.token);
    localStorage.setItem('manabi_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token, authModalOpen: false });
  },

  loginWithGoogle: async () => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mr Hood',
        email: 'luxuryplayer113@gmail.com',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MrHood',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đăng nhập Google thất bại.');
    }
    localStorage.setItem('manabi_token', data.token);
    localStorage.setItem('manabi_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token, authModalOpen: false });
  },

  logoutUser: () => {
    localStorage.removeItem('manabi_token');
    localStorage.removeItem('manabi_user');
    set({ user: null, token: null });
  },

  // Ingestion Inputs
  sourceTab: 'file',
  setSourceTab: (tab) => set({ sourceTab: tab, errorMessage: null }),
  sourceType: 'pdf',
  setSourceType: (type) => set({ sourceType: type, errorMessage: null }),
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file, errorMessage: null }),
  rawText: '',
  setRawText: (text) => set({ rawText: text, errorMessage: null }),
  webUrl: '',
  setWebUrl: (url) => set({ webUrl: url, errorMessage: null }),
  youtubeUrl: '',
  setYoutubeUrl: (url) => set({ youtubeUrl: url, errorMessage: null }),

  // Presets & Legacy properties
  presetId: 'insights',
  setPresetId: (id) => {
    const p = PRESETS.find((item) => item.id === id);
    if (p) {
      set({ presetId: id, customPrompt: p.promptTemplate, outputFormat: p.format, activeTab: p.format });
    } else {
      set({ presetId: 'custom' });
    }
  },
  customPrompt: PRESETS[0].promptTemplate,
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  outputFormat: 'quiz',
  setOutputFormat: (fmt) => set({ outputFormat: fmt, activeTab: fmt }),
  activeTab: 'quiz',
  setActiveTab: (tab) => set({ activeTab: tab }),
  historyModalOpen: false,
  setHistoryModalOpen: (open) => set({ historyModalOpen: open }),
  loadFromHistory: (item) => {
    set({
      outputText: item.outputText,
      sourceType: item.sourceType,
      presetId: item.presetId,
      customPrompt: item.prompt,
      outputFormat: item.outputFormat as OutputFormat,
      activeTab: item.outputFormat as OutputFormat,
      latencyMs: item.latencyMs,
      tokensEstimated: item.tokensUsed || null,
      statusMessage: `Loaded from ${new Date(item.createdAt).toLocaleString()}`,
      historyModalOpen: false,
    });
  },

  // Configuration options matching image
  visibility: 'private',
  setVisibility: (v) => set({ visibility: v }),
  quizLanguage: 'auto',
  setQuizLanguage: (l) => set({ quizLanguage: l }),
  questionType: 'mixed',
  setQuestionType: (qt) => set({ questionType: qt }),
  numQuestions: '5-10',
  setNumQuestions: (num) => set({ numQuestions: num }),
  mode: 'quiz',
  setMode: (m) => set({ mode: m }),
  difficulty: 'medium',
  setDifficulty: (d) => set({ difficulty: d }),
  task: 'generate_quiz',
  setTask: (t) => set({ task: t }),
  parsingMode: 'fast',
  setParsingMode: (pm) => set({ parsingMode: pm }),
  customInstructions: '',
  setCustomInstructions: (inst) => set({ customInstructions: inst }),

  // Output & Streaming
  isStreaming: false,
  statusMessage: '',
  outputText: '',
  ttftMs: null,
  latencyMs: null,
  tokensEstimated: null,
  errorMessage: null,
  activeResultTab: 'quiz',
  setActiveResultTab: (tab) => set({ activeResultTab: tab }),
  abortController: null,

  resetOutput: () =>
    set({
      outputText: '',
      statusMessage: '',
      ttftMs: null,
      latencyMs: null,
      tokensEstimated: null,
      errorMessage: null,
    }),

  stopStream: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({
        isStreaming: false,
        statusMessage: 'Dừng luồng trích xuất.',
        abortController: null,
      });
    }
  },

  startStream: async () => {
    const {
      sourceTab,
      selectedFile,
      rawText,
      webUrl,
      youtubeUrl,
      task,
      questionType,
      numQuestions,
      difficulty,
      quizLanguage,
      customInstructions,
    } = get();

    let backendSourceType = 'pdf';
    if (sourceTab === 'file') {
      if (!selectedFile) {
        set({ errorMessage: 'Vui lòng chọn hoặc kéo thả tệp tài liệu trước khi bắt đầu.' });
        return;
      }
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') backendSourceType = 'docx';
      else if (['xlsx', 'csv', 'xls'].includes(ext || '')) backendSourceType = 'excel';
      else if (['mp4', 'webm', 'mov'].includes(ext || '')) backendSourceType = 'video';
      else if (['mp3', 'wav', 'm4a'].includes(ext || '')) backendSourceType = 'audio';
      else backendSourceType = 'pdf';
    } else if (sourceTab === 'media') {
      if (!selectedFile) {
        set({ errorMessage: 'Vui lòng tải lên tệp âm thanh hoặc ghi âm.' });
        return;
      }
      backendSourceType = 'audio';
    } else if (sourceTab === 'image') {
      if (!selectedFile) {
        set({ errorMessage: 'Vui lòng tải lên ảnh tài liệu hoặc scan.' });
        return;
      }
      backendSourceType = 'pdf';
    } else if (sourceTab === 'link') {
      if (!webUrl.trim()) {
        set({ errorMessage: 'Vui lòng nhập đường dẫn bài viết website.' });
        return;
      }
      backendSourceType = 'web';
    } else if (sourceTab === 'youtube') {
      if (!youtubeUrl.trim()) {
        set({ errorMessage: 'Vui lòng dán đường dẫn video YouTube.' });
        return;
      }
      backendSourceType = 'youtube';
    } else if (sourceTab === 'text') {
      if (!rawText.trim()) {
        set({ errorMessage: 'Vui lòng nhập hoặc dán nội dung văn bản học tập.' });
        return;
      }
      backendSourceType = 'web';
    }

    let generatedPrompt = `Hãy đóng vai trò là một chuyên gia giáo dục AI. Dựa trên tài liệu được cung cấp, hãy tạo ra nội dung với các yêu cầu sau:
1. Nhiệm vụ chính: ${task.toUpperCase()}
2. Dạng câu hỏi / nội dung: ${questionType}
3. Số lượng câu hỏi / đề mục: ${numQuestions}
4. Độ khó: ${difficulty}
5. Ngôn ngữ mong muốn: ${quizLanguage === 'auto' ? 'Tự động theo ngôn ngữ tài liệu' : quizLanguage}
${customInstructions ? `6. Chỉ dẫn bổ sung: ${customInstructions}` : ''}

Đối với đề thi trắc nghiệm (Quiz), hãy định dạng rõ từng câu hỏi theo chuẩn sau:
### Câu [X]: [Nội dung câu hỏi]
- A. [Đáp án A]
- B. [Đáp án B]
- C. [Đáp án C]
- D. [Đáp án D]
**Đáp án đúng**: [A/B/C/D]
**Giải thích chi tiết**: [Lý do và dẫn chứng từ tài liệu]

Nếu là phân tích hoặc bảng dữ liệu, hãy cung cấp kèm Bảng Markdown chuẩn và các đề mục rõ ràng.`;

    const controller = new AbortController();
    set({
      isStreaming: true,
      statusMessage: 'Đang kết nối Gemini 3.8 Flash pipeline...',
      outputText: '',
      ttftMs: null,
      latencyMs: null,
      tokensEstimated: null,
      errorMessage: null,
      abortController: controller,
      activeResultTab: 'quiz',
    });

    try {
      const formData = new FormData();
      formData.append('sourceType', backendSourceType);
      formData.append('prompt', generatedPrompt);
      formData.append('presetId', task);
      formData.append('outputFormat', 'markdown');

      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (sourceTab === 'link' && webUrl) {
        formData.append('url', webUrl);
      }
      if (sourceTab === 'youtube' && youtubeUrl) {
        formData.append('youtubeUrl', youtubeUrl);
      }
      if (sourceTab === 'text' && rawText) {
        const textBlob = new Blob([rawText], { type: 'text/plain' });
        formData.append('file', textBlob, 'study_notes.txt');
        formData.set('sourceType', 'pdf');
      }

      const response = await fetch('/api/extract/stream', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'status') {
                set({ statusMessage: data.message });
              } else if (data.type === 'ttft') {
                set({ ttftMs: data.ttftMs });
              } else if (data.type === 'chunk') {
                set((state) => ({ outputText: state.outputText + data.text }));
              } else if (data.type === 'done') {
                set({
                  isStreaming: false,
                  statusMessage: `Tạo hoàn tất trong ${data.latencyMs}ms.`,
                  latencyMs: data.latencyMs,
                  ttftMs: data.ttftMs,
                  tokensEstimated: data.tokensEstimated,
                  abortController: null,
                });
              } else if (data.type === 'error') {
                set({
                  isStreaming: false,
                  errorMessage: data.error,
                  statusMessage: 'Lỗi',
                  abortController: null,
                });
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        set({
          isStreaming: false,
          errorMessage: err.message || 'Lỗi xử lý luồng trích xuất.',
          statusMessage: 'Lỗi',
          abortController: null,
        });
      }
    } finally {
      set({ isStreaming: false, abortController: null });
    }
  },
}));
