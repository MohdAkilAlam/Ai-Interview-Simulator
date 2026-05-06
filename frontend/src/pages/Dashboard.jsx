import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInterviewHistory, getProfile, getInterviewStats, deleteInterview } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [filter, setFilter] = useState('all');

  useScrollReveal();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [histRes, profRes, statsRes] = await Promise.all([
        getInterviewHistory(),
        getProfile(),
        getInterviewStats().catch(() => ({ data: null })),
      ]);
      setHistory(histRes.data.interviews || []);
      if (profRes.data.user) updateUser(profRes.data.user);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteInterview(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      setShowDeleteModal(null);
      const [profRes, statsRes] = await Promise.all([
        getProfile(),
        getInterviewStats().catch(() => ({ data: null })),
      ]);
      if (profRes.data.user) updateUser(profRes.data.user);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const completed = history.filter((h) => h.status === 'completed');
  const totalInterviews = completed.length;
  const avgScore = totalInterviews > 0
    ? +(completed.reduce((a, h) => a + (h.overall_score || 0), 0) / totalInterviews).toFixed(1) : 0;
  const bestScore = totalInterviews > 0
    ? Math.max(...completed.map((h) => h.overall_score || 0)) : 0;
  const inProgress = history.filter((h) => h.status === 'in_progress').length;

  const trendData = completed.slice(0, 10).reverse().map((h, i) => ({
    name: `#${i + 1}`, score: h.overall_score || 0,
  }));

  const typeCounts = {};
  completed.forEach((h) => { typeCounts[h.interview_type] = (typeCounts[h.interview_type] || 0) + 1; });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const pieColors = ['#2563eb', '#6366f1', '#059669', '#d97706'];

  const difficultyBarData = stats?.difficulty_breakdown?.map((d) => ({
    name: d.difficulty, count: d.count, avg: d.avg_score,
  })) || [];

  const getScoreColor = (score) => {
    if (score >= 7) return 'text-success';
    if (score >= 5) return 'text-warning';
    return 'text-danger';
  };

  const filteredHistory = filter === 'all' ? history
    : history.filter((h) => h.status === filter);

  const statCards = [
    { label: 'Completed', value: totalInterviews, color: 'text-primary', bg: 'bg-info-light',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg> },
    { label: 'Average', value: `${avgScore}/10`, color: getScoreColor(avgScore), bg: avgScore >= 7 ? 'bg-success-light' : avgScore >= 5 ? 'bg-warning-light' : 'bg-danger-light',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { label: 'Best Score', value: `${bestScore}/10`, color: getScoreColor(bestScore), bg: bestScore >= 7 ? 'bg-success-light' : bestScore >= 5 ? 'bg-warning-light' : 'bg-danger-light',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    { label: 'In Progress', value: inProgress, color: 'text-warning', bg: 'bg-warning-light',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  ];

  const tooltipStyle = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    padding: '8px 12px',
    fontSize: 13,
  };

  return (
    <div className="min-h-screen pb-12 sm:pb-16 mesh-gradient w-full" style={{ paddingTop: 'clamp(88px, 14vw, 120px)' }}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Top Bar: Welcome + CTA ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fade-in">
          <div>
            <p className="text-text-muted text-xs sm:text-sm mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="heading-serif text-2xl sm:text-3xl lg:text-[2.25rem]">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {stats?.streak > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-surface-border rounded-full pl-2.5 sm:pl-3 pr-3 sm:pr-4 py-1.5 sm:py-2 shadow-sm">
                <span className="text-base sm:text-lg">🔥</span>
                <span className="text-xs sm:text-sm font-bold text-warning">{stats.streak} day streak</span>
              </div>
            )}
            <Link to="/interview/setup" className="btn-primary no-underline !py-2 sm:!py-2.5 !px-4 sm:!px-6 text-xs sm:text-sm">
              New Interview →
            </Link>
          </div>
        </div>

        {/* ── Stat Cards Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fade-in animate-fade-in-delay-1 stat-card-grid">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-text-muted text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                  {s.icon}
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Two-Column: Sidebar + Main ── */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 sm:gap-6 items-start dashboard-grid">

          {/* Left Sidebar — Profile Summary Card */}
          <div className="space-y-4 animate-fade-in animate-fade-in-delay-2 dashboard-sidebar">
            {/* Profile mini-card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-5 sm:p-6 shadow-sm text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 shadow-lg shadow-primary/15">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">{user?.name}</h3>
              <p className="text-text-muted text-xs mt-0.5 mb-3 sm:mb-4 truncate">{user?.email}</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-surface-light rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2">
                  <div className="text-base sm:text-lg font-bold text-primary">{user?.total_interviews || 0}</div>
                  <div className="text-text-muted text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold mt-0.5">Sessions</div>
                </div>
                <div className="bg-surface-light rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2">
                  <div className={`text-base sm:text-lg font-bold ${getScoreColor(user?.average_score || 0)}`}>{user?.average_score || 0}</div>
                  <div className="text-text-muted text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold mt-0.5">Avg Score</div>
                </div>
              </div>
              <Link to="/profile" className="block mt-3 sm:mt-4 text-xs text-primary font-semibold hover:underline no-underline">
                Edit Profile →
              </Link>
            </div>

            {/* Quick Start */}
            <div className="bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-primary/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full pointer-events-none" />
              <h4 className="font-semibold text-sm mb-1 relative z-10">Ready for another round?</h4>
              <p className="text-white/70 text-xs mb-3 sm:mb-4 leading-relaxed relative z-10">Practice makes perfect. Start a new session now.</p>
              <Link to="/interview/setup" className="flex items-center justify-center gap-2 bg-white text-primary font-semibold text-sm py-2 sm:py-2.5 rounded-full no-underline hover:bg-white/90 transition-colors relative z-10 shadow-sm">
                Start Interview →
              </Link>
            </div>
          </div>

          {/* Right — Main Content */}
          <div className="space-y-4 sm:space-y-6 dashboard-main">

            {/* Charts Row */}
            {trendData.length > 1 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 animate-fade-in animate-fade-in-delay-2">
                {/* Score Trend */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-semibold text-xs sm:text-sm text-text-primary">Score Trend</h3>
                    <span className="text-[9px] sm:text-[10px] text-text-muted bg-surface-light rounded-full px-2 py-0.5 font-medium">Last {trendData.length}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#111827', fontWeight: 600 }} />
                      <Area type="monotone" dataKey="score" stroke="#2563eb" fill="url(#scoreGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Interview Types */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-5 shadow-sm">
                  <h3 className="font-semibold text-xs sm:text-sm text-text-primary mb-3 sm:mb-4">Interview Types</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={4}
                        label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {pieData.map((_, i) => (<Cell key={i} fill={pieColors[i % pieColors.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Difficulty */}
                {difficultyBarData.length > 0 && (
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-5 shadow-sm sm:col-span-2 xl:col-span-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-text-primary mb-3 sm:mb-4">By Difficulty</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={difficultyBarData}>
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#111827', fontWeight: 600 }} />
                        <Bar dataKey="avg" name="Avg Score" radius={[6, 6, 0, 0]} barSize={32}>
                          {difficultyBarData.map((entry, i) => (
                            <Cell key={i} fill={entry.avg >= 7 ? '#059669' : entry.avg >= 5 ? '#d97706' : '#dc2626'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* History Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border shadow-sm animate-fade-in animate-fade-in-delay-3">
              {/* History Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-border">
                <h3 className="font-semibold text-sm sm:text-base text-text-primary">Interview History</h3>
                <div className="flex items-center gap-1 bg-surface-light rounded-full p-0.5 w-full sm:w-auto">
                  {['all', 'completed', 'in_progress'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
                        filter === f
                          ? 'bg-white text-primary shadow-sm'
                          : 'bg-transparent text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : 'In Progress'}
                    </button>
                  ))}
                </div>
              </div>

              {/* History Body */}
              <div className="p-1.5 sm:p-2">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 px-4 sm:px-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-lighter flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" x2="12" y1="19" y2="22"/>
                      </svg>
                    </div>
                    <p className="text-text-secondary text-sm font-medium mb-1">
                      {filter === 'all' ? 'No interviews yet' : `No ${filter.replace('_', ' ')} interviews`}
                    </p>
                    <p className="text-text-muted text-xs mb-4 sm:mb-5">Start your first practice session to see results here.</p>
                    {filter === 'all' && (
                      <Link to="/interview/setup" className="btn-primary no-underline text-sm !py-2 !px-5">
                        Start Interview
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-surface-border">
                    {filteredHistory.map((h) => (
                      <div key={h.id} className="group">
                        <div className="flex items-center gap-2.5 sm:gap-4 px-2.5 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl mx-0.5 sm:mx-1 hover:bg-surface-light transition-colors">
                          <Link
                            to={h.status === 'completed' ? `/interview/feedback/${h.id}` : `/interview/session/${h.id}`}
                            className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 no-underline"
                          >
                            {/* Status Icon */}
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                              h.status === 'completed' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                            }`}>
                              {h.status === 'completed' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-text-primary text-xs sm:text-sm truncate">{h.job_role}</div>
                              <div className="text-text-muted text-[10px] sm:text-xs mt-0.5 flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                <span className="bg-surface-lighter px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium">{h.interview_type}</span>
                                <span className="bg-surface-lighter px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium hidden sm:inline">{h.difficulty}</span>
                                <span className="text-text-muted">·</span>
                                <span>{new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>

                            {/* Score */}
                            {h.overall_score != null && (
                              <div className="text-right shrink-0">
                                <div className={`text-lg sm:text-xl font-bold tabular-nums ${getScoreColor(h.overall_score)}`}>
                                  {h.overall_score}
                                </div>
                                <div className="text-text-muted text-[9px] sm:text-[10px]">/10</div>
                              </div>
                            )}
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(h.id); }}
                            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all bg-transparent border-none cursor-pointer p-1.5 rounded-lg hover:bg-danger-light shrink-0"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowDeleteModal(null)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-6 sm:p-8 max-w-sm w-full relative z-10 animate-fade-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-danger-light text-danger flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1 text-text-primary">Delete this interview?</h3>
              <p className="text-text-muted text-xs sm:text-sm">This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={!!deletingId}
                className="flex-1 py-2.5 px-4 rounded-full font-semibold text-sm bg-danger text-white border-none cursor-pointer transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
