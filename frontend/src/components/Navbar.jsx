import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`glass-strong fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between nav-inner">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 no-underline group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-base sm:text-lg font-bold text-text-primary tracking-tight">InterviewAI</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 no-underline ${
                    isActive('/dashboard')
                      ? 'bg-info-light text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/interview/setup"
                  className="btn-primary text-sm !py-2 !px-5 no-underline ml-2"
                >
                  Start Interview
                </Link>
                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-surface-border">
                  <Link
                    to="/profile"
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-semibold no-underline transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                    title="Profile Settings"
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-text-muted hover:text-danger transition-colors duration-300 text-sm bg-transparent border-none cursor-pointer font-medium px-2 py-1"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-text-primary transition-all duration-300 no-underline text-sm font-medium px-4 py-2 rounded-full hover:bg-surface-lighter"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm !py-2 !px-5 no-underline ml-1"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 bg-transparent border-none cursor-pointer p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" />
        <div
          className={`absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-surface-border p-5 sm:p-6 flex flex-col gap-2 shadow-xl transition-all duration-300 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-lg font-semibold shadow-md">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-text-primary truncate">{user.name}</div>
                  <div className="text-text-muted text-xs truncate">{user.email}</div>
                </div>
              </div>
              <Link to="/dashboard" className="text-text-secondary hover:text-primary no-underline font-medium py-2.5 px-3 rounded-xl hover:bg-surface-lighter transition-colors flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Dashboard
              </Link>
              <Link to="/interview/setup" className="text-text-secondary hover:text-primary no-underline font-medium py-2.5 px-3 rounded-xl hover:bg-surface-lighter transition-colors flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start Interview
              </Link>
              <Link to="/profile" className="text-text-secondary hover:text-primary no-underline font-medium py-2.5 px-3 rounded-xl hover:bg-surface-lighter transition-colors flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-danger hover:bg-danger-light font-medium py-2.5 px-3 rounded-xl bg-transparent border-none cursor-pointer transition-colors flex items-center gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary w-full text-center no-underline">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary w-full text-center no-underline">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
