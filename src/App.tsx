import React from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { StudioCenter } from './components/StudioCenter';
import { StudioRightSidebar } from './components/StudioRightSidebar';
import { AuthModal } from './components/AuthModal';
import { FlashcardsView, PomodoroView, KanbanView, TutorView } from './components/views/OtherViews';
import { useExtractorStore } from './store/useExtractorStore';

export const App: React.FC = () => {
  const { activeMenu } = useExtractorStore();

  return (
    <div className="flex h-screen w-full bg-[var(--bg-app)] text-[var(--text-main)] overflow-hidden font-sans">
      {/* 1. Left Sidebar (Replaces Old Navbar) */}
      <Sidebar />

      {/* 2. Main Content & Right Sidebar Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header with Search, Bell, Theme Switcher, Language Switcher, User Profile Pill */}
        <TopHeader />

        {/* Dynamic Studio Layout based on selected Menu */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Quiz / Extractor Studio (Default from Image) */}
          {(activeMenu === 'quizzes' ||
            activeMenu === 'explore' ||
            activeMenu === 'materials' ||
            activeMenu === 'collections' ||
            activeMenu === 'settings') && (
            <>
              <StudioCenter />
              <StudioRightSidebar />
            </>
          )}

          {/* Flashcards View */}
          {activeMenu === 'flashcards' && <FlashcardsView />}

          {/* Pomodoro Focus Timer */}
          {activeMenu === 'pomodoro' && <PomodoroView />}

          {/* Kanban Planning Board */}
          {(activeMenu === 'kanban' || activeMenu === 'planner') && <KanbanView />}

          {/* AI Tutor Chat */}
          {(activeMenu === 'tutors' || activeMenu === 'study-groups') && <TutorView />}

          {/* Notes & Reader */}
          {(activeMenu === 'notes' || activeMenu === 'reader' || activeMenu === 'achievements' || activeMenu === 'statistics') && (
            <FlashcardsView />
          )}
        </div>
      </div>

      {/* 3. Authentication Modal (JWT Login, Register, Google Sign-In, Forgot Password) */}
      <AuthModal />
    </div>
  );
};
