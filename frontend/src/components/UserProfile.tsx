import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { changePasswordApi } from '../services/api';
import { User, Award, KeyRound, Lock, CheckCircle2, AlertCircle, Save, Loader2, X, Crown, Zap } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { userProfile, updateUserProfile, setActiveTab, setUpgradeModalOpen, resetPlanToFreeStarter } = useStore();

  const [fullName, setFullName] = useState(userProfile.fullName);
  const [targetRole, setTargetRole] = useState(userProfile.targetRole);
  const [experienceLevel, setExperienceLevel] = useState(userProfile.experienceLevel);
  const [saved, setSaved] = useState(false);

  const isPro = userProfile.planTier === 'PRO UNLIMITED' || userProfile.email === 'admin@aimock.in';
  const sessionsLeft = userProfile.sessionsLeft !== undefined ? userProfile.sessionsLeft : 10;
  const monthlyQuota = userProfile.monthlyQuota || 10;

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ fullName, targetRole, experienceLevel });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }

    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');

    try {
      const res = await changePasswordApi(userProfile.email || userProfile.username, currentPassword, newPassword);
      setPwdSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  const badges = [
    { title: 'STAR Method Master', desc: 'Completed 5+ behavioral questions with 90%+ STAR score', icon: '🌟' },
    { title: 'System Architect', desc: 'Designed 3 high-scale distributed systems', icon: '🏗️' },
    { title: 'Streak Titan', desc: 'Maintained active practice 4 days in a row', icon: '🔥' },
    { title: 'Code Ninja', desc: 'Passed all unit tests in Monaco editor sandbox', icon: '⚡' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in relative">
      {/* Profile Header Banner */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-violet-600/30">
            {userProfile.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{userProfile.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {userProfile.xpPoints} XP
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {userProfile.targetRole} • {userProfile.experienceLevel} • {userProfile.email}
            </p>
          </div>
        </div>

        {/* Exit ('X') Red Button */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/60 transition-all flex items-center justify-center hover:scale-110 shadow-md"
          title="Exit to Dashboard"
        >
          <X className="w-5 h-5 text-rose-500" />
        </button>
      </div>

      {/* Subscription & Plan Upgrade Card */}
      <div className={`p-6 rounded-3xl glass-panel border transition-all ${
        isPro ? 'border-amber-500/40 glow-box-violet' : 'border-violet-500/40'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className={`w-5 h-5 ${isPro ? 'text-amber-400 fill-amber-400' : 'text-violet-400'}`} />
              <h2 className="text-lg font-extrabold text-white">Current Subscription Tier</h2>
              {isPro ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                  UNLIMITED PRO ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                  FREE STARTER PLAN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isPro 
                ? 'You have unlimited 24/7 access to AI mock interviews, full architecture grading, and cheatsheets.'
                : `AI Practice Sessions Left: ${sessionsLeft} / ${monthlyQuota} Month. Upgrade to Pro for unlimited 24/7 practice.`
              }
            </p>
          </div>

          {!isPro ? (
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="px-6 py-3 rounded-2xl glow-gradient text-white font-extrabold text-xs shadow-lg shadow-violet-600/30 hover:scale-105 transition-transform flex items-center justify-center gap-2 shrink-0"
            >
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Upgrade to Pro ($19/mo)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled
                className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs flex items-center gap-2 cursor-default"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Pro Active</span>
              </button>

              <button
                onClick={resetPlanToFreeStarter}
                className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold text-xs transition-colors"
                title="Reset plan to Free Starter for testing"
              >
                Reset to Free Starter (10/10)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. Profile Details Edit Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-violet-400" />
          <span>Edit Profile & Target Role</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'Saved Successfully!' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* 2. Security & Change Password Portal Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-cyan-400" />
          <span>Security & Portal Password Change</span>
        </h2>

        {pwdError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            <span>Update Portal Password</span>
          </button>
        </form>
      </div>

      {/* 3. Achievements & Badges */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Achievements & Skill Badges</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((b, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <h4 className="font-bold text-white text-sm">{b.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
