import React from 'react';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { useExtractorStore } from '../store/useExtractorStore';
import { translations } from '../utils/i18n';

export const StudioRightSidebar: React.FC = () => {
  const {
    language,
    visibility,
    setVisibility,
    quizLanguage,
    setQuizLanguage,
    questionType,
    setQuestionType,
    numQuestions,
    setNumQuestions,
    mode,
    setMode,
    difficulty,
    setDifficulty,
    task,
    setTask,
    parsingMode,
    setParsingMode,
    customInstructions,
    setCustomInstructions,
    isStreaming,
  } = useExtractorStore();

  const t = translations[language];

  return (
    <aside className="w-80 flex-shrink-0 p-5 space-y-4 border-l border-[var(--border-color)] bg-[var(--bg-app)] overflow-y-auto select-none">
      {/* 1. Visibility */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.visibility}
        </label>
        <div className="relative">
          <select
            value={visibility}
            disabled={isStreaming}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="private">{t.private}</option>
            <option value="public">{t.public}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* 2. Language of the quiz */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.quizLanguage}
        </label>
        <div className="relative">
          <select
            value={quizLanguage}
            disabled={isStreaming}
            onChange={(e) => setQuizLanguage(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="auto">{t.autoDetect}</option>
            <option value="vi">{t.vietnamese}</option>
            <option value="en">{t.english}</option>
            <option value="ja">{t.japanese}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* 3. Question Types */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.questionTypes}
        </label>
        <div className="relative">
          <select
            value={questionType}
            disabled={isStreaming}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="mixed">{t.mixedQuestions}</option>
            <option value="mcq">{t.multipleChoice}</option>
            <option value="insights">{t.keyInsightsOnly}</option>
            <option value="actions">{t.actionItemsOnly}</option>
            <option value="json">{t.structuredJson}</option>
            <option value="executive">{t.executiveSummary}</option>
            <option value="swot">{t.swotAnalysis}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* 4. Number of questions */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.numQuestions}
        </label>
        <div className="relative">
          <select
            value={numQuestions}
            disabled={isStreaming}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="5-10">5-10</option>
            <option value="10-15">10-15</option>
            <option value="15-20">15-20</option>
            <option value="20+">20+</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* 5. Mode */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.mode}
        </label>
        <div className="relative">
          <select
            value={mode}
            disabled={isStreaming}
            onChange={(e) => setMode(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="quiz">{t.quizMode}</option>
            <option value="summary">{t.summaryMode}</option>
            <option value="flashcards">{t.flashcardsMode}</option>
            <option value="guide">{t.studyGuideMode}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* 6. Difficulty */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.difficulty}
        </label>
        <div className="relative">
          <select
            value={difficulty}
            disabled={isStreaming}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="easy">{t.easy}</option>
            <option value="medium">{t.medium}</option>
            <option value="hard">{t.hard}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* 7. Task */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.task}
        </label>
        <div className="relative">
          <select
            value={task}
            disabled={isStreaming}
            onChange={(e) => setTask(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="generate_quiz">{t.taskGenerateQuiz}</option>
            <option value="insights">{t.taskKeyInsights}</option>
            <option value="actions">{t.taskActionItems}</option>
            <option value="json_entities">{t.taskJsonEntities}</option>
            <option value="executive">{t.taskExecutiveSummary}</option>
            <option value="swot">{t.taskSwotMatrix}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* 8. Parsing Mode */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.parsingMode}
        </label>
        <div className="relative">
          <select
            value={parsingMode}
            disabled={isStreaming}
            onChange={(e) => setParsingMode(e.target.value as any)}
            className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
          >
            <option value="fast">{t.fastTextOnly}</option>
            <option value="balanced">{t.balancedRecommended}</option>
            <option value="premium">{t.premiumEnhanced}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtle)]" />
        </div>
      </div>

      {/* Yellow Callout Banner (Matches Image Exactly!) */}
      <div className="p-3 rounded-xl border text-[11px] leading-relaxed" style={{
        backgroundColor: 'var(--yellow-callout-bg)',
        borderColor: 'var(--yellow-callout-border)',
        color: 'var(--yellow-callout-text)',
      }}>
        <p className="font-semibold mb-0.5">Fast: Text-only, skips images/tables.</p>
        <p className="font-semibold mb-0.5">Balanced: Recommended for most docs.</p>
        <p className="font-semibold">
          Premium: Enhanced accuracy for complex layouts (Powered by Gemini 3.8 Flash 2M).
        </p>
      </div>

      {/* 9. Custom Instructions (optional) */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
          {t.customInstructions}
        </label>
        <textarea
          rows={3}
          value={customInstructions}
          disabled={isStreaming}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder={t.customInstructionsPlaceholder}
          className="w-full p-2.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent)] resize-none"
        />
      </div>
    </aside>
  );
};
