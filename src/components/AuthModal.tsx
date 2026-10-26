import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExtractorStore } from '../store/useExtractorStore';
import { translations } from '../utils/i18n';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginUser,
    registerUser,
    loginWithGoogle,
    language,
  } = useExtractorStore();

  const t = translations[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await loginUser(email, password);
      } else if (authModalTab === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp.');
        }
        await registerUser(name, email, password);
      } else if (authModalTab === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccessMessage('Đã gửi mã khôi phục mật khẩu. Vui lòng kiểm tra hộp thư!');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi đăng nhập bằng Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-subtle)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            {authModalTab === 'login' && t.signInTitle}
            {authModalTab === 'register' && t.signUpTitle}
            {authModalTab === 'forgot' && t.forgotPasswordTitle}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
            {authModalTab === 'login' && t.signInSubtitle}
            {authModalTab === 'register' && t.signUpSubtitle}
            {authModalTab === 'forgot' && t.forgotPasswordSubtitle}
          </p>
        </div>

        {/* Google Sign-In Button */}
        {authModalTab !== 'forgot' && (
          <div className="space-y-4 mb-5">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-xs font-semibold text-[var(--text-main)] shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {/* Google SVG Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t.googleSignIn}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-[var(--border-subtle)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--text-subtle)]">
                {t.orContinueWith}
              </span>
              <div className="flex-1 border-t border-[var(--border-subtle)]" />
            </div>
          </div>
        )}

        {/* Error / Success message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                {t.fullName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Nguyen"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              {t.emailAddress}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {authModalTab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--text-main)]">
                  {t.password}
                </label>
                {authModalTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('forgot')}
                    className="text-[11px] text-[var(--accent)] hover:underline font-medium"
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl accent-btn font-semibold text-xs shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>
              {authModalTab === 'login' && (loading ? 'Đang xác thực...' : t.signInButton)}
              {authModalTab === 'register' && (loading ? 'Đang tạo...' : t.signUpButton)}
              {authModalTab === 'forgot' && (loading ? 'Đang gửi...' : t.sendResetLink)}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle between Login, Register, Forgot */}
        <div className="mt-5 text-center text-xs text-[var(--text-muted)]">
          {authModalTab === 'login' && (
            <button
              onClick={() => setAuthModalTab('register')}
              className="text-[var(--accent)] font-semibold hover:underline"
            >
              {t.dontHaveAccount}
            </button>
          )}

          {authModalTab === 'register' && (
            <button
              onClick={() => setAuthModalTab('login')}
              className="text-[var(--accent)] font-semibold hover:underline"
            >
              {t.alreadyHaveAccount}
            </button>
          )}

          {authModalTab === 'forgot' && (
            <button
              onClick={() => setAuthModalTab('login')}
              className="text-[var(--accent)] font-semibold hover:underline"
            >
              {t.backToLogin}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
