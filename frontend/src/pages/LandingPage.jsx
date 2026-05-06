import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';

const features = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
    ),
    title: 'Different interview stages',
    desc: 'Prepare for recruiter calls, hiring manager interviews, technical rounds, behavioral rounds, and final interviews.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
        <path d="M10 9H8"/>
      </svg>
    ),
    title: 'Resume-informed follow-ups',
    desc: 'The simulation uses your experience and achievements to ask more specific and challenging questions.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: 'Role-specific practice',
    desc: 'Job descriptions shape the direction of the interview so the conversation stays close to the actual role.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: 'Instant AI feedback',
    desc: 'Receive detailed scores, strengths, weaknesses, and improvement tips after each answer.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    title: 'Designed for practical prep',
    desc: 'Use InterviewAI for software, product, sales, design, HR, operations, marketing, and many other roles.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Useful for repeated practice',
    desc: 'Run multiple sessions for the same role, improve your answers, and track how your scores change.',
  },
];

const benefits = [
  'Practice different interview stages with the right tone and question style.',
  'Use your own resume and target role to make the simulation more relevant.',
  'Answer one question at a time like a real interview conversation.',
  'Spot weak answers before you speak to an actual recruiter or hiring manager.',
  'Repeat the same role in different rounds to sharpen your story and confidence.',
];

