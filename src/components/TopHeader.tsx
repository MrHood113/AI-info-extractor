import React, { useState } from 'react';
import {
  Search,
  Bell,
  Palette,
  Globe,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  Check,
  Sparkles,
} from 'lucide-react';
import { useExtractorStore, AppTheme } from '../store/useExtractorStore';
import { translations, Language } from '../utils/i18n';

export const TopHeader: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    user,
    logoutUser,
    setAuthModalOpen,
    setAuthModalTab,
    unreadNotifications,
    searchQuery,
    setSearchQuery,
  } = useExtractorStore();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const t = translations[language];

  const themes: { id: AppTheme; label: string; color: string; accentColor: string }[] = [
    { id: 'warm-cream', label: t.themeWarmSand, color: '#FAF7F2', accentColor: '#B85028' },
    { id: 'clean-white', label: t.themeModernWhite, color: '#F8FAFC', accentColor: '#2563EB' },
    { id: 'matcha-sage', label: t.themeMatchaSage, color: '#F4F8F4', accentColor: '#2D6A4F' },
    { id: 'rose-peach', label: t.themeRosePeach, color: '#FFF8F6', accentColor: '#D94E41' },
    { id: 'sunset-lilac', label: t.themeSunsetLilac, color: '#FAF7FD', accentColor: '#7C3AED' },
    { id: 'cozy-dark', label: t.themeCozyDark, color: '#1A1816', accentColor: '#D97736' },
  ];

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-app)] select-none">
      {/* Search Input */}
      <div className="relative w-72 sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent)] transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          title="Thông báo"
          className="relative p-1.5 rounded-full hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Theme / Background Color Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setThemeDropdownOpen(!themeDropdownOpen);
              setLangDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            title="Đổi màu giao diện (Theme)"
            className="p-1.5 rounded-full hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-bold text-[var(--text-subtle)] uppercase">
                Màu nền giao diện
              </div>
              <div className="mt-1 space-y-1 px-1.5">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setTheme(th.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      theme === th.id
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                        : 'text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: th.color, boxShadow: `0 0 0 2px ${th.accentColor}` }}
                      />
                      <span>{th.label}</span>
                    </div>
                    {theme === th.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher (VI / EN) */}
        <div className="relative">
          <button
            onClick={() => {
              setLangDropdownOpen(!langDropdownOpen);
              setThemeDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            title="Chuyển ngôn ngữ (Language)"
            className="flex items-center gap-1 p-1.5 rounded-full hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-xs font-medium"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase text-[11px] font-bold">{language}</span>
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-1.5 z-50">
              <button
                onClick={() => {
                  setLanguage('vi');
                  setLangDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                  language === 'vi'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                <span>🇻🇳 Tiếng Việt</span>
                {language === 'vi' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setLangDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                  language === 'en'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                <span>🇬🇧 English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Pill (Matches Screenshot!) */}
        <div className="relative">
          {user ? (
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setThemeDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[var(--bg-card-subtle)] transition-colors"
            >
              {/* Circular Avatar with 'M' letter like screenshot */}
              <div className="w-7 h-7 rounded-full bg-slate-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </div>

              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-[var(--text-main)] line-clamp-1">
                  {user.name}
                </span>
                <span className="text-[10px] text-[var(--text-subtle)] line-clamp-1">
                  {user.email}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-subtle)] ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalTab('login');
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full accent-btn text-xs font-semibold shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </button>
          )}

          {user && userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-2 z-50">
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <p className="text-xs font-bold text-[var(--text-main)]">{user.name}</p>
                <p className="text-[11px] text-[var(--text-subtle)] font-mono truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
