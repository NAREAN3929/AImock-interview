import React from 'react';
import { NavTab } from '../types';
import { useStore } from '../store/useStore';
import { 
  BarChart3, 
  Mic, 
  Zap, 
  FileText, 
  BookOpen, 
  History, 
  Sparkles, 
  Building2,
  X,
  ShieldCheck,
  Award,
  MessageSquare,
  BrainCircuit,
  DollarSign,
  FileSpreadsheet,
  Crown,
  Users
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, userProfile, setUpgradeModalOpen } = useStore();

  const isMasterDeployer = Boolean(
    userProfile.email === 'admin@aimock.in' || 
    userProfile.username === 'admin'
  );

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Career Pulse', icon: <BarChart3 className="w-5 h-5 text-violet-400" /> },
    { id: 'setup', label: 'Start Interview', icon: <Mic className="w-5 h-5 text-emerald-400" /> },
    { id: 'p2p-room', label: 'Peer Mock Room', icon: <Users className="w-5 h-5 text-violet-400" /> },
    { id: 'company-oa', label: 'Company OA Simulators', icon: <Building2 className="w-5 h-5 text-pink-400" /> },
    { id: 'question-bank', label: 'Coding & Company Bank', icon: <BookOpen className="w-5 h-5 text-blue-400" /> },
    { id: 'aptitude', label: 'Aptitude Trainer', icon: <BrainCircuit className="w-5 h-5 text-amber-400" /> },
    { id: 'tpo-portal', label: 'Placement TPO Hub', icon: <Award className="w-5 h-5 text-emerald-400" /> },
    { id: 'communication', label: 'Communication Lab', icon: <MessageSquare className="w-5 h-5 text-cyan-400" /> },
    { id: 'salary-negotiation', label: 'Salary Negotiation AI', icon: <DollarSign className="w-5 h-5 text-emerald-400" /> },
    { id: 'company-cheatsheets', label: 'Company Cheat Sheets', icon: <FileSpreadsheet className="w-5 h-5 text-purple-400" /> },
    { id: 'rapid-practice', label: 'Rapid Flashcards', icon: <Zap className="w-5 h-5 text-amber-400" /> },
    { id: 'resume-analyzer', label: 'Resume AI', icon: <FileText className="w-5 h-5 text-cyan-400" /> },
    { id: 'history', label: 'Interview History', icon: <History className="w-5 h-5 text-purple-400" /> },
    { id: 'admin', label: 'Admin Portal', icon: <ShieldCheck className="w-5 h-5 text-rose-400" />, adminOnly: true }
  ];

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isMasterDeployer);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 glass-panel border-r border-slate-800 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Top Logo & Close Button */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => { setActiveTab('dashboard'); onClose(); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl glow-gradient flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-wider block">InterviewAI</span>
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">PRIME CAREER</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {visibleNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-600/20 text-white border border-violet-500/50 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Plan Tier Pill */}
        {(() => {
          const sessionsLeft = userProfile.sessionsLeft !== undefined ? userProfile.sessionsLeft : 10;
          const monthlyQuota = userProfile.monthlyQuota || 10;
          const isPro = isMasterDeployer || userProfile.planTier === 'PRO UNLIMITED';
          const isQuotaExhausted = !isPro && sessionsLeft <= 0;

          return (
            <div className={`p-4 rounded-2xl glass-card border space-y-2 shrink-0 transition-colors ${
              isQuotaExhausted ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">PLAN TIER</span>
                {isPro ? (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> UNLIMITED PRO
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                    isQuotaExhausted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {isQuotaExhausted ? 'QUOTA EXHAUSTED' : 'FREE STARTER'}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span>AI Sessions Left</span>
                  <span className={`font-mono font-bold ${
                    isPro 
                      ? 'text-amber-400' 
                      : isQuotaExhausted 
                      ? 'text-rose-400 font-extrabold' 
                      : 'text-violet-400'
                  }`}>
                    {isPro ? '∞ / Unlimited Pro' : `${sessionsLeft} / ${monthlyQuota} Month`}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPro
                        ? 'w-full bg-gradient-to-r from-amber-400 via-violet-500 to-emerald-400'
                        : isQuotaExhausted
                        ? 'w-full bg-rose-600'
                        : 'bg-gradient-to-r from-violet-500 to-cyan-400'
                    }`}
                    style={{ width: isPro ? '100%' : `${Math.max(0, (sessionsLeft / monthlyQuota) * 100)}%` }}
                  ></div>
                </div>

                {!isPro && (
                  <button
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Upgrade Plan ($19/mo)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </aside>
    </>
  );
};
