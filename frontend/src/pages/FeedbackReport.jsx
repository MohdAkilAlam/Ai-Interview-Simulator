import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInterviewSession } from '../services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

export default function FeedbackReport() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQ, setActiveQ] = useState(null);

  useEffect(() => { loadSession(); }, [id]);

  const loadSession = async () => {
    try {
      const res = await getInterviewSession(id);
      setSession(res.data);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!session) return;
    const lines = [
      `Interview Report - ${session.job_role}`,
      `Type: ${session.interview_type} | Difficulty: ${session.difficulty}`,
      `Overall Score: ${session.overall_score || 0}/10`,
      `Date: ${new Date(session.created_at).toLocaleString()}`,
      '', '--- Questions & Answers ---', '',
    ];
    session.questions.forEach((q, i) => {
      lines.push(`Q${i + 1}: ${q}`);
      lines.push(`Answer: ${session.answers[i] || '(skipped)'}`);
      lines.push(`Score: ${session.scores[i]?.overall || '-'}/10`);
      if (session.scores[i]?.feedback) lines.push(`Feedback: ${session.scores[i].feedback}`);
      lines.push('');
    });
    if (session.strengths?.length) {
      lines.push('--- Strengths ---');
      session.strengths.forEach(s => lines.push(`✓ ${s}`));
      lines.push('');
    }
    if (session.weaknesses?.length) {
      lines.push('--- Areas to Improve ---');
      session.weaknesses.forEach(w => lines.push(`→ ${w}`));
      lines.push('');
    }
    if (session.suggestions?.length) {
      lines.push('--- Suggestions ---');
      session.suggestions.forEach(s => lines.push(`• ${s}`));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${session.job_role.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Session not found</p>
          <Link to="/dashboard" className="btn-primary no-underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const validScores = session.scores.filter(Boolean);
  const avgScores = validScores.length > 0 ? {
    relevance: +(validScores.reduce((a, s) => a + s.relevance, 0) / validScores.length).toFixed(1),
    clarity: +(validScores.reduce((a, s) => a + s.clarity, 0) / validScores.length).toFixed(1),
    technical: +(validScores.reduce((a, s) => a + s.technical_accuracy, 0) / validScores.length).toFixed(1),
    communication: +(validScores.reduce((a, s) => a + s.communication, 0) / validScores.length).toFixed(1),
  } : {};

  const radarData = [
    { subject: 'Relevance', score: avgScores.relevance || 0 },
    { subject: 'Clarity', score: avgScores.clarity || 0 },
    { subject: 'Technical', score: avgScores.technical || 0 },
    { subject: 'Communication', score: avgScores.communication || 0 },
  ];

  const barData = session.questions.map((q, i) => ({
    name: `Q${i + 1}`,
    score: session.scores[i]?.overall || 0,
  }));

  const getColor = (score) => {
    if (score >= 7) return '#059669';
    if (score >= 5) return '#d97706';
    return '#dc2626';
  };

  const getTextColor = (score) => {
    if (score >= 7) return 'text-success';
    if (score >= 5) return 'text-warning';
    return 'text-danger';
  };

  const getGrade = (score) => {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C';
    return 'D';
  };

  // Aggregate speech analysis
  const validSpeech = (session.speech_analyses || []).filter(Boolean);
  const avgWordCount = validSpeech.length > 0
    ? Math.round(validSpeech.reduce((a, s) => a + (s.word_count || 0), 0) / validSpeech.length)
    : 0;
  const allFillers = validSpeech.flatMap(s => s.filler_words || []);
  const fillerCounts = {};
  allFillers.forEach(f => { fillerCounts[f] = (fillerCounts[f] || 0) + 1; });
  const topFillers = Object.entries(fillerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const paces = validSpeech.map(s => s.speaking_pace);
  const dominantPace = paces.length > 0 ? paces.sort((a, b) =>
    paces.filter(v => v === a).length - paces.filter(v => v === b).length
  ).pop() : 'N/A';
  const confidences = validSpeech.map(s => s.confidence_level);
  const dominantConfidence = confidences.length > 0 ? confidences.sort((a, b) =>
    confidences.filter(v => v === a).length - confidences.filter(v => v === b).length
  ).pop() : 'N/A';

  return (
    <div className="min-h-screen pb-8 sm:pb-12 px-4 sm:px-6 mesh-gradient relative" style={{ paddingTop: 'clamp(80px, 12vw, 100px)' }}>
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <span className="section-label inline-block mb-2 sm:mb-3">Report</span>
          <h1 className="heading-serif text-2xl sm:text-3xl md:text-4xl mb-3">
            Interview Report
          </h1>
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
            <span className="tag">{session.interview_type}</span>
            <span className="tag">{session.job_role}</span>
            <span className="tag">{session.difficulty}</span>
          </div>
          <div className="text-text-muted text-[10px] sm:text-xs mt-2">
            {new Date(session.created_at).toLocaleString()}
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-6 sm:p-8 mb-6 sm:mb-8 text-center animate-fade-in shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="text-text-muted text-xs sm:text-sm mb-3 uppercase tracking-wider font-semibold">Overall Performance</div>
          <div className="relative inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 mb-3 sm:mb-4 feedback-score-circle">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={getColor(session.overall_score || 0)}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(session.overall_score || 0) / 10 * 339.3} 339.3`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: getColor(session.overall_score || 0) }}>
                {session.overall_score || 0}
              </div>
              <div className="text-text-muted text-[10px] sm:text-xs">/ 10</div>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold" style={{ color: getColor(session.overall_score || 0) }}>
            Grade: {getGrade(session.overall_score || 0)}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 animate-fade-in animate-fade-in-delay-1 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-center text-text-primary">Skill Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 animate-fade-in animate-fade-in-delay-2 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-center text-text-primary">Question Scores</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} labelStyle={{ color: '#111827' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (<Cell key={i} fill={getColor(entry.score)} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Speech Analysis Section */}
        {validSpeech.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 text-text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
              Speech Analysis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-surface-light rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-text-muted text-[10px] sm:text-xs mb-1">Avg Words/Answer</div>
                <div className="text-xl sm:text-2xl font-bold text-primary">{avgWordCount}</div>
              </div>
              <div className="bg-surface-light rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-text-muted text-[10px] sm:text-xs mb-1">Speaking Pace</div>
                <div className={`text-xl sm:text-2xl font-bold ${dominantPace === 'moderate' ? 'text-success' : 'text-warning'}`}>
                  {dominantPace}
                </div>
              </div>
              <div className="bg-surface-light rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-text-muted text-[10px] sm:text-xs mb-1">Confidence</div>
                <div className={`text-xl sm:text-2xl font-bold ${
                  dominantConfidence === 'high' ? 'text-success' :
                  dominantConfidence === 'moderate' ? 'text-warning' : 'text-danger'
                }`}>
                  {dominantConfidence}
                </div>
              </div>
              <div className="bg-surface-light rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <div className="text-text-muted text-[10px] sm:text-xs mb-1">Total Fillers</div>
                <div className={`text-xl sm:text-2xl font-bold ${allFillers.length <= 3 ? 'text-success' : 'text-danger'}`}>
                  {allFillers.length}
                </div>
              </div>
            </div>
            {topFillers.length > 0 && (
              <div>
                <div className="text-text-muted text-[10px] sm:text-xs uppercase mb-1.5 sm:mb-2 font-semibold">Top Filler Words</div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {topFillers.map(([word, count]) => (
                    <span key={word} className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-danger-light text-danger text-[10px] sm:text-xs font-semibold border border-danger/20">
                      "{word}" × {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 animate-fade-in animate-fade-in-delay-3 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 text-text-primary">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success-light text-success flex items-center justify-center text-[10px] sm:text-xs">✓</div>
              Strengths
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {(session.strengths || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary">
                  <span className="text-success mt-0.5 shrink-0">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 animate-fade-in animate-fade-in-delay-4 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 text-text-primary">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-warning-light text-warning flex items-center justify-center text-[10px] sm:text-xs">→</div>
              Areas to Improve
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {(session.weaknesses || []).map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary">
                  <span className="text-warning mt-0.5 shrink-0">→</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggestions */}
        {session.suggestions?.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 text-text-primary">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-info-light text-primary flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="22"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              Suggestions
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {session.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary">
                  <span className="text-primary mt-0.5 shrink-0">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question Details */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in shadow-sm">
          <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-text-primary">Question-by-Question Review</h3>
          <div className="space-y-1.5 sm:space-y-2">
            {session.questions.map((q, i) => (
              <div key={i}>
                <button
                  onClick={() => setActiveQ(activeQ === i ? null : i)}
                  className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-surface-light hover:bg-surface-lighter transition-all cursor-pointer text-left border-none"
                >
                  <span className={`score-badge text-xs sm:text-sm ${getColor(session.scores[i]?.overall || 0) === '#059669' ? 'score-high' : getColor(session.scores[i]?.overall || 0) === '#d97706' ? 'score-mid' : 'score-low'}`}>
                    {session.scores[i]?.overall || '-'}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-text-primary flex-1 min-w-0 line-clamp-2">{q}</span>
                  <span className="text-text-muted text-xs sm:text-sm shrink-0 ml-1">{activeQ === i ? '▲' : '▼'}</span>
                </button>
                {activeQ === i && (
                  <div className="mt-2 ml-0 sm:ml-16 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-surface-light space-y-2.5 sm:space-y-3 animate-fade-in border border-surface-border feedback-question-detail">
                    <div>
                      <div className="text-[10px] sm:text-xs text-text-muted mb-1 uppercase font-semibold">Your Answer</div>
                      <p className="text-xs sm:text-sm text-text-secondary">{session.answers[i] || '(skipped)'}</p>
                    </div>
                    {session.scores[i] && (
                      <>
                        <div>
                          <div className="text-[10px] sm:text-xs text-text-muted mb-1 uppercase font-semibold">Feedback</div>
                          <p className="text-xs sm:text-sm text-text-secondary">{session.scores[i].feedback}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 feedback-scores-grid">
                          {[
                            { label: 'Relevance', val: session.scores[i].relevance },
                            { label: 'Clarity', val: session.scores[i].clarity },
                            { label: 'Technical', val: session.scores[i].technical_accuracy },
                            { label: 'Communication', val: session.scores[i].communication },
                          ].map(({ label, val }) => (
                            <div key={label} className="bg-white rounded-lg p-2 text-center border border-surface-border">
                              <div className="text-[10px] sm:text-xs text-text-muted">{label}</div>
                              <div className={`text-xs sm:text-sm font-bold ${getTextColor(val)}`}>
                                {val}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {session.speech_analyses?.[i] && (
                      <div>
                        <div className="text-[10px] sm:text-xs text-text-muted mb-1 uppercase font-semibold">Speech</div>
                        <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs text-text-secondary flex-wrap">
                          <span>{session.speech_analyses[i].word_count} words</span>
                          <span>Pace: {session.speech_analyses[i].speaking_pace}</span>
                          <span>Confidence: {session.speech_analyses[i].confidence_level}</span>
                          <span>Fillers: {session.speech_analyses[i].filler_words?.length || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link to="/interview/setup" className="btn-primary no-underline text-sm text-center">
            Practice Again →
          </Link>
          <button onClick={handleExport} className="btn-secondary text-sm">
            Export Report
          </button>
          <Link to="/dashboard" className="btn-secondary no-underline text-sm text-center">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
