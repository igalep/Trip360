import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-app font-body text-text-main min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 sm:p-10 border border-zinc-800 shadow-2xl space-y-8">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-3xl text-emerald-400">account_balance_wallet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-wider">
            {isLogin ? 'Manage your personal finance & trip budgets' : 'Start tracking multi-currency expenses today'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-400 text-xs font-semibold flex items-center gap-3"
            data-testid="auth-error"
          >
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                  person
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                  data-testid="auth-name-input"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                mail
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                data-testid="auth-email-input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                data-testid="auth-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="auth-submit-btn"
            >
              {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="w-full py-3 text-xs text-zinc-400 hover:text-white font-semibold transition-colors uppercase tracking-wider text-center block"
              data-testid="auth-toggle-mode-btn"
            >
              {isLogin ? 'Create new account' : 'Sign in instead'}
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-8 text-center text-xs text-zinc-600 font-semibold tracking-widest uppercase">
        &copy; BudgetControl 2026
      </footer>
    </div>
  );
};
