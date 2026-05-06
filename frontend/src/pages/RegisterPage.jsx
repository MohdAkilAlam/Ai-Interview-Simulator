import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent via-accent-dark to-primary relative items-center justify-center p-8 xl:p-12 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 -top-20 -right-20 blur-3xl" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 -bottom-10 -left-10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.06),transparent_70%)]" />

        <div className="relative z-10 text-white max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="text-3xl xl:text-4xl font-semibold mb-4 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Start your interview prep journey.
          </h2>
          <p className="text-white/60 leading-relaxed text-sm xl:text-base">
            Create your free account and get access to AI-powered interview practice, detailed feedback, and performance tracking.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-3">
            {[
              'AI-generated questions tailored to your role',
              'Instant scoring and feedback on every answer',
              'Track your progress over time',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-white/50 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-16 sm:py-20 bg-surface-light auth-form-container">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2 no-underline mb-6 sm:mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md shadow-accent/15">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-text-primary">InterviewAI</span>
            </Link>
            <h1 className="heading-serif text-2xl sm:text-3xl mb-2">Create account</h1>
            <p className="text-text-secondary text-sm sm:text-base">Start practicing for your next interview</p>
          </div>

          {error && (
            <div className="bg-danger-light border border-danger/20 rounded-xl px-4 py-3 text-danger text-xs sm:text-sm mb-5 sm:mb-6 flex items-center gap-2 animate-fade-in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-text-secondary mb-1.5 block">Full Name</label>
              <input
                id="register-name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-text-secondary mb-1.5 block">Email</label>
              <input
                id="register-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-text-secondary mb-1.5 block">Password</label>
                <input
                  id="register-password"
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-semibold text-text-secondary mb-1.5 block">Confirm</label>
                <input
                  id="register-confirm-password"
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
            <button
              id="register-submit"
              type="submit"
              className="btn-primary w-full !py-2.5 sm:!py-3 mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-text-muted text-xs sm:text-sm mt-6 sm:mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-dark font-semibold no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
