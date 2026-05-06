import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const [activeTab, setActiveTab] = useState('profile');

  useScrollReveal();

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    if (!name.trim()) { setProfileError('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await updateProfile({ name: name.trim() });
      updateUser(res.data.user);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (passwords.new !== passwords.confirm) { setPwError('New passwords do not match'); return; }
    if (passwords.new.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      await changePassword({ current_password: passwords.current, new_password: passwords.new });
      setPwMsg('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'security', label: 'Security', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  ];

  return (
    <div className="min-h-screen pb-12 sm:pb-16 mesh-gradient w-full" style={{ paddingTop: 'clamp(88px, 14vw, 120px)' }}>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/dashboard" className="text-text-muted hover:text-primary text-xs sm:text-sm no-underline transition-colors">Dashboard</Link>
              <span className="text-text-muted text-xs">/</span>
              <span className="text-text-primary text-xs sm:text-sm font-medium">Settings</span>
            </div>
            <h1 className="heading-serif text-2xl sm:text-3xl">Account Settings</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-4 sm:gap-6 items-start profile-grid">

          {/* ── Left Sidebar ── */}
          <div className="space-y-3 sm:space-y-4 animate-fade-in animate-fade-in-delay-1 profile-sidebar">

            {/* Avatar Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-5 sm:p-6 shadow-sm text-center avatar-card">
              <div className="relative inline-block mb-3 sm:mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg shadow-primary/15">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success border-2 border-white flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">{user?.name}</h3>
              <p className="text-text-muted text-[11px] sm:text-xs mt-0.5 truncate">{user?.email}</p>
              <div className="text-text-muted text-[10px] sm:text-[11px] mt-2">Member since {memberSince}</div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-surface-border">
                <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">Overview</span>
              </div>
              <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-xs sm:text-sm">Sessions</span>
                  <span className="font-bold text-primary text-xs sm:text-sm">{user?.total_interviews || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-xs sm:text-sm">Avg Score</span>
                  <span className={`font-bold text-xs sm:text-sm ${
                    (user?.average_score || 0) >= 7 ? 'text-success' :
                    (user?.average_score || 0) >= 5 ? 'text-warning' : 'text-danger'
                  }`}>{user?.average_score || 0}/10</span>
                </div>
              </div>
            </div>

            {/* Nav Tabs (sidebar style) */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border shadow-sm p-1.5 sm:p-2 flex lg:flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 lg:flex-none w-full flex items-center justify-center lg:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border-none text-center lg:text-left ${
                    activeTab === tab.id
                      ? 'bg-info-light text-primary'
                      : 'bg-transparent text-text-secondary hover:bg-surface-light'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className="animate-fade-in animate-fade-in-delay-2">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border shadow-sm">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-border">
                  <h2 className="font-semibold text-sm sm:text-base text-text-primary">Profile Information</h2>
                  <p className="text-text-muted text-[11px] sm:text-xs mt-0.5">Update your personal details</p>
                </div>

                <form onSubmit={handleProfileSave} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  {profileMsg && (
                    <div className="flex items-center gap-2 bg-success-light border border-success/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-success text-xs sm:text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {profileMsg}
                    </div>
                  )}
                  {profileError && (
                    <div className="flex items-center gap-2 bg-danger-light border border-danger/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-danger text-xs sm:text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      {profileError}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-text-primary mb-1.5 block">Full Name</label>
                      <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-text-primary mb-1.5 block">Email Address</label>
                      <input type="email" className="input-field !bg-surface-lighter !text-text-muted cursor-not-allowed" value={user?.email || ''} disabled />
                      <p className="text-text-muted text-[10px] sm:text-[11px] mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-surface-border">
                    <button type="submit" className="btn-primary text-xs sm:text-sm !py-2 sm:!py-2.5 !px-5 sm:!px-6" disabled={saving}>
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border shadow-sm">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-border">
                  <h2 className="font-semibold text-sm sm:text-base text-text-primary">Change Password</h2>
                  <p className="text-text-muted text-[11px] sm:text-xs mt-0.5">Update your password to keep your account secure</p>
                </div>

                <form onSubmit={handlePasswordChange} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  {pwMsg && (
                    <div className="flex items-center gap-2 bg-success-light border border-success/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-success text-xs sm:text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {pwMsg}
                    </div>
                  )}
                  {pwError && (
                    <div className="flex items-center gap-2 bg-danger-light border border-danger/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-danger text-xs sm:text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      {pwError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-text-primary mb-1.5 block">Current Password</label>
                    <input type="password" className="input-field" placeholder="••••••••" value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-text-primary mb-1.5 block">New Password</label>
                      <input type="password" className="input-field" placeholder="Min. 6 characters" value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-text-primary mb-1.5 block">Confirm Password</label>
                      <input type="password" className="input-field" placeholder="••••••••" value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-surface-border">
                    <button type="submit" className="btn-primary text-xs sm:text-sm !py-2 sm:!py-2.5 !px-5 sm:!px-6" disabled={changingPw}>
                      {changingPw ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Changing...
                        </span>
                      ) : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