const steps = [
  { num: '01', title: 'Set up your role', desc: 'Provide the target role and your background so the interview can stay relevant from the first question.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { num: '02', title: 'Enter the interview room', desc: 'The interviewer asks questions, follows up on your answers, and finishes with a detailed analysis.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { num: '03', title: 'Review your feedback', desc: 'Get detailed scores and actionable improvement tips for each question and your overall performance.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { num: '04', title: 'Track your progress', desc: 'Monitor improvement over repeated sessions and watch your scores rise across different roles.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
];

export default function LandingPage() {
  const { user } = useAuth();
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden w-full">

      {/* ═══════════════ Hero ═══════════════ */}
      <section className="relative hero-bg w-full" style={{ paddingTop: 'clamp(100px, 18vw, 160px)', paddingBottom: 'clamp(60px, 12vw, 100px)' }}>
        {/* Decorative orbs */}
        <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.08)', top: '-10%', right: '-8%', animationDelay: '0s' }} />
        <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.06)', bottom: '10%', left: '-5%', animationDelay: '-6s' }} />

        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 md:px-10 text-center relative z-10">
          <div className="animate-fade-in">
            <span className="inline-block section-label mb-4 sm:mb-5 bg-info-light px-3 sm:px-4 py-1.5 rounded-full text-xs">
              AI-Powered Interview Practice
            </span>
          </div>

          <h1 className="heading-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.8rem] mb-5 sm:mb-7 animate-fade-in animate-fade-in-delay-1 leading-tight">
            Run interview simulations that{' '}
            <br className="hidden sm:block" />
            actually <em className="text-primary not-italic font-semibold" style={{ fontStyle: 'italic' }}>match the role</em> you want.
          </h1>

          {/* Mobile-only: ensure buttons are visible without scrolling */}

          <p className="text-text-secondary text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 animate-fade-in animate-fade-in-delay-2 leading-relaxed px-2">
            Paste the job description, add your resume, choose the interview stage, and run a tailored mock interview that feels closer to a real hiring process.
          </p>

          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap animate-fade-in animate-fade-in-delay-3">
            {user ? (
              <Link to="/interview/setup" className="btn-primary text-sm sm:text-base !py-3 sm:!py-3.5 !px-7 sm:!px-9 no-underline">
                Start Interview →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-sm sm:text-base !py-3 sm:!py-3.5 !px-7 sm:!px-9 no-underline">
                  Get Started Free →
                </Link>
                <Link to="/login" className="btn-secondary text-sm sm:text-base !py-3 sm:!py-3.5 !px-6 sm:!px-8 no-underline">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Social proof hint */}
          <div className="mt-8 sm:mt-12 animate-fade-in animate-fade-in-delay-4 flex items-center justify-center gap-4 sm:gap-6 text-text-muted text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['#6366f1', '#2563eb', '#059669'].map((c, i) => (
                  <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold shadow-sm" style={{ background: c }}>
                    {['A', 'M', 'S'][i]}
                  </div>
                ))}
              </div>
              <span>Trusted by job seekers</span>
            </div>
            <span className="hidden sm:inline text-surface-border">|</span>
            <span className="hidden sm:inline">Free to get started</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ Benefits ═══════════════ */}
      <section className="relative py-16 sm:py-20 md:py-24 px-5 sm:px-8 md:px-10 w-full">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14 reveal">
            <span className="section-label inline-block mb-3 sm:mb-4">Why InterviewAI</span>
            <h2 className="heading-serif text-2xl sm:text-3xl md:text-[2.5rem]">
              A focused way to prepare before<br className="hidden md:block" /> the real interview.
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3 reveal">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="reveal-child flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-light border border-surface-border hover:border-primary/20 transition-all duration-300 hover:shadow-sm"
                style={{ '--delay': `${i * 0.08}s` }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success-light flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ How It Works ═══════════════ */}
      <section className="relative py-16 sm:py-20 md:py-24 px-5 sm:px-8 md:px-10 w-full mesh-gradient">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 reveal">
            <span className="section-label inline-block mb-3 sm:mb-4">How It Works</span>
            <h2 className="heading-serif text-2xl sm:text-3xl md:text-[2.5rem] mb-3">
              Set up the role context, then start the simulation.
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm sm:text-base">
              Add enough detail for the interviewer to ask sharper questions and evaluate your answers in the right context.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 reveal">
            {steps.map((item, i) => (
              <div
                key={item.num}
                className="reveal-child card flex items-start gap-4 sm:gap-5 hover-lift"
                style={{ '--delay': `${i * 0.1}s` }}
              >
                <div className="feature-icon shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">Step {item.num}</div>
                  <h3 className="text-sm sm:text-base font-semibold mb-1.5 text-text-primary">{item.title}</h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Features Grid ═══════════════ */}
      <section className="relative py-16 sm:py-20 md:py-24 px-5 sm:px-8 md:px-10 w-full">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 reveal">
            <span className="section-label inline-block mb-3 sm:mb-4">Features</span>
            <h2 className="heading-serif text-2xl sm:text-3xl md:text-[2.5rem] mb-3">
              Built for realistic interview simulation,<br className="hidden md:block" /> not generic question drills.
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm sm:text-base">
              InterviewAI focuses on relevance, repetition, and feedback so you can improve with each session.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 reveal">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="reveal-child card hover-lift"
                style={{ '--delay': `${i * 0.07}s` }}
              >
                <div className="feature-icon mb-4 sm:mb-5">
                  {feat.icon}
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-2 text-text-primary">{feat.title}</h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative py-16 sm:py-20 md:py-24 px-5 sm:px-8 md:px-10 w-full mesh-gradient">
        <div className="reveal-scale rounded-2xl sm:rounded-3xl w-full max-w-4xl mx-auto py-10 sm:py-16 px-6 sm:px-10 text-center bg-white border border-surface-border shadow-sm relative overflow-hidden">
          {/* Decorative gradient corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full pointer-events-none" />

          <h2 className="heading-serif text-2xl sm:text-3xl mb-3 sm:mb-4 relative z-10">
            Interview simulation built around real hiring conversations.
          </h2>
          <p className="text-text-secondary mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed text-sm sm:text-base relative z-10">
            Paste the role, add your resume, run the simulation, and review focused feedback that helps you prepare for the next interview round.
          </p>
          <Link
            to={user ? '/interview/setup' : '/register'}
            className="btn-primary text-sm sm:text-base !py-3 sm:!py-3.5 !px-8 sm:!px-10 no-underline relative z-10"
          >
            {user ? 'Start Interview →' : 'Create Free Account →'}
          </Link>
        </div>
      </section>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="footer relative py-8 sm:py-12 px-5 sm:px-8 md:px-10 w-full">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-white font-semibold">InterviewAI</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="no-underline hover:text-white">Home</Link>
              <Link to="/login" className="no-underline hover:text-white">Sign In</Link>
              <Link to="/register" className="no-underline hover:text-white">Get Started</Link>
            </div>
            <div className="text-xs sm:text-sm opacity-50">
              © {new Date().getFullYear()} InterviewAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
