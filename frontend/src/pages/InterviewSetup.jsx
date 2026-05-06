import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../services/api';

const interviewTypes = [
  {
    id: 'HR',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'HR Interview',
    desc: 'Behavioral & personality fit questions',
  },
  {
    id: 'Technical',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: 'Technical',
    desc: 'Coding, system design & CS fundamentals',
  },
  {
    id: 'Behavioral',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
    ),
    title: 'Behavioral',
    desc: 'STAR method & situational questions',
  },
];

const jobRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'Mobile Developer',
  'Machine Learning Engineer', 'Cloud Architect', 'QA Engineer',
];

const difficulties = [
  { id: 'Beginner', label: 'Beginner', color: 'text-success', bgColor: 'bg-success-light' },
  { id: 'Intermediate', label: 'Intermediate', color: 'text-warning', bgColor: 'bg-warning-light' },
  { id: 'Advanced', label: 'Advanced', color: 'text-danger', bgColor: 'bg-danger-light' },
];

export default function InterviewSetup() {
  const [type, setType] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!type || !role || !difficulty) {
      setError('Please select all options');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await startInterview({
        interview_type: type,
        job_role: role,
        difficulty,
        num_questions: numQuestions,
      });
      navigate(`/interview/session/${res.data.interview_id}`, {
        state: {
          questions: res.data.questions,
          interviewType: type,
          jobRole: role,
          difficulty,
          interviewId: res.data.interview_id,
        },
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 sm:pb-16 px-4 sm:px-6 md:px-10 mesh-gradient w-full" style={{ paddingTop: 'clamp(88px, 14vw, 120px)' }}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <span className="section-label inline-block mb-2 sm:mb-3">Setup</span>
          <h1 className="heading-serif text-2xl sm:text-3xl md:text-4xl mb-2">
            Set up your interview
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">Customize your practice session for the most relevant experience</p>
        </div>

        {error && (
          <div className="bg-danger-light border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm mb-6 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Interview Type */}
        <div className="mb-6 sm:mb-8 animate-fade-in animate-fade-in-delay-1">
          <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
            Interview Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {interviewTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`card text-left cursor-pointer border-2 transition-all ${
                  type === t.id
                    ? 'border-primary glow-primary'
                    : 'border-transparent hover:border-surface-border'
                }`}
              >
                <div className="feature-icon mb-3">
                  {t.icon}
                </div>
                <div className="font-semibold text-text-primary text-sm sm:text-base">{t.title}</div>
                <div className="text-text-secondary text-xs sm:text-sm mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Job Role */}
        <div className="mb-6 sm:mb-8 animate-fade-in animate-fade-in-delay-2">
          <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
            Job Role
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {jobRoles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  role === r
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/15'
                    : 'bg-white text-text-secondary border-surface-border hover:border-primary/50 hover:text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-6 sm:mb-8 animate-fade-in animate-fade-in-delay-3">
          <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-bold">3</span>
            Difficulty Level
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 setup-difficulty">
            {difficulties.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`card text-center cursor-pointer border-2 transition-all ${
                  difficulty === d.id
                    ? 'border-primary glow-primary'
                    : 'border-transparent hover:border-surface-border'
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${d.bgColor} flex items-center justify-center mx-auto mb-2`}>
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                    d.id === 'Beginner' ? 'bg-success' : d.id === 'Intermediate' ? 'bg-warning' : 'bg-danger'
                  }`} />
                </div>
                <div className={`font-semibold text-xs sm:text-base ${d.color}`}>{d.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="mb-8 sm:mb-10 animate-fade-in animate-fade-in-delay-4">
          <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-bold">4</span>
            Number of Questions
          </h2>
          <div className="flex gap-2 sm:gap-3 setup-question-count">
            {[3, 5, 7, 10].map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all cursor-pointer border ${
                  numQuestions === n
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/15'
                    : 'bg-white text-text-secondary border-surface-border hover:border-primary/50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Start */}
        <button
          id="start-interview-btn"
          onClick={handleStart}
          disabled={loading || !type || !role || !difficulty}
          className="btn-primary w-full !py-3.5 sm:!py-4 text-base sm:text-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Questions...
            </span>
          ) : (
            'Start Interview →'
          )}
        </button>
      </div>
    </div>
  );
}
