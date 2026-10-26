import React from 'react';
import {
  Compass,
  FileText,
  CheckSquare,
  Layers,
  Folder,
  FileEdit,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  Kanban,
  Users,
  Award,
  TrendingUp,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useExtractorStore, SidebarMenuId } from '../store/useExtractorStore';
import { translations } from '../utils/i18n';

interface NavItem {
  id: SidebarMenuId;
  labelKey: keyof typeof translations.en;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { activeMenu, setActiveMenu, language } = useExtractorStore();
  const t = translations[language];

  const contentCreationItems: NavItem[] = [
    { id: 'materials', labelKey: 'materials', icon: FileText },
    { id: 'quizzes', labelKey: 'quizzes', icon: CheckSquare },
    { id: 'flashcards', labelKey: 'flashcards', icon: Layers },
    { id: 'collections', labelKey: 'collections', icon: Folder },
  ];

  const studyToolsItems: NavItem[] = [
    { id: 'notes', labelKey: 'notes', icon: FileEdit },
    { id: 'reader', labelKey: 'reader', icon: BookOpen },
    { id: 'tutors', labelKey: 'tutors', icon: GraduationCap },
    { id: 'pomodoro', labelKey: 'pomodoro', icon: Clock },
  ];

  const planningItems: NavItem[] = [
    { id: 'planner', labelKey: 'planner', icon: Calendar },
    { id: 'kanban', labelKey: 'kanbanBoard', icon: Kanban },
  ];

  const socialItems: NavItem[] = [
    { id: 'study-groups', labelKey: 'studyGroups', icon: Users },
    { id: 'achievements', labelKey: 'achievements', icon: Award },
    { id: 'statistics', labelKey: 'statistics', icon: TrendingUp },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-5">
      <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-[var(--text-subtle)] mb-1.5">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]'}`} />
              <span>{t[item.labelKey] as string}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-56 flex-shrink-0 h-screen sticky top-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col justify-between py-4 px-3 overflow-y-auto select-none">
      <div>
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-4 h-4 fill-white"
              viewBox="0 0 24 24"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Zm0-13a5 5 0 1 0 5 5 5.006 5.006 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[var(--text-main)] leading-none">
              Manabi
            </h1>
            <p className="text-[10px] text-[var(--text-subtle)] mt-0.5 font-medium">
              AI Study Studio
            </p>
          </div>
        </div>

        {/* Explore Button */}
        <div className="mb-5">
          <button
            onClick={() => setActiveMenu('explore')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
              activeMenu === 'explore'
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
            }`}
          >
            <Compass className={`w-4 h-4 ${activeMenu === 'explore' ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]'}`} />
            <span>{t.explore}</span>
          </button>
        </div>

        {/* Nav Groups */}
        {renderNavGroup(t.contentCreation, contentCreationItems)}
        {renderNavGroup(t.studyTools, studyToolsItems)}
        {renderNavGroup(t.planningOrg, planningItems)}
        {renderNavGroup(t.socialProgress, socialItems)}
      </div>

      {/* Account Section */}
      <div className="pt-3 border-t border-[var(--border-subtle)]">
        <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-[var(--text-subtle)] mb-1">
          {t.account}
        </p>
        <button
          onClick={() => setActiveMenu('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
            activeMenu === 'settings'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
          }`}
        >
          <Settings className="w-4 h-4 text-[var(--text-subtle)]" />
          <span>{t.settings}</span>
        </button>
      </div>
    </aside>
  );
};
