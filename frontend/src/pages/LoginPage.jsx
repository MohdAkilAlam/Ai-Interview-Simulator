import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-accent relative items-center justify-center p-8 xl:p-12 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 -top-20 -left-20 blur-3xl" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 -bottom-10 -right-10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.06),transparent_70%)]" />

        <div className="relative z-10 text-white max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="text-3xl xl:text-4xl font-semibold mb-4 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Practice makes confidence.
          </h2>
          <p className="text-white/60 leading-relaxed text-sm xl:text-base">
            Sign in to access your interview history, review your feedback reports, and continue improving your interview skills.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['#6366f1', '#059669', '#d97706'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c }}>
                  {['J', 'K', 'L'][i]}
                </div>
              ))}
            </div>
            <span className="text-white/40 text-sm">Join thousands of job seekers</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-16 sm:py-20 bg-surface-light auth-form-container">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2 no-underline mb-6 sm:mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/15">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-text-primary">InterviewAI</span>
            </Link>
            <h1 className="heading-serif text-2xl sm:text-3xl mb-2">Welcome back</h1>
            <p className="text-text-secondary text-sm sm:text-base">Sign in to continue your interview practice</p>
          </div>

          {error && (
            <div className="bg-danger-light border border-danger/20 rounded-xl px-4 py-3 text-danger text-xs sm:text-sm mb-5 sm:mb-6 flex items-center gap-2 animate-fade-in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-text-secondary mb-1.5 block">Email</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-text-secondary mb-1.5 block">Password</label>
              <input
                id="login-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              id="login-submit"
              type="submit"
              className="btn-primary w-full !py-2.5 sm:!py-3 mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-text-muted text-xs sm:text-sm mt-6 sm:mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark font-semibold no-underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
